// Business logic for lenders. Read-only for now — the lender catalogue is seeded
// and (later) managed by admins. Powers the Lenders page and the Dashboard's
// "Top Matched Lenders" table.

import { prisma } from "../config/database";

// All active lenders, best rate first.
export async function listLenders() {
  return prisma.lender.findMany({
    where: { active: true },
    orderBy: { interestRate: "asc" },
  });
}

// The lenders matched to a student's application, with match scores, best match
// first. Falls back to an empty list if the application has no matches yet.
export async function getLenderMatchesForStudent(studentId: string) {
  const application = await prisma.application.findFirst({
    where: { studentId },
    select: { id: true },
  });
  if (!application) return [];

  const matches = await prisma.applicationLenderMatch.findMany({
    where: { applicationId: application.id },
    orderBy: { matchPercent: "desc" },
    include: { lender: true },
  });

  return matches.map((m) => ({
    matchPercent: m.matchPercent,
    name: m.lender.name,
    interestRate: m.lender.interestRate,
    maxAmountRupees: m.lender.maxAmountRupees,
    processingFeePct: m.lender.processingFeePct,
    speedTier: m.lender.speedTier,
    logoUrl: m.lender.logoUrl,
  }));
}
