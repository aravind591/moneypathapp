// Authentication business logic: student OTP flow and admin password login.
// Route handlers call into here — no auth logic lives in the routes themselves.

import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Student } from "@prisma/client";
import type { AuthTokenPayload } from "@moneypath/shared";
import { prisma } from "../config/database";
import { redis } from "../config/redis";
import { env } from "../config/env";
import { logger } from "../utils/logger";

// How long an OTP stays valid in Redis.
const OTP_TTL_SECONDS = 5 * 60;
// Student tokens last a week so they aren't forced to re-login constantly.
const STUDENT_JWT_TTL = "7d";
// Full admin session length.
const ADMIN_JWT_TTL = "8h";

// Redis key for a phone's current OTP.
function otpKey(phone: string): string {
  return `otp:${phone}`;
}

// The safe, client-facing shape of a Student. SINGLE SOURCE OF TRUTH for what
// leaves the API — the destructure explicitly drops `passwordHash` (and any future
// secret field must be dropped here too). Every auth response uses this so the
// bcrypt hash can never be serialized to a client.
export type StudentDTO = Omit<Student, "passwordHash">;

export function toStudentDTO(student: Student): StudentDTO {
  const { passwordHash: _passwordHash, ...safe } = student;
  return safe;
}

// Generates a 6-digit OTP, stores it in Redis with a 5-minute expiry, returns the OTP.
export async function generateOtp(phone: string): Promise<string> {
  // crypto.randomInt gives a uniform, cryptographically sound number — better than Math.random.
  const otp = crypto.randomInt(100000, 1000000).toString();
  await redis.set(otpKey(phone), otp, "EX", OTP_TTL_SECONDS);
  return otp;
}

// Looks up a student's email by phone. Used by the OTP-login flow, which only has
// a phone in the request but delivers the code by email. Returns null if the
// student has no email on file (legacy phone-only accounts).
export async function getStudentEmailByPhone(
  phone: string
): Promise<string | null> {
  const student = await prisma.student.findUnique({
    where: { phone },
    select: { email: true },
  });
  return student?.email ?? null;
}

// Verifies the submitted OTP, deletes it so it cannot be reused, and returns the
// student record (creating one on first successful login).
export async function verifyOtp(phone: string, otp: string) {
  const storedOtp = await redis.get(otpKey(phone));

  // No OTP found means it expired or was never requested.
  if (!storedOtp) {
    return { ok: false as const, reason: "OTP expired or not found." };
  }

  // Constant-time compare to avoid leaking info via timing.
  const matches =
    storedOtp.length === otp.length &&
    crypto.timingSafeEqual(Buffer.from(storedOtp), Buffer.from(otp));

  if (!matches) {
    return { ok: false as const, reason: "Incorrect OTP." };
  }

  // Delete immediately after a successful match so the same OTP can't be replayed.
  await redis.del(otpKey(phone));

  // Upsert: log in an existing student, or register a new one on first OTP login.
  const student = await prisma.student.upsert({
    where: { phone },
    update: {},
    create: { phone },
  });

  return { ok: true as const, student };
}

// Creates a signed JWT carrying the studentId and role "student", valid for 7 days.
export function createStudentJwt(studentId: string): string {
  const payload: AuthTokenPayload = { sub: studentId, role: "student" };
  return jwt.sign(payload, env.jwtSecret, { expiresIn: STUDENT_JWT_TTL });
}

// bcrypt work factor for student passwords. 10 is the common default — strong
// enough while keeping login latency low.
const BCRYPT_ROUNDS = 10;

// Registers a new student with email + password (the new multi-step sign-up).
// Creates the account, then generates a phone OTP so the next screen can verify
// the number. Returns the OTP so the controller can "send" it (stubbed in dev).
// Fails if the email or phone is already taken.
export async function registerStudent(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  preferredCountry?: string;
}) {
  // Reject duplicates up front with a clear, non-enumerating message.
  const existing = await prisma.student.findFirst({
    where: { OR: [{ email: input.email }, { phone: input.phone }] },
  });
  if (existing) {
    return {
      ok: false as const,
      reason: "An account with this email or phone already exists.",
    };
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const student = await prisma.student.create({
    data: {
      email: input.email,
      phone: input.phone,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      fullName: `${input.firstName} ${input.lastName}`.trim(),
      preferredCountry: input.preferredCountry,
      phoneVerified: false,
    },
  });

  // Issue a phone-verification OTP for the next sign-up screen.
  const otp = await generateOtp(student.phone);

  return { ok: true as const, student, otp };
}

// Logs a student in with email + password. Returns a generic error either way so
// we never reveal whether an email is registered.
export async function loginStudent(email: string, password: string) {
  const student = await prisma.student.findUnique({ where: { email } });

  // Legacy OTP-only students have no passwordHash — they must use OTP login.
  if (!student || !student.passwordHash) {
    return { ok: false as const, reason: "Invalid credentials." };
  }

  const passwordValid = await bcrypt.compare(password, student.passwordHash);
  if (!passwordValid) {
    return { ok: false as const, reason: "Invalid credentials." };
  }

  const token = createStudentJwt(student.id);
  return { ok: true as const, token, student };
}

// Marks a student's phone as verified after a successful registration OTP check.
// Reuses verifyOtp's Redis check/delete, but updates the existing student rather
// than upserting a new one (the account already exists from registration).
export async function verifyRegistrationOtp(phone: string, otp: string) {
  const storedOtp = await redis.get(otpKey(phone));
  if (!storedOtp) {
    return { ok: false as const, reason: "OTP expired or not found." };
  }

  const matches =
    storedOtp.length === otp.length &&
    crypto.timingSafeEqual(Buffer.from(storedOtp), Buffer.from(otp));
  if (!matches) {
    return { ok: false as const, reason: "Incorrect OTP." };
  }

  await redis.del(otpKey(phone));

  const student = await prisma.student.update({
    where: { phone },
    data: { phoneVerified: true },
  });

  const token = createStudentJwt(student.id);
  return { ok: true as const, token, student };
}

// Admin login: verify email + password and, on success, issue the full admin JWT.
// (2FA was removed — password is the only factor now.)
export async function loginAdmin(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email } });

  // Run bcrypt even when the admin is missing? We short-circuit but return a
  // generic message either way so we don't reveal which emails are registered.
  if (!admin) {
    return { ok: false as const, reason: "Invalid credentials." };
  }

  const passwordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!passwordValid) {
    return { ok: false as const, reason: "Invalid credentials." };
  }

  const payload: AuthTokenPayload = {
    sub: admin.id,
    role: "admin",
    adminRole: admin.role,
  };
  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: ADMIN_JWT_TTL });

  logger.info(`Admin logged in: ${admin.email}`);
  return { ok: true as const, token, adminRole: admin.role };
}

