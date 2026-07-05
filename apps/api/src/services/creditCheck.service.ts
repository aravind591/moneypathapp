// Business logic for the credit assessment (Credit Check screen).

import { prisma } from "../config/database";
import { ApplicationError } from "./application.service";

// Returns the student's credit check with items + insights, or null if none exists.
export async function getCreditCheckForStudent(studentId: string) {
  const application = await prisma.application.findFirst({
    where: { studentId },
    select: { id: true },
  });
  if (!application) return null;

  return prisma.creditCheck.findUnique({
    where: { applicationId: application.id },
    include: { items: true, insights: true },
  });
}

// The full assessment payload an admin submits (replaces items + insights wholesale).
export interface UpsertCreditCheckInput {
  overallProgressPct: number;
  status: string;
  items: Array<{
    party: "STUDENT" | "CO_APPLICANT";
    title: string;
    detail?: string;
    state: "DONE" | "IN_PROGRESS" | "UPCOMING";
    badge?: string;
  }>;
  insights: Array<{ kind: "POSITIVE" | "ATTENTION" | "INFO"; text: string }>;
}

// Admin: create or update the credit assessment for an application. Items and insights
// are replaced wholesale (delete + recreate) so the editor is a simple "save all".
export async function upsertCreditCheck(
  applicationId: string,
  data: UpsertCreditCheckInput
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { id: true },
  });
  if (!application) {
    throw new ApplicationError("Application not found.", "NOT_FOUND");
  }

  return prisma.$transaction(async (tx) => {
    const check = await tx.creditCheck.upsert({
      where: { applicationId },
      update: { overallProgressPct: data.overallProgressPct, status: data.status },
      create: {
        applicationId,
        overallProgressPct: data.overallProgressPct,
        status: data.status,
      },
    });

    // Replace items + insights wholesale.
    await tx.creditCheckItem.deleteMany({ where: { creditCheckId: check.id } });
    await tx.creditCheckInsight.deleteMany({ where: { creditCheckId: check.id } });

    if (data.items.length > 0) {
      await tx.creditCheckItem.createMany({
        data: data.items.map((it) => ({ ...it, creditCheckId: check.id })),
      });
    }
    if (data.insights.length > 0) {
      await tx.creditCheckInsight.createMany({
        data: data.insights.map((ins) => ({ ...ins, creditCheckId: check.id })),
      });
    }

    return tx.creditCheck.findUnique({
      where: { id: check.id },
      include: { items: true, insights: true },
    });
  });
}
