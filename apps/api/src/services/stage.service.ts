// Loan progress stage transition rules. Centralised so the "what moves are legal"
// logic lives in one place and can be unit-reasoned about independently.

import type { LoanStage, ApplicationStatus } from "@moneypath/shared";

// The pipeline in order. Index position defines "forward" vs "backward".
export const STAGE_ORDER: LoanStage[] = [
  "SUBMITTED",
  "DOCUMENT_REVIEW",
  "SENT_TO_BANK",
  "SANCTIONED",
  "DISBURSED",
];

// Returns true if moving from `current` to `next` is allowed.
// Rule: you may advance exactly one stage forward, OR jump to REJECTED from any
// non-terminal stage. You may never skip stages or move backward.
export function isValidTransition(
  current: LoanStage,
  next: LoanStage | "REJECTED"
): boolean {
  // Rejection is allowed from any active stage (handled as a status, see below).
  if (next === "REJECTED") return true;

  const currentIndex = STAGE_ORDER.indexOf(current);
  const nextIndex = STAGE_ORDER.indexOf(next);

  // Only a single step forward is permitted.
  return nextIndex === currentIndex + 1;
}

// Maps a stage (or rejection) to the ApplicationStatus that should accompany it.
export function statusForStage(
  next: LoanStage | "REJECTED"
): ApplicationStatus {
  switch (next) {
    case "REJECTED":
      return "REJECTED";
    case "SUBMITTED":
      return "SUBMITTED";
    case "DOCUMENT_REVIEW":
      return "UNDER_REVIEW";
    case "SENT_TO_BANK":
      return "SENT_TO_BANK";
    case "SANCTIONED":
      return "SANCTIONED";
    case "DISBURSED":
      return "DISBURSED";
  }
}
