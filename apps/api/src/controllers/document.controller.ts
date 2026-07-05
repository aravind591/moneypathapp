// HTTP layer for documents. Thin: validate, call service, respond.
// Every route runs `authenticate` first, so req.user is always present.

import type { Request, Response, NextFunction } from "express";
import * as documentService from "../services/document.service";
import { DocumentError } from "../services/document.service";
import { sendSuccess, sendError } from "../utils/response";
import {
  uploadUrlSchema,
  confirmUploadSchema,
  studentUploadUrlSchema,
  studentConfirmUploadSchema,
} from "../utils/validators";

// Maps a DocumentError code to the right HTTP status.
function statusForCode(code: string): number {
  switch (code) {
    case "NOT_FOUND":
      return 404;
    case "FORBIDDEN":
      return 403;
    case "INVALID_TYPE":
      return 400;
    case "STORAGE_ERROR":
      return 502;
    default:
      return 400;
  }
}

// POST /documents/upload-url — return a signed URL for a direct-to-Supabase upload.
export async function getUploadUrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const studentId = req.user!.sub;
    const { applicationId, documentType, fileName, mimeType } =
      uploadUrlSchema.parse(req.body);
    const result = await documentService.getUploadUrl(
      applicationId,
      studentId,
      documentType,
      fileName,
      mimeType
    );
    sendSuccess(res, result);
  } catch (error) {
    if (error instanceof DocumentError) {
      sendError(res, statusForCode(error.code), error.message, error.code);
      return;
    }
    next(error);
  }
}

// POST /documents/confirm — save document metadata after the file is in storage.
export async function confirmUpload(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const studentId = req.user!.sub;
    const body = confirmUploadSchema.parse(req.body);
    const document = await documentService.confirmUpload(
      body.applicationId,
      studentId,
      body.documentType,
      body.fileName,
      body.fileSizeBytes,
      body.mimeType
    );
    sendSuccess(res, document, 201, "Document saved.");
  } catch (error) {
    if (error instanceof DocumentError) {
      sendError(res, statusForCode(error.code), error.message, error.code);
      return;
    }
    next(error);
  }
}

// POST /documents/student/upload-url — signed URL for a student-owned upload.
export async function getStudentUploadUrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const studentId = req.user!.sub;
    const { documentType, fileName, mimeType } = studentUploadUrlSchema.parse(
      req.body
    );
    const result = await documentService.getStudentUploadUrl(
      studentId,
      documentType,
      fileName,
      mimeType
    );
    sendSuccess(res, result);
  } catch (error) {
    if (error instanceof DocumentError) {
      sendError(res, statusForCode(error.code), error.message, error.code);
      return;
    }
    next(error);
  }
}

// POST /documents/student/confirm — save a student-owned document's metadata.
export async function confirmStudentUpload(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const studentId = req.user!.sub;
    const body = studentConfirmUploadSchema.parse(req.body);
    const document = await documentService.confirmStudentUpload(
      studentId,
      body.documentType,
      body.fileName,
      body.fileSizeBytes,
      body.mimeType
    );
    sendSuccess(res, document, 201, "Document saved.");
  } catch (error) {
    if (error instanceof DocumentError) {
      sendError(res, statusForCode(error.code), error.message, error.code);
      return;
    }
    next(error);
  }
}

// GET /documents/student/mine — list the student's own documents.
export async function getMyDocuments(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const documents = await documentService.getDocumentsByStudent(req.user!.sub);
    sendSuccess(res, documents);
  } catch (error) {
    next(error);
  }
}

// DELETE /documents/student/:id — remove one of the student's own documents.
export async function deleteStudentDocument(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await documentService.deleteStudentDocument(
      req.params.id,
      req.user!.sub
    );
    sendSuccess(res, result, 200, "Document deleted.");
  } catch (error) {
    if (error instanceof DocumentError) {
      sendError(res, statusForCode(error.code), error.message, error.code);
      return;
    }
    next(error);
  }
}

// GET /documents/:applicationId — list documents for an application.
export async function getDocuments(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { applicationId } = req.params;
    const requesterId = req.user!.sub;
    const requesterRole = req.user!.role;
    const documents = await documentService.getDocumentsByApplication(
      applicationId,
      requesterId,
      requesterRole
    );
    sendSuccess(res, documents);
  } catch (error) {
    if (error instanceof DocumentError) {
      sendError(res, statusForCode(error.code), error.message, error.code);
      return;
    }
    next(error);
  }
}
