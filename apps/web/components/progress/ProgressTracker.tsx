// The student-facing 5-stage progress pipeline. Vertical timeline (mobile-friendly,
// also fine on desktop). Marks each stage completed/current/upcoming using the
// application's currentStage, and overlays the most recent remark per stage from
// stageHistory. Handles the REJECTED case with a frozen pipeline + reason card.

import { STAGE_ORDER, type Stage } from "@/lib/stages";
import { StageCard } from "./StageCard";
import { Button } from "@/components/ui/button";

interface StageHistoryEntry {
  stage: string;
  note?: string | null;
  changedAt: string;
}

interface ProgressTrackerProps {
  currentStage: Stage;
  status: string;
  rejectionReason?: string | null;
  stageHistory: StageHistoryEntry[];
}

export function ProgressTracker({
  currentStage,
  status,
  rejectionReason,
  stageHistory,
}: ProgressTrackerProps) {
  const isRejected = status === "REJECTED";
  const currentIndex = STAGE_ORDER.indexOf(currentStage);

  // For each stage, find the latest history entry (date + note) if it was reached.
  function historyFor(stage: Stage): StageHistoryEntry | undefined {
    const matches = stageHistory.filter((h) => h.stage === stage);
    return matches[matches.length - 1];
  }

  return (
    <div>
      <div className="rounded-card border border-border bg-surface p-6">
        {STAGE_ORDER.map((stage, index) => {
          // When rejected, the pipeline freezes: stages up to and including the
          // current one stay completed, nothing is "current".
          let state: "completed" | "current" | "upcoming";
          if (isRejected) {
            state = index <= currentIndex ? "completed" : "upcoming";
          } else if (index < currentIndex) {
            state = "completed";
          } else if (index === currentIndex) {
            state = "current";
          } else {
            state = "upcoming";
          }

          const entry = historyFor(stage);
          return (
            <StageCard
              key={stage}
              stage={stage}
              index={index}
              state={state}
              reachedAt={entry?.changedAt}
              note={entry?.note}
            />
          );
        })}
      </div>

      {/* Rejection card */}
      {isRejected ? (
        <div className="mt-4 rounded-card border border-danger/40 bg-danger/10 p-6">
          <h3 className="text-lg font-semibold text-danger">Application Rejected</h3>
          <p className="mt-1 text-sm text-text-secondary">
            {rejectionReason ?? "Please contact support for details."}
          </p>
          <Button variant="secondary" className="mt-4">
            Contact Support
          </Button>
        </div>
      ) : null}
    </div>
  );
}
