// Apply page — hosts the multi-step application form.

import { ApplicationForm } from "@/components/forms/ApplicationForm";

export default function ApplyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Loan Application</h1>
        <p className="mt-1 text-text-secondary">
          Fill in your details. Your progress is saved automatically.
        </p>
      </div>
      <ApplicationForm />
    </div>
  );
}
