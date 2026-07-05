// HTTP layer for processing-fee endpoints.

import type { Request, Response, NextFunction } from "express";
import * as feeService from "../services/fee.service";
import { ApplicationError } from "../services/application.service";
import { sendSuccess, sendError } from "../utils/response";
import { createFeePaymentSchema } from "../utils/validators";

// GET /fee-payments/mine — the logged-in student's processing-fee payments + totals.
export async function getMyFeePayments(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const studentId = req.user!.sub;
    const result = await feeService.getFeePaymentsForStudent(studentId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

// POST /admin/applications/:id/fee-payments — admin records a payment.
export async function createFeePayment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = createFeePaymentSchema.parse(req.body);
    const payment = await feeService.createFeePayment(req.params.id, data);
    sendSuccess(res, payment, 201, "Fee payment recorded.");
  } catch (error) {
    if (error instanceof ApplicationError) {
      sendError(res, error.code === "NOT_FOUND" ? 404 : 400, error.message, error.code);
      return;
    }
    next(error);
  }
}
