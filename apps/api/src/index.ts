// Server entry point. Boots Express, wires middleware and routes, starts listening.
// Importing env first means a missing variable crashes the process before anything else runs.

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { authRouter } from "./routes/auth.routes";
import { profileRouter } from "./routes/profile.routes";
import { applicationRouter } from "./routes/application.routes";
import { documentRouter } from "./routes/document.routes";
import { lenderRouter } from "./routes/lender.routes";
import { disbursementRouter } from "./routes/disbursement.routes";
import { feeRouter, creditCheckRouter } from "./routes/finance.routes";
import { adminRouter } from "./routes/admin.routes";
import { startNotificationWorker } from "./jobs/notification.job";
import { errorHandler } from "./middleware/errorHandler";
import { internalAccess } from "./middleware/internalAccess";
import { getLeads } from "./controllers/admin.controller";
import { sanitizeInput } from "./middleware/sanitizeInput";
import { globalRateLimiter, authRateLimiter } from "./middleware/rateLimiter";
import { sendSuccess, sendError } from "./utils/response";

const app = express();

// Trust the first proxy so client IPs (used by rate limiters) are read correctly
// behind a load balancer / reverse proxy in production.
app.set("trust proxy", 1);

// Helmet first: sets secure HTTP headers (HSTS, no-sniff, frame options, etc.) on
// every response, including errors.
app.use(helmet());

// CORS: only the configured frontend origin may call this API; reject all others.
app.use(cors({ origin: env.allowedOrigin, credentials: true }));

// Global rate limit on all routes: 100 requests / 15 min / IP.
app.use(globalRateLimiter);

// Parse JSON bodies. Files go direct to Supabase, so a small limit is plenty;
// anything larger is rejected before it reaches a handler.
app.use(express.json({ limit: "10kb" }));

// Strip HTML and trim every string in the body before it can reach a service/DB.
app.use(sanitizeInput);

// Liveness check for uptime monitors and quick manual testing.
app.get("/health", (_req, res) => {
  sendSuccess(res, { status: "ok" });
});

// Feature routes. Auth routes carry an extra, stricter coarse limiter.
app.use("/auth", authRateLimiter, authRouter);
app.use("/profile", profileRouter);
app.use("/applications", applicationRouter);
app.use("/documents", documentRouter);
app.use("/lenders", lenderRouter);
app.use("/disbursements", disbursementRouter);
app.use("/fee-payments", feeRouter);
app.use("/credit-check", creditCheckRouter);
// Internal leads endpoint — its own dual auth (API key OR SUPER_ADMIN JWT). Mounted
// before adminRouter so it does not inherit the standard authenticate+authorizeAdmin chain.
app.get("/admin/leads", internalAccess, getLeads);
app.use("/admin", adminRouter);

// 404 for any unmatched route — return the standard JSON envelope the frontend
// expects, not Express's default HTML page.
app.use((_req, res) => {
  sendError(res, 404, "Route not found.", "NOT_FOUND");
});

// Central error handler must be registered last, after all routes.
app.use(errorHandler);

// Start the background worker that delivers stage-change notifications.
startNotificationWorker();

app.listen(env.port, () => {
  logger.info(`API listening on http://localhost:${env.port} (${env.nodeEnv})`);
});
