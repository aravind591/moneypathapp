// Standardised API response shape so every endpoint returns the same envelope.
// The frontend can then rely on { success, message, code, data } everywhere.

import type { Response } from "express";
import type { ApiResponse } from "@moneypath/shared";

// Sends a success response with optional data payload.
export function sendSuccess<TData>(
  res: Response,
  data?: TData,
  statusCode = 200,
  message?: string
): void {
  const body: ApiResponse<TData> = { success: true, data, message };
  res.status(statusCode).json(body);
}

// Sends an error response with a machine-readable code and human message.
export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  code = "ERROR"
): void {
  const body: ApiResponse = { success: false, message, code };
  res.status(statusCode).json(body);
}
