// Business logic for loan applications. All ownership checks live here so no route
// handler can accidentally skip them. Route handlers stay thin and call into this file.

import type { LoanStage, ApplicationStatus } from "@moneypath/shared";
import { prisma } from "../config/database";
import { isValidTransition, statusForStage } from "./stage.service";

// Shape of the data needed to create an application (validated by Zod before arrival).
export interface CreateApplicationInput {
  loanAmount: number;
  courseName: string;
  institutionName: string;
  courseDuration: string;
  courseStartDate: Date;
  coApplicant: {
    fullName: string;
    relationship: string;
    phone: string;
    email?: string;
    occupation: string;
    monthlyIncome: number;
  };
  // Optional student profile fields captured during the form's first step.
  fullName?: string;
  email?: string;
}

// Fields a student is allowed to update on their own application.
export type UpdateApplicationInput = Partial<
  Omit<CreateApplicationInput, "coApplicant">
> & {
  coApplicant?: Partial<CreateApplicationInput["coApplicant"]>;
};

// Creates a new Application plus its co-applicant and the initial SUBMITTED stage
// history entry, all in one transaction. Also backfills the student's name/email.
export async function createApplication(
  studentId: string,
  data: CreateApplicationInput
) {
  // A student may only have one application — block duplicates up front for a
  // friendly error. The DB unique constraint on Application.studentId is the real
  // guard: it makes a concurrent second insert fail (caught as P2002 below), so
  // two simultaneous requests can't both slip past this check.
  const existing = await prisma.application.findUnique({ where: { studentId } });
  if (existing) {
    throw new ApplicationError(
      "You already have an application in progress.",
      "APPLICATION_EXISTS"
    );
  }

  // Run everything together so we never end up with an application missing its
  // co-applicant or its first stage-history row.
  try {
    return await prisma.$transaction(async (tx) => {
      // Keep the student profile in sync with what they entered in step 1.
      if (data.fullName || data.email) {
        await tx.student.update({
          where: { id: studentId },
          data: { fullName: data.fullName, email: data.email },
        });
      }

      const application = await tx.application.create({
        data: {
          studentId,
          loanAmount: data.loanAmount,
          courseName: data.courseName,
          institutionName: data.institutionName,
          courseDuration: data.courseDuration,
          courseStartDate: data.courseStartDate,
          coApplicant: { create: data.coApplicant },
          stageHistory: {
            create: {
              stage: "SUBMITTED",
              note: "Application submitted by student",
            },
          },
        },
        include: { coApplicant: true, stageHistory: true, documents: true },
      });

      return application;
    });
  } catch (error) {
    // P2002 = unique constraint violation: a concurrent request created the
    // application first. Return the same friendly error as the up-front check.
    if (
      error &&
      typeof error === "object" &&
      (error as { code?: string }).code === "P2002"
    ) {
      throw new ApplicationError(
        "You already have an application in progress.",
        "APPLICATION_EXISTS"
      );
    }
    throw error;
  }
}

// Returns the student's single application with documents and stage history included,
// or null if they haven't applied yet.
export async function getApplicationByStudent(studentId: string) {
  // studentId is unique on Application, so this returns the student's single app.
  return prisma.application.findUnique({
    where: { studentId },
    include: {
      coApplicant: true,
      documents: true,
      stageHistory: { orderBy: { changedAt: "asc" } },
    },
  });
}

// Updates application details after verifying the application belongs to the student.
// A student can never edit another student's application.
export async function updateApplication(
  applicationId: string,
  studentId: string,
  data: UpdateApplicationInput
) {
  // Ownership check first — fetch and confirm the studentId matches.
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });
  if (!application) {
    throw new ApplicationError("Application not found.", "NOT_FOUND");
  }
  if (application.studentId !== studentId) {
    throw new ApplicationError(
      "You cannot edit this application.",
      "FORBIDDEN"
    );
  }

  const { coApplicant, ...applicationFields } = data;

  return prisma.application.update({
    where: { id: applicationId },
    data: {
      ...applicationFields,
      // Update co-applicant fields only if any were provided.
      ...(coApplicant
        ? { coApplicant: { update: coApplicant } }
        : {}),
    },
    include: { coApplicant: true, stageHistory: true, documents: true },
  });
}

// ---------------------------------------------------------------------------
// Admin-only methods. These bypass the per-student ownership checks because the
// caller has already been verified as an admin by the authorizeAdmin middleware.
// ---------------------------------------------------------------------------

// Filters accepted by the admin application queue.
export interface AdminApplicationFilters {
  status?: ApplicationStatus;
  currentStage?: LoanStage;
  search?: string; // matches student name or phone
  page: number;
  limit: number;
}

// Returns a paginated, filtered list of all applications for the admin queue.
// Deliberately returns NO file paths or storage URLs — only safe summary fields.
export async function getAllApplications(filters: AdminApplicationFilters) {
  const { status, currentStage, search, page, limit } = filters;

  // Build the where clause from whichever filters were provided.
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (currentStage) where.currentStage = currentStage;
  if (search) {
    where.student = {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ],
    };
  }

  const skip = (page - 1) * limit;

  // Run the page query and total count together for pagination metadata.
  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        loanAmount: true,
        institutionName: true,
        currentStage: true,
        status: true,
        createdAt: true,
        student: { select: { fullName: true, phone: true } },
        // Count documents without exposing any paths.
        _count: { select: { documents: true } },
      },
    }),
    prisma.application.count({ where }),
  ]);

  return {
    applications: applications.map((app) => ({
      id: app.id,
      studentName: app.student.fullName,
      studentPhone: app.student.phone,
      loanAmount: app.loanAmount,
      institutionName: app.institutionName,
      currentStage: app.currentStage,
      status: app.status,
      documentCount: app._count.documents,
      appliedAt: app.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// Returns full application detail for the admin view: student, co-applicant, all
// document metadata (no URLs — those are fetched separately and audited), and history.
export async function getApplicationDetail(applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      // Never `student: true` here — that would leak passwordHash to the admin
      // client. Select only the fields the admin detail view needs.
      student: {
        select: {
          id: true,
          fullName: true,
          firstName: true,
          lastName: true,
          phone: true,
          email: true,
          preferredCountry: true,
          phoneVerified: true,
          createdAt: true,
        },
      },
      coApplicant: true,
      stageHistory: { orderBy: { changedAt: "asc" } },
      documents: {
        // Explicitly exclude storagePath from the detail payload.
        select: {
          id: true,
          type: true,
          fileName: true,
          fileSizeBytes: true,
          mimeType: true,
          uploadedAt: true,
          isVerified: true,
          verificationNote: true,
        },
      },
      // Finance relations so the admin editors can show existing records.
      disbursements: { orderBy: { ordinal: "asc" } },
      remittances: true,
      feePayments: { orderBy: { createdAt: "asc" } },
      creditCheck: { include: { items: true, insights: true } },
    },
  });
  if (!application) {
    throw new ApplicationError("Application not found.", "NOT_FOUND");
  }
  return application;
}

// Sanction terms an admin can record on an application (Loan Sanction screen).
export interface UpdateSanctionInput {
  lenderName?: string;
  sanctionedAmount?: number;
  interestRate?: number;
  processingFeeAmount?: number;
  loanTenureMonths?: number;
  moratoriumNote?: string;
  estimatedEmi?: number;
  offerValidUntil?: Date;
  sanctionedAt?: Date;
}

// Records the bank's sanction terms on an application and writes an audit log entry.
// Admin-only — the route is guarded by authorizeAdminWrite.
export async function updateSanctionDetails(
  applicationId: string,
  adminId: string,
  data: UpdateSanctionInput
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });
  if (!application) {
    throw new ApplicationError("Application not found.", "NOT_FOUND");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.application.update({
      where: { id: applicationId },
      data,
      include: { coApplicant: true, stageHistory: true, documents: true },
    });

    await tx.auditLog.create({
      data: {
        adminId,
        action: "UPDATED_SANCTION",
        targetId: applicationId,
        targetType: "Application",
        // Serialise to a JSON-safe value (Date fields → ISO strings) for the Json column.
        metadata: JSON.parse(JSON.stringify(data)),
      },
    });

    return updated;
  });
}

// Moves an application to a new stage (or rejects it). Validates the transition,
// updates stage + status, records StageHistory, and writes an AuditLog entry — all
// atomically. Returns the updated application plus the notification details the
// caller needs to enqueue a student notification (wired up in Phase 5).
export async function updateApplicationStage(
  applicationId: string,
  adminId: string,
  newStage: LoanStage | "REJECTED",
  note?: string,
  rejectionReason?: string
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    // Only the fields needed to build the stage-change notification payload.
    include: {
      student: { select: { phone: true, email: true, fullName: true } },
    },
  });
  if (!application) {
    throw new ApplicationError("Application not found.", "NOT_FOUND");
  }

  // Enforce the pipeline rules: forward-one-step, or reject from any active stage.
  if (!isValidTransition(application.currentStage, newStage)) {
    throw new ApplicationError(
      `Cannot move from ${application.currentStage} to ${newStage}.`,
      "INVALID_TRANSITION"
    );
  }

  // A rejection requires a reason so the student sees why.
  if (newStage === "REJECTED" && !rejectionReason) {
    throw new ApplicationError(
      "A rejection reason is required.",
      "REASON_REQUIRED"
    );
  }

  // The stage stored on the application stays the last real stage on rejection;
  // status flips to REJECTED. Otherwise advance both stage and status.
  const nextStage: LoanStage =
    newStage === "REJECTED" ? application.currentStage : newStage;
  const nextStatus = statusForStage(newStage);

  const updated = await prisma.$transaction(async (tx) => {
    const app = await tx.application.update({
      where: { id: applicationId },
      data: {
        currentStage: nextStage,
        status: nextStatus,
        rejectionReason: newStage === "REJECTED" ? rejectionReason : null,
      },
    });

    // Record the change on the timeline.
    await tx.stageHistory.create({
      data: {
        applicationId,
        stage: nextStage,
        note: note ?? (newStage === "REJECTED" ? rejectionReason : undefined),
      },
    });

    // Audit: who changed what.
    await tx.auditLog.create({
      data: {
        adminId,
        action: "UPDATED_STAGE",
        targetId: applicationId,
        targetType: "Application",
        metadata: { newStage, note, rejectionReason },
      },
    });

    return app;
  });

  // Details the caller uses to notify the student (Phase 5 enqueues this).
  return {
    application: updated,
    notification: {
      studentPhone: application.student.phone,
      studentEmail: application.student.email,
      studentName: application.student.fullName,
      newStage: newStage === "REJECTED" ? "REJECTED" : nextStage,
    },
  };
}

// Filters for the internal leads endpoint.
export interface LeadFilters {
  stage?: LoanStage;
  fromDate?: Date;
  toDate?: Date;
  page: number;
  limit: number;
}

// Returns paginated lead data for internal tools/CRMs. Exposes ONLY safe lead fields —
// never document paths or storage URLs. Filterable by stage and applied-date range.
export async function getLeads(filters: LeadFilters) {
  const { stage, fromDate, toDate, page, limit } = filters;

  const where: Record<string, unknown> = {};
  if (stage) where.currentStage = stage;
  // Filter on createdAt (the applied date) for the date range.
  if (fromDate || toDate) {
    where.createdAt = {
      ...(fromDate ? { gte: fromDate } : {}),
      ...(toDate ? { lte: toDate } : {}),
    };
  }

  const skip = (page - 1) * limit;

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        studentId: true,
        loanAmount: true,
        institutionName: true,
        courseName: true,
        currentStage: true,
        createdAt: true,
        student: { select: { fullName: true, phone: true, email: true } },
      },
    }),
    prisma.application.count({ where }),
  ]);

  return {
    leads: applications.map((app) => ({
      studentId: app.studentId,
      fullName: app.student.fullName,
      phone: app.student.phone,
      email: app.student.email,
      loanAmount: app.loanAmount,
      institutionName: app.institutionName,
      courseName: app.courseName,
      currentStage: app.currentStage,
      appliedAt: app.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// A typed error so controllers can map a known failure to the right HTTP status.
export class ApplicationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "ApplicationError";
  }
}
