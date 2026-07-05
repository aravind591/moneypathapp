// Step 6 — Documents ("Sign up Flow" upload sections). REAL uploads now: files go
// straight to Supabase and attach to the student (no application needed). Grouped
// Identity / Academic / Financial per the mockup. Finishing marks the wizard done.

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { DocumentType } from "@moneypath/shared";
import { useProfile } from "@/hooks/useProfile";
import { useStudentDocuments } from "@/hooks/useStudentDocuments";
import { WizardHeader } from "@/components/onboarding/WizardHeader";
import { DocumentChecklist, type UploadedDoc } from "@/components/documents/DocumentChecklist";
import { TOTAL_CHECKLIST_DOCS } from "@/lib/documents";
import { Button } from "@/components/ui/button";

export default function DocumentsStep() {
  const router = useRouter();
  const { completeDocuments } = useProfile();
  const { documents, uploadFile, deleteDocument } = useStudentDocuments();
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // type -> uploaded record, for the checklist.
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

  async function handleFinish() {
    setError(null);
    setFinishing(true);
    const res = await completeDocuments();
    setFinishing(false);
    if (res.ok) router.push("/dashboard");
    else setError(res.message);
  }

  return (
    <>
      <WizardHeader
        step={6}
        title="Documents"
        subtitle="Upload your documents to complete your profile. You can replace or add more anytime from your dashboard."
      />

      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-text-secondary">Upload & Verify</p>
        <span className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-semibold text-brand">
          {uploaded.size} of {TOTAL_CHECKLIST_DOCS} uploaded
        </span>
      </div>

      <DocumentChecklist
        uploaded={uploaded}
        onUpload={uploadFile}
        onDelete={deleteDocument}
      />

      {error ? <p className="mt-4 text-center text-sm text-danger">{error}</p> : null}

      <Button
        type="button"
        size="lg"
        disabled={finishing}
        className="mt-6 w-full"
        onClick={handleFinish}
      >
        {finishing ? "Finishing…" : "Finish & Go to Dashboard"}
      </Button>
    </>
  );
}
