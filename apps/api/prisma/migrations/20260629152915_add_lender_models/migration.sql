-- CreateEnum
CREATE TYPE "SpeedTier" AS ENUM ('FAST', 'MODERATE', 'SLOW');

-- CreateTable
CREATE TABLE "Lender" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL,
    "maxAmountRupees" DOUBLE PRECISION NOT NULL,
    "processingFeePct" DOUBLE PRECISION NOT NULL,
    "speedTier" "SpeedTier" NOT NULL DEFAULT 'MODERATE',
    "logoUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationLenderMatch" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "lenderId" TEXT NOT NULL,
    "matchPercent" INTEGER NOT NULL,

    CONSTRAINT "ApplicationLenderMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lender_name_key" ON "Lender"("name");

-- CreateIndex
CREATE INDEX "ApplicationLenderMatch_applicationId_idx" ON "ApplicationLenderMatch"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationLenderMatch_applicationId_lenderId_key" ON "ApplicationLenderMatch"("applicationId", "lenderId");

-- AddForeignKey
ALTER TABLE "ApplicationLenderMatch" ADD CONSTRAINT "ApplicationLenderMatch_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationLenderMatch" ADD CONSTRAINT "ApplicationLenderMatch_lenderId_fkey" FOREIGN KEY ("lenderId") REFERENCES "Lender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
