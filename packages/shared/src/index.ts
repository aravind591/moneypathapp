// Shared TypeScript types used by both the web and api apps.
// Keep this in sync with prisma/schema.prisma — these are the wire-format shapes
// that travel between frontend and backend.

// The five stages a loan application moves through, in order.
export type LoanStage =
  | "SUBMITTED"
  | "DOCUMENT_REVIEW"
  | "SENT_TO_BANK"
  | "SANCTIONED"
  | "DISBURSED";

// Overall application status (mirrors LoanStage plus terminal states).
export type ApplicationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "SENT_TO_BANK"
  | "SANCTIONED"
  | "DISBURSED"
  | "REJECTED"
  | "HOLD";

// Admin permission levels.
export type AdminRole = "SUPER_ADMIN" | "CASE_MANAGER" | "VIEWER";

// Every document type the platform accepts, grouped by who provides it.
export type DocumentType =
  // Student documents
  | "AADHAAR_CARD"
  | "PAN_CARD"
  | "PHOTO"
  | "TENTH_MARKSHEET"
  | "TWELFTH_MARKSHEET"
  | "GRADUATION_MARKSHEET"
  | "ENTRANCE_SCORE"
  | "ADMISSION_LETTER"
  | "FEE_STRUCTURE"
  | "BONAFIDE_CERTIFICATE"
  // Co-applicant documents
  | "CO_AADHAAR_CARD"
  | "CO_PAN_CARD"
  | "CO_INCOME_PROOF"
  | "CO_BANK_STATEMENT"
  | "CO_FORM_16"
  | "RELATIONSHIP_PROOF"
  // Bank documents (uploaded by admin)
  | "SANCTION_LETTER"
  | "DISBURSEMENT_PROOF";

// The shape of the JWT payload attached to req.user after authentication.
export interface AuthTokenPayload {
  // For students this is the studentId; for admins this is the adminId.
  sub: string;
  role: "student" | "admin";
  // Only present on admin tokens.
  adminRole?: AdminRole;
}

// Standardised API response envelope returned by every endpoint.
export interface ApiResponse<TData = unknown> {
  success: boolean;
  message?: string;
  code?: string;
  data?: TData;
}
