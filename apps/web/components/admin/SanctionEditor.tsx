// Admin editor for an application's sanction terms (powers the student Loan Sanction
// screen). Pre-fills from the current application detail; saves via PATCH .../sanction.

"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Row, inputCls } from "./editorFields";

interface SanctionEditorProps {
  applicationId: string;
  detail: any;
  onSaved: () => void;
}

export function SanctionEditor({ applicationId, detail, onSaved }: SanctionEditorProps) {
  const { updateSanction } = useAdmin();
  const [form, setForm] = useState({
    lenderName: detail.lenderName ?? "",
    sanctionedAmount: detail.sanctionedAmount ?? "",
    interestRate: detail.interestRate ?? "",
    processingFeeAmount: detail.processingFeeAmount ?? "",
    loanTenureMonths: detail.loanTenureMonths ?? "",
    moratoriumNote: detail.moratoriumNote ?? "",
    estimatedEmi: detail.estimatedEmi ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    setError(null);
    try {
      // Only send fields that have a value; coerce numerics.
      const payload: Record<string, unknown> = {};
      if (form.lenderName) payload.lenderName = form.lenderName;
      if (form.sanctionedAmount !== "") payload.sanctionedAmount = Number(form.sanctionedAmount);
      if (form.interestRate !== "") payload.interestRate = Number(form.interestRate);
      if (form.processingFeeAmount !== "") payload.processingFeeAmount = Number(form.processingFeeAmount);
      if (form.loanTenureMonths !== "") payload.loanTenureMonths = Number(form.loanTenureMonths);
      if (form.moratoriumNote) payload.moratoriumNote = form.moratoriumNote;
      if (form.estimatedEmi !== "") payload.estimatedEmi = Number(form.estimatedEmi);
      if (Object.keys(payload).length === 0) {
        setError("Enter at least one field.");
        return;
      }
      await updateSanction(applicationId, payload);
      setMsg("Saved.");
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-card border border-border bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-secondary">
        Sanction Terms
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <Row label="Lender">
          <input className={inputCls} value={form.lenderName} onChange={(e) => set("lenderName", e.target.value)} placeholder="HDFC Credila" />
        </Row>
        <Row label="Sanctioned amount (₹)">
          <input className={inputCls} type="number" value={form.sanctionedAmount} onChange={(e) => set("sanctionedAmount", e.target.value)} placeholder="3850000" />
        </Row>
        <Row label="Interest rate (% p.a.)">
          <input className={inputCls} type="number" step="0.01" value={form.interestRate} onChange={(e) => set("interestRate", e.target.value)} placeholder="10.5" />
        </Row>
        <Row label="Processing fee (₹)">
          <input className={inputCls} type="number" value={form.processingFeeAmount} onChange={(e) => set("processingFeeAmount", e.target.value)} placeholder="15000" />
        </Row>
        <Row label="Tenure (months)">
          <input className={inputCls} type="number" value={form.loanTenureMonths} onChange={(e) => set("loanTenureMonths", e.target.value)} placeholder="120" />
        </Row>
        <Row label="Estimated EMI (₹/mo)">
          <input className={inputCls} type="number" value={form.estimatedEmi} onChange={(e) => set("estimatedEmi", e.target.value)} placeholder="52140" />
        </Row>
        <div className="col-span-2">
          <Row label="Moratorium">
            <input className={inputCls} value={form.moratoriumNote} onChange={(e) => set("moratoriumNote", e.target.value)} placeholder="Course + 12 months" />
          </Row>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button size="sm" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save sanction terms"}
        </Button>
        {msg ? <span className="text-xs text-brand">{msg}</span> : null}
        {error ? <span className="text-xs text-danger">{error}</span> : null}
      </div>
    </section>
  );
}
