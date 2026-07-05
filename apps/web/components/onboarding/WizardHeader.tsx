// Step header for each wizard page: a green "Step X of 6" pill + "Go Back" link
// on the top row, then the title, subtitle, and a thin green progress underline.

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TOTAL_STEPS } from "./wizardSteps";

interface WizardHeaderProps {
  step: number;
  title: string;
  subtitle: string;
}

export function WizardHeader({ step, title, subtitle }: WizardHeaderProps) {
  const router = useRouter();
  const percent = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="mb-8">
      <div className="mb-5 flex items-center justify-between">
        <span className="rounded-full border border-brand/40 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand">
          Step {step} of {TOTAL_STEPS}
        </span>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border">
            <ArrowLeft size={14} />
          </span>
          Go Back
        </button>
      </div>

      <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
      <p className="mt-1.5 text-base text-text-secondary">{subtitle}</p>

      {/* Progress underline. */}
      <div className="mt-5 h-px w-full bg-border">
        <div
          className="h-px bg-brand transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
