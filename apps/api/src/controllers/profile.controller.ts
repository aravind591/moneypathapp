// HTTP layer for the onboarding-profile wizard. Thin: validate the step body,
// call the profile service, respond. All routes run `authenticate` first, so
// req.user is the logged-in student.

import type { Request, Response, NextFunction } from "express";
import * as profileService from "../services/profile.service";
import { sendSuccess } from "../utils/response";
import {
  basicInfoSchema,
  academicSchema,
  studyDestinationSchema,
  financialSchema,
  collateralSchema,
} from "../utils/validators";

// GET /profile — the logged-in student's wizard profile (or null).
export async function getMyProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const profile = await profileService.getProfile(req.user!.sub);
    sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
}

// GET /profile/me — the logged-in student's account (name/email/phone). Powers the
// dashboard greeting and sidebar footer.
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const student = await profileService.getStudentAccount(req.user!.sub);
    sendSuccess(res, student);
  } catch (error) {
    next(error);
  }
}

// PATCH /profile/basic-info — step 1.
export async function saveBasicInfo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = basicInfoSchema.parse(req.body);
    const profile = await profileService.saveBasicInfo(req.user!.sub, data);
    sendSuccess(res, profile, 200, "Saved.");
  } catch (error) {
    next(error);
  }
}

// PATCH /profile/academic — step 2.
export async function saveAcademic(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = academicSchema.parse(req.body);
    const profile = await profileService.saveAcademic(req.user!.sub, data);
    sendSuccess(res, profile, 200, "Saved.");
  } catch (error) {
    next(error);
  }
}

// PATCH /profile/study-destination — step 3.
export async function saveStudyDestination(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = studyDestinationSchema.parse(req.body);
    const profile = await profileService.saveStudyDestination(
      req.user!.sub,
      data
    );
    sendSuccess(res, profile, 200, "Saved.");
  } catch (error) {
    next(error);
  }
}

// PATCH /profile/financial — step 4.
export async function saveFinancial(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = financialSchema.parse(req.body);
    const profile = await profileService.saveFinancial(req.user!.sub, data);
    sendSuccess(res, profile, 200, "Saved.");
  } catch (error) {
    next(error);
  }
}

// PATCH /profile/collateral — step 5.
export async function saveCollateral(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = collateralSchema.parse(req.body);
    const profile = await profileService.saveCollateral(req.user!.sub, data);
    sendSuccess(res, profile, 200, "Saved.");
  } catch (error) {
    next(error);
  }
}

// POST /profile/complete-documents — step 6 (marks the wizard finished).
export async function completeDocuments(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const profile = await profileService.completeDocumentsStep(req.user!.sub);
    sendSuccess(res, profile, 200, "Profile complete.");
  } catch (error) {
    next(error);
  }
}
