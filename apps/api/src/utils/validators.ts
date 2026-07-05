// Zod schemas for validating incoming request data before it reaches a service.
// Centralised here so every route validates against the same definitions.

import { z } from "zod";

// Indian mobile number: 10 digits, optionally with +91. Stored normalised elsewhere.
const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number.");

// POST /auth/send-otp body.
export const sendOtpSchema = z.object({
  phone: phoneSchema,
});

// POST /auth/verify-otp body.
export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().trim().regex(/^\d{6}$/, "OTP must be 6 digits."),
});

// POST /auth/admin/login body.
export const adminLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

// POST /auth/register body (student email+password sign-up).
export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required."),
  lastName: z.string().trim().min(1, "Last name is required."),
  email: z.string().trim().email("Enter a valid email."),
  phone: phoneSchema,
  password: z.string().min(8, "Password must be at least 8 characters."),
  preferredCountry: z.string().trim().min(1).optional(),
});

// POST /auth/login body (student email+password login). Login only needs a
// non-empty password — bcrypt decides if it's correct. (The 8-char minimum is a
// REGISTRATION policy; enforcing it on login would block valid older/seeded
// accounts whose password is shorter, e.g. the demo account.)
export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email."),
  password: z.string().min(1, "Enter your password."),
});

// ---------------------------------------------------------------------------
// Onboarding wizard — one schema per step. Every field is optional so the wizard
// can save partial progress; the frontend enforces required fields per screen.
// ---------------------------------------------------------------------------

const optionalString = z.string().trim().min(1).optional();

// Step 1 — Basic Information.
export const basicInfoSchema = z.object({
  firstName: optionalString,
  lastName: optionalString,
  dateOfBirth: z.coerce.date().optional(),
  nationality: optionalString,
  currentCity: optionalString,
  homeState: optionalString,
  educationLevel: z
    .enum(["COMPLETED_UG", "FINAL_YEAR_UG", "COMPLETED_12TH", "WORKING_PROFESSIONAL"])
    .optional(),
});

// A grade block (school or undergraduate). Free-form strings to match the UI.
const gradeBlockSchema = z
  .object({
    tenthPercentage: z.string().trim().optional(),
    tenthBoard: z.string().trim().optional(),
    twelfthPercentage: z.string().trim().optional(),
    twelfthStream: z.string().trim().optional(),
  })
  .optional();

// Step 2 — Academic & Official Details.
export const academicSchema = z.object({
  schoolRecords: gradeBlockSchema,
  ugRecords: gradeBlockSchema,
  testScores: z
    .object({
      ielts: z.string().trim().optional(),
      toefl: z.string().trim().optional(),
      gre: z.string().trim().optional(),
      gmat: z.string().trim().optional(),
      sat: z.string().trim().optional(),
      duolingo: z.string().trim().optional(),
    })
    .optional(),
});

// Step 3 — Study Destination.
export const studyDestinationSchema = z.object({
  destinationCountry: optionalString,
  intendedCourse: optionalString,
  intendedUniversity: optionalString,
  intake: optionalString,
});

// Step 4 — Financial Profile.
export const financialSchema = z.object({
  occupation: optionalString,
  employerName: optionalString,
  annualIncome: z.coerce.number().nonnegative().optional(),
  netSalary: z.coerce.number().nonnegative().optional(),
  yearsEmployed: optionalString,
  contactMobile: phoneSchema.optional(),
  officialEmail: z.string().trim().email("Enter a valid email.").optional(),
  existingEmiMonthly: z.coerce.number().nonnegative().optional(),
  sponsorshipType: z.enum(["NONE", "PARTIAL", "FULL"]).optional(),
  sponsorshipAmount: optionalString,
});

// Step 5 — Collateral / property.
export const collateralSchema = z.object({
  ownsProperty: z.boolean().optional(),
  propertyAssetType: optionalString,
  propertyType: optionalString,
  propertyLocation: optionalString,
  propertyMarketValue: z.coerce.number().nonnegative().optional(),
  propertyRegistration: optionalString,
});

// Co-applicant block, shared by create and update.
const coApplicantSchema = z.object({
  fullName: z.string().trim().min(2, "Co-applicant name is required."),
  relationship: z.string().trim().min(2, "Relationship is required."),
  phone: phoneSchema,
  email: z.string().trim().email("Enter a valid email.").optional(),
  occupation: z.string().trim().min(2, "Occupation is required."),
  monthlyIncome: z.number().positive("Monthly income must be greater than 0."),
});

// POST /applications body. Loan amount bounds match the frontend (50k–1.5Cr).
export const createApplicationSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required.").optional(),
  email: z.string().trim().email("Enter a valid email.").optional(),
  loanAmount: z
    .number()
    .min(50000, "Loan amount must be at least ₹50,000.")
    .max(15000000, "Loan amount cannot exceed ₹1,50,00,000."),
  courseName: z.string().trim().min(2, "Course name is required."),
  institutionName: z.string().trim().min(2, "Institution name is required."),
  courseDuration: z.string().trim().min(1, "Course duration is required."),
  // Accept an ISO date string from the client and coerce to a Date.
  courseStartDate: z.coerce.date(),
  coApplicant: coApplicantSchema,
});

// All document types the platform accepts — kept in sync with the Prisma enum.
const documentTypeEnum = z.enum([
  "AADHAAR_CARD",
  "PAN_CARD",
  "PHOTO",
  "TENTH_MARKSHEET",
  "TWELFTH_MARKSHEET",
  "GRADUATION_MARKSHEET",
  "ENTRANCE_SCORE",
  "ADMISSION_LETTER",
  "FEE_STRUCTURE",
  "BONAFIDE_CERTIFICATE",
  "CO_AADHAAR_CARD",
  "CO_PAN_CARD",
  "CO_INCOME_PROOF",
  "CO_BANK_STATEMENT",
  "CO_FORM_16",
  "RELATIONSHIP_PROOF",
  "SANCTION_LETTER",
  "DISBURSEMENT_PROOF",
]);

// Allowed upload mime types — mirror the service's allowlist.
const mimeTypeEnum = z.enum(["application/pdf", "image/jpeg", "image/png"], {
  errorMap: () => ({ message: "Only PDF, JPG, and PNG files are allowed." }),
});

// POST /documents/upload-url body.
export const uploadUrlSchema = z.object({
  applicationId: z.string().uuid("Invalid application id."),
  documentType: documentTypeEnum,
  fileName: z.string().trim().min(1, "File name is required."),
  mimeType: mimeTypeEnum,
});

// POST /documents/confirm body.
// storagePath is accepted for backward-compat but IGNORED — the server re-derives
// it (see document.service.confirmUpload) so a client can't forge a cross-tenant path.
export const confirmUploadSchema = z.object({
  applicationId: z.string().uuid("Invalid application id."),
  storagePath: z.string().trim().min(1).optional(),
  documentType: documentTypeEnum,
  fileName: z.string().trim().min(1, "File name is required."),
  // 5 MB cap, matching the frontend check.
  fileSizeBytes: z
    .number()
    .int()
    .positive()
    .max(5 * 1024 * 1024, "File must be under 5 MB."),
  mimeType: mimeTypeEnum,
});

// POST /documents/student/upload-url body (no applicationId — student-owned).
export const studentUploadUrlSchema = z.object({
  documentType: documentTypeEnum,
  fileName: z.string().trim().min(1, "File name is required."),
  mimeType: mimeTypeEnum,
});

// POST /documents/student/confirm body (no applicationId — student-owned).
// storagePath accepted for backward-compat but IGNORED — server re-derives it.
export const studentConfirmUploadSchema = z.object({
  storagePath: z.string().trim().min(1).optional(),
  documentType: documentTypeEnum,
  fileName: z.string().trim().min(1, "File name is required."),
  fileSizeBytes: z
    .number()
    .int()
    .positive()
    .max(5 * 1024 * 1024, "File must be under 5 MB."),
  mimeType: mimeTypeEnum,
});

// All loan stages, for admin stage updates.
const loanStageEnum = z.enum([
  "SUBMITTED",
  "DOCUMENT_REVIEW",
  "SENT_TO_BANK",
  "SANCTIONED",
  "DISBURSED",
]);

// All application statuses, for admin queue filtering.
const applicationStatusEnum = z.enum([
  "SUBMITTED",
  "UNDER_REVIEW",
  "SENT_TO_BANK",
  "SANCTIONED",
  "DISBURSED",
  "REJECTED",
  "HOLD",
]);

// GET /admin/applications query params — all optional filters + pagination.
export const adminListQuerySchema = z.object({
  status: applicationStatusEnum.optional(),
  currentStage: loanStageEnum.optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// GET /admin/students query — list all registered students.
export const adminStudentsQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// PATCH /admin/applications/:id/stage body. newStage may be a stage or REJECTED.
export const updateStageSchema = z
  .object({
    newStage: z.union([loanStageEnum, z.literal("REJECTED")]),
    note: z.string().trim().max(500).optional(),
    rejectionReason: z.string().trim().max(500).optional(),
  })
  .refine(
    (data) => data.newStage !== "REJECTED" || !!data.rejectionReason,
    { message: "A rejection reason is required.", path: ["rejectionReason"] }
  );

// PATCH /admin/documents/:id/verify body.
export const verifyDocumentSchema = z.object({
  isVerified: z.boolean(),
  verificationNote: z.string().trim().max(500).optional(),
});

// PATCH /admin/applications/:id/sanction body — case manager records the bank's
// sanction terms. All optional but at least one field required.
export const updateSanctionSchema = z
  .object({
    lenderName: z.string().trim().min(2).max(100).optional(),
    sanctionedAmount: z.number().positive().optional(),
    interestRate: z.number().positive().max(100).optional(),
    processingFeeAmount: z.number().nonnegative().optional(),
    loanTenureMonths: z.number().int().positive().max(600).optional(),
    moratoriumNote: z.string().trim().max(200).optional(),
    estimatedEmi: z.number().positive().optional(),
    offerValidUntil: z.coerce.date().optional(),
    sanctionedAt: z.coerce.date().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No sanction fields provided to update.",
  });

// GET /admin/leads query params — optional filters + pagination (limit capped at 100).
export const leadsQuerySchema = z.object({
  stage: loanStageEnum.optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// POST /admin/applications/:id/disbursements body.
export const createDisbursementSchema = z.object({
  ordinal: z.number().int().positive(),
  label: z.string().trim().min(2).max(100),
  detail: z.string().trim().max(100).optional(),
  amountRupees: z.number().positive(),
  scheduledDate: z.coerce.date().optional(),
  releasedDate: z.coerce.date().optional(),
  status: z.enum(["SCHEDULED", "RELEASED"]).optional(),
});

// POST /admin/applications/:id/fee-payments body.
export const createFeePaymentSchema = z.object({
  amountRupees: z.number().positive(),
  method: z.string().trim().max(50).optional(),
  transactionRef: z.string().trim().max(100).optional(),
  status: z.enum(["PENDING", "PAID"]).optional(),
  paidAt: z.coerce.date().optional(),
});

// PUT /admin/applications/:id/credit-check body — full assessment, replaces items.
export const upsertCreditCheckSchema = z.object({
  overallProgressPct: z.number().int().min(0).max(100),
  status: z.string().trim().min(1).max(40),
  items: z
    .array(
      z.object({
        party: z.enum(["STUDENT", "CO_APPLICANT"]),
        title: z.string().trim().min(1).max(100),
        detail: z.string().trim().max(120).optional(),
        state: z.enum(["DONE", "IN_PROGRESS", "UPCOMING"]),
        badge: z.string().trim().max(40).optional(),
      })
    )
    .max(20),
  insights: z
    .array(
      z.object({
        kind: z.enum(["POSITIVE", "ATTENTION", "INFO"]),
        text: z.string().trim().min(1).max(300),
      })
    )
    .max(20),
});

// PATCH /applications/:id body — every field optional, but at least one required.
export const updateApplicationSchema = z
  .object({
    fullName: z.string().trim().min(2).optional(),
    email: z.string().trim().email().optional(),
    loanAmount: z.number().min(50000).max(15000000).optional(),
    courseName: z.string().trim().min(2).optional(),
    institutionName: z.string().trim().min(2).optional(),
    courseDuration: z.string().trim().min(1).optional(),
    courseStartDate: z.coerce.date().optional(),
    coApplicant: coApplicantSchema.partial().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No fields provided to update.",
  });
