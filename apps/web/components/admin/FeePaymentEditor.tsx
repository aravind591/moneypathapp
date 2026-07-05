// Admin editor to record processing-fee payments (powers the student Processing Fee
// screen). Total fee comes from the sanction's processingFeeAmount.

"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { formatRupees } from "@/lib/utils";
import { Row, inputCls } from "./editorFields";

interface FeePaymentEditorProps {
  applicationId: string;
  detail: any;
  onSaved: () => void;
}

export function FeePaymentEditor({ applicationId, detail, onSaved }: FeePaymentEditorProps) {
  const { createFeePayment } = useAdmin();
  const existing: any[] = detail.feePayments ?? [];
  const totalFee = detail.processingFeeAmount as number | null;
  const [form, setForm] = useState({
    amountRupees: "",
    method: "",
    transactionRef: "",
    status: "PAID",
    paidAt: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function add() {
    setBusy(true);
    setError(null);
    try {
      if (form.amountRupees === "") {
        setError("Amount is required.");
        return;
      }
      const payload: Record<string, unknown> = {
        amountRupees: Number(form.amountRupees),
        status: form.status,
      };
      if (form.method) payload.method = form.method;
      if (form.transactionRef) payload.transactionRef = form.transactionRef;
      if (form.paidAt) payload.paidAt = form.paidAt;
      await createFeePayment(applicationId, payload);
      setForm({ amountRupees: "", method: "", transactionRef: "", status: "PAID", paidAt: "" });
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Add failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-card border border-border bg-surface p-5">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-text-secondary">
        Processing-Fee Payments
      </h3>
      <p className="mb-4 text-xs text-text-secondary">
        Total fee: {totalFee != null ? formatRupees(totalFee) : "— (set in Sanction Terms)"}
      </p>

      {existing.length > 0 ? (
        <ul className="mb-4 space-y-1.5">
          {existing.map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-base px-3 py-2 text-sm">
              <span className="font-mono text-text-secondary">{p.transactionRef ?? "—"}</span>
              <span className="flex items-center gap-3">
                <span className="font-mono text-text-primary">{formatRupees(p.amountRupees)}</span>
                <span className={p.status === "PAID" ? "text-brand" : "text-warning"}>{p.status}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-sm text-text-secondary">No payments yet.</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Row label="Amount (₹)">
          <input className={inputCls} type="number" value={form.amountRupees} onChange={(e) => set("amountRupees", e.target.value)} placeholder="5000" />
        </Row>
        <Row label="Method">
          <input className={inputCls} value={form.method} onChange={(e) => set("method", e.target.value)} placeholder="UPI · GPay" />
        </Row>
        <Row label="Transaction ref">
          <input className={inputCls} value={form.transactionRef} onChange={(e) => set("transactionRef", e.target.value)} placeholder="TXN-HDFC-8821-01" />
        </Row>
        <Row label="Paid date">
          <input className={inputCls} type="date" value={form.paidAt} onChange={(e) => set("paidAt", e.target.value)} />
        </Row>
        <Row label="Status">
          <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
          </select>
        </Row>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button size="sm" onClick={add} disabled={busy}>
          {busy ? "Adding…" : "Add payment"}
        </Button>
        {error ? <span className="text-xs text-danger">{error}</span> : null}
      </div>
    </section>
  );
}
