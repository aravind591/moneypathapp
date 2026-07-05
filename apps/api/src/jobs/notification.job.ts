// BullMQ queue + worker for sending stage-change notifications asynchronously.
//
// Why a queue: a stage update should feel instant to the admin. SMS/email providers
// can be slow or briefly down, so we enqueue the notification and return immediately;
// a background worker delivers it. A slow provider never delays the admin's action.

import { Queue, Worker, type ConnectionOptions } from "bullmq";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import {
  notifyStageChange,
  type NotifiableStage,
} from "../services/notification.service";

// The data each notification job carries.
export interface NotificationJobData {
  studentPhone: string;
  studentEmail: string | null;
  studentName: string | null;
  newStage: NotifiableStage;
  applicationId: string;
}

const QUEUE_NAME = "notifications";

// Parse the REDIS_URL into connection options BullMQ can build its own client from.
// We pass options (not a pre-made ioredis instance) to avoid a version clash with the
// ioredis bundled inside BullMQ. TLS is enabled for rediss:// (Upstash) URLs.
function buildConnection(): ConnectionOptions {
  const url = new URL(env.redisUrl);
  return {
    host: url.hostname,
    port: Number(url.port) || 6379,
    username: url.username || undefined,
    password: url.password || undefined,
    // rediss:// means TLS — required by Upstash.
    tls: url.protocol === "rediss:" ? {} : undefined,
    // BullMQ requires this to be null.
    maxRetriesPerRequest: null,
  };
}

const connection = buildConnection();

// The queue admins enqueue onto when a stage changes.
export const notificationQueue = new Queue<NotificationJobData>(QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    // Retry a few times with backoff if delivery throws, then give up.
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  },
});

// Adds a stage-change notification to the queue. Returns once enqueued (fast).
export async function enqueueStageNotification(
  data: NotificationJobData
): Promise<void> {
  await notificationQueue.add("stage-change", data);
}

// Starts the worker that actually delivers notifications. Called once at server boot.
export function startNotificationWorker(): Worker<NotificationJobData> {
  const worker = new Worker<NotificationJobData>(
    QUEUE_NAME,
    async (job) => {
      // Deliver via the notification service (SMS + email, fail-soft per channel).
      await notifyStageChange(job.data);
    },
    { connection }
  );

  worker.on("completed", (job) => {
    logger.info(`Notification sent for application ${job.data.applicationId}`);
  });
  worker.on("failed", (job, err) => {
    logger.error(
      `Notification job failed for application ${job?.data.applicationId}`,
      err
    );
  });

  return worker;
}
