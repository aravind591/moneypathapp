-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'HOLD';

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "estimatedEmi" DOUBLE PRECISION,
ADD COLUMN     "interestRate" DOUBLE PRECISION,
ADD COLUMN     "lenderName" TEXT,
ADD COLUMN     "loanTenureMonths" INTEGER,
ADD COLUMN     "moratoriumNote" TEXT,
ADD COLUMN     "offerValidUntil" TIMESTAMP(3),
ADD COLUMN     "processingFeeAmount" DOUBLE PRECISION,
ADD COLUMN     "sanctionedAmount" DOUBLE PRECISION,
ADD COLUMN     "sanctionedAt" TIMESTAMP(3);
