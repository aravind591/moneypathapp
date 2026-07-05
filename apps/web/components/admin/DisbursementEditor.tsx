// Admin editor to add disbursement tranches (powers the student Disbursement screen).
// Shows existing tranches read from the application detail and a form to add one.

"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { formatRupees } from "@/lib/utils";
import { Row, inputCls } from "./editorFields";

interface DisbursementEditorProps {
  applicationId: string;
  detail: any;
  onSaved: () => void;
}

export function DisbursementEditor({ applicationId, detail, onSaved }: DisbursementEditorProps) {
  const { createDisbursement } = useAdmin();
  const existing: any[] = detail.disbursements ?? [];
  const [form, setForm] = useState({
    ordinal: String(existing.length + 1),
    label: "",
    detail: "",
    amountRupees: "",
    scheduledDate: "",
    status: "SCHEDULED",
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
      if (!form.label || form.amountRupees === "") {
        setError("Label and amount are required.");
        return;
      }
      const payload: Record<string, unknown> = {
        ordinal: Number(form.ordinal),
        label: form.label,
        amountRupees: Number(form.amountRupees),
        status: form.status,
      };
      if (form.detail) payload.detail = form.detail;
      if (form.scheduledDate) payload.scheduledDate = form.scheduledDate;
      if (form.status === "RELEASED" && form.scheduledDate) payload.releasedDate = form.scheduledDate;
      await createDisbursement(applicationId, payload);
      setForm({ ordinal: String(existing.length + 2), label: "", detail: "", amountRupees: "", scheduledDate: "", status: "SCHEDULED" });
      onSaved();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Add failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-card border border-border bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-secondary">
        Disbursement Tranches
      </h3>

      {existing.length > 0 ? (
        <ul className="mb-4 space-y-1.5">
          {existing.map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded-lg border border-border bg-base px-3 py-2 text-sm">
              <span className="text-text-primary">#{t.ordinal} {t.label}</span>
              <span className="flex items-center gap-3">
                <span className="font-mono text-text-secondary">{formatRupees(t.amountRupees)}</span>
                <span className={t.status === "RELEASED" ? "text-brand" : "text-warning"}>{t.status}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-sm text-text-secondary">No tranches yet.</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Row label="Ordinal">
          <input className={inputCls} type="number" value={form.ordinal} onChange={(e) => set("ordinal", e.target.value)} />
        </Row>
        <Row label="Label">
          <input className={inputCls} value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="First Disbursement" />
        </Row>
        <Row label="Amount (₹)">
          <input className={inputCls} type="number" value={form.amountRupees} onChange={(e) => set("amountRupees", e.target.value)} placeholder="1200000" />
        </Row>
        <Row label="Detail">
          <input className={inputCls} value={form.detail} onChange={(e) => set("detail", e.target.value)} placeholder="Semester 1" />
        </Row>
        <Row label="Date">
          <input className={inputCls} type="date" value={form.scheduledDate} onChange={(e) => set("scheduledDate", e.target.value)} />
        </Row>
        <Row label="Status">
          <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="SCHEDULED">Scheduled</option>
            <option value="RELEASED">Released</option>
          </select>
        </Row>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button size="sm" onClick={add} disabled={busy}>
          {busy ? "Adding…" : "Add tranche"}
        </Button>
        {error ? <span className="text-xs text-danger">{error}</span> : null}
      </div>
    </section>
  );
}
