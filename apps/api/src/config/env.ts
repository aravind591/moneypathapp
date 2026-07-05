// Loads and validates every environment variable at startup.
// Failing fast at startup is better than failing silently in production.

import dotenv from "dotenv";

dotenv.config();

// Reads a required env var; throws immediately if it is missing or empty.
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(
      `Missing required environment variable: ${name}. Server cannot start.`
    );
  }
  return value;
}

// Reads an optional env var, falling back to a default when not set.
function optionalEnv(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : fallback;
}

// Reads an optional numeric env var, validating it parses to a finite number.
// Throws on a non-numeric value rather than silently yielding NaN.
function optionalNumberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw || raw.trim() === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(
      `Environment variable ${name} must be a number, got "${raw}".`
    );
  }
  return parsed;
}

// The single typed config object. Import from here, never from process.env directly.
export const env = {
  databaseUrl: requireEnv("DATABASE_URL"),
  jwtSecret: requireEnv("JWT_SECRET"),
  supabaseUrl: requireEnv("SUPABASE_URL"),
  supabaseServiceKey: requireEnv("SUPABASE_SERVICE_KEY"),
  redisUrl: requireEnv("REDIS_URL"),
  msg91ApiKey: requireEnv("MSG91_API_KEY"),
  msg91SenderId: optionalEnv("MSG91_SENDER_ID", "MNYPTH"),
  resendApiKey: requireEnv("RESEND_API_KEY"),
  allowedOrigin: requireEnv("ALLOWED_ORIGIN"),
  internalApiKey: requireEnv("INTERNAL_API_KEY"),
  nodeEnv: optionalEnv("NODE_ENV", "development"),
  port: optionalNumberEnv("PORT", 4000),
  // Messaging delivery mode:
  //   "dev"  — codes/messages print to the API console, no external call (default,
  //            keeps local testing free and offline).
  //   "live" — real email is sent via Resend. SMS remains a stub until a mobile
  //            provider is wired later.
  // Defaults to "dev" so a missing var never accidentally attempts real sends.
  messagingMode: optionalEnv("MESSAGING_MODE", "dev") as "dev" | "live",
  // From-address for outgoing email. Must be a Resend-verified sender in "live" mode.
  // Resend's onboarding sandbox address works out of the box for first tests.
  emailFrom: optionalEnv("EMAIL_FROM", "MoneyPath <onboarding@resend.dev>"),
} as const;

// True when running in production — used to tighten error output, logging, etc.
export const isProduction = env.nodeEnv === "production";
