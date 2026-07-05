// Exports a single shared ioredis connection used for OTP storage.
// BullMQ (Phase 5) will create its own connection from the same REDIS_URL.

import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../utils/logger";

// One reused connection — opening a new socket per request would be wasteful.
export const redis = new Redis(env.redisUrl, {
  // Required by BullMQ-style usage and safe for general commands: do not cap retries per request.
  maxRetriesPerRequest: null,
});

redis.on("error", (error) => {
  // Log connection problems but never crash the process over a transient Redis blip.
  logger.error("Redis connection error", error);
});

redis.on("connect", () => {
  logger.info("Redis connected");
});
