// A single checklist row: shows the document name, current status, and a drag-and-drop
// upload zone when not yet uploaded. Validates type/size before starting the upload.

"use client";

import { useRef, useState } from "react";
import type { DocumentType } from "@moneypath/shared";

interface DocumentUploaderProps {
  label: string;
  documentType: DocumentType;
  // Status of this document, derived from the fetched list.
  status: "not_uploaded" | "uploaded" | "verified";
  // Performs the actual upload; returns an error message or null on success.
  onUpload: (
    documentType: DocumentType,
    file: File
  ) => Promise<string | null>;
}

export function DocumentUploader({
  label,
  documentType,
  status,
  onUpload,
}: DocumentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Shared handler for both the file picker and a dropped file.
  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    const result = await onUpload(documentType, file);
    setUploading(false);
    if (result) setError(result);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  // A coloured status pill, matching the mockup's Done/Active styling.
  const statusPill = {
    not_uploaded: { text: "Not uploaded", className: "text-text-secondary" },
    uploaded: { text: "Uploaded", className: "text-info" },
    verified: { text: "Verified", className: "text-brand" },
  }[status];

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-base p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <span className={`text-xs font-semibold ${statusPill.className}`}>
          {statusPill.text}
        </span>
      </div>

      {/* Once uploaded, hide the dropzone; allow re-upload via a small link. */}
      {status === "not_uploaded" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer items-center justify-center rounded-lg border border-dashed px-4 py-3 text-xs transition-colors ${
            dragActive
              ? "border-brand bg-brand/10 text-brand"
              : "border-border text-text-secondary hover:border-brand/50"
          }`}
        >
          {uploading
            ? "Uploading…"
            : "Drag a file here or click to upload (PDF/JPG/PNG, max 5 MB)"}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={onInputChange}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="self-start text-xs text-text-secondary underline hover:text-text-primary"
        >
          Replace file
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={onInputChange}
          />
        </button>
      )}

      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
