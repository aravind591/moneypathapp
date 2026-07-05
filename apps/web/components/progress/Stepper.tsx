// Horizontal multi-node progress stepper used on the Dashboard and My Application
// screens. Presentational only — driven by `currentIndex` against the mock
// PROGRESS_STEPS (see lib/mock/applicationMock.ts). This is intentionally separate
// from lib/stages.ts STAGE_ORDER, which is the real backend 5-stage contract.

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepDef } from "@/lib/mock/applicationMock";

interface StepperProps {
  steps: StepDef[];
  currentIndex: number;
  percent: number;
  startedLabel?: string;
  className?: string;
}

export function Stepper({
  steps,
  currentIndex,
  percent,
  startedLabel,
  className,
}: StepperProps) {
  return (
    <div className={className}>
      <div className="relative flex items-start justify-between">
        {/* Node row */}
        {steps.map((step, i) => {
          const done = i < currentIndex;
          const current = i === currentIndex;
          return (
            <div
              key={`${step.num}-${i}`}
              className="relative z-10 flex flex-1 flex-col items-center text-center"
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                  done && "bg-brand text-black",
                  current && "bg-brand text-black ring-4 ring-brand/20",
                  !done && !current &&
                    "border border-border bg-surface text-text-secondary"
                )}
              >
                {done ? <Check size={14} strokeWidth={3} /> : step.num}
              </div>
              {step.label ? (
                <span
                  className={cn(
                    "mt-2 max-w-[110px] text-[11px] leading-tight",
                    current ? "font-semibold text-text-primary" : "text-text-secondary"
                  )}
                >
                  {step.label}
                </span>
              ) : null}
            </div>
          );
        })}

        {/* Connector line behind the nodes */}
        <div className="absolute left-0 right-0 top-[13px] mx-[6%] h-[2px] bg-border">
          <div
            className="h-full bg-brand"
            style={{
              width: `${(currentIndex / Math.max(1, steps.length - 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Caption row: started + percent complete */}
      {(startedLabel || percent != null) && (
        <div className="mt-5 flex items-center justify-between text-xs text-text-secondary">
          <span>{startedLabel}</span>
          <span>{percent}% complete</span>
        </div>
      )}
    </div>
  );
}
