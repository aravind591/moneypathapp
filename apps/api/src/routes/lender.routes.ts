// Lender routes. The catalogue is readable by any authenticated student; matches are
// scoped to the caller's own application.

import { Router } from "express";
import * as lenderController from "../controllers/lender.controller";
import { authenticate } from "../middleware/authenticate";

export const lenderRouter = Router();

// All lender routes require a valid student JWT.
lenderRouter.use(authenticate);

lenderRouter.get("/", lenderController.listLenders);
lenderRouter.get("/matches", lenderController.getMyMatches);
