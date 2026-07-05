// Shared display metadata for loan stages — used by the admin stage updater and the
// student progress tracker so both speak the same language.

export const STAGE_ORDER = [
  "SUBMITTED",
  "DOCUMENT_REVIEW",
  "SENT_TO_BANK",
  "SANCTIONED",
  "DISBURSED",
] as const;

export type Stage = (typeof STAGE_ORDER)[number];

// Human-friendly label and short step code for each stage.
export const STAGE_META: Record<Stage, { label: string; code: string }> = {
  SUBMITTED: { label: "Submitted", code: "S1" },
  DOCUMENT_REVIEW: { label: "Documents Under Review", code: "S2" },
  SENT_TO_BANK: { label: "Sent to Bank", code: "S3" },
  SANCTIONED: { label: "Sanctioned", code: "S4" },
  DISBURSED: { label: "Disbursed", code: "S5" },
};

// The legal next moves from a given stage: one step forward, plus rejection.
export function allowedNextStages(current: Stage): (Stage | "REJECTED")[] {
  const index = STAGE_ORDER.indexOf(current);
  const next: (Stage | "REJECTED")[] = [];
  if (index < STAGE_ORDER.length - 1) next.push(STAGE_ORDER[index + 1]);
  next.push("REJECTED");
  return next;
}
