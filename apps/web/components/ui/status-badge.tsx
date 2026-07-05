// StatusBadge — small coloured pill used everywhere (Approved, Verified, Done,
// Released, In Progress, Pending, Running, On Hold, Urgent, Declined, …).
// Either pass an explicit `tone`, or pass just a `label` and let the label→tone map
// pick a sensible colour. Mirrors the colour approach of components/admin/StatusPill.

import { cn } from "@/lib/utils";

export type BadgeTone = "brand" | "warning" | "danger" | "info" | "muted";

const TONE_STYLES: Record<BadgeTone, string> = {
  brand: "bg-brand/15 text-brand border border-brand/20",
  warning: "bg-warning/15 text-warning border border-warning/20",
  danger: "bg-danger/15 text-danger border border-danger/20",
  info: "bg-info/15 text-info border border-info/20",
  muted: "bg-surface-2 text-text-secondary border border-border",
};

// Best-guess tone for a free-text label, so screens can just pass the label.
const LABEL_TONE: Record<string, BadgeTone> = {
  approved: "brand",
  verified: "brand",
  done: "brand",
  released: "brand",
  completed: "brand",
  cleared: "brand",
  excellent: "brand",
  paid: "brand",
  active: "warning",
  "in progress": "warning",
  "in review": "info",
  pending: "warning",
  running: "brand",
  "on hold": "warning",
  urgent: "danger",
  scheduled: "info",
  upcoming: "muted",
  declined: "danger",
  rejected: "danger",
};

interface StatusBadgeProps {
  label: string;
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({ label, tone, dot, className }: StatusBadgeProps) {
  const resolved = tone ?? LABEL_TONE[label.toLowerCase()] ?? "muted";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        TONE_STYLES[resolved],
        className
      )}
    >
      {dot ? (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      ) : null}
      {label}
    </span>
  );
}
