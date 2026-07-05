// Application routes. Every route is protected — a student must be authenticated.

import { Router } from "express";
import * as applicationController from "../controllers/application.controller";
import { authenticate } from "../middleware/authenticate";

export const applicationRouter = Router();

// All application routes require a valid student JWT.
applicationRouter.use(authenticate);

applicationRouter.post("/", applicationController.createApplication);
applicationRouter.get("/mine", applicationController.getMyApplication);
applicationRouter.patch("/:id", applicationController.updateApplication);
