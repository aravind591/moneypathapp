// Seeds a ready-to-use demo STUDENT account so you can log in directly without
// going through sign-up/OTP. Idempotent — safe to run multiple times (upsert).
//
// Run:  npm run seed:demo --workspace=apps/api
//
// Login at /login with:
//   Email:    demo@gmail.com
//   Password: demo123
//
// Note: the app's own register flow requires an 8+ char password, but this seed
// writes the hash directly, so the shorter "demo123" works for login. If you want
// to mirror the app's policy, change DEMO_PASSWORD to 8+ chars.

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@gmail.com";
const DEMO_PASSWORD = "demo123";
const DEMO_PHONE = "9000000007"; // arbitrary, unique demo phone

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const student = await prisma.student.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      passwordHash,
      phoneVerified: true,
      firstName: "Demo",
      lastName: "Student",
      fullName: "Demo Student",
      preferredCountry: "Canada",
    },
    create: {
      email: DEMO_EMAIL,
      phone: DEMO_PHONE,
      passwordHash,
      phoneVerified: true,
      firstName: "Demo",
      lastName: "Student",
      fullName: "Demo Student",
      preferredCountry: "Canada",
    },
  });

  // Give the demo student a completed onboarding profile so the dashboard looks
  // populated (not strictly required to log in).
  await prisma.studentProfile.upsert({
    where: { studentId: student.id },
    update: { completedStep: 6 },
    create: {
      studentId: student.id,
      completedStep: 6,
      nationality: "Indian",
      currentCity: "Chennai",
      homeState: "Tamil Nadu",
      educationLevel: "FINAL_YEAR_UG",
      destinationCountry: "Canada",
      intendedCourse: "M.S. Computer Science",
      intendedUniversity: "University of Toronto",
      intake: "Fall 2025",
    },
  });

  console.log("\n✅ Demo student ready. Log in at /login with:");
  console.log("   Email:    " + DEMO_EMAIL);
  console.log("   Password: " + DEMO_PASSWORD);
  console.log("   (studentId: " + student.id + ")\n");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
