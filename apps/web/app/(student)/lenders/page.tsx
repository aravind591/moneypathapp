// Lenders screen — no mockup provided; built in the established visual language
// (extends the Dashboard's Top Matched Lenders pattern). Presentational mock data.

"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useLenders } from "@/hooks/useLenders";
import { mockLenders } from "@/lib/mock/applicationMock";

const SPEED_LABEL = { FAST: "Fast", MODERATE: "Moderate", SLOW: "Slow" } as const;

function formatMaxAmount(rupees: number): string {
  if (rupees >= 10000000) return `₹${(rupees / 10000000).toFixed(rupees % 10000000 ? 1 : 0)}Cr`;
  return `₹${Math.round(rupees / 100000)}L`;
}

export default function LendersPage() {
  const { lenders: realLenders, matches, loading } = useLenders();

  // Prefer real lenders; fall back to the mock catalogue when none are returned.
  const lenders =
    realLenders.length > 0
      ? realLenders.map((l) => {
          const match = matches.find((m) => m.name === l.name);
          return {
            name: l.name,
            rate: `${l.interestRate.toFixed(2)}%`,
            match: match?.matchPercent ?? Math.round(100 - (l.interestRate - 9) * 6),
            speed: SPEED_LABEL[l.speedTier],
            maxAmount: formatMaxAmount(l.maxAmountRupees),
            processing: `${l.processingFeePct.toFixed(2)}%`,
          };
        })
      : mockLenders;

  const best = lenders[0];
  // Average match across the displayed lenders (was hardcoded "77%").
  const avgMatch =
    lenders.length > 0
      ? Math.round(lenders.reduce((sum, l) => sum + l.match, 0) / lenders.length)
      : 0;

  // While the catalogue is loading, show a light placeholder rather than briefly
  // flashing the mock fallback.
  if (loading) {
    return (
      <div className="mx-auto max-w-[1500px]">
        <PageHeader title="Lenders" subtitle="Compare matched lenders for your loan" />
        <Card>
          <p className="py-10 text-center text-sm text-text-secondary">Loading lenders…</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        title="Lenders"
        subtitle="Compare matched lenders for your loan"
        actions={<Button>Contact Advisor</Button>}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="MATCHED LENDERS" value={String(lenders.length)} sub="Based on your profile" tone="info" />
        <StatCard label="BEST RATE" value={best.rate} sub={`${best.name}`} tone="brand" />
        <StatCard label="AVG MATCH" value={`${avgMatch}%`} sub="Across all lenders" tone="default" />
      </div>

      <Card>
        <table className="w-full">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-text-secondary">
              <th className="pb-3 font-medium">Lender</th>
              <th className="pb-3 font-medium">Interest Rate</th>
              <th className="pb-3 font-medium">Max Amount</th>
              <th className="pb-3 font-medium">Processing</th>
              <th className="pb-3 font-medium">Match</th>
              <th className="pb-3 font-medium">Speed</th>
              <th className="pb-3 font-medium" aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {lenders.map((l, i) => (
              <tr key={i} className="border-t border-border/60">
                <td className="py-4 text-sm font-medium text-text-primary">{l.name}</td>
                <td className="py-4 font-mono text-sm text-info">{l.rate}</td>
                <td className="py-4 font-mono text-sm text-text-secondary">{l.maxAmount}</td>
                <td className="py-4 text-sm text-text-secondary">{l.processing}</td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <ProgressBar value={l.match} className="h-1.5 w-24" />
                    <span className="text-sm text-brand">{l.match}%</span>
                  </div>
                </td>
                <td className="py-4">
                  <StatusBadge label={l.speed} tone={l.speed === "Fast" ? "brand" : l.speed === "Slow" ? "warning" : "info"} />
                </td>
                <td className="py-4 text-right">
                  <Button size="sm">Apply</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
