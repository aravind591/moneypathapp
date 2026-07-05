// Processing Fee screen — faithful rebuild of "Loan Sanctioned (2).png".
// Renders the student's real data from the finance API, with honest
// loading / error / empty states (no fabricated fallback).

"use client";

import { ArrowDown, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Donut } from "@/components/ui/donut";
import { useFeePayments } from "@/hooks/useFinance";
import { formatRupees } from "@/lib/utils";

export default function ProcessingFeePage() {
  const { data: fee, loading, error } = useFeePayments();

  const hasData = !!fee && fee.payments.length > 0;

  // Loading / error / empty state — no fabricated payment history.
  if (loading || error || !hasData) {
    return (
      <div className="mx-auto max-w-[1500px]">
        <PageHeader title="Processing Fee" subtitle="Loan processing fee & payments" />
        <Card>
          <p className="py-12 text-center text-sm text-text-secondary">
            {loading
              ? "Loading fee details…"
              : error
                ? "We couldn't load your fee details. Please try again shortly."
                : "No processing-fee payments yet. Once your loan is sanctioned and a processing fee is due, your payment schedule and receipts will appear here."}
          </p>
        </Card>
      </div>
    );
  }

  // Real data guaranteed present below.
  const paidCount = fee.payments.filter((x) => x.status === "PAID").length;
  const percent = Math.round(fee.percentPaid);
  const p = {
    remaining: formatRupees(fee.remaining),
    paid: formatRupees(fee.amountPaid),
    total: formatRupees(fee.totalFee),
    percent,
    paidLabel: `${formatRupees(fee.amountPaid)} paid of ${formatRupees(fee.totalFee)} total`,
    stats: [
      { label: "TOTAL FEE", value: formatRupees(fee.totalFee), sub: "Processing fee", tone: "default" as const },
      { label: "AMOUNT PAID", value: formatRupees(fee.amountPaid), sub: `${paidCount} payment${paidCount === 1 ? "" : "s"} made`, tone: "brand" as const },
      { label: "REMAINING", value: formatRupees(fee.remaining), sub: "Yet to pay", tone: "warning" as const },
      { label: "COMPLETION", value: `${percent}%`, sub: `${formatRupees(fee.remaining)} to complete`, tone: "info" as const },
    ],
    history: fee.payments.map((pay) => ({
      date: pay.paidAt ? new Date(pay.paidAt).toLocaleDateString("en-IN") : "—",
      txn: pay.transactionRef ?? "—",
      amount: formatRupees(pay.amountRupees),
      method: pay.method ?? "—",
      status: pay.status === "PAID" ? "Paid" : "Pending",
    })),
  };

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Applications"
        subtitle="Loan sanction details"
        actions={
          <>
            <Button variant="secondary">Contact &nbsp;Advisor</Button>
            <Button>Pay Remaining {p.remaining}</Button>
          </>
        }
      />

      {/* KPI tiles */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {p.stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} tone={s.tone} />
        ))}
      </div>

      {/* Payment progress */}
      <Card className="mb-6">
        <CardHeader>
          <div>
            <CardTitle>Payment Progress</CardTitle>
            <p className="mt-0.5 text-xs text-text-secondary">{p.paidLabel}</p>
          </div>
          <Button size="sm">Pay Remaining {p.remaining}</Button>
        </CardHeader>
        <div className="flex items-center gap-8">
          <Donut percent={p.percent} size={110} stroke={11} label={`${p.percent}%`} sublabel="Paid" />
          <div className="flex-1">
            <div className="mb-2 flex justify-between font-mono text-xs text-text-secondary">
              <span>₹0</span>
              <span>{p.total}</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-surface-2">
              <div className="btn-brand-gradient h-full rounded-full" style={{ width: `${p.percent}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-text-secondary">Paid<br /><span className="font-mono text-brand">{p.paid}</span></span>
              <span className="text-right text-text-secondary">Remaining<br /><span className="font-mono text-brand">{p.remaining}</span></span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <span className="text-xs text-text-secondary">{p.history.length} transactions</span>
          </CardHeader>
          <table className="w-full">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-text-secondary">
                <th className="pb-3 text-left font-medium">Date</th>
                <th className="pb-3 text-left font-medium">Transaction ID</th>
                <th className="pb-3 text-left font-medium">Amount</th>
                <th className="pb-3 text-left font-medium">Method</th>
                <th className="pb-3 text-left font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {p.history.map((row, i) => (
                <tr key={i} className="border-t border-border/60">
                  <td className="py-4 text-sm text-text-secondary">{row.date}</td>
                  <td className="py-4 font-mono text-xs text-text-secondary">{row.txn}</td>
                  <td className="py-4 font-mono text-sm text-brand">{row.amount}</td>
                  <td className="py-4 text-sm text-text-secondary">{row.method}</td>
                  <td className="py-4">
                    <StatusBadge label={row.status} />
                  </td>
                  <td className="py-4 text-right">
                    {row.status === "Paid" ? (
                      <button className="rounded-md border border-border p-1.5 text-text-secondary hover:bg-surface-2">
                        <ArrowDown size={14} />
                      </button>
                    ) : (
                      <span className="text-text-secondary">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Receipts — one per paid payment (real data). */}
        <Card>
          <CardTitle className="mb-4">Receipts &amp; Invoices</CardTitle>
          <div className="space-y-2">
            {p.history.filter((r) => r.status === "Paid").length > 0 ? (
              p.history
                .filter((r) => r.status === "Paid")
                .map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface-2/30 p-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-2 text-text-secondary">
                      <FileText size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        Payment receipt · {r.amount}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {[r.date, r.txn].filter((x) => x && x !== "—").join(" · ")}
                      </p>
                    </div>
                  </div>
                ))
            ) : (
              <p className="py-6 text-center text-sm text-text-secondary">
                No receipts yet — they appear here after your first payment.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
