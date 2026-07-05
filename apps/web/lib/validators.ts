// Zod schemas for the frontend forms. Mirrors the API's validators so the user gets
// instant client-side feedback; the server re-validates as the source of truth.

import { z } from "zod";

const phone = z
  .string()
  .trim()
  .regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number.");

// Step 1 — personal details.
export const personalDetailsSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  dateOfBirth: z.string().min(1, "Date of birth is required."),
  email: z.string().trim().email("Enter a valid email."),
  address: z.string().trim().min(5, "Address is required."),
});

// Step 2 — loan details.
export const loanDetailsSchema = z.object({
  loanAmount: z.coerce
    .number()
    .min(50000, "Minimum loan amount is ₹50,000.")
    .max(15000000, "Maximum loan amount is ₹1,50,00,000."),
  courseName: z.string().trim().min(2, "Course name is required."),
  institutionName: z.string().trim().min(2, "Institution name is required."),
  courseDuration: z.string().trim().min(1, "Course duration is required."),
  courseStartDate: z.string().min(1, "Start date is required."),
});

// Step 3 — co-applicant details.
export const coApplicantSchema = z.object({
  coFullName: z.string().trim().min(2, "Co-applicant name is required."),
  relationship: z.string().min(1, "Select a relationship."),
  coPhone: phone,
  occupation: z.string().trim().min(2, "Occupation is required."),
  monthlyIncome: z.coerce
    .number()
    .positive("Monthly income must be greater than 0."),
});

// The full form is all three steps combined.
export const fullApplicationSchema = personalDetailsSchema
  .merge(loanDetailsSchema)
  .merge(coApplicantSchema);

export type PersonalDetails = z.infer<typeof personalDetailsSchema>;
export type LoanDetails = z.infer<typeof loanDetailsSchema>;
export type CoApplicantDetails = z.infer<typeof coApplicantSchema>;
export type FullApplication = z.infer<typeof fullApplicationSchema>;

// Relationship options for the co-applicant dropdown.
export const RELATIONSHIP_OPTIONS = [
  "Father",
  "Mother",
  "Spouse",
  "Sibling",
  "Guardian",
] as const;
