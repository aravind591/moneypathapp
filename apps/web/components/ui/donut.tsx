// Donut — a small circular progress ring (SVG) used on the Dashboard (Profile
// Completion) and Processing Fee (payment completion) screens.

import { cn } from "@/lib/utils";

interface DonutProps {
  percent: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function Donut({
  percent,
  size = 110,
  stroke = 10,
  label,
  sublabel,
  className,
}: DonutProps) {
  const pct = Math.max(0, Math.min(100, percent));
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className={cn("relative inline-flex", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#23291f"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#3ee27a"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label ? (
          <span className="font-mono text-xl font-bold text-text-primary">{label}</span>
        ) : null}
        {sublabel ? (
          <span className="text-[11px] text-text-secondary">{sublabel}</span>
        ) : null}
      </div>
    </div>
  );
}
