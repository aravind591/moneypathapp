// Horizontal step indicator for the multi-step application form.
// Mirrors the mockup's progress bar styling — green for done/active, grey upcoming.

interface StepIndicatorProps {
  steps: string[];
  currentStep: number; // zero-based index of the active step
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center">
        {steps.map((label, index) => {
          const isDone = index < currentStep;
          const isActive = index === currentStep;
          return (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                {/* Numbered dot — filled green when done/active. */}
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                    isDone
                      ? "bg-brand text-black"
                      : isActive
                      ? "border-2 border-brand text-brand"
                      : "border border-border text-text-secondary"
                  }`}
                >
                  {isDone ? "✓" : index + 1}
                </div>
                <span
                  className={`mt-2 text-xs ${
                    isActive ? "text-text-primary" : "text-text-secondary"
                  }`}
                >
                  {label}
                </span>
              </div>
              {/* Connector line between dots. */}
              {index < steps.length - 1 ? (
                <div
                  className={`mx-2 h-0.5 flex-1 ${
                    index < currentStep ? "bg-brand" : "bg-border"
                  }`}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
