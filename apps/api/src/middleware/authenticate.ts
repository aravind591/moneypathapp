// Verifies the JWT on every protected route and attaches the decoded payload to req.user.
// Any route that touches data must run this first.

import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthTokenPayload } from "@moneypath/shared";
import { env } from "../config/env";
import { sendError } from "../utils/response";

// Augment Express's Request so downstream handlers can read req.user with full typing.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

// Middleware: read the Authorization header, verify the token, populate req.user.
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Step 1: pull the bearer token out of the Authorization header.
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    sendError(res, 401, "Authentication required.", "UNAUTHENTICATED");
    return;
  }
  const token = header.slice("Bearer ".length).trim();

  // Step 2: verify the signature and expiry. Any failure means reject with 401.
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
    // Step 3: attach the verified identity for downstream handlers to use.
    req.user = decoded;
    next();
  } catch {
    sendError(res, 401, "Invalid or expired token.", "INVALID_TOKEN");
  }
}
