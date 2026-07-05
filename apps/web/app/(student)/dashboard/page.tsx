// Student dashboard — faithful rebuild of dashboard.png. Presentational, driven by
// mock data (lib/mock/applicationMock.ts). Sidebar shell comes from (student)/layout.

"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Donut } from "@/components/ui/donut";
import { Stepper } from "@/components/progress/Stepper";
import { Logo } from "@/components/Logo";
import { useApplication } from "@/hooks/useApplication";
import { useLenders } from "@/hooks/useLenders";
import { useMe } from "@/hooks/useMe";
import { useStudentDocuments } from "@/hooks/useStudentDocuments";
import { TOTAL_CHECKLIST_DOCS, DOC_CHECKLIST } from "@/lib/documents";
import { cn, formatRupees } from "@/lib/utils";
import {
  PROGRESS_STEPS,
  PROGRESS_STARTED,
  stageToStepIndex,
  stepPercent,
  mockMatchedLenders,
} from "@/lib/mock/applicationMock";

const SPEED_LABEL = { FAST: "Fast", MODERATE: "Moderate", SLOW: "Slow" } as const;

export default function DashboardPage() {
  const { application } = useApplication();
  const { lenders: realLenders, matches } = useLenders();
  const { firstName, me } = useMe();
  const { documents } = useStudentDocuments();

  // Real document-verification breakdown for the dashboard card.
  const docVerified = documents.filter((d) => d.isVerified).length;
  const docFlagged = documents.filter((d) => !d.isVerified && d.verificationNote).length;
  const docPending = documents.length - docVerified - docFlagged;
  const docVerifiedPct = Math.round((docVerified / TOTAL_CHECKLIST_DOCS) * 100);

  const stepIndex = stageToStepIndex(
    application?.currentStage,
    application?.status
  );

  // ---- Real KPI tiles (were static mock) -------------------------------------
  // Onboarding completion, from the profile wizard's completedStep (0–6).
  const onboardingStep = me?.profile?.completedStep ?? 0;
  const appCompletionPct = Math.round((onboardingStep / 6) * 100);
  // Best available interest rate across the real lender catalogue.
  const bestRate =
    realLenders.length > 0
      ? Math.min(...realLenders.map((l) => l.interestRate))
      : null;

  const stats = [
    {
      label: "LOAN TARGET",
      value:
        typeof application?.loanAmount === "number"
          ? formatRupees(application.loanAmount)
          : "—",
      sub: application?.courseName ?? "No application yet",
      tone: "default" as const,
    },
    {
      label: "DOCUMENTS VERIFIED",
      value: `${docVerified}`,
      suffix: `/${TOTAL_CHECKLIST_DOCS}`,
      sub: docFlagged > 0 ? `${docFlagged} need attention` : "Keep uploading",
      tone: "info" as const,
    },
    {
      label: "APP COMPLETION",
      value: `${appCompletionPct}%`,
      sub:
        onboardingStep >= 6
          ? "Onboarding complete"
          : `Step ${onboardingStep} of 6`,
      tone: appCompletionPct >= 100 ? ("info" as const) : ("warning" as const),
    },
    {
      label: "MATCHED LENDERS",
      value: `${realLenders.length}`,
      sub: bestRate !== null ? `Best rate: ${bestRate.toFixed(2)}%` : "—",
      tone: "info" as const,
    },
  ];

  // ---- Real pending actions (were static mock) -------------------------------
  // Documents on the checklist the student hasn't uploaded yet, plus flagged docs
  // that need re-upload. Flagged first (more urgent), then missing uploads.
  const uploadedTypes = new Set(documents.map((d) => d.type));
  const flaggedDocs = documents.filter(
    (d) => !d.isVerified && d.verificationNote
  );
  const allChecklistItems = DOC_CHECKLIST.flatMap((g) => g.items);
  const missingDocs = allChecklistItems.filter(
    (d) => !uploadedTypes.has(d.type)
  );
  const pendingActions = [
    ...flaggedDocs.map((d) => ({
      title: `Re-upload ${d.type.replaceAll("_", " ").toLowerCase()}`,
      sub: d.verificationNote ?? "Flagged by reviewer",
      action: "Fix" as const,
    })),
    ...missingDocs.map((d) => ({
      title: `Upload ${d.label}`,
      sub: d.hint,
      action: "Upload" as const,
    })),
  ].slice(0, 5);

  // Top 3 matched lenders from the API (best match first); fall back to mock.
  const topLenders =
    matches.length > 0
      ? matches
          .slice(0, 3)
          .map((m) => ({ name: m.name, rate: `${m.interestRate.toFixed(2)}%`, match: m.matchPercent, speed: SPEED_LABEL[m.speedTier] }))
      : realLenders.length > 0
        ? realLenders.slice(0, 3).map((l) => ({
            name: l.name,
            rate: `${l.interestRate.toFixed(2)}%`,
            match: Math.round(100 - (l.interestRate - 9) * 6),
            speed: SPEED_LABEL[l.speedTier],
          }))
        : mockMatchedLenders;

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title={`Welcome back, ${firstName ?? "there"}!`}
        subtitle="Let's build something strategic today."
        actions={
          <>
            <Button variant="secondary">Pending Actions</Button>
            <Button>Contact Support</Button>
          </>
        }
      />

      {/* Application progress */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Application Progress</CardTitle>
          <StatusBadge label={`Step ${stepIndex + 1} of 9`} tone="brand" />
        </CardHeader>
        <Stepper
          steps={PROGRESS_STEPS}
          currentIndex={stepIndex}
          percent={stepPercent(stepIndex)}
          startedLabel={PROGRESS_STARTED}
        />
      </Card>

      {/* KPI tiles */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            suffix={(s as { suffix?: string }).suffix}
            sub={s.sub}
            tone={s.tone}
          />
        ))}
      </div>

      {/* Application stage checklist — derived from the real application stage.
          Only shown once the student has an application; otherwise a prompt. */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Application Stage</CardTitle>
          {application ? (
            <StatusBadge label="In Progress" tone="brand" dot />
          ) : null}
        </CardHeader>
        {application ? (
          <div className="space-y-1">
            {PROGRESS_STEPS.filter((s) => s.label).map((step, i) => {
              const done = i < stepIndex;
              const active = i === stepIndex;
              return (
                <div
                  key={step.num}
                  className="flex items-center gap-4 rounded-lg px-1 py-3"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      done && "bg-brand text-black",
                      active && "border-2 border-warning text-warning",
                      !done && !active && "border border-border text-text-secondary"
                    )}
                  >
                    {done ? <Check size={15} strokeWidth={3} /> : i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{step.label}</p>
                  </div>
                  {done ? (
                    <StatusBadge label="Done" tone="brand" />
                  ) : active ? (
                    <StatusBadge label="Active" tone="warning" />
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3 py-6">
            <p className="text-sm text-text-secondary">
              You haven&apos;t started a loan application yet.
            </p>
            <Link href="/apply">
              <Button>Start your application</Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Top matched lenders */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Top Matched Lenders</CardTitle>
          <button className="text-xs text-text-secondary hover:text-text-primary">
            View all 14
          </button>
        </CardHeader>
        <table className="w-full">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-text-secondary">
              <th className="pb-3 font-medium">Lender</th>
              <th className="pb-3 font-medium">Interest Rate</th>
              <th className="pb-3 font-medium">Match</th>
              <th className="pb-3 font-medium">Speed</th>
              <th className="pb-3" />
            </tr>
          </thead>
          <tbody>
            {topLenders.map((l, i) => (
              <tr key={i} className="border-t border-border/60">
                <td className="py-4 text-sm font-medium text-text-primary">{l.name}</td>
                <td className="py-4 font-mono text-sm text-info">{l.rate}</td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <ProgressBar value={l.match} className="h-1.5 w-28" />
                    <span className="text-sm text-brand">{l.match}%</span>
                  </div>
                </td>
                <td className="py-4">
                  <StatusBadge label={l.speed} tone="brand" />
                </td>
                <td className="py-4 text-right">
                  <Button size="sm">Apply</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Document verification — real data from the student's uploads. */}
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <CardTitle>Document Verification</CardTitle>
            <Link href="/documents" className="text-xs font-medium text-brand hover:underline">
              Manage
            </Link>
          </div>
          <div className="mb-5 flex items-center gap-4">
            <Donut percent={docVerifiedPct} size={84} stroke={9} />
            <div>
              <p className="font-mono text-2xl font-bold text-text-primary">
                {docVerified}/{TOTAL_CHECKLIST_DOCS}
              </p>
              <p className="text-xs text-text-secondary">documents verified</p>
            </div>
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Verified</span>
              <span className="font-medium text-brand">{docVerified}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Needs attention</span>
              <span className={cn("font-medium", docFlagged > 0 ? "text-danger" : "text-text-secondary")}>
                {docFlagged}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Pending review</span>
              <span className="font-medium text-text-primary">{docPending}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
              <span className="text-text-secondary">Not uploaded</span>
              <span className="font-medium text-text-secondary">
                {Math.max(0, TOTAL_CHECKLIST_DOCS - documents.length)}
              </span>
            </div>
          </div>
        </Card>

        {/* Pending actions — real gaps: flagged docs + documents not yet uploaded. */}
        <Card>
          <CardTitle className="mb-5">Pending Actions</CardTitle>
          {pendingActions.length > 0 ? (
            <div className="space-y-3">
              {pendingActions.map((a) => (
                <Link
                  key={a.title}
                  href="/documents"
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface-2/40 p-3 transition-colors hover:border-brand/40"
                >
                  <div className="h-8 w-8 shrink-0 rounded-md bg-surface-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium capitalize text-text-primary">{a.title}</p>
                    <p className="text-xs text-text-secondary">{a.sub}</p>
                  </div>
                  <Button size="sm" variant={a.action === "Fix" ? "secondary" : "primary"}>
                    {a.action}
                  </Button>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 text-brand">
                <Check size={18} strokeWidth={3} />
              </div>
              <p className="text-sm text-text-secondary">You&apos;re all caught up.</p>
            </div>
          )}
        </Card>

        {/* Promo card — generic, non-fabricated copy. */}
        <Card className="flex flex-col justify-between border-brand/30 bg-gradient-to-br from-brand/[0.08] to-transparent">
          <Logo />
          <p className="my-6 text-lg font-medium leading-snug text-text-primary">
            Upload and verify your documents to unlock more lender matches and faster
            processing. Our advisors are here whenever you need help.
          </p>
          <Link href="/documents" className="w-full">
            <Button className="w-full">Manage documents</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
