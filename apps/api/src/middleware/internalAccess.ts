// Dual authentication for the internal leads endpoint. Access is granted by EITHER:
//   1. A valid X-Internal-Api-Key header matching INTERNAL_API_KEY (machine-to-machine,
//      so other internal apps/CRMs can pull leads without a user login), OR
//   2. A normal SUPER_ADMIN JWT (a logged-in super admin using the dashboard).
// This lets the same endpoint serve both automated tools and human super admins.

import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "@moneypath/shared";
import { env } from "../config/env";
import { sendError } from "../utils/response";

// Constant-time compare so a wrong key can't be guessed via response timing.
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export function internalAccess(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Path 1: machine-to-machine via the internal API key header.
  const apiKey = req.header("X-Internal-Api-Key");
  if (apiKey) {
    if (safeEqual(apiKey, env.internalApiKey)) {
      next();
      return;
    }
    sendError(res, 401, "Invalid internal API key.", "INVALID_API_KEY");
    return;
  }

  // Path 2: a SUPER_ADMIN bearer token.
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(
        header.slice("Bearer ".length).trim(),
        env.jwtSecret
      ) as AuthTokenPayload;
      if (decoded.role === "admin" && decoded.adminRole === "SUPER_ADMIN") {
        req.user = decoded;
        next();
        return;
      }
      sendError(res, 403, "Super admin access required.", "FORBIDDEN");
      return;
    } catch {
      sendError(res, 401, "Invalid or expired token.", "INVALID_TOKEN");
      return;
    }
  }

  // Neither credential supplied.
  sendError(res, 401, "Authentication required.", "UNAUTHENTICATED");
}
