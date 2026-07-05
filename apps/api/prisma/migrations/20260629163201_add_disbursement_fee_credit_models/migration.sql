-- CreateEnum
CREATE TYPE "DisbursementStatus" AS ENUM ('SCHEDULED', 'RELEASED');

-- CreateEnum
CREATE TYPE "RemittanceStatus" AS ENUM ('UPCOMING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID');

-- CreateEnum
CREATE TYPE "CreditParty" AS ENUM ('STUDENT', 'CO_APPLICANT');

-- CreateEnum
CREATE TYPE "CreditItemState" AS ENUM ('DONE', 'IN_PROGRESS', 'UPCOMING');

-- CreateEnum
CREATE TYPE "InsightKind" AS ENUM ('POSITIVE', 'ATTENTION', 'INFO');

-- CreateTable
CREATE TABLE "Disbursement" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "detail" TEXT,
    "amountRupees" DOUBLE PRECISION NOT NULL,
    "scheduledDate" TIMESTAMP(3),
    "releasedDate" TIMESTAMP(3),
    "status" "DisbursementStatus" NOT NULL DEFAULT 'SCHEDULED',

    CONSTRAINT "Disbursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Remittance" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "beneficiary" TEXT NOT NULL,
    "detail" TEXT,
    "country" TEXT,
    "currency" TEXT,
    "amountInr" DOUBLE PRECISION NOT NULL,
    "amountForeign" DOUBLE PRECISION,
    "exchangeRate" DOUBLE PRECISION,
    "transferDate" TIMESTAMP(3),
    "transactionRef" TEXT,
    "status" "RemittanceStatus" NOT NULL DEFAULT 'UPCOMING',

    CONSTRAINT "Remittance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeePayment" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "amountRupees" DOUBLE PRECISION NOT NULL,
    "method" TEXT,
    "transactionRef" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditCheck" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "overallProgressPct" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Running',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditCheckItem" (
    "id" TEXT NOT NULL,
    "creditCheckId" TEXT NOT NULL,
    "party" "CreditParty" NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "state" "CreditItemState" NOT NULL DEFAULT 'UPCOMING',
    "badge" TEXT,

    CONSTRAINT "CreditCheckItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditCheckInsight" (
    "id" TEXT NOT NULL,
    "creditCheckId" TEXT NOT NULL,
    "kind" "InsightKind" NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "CreditCheckInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Disbursement_applicationId_idx" ON "Disbursement"("applicationId");

-- CreateIndex
CREATE INDEX "Remittance_applicationId_idx" ON "Remittance"("applicationId");

-- CreateIndex
CREATE INDEX "FeePayment_applicationId_idx" ON "FeePayment"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "CreditCheck_applicationId_key" ON "CreditCheck"("applicationId");

-- CreateIndex
CREATE INDEX "CreditCheckItem_creditCheckId_idx" ON "CreditCheckItem"("creditCheckId");

-- CreateIndex
CREATE INDEX "CreditCheckInsight_creditCheckId_idx" ON "CreditCheckInsight"("creditCheckId");

-- AddForeignKey
ALTER TABLE "Disbursement" ADD CONSTRAINT "Disbursement_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Remittance" ADD CONSTRAINT "Remittance_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCheck" ADD CONSTRAINT "CreditCheck_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCheckItem" ADD CONSTRAINT "CreditCheckItem_creditCheckId_fkey" FOREIGN KEY ("creditCheckId") REFERENCES "CreditCheck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCheckInsight" ADD CONSTRAINT "CreditCheckInsight_creditCheckId_fkey" FOREIGN KEY ("creditCheckId") REFERENCES "CreditCheck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
