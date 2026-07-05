// HTTP layer for lender endpoints. Thin: call service, respond.

import type { Request, Response, NextFunction } from "express";
import * as lenderService from "../services/lender.service";
import { sendSuccess } from "../utils/response";

// GET /lenders — the full active lender catalogue.
export async function listLenders(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const lenders = await lenderService.listLenders();
    sendSuccess(res, lenders);
  } catch (error) {
    next(error);
  }
}

// GET /lenders/matches — lenders matched to the logged-in student's application.
export async function getMyMatches(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const studentId = req.user!.sub;
    const matches = await lenderService.getLenderMatchesForStudent(studentId);
    sendSuccess(res, matches);
  } catch (error) {
    next(error);
  }
}
