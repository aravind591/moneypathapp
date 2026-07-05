// ProgressBar — thin rounded track with a brand-green fill, used on the Credit Check,
// Processing Fee, Disbursement and progress screens. Optional gradient fill for the
// brighter bars in the mockups.

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  gradient?: boolean;
  className?: string;
  trackClassName?: string;
}

export function ProgressBar({
  value,
  gradient = true,
  className,
  trackClassName,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-surface-2",
        trackClassName,
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full",
          gradient ? "btn-brand-gradient" : "bg-brand"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
