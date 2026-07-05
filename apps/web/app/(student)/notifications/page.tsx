// Notifications — a real activity feed built from the student's own data:
// loan stage changes (StageHistory) and document review outcomes. There is no
// separate notifications backend, so this reflects real events rather than a
// fabricated feed. Search + filter operate on the real list.

"use client";

import { useMemo, useState } from "react";
import { Search, GitBranch, FileCheck2, FileX2, Clock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useApplication } from "@/hooks/useApplication";
import { useStudentDocuments } from "@/hooks/useStudentDocuments";

type Category = "Stage" | "Documents";

interface FeedItem {
  id: string;
  category: Category;
  title: string;
  body: string;
  time: number; // epoch ms for sorting
  timeLabel: string;
  tone: "brand" | "danger" | "info";
}

const FILTERS: Array<"All" | Category> = ["All", "Stage", "Documents"];

// Friendly labels for each loan stage.
const STAGE_LABEL: Record<string, string> = {
  SUBMITTED: "Application submitted",
  DOCUMENT_REVIEW: "Documents under review",
  SENT_TO_BANK: "Sent to the bank",
  SANCTIONED: "Loan sanctioned",
  DISBURSED: "Loan disbursed",
};

function fmt(dateIso: string): { time: number; label: string } {
  const d = new Date(dateIso);
  return {
    time: d.getTime(),
    label: d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export default function NotificationsPage() {
  const { application } = useApplication();
  const { documents } = useStudentDocuments();
  const [filter, setFilter] = useState<"All" | Category>("All");
  const [query, setQuery] = useState("");

  // Build the real feed from stage history + document review outcomes.
  const feed = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];

    const history =
      (application as { stageHistory?: Array<{ stage: string; note?: string | null; changedAt: string }> } | null)
        ?.stageHistory ?? [];
    history.forEach((h, i) => {
      const t = fmt(h.changedAt);
      items.push({
        id: `stage-${i}`,
        category: "Stage",
        title: STAGE_LABEL[h.stage] ?? h.stage,
        body: h.note ?? "Your application moved to a new stage.",
        time: t.time,
        timeLabel: t.label,
        tone: "brand",
      });
    });

    documents.forEach((d) => {
      if (d.isVerified) {
        const t = fmt(d.uploadedAt);
        items.push({
          id: `doc-v-${d.id}`,
          category: "Documents",
          title: `${d.type.replaceAll("_", " ")} verified`,
          body: "This document was reviewed and verified.",
          time: t.time,
          timeLabel: t.label,
          tone: "brand",
        });
      } else if (d.verificationNote) {
        const t = fmt(d.uploadedAt);
        items.push({
          id: `doc-f-${d.id}`,
          category: "Documents",
          title: `${d.type.replaceAll("_", " ")} needs attention`,
          body: `Reviewer note: ${d.verificationNote}`,
          time: t.time,
          timeLabel: t.label,
          tone: "danger",
        });
      }
    });

    return items.sort((a, b) => b.time - a.time);
  }, [application, documents]);

  const visible = feed.filter(
    (n) =>
      (filter === "All" || n.category === filter) &&
      (query.trim() === "" ||
        (n.title + n.body).toLowerCase().includes(query.trim().toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-[900px]">
      <PageHeader
        title="Notifications"
        subtitle="Updates on your application and documents"
      />

      <Card className="p-4">
        <div className="relative mb-3">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <Input
            placeholder="Search notifications…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filter === f
                  ? "bg-brand text-black"
                  : "border border-border text-text-secondary hover:text-text-primary"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {visible.length > 0 ? (
          <div className="space-y-1">
            {visible.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border-l-2 px-3 py-3",
                  n.tone === "danger"
                    ? "border-danger bg-danger/[0.04]"
                    : "border-transparent hover:bg-surface-2/40"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                    n.tone === "danger" ? "bg-danger/15 text-danger" : "bg-brand/15 text-brand"
                  )}
                >
                  {n.category === "Stage" ? (
                    <GitBranch size={15} />
                  ) : n.tone === "danger" ? (
                    <FileX2 size={15} />
                  ) : (
                    <FileCheck2 size={15} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium capitalize text-text-primary">{n.title}</p>
                    <span className="shrink-0 text-[10px] text-text-secondary">{n.timeLabel}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-secondary">{n.body}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-text-secondary">
              <Clock size={18} />
            </div>
            <p className="text-sm text-text-secondary">
              {feed.length === 0
                ? "No notifications yet. Updates on your application and documents will appear here."
                : "No notifications match your search."}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
