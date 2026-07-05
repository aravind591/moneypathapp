// Student-owned document data + upload flow. Same three-step direct-to-Supabase
// upload as useDocuments, but keyed to the logged-in student (no application
// required). Used by onboarding Step 6 and the dedicated /documents page.

"use client";

import { useCallback, useEffect, useState } from "react";
import type { DocumentType } from "@moneypath/shared";
import { api } from "@/lib/api";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/documents";

export interface DocumentRecord {
  id: string;
  type: DocumentType;
  fileName: string;
  isVerified: boolean;
  verificationNote?: string | null;
  uploadedAt: string;
}

export function useStudentDocuments() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/documents/student/mine");
      setDocuments(res.data.data ?? []);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return "Only PDF, JPG, or PNG files are allowed.";
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return "File must be under 5 MB.";
    }
    return null;
  }, []);

  // Upload (or replace) a document of the given type. Returns an error string or
  // null on success.
  const uploadFile = useCallback(
    async (
      documentType: DocumentType,
      file: File,
      onProgress?: (percent: number) => void
    ): Promise<string | null> => {
      const validationError = validateFile(file);
      if (validationError) return validationError;

      try {
        // 1) signed URL from our API.
        const urlRes = await api.post("/documents/student/upload-url", {
          documentType,
          fileName: file.name,
          mimeType: file.type,
        });
        const { uploadUrl } = urlRes.data.data;
        const { storagePath } = urlRes.data.data;

        // 2) PUT the bytes straight to Supabase.
        await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        }).then((r) => {
          if (!r.ok) throw new Error("Storage upload failed.");
        });
        onProgress?.(100);

        // 3) confirm — save metadata (replaces any prior doc of this type).
        await api.post("/documents/student/confirm", {
          storagePath,
          documentType,
          fileName: file.name,
          fileSizeBytes: file.size,
          mimeType: file.type,
        });

        await refresh();
        return null;
      } catch (error: any) {
        return (
          error.response?.data?.message ??
          error.message ??
          "Upload failed. Please try again."
        );
      }
    },
    [validateFile, refresh]
  );

  // Remove a document (for re-upload/edit).
  const deleteDocument = useCallback(
    async (documentId: string): Promise<string | null> => {
      try {
        await api.delete(`/documents/student/${documentId}`);
        await refresh();
        return null;
      } catch (error: any) {
        return error.response?.data?.message ?? "Could not delete.";
      }
    },
    [refresh]
  );

  return { documents, loading, refresh, uploadFile, validateFile, deleteDocument };
}
