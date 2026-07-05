// Shared form primitives for the admin editors (sanction, disbursement, fee, credit).

export const inputCls =
  "h-10 w-full rounded-lg border border-border bg-base px-3 text-sm text-text-primary focus:border-brand focus:outline-none";

export function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-text-secondary">{label}</span>
      {children}
    </label>
  );
}
