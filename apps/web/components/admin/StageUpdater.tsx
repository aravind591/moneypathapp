// Stage panel: shows the 5-stage progress bar with the current stage highlighted,
// offers only the legal next moves (one step forward, or REJECTED), and confirms
// with a modal before applying — since the change notifies the student.

"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { STAGE_ORDER, STAGE_META, allowedNextStages, type Stage } from "@/lib/stages";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

interface StageUpdaterProps {
  applicationId: string;
  currentStage: Stage;
  status: string;
  onUpdated: () => void;
}

export function StageUpdater({
  applicationId,
  currentStage,
  status,
  onUpdated,
}: StageUpdaterProps) {
  const { updateStage } = useAdmin();
  const [target, setTarget] = useState<string>("");
  const [note, setNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRejected = status === "REJECTED";
  const options = allowedNextStages(currentStage);
  const currentIndex = STAGE_ORDER.indexOf(currentStage);

  // Apply the stage change after the admin confirms.
  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      await updateStage(
        applicationId,
        target,
        note || undefined,
        target === "REJECTED" ? rejectionReason : undefined
      );
      setConfirming(false);
      setTarget("");
      setNote("");
      setRejectionReason("");
      onUpdated();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Update failed.");
    } finally {
      setBusy(false);
    }
  }

  // Friendly label for the chosen target in the confirmation prompt.
  const targetLabel =
    target === "REJECTED"
      ? "Rejected"
      : target
      ? STAGE_META[target as Stage].label
      : "";

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-secondary">
        Loan Stage
      </h3>

      {/* Progress bar */}
      <div className="mb-6 flex items-center">
        {STAGE_ORDER.map((stage, index) => {
          const done = !isRejected && index < currentIndex;
          const active = !isRejected && index === currentIndex;
          return (
            <div key={stage} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    done
                      ? "bg-brand text-black"
                      : active
                      ? "border-2 border-brand text-brand"
                      : "border border-border text-text-secondary"
                  }`}
                >
                  {done ? "✓" : index + 1}
                </div>
                <span className="mt-1 max-w-[72px] text-center text-[10px] text-text-secondary">
                  {STAGE_META[stage].label}
                </span>
              </div>
              {index < STAGE_ORDER.length - 1 ? (
                <div
                  className={`mx-1 h-0.5 flex-1 ${
                    !isRejected && index < currentIndex ? "bg-brand" : "bg-border"
                  }`}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {isRejected ? (
        <p className="rounded-lg bg-danger/15 px-4 py-3 text-sm text-danger">
          This application has been rejected. No further stage changes are allowed.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <Select value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value="">Select next stage…</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "REJECTED" ? "Reject application" : STAGE_META[opt as Stage].label}
              </option>
            ))}
          </Select>

          {target === "REJECTED" ? (
            <input
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection (shown to student)…"
              className="h-11 rounded-xl border border-border bg-base px-4 text-sm"
            />
          ) : (
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional remark (e.g. 'Sent to SBI on 12 June')…"
              className="h-11 rounded-xl border border-border bg-base px-4 text-sm"
            />
          )}

          <Button
            disabled={!target || (target === "REJECTED" && !rejectionReason)}
            onClick={() => setConfirming(true)}
          >
            Update stage
          </Button>
        </div>
      )}

      {/* Confirmation modal */}
      {confirming ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-card border border-border bg-surface p-6">
            <h4 className="mb-2 text-lg font-semibold">Confirm stage change</h4>
            <p className="mb-4 text-sm text-text-secondary">
              Move application to <span className="text-text-primary">{targetLabel}</span>?
              This will notify the student.
            </p>
            {error ? <p className="mb-3 text-sm text-danger">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirming(false)} disabled={busy}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={busy}>
                {busy ? "Updating…" : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
