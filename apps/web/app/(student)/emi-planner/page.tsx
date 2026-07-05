// EMI Planner — no mockup provided; built in the established visual language.
// Interactive: amount/tenure/rate sliders compute a live EMI + breakdown.

"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Donut } from "@/components/ui/donut";
import { useApplication } from "@/hooks/useApplication";
import { formatRupees } from "@/lib/utils";

// Standard reducing-balance EMI: P·r·(1+r)^n / ((1+r)^n − 1).
function computeEmi(principal: number, annualRatePct: number, months: number) {
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className="font-mono text-sm font-semibold text-brand">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#3ee27a]"
        aria-label={label}
      />
    </div>
  );
}

export default function EmiPlannerPage() {
  const { application } = useApplication();
  const [amount, setAmount] = useState(3850000);
  const [tenure, setTenure] = useState(120);
  const [rate, setRate] = useState(10.5);

  // Pre-fill the planner from the application's sanction terms once loaded.
  useEffect(() => {
    if (!application) return;
    const sanctioned = (application.sanctionedAmount ?? application.loanAmount) as number | undefined;
    if (typeof sanctioned === "number") setAmount(sanctioned);
    if (typeof application.loanTenureMonths === "number") setTenure(application.loanTenureMonths);
    if (typeof application.interestRate === "number") setRate(application.interestRate);
  }, [application]);

  const emi = computeEmi(amount, rate, tenure);
  const totalPayable = emi * tenure;
  const totalInterest = totalPayable - amount;
  const interestPct = Math.round((totalInterest / totalPayable) * 100);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader title="EMI Planner" subtitle="Estimate your monthly repayment" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Inputs */}
        <Card>
          <CardTitle className="mb-6">Loan Parameters</CardTitle>
          <Slider
            label="Loan Amount"
            value={amount}
            min={100000}
            max={10000000}
            step={50000}
            display={formatRupees(amount)}
            onChange={setAmount}
          />
          <Slider
            label="Tenure"
            value={tenure}
            min={12}
            max={180}
            step={6}
            display={`${tenure} months`}
            onChange={setTenure}
          />
          <Slider
            label="Interest Rate (p.a.)"
            value={rate}
            min={7}
            max={16}
            step={0.05}
            display={`${rate.toFixed(2)}%`}
            onChange={setRate}
          />
        </Card>

        {/* Results */}
        <div className="space-y-6">
          <Card className="border-brand/30 bg-gradient-to-br from-brand/[0.08] to-transparent">
            <p className="text-[11px] uppercase tracking-wider text-text-secondary">
              Estimated Monthly EMI
            </p>
            <p className="mt-2 font-mono text-4xl font-bold text-brand">
              {formatRupees(Math.round(emi))}
            </p>
            <p className="mt-1 text-xs text-text-secondary">per month</p>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <StatCard label="TOTAL INTEREST" value={formatRupees(Math.round(totalInterest))} tone="warning" />
            <StatCard label="TOTAL PAYABLE" value={formatRupees(Math.round(totalPayable))} tone="info" />
          </div>

          <Card>
            <CardTitle className="mb-4">Principal vs Interest</CardTitle>
            <div className="flex items-center gap-6">
              <Donut percent={interestPct} size={110} stroke={11} label={`${interestPct}%`} sublabel="Interest" />
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-text-secondary">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand" /> Principal{" "}
                  <span className="font-mono text-text-primary">{formatRupees(amount)}</span>
                </p>
                <p className="flex items-center gap-2 text-text-secondary">
                  <span className="h-2.5 w-2.5 rounded-full bg-surface-2" /> Interest{" "}
                  <span className="font-mono text-text-primary">{formatRupees(Math.round(totalInterest))}</span>
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
