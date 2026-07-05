// Exports a single shared PrismaClient instance (singleton pattern).
//
// Why a singleton: each PrismaClient opens its own pool of database connections.
// In dev, hot-reload can re-run this module many times; without caching the client
// on globalThis we would spawn a new pool every reload and quickly exhaust the
// database's connection limit. One instance, reused everywhere, avoids that.

import { PrismaClient } from "@prisma/client";

// Reuse the instance stashed on globalThis across hot-reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
