// /onboarding → send the student to the first wizard step (or wherever they left
// off based on their saved progress).

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { WIZARD_STEPS } from "@/components/onboarding/wizardSteps";

export default function OnboardingIndex() {
  const router = useRouter();
  const { profile, loading } = useProfile();

  useEffect(() => {
    if (loading) return;
    // Resume at the step after the last completed one (capped at the last step).
    const resumeNum = Math.min(
      (profile?.completedStep ?? 0) + 1,
      WIZARD_STEPS.length
    );
    const target = WIZARD_STEPS.find((s) => s.num === resumeNum) ?? WIZARD_STEPS[0];
    router.replace(`/onboarding/${target.slug}`);
  }, [loading, profile, router]);

  return (
    <p className="py-12 text-center text-sm text-text-secondary">Loading…</p>
  );
}
