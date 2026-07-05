// HTTP layer for student loan applications. Thin: validate, call service, respond.
// req.user is guaranteed present here because every route runs `authenticate` first.

import type { Request, Response, NextFunction } from "express";
import * as applicationService from "../services/application.service";
import { ApplicationError } from "../services/application.service";
import { sendSuccess, sendError } from "../utils/response";
import {
  createApplicationSchema,
  updateApplicationSchema,
} from "../utils/validators";

// Maps an ApplicationError code to the right HTTP status.
function statusForCode(code: string): number {
  switch (code) {
    case "APPLICATION_EXISTS":
      return 409;
    case "NOT_FOUND":
      return 404;
    case "FORBIDDEN":
      return 403;
    default:
      return 400;
  }
}

// POST /applications — create the logged-in student's loan application.
export async function createApplication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const studentId = req.user!.sub;
    const data = createApplicationSchema.parse(req.body);
    const application = await applicationService.createApplication(studentId, data);
    sendSuccess(res, application, 201, "Application submitted.");
  } catch (error) {
    if (error instanceof ApplicationError) {
      sendError(res, statusForCode(error.code), error.message, error.code);
      return;
    }
    next(error);
  }
}

// GET /applications/mine — fetch the logged-in student's application (or null).
export async function getMyApplication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const studentId = req.user!.sub;
    const application = await applicationService.getApplicationByStudent(studentId);
    sendSuccess(res, application);
  } catch (error) {
    next(error);
  }
}

// PATCH /applications/:id — update the student's application (ownership enforced in service).
export async function updateApplication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const studentId = req.user!.sub;
    const { id } = req.params;
    const data = updateApplicationSchema.parse(req.body);
    const application = await applicationService.updateApplication(id, studentId, data);
    sendSuccess(res, application, 200, "Application updated.");
  } catch (error) {
    if (error instanceof ApplicationError) {
      sendError(res, statusForCode(error.code), error.message, error.code);
      return;
    }
    next(error);
  }
}
