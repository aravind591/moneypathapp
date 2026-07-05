// Student progress tracker page. Fetches the student's application and polls every
// 30 seconds so stage changes appear without a manual refresh. Student-only view.

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ProgressTracker } from "@/components/progress/ProgressTracker";
import { Button } from "@/components/ui/button";
import type { Stage } from "@/lib/stages";

interface ApplicationWithHistory {
  id: string;
  currentStage: Stage;
  status: string;
  rejectionReason?: string | null;
  courseName: string;
  institutionName: string;
  stageHistory: { stage: string; note?: string | null; changedAt: string }[];
}

export default function TrackPage() {
  const [application, setApplication] = useState<ApplicationWithHistory | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the student's application (includes stageHistory).
  const fetchApplication = useCallback(async () => {
    try {
      const res = await api.get("/applications/mine");
      setApplication(res.data.data ?? null);
    } catch {
      setApplication(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + poll every 30s. The interval is cleared on unmount.
  useEffect(() => {
    fetchApplication();
    const interval = setInterval(fetchApplication, 30_000);
    return () => clearInterval(interval);
  }, [fetchApplication]);

  return (
    <div className="mx-auto max-w-2xl">
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Track your loan</h1>
          <p className="mt-1 text-text-secondary">
            Live status of your application. Updates automatically.
          </p>
        </div>

        {loading ? (
          <p className="text-text-secondary">Loading…</p>
        ) : !application ? (
          <div className="rounded-card border border-border bg-surface p-8 text-center">
            <p className="mb-4 text-text-secondary">
              You don&apos;t have an application to track yet.
            </p>
            <Link href="/apply">
              <Button>Begin application</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 rounded-card border border-border bg-surface px-5 py-4">
              <p className="text-sm text-text-secondary">Application</p>
              <p className="font-semibold">
                {application.courseName} · {application.institutionName}
              </p>
            </div>
            <ProgressTracker
              currentStage={application.currentStage}
              status={application.status}
              rejectionReason={application.rejectionReason}
              stageHistory={application.stageHistory}
            />
          </>
        )}
      </div>
    </div>
  );
}
