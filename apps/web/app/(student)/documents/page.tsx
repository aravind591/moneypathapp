// Documents page — the student's document hub. Uploading is a first-class action:
// it works for any logged-in student WITHOUT a loan application (documents attach
// to the student). Supports replace and remove for future edits. Grouped Identity
// / Academic / Financial per the sign-up mockups.

"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { DocumentType } from "@moneypath/shared";
import { useStudentDocuments } from "@/hooks/useStudentDocuments";
import { DocumentChecklist, type UploadedDoc } from "@/components/documents/DocumentChecklist";
import { TOTAL_CHECKLIST_DOCS } from "@/lib/documents";
import { Button } from "@/components/ui/button";

export default function DocumentsPage() {
  const { documents, loading, uploadFile, deleteDocument } = useStudentDocuments();

  const uploaded = useMemo(() => {
    const map = new Map<DocumentType, UploadedDoc>();
    for (const d of documents) {
      map.set(d.type, {
        id: d.id,
        fileName: d.fileName,
        isVerified: d.isVerified,
        verificationNote: d.verificationNote,
      });
    }
    return map;
  }, [documents]);

  // Review breakdown for the status summary.
  const verified = documents.filter((d) => d.isVerified).length;
  const flagged = documents.filter((d) => !d.isVerified && d.verificationNote).length;
  const pending = documents.length - verified - flagged;
  const verifiedPct = documents.length
    ? Math.round((verified / TOTAL_CHECKLIST_DOCS) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header + summary count */}
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Documents</h1>
          <p className="mt-1 text-text-secondary">
            Upload, replace, or remove your documents anytime. PDF, JPG, or PNG · up to 5 MB.
          </p>
        </div>
        <span className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-semibold text-brand">
          {uploaded.size} of {TOTAL_CHECKLIST_DOCS} uploaded
        </span>
      </div>

      {/* Verification status summary */}
      {documents.length > 0 ? (
        <div className="mb-8 rounded-xl border border-border bg-surface/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-text-primary">
              {verified} of {TOTAL_CHECKLIST_DOCS} verified
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-brand/15 px-2.5 py-1 font-medium text-brand">
                {verified} verified
              </span>
              {flagged > 0 ? (
                <span className="rounded-full bg-danger/15 px-2.5 py-1 font-medium text-danger">
                  {flagged} needs attention
                </span>
              ) : null}
              <span className="rounded-full bg-surface-2 px-2.5 py-1 font-medium text-text-secondary">
                {pending} pending review
              </span>
            </div>
          </div>
          {/* Verified progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${verifiedPct}%` }}
            />
          </div>
          {flagged > 0 ? (
            <p className="mt-3 text-xs text-danger">
              Some documents need attention — see the reviewer notes below and re-upload.
            </p>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <p className="text-text-secondary">Loading…</p>
      ) : (
        <DocumentChecklist
          uploaded={uploaded}
          onUpload={uploadFile}
          onDelete={deleteDocument}
        />
      )}

      <div className="mt-10 flex gap-3">
        <Link href="/track">
          <Button variant="secondary">Track progress</Button>
        </Link>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
