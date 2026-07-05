// Loan Sanction screen — faithful rebuild of "Loan Sanctioned.png".
// Renders the student's real data from the finance API, with honest
// loading / error / empty states (no fabricated fallback).

"use client";

import { FileCheck, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { useApplication } from "@/hooks/useApplication";
import { cn, formatRupees } from "@/lib/utils";

export default function LoanSanctionPage() {
  const { application, loading } = useApplication();

  const sanctionedAmount = application?.sanctionedAmount as number | undefined;

  // Honest empty / loading state — a sanction only exists once an admin records it.
  if (loading || !sanctionedAmount) {
    return (
      <div className="mx-auto max-w-[1500px]">
        <PageHeader title="Loan Sanction" subtitle="Your loan sanction details" />
        <Card>
          <p className="py-12 text-center text-sm text-text-secondary">
            {loading
              ? "Loading sanction details…"
              : "Your loan hasn't been sanctioned yet. Once a lender approves your application, the sanctioned amount, terms, and EMI will appear here."}
          </p>
        </Card>
      </div>
    );
  }

  // Real sanction data guaranteed present below.
  const interestRate = application?.interestRate as number | undefined;
  const processingFee = application?.processingFeeAmount as number | undefined;
  const tenure = application?.loanTenureMonths as number | undefined;
  const moratorium = application?.moratoriumNote as string | undefined;
  const emi = application?.estimatedEmi as number | undefined;
  const lender = application?.lenderName as string | undefined;
  const requested =
    typeof application?.loanAmount === "number" ? application.loanAmount : undefined;

  const s = {
    approvedAmount: formatRupees(sanctionedAmount),
    requestedAmount: requested ? formatRupees(requested) : "—",
    sanctionedOn: lender ? `${lender} · Sanctioned` : "Sanctioned",
    details: [
      { label: "Lender", value: lender ?? "—", accent: false },
      { label: "Interest Rate", value: interestRate != null ? `${interestRate}% p.a.` : "—", accent: true },
      { label: "Processing Fee", value: processingFee != null ? formatRupees(processingFee) : "—", accent: false },
      {
        label: "Loan Tenure",
        value: tenure != null ? `${tenure} months (${Math.round(tenure / 12)} yrs)` : "—",
        accent: false,
      },
      { label: "Moratorium", value: moratorium ?? "—", accent: false },
    ],
    emi: {
      value: emi != null ? formatRupees(emi) : "—",
      sub: "/month post moratorium",
    },
    comparison: [
      {
        metric: "Amount",
        requested: requested ? formatRupees(requested) : "—",
        approved: formatRupees(sanctionedAmount),
      },
    ],
    expiry: "Review your offer terms carefully before accepting.",
  };

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Applications"
        subtitle="Loan sanction details"
        actions={
          <>
            <Button variant="secondary">Compare Alternatives</Button>
            <Button variant="secondary">Contact &nbsp;Advisor</Button>
            <Button>Accept Offer</Button>
          </>
        }
      />

      {/* Celebration banner */}
      <Card className="mb-6 border-brand/30 bg-gradient-to-br from-brand/[0.10] to-transparent">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-2xl">
              🎉
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand">Loan Sanctioned!</h2>
              <p className="mt-1 text-sm text-text-secondary">{s.sanctionedOn}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-text-secondary">
              Approved Amount
            </p>
            <p className="mt-1 font-mono text-3xl font-bold text-brand">{s.approvedAmount}</p>
            <p className="text-xs text-text-secondary">of {s.requestedAmount} requested</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* Loan Details */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Loan Details</CardTitle>
            <StatusBadge label="Approved" tone="brand" />
          </div>
          <div className="divide-y divide-border/60">
            {s.details.map((d) => (
              <div key={d.label} className="flex items-center justify-between py-4">
                <span className="text-sm text-text-secondary">{d.label}</span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    d.accent ? "font-mono text-brand" : "text-text-primary"
                  )}
                >
                  {d.value}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between py-4">
              <span className="text-sm font-semibold text-text-primary">Estimated EMI</span>
              <span className="text-right">
                <span className="block font-mono text-lg font-bold text-brand">{s.emi.value}</span>
                <span className="text-xs text-text-secondary">{s.emi.sub}</span>
              </span>
            </div>
          </div>
        </Card>

        {/* Right column: comparison + documents */}
        <div className="space-y-6">
          <Card>
            <CardTitle className="mb-4">Requested vs Approved</CardTitle>
            <table className="w-full">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-text-secondary">
                  <th className="pb-3 text-left font-medium">Metric</th>
                  <th className="pb-3 text-right font-medium">Requested</th>
                  <th className="pb-3 text-right font-medium">Approved</th>
                </tr>
              </thead>
              <tbody>
                {s.comparison.map((c) => (
                  <tr key={c.metric} className="border-t border-border/60">
                    <td className="py-3 text-sm text-text-secondary">{c.metric}</td>
                    <td className="py-3 text-right font-mono text-sm text-text-primary">{c.requested}</td>
                    <td className="py-3 text-right font-mono text-sm font-medium text-brand">{c.approved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>

      {/* Accept CTA bar */}
      <Card className="mt-6 border-brand/30 bg-gradient-to-br from-brand/[0.08] to-transparent">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-start gap-3">
            <FileCheck className="mt-0.5 text-brand" size={20} />
            <div>
              <p className="font-semibold text-text-primary">Ready to accept your offer?</p>
              <p className="mt-0.5 text-sm text-text-secondary">{s.expiry}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <Button variant="secondary">Compare Alternatives</Button>
            <Button variant="secondary">Contact Advisor</Button>
            <Button>
              Accept Offer <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
