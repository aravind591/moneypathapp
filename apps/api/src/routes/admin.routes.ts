// Admin routes. Every route requires a valid admin JWT (authenticate + authorizeAdmin).
// Write actions additionally require a non-VIEWER role (authorizeAdminWrite).

import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import * as disbursementController from "../controllers/disbursement.controller";
import * as feeController from "../controllers/fee.controller";
import * as creditCheckController from "../controllers/creditCheck.controller";
import { authenticate } from "../middleware/authenticate";
import {
  authorizeAdmin,
  authorizeAdminWrite,
} from "../middleware/authorizeAdmin";

export const adminRouter = Router();

// All admin routes: must be authenticated AND an admin of some role.
adminRouter.use(authenticate, authorizeAdmin);

// Read endpoints — any admin role (including VIEWER) may call these.
adminRouter.get("/applications", adminController.listApplications);
adminRouter.get("/students", adminController.listStudents);
adminRouter.get("/students/:id", adminController.getStudentDetail);
adminRouter.get("/applications/:id", adminController.getApplicationDetail);
adminRouter.get("/documents/:documentId/url", adminController.getDocumentUrl);

// Write endpoints — VIEWER is blocked by authorizeAdminWrite.
adminRouter.patch(
  "/applications/:id/stage",
  authorizeAdminWrite,
  adminController.updateStage
);
adminRouter.patch(
  "/applications/:id/sanction",
  authorizeAdminWrite,
  adminController.updateSanction
);
adminRouter.post(
  "/applications/:id/disbursements",
  authorizeAdminWrite,
  disbursementController.createDisbursement
);
adminRouter.post(
  "/applications/:id/fee-payments",
  authorizeAdminWrite,
  feeController.createFeePayment
);
adminRouter.put(
  "/applications/:id/credit-check",
  authorizeAdminWrite,
  creditCheckController.upsertCreditCheck
);
adminRouter.patch(
  "/documents/:documentId/verify",
  authorizeAdminWrite,
  adminController.verifyDocument
);
