// HTTP layer for the credit assessment endpoint.

import type { Request, Response, NextFunction } from "express";
import * as creditCheckService from "../services/creditCheck.service";
import { ApplicationError } from "../services/application.service";
import { sendSuccess, sendError } from "../utils/response";
import { upsertCreditCheckSchema } from "../utils/validators";

// GET /credit-check/mine — the logged-in student's credit assessment (or null).
export async function getMyCreditCheck(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const studentId = req.user!.sub;
    const result = await creditCheckService.getCreditCheckForStudent(studentId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// PUT /admin/applications/:id/credit-check — admin creates/updates the assessment.
export async function upsertCreditCheck(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = upsertCreditCheckSchema.parse(req.body);
    const result = await creditCheckService.upsertCreditCheck(req.params.id, data);
    sendSuccess(res, result, 200, "Credit assessment saved.");
  } catch (error) {
    if (error instanceof ApplicationError) {
      sendError(res, error.code === "NOT_FOUND" ? 404 : 400, error.message, error.code);
      return;
    }
    next(error);
  }
}
