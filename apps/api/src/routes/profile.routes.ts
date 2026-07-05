// Onboarding-profile routes. Every route requires a valid student JWT — the
// wizard only runs for a logged-in (phone-verified) student.

import { Router } from "express";
import * as profileController from "../controllers/profile.controller";
import { authenticate } from "../middleware/authenticate";

export const profileRouter = Router();

profileRouter.use(authenticate);

profileRouter.get("/", profileController.getMyProfile);
profileRouter.get("/me", profileController.getMe);
profileRouter.patch("/basic-info", profileController.saveBasicInfo);
profileRouter.patch("/academic", profileController.saveAcademic);
profileRouter.patch("/study-destination", profileController.saveStudyDestination);
profileRouter.patch("/financial", profileController.saveFinancial);
profileRouter.patch("/collateral", profileController.saveCollateral);
profileRouter.post("/complete-documents", profileController.completeDocuments);
