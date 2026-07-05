// A single stage in the student progress tracker. Renders differently for completed,
// current, and upcoming states, and shows the date reached plus any admin remark.

import { STAGE_META, type Stage } from "@/lib/stages";

interface StageCardProps {
  stage: Stage;
  index: number;
  state: "completed" | "current" | "upcoming";
  reachedAt?: string;
  note?: string | null;
}

export function StageCard({ stage, index, state, reachedAt, note }: StageCardProps) {
  const meta = STAGE_META[stage];

  // The numbered dot: green check (done), pulsing blue (current), grey (upcoming).
  const dot =
    state === "completed" ? (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-black">
        ✓
      </div>
    ) : state === "current" ? (
      <div className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-info text-sm font-bold text-info">
        <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-info/60" />
        {index + 1}
      </div>
    ) : (
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-sm font-semibold text-text-secondary">
        {index + 1}
      </div>
    );

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">{dot}</div>
      <div className="pb-6">
        <p
          className={`text-sm font-semibold ${
            state === "upcoming" ? "text-text-secondary" : "text-text-primary"
          }`}
        >
          {meta.code} · {meta.label}
        </p>
        {reachedAt ? (
          <p className="text-xs text-text-secondary">
            {new Date(reachedAt).toLocaleString("en-IN")}
          </p>
        ) : null}
        {note ? <p className="mt-1 text-xs text-text-secondary">“{note}”</p> : null}
      </div>
    </div>
  );
}
