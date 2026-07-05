// Credit Check screen — faithful rebuild of "Credit Check.png".
// Renders the student's real data from the finance API, with honest
// loading / error / empty states (no fabricated fallback).

"use client";

import { Search, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useCreditCheck } from "@/hooks/useFinance";
import { cn } from "@/lib/utils";

const STATE_MAP = { DONE: "done", IN_PROGRESS: "current", UPCOMING: "current" } as const;

type Row = { title: string; sub: string; badge: string; state: "done" | "current" };

function AssessmentRow({ row }: { row: Row }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3",
        row.state === "current"
          ? "border-brand/40 bg-brand/[0.04]"
          : "border-border bg-surface-2/30"
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-brand">
        <CreditCard size={16} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">{row.title}</p>
        <p className="text-xs text-text-secondary">{row.sub}</p>
      </div>
      <StatusBadge label={row.badge} />
    </div>
  );
}

export default function CreditCheckPage() {
  const { data: real, loading, error } = useCreditCheck();

  const hasData = !!real && real.items.length > 0;

  // Loading / error / empty state — a credit assessment only exists once an admin
  // starts it. No fabricated "Arjun Ramesh" / lender copy.
  if (loading || error || !hasData) {
    return (
      <div className="mx-auto max-w-[1500px]">
        <PageHeader title="Credit Check" subtitle="Credit assessment status" />
        <Card>
          <p className="py-12 text-center text-sm text-text-secondary">
            {loading
              ? "Loading credit assessment…"
              : error
                ? "We couldn't load your credit assessment. Please try again shortly."
                : "Your credit assessment hasn't started yet. Once a lender begins reviewing your profile, its progress, checks, and insights will appear here."}
          </p>
        </Card>
      </div>
    );
  }

  // Real data guaranteed present below.
  const c = {
    progress: real.overallProgressPct,
    status: real.status,
    student: {
      name: "Primary Applicant",
      status: "In Review",
      rows: real.items
        .filter((it) => it.party === "STUDENT")
        .map((it) => ({ title: it.title, sub: it.detail ?? "", badge: it.badge ?? "", state: STATE_MAP[it.state] })),
    },
    coApplicant: {
      name: "Co-Applicant",
      status: "In Review",
      rows: real.items
        .filter((it) => it.party === "CO_APPLICANT")
        .map((it) => ({ title: it.title, sub: it.detail ?? "", badge: it.badge ?? "", state: STATE_MAP[it.state] })),
    },
    insights: {
      positive: real.insights.filter((i) => i.kind === "POSITIVE").map((i) => ({ bold: "", text: i.text })),
      attention: real.insights.filter((i) => i.kind === "ATTENTION").map((i) => ({ bold: "", text: i.text })),
      additional: real.insights.filter((i) => i.kind === "INFO").map((i) => ({ bold: "", text: i.text, textAfter: "" })),
    },
  };

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Applications"
        subtitle="Credit check status"
        actions={
          <>
            <Button variant="secondary">Upload Documents</Button>
            <Button>Contact Advisor</Button>
          </>
        }
      />

      {/* Top banner */}
      <Card className="mb-5 border-brand/30 bg-gradient-to-br from-brand/[0.08] to-transparent">
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 text-brand">
              <Search size={18} />
            </div>
            <div>
              <p className="font-semibold text-text-primary">Credit Assessment</p>
              <p className="mt-0.5 text-sm text-text-secondary">
                Your lender is reviewing your credit profile.
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-text-secondary">Progress</p>
            <p className="font-mono text-3xl font-bold text-text-primary">{c.progress}%</p>
            <p className="text-xs text-text-secondary">{c.status}</p>
          </div>
        </div>
      </Card>

      {/* Assessment progress bar */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Assessment Progress</CardTitle>
          <StatusBadge label="Running" tone="brand" dot />
        </CardHeader>
        <ProgressBar value={c.progress} />
        <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
          <span>{c.status}</span>
          <span className="text-brand">{c.progress}% Complete</span>
        </div>
      </Card>

      {/* Student + Co-applicant assessments */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Student Assessment</CardTitle>
              <p className="mt-0.5 text-xs text-text-secondary">{c.student.name}</p>
            </div>
            <StatusBadge label={c.student.status} tone="info" />
          </CardHeader>
          <div className="space-y-2.5">
            {c.student.rows.map((r) => (
              <AssessmentRow key={r.title} row={r} />
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Co-Applicant Assessment</CardTitle>
              <p className="mt-0.5 text-xs text-text-secondary">{c.coApplicant.name}</p>
            </div>
            <StatusBadge label={c.coApplicant.status} tone="brand" />
          </CardHeader>
          <div className="space-y-2.5">
            {c.coApplicant.rows.map((r) => (
              <AssessmentRow key={r.title} row={r} />
            ))}
          </div>
        </Card>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="flex flex-col">
          <CardTitle className="mb-5">Assessment Insights</CardTitle>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">
            ✓ Positive Factors
          </p>
          <ul className="mb-5 space-y-2.5">
            {c.insights.positive.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-text-secondary">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                <span><span className="font-semibold text-text-primary">{p.bold}</span>{p.text}</span>
              </li>
            ))}
          </ul>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-warning">
            ⚠ Areas Requiring Attention
          </p>
          <ul className="mb-5 space-y-2.5">
            {c.insights.attention.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-text-secondary">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                <span><span className="font-semibold text-text-primary">{p.bold}</span>{p.text}</span>
              </li>
            ))}
          </ul>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-info">
            ℹ Additional Information
          </p>
          <ul className="mb-6 space-y-2.5">
            {c.insights.additional.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-text-secondary">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-info" />
                <span>{p.text}<span className="font-semibold text-text-primary">{p.bold}</span>{p.textAfter}</span>
              </li>
            ))}
          </ul>

          <button className="mt-auto w-full rounded-lg bg-info py-2.5 text-sm font-semibold text-white hover:brightness-110">
            Contact Advisor
          </button>
        </Card>
      </div>
    </div>
  );
}
