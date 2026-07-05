// Admin application detail — three sections: application info, document checklist
// (with view/verify/flag), and the stage panel.

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";
import { DocumentViewer } from "@/components/admin/DocumentViewer";
import { StageUpdater } from "@/components/admin/StageUpdater";
import { StatusPill } from "@/components/admin/StatusPill";
import { SanctionEditor } from "@/components/admin/SanctionEditor";
import { DisbursementEditor } from "@/components/admin/DisbursementEditor";
import { FeePaymentEditor } from "@/components/admin/FeePaymentEditor";
import { CreditCheckEditor } from "@/components/admin/CreditCheckEditor";
import { Button } from "@/components/ui/button";
import { formatRupees } from "@/lib/utils";
import type { Stage } from "@/lib/stages";

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const { getDetail } = useAdmin();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load (and reload) the full application detail.
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDetail(params.id);
      setDetail(data);
    } finally {
      setLoading(false);
    }
  }, [getDetail, params.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !detail) {
    return (
      <main className="min-h-screen px-4 py-8">
        <p className="mx-auto max-w-5xl text-text-secondary">Loading…</p>
      </main>
    );
  }
  if (!detail) {
    return (
      <main className="min-h-screen px-4 py-8">
        <p className="mx-auto max-w-5xl text-text-secondary">Application not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm">← Back to queue</Button>
          </Link>
          <StatusPill value={detail.status} />
        </div>

        <h1 className="text-2xl font-bold">
          {detail.student.fullName ?? detail.student.phone}
        </h1>
        <p className="mb-6 text-sm text-text-secondary">
          {detail.courseName} · {detail.institutionName}
        </p>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left two columns: info + documents */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Section 1: application info */}
            <section className="rounded-card border border-border bg-surface p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-secondary">
                Application Info
              </h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Loan amount" value={formatRupees(detail.loanAmount)} />
                <Info label="Course" value={detail.courseName} />
                <Info label="Institution" value={detail.institutionName} />
                <Info label="Duration" value={detail.courseDuration} />
                <Info
                  label="Start date"
                  value={new Date(detail.courseStartDate).toLocaleDateString("en-IN")}
                />
                <Info label="Student phone" value={detail.student.phone} />
                <Info label="Student email" value={detail.student.email ?? "—"} />
              </dl>

              {detail.coApplicant ? (
                <>
                  <h4 className="mb-3 mt-5 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Co-applicant
                  </h4>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <Info label="Name" value={detail.coApplicant.fullName} />
                    <Info label="Relationship" value={detail.coApplicant.relationship} />
                    <Info label="Phone" value={detail.coApplicant.phone} />
                    <Info label="Occupation" value={detail.coApplicant.occupation} />
                    <Info
                      label="Monthly income"
                      value={formatRupees(detail.coApplicant.monthlyIncome)}
                    />
                  </dl>
                </>
              ) : null}
            </section>

            {/* Section 2: documents */}
            <section className="rounded-card border border-border bg-surface p-5">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-secondary">
                Documents ({detail.documents.length})
              </h3>
              {detail.documents.length === 0 ? (
                <p className="text-sm text-text-secondary">No documents uploaded yet.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {detail.documents.map((doc: any) => (
                    <DocumentViewer key={doc.id} document={doc} onChanged={load} />
                  ))}
                </div>
              )}
            </section>

            {/* Finance editors — populate the data the student finance screens show. */}
            <SanctionEditor applicationId={detail.id} detail={detail} onSaved={load} />
            <DisbursementEditor applicationId={detail.id} detail={detail} onSaved={load} />
            <FeePaymentEditor applicationId={detail.id} detail={detail} onSaved={load} />
            <CreditCheckEditor applicationId={detail.id} detail={detail} onSaved={load} />
          </div>

          {/* Right column: stage panel */}
          <div className="lg:col-span-1">
            <StageUpdater
              applicationId={detail.id}
              currentStage={detail.currentStage as Stage}
              status={detail.status}
              onUpdated={load}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

// A single labelled value in the info grid.
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-text-secondary">{label}</dt>
      <dd className="text-text-primary">{value}</dd>
    </div>
  );
}
