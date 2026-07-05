// Admin editor for the credit assessment (powers the student Credit Check screen).
// Items + insights are dynamic lists, saved wholesale via PUT .../credit-check.

"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Row, inputCls } from "./editorFields";

interface CreditCheckEditorProps {
  applicationId: string;
  detail: any;
  onSaved: () => void;
}

interface Item {
  party: "STUDENT" | "CO_APPLICANT";
  title: string;
  detail: string;
  state: "DONE" | "IN_PROGRESS" | "UPCOMING";
  badge: string;
}
interface Insight {
  kind: "POSITIVE" | "ATTENTION" | "INFO";
  text: string;
}

export function CreditCheckEditor({ applicationId, detail, onSaved }: CreditCheckEditorProps) {
  const { upsertCreditCheck } = useAdmin();
  const cc = detail.creditCheck;
  const [progress, setProgress] = useState(String(cc?.overallProgressPct ?? 0));
  const [status, setStatus] = useState(cc?.status ?? "Running");
  const [items, setItems] = useState<Item[]>(
    (cc?.items ?? []).map((i: any) => ({
      party: i.party,
      title: i.title,
      detail: i.detail ?? "",
      state: i.state,
      badge: i.badge ?? "",
    }))
  );
  const [insights, setInsights] = useState<Insight[]>(
    (cc?.insights ?? []).map((i: any) => ({ kind: i.kind, text: i.text }))
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function addItem() {
    setItems((xs) => [...xs, { party: "STUDENT", title: "", detail: "", state: "UPCOMING", badge: "" }]);
  }
  function addInsight() {
    setInsights((xs) => [...xs, { kind: "POSITIVE", text: "" }]);
  }

  async function save() {
    setBusy(true);
    setMsg(null);
    setError(null);
    try {
      const payload = {
        overallProgressPct: Number(progress) || 0,
        status,
        items: items
          .filter((i) => i.title.trim())
          .map((i) => ({
            party: i.party,
            title: i.title,
            detail: i.detail || undefined,
            state: i.state,
            badge: i.badge || undefined,
          })),
        insights: insights.filter((i) => i.text.trim()).map((i) => ({ kind: i.kind, text: i.text })),
      };
      await upsertCreditCheck(applicationId, payload);
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
        Credit Assessment
      </h3>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Row label="Overall progress (%)">
          <input className={inputCls} type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(e.target.value)} />
        </Row>
        <Row label="Status badge">
          <input className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Running" />
        </Row>
      </div>

      {/* Items */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Assessment Items</span>
        <button type="button" onClick={addItem} className="flex items-center gap-1 text-xs text-brand hover:underline">
          <Plus size={12} /> Add item
        </button>
      </div>
      <div className="mb-4 space-y-2">
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center gap-2">
            <select className={inputCls} value={it.party} onChange={(e) => setItems((xs) => xs.map((x, j) => (j === i ? { ...x, party: e.target.value as Item["party"] } : x)))}>
              <option value="STUDENT">Student</option>
              <option value="CO_APPLICANT">Co-applicant</option>
            </select>
            <input className={inputCls} value={it.title} placeholder="Credit Score" onChange={(e) => setItems((xs) => xs.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
            <input className={inputCls} value={it.badge} placeholder="Excellent" onChange={(e) => setItems((xs) => xs.map((x, j) => (j === i ? { ...x, badge: e.target.value } : x)))} />
            <select className={inputCls} value={it.state} onChange={(e) => setItems((xs) => xs.map((x, j) => (j === i ? { ...x, state: e.target.value as Item["state"] } : x)))}>
              <option value="DONE">Done</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="UPCOMING">Upcoming</option>
            </select>
            <button type="button" onClick={() => setItems((xs) => xs.filter((_, j) => j !== i))} className="text-text-secondary hover:text-danger">
              <X size={15} />
            </button>
          </div>
        ))}
        {items.length === 0 ? <p className="text-xs text-text-secondary">No items.</p> : null}
      </div>

      {/* Insights */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Insights</span>
        <button type="button" onClick={addInsight} className="flex items-center gap-1 text-xs text-brand hover:underline">
          <Plus size={12} /> Add insight
        </button>
      </div>
      <div className="mb-4 space-y-2">
        {insights.map((ins, i) => (
          <div key={i} className="grid grid-cols-[140px_1fr_auto] items-center gap-2">
            <select className={inputCls} value={ins.kind} onChange={(e) => setInsights((xs) => xs.map((x, j) => (j === i ? { ...x, kind: e.target.value as Insight["kind"] } : x)))}>
              <option value="POSITIVE">Positive</option>
              <option value="ATTENTION">Attention</option>
              <option value="INFO">Info</option>
            </select>
            <input className={inputCls} value={ins.text} placeholder="Strong CIBIL score…" onChange={(e) => setInsights((xs) => xs.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} />
            <button type="button" onClick={() => setInsights((xs) => xs.filter((_, j) => j !== i))} className="text-text-secondary hover:text-danger">
              <X size={15} />
            </button>
          </div>
        ))}
        {insights.length === 0 ? <p className="text-xs text-text-secondary">No insights.</p> : null}
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save assessment"}
        </Button>
        {msg ? <span className="text-xs text-brand">{msg}</span> : null}
        {error ? <span className="text-xs text-danger">{error}</span> : null}
      </div>
    </section>
  );
}
