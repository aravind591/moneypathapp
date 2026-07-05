// Auth routes. Wires URLs to controllers and applies rate limiting where it matters.

import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import {
  otpRateLimiter,
  otpVerifyRateLimiter,
  loginRateLimiter,
  adminLoginRateLimiter,
} from "../middleware/rateLimiter";

export const authRouter = Router();

// Student email + password flow (new multi-step sign-up).
authRouter.post("/register", otpRateLimiter, authController.register);
authRouter.post("/login", loginRateLimiter, authController.login);
authRouter.post(
  "/verify-registration",
  otpVerifyRateLimiter,
  authController.verifyRegistration
);

// Student OTP flow (still supported: registration phone-verify + login fallback).
authRouter.post("/send-otp", otpRateLimiter, authController.sendOtp);
authRouter.post("/verify-otp", otpVerifyRateLimiter, authController.verifyOtp);

// Admin login (email + password).
authRouter.post("/admin/login", adminLoginRateLimiter, authController.adminLogin);
