// Business logic for processing-fee payments (Processing Fee screen).

import { prisma } from "../config/database";
import { ApplicationError } from "./application.service";

// Returns the student's fee payments + totals, or null if no application.
export async function getFeePaymentsForStudent(studentId: string) {
  const application = await prisma.application.findFirst({
    where: { studentId },
    select: { id: true, processingFeeAmount: true },
  });
  if (!application) return null;

  const payments = await prisma.feePayment.findMany({
    where: { applicationId: application.id },
    orderBy: { createdAt: "asc" },
  });

  const totalFee = application.processingFeeAmount ?? 0;
  const amountPaid = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amountRupees, 0);

  return {
    totalFee,
    amountPaid,
    remaining: Math.max(0, totalFee - amountPaid),
    percentPaid: totalFee > 0 ? (amountPaid / totalFee) * 100 : 0,
    payments,
  };
}

// Admin: record a fee payment against an application.
export async function createFeePayment(
  applicationId: string,
  data: {
    amountRupees: number;
    method?: string;
    transactionRef?: string;
    status?: "PENDING" | "PAID";
    paidAt?: Date;
  }
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { id: true },
  });
  if (!application) {
    throw new ApplicationError("Application not found.", "NOT_FOUND");
  }
  return prisma.feePayment.create({ data: { applicationId, ...data } });
}
