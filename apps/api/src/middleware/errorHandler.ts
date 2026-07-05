// Central error handler. Catches anything thrown in a route/controller and returns
// a sanitised response — never leaks stack traces or internal details to the client.

import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger";
import { sendError } from "../utils/response";

// Express recognises an error-handling middleware by its four arguments.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Validation errors are the client's fault — surface field messages with a 400.
  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    sendError(
      res,
      400,
      firstIssue?.message ?? "Invalid request data.",
      "VALIDATION_ERROR"
    );
    return;
  }

  // Oversized body from express.json — return a clean 413 instead of a generic 500.
  if (
    error &&
    typeof error === "object" &&
    (error as { type?: string }).type === "entity.too.large"
  ) {
    sendError(res, 413, "Request body too large.", "PAYLOAD_TOO_LARGE");
    return;
  }

  // Malformed JSON body — client error, return 400.
  if (error instanceof SyntaxError && "body" in (error as object)) {
    sendError(res, 400, "Invalid JSON in request body.", "INVALID_JSON");
    return;
  }

  // Everything else: log full detail internally, return a generic message outward.
  logger.error("Unhandled error", error);
  sendError(res, 500, "Something went wrong", "INTERNAL_ERROR");
}
