// Left vertical stepper rail for the onboarding wizard (from "Sign up Flow-2..5").
// Shows the "Account Created" node plus the 6 steps with a connecting line. The
// current step's node is brand-green and filled; completed steps show a green
// check; upcoming steps are dim.

"use client";

import { Check, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { WIZARD_STEPS } from "./wizardSteps";

interface WizardRailProps {
  /** The step number currently being shown (1–6). */
  currentStep: number;
  /** Highest completed step from the saved profile. */
  completedStep: number;
}

export function WizardRail({ currentStep, completedStep }: WizardRailProps) {
  return (
    <aside className="hidden w-[320px] shrink-0 border-r border-border/60 px-10 py-12 lg:block">
      <ol className="relative">
        {/* Account Created node (always done). */}
        <RailNode
          icon={<Smartphone size={16} />}
          title="Account Created"
          sub="Phone Verified"
          state="done"
          showLine
        />

        {WIZARD_STEPS.map((step, i) => {
          const state =
            step.num < currentStep || step.num <= completedStep
              ? step.num === currentStep
                ? "current"
                : "done"
              : step.num === currentStep
              ? "current"
              : "upcoming";
          return (
            <RailNode
              key={step.num}
              label={step.num}
              title={step.title}
              sub={step.sub}
              state={step.num === currentStep ? "current" : state}
              showLine={i < WIZARD_STEPS.length - 1}
            />
          );
        })}
      </ol>
    </aside>
  );
}

function RailNode({
  label,
  icon,
  title,
  sub,
  state,
  showLine,
}: {
  label?: number;
  icon?: React.ReactNode;
  title: string;
  sub: string;
  state: "done" | "current" | "upcoming";
  showLine: boolean;
}) {
  return (
    <li className="relative flex gap-4 pb-8 last:pb-0">
      {/* Connector line behind the node. */}
      {showLine ? (
        <span
          className={cn(
            "absolute left-[15px] top-8 h-full w-px",
            state === "upcoming" ? "bg-border" : "bg-brand/40"
          )}
        />
      ) : null}

      <div
        className={cn(
          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          state === "done" && "bg-brand text-black",
          state === "current" && "bg-brand text-black ring-4 ring-brand/20",
          state === "upcoming" && "border border-border bg-surface text-text-secondary"
        )}
      >
        {state === "done" && !icon ? <Check size={16} strokeWidth={3} /> : icon ?? label}
      </div>

      <div className="pt-0.5">
        <p
          className={cn(
            "text-sm font-semibold leading-tight",
            state === "upcoming" ? "text-text-secondary" : "text-text-primary"
          )}
        >
          {title}
        </p>
        <p className="mt-0.5 text-xs text-text-secondary">{sub}</p>
      </div>
    </li>
  );
}
