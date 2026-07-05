// Rate limiters to prevent abuse — especially OTP spam and admin login brute-force.
// Built on express-rate-limit with a REDIS-backed store, so limits are shared across
// all API instances and survive restarts/deploys (an in-memory store resets on every
// restart and doesn't work behind a load balancer). Keyed by phone where relevant,
// otherwise by IP.

import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import type { Request } from "express";
import { redis } from "../config/redis";

// Builds a fresh Redis-backed store per limiter. Each limiter needs its own store
// instance (express-rate-limit calls store.init per limiter), with a distinct key
// prefix so their counters don't collide.
function redisStore(prefix: string) {
  return new RedisStore({
    // ioredis: forward the raw command express-rate-limit needs (INCR/EXPIRE/etc.).
    // Split off the command name so ioredis's call(command, ...args) typing is happy.
    sendCommand: (command: string, ...args: string[]) =>
      redis.call(command, ...args) as Promise<never>,
    prefix,
  });
}

// OTP requests: 3 per phone per 10 minutes. Keyed by the phone in the body so one
// attacker can't exhaust the limit for everyone from a single IP.
export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore("rl:otp:"),
  keyGenerator: (req: Request) => (req.body?.phone as string) ?? req.ip ?? "unknown",
  message: {
    success: false,
    message: "Too many OTP requests. Please try again in a few minutes.",
    code: "RATE_LIMITED",
  },
});

// Admin login: 5 attempts per IP per hour to slow brute-force attempts.
export const adminLoginRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore("rl:adminlogin:"),
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
    code: "RATE_LIMITED",
  },
});

// Student email+password login: its own policy (10 attempts / IP / 15 min) so it's
// not coupled to the admin limiter. Generous enough for real users, tight enough to
// slow credential-stuffing.
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore("rl:login:"),
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
    code: "RATE_LIMITED",
  },
});

// OTP verification: 5 attempts per phone per 10 minutes. A 6-digit OTP is only
// 1-in-a-million, so without a per-phone cap an attacker could brute-force it.
// Keyed by phone so one attacker can't lock out everyone from a single IP.
export const otpVerifyRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore("rl:otpverify:"),
  keyGenerator: (req: Request) => (req.body?.phone as string) ?? req.ip ?? "unknown",
  message: {
    success: false,
    message: "Too many verification attempts. Please request a new code.",
    code: "RATE_LIMITED",
  },
});

// Global limiter applied to every route: 100 requests per 15 minutes per IP.
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore("rl:global:"),
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
    code: "RATE_LIMITED",
  },
});

// Stricter limiter on the auth routes overall: 10 requests per 15 minutes per IP.
// This sits in front of the per-action OTP/login limiters as a coarse extra guard.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: redisStore("rl:auth:"),
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
    code: "RATE_LIMITED",
  },
});
