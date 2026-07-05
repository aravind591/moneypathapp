// HTTP layer for admin operations. Thin: validate, call service, respond.
// All admin routes run `authenticate` + `authorizeAdmin` first, so req.user is an admin.

import type { Request, Response, NextFunction } from "express";
import * as applicationService from "../services/application.service";
import * as documentService from "../services/document.service";
import * as profileService from "../services/profile.service";
import { ApplicationError } from "../services/application.service";
import { DocumentError } from "../services/document.service";
import { enqueueStageNotification } from "../jobs/notification.job";
import type { NotifiableStage } from "../services/notification.service";
import { sendSuccess, sendError } from "../utils/response";
import {
  adminListQuerySchema,
  adminStudentsQuerySchema,
  updateStageSchema,
  verifyDocumentSchema,
  leadsQuerySchema,
  updateSanctionSchema,
} from "../utils/validators";

// Maps service error codes to HTTP statuses.
function statusForCode(code: string): number {
  switch (code) {
    case "NOT_FOUND":
      return 404;
    case "FORBIDDEN":
      return 403;
    case "INVALID_TRANSITION":
    case "REASON_REQUIRED":
    case "INVALID_TYPE":
      return 400;
    case "STORAGE_ERROR":
      return 502;
    default:
      return 400;
  }
}

// GET /admin/applications — paginated, filtered application queue.
export async function listApplications(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const filters = adminListQuerySchema.parse(req.query);
    const result = await applicationService.getAllApplications(filters);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// GET /admin/students — all registered students (incl. those without an application).
export async function listStudents(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const filters = adminStudentsQuerySchema.parse(req.query);
    const result = await profileService.getAllStudents(filters);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// GET /admin/students/:id — one student's account, profile, and owned documents.
export async function getStudentDetail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const student = await profileService.getStudentDetailForAdmin(req.params.id);
    if (!student) {
      sendError(res, 404, "Student not found.", "NOT_FOUND");
      return;
    }
    sendSuccess(res, student);
  } catch (error) {
    next(error);
  }
}

// GET /admin/applications/:id — full application detail.
export async function getApplicationDetail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const detail = await applicationService.getApplicationDetail(req.params.id);
    sendSuccess(res, detail);
  } catch (error) {
    if (error instanceof ApplicationError) {
      sendError(res, statusForCode(error.code), error.message, error.code);
      return;
    }
    next(error);
  }
}

// PATCH /admin/applications/:id/stage — move an application to a new stage.
export async function updateStage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.sub;
    const { newStage, note, rejectionReason } = updateStageSchema.parse(req.body);
    const result = await applicationService.updateApplicationStage(
      req.params.id,
      adminId,
      newStage,
      note,
      rejectionReason
    );
    // Enqueue a student notification asynchronously. We never notify for SUBMITTED
    // (the initial state — admins only ever advance to later stages or REJECTED).
    if (result.notification.newStage !== "SUBMITTED") {
      await enqueueStageNotification({
        studentPhone: result.notification.studentPhone,
        studentEmail: result.notification.studentEmail,
        studentName: result.notification.studentName,
        newStage: result.notification.newStage as NotifiableStage,
        applicationId: result.application.id,
      });
    }
    sendSuccess(res, result.application, 200, "Stage updated.");
  } catch (error) {
    if (error instanceof ApplicationError) {
      sendError(res, statusForCode(error.code), error.message, error.code);
      return;
    }
    next(error);
  }
}

// PATCH /admin/applications/:id/sanction — record the bank's sanction terms.
export async function updateSanction(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.sub;
    const data = updateSanctionSchema.parse(req.body);
    const application = await applicationService.updateSanctionDetails(
      req.params.id,
      adminId,
      data
    );
    sendSuccess(res, application, 200, "Sanction details updated.");
  } catch (error) {
    if (error instanceof ApplicationError) {
      sendError(res, statusForCode(error.code), error.message, error.code);
      return;
    }
    next(error);
  }
}

// GET /admin/documents/:documentId/url — short-lived signed download URL (audited).
export async function getDocumentUrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.sub;
    const result = await documentService.getAdminDocumentUrl(
      req.params.documentId,
      adminId
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

// GET /admin/leads — internal lead export for SUPER_ADMINs and internal tools.
// This endpoint is designed to be consumed by internal tools and CRMs built by the
// same team. The X-Internal-Api-Key header allows machine-to-machine access.
export async function getLeads(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = leadsQuerySchema.parse(req.query);
    const result = await applicationService.getLeads(filters);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// PATCH /admin/documents/:documentId/verify — mark verified or flag with a note.
export async function verifyDocument(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.sub;
    const { isVerified, verificationNote } = verifyDocumentSchema.parse(req.body);
    const document = await documentService.setDocumentVerification(
      req.params.documentId,
      adminId,
      isVerified,
      verificationNote
    );
    sendSuccess(res, document, 200, "Document updated.");
  } catch (error) {
    if (error instanceof DocumentError) {
      sendError(res, statusForCode(error.code), error.message, error.code);
      return;
    }
    next(error);
  }
}
