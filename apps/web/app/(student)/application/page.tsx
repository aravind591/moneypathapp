// My Application screen — faithful rebuild of "Login FLow (3).png" (Application
// Overview + Application Progress + Application Details + Recent Activity).
// Driven by the logged-in student's REAL application (GET /applications/mine).
// Fields the backend does not model yet (advisor, lender ref, country, intake,
// est. completion) render as "—" rather than fabricated values.

"use client";

import Link from "next/link";
import { Check, ArrowDown, ScanLine, Monitor } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Stepper } from "@/components/progress/Stepper";
import { useApplication } from "@/hooks/useApplication";
import { cn, formatRupees } from "@/lib/utils";
import {
  PROGRESS_STEPS,
  PROGRESS_STARTED,
  stageToStepIndex,
  stepPercent,
  statusLabel,
  stageActivityLabel,
  applicationRef,
  formatDate,
  formatDateTime,
} from "@/lib/mock/applicationMock";

const DASH = "—";

// A single stage-history entry as returned by the API.
interface StageEntry {
  stage?: string;
  note?: string | null;
  changedAt?: string;
}

function OverviewRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={cn("text-sm font-medium", accent ? "text-brand" : "text-text-primary")}>
        {value}
      </span>
    </div>
  );
}

function DetailCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2/30 p-4">
      <p className="text-[11px] uppercase tracking-wider text-text-secondary">{label}</p>
      <p className="mt-1.5 text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}

export default function ApplicationPage() {
  const { application, loading } = useApplication();

  // While the request is in flight, render nothing structural (avoids flashing
  // an empty state before the real application arrives).
  if (loading) {
    return (
      <div className="mx-auto max-w-[1500px]">
        <PageHeader title="Applications" subtitle="Status & ID" />
        <Card>
          <p className="py-12 text-center text-sm text-text-secondary">
            Loading your application…
          </p>
        </Card>
      </div>
    );
  }

  // No application on record for this student — show a real empty state with a
  // path to apply, instead of fabricated sample data.
  if (!application) {
    return (
      <div className="mx-auto max-w-[1500px]">
        <PageHeader title="Applications" subtitle="Status & ID" />
        <Card>
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-text-primary">
              You haven&apos;t submitted an application yet.
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Start your loan application to track its status here.
            </p>
            <Link href="/apply" className="mt-5 inline-block">
              <Button>Start Application</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // ---- Real application present: map DB fields onto the screen. ----
  const coApplicantName =
    (application.coApplicant as { fullName?: string } | undefined)?.fullName;
  const stageHistory = Array.isArray(application.stageHistory)
    ? (application.stageHistory as StageEntry[])
    : [];

  const createdAt =
    typeof application.createdAt === "string" ? application.createdAt : undefined;
  const updatedAt =
    typeof application.updatedAt === "string" ? application.updatedAt : undefined;
  const courseStartDate =
    typeof application.courseStartDate === "string"
      ? application.courseStartDate
      : undefined;
  const lenderName =
    typeof application.lenderName === "string" ? application.lenderName : null;

  const badge = statusLabel(application.currentStage, application.status);
  const loanAmount =
    typeof application.loanAmount === "number"
      ? formatRupees(application.loanAmount)
      : DASH;

  const stepIndex = stageToStepIndex(
    application.currentStage,
    application.status
  );

  // Recent Activity is built from the real stage history (newest first). The
  // most recent entry is marked "current"; earlier ones are "done".
  const activity = [...stageHistory].reverse().map((entry, i) => ({
    title: stageActivityLabel(entry.stage),
    time: formatDateTime(entry.changedAt),
    body: entry.note ?? "",
    state: (i === 0 ? "current" : "done") as "current" | "done",
    badge: i === 0 ? "Latest" : "Done",
  }));

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Applications"
        subtitle="Status & ID"
        actions={
          <>
            <Button variant="secondary">Downloan Sumary</Button>
            <Button>Contact Advisor</Button>
          </>
        }
      />

      {/* Overview + Progress */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        {/* Application Overview */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Application Overview</CardTitle>
              <p className="mt-0.5 text-xs text-text-secondary">
                Submitted {formatDate(createdAt)}
              </p>
            </div>
            <StatusBadge label={badge} tone="brand" dot />
          </CardHeader>

          <div className="rounded-xl border border-border bg-surface-2/30 p-4">
            <p className="text-[11px] uppercase tracking-wider text-text-secondary">
              Application ID
            </p>
            <p className="mt-1 font-mono text-lg font-bold tracking-wide text-text-primary">
              {applicationRef(application.id)}
            </p>
            <p className="mt-1 font-mono text-[11px] text-text-secondary">
              REF: {application.id}
            </p>
          </div>

          <div className="mt-2 divide-y divide-border/60">
            <OverviewRow label="Assigned Lender" value={lenderName ?? DASH} />
            <OverviewRow label="Assigned Advisor" value={DASH} />
            <OverviewRow label="Submission Date" value={formatDateTime(createdAt)} />
            <OverviewRow label="Last Updated" value={<span className="text-brand">{formatDateTime(updatedAt)}</span>} />
            <OverviewRow label="Est. Completion" value={DASH} />
          </div>
        </Card>

        {/* Application Progress */}
        <Card>
          <CardTitle className="mb-6">Application Progress</CardTitle>
          <Stepper
            steps={PROGRESS_STEPS}
            currentIndex={stepIndex}
            percent={stepPercent(stepIndex)}
            startedLabel={
              createdAt ? `Started ${formatDate(createdAt)}` : PROGRESS_STARTED
            }
          />
        </Card>
      </div>

      {/* Application Details grid */}
      <Card className="mb-6">
        <CardTitle className="mb-5">Application Details</CardTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailCell label="University" value={application.institutionName ?? DASH} />
          <DetailCell label="Course" value={application.courseName ?? DASH} />
          <DetailCell label="Course Duration" value={(application.courseDuration as string) ?? DASH} />
          <DetailCell label="Loan Amount" value={<span className="font-mono text-brand">{loanAmount}</span>} />
          <DetailCell label="Co-applicant" value={coApplicantName ?? DASH} />
          <DetailCell label="Course Start" value={formatDate(courseStartDate)} />
        </div>
      </Card>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="secondary" size="sm">View All</Button>
          </CardHeader>
          {activity.length === 0 ? (
            <p className="py-6 text-sm text-text-secondary">
              No activity yet — your application timeline will appear here as it
              progresses.
            </p>
          ) : (
            <div className="space-y-6">
              {activity.map((act, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full",
                        act.state === "done"
                          ? "bg-brand text-black"
                          : "border-2 border-brand"
                      )}
                    >
                      {act.state === "done" ? (
                        <Check size={14} strokeWidth={3} />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-brand" />
                      )}
                    </div>
                    {i < activity.length - 1 ? (
                      <span className="mt-1 w-px flex-1 bg-border" />
                    ) : null}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-text-primary">{act.title}</p>
                      <StatusBadge
                        label={act.badge}
                        tone={act.state === "done" ? "brand" : "warning"}
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-text-secondary">{act.time}</p>
                    {act.body ? (
                      <p className="mt-1.5 text-sm text-text-secondary">{act.body}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardTitle className="mb-4">Quick Actions</CardTitle>
            <div className="space-y-2.5">
              <button className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface-2/40 px-4 py-3 text-sm text-text-primary hover:bg-surface-2">
                <ArrowDown size={16} /> Download Application Summary
              </button>
              <button className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface-2/40 px-4 py-3 text-sm text-text-primary hover:bg-surface-2">
                <ScanLine size={16} /> View Full Timeline
              </button>
              <button className="btn-brand-gradient flex w-full items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-black hover:brightness-110">
                <Monitor size={16} /> Contact Advisor
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
