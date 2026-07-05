// Onboarding wizard shell: left stepper rail + scrollable content area. The rail
// reads the live profile (completedStep) and derives the current step from the
// URL so it highlights correctly on every page.

"use client";

import { usePathname } from "next/navigation";
import { WizardRail } from "@/components/onboarding/WizardRail";
import { stepBySlug } from "@/components/onboarding/wizardSteps";
import { useProfile } from "@/hooks/useProfile";
import { RequireStudentAuth } from "@/components/auth/AuthGuard";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { profile } = useProfile();

  // /onboarding/<slug> → current step number (defaults to 1).
  const slug = pathname.split("/").filter(Boolean).pop() ?? "";
  const currentStep = stepBySlug(slug)?.num ?? 1;

  return (
    // Onboarding requires a logged-in student, same as the dashboard.
    <RequireStudentAuth>
      <div className="flex min-h-screen bg-base">
        <WizardRail
          currentStep={currentStep}
          completedStep={profile?.completedStep ?? 0}
        />
        <main className="relative flex-1 overflow-x-hidden">
          <div className="pointer-events-none fixed bottom-0 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-brand/[0.04] blur-[120px]" />
          <div className="relative mx-auto max-w-4xl px-8 py-12">{children}</div>
        </main>
      </div>
    </RequireStudentAuth>
  );
}
