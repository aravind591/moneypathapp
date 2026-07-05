// HTTP layer for disbursement endpoints.

import type { Request, Response, NextFunction } from "express";
import * as disbursementService from "../services/disbursement.service";
import { ApplicationError } from "../services/application.service";
import { sendSuccess, sendError } from "../utils/response";
import { createDisbursementSchema } from "../utils/validators";

// GET /disbursements/mine — the logged-in student's tranches + remittances.
export async function getMyDisbursement(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const studentId = req.user!.sub;
    const result = await disbursementService.getDisbursementForStudent(studentId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// POST /admin/applications/:id/disbursements — admin creates a tranche.
export async function createDisbursement(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = createDisbursementSchema.parse(req.body);
    const disbursement = await disbursementService.createDisbursement(
      req.params.id,
      data
    );
    sendSuccess(res, disbursement, 201, "Disbursement created.");
  } catch (error) {
    if (error instanceof ApplicationError) {
      sendError(res, error.code === "NOT_FOUND" ? 404 : 400, error.message, error.code);
      return;
    }
    next(error);
  }
}
