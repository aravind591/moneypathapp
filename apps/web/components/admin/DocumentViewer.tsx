// Admin document card: shows the file, opens a freshly-signed URL in a new tab on
// view/download, and lets the admin mark it verified or flag it. The signed URL is
// never stored in state longer than the click — each action fetches it fresh.

"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";

interface DocumentViewerProps {
  document: {
    id: string;
    type: string;
    fileName: string;
    isVerified: boolean;
    verificationNote?: string | null;
  };
  // Notifies the parent to refresh after a verification change.
  onChanged: () => void;
}

export function DocumentViewer({ document, onChanged }: DocumentViewerProps) {
  const { getDocumentUrl, verifyDocument } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [flagNote, setFlagNote] = useState("");
  const [showFlag, setShowFlag] = useState(false);

  // Fetch a fresh signed URL and open it in a new tab.
  async function handleView() {
    setBusy(true);
    try {
      const { url } = await getDocumentUrl(document.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setBusy(false);
    }
  }

  // Mark the document verified.
  async function handleVerify() {
    setBusy(true);
    try {
      await verifyDocument(document.id, true);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  // Flag the document with a note (not verified).
  async function handleFlag() {
    setBusy(true);
    try {
      await verifyDocument(document.id, false, flagNote);
      setShowFlag(false);
      setFlagNote("");
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-base p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {document.type.replace(/_/g, " ")}
        </span>
        {document.isVerified ? (
          <span className="text-xs font-semibold text-brand">Verified</span>
        ) : document.verificationNote ? (
          <span className="text-xs font-semibold text-danger">Flagged</span>
        ) : (
          <span className="text-xs font-semibold text-text-secondary">Pending</span>
        )}
      </div>
      <p className="truncate text-xs text-text-secondary">{document.fileName}</p>

      {document.verificationNote ? (
        <p className="text-xs text-danger">Note: {document.verificationNote}</p>
      ) : null}

      <div className="mt-1 flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={handleView} disabled={busy}>
          View / Download
        </Button>
        {!document.isVerified ? (
          <Button size="sm" onClick={handleVerify} disabled={busy}>
            Mark verified
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowFlag((s) => !s)}
          disabled={busy}
        >
          Flag
        </Button>
      </div>

      {showFlag ? (
        <div className="mt-2 flex gap-2">
          <input
            value={flagNote}
            onChange={(e) => setFlagNote(e.target.value)}
            placeholder="Reason for flagging…"
            className="h-9 flex-1 rounded-lg border border-border bg-base px-3 text-xs"
          />
          <Button size="sm" onClick={handleFlag} disabled={busy || !flagNote}>
            Save
          </Button>
        </div>
      ) : null}
    </div>
  );
}
