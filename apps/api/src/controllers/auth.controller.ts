// HTTP layer for auth. Controllers parse/validate input, call services, and shape
// the response. No business logic lives here — that's the service's job.

import type { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { sendSms, sendOtpEmail } from "../services/notification.service";
import { sendSuccess, sendError } from "../utils/response";
import {
  sendOtpSchema,
  verifyOtpSchema,
  adminLoginSchema,
  registerSchema,
  loginSchema,
} from "../utils/validators";

// POST /auth/send-otp — generate an OTP and deliver it to the student.
// Primary channel is email (real via Resend in "live" mode); SMS stays a stub
// so mobile OTP can be added later. In dev, the code prints to the API console.
export async function sendOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone } = sendOtpSchema.parse(req.body);
    const otp = await authService.generateOtp(phone);

    // Deliver by email when the account has one on file (the common case now).
    const email = await authService.getStudentEmailByPhone(phone);
    if (email) {
      await sendOtpEmail(email, otp, "login");
    }
    // Keep the SMS stub so phone-only (legacy) accounts still surface the code in
    // dev; becomes a real SMS once a mobile provider is wired.
    await sendSms(phone, `Your MoneyPath login code is ${otp}. Valid for 5 minutes.`);

    sendSuccess(res, undefined, 200, "OTP sent.");
  } catch (error) {
    next(error);
  }
}

// POST /auth/verify-otp — verify the OTP and return a student JWT.
export async function verifyOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, otp } = verifyOtpSchema.parse(req.body);
    const result = await authService.verifyOtp(phone, otp);
    if (!result.ok) {
      sendError(res, 401, result.reason, "OTP_INVALID");
      return;
    }
    const token = authService.createStudentJwt(result.student.id);
    sendSuccess(
      res,
      { token, student: authService.toStudentDTO(result.student) },
      200,
      "Logged in."
    );
  } catch (error) {
    next(error);
  }
}

// POST /auth/register — create a student account (email+password) and send a
// phone OTP for the verification step. Does NOT log them in yet — that happens
// after the OTP is verified.
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.registerStudent(data);
    if (!result.ok) {
      sendError(res, 409, result.reason, "ACCOUNT_EXISTS");
      return;
    }
    // Send the verification code by email (real via Resend in "live" mode; prints
    // to the console in dev). SMS stub is kept for the future mobile-OTP option.
    await sendOtpEmail(data.email, result.otp, "verify");
    await sendSms(
      data.phone,
      `Your MoneyPath verification code is ${result.otp}. Valid for 5 minutes.`
    );
    sendSuccess(res, { phone: data.phone, email: data.email }, 201, "Account created. Check your email for the verification code.");
  } catch (error) {
    next(error);
  }
}

// POST /auth/login — student email + password login, returns a student JWT.
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await authService.loginStudent(email, password);
    if (!result.ok) {
      sendError(res, 401, result.reason, "INVALID_CREDENTIALS");
      return;
    }
    sendSuccess(
      res,
      { token: result.token, student: authService.toStudentDTO(result.student) },
      200,
      "Logged in."
    );
  } catch (error) {
    next(error);
  }
}

// POST /auth/verify-registration — verify the sign-up phone OTP, mark the phone
// verified, and return the student JWT (logs them in to start the wizard).
export async function verifyRegistration(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { phone, otp } = verifyOtpSchema.parse(req.body);
    const result = await authService.verifyRegistrationOtp(phone, otp);
    if (!result.ok) {
      sendError(res, 401, result.reason, "OTP_INVALID");
      return;
    }
    sendSuccess(
      res,
      { token: result.token, student: authService.toStudentDTO(result.student) },
      200,
      "Phone verified."
    );
  } catch (error) {
    next(error);
  }
}

// POST /auth/admin/login — email + password, returns the full admin JWT.
export async function adminLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = adminLoginSchema.parse(req.body);
    const result = await authService.loginAdmin(email, password);
    if (!result.ok) {
      sendError(res, 401, result.reason, "INVALID_CREDENTIALS");
      return;
    }
    sendSuccess(res, { token: result.token, adminRole: result.adminRole }, 200, "Logged in.");
  } catch (error) {
    next(error);
  }
}
