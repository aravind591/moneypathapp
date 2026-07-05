// A coloured status/stage pill matching the mockup's Done/Active/In-Progress styling.

const STYLES: Record<string, string> = {
  SUBMITTED: "bg-info/15 text-info",
  UNDER_REVIEW: "bg-warning/15 text-warning",
  DOCUMENT_REVIEW: "bg-warning/15 text-warning",
  SENT_TO_BANK: "bg-info/15 text-info",
  SANCTIONED: "bg-brand/15 text-brand",
  DISBURSED: "bg-brand/15 text-brand",
  REJECTED: "bg-danger/15 text-danger",
};

export function StatusPill({ value, label }: { value: string; label?: string }) {
  const style = STYLES[value] ?? "bg-surface-2 text-text-secondary";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {label ?? value.replace(/_/g, " ")}
    </span>
  );
}
