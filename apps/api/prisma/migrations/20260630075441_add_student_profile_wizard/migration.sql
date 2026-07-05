-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('COMPLETED_UG', 'FINAL_YEAR_UG', 'COMPLETED_12TH', 'WORKING_PROFESSIONAL');

-- CreateEnum
CREATE TYPE "SponsorshipType" AS ENUM ('NONE', 'PARTIAL', 'FULL');

-- CreateTable
CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "completedStep" INTEGER NOT NULL DEFAULT 0,
    "dateOfBirth" TIMESTAMP(3),
    "nationality" TEXT,
    "currentCity" TEXT,
    "homeState" TEXT,
    "educationLevel" "EducationLevel",
    "schoolRecords" JSONB,
    "ugRecords" JSONB,
    "testScores" JSONB,
    "destinationCountry" TEXT,
    "intendedCourse" TEXT,
    "intendedUniversity" TEXT,
    "intake" TEXT,
    "occupation" TEXT,
    "employerName" TEXT,
    "annualIncome" DOUBLE PRECISION,
    "netSalary" DOUBLE PRECISION,
    "yearsEmployed" TEXT,
    "contactMobile" TEXT,
    "officialEmail" TEXT,
    "existingEmiMonthly" DOUBLE PRECISION,
    "sponsorshipType" "SponsorshipType",
    "sponsorshipAmount" TEXT,
    "ownsProperty" BOOLEAN,
    "propertyAssetType" TEXT,
    "propertyType" TEXT,
    "propertyLocation" TEXT,
    "propertyMarketValue" DOUBLE PRECISION,
    "propertyRegistration" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentProfile_studentId_key" ON "StudentProfile"("studentId");

-- CreateIndex
CREATE INDEX "StudentProfile_studentId_idx" ON "StudentProfile"("studentId");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
