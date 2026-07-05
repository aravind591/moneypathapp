// Input sanitization. Recursively trims every string in the request body and strips
// any HTML tags, so stored data can never carry markup that might later be rendered
// unsafely. Runs before route handlers, after the body is parsed.

import type { Request, Response, NextFunction } from "express";
import sanitizeHtml from "sanitize-html";

// Cleans a single string: trim whitespace and remove all HTML tags/attributes.
function cleanString(value: string): string {
  return sanitizeHtml(value.trim(), {
    allowedTags: [],
    allowedAttributes: {},
  });
}

// Recursively sanitizes every string value within an object/array, in place.
function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return cleanString(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = sanitizeValue(val);
    }
    return result;
  }
  // Numbers, booleans, null, undefined pass through untouched.
  return value;
}

// Middleware: sanitize the parsed JSON body of every request.
export function sanitizeInput(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body) as Record<string, unknown>;
  }
  next();
}
