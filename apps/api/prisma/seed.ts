// Seed script: creates one test admin so the admin 2FA login can be exercised locally.
// Admins are never created via public registration — this is the manual path.
//
// Run with:  npm run seed --workspace=apps/api
// It prints the TOTP secret and an otpauth:// URL. Add the secret to an authenticator
// app (Google Authenticator, Authy) to get the rotating 6-digit 2FA codes.

import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Test admin credentials — change before any real deployment.
const ADMIN_EMAIL = "admin@moneypath.local";
const ADMIN_PASSWORD = "ChangeMe123!";

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // Reuse the existing TOTP secret on re-seed so the admin's authenticator app keeps
  // working; only mint a fresh secret when creating the admin for the first time.
  const existing = await prisma.admin.findUnique({ where: { email: ADMIN_EMAIL } });
  const totpSecret = existing?.totpSecret ?? authenticator.generateSecret();

  const admin = await prisma.admin.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash, role: "SUPER_ADMIN" },
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      totpSecret,
      role: "SUPER_ADMIN",
    },
  });

  // Seed the lender catalogue (idempotent upsert by unique name). Mirrors the
  // values the Lenders / Dashboard screens were designed against.
  const lenders: Array<{
    name: string;
    interestRate: number;
    maxAmountRupees: number;
    processingFeePct: number;
    speedTier: "FAST" | "MODERATE" | "SLOW";
  }> = [
    { name: "HDFC Credila", interestRate: 10.5, maxAmountRupees: 5000000, processingFeePct: 0.04, speedTier: "FAST" },
    { name: "Avanse", interestRate: 11.25, maxAmountRupees: 4500000, processingFeePct: 1.0, speedTier: "FAST" },
    { name: "SBI Education", interestRate: 9.8, maxAmountRupees: 4000000, processingFeePct: 0.5, speedTier: "MODERATE" },
    { name: "ICICI Bank", interestRate: 10.9, maxAmountRupees: 4000000, processingFeePct: 1.0, speedTier: "MODERATE" },
    { name: "Axis Bank", interestRate: 11.5, maxAmountRupees: 3500000, processingFeePct: 1.0, speedTier: "SLOW" },
    { name: "InCred", interestRate: 12.0, maxAmountRupees: 3000000, processingFeePct: 1.5, speedTier: "FAST" },
  ];
  for (const lender of lenders) {
    await prisma.lender.upsert({
      where: { name: lender.name },
      update: lender,
      create: lender,
    });
  }
  console.log(`Seeded ${lenders.length} lenders.`);

  // otpauth:// URL that authenticator apps can import directly (or scan as QR).
  const otpauthUrl = authenticator.keyuri(ADMIN_EMAIL, "MoneyPath", totpSecret);

  console.log("\n=== Test admin seeded ===");
  console.log(`Email:        ${ADMIN_EMAIL}`);
  console.log(`Password:     ${ADMIN_PASSWORD}`);
  console.log(`Role:         ${admin.role}`);
  console.log(`TOTP secret:  ${totpSecret}`);
  console.log(`Add to authenticator app via this URL:\n  ${otpauthUrl}`);
  console.log("=========================\n");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
