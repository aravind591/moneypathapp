// Notification service.
//
// Email: delivered for real via Resend when MESSAGING_MODE=live; printed to the
// console in "dev" mode so local testing needs no inbox and costs nothing.
// SMS: intentionally still a stub (logs only). Mobile OTP via a paid provider
// (MSG91/etc.) will be wired later — the signature is final so it's a drop-in.
//
// Delivery is fail-soft: a provider outage is logged but never throws, so one
// failing channel can't crash a request or block the other channel.

import { Resend } from "resend";
import { env } from "../config/env";
import { logger } from "../utils/logger";

// Single Resend client, created lazily so a missing/placeholder key in dev never
// trips at import time. Only instantiated when we actually send in "live" mode.
let resendClient: Resend | null = null;
function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(env.resendApiKey);
  }
  return resendClient;
}

// Sends an SMS. STUB for now — logs only. A failed send is swallowed (fail-soft).
// Mobile OTP is deferred: wire a real MSG91/Fast2SMS call here later.
export async function sendSms(phone: string, message: string): Promise<void> {
  try {
    // Always a stub until a mobile provider is chosen. Never throws.
    logger.info(`[SMS STUB] to ${phone}: ${message}`);
  } catch (error) {
    logger.error(`Failed to send SMS to ${phone}`, error);
  }
}

// Sends an email. Real Resend send in "live" mode; console log in "dev" mode.
// Fail-soft: a provider error is logged and swallowed, never thrown to the caller.
export async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string
): Promise<void> {
  try {
    if (env.messagingMode !== "live") {
      // Dev mode: print instead of sending so email flows can be tested offline.
      logger.info(`[EMAIL DEV] to ${to} | ${subject}`);
      return;
    }

    const { error } = await getResend().emails.send({
      from: env.emailFrom,
      to,
      subject,
      html: htmlBody,
    });

    if (error) {
      // Resend returns errors in the response body rather than throwing.
      logger.error(`Resend failed to send email to ${to}`, error);
      return;
    }
    logger.info(`[EMAIL SENT] to ${to} | ${subject}`);
  } catch (error) {
    logger.error(`Failed to send email to ${to}`, error);
  }
}

// Sends a one-time verification/login code by email. Centralises the OTP email
// template so registration, phone-verification, and OTP-login all look identical.
// In dev mode the code is also printed to the console for easy testing.
export async function sendOtpEmail(
  to: string,
  otp: string,
  purpose: "verify" | "login" = "verify"
): Promise<void> {
  const heading =
    purpose === "login" ? "Your login code" : "Verify your email";
  const subject = `MoneyPath — ${otp} is your ${purpose === "login" ? "login" : "verification"} code`;

  // In dev, surface the code prominently in the console so no inbox is needed.
  if (env.messagingMode !== "live") {
    logger.info(`[OTP DEV] ${to} → ${otp} (${purpose}) — valid 5 minutes`);
  }

  const html = `
    <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#0a0e0c;margin:0 0 8px">${heading}</h2>
      <p style="color:#444;margin:0 0 16px">Use this code to continue on MoneyPath. It expires in 5 minutes.</p>
      <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#0a0e0c;background:#f2f7f4;border-radius:12px;padding:16px 24px;text-align:center">${otp}</div>
      <p style="color:#888;font-size:13px;margin:16px 0 0">If you didn't request this, you can safely ignore this email.</p>
    </div>`;

  await sendEmail(to, subject, html);
}

// The stage a notification is about (REJECTED is a status, included here for messaging).
export type NotifiableStage =
  | "DOCUMENT_REVIEW"
  | "SENT_TO_BANK"
  | "SANCTIONED"
  | "DISBURSED"
  | "REJECTED";

// Maps each stage to a friendly student-facing message. {name} is filled per student.
function messageForStage(stage: NotifiableStage, name: string): string {
  const safeName = name || "there";
  switch (stage) {
    case "DOCUMENT_REVIEW":
      return `Hi ${safeName}, your documents are being reviewed by our team.`;
    case "SENT_TO_BANK":
      return `Great news ${safeName}! Your application has been sent to the bank.`;
    case "SANCTIONED":
      return `Congratulations ${safeName}! Your loan has been sanctioned.`;
    case "DISBURSED":
      return `Your loan has been disbursed ${safeName}. Best wishes!`;
    case "REJECTED":
      return `We are sorry ${safeName}. Your application could not be processed. Please log in to MoneyPath to see the reason and next steps.`;
  }
}

// Notifies a student about a stage change via both SMS and email. Each channel is
// fail-soft (a provider outage logs but never throws), so one failing channel does
// not block the other or the job.
export async function notifyStageChange(params: {
  studentPhone: string;
  studentEmail: string | null;
  studentName: string | null;
  newStage: NotifiableStage;
  applicationId: string;
}): Promise<void> {
  const message = messageForStage(params.newStage, params.studentName ?? "");

  // SMS always (we always have a phone).
  await sendSms(params.studentPhone, message);

  // Email only when we have one on file.
  if (params.studentEmail) {
    await sendEmail(
      params.studentEmail,
      "MoneyPath — Application Update",
      `<p>${message}</p>`
    );
  }
}
