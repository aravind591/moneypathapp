// Student finance read routes: processing-fee payments and credit assessment.

import { Router } from "express";
import * as feeController from "../controllers/fee.controller";
import * as creditCheckController from "../controllers/creditCheck.controller";
import { authenticate } from "../middleware/authenticate";

export const feeRouter = Router();
feeRouter.use(authenticate);
feeRouter.get("/mine", feeController.getMyFeePayments);

export const creditCheckRouter = Router();
creditCheckRouter.use(authenticate);
creditCheckRouter.get("/mine", creditCheckController.getMyCreditCheck);
