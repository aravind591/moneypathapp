// The 6-step onboarding wizard definition — shared by the left rail and the step
// pages. Order and labels match the mockups' stepper ("Sign up Flow-2..5").

export interface WizardStep {
  /** Step number 1–6 (the "Account Created" node is rendered separately as step 0). */
  num: number;
  title: string;
  sub: string;
  /** Route segment under /onboarding. */
  slug: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  { num: 1, title: "Basic information", sub: "Personal Details", slug: "basic-info" },
  { num: 2, title: "Academic & Official Details", sub: "Grades & Employment", slug: "academic" },
  { num: 3, title: "Study Destination", sub: "Country & Course", slug: "study-destination" },
  { num: 4, title: "Financial Profile", sub: "Income & assets", slug: "financial" },
  { num: 5, title: "Co-applicant", sub: "Parent details", slug: "co-applicant" },
  { num: 6, title: "Documents", sub: "Upload & Verify", slug: "documents" },
];

export const TOTAL_STEPS = WIZARD_STEPS.length;

export function stepBySlug(slug: string): WizardStep | undefined {
  return WIZARD_STEPS.find((s) => s.slug === slug);
}

export function nextSlug(currentNum: number): string | null {
  const next = WIZARD_STEPS.find((s) => s.num === currentNum + 1);
  return next ? next.slug : null;
}
