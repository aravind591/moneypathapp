// Document checklist matching the sign-up mockups: groups (Identity / Academic /
// Financial), each row a checkbox + label + hint + an "Upload" pill. After upload
// the row shows "Uploaded · filename" with a filled check and a Replace/Remove
// action. Drives the real student-owned upload flow (no application needed).

"use client";

import { useRef, useState } from "react";
import { Check, UploadCloud, X } from "lucide-react";
import type { DocumentType } from "@moneypath/shared";
import { cn } from "@/lib/utils";
import { DOC_CHECKLIST } from "@/lib/documents";

export interface UploadedDoc {
  id: string;
  fileName: string;
  isVerified: boolean;
  verificationNote?: string | null;
}

interface DocumentChecklistProps {
  // Map of document type -> uploaded record (present = uploaded).
  uploaded: Map<DocumentType, UploadedDoc>;
  onUpload: (type: DocumentType, file: File) => Promise<string | null>;
  onDelete?: (documentId: string) => Promise<string | null>;
}

export function DocumentChecklist({
  uploaded,
  onUpload,
  onDelete,
}: DocumentChecklistProps) {
  return (
    <div className="flex flex-col gap-6">
      {DOC_CHECKLIST.map((group) => (
        <section
          key={group.title}
          className="rounded-2xl border border-border bg-surface/60 p-6"
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {group.title}
          </p>
          <div className="divide-y divide-border/60">
            {group.items.map((item) => (
              <DocRow
                key={item.type}
                type={item.type}
                label={item.label}
                hint={item.hint}
                doc={uploaded.get(item.type)}
                onUpload={onUpload}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function DocRow({
  type,
  label,
  hint,
  doc,
  onUpload,
  onDelete,
}: {
  type: DocumentType;
  label: string;
  hint: string;
  doc?: UploadedDoc;
  onUpload: (type: DocumentType, file: File) => Promise<string | null>;
  onDelete?: (documentId: string) => Promise<string | null>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isUploaded = !!doc;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setError(null);
    setBusy(true);
    const err = await onUpload(type, file);
    setBusy(false);
    if (err) setError(err);
  }

  async function handleRemove() {
    if (!doc || !onDelete) return;
    setBusy(true);
    await onDelete(doc.id);
    setBusy(false);
  }

  // Review state from the admin: verified (green), flagged (has a note, danger),
  // or pending review (uploaded but neither). Drives the badge + checkbox colour.
  const isFlagged = isUploaded && !doc!.isVerified && !!doc!.verificationNote;
  const isVerified = isUploaded && doc!.isVerified;

  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded border",
            isVerified
              ? "border-brand bg-brand text-black"
              : isFlagged
              ? "border-danger text-danger"
              : isUploaded
              ? "border-brand/60 text-brand"
              : "border-border"
          )}
        >
          {isVerified ? <Check size={13} strokeWidth={3} /> : null}
          {isFlagged ? <X size={13} strokeWidth={3} /> : null}
        </span>
        <div>
          <p className="text-sm font-medium text-text-primary">{label}</p>
          <p className="text-xs text-text-secondary">
            {isUploaded ? (
              <>
                Uploaded · {doc!.fileName}
                {isVerified ? (
                  <span className="ml-1 font-medium text-brand">· Verified</span>
                ) : isFlagged ? (
                  <span className="ml-1 font-medium text-danger">· Needs attention</span>
                ) : (
                  <span className="ml-1 text-text-secondary">· Pending review</span>
                )}
              </>
            ) : (
              hint
            )}
          </p>
          {isFlagged ? (
            <p className="mt-0.5 text-xs text-danger">Reviewer note: {doc!.verificationNote}</p>
          ) : null}
          {error ? <p className="mt-0.5 text-xs text-danger">{error}</p> : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
            isUploaded
              ? "border border-border text-text-secondary hover:text-text-primary"
              : "bg-brand/15 text-brand hover:bg-brand/25"
          )}
        >
          <UploadCloud size={14} />
          {busy ? "Uploading…" : isUploaded ? "Replace" : "Upload"}
        </button>
        {isUploaded && onDelete ? (
          <button
            type="button"
            onClick={handleRemove}
            disabled={busy}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-secondary hover:text-danger disabled:opacity-50"
            aria-label="Remove document"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
