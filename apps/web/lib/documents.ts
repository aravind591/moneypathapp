// The checklist of documents a student must upload, grouped into the sections shown
// on the documents page. Drives both the checklist UI and the upload type selection.

import type { DocumentType } from "@moneypath/shared";

export interface DocumentRequirement {
  type: DocumentType;
  label: string;
}

export interface DocumentSection {
  title: string;
  items: DocumentRequirement[];
}

// Student-provided and co-applicant-provided documents. Bank documents (SANCTION_LETTER,
// DISBURSEMENT_PROOF) are uploaded by admins later, so they are not in the student checklist.
export const DOCUMENT_SECTIONS: DocumentSection[] = [
  {
    title: "Student Documents",
    items: [
      { type: "AADHAAR_CARD", label: "Aadhaar Card" },
      { type: "PAN_CARD", label: "PAN Card" },
      { type: "PHOTO", label: "Passport-size Photo" },
      { type: "TENTH_MARKSHEET", label: "10th Marksheet" },
      { type: "TWELFTH_MARKSHEET", label: "12th Marksheet" },
      { type: "GRADUATION_MARKSHEET", label: "Graduation Marksheet" },
      { type: "ENTRANCE_SCORE", label: "Entrance Score (GRE/CAT/GMAT)" },
      { type: "ADMISSION_LETTER", label: "Admission Letter" },
      { type: "FEE_STRUCTURE", label: "Fee Structure" },
      { type: "BONAFIDE_CERTIFICATE", label: "Bonafide Certificate" },
    ],
  },
  {
    title: "Co-applicant Documents",
    items: [
      { type: "CO_AADHAAR_CARD", label: "Co-applicant Aadhaar Card" },
      { type: "CO_PAN_CARD", label: "Co-applicant PAN Card" },
      { type: "CO_INCOME_PROOF", label: "Income Proof (Salary slips / ITR)" },
      { type: "CO_BANK_STATEMENT", label: "Bank Statement" },
      { type: "CO_FORM_16", label: "Form 16" },
      { type: "RELATIONSHIP_PROOF", label: "Relationship Proof" },
    ],
  },
];

// Total number of documents a student is expected to upload (for the summary count).
export const TOTAL_REQUIRED_DOCUMENTS = DOCUMENT_SECTIONS.reduce(
  (sum, section) => sum + section.items.length,
  0
);

// Onboarding/Documents-page grouping, matching the sign-up mockups
// (Identity / Academic / Financial), each item with a short hint line.
export interface DocChecklistItem {
  type: DocumentType;
  label: string;
  hint: string;
}

export interface DocChecklistGroup {
  title: string;
  items: DocChecklistItem[];
}

export const DOC_CHECKLIST: DocChecklistGroup[] = [
  {
    title: "Identity Documents",
    items: [
      { type: "AADHAAR_CARD", label: "Aadhar Card", hint: "Identity proof" },
      { type: "PAN_CARD", label: "Pan Card", hint: "Identity proof" },
      { type: "PHOTO", label: "Passport / Photo", hint: "For international applications" },
    ],
  },
  {
    title: "Academic Documents",
    items: [
      { type: "TENTH_MARKSHEET", label: "10TH Marksheet", hint: "Academic Proof" },
      { type: "TWELFTH_MARKSHEET", label: "12TH Marksheet", hint: "Academic Proof" },
      { type: "GRADUATION_MARKSHEET", label: "Degree Certificate", hint: "Academic Proof" },
      { type: "ENTRANCE_SCORE", label: "Test Scores", hint: "IELTS / GRE / GMAT etc." },
      { type: "ADMISSION_LETTER", label: "Offer Letter", hint: "Admission proof" },
    ],
  },
  {
    title: "Financial Documents",
    items: [
      { type: "CO_BANK_STATEMENT", label: "Bank Statements", hint: "Income proof" },
      { type: "CO_FORM_16", label: "Form 16 / ITR", hint: "Income proof" },
      { type: "CO_INCOME_PROOF", label: "Salary Slips (3 months)", hint: "Income proof" },
    ],
  },
];

export const TOTAL_CHECKLIST_DOCS = DOC_CHECKLIST.reduce(
  (sum, g) => sum + g.items.length,
  0
);

// Client-side upload constraints — must match the API's allowlist and size cap.
export const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
