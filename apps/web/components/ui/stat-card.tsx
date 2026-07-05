// StatCard — the KPI tile used on the Dashboard, Processing Fee, and Disbursement
// screens: small uppercase label, large mono value (optionally tinted by tone), and a
// muted sub-line. Some tiles in the mockups have a faint coloured glow background.

import { cn } from "@/lib/utils";

export type StatTone = "default" | "brand" | "warning" | "danger" | "info";

const VALUE_TONE: Record<StatTone, string> = {
  default: "text-text-primary",
  brand: "text-brand",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-info",
};

// Faint radial-ish tint behind the warning/info tiles, matching the mockups.
const GLOW: Record<StatTone, string> = {
  default: "",
  brand: "",
  warning: "bg-gradient-to-br from-warning/[0.06] to-transparent",
  danger: "bg-gradient-to-br from-danger/[0.06] to-transparent",
  info: "bg-gradient-to-br from-info/[0.05] to-transparent",
};

interface StatCardProps {
  label: string;
  value: string;
  suffix?: string;
  sub?: string;
  tone?: StatTone;
  className?: string;
}

export function StatCard({
  label,
  value,
  suffix,
  sub,
  tone = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-surface p-5",
        GLOW[tone],
        className
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">
        {label}
      </p>
      <p className="mt-3 font-mono text-3xl font-bold leading-none">
        <span className={VALUE_TONE[tone]}>{value}</span>
        {suffix ? (
          <span className="text-lg font-semibold text-text-secondary">{suffix}</span>
        ) : null}
      </p>
      {sub ? <p className="mt-3 text-xs text-text-secondary">{sub}</p> : null}
    </div>
  );
}
