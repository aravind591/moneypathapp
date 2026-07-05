// Document data + upload flow. Handles the three-step direct-to-Supabase upload:
// 1) ask our API for a signed URL, 2) PUT the file straight to Supabase, 3) tell our
// API to save the metadata. The file bytes never pass through our own server.

"use client";

import { useCallback, useEffect, useState } from "react";
import type { DocumentType } from "@moneypath/shared";
import { api } from "@/lib/api";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/documents";

// A stored document as returned by the API.
export interface DocumentRecord {
  id: string;
  type: DocumentType;
  fileName: string;
  isVerified: boolean;
  uploadedAt: string;
}

export function useDocuments(applicationId: string | undefined) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load the application's documents.
  const refresh = useCallback(async () => {
    if (!applicationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/documents/${applicationId}`);
      setDocuments(res.data.data ?? []);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Validate a file against type and size before any network call.
  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return "Only PDF, JPG, or PNG files are allowed.";
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return "File must be under 5 MB.";
    }
    return null;
  }, []);

  // Full upload flow for a single file. Returns an error message or null on success.
  const uploadFile = useCallback(
    async (
      documentType: DocumentType,
      file: File,
      onProgress?: (percent: number) => void
    ): Promise<string | null> => {
      if (!applicationId) return "No application found.";

      const validationError = validateFile(file);
      if (validationError) return validationError;

      try {
        // Step 1: get a signed upload URL from our API.
        const urlRes = await api.post("/documents/upload-url", {
          applicationId,
          documentType,
          fileName: file.name,
          mimeType: file.type,
        });
        const { uploadUrl, storagePath } = urlRes.data.data;

        // Step 2: upload the file bytes directly to Supabase (not our server).
        await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        }).then((r) => {
          if (!r.ok) throw new Error("Storage upload failed.");
        });
        onProgress?.(100);

        // Step 3: confirm — save the metadata row in our database.
        await api.post("/documents/confirm", {
          applicationId,
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
    [applicationId, validateFile, refresh]
  );

  return { documents, loading, refresh, uploadFile, validateFile };
}
