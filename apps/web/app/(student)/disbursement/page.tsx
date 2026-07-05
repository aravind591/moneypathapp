// Disbursement screen — faithful rebuild of "Loan Sanctioned (1).png".
// Renders the student's real data from the finance API, with honest
// loading / error / empty states (no fabricated fallback).

"use client";

import { FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useDisbursement } from "@/hooks/useFinance";
import { cn, formatRupees } from "@/lib/utils";

const ORDINAL = ["1st", "2nd", "3rd", "4th", "5th", "6th"];

export default function DisbursementPage() {
  const { data: real, loading, error } = useDisbursement();

  const hasData = !!real && real.disbursements.length > 0;

  // Loading / error / empty states — no fabricated fallback.
  if (loading || error || !hasData) {
    return (
      <div className="mx-auto max-w-[1500px]">
        <PageHeader title="Disbursement" subtitle="Loan disbursement details" />
        <Card>
          <p className="py-12 text-center text-sm text-text-secondary">
            {loading
              ? "Loading disbursement details…"
              : error
                ? "We couldn't load your disbursement details. Please try again shortly."
                : "No disbursements yet. Once your loan is sanctioned and funds begin releasing, your tranches and university remittance will appear here."}
          </p>
        </Card>
      </div>
    );
  }

  // From here on, real data is guaranteed present.
  const releasedCount = real.disbursements.filter((x) => x.status === "RELEASED").length;
  const percent = Math.round(real.percentReleased * 10) / 10;
  const firstReleased = real.disbursements.find((x) => x.releasedDate);
  const remittance = real.remittances[0] ?? null;

  const d = {
    percent,
    progressLabel: `${formatRupees(real.totalDisbursed)} of ${formatRupees(real.sanctionedAmount)}`,
    releasedLabel: `${percent}% Released`,
    firstDisbursed: firstReleased?.releasedDate
      ? `First disbursed ${new Date(firstReleased.releasedDate).toLocaleDateString("en-IN")}`
      : "Not yet disbursed",
    stats: [
      { label: "SANCTIONED AMOUNT", value: formatRupees(real.sanctionedAmount), sub: "Total approved", tone: "info" as const },
      { label: "TOTAL DISBURSED", value: formatRupees(real.totalDisbursed), sub: `${releasedCount} disbursement${releasedCount === 1 ? "" : "s"}`, tone: "brand" as const },
      { label: "REMAINING BALANCE", value: formatRupees(real.remainingBalance), sub: "Yet to release", tone: "warning" as const },
    ],
    milestones: real.disbursements.map((t, i) => ({
      ord: ORDINAL[i] ?? `${i + 1}th`,
      title: t.label,
      sub: [
        (t.releasedDate ?? t.scheduledDate)
          ? new Date((t.releasedDate ?? t.scheduledDate)!).toLocaleDateString("en-IN")
          : null,
        t.detail,
      ].filter(Boolean).join(" · "),
      amount: formatRupees(t.amountRupees),
      badge: t.status === "RELEASED" ? "Released" : "Scheduled",
      done: t.status === "RELEASED",
    })),
    remittance,
  };

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Applications"
        subtitle="Loan sanction details"
        actions={
          <>
            <Button variant="secondary">Contact &nbsp;Advisor</Button>
            <Button>View Transaction Details</Button>
          </>
        }
      />

      {/* KPI tiles */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {d.stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} tone={s.tone} />
        ))}
      </div>

      {/* Disbursement progress */}
      <Card className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <CardTitle>Disbursement Progress</CardTitle>
          <span className="font-mono text-sm text-brand">{d.progressLabel}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-gradient-to-r from-brand to-info" style={{ width: `${d.percent}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-text-secondary">
          <span>{d.firstDisbursed}</span>
          <span className="text-brand">{d.releasedLabel}</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Milestones */}
        <Card>
          <CardTitle className="mb-5">Disbursement Milestones</CardTitle>
          <div className="space-y-3">
            {d.milestones.map((m) => (
              <div
                key={m.ord}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-4",
                  m.done ? "border-brand/30 bg-brand/[0.04]" : "border-border bg-surface-2/30 opacity-80"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    m.done ? "bg-brand/20 text-brand" : "bg-surface-2 text-text-secondary"
                  )}
                >
                  {m.ord}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-primary">{m.title}</p>
                    <span className="font-mono text-sm text-brand">{m.amount}</span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between">
                    <p className="text-xs text-text-secondary">{m.sub}</p>
                    <StatusBadge label={m.badge} tone={m.done ? "brand" : "info"} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* University remittance — real data (or a note when none is recorded yet). */}
        <Card>
          <CardHeader>
            <CardTitle>University Remittance</CardTitle>
            {d.remittance ? (
              <StatusBadge
                label={d.remittance.status === "COMPLETED" ? "Completed" : "Upcoming"}
                tone={d.remittance.status === "COMPLETED" ? "brand" : "info"}
              />
            ) : null}
          </CardHeader>
          {d.remittance ? (
            <>
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-surface-2/30 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-text-secondary">
                  <FileText size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {d.remittance.beneficiary}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {[d.remittance.country, d.remittance.detail].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              <div className="divide-y divide-border/60">
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-text-secondary">Amount (INR)</span>
                  <span className="font-mono text-sm text-text-primary">{formatRupees(d.remittance.amountInr)}</span>
                </div>
                {d.remittance.amountForeign != null && d.remittance.currency ? (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-text-secondary">Amount ({d.remittance.currency})</span>
                    <span className="font-mono text-sm text-text-primary">
                      {d.remittance.amountForeign.toLocaleString()} {d.remittance.currency}
                    </span>
                  </div>
                ) : null}
                {d.remittance.exchangeRate != null ? (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-text-secondary">Exchange rate</span>
                    <span className="font-mono text-sm text-text-primary">{d.remittance.exchangeRate}</span>
                  </div>
                ) : null}
                {d.remittance.transactionRef ? (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-text-secondary">Reference</span>
                    <span className="font-mono text-sm text-text-primary">{d.remittance.transactionRef}</span>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <p className="py-8 text-center text-sm text-text-secondary">
              No university remittance recorded yet.
            </p>
          )}
        </Card>

        {/* Actions */}
        <div className="space-y-6">
          <Card>
            <CardTitle className="mb-4">Actions</CardTitle>
            <div className="space-y-2.5">
              <button className="btn-brand-gradient w-full rounded-lg px-4 py-3 text-sm font-semibold text-black hover:brightness-110">
                Contact Advisor
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
