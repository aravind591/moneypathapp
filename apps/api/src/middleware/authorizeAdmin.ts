// Authorization middleware for admin routes. Runs AFTER `authenticate`, so req.user
// is already populated. Rejects non-admins, and (optionally) write actions by VIEWERs.

import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

// Requires the caller to be an admin of any role. Use on all admin routes.
export function authorizeAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== "admin") {
    sendError(res, 403, "Admin access required.", "FORBIDDEN");
    return;
  }
  next();
}

// Requires the admin to have write privileges. VIEWER is read-only, so it blocks
// any state-changing action (stage updates, verifying documents, etc.).
export function authorizeAdminWrite(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== "admin") {
    sendError(res, 403, "Admin access required.", "FORBIDDEN");
    return;
  }
  if (req.user.adminRole === "VIEWER") {
    sendError(
      res,
      403,
      "Your role has read-only access.",
      "READ_ONLY"
    );
    return;
  }
  next();
}

// Requires the SUPER_ADMIN role specifically (used by the leads API in Phase 7).
export function authorizeSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== "admin" || req.user.adminRole !== "SUPER_ADMIN") {
    sendError(res, 403, "Super admin access required.", "FORBIDDEN");
    return;
  }
  next();
}
