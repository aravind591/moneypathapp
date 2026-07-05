// Student onboarding-profile business logic. The 6-step wizard saves one step at
// a time; each save upserts the StudentProfile row and advances `completedStep`.
// Every field is optional so a student can save partial progress and resume.

import { prisma } from "../config/database";

// Bumps completedStep only forward — saving an earlier step again must not lower
// the recorded progress.
function maxStep(current: number, step: number): number {
  return Math.max(current, step);
}

// Returns the student's profile (or null if they haven't started the wizard).
export async function getProfile(studentId: string) {
  return prisma.studentProfile.findUnique({ where: { studentId } });
}

// Returns the logged-in student's account record (name/email/phone + wizard
// progress) for the dashboard header and sidebar. Never returns the passwordHash.
export async function getStudentAccount(studentId: string) {
  return prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      fullName: true,
      email: true,
      phone: true,
      phoneVerified: true,
      preferredCountry: true,
      createdAt: true,
      profile: { select: { completedStep: true } },
    },
  });
}

// Admin: paginated list of ALL registered students — including those who have not
// started a loan application yet. Powers the admin "Students" view so newly signed
// up students are visible. Returns safe summary fields + onboarding progress + a
// document count. Never returns passwordHash.
export async function getAllStudents(filters: {
  search?: string;
  page: number;
  limit: number;
}) {
  const { search, page, limit } = filters;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }

  const skip = (page - 1) * limit;

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        phoneVerified: true,
        preferredCountry: true,
        createdAt: true,
        profile: { select: { completedStep: true } },
        _count: { select: { documents: true, applications: true } },
      },
    }),
    prisma.student.count({ where }),
  ]);

  return {
    students: students.map((s) => ({
      id: s.id,
      fullName:
        s.fullName ?? ([s.firstName, s.lastName].filter(Boolean).join(" ") || null),
      email: s.email,
      phone: s.phone,
      phoneVerified: s.phoneVerified,
      preferredCountry: s.preferredCountry,
      onboardingStep: s.profile?.completedStep ?? 0,
      documentCount: s._count.documents,
      applicationCount: s._count.applications,
      createdAt: s.createdAt,
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// Admin: full detail for one student — account, onboarding profile, and the
// documents they own directly (uploaded during onboarding / from the Documents
// page). Document metadata only — NO storage paths (admins fetch signed view URLs
// separately, which are audited). Returns null if the student doesn't exist.
export async function getStudentDetailForAdmin(studentId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      fullName: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      phoneVerified: true,
      preferredCountry: true,
      createdAt: true,
      profile: true,
      documents: {
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
        orderBy: { uploadedAt: "asc" },
      },
      applications: {
        select: { id: true, currentStage: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return student;
}

// Generic per-step upsert. `step` is the step number being saved (1–6); `data`
// is the validated column subset for that step. Creates the row on first save.
async function saveStep(
  studentId: string,
  step: number,
  data: Record<string, unknown>
) {
  const existing = await prisma.studentProfile.findUnique({
    where: { studentId },
  });
  const completedStep = maxStep(existing?.completedStep ?? 0, step);

  return prisma.studentProfile.upsert({
    where: { studentId },
    update: { ...data, completedStep },
    create: { studentId, completedStep, ...data },
  });
}

// --- Step 1: Basic Information ---
export interface BasicInfoInput {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  nationality?: string;
  currentCity?: string;
  homeState?: string;
  educationLevel?:
    | "COMPLETED_UG"
    | "FINAL_YEAR_UG"
    | "COMPLETED_12TH"
    | "WORKING_PROFESSIONAL";
}

export async function saveBasicInfo(studentId: string, input: BasicInfoInput) {
  // Name fields live on Student; keep them in sync when provided.
  if (input.firstName || input.lastName) {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    const firstName = input.firstName ?? student?.firstName ?? undefined;
    const lastName = input.lastName ?? student?.lastName ?? undefined;
    await prisma.student.update({
      where: { id: studentId },
      data: {
        firstName,
        lastName,
        fullName: `${firstName ?? ""} ${lastName ?? ""}`.trim() || undefined,
      },
    });
  }

  return saveStep(studentId, 1, {
    dateOfBirth: input.dateOfBirth,
    nationality: input.nationality,
    currentCity: input.currentCity,
    homeState: input.homeState,
    educationLevel: input.educationLevel,
  });
}

// --- Step 2: Academic & Official Details ---
export interface AcademicInput {
  schoolRecords?: unknown;
  ugRecords?: unknown;
  testScores?: unknown;
}

export async function saveAcademic(studentId: string, input: AcademicInput) {
  return saveStep(studentId, 2, {
    schoolRecords: input.schoolRecords ?? undefined,
    ugRecords: input.ugRecords ?? undefined,
    testScores: input.testScores ?? undefined,
  });
}

// --- Step 3: Study Destination ---
export interface StudyDestinationInput {
  destinationCountry?: string;
  intendedCourse?: string;
  intendedUniversity?: string;
  intake?: string;
}

export async function saveStudyDestination(
  studentId: string,
  input: StudyDestinationInput
) {
  return saveStep(studentId, 3, { ...input });
}

// --- Step 4: Financial Profile ---
export interface FinancialInput {
  occupation?: string;
  employerName?: string;
  annualIncome?: number;
  netSalary?: number;
  yearsEmployed?: string;
  contactMobile?: string;
  officialEmail?: string;
  existingEmiMonthly?: number;
  sponsorshipType?: "NONE" | "PARTIAL" | "FULL";
  sponsorshipAmount?: string;
}

export async function saveFinancial(studentId: string, input: FinancialInput) {
  return saveStep(studentId, 4, { ...input });
}

// --- Step 5: Co-applicant + collateral ---
// Co-applicant proper belongs to an Application (existing model). At wizard time
// the student may not have an Application yet, so we store the collateral/property
// answers on the profile here; co-applicant capture is wired through the existing
// application flow.
export interface CollateralInput {
  ownsProperty?: boolean;
  propertyAssetType?: string;
  propertyType?: string;
  propertyLocation?: string;
  propertyMarketValue?: number;
  propertyRegistration?: string;
}

export async function saveCollateral(studentId: string, input: CollateralInput) {
  return saveStep(studentId, 5, { ...input });
}

// --- Step 6: Documents ---
// Documents are uploaded via the existing document service (Supabase storage).
// Completing step 6 just records that the student finished the wizard.
export async function completeDocumentsStep(studentId: string) {
  return saveStep(studentId, 6, {});
}
