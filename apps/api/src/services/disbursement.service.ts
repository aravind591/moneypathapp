// Business logic for disbursements and remittances. Read for the student; admin
// methods create/update tranches. Powers the Disbursement screen.

import { prisma } from "../config/database";
import { ApplicationError } from "./application.service";

// Returns the student's disbursement tranches + remittances + the sanctioned amount,
// or null if they have no application yet.
export async function getDisbursementForStudent(studentId: string) {
  const application = await prisma.application.findFirst({
    where: { studentId },
    select: { id: true, sanctionedAmount: true, loanAmount: true },
  });
  if (!application) return null;

  const [disbursements, remittances] = await Promise.all([
    prisma.disbursement.findMany({
      where: { applicationId: application.id },
      orderBy: { ordinal: "asc" },
    }),
    prisma.remittance.findMany({
      where: { applicationId: application.id },
      orderBy: { transferDate: "asc" },
    }),
  ]);

  const sanctioned = application.sanctionedAmount ?? application.loanAmount;
  const totalDisbursed = disbursements
    .filter((d) => d.status === "RELEASED")
    .reduce((sum, d) => sum + d.amountRupees, 0);

  return {
    sanctionedAmount: sanctioned,
    totalDisbursed,
    remainingBalance: sanctioned - totalDisbursed,
    percentReleased: sanctioned > 0 ? (totalDisbursed / sanctioned) * 100 : 0,
    disbursements,
    remittances,
  };
}

// Admin: create a disbursement tranche on an application.
export async function createDisbursement(
  applicationId: string,
  data: {
    ordinal: number;
    label: string;
    detail?: string;
    amountRupees: number;
    scheduledDate?: Date;
    releasedDate?: Date;
    status?: "SCHEDULED" | "RELEASED";
  }
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { id: true },
  });
  if (!application) {
    throw new ApplicationError("Application not found.", "NOT_FOUND");
  }
  return prisma.disbursement.create({ data: { applicationId, ...data } });
}
