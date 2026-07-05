// Document routes. All protected — a valid JWT (student or admin) is required.

import { Router } from "express";
import * as documentController from "../controllers/document.controller";
import { authenticate } from "../middleware/authenticate";

export const documentRouter = Router();

// Every document route requires authentication.
documentRouter.use(authenticate);

// Student-owned documents (no application required). Declared BEFORE the
// "/:applicationId" route so "/student/..." isn't swallowed as an application id.
documentRouter.post("/student/upload-url", documentController.getStudentUploadUrl);
documentRouter.post("/student/confirm", documentController.confirmStudentUpload);
documentRouter.get("/student/mine", documentController.getMyDocuments);
documentRouter.delete("/student/:id", documentController.deleteStudentDocument);

// Application-scoped documents (existing flow).
documentRouter.post("/upload-url", documentController.getUploadUrl);
documentRouter.post("/confirm", documentController.confirmUpload);
documentRouter.get("/:applicationId", documentController.getDocuments);
