// Document business logic. Files NEVER pass through this server — we hand the browser
// a short-lived signed URL and it uploads straight to Supabase storage. This keeps the
// API stateless and fast, avoids large request bodies, and means a leaked URL expires quickly.

import type { DocumentType } from "@moneypath/shared";
import { prisma } from "../config/database";
import { supabaseAdmin, DOCUMENTS_BUCKET } from "../config/supabase";

// Only these file types may be uploaded — checked before a signed URL is issued.
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

// How long an upload URL stays valid. Short window limits the damage of a leaked link.
const UPLOAD_URL_TTL_SECONDS = 10 * 60;

// A typed error so controllers can map known failures to HTTP statuses.
export class DocumentError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "DocumentError";
  }
}

// Confirms an application exists and belongs to the given student. Throws otherwise.
async function assertOwnership(applicationId: string, studentId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });
  if (!application) {
    throw new DocumentError("Application not found.", "NOT_FOUND");
  }
  if (application.studentId !== studentId) {
    throw new DocumentError("You do not own this application.", "FORBIDDEN");
  }
}

// Builds the deterministic storage path for an application-scoped document.
function buildStoragePath(
  applicationId: string,
  documentType: DocumentType,
  fileName: string
): string {
  return `applications/${applicationId}/${documentType}/${fileName}`;
}

// Builds the storage path for a student-owned document (uploaded during onboarding
// or from the Documents page, no application required).
function buildStudentStoragePath(
  studentId: string,
  documentType: DocumentType,
  fileName: string
): string {
  return `students/${studentId}/${documentType}/${fileName}`;
}

// Verifies ownership and mime type, then returns a signed URL the browser uses to
// upload the file directly to Supabase storage (the server never touches the bytes).
export async function getUploadUrl(
  applicationId: string,
  studentId: string,
  documentType: DocumentType,
  fileName: string,
  mimeType: string
): Promise<{ uploadUrl: string; storagePath: string; token: string }> {
  await assertOwnership(applicationId, studentId);

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new DocumentError(
      "Only PDF, JPG, and PNG files are allowed.",
      "INVALID_TYPE"
    );
  }

  const storagePath = buildStoragePath(applicationId, documentType, fileName);

  // createSignedUploadUrl returns a one-time token + signed path for a direct PUT/POST.
  const { data, error } = await supabaseAdmin.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    throw new DocumentError(
      "Could not generate an upload URL.",
      "STORAGE_ERROR"
    );
  }

  return {
    uploadUrl: data.signedUrl,
    storagePath: data.path,
    token: data.token,
  };
}

// Called after the browser finishes uploading directly to Supabase. Saves the
// document's metadata row (the actual bytes already live in storage).
//
// SECURITY: the storage path is re-derived server-side from the owned
// applicationId + type + fileName — never taken from the client. Otherwise a
// student could persist a Document row pointing at another user's storage folder,
// which an admin download URL would later expose (cross-tenant file disclosure).
export async function confirmUpload(
  applicationId: string,
  studentId: string,
  documentType: DocumentType,
  fileName: string,
  fileSizeBytes: number,
  mimeType: string
) {
  await assertOwnership(applicationId, studentId);

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new DocumentError(
      "Only PDF, JPG, and PNG files are allowed.",
      "INVALID_TYPE"
    );
  }

  // Rebuild the exact path getUploadUrl issued — deterministic, not client-trusted.
  const storagePath = buildStoragePath(applicationId, documentType, fileName);

  return prisma.document.create({
    data: {
      applicationId,
      type: documentType,
      storagePath,
      fileName,
      fileSizeBytes,
      mimeType,
    },
  });
}

// Returns all documents for an application. Students may only see their own;
// admins may see any application's documents.
export async function getDocumentsByApplication(
  applicationId: string,
  requesterId: string,
  requesterRole: "student" | "admin"
) {
  if (requesterRole === "student") {
    await assertOwnership(applicationId, requesterId);
  }
  // Admins skip the ownership check and can read any application's documents.

  return prisma.document.findMany({
    where: { applicationId },
    orderBy: { uploadedAt: "asc" },
  });
}

// ---------------------------------------------------------------------------
// Student-owned documents — uploading is a first-class action that does NOT
// require a loan application. Same direct-to-Supabase signed-URL flow, keyed by
// studentId instead of applicationId.
// ---------------------------------------------------------------------------

// Returns a signed URL for a student to upload a document directly to Supabase.
export async function getStudentUploadUrl(
  studentId: string,
  documentType: DocumentType,
  fileName: string,
  mimeType: string
): Promise<{ uploadUrl: string; storagePath: string; token: string }> {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new DocumentError(
      "Only PDF, JPG, and PNG files are allowed.",
      "INVALID_TYPE"
    );
  }

  const storagePath = buildStudentStoragePath(studentId, documentType, fileName);

  // upsert:true lets a re-upload of the same document type overwrite the old file.
  const { data, error } = await supabaseAdmin.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUploadUrl(storagePath, { upsert: true });

  if (error || !data) {
    throw new DocumentError("Could not generate an upload URL.", "STORAGE_ERROR");
  }

  return { uploadUrl: data.signedUrl, storagePath: data.path, token: data.token };
}

// Saves a student-owned document's metadata after the browser uploads to storage.
// If a document of the same type already exists for this student, it's replaced
// (the student is correcting/re-uploading), so the checklist stays one-per-type.
export async function confirmStudentUpload(
  studentId: string,
  documentType: DocumentType,
  fileName: string,
  fileSizeBytes: number,
  mimeType: string
) {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new DocumentError(
      "Only PDF, JPG, and PNG files are allowed.",
      "INVALID_TYPE"
    );
  }

  // SECURITY: re-derive the path from the authenticated studentId — never trust a
  // client-supplied storagePath (see confirmUpload). This is scoped to the token's
  // own student folder, so it can't point at another student's files.
  const storagePath = buildStudentStoragePath(studentId, documentType, fileName);

  // Remove any prior document of this type for this student (re-upload replaces).
  await prisma.document.deleteMany({
    where: { studentId, type: documentType },
  });

  return prisma.document.create({
    data: {
      studentId,
      type: documentType,
      storagePath,
      fileName,
      fileSizeBytes,
      mimeType,
    },
  });
}

// Returns all documents a student owns directly (uploaded outside an application).
export async function getDocumentsByStudent(studentId: string) {
  return prisma.document.findMany({
    where: { studentId },
    orderBy: { uploadedAt: "asc" },
  });
}

// Deletes one of the student's own documents (for re-upload/edit). Confirms the
// document belongs to the student, removes the storage object, then the row.
export async function deleteStudentDocument(documentId: string, studentId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });
  if (!document || document.studentId !== studentId) {
    throw new DocumentError("Document not found.", "NOT_FOUND");
  }

  // Best-effort storage cleanup — a leftover object is harmless, but try to remove it.
  await supabaseAdmin.storage.from(DOCUMENTS_BUCKET).remove([document.storagePath]);

  await prisma.document.delete({ where: { id: documentId } });
  return { id: documentId };
}

// How long an admin's download URL stays valid. 15 minute expiry means even if an
// admin accidentally shares the link, it becomes useless quickly.
const DOWNLOAD_URL_TTL_SECONDS = 15 * 60;

// Admin-only: generate a short-lived signed download URL for a document and record
// the access in the audit log. Returns the URL plus the document's metadata.
export async function getAdminDocumentUrl(documentId: string, adminId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });
  if (!document) {
    throw new DocumentError("Document not found.", "NOT_FOUND");
  }

  const { data, error } = await supabaseAdmin.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(document.storagePath, DOWNLOAD_URL_TTL_SECONDS);

  if (error || !data) {
    throw new DocumentError(
      "Could not generate a download URL.",
      "STORAGE_ERROR"
    );
  }

  // Audit every document view — who looked at what, and when.
  await prisma.auditLog.create({
    data: {
      adminId,
      action: "VIEWED_DOCUMENT",
      targetId: documentId,
      targetType: "Document",
      metadata: {
        fileName: document.fileName,
        applicationId: document.applicationId,
        studentId: document.studentId,
      },
    },
  });

  return {
    url: data.signedUrl,
    fileName: document.fileName,
    mimeType: document.mimeType,
  };
}

// Admin-only: mark a document as verified or flag it with a note. Audited.
export async function setDocumentVerification(
  documentId: string,
  adminId: string,
  isVerified: boolean,
  verificationNote?: string
) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });
  if (!document) {
    throw new DocumentError("Document not found.", "NOT_FOUND");
  }

  const updated = await prisma.document.update({
    where: { id: documentId },
    data: { isVerified, verificationNote },
  });

  await prisma.auditLog.create({
    data: {
      adminId,
      action: isVerified ? "VERIFIED_DOCUMENT" : "FLAGGED_DOCUMENT",
      targetId: documentId,
      targetType: "Document",
      metadata: { fileName: document.fileName, verificationNote },
    },
  });

  return updated;
}
