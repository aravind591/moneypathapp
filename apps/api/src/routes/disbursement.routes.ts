// Disbursement routes — student reads their own tranches + remittances.

import { Router } from "express";
import * as disbursementController from "../controllers/disbursement.controller";
import { authenticate } from "../middleware/authenticate";

export const disbursementRouter = Router();

disbursementRouter.use(authenticate);

disbursementRouter.get("/mine", disbursementController.getMyDisbursement);
