-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preferredCountry" TEXT;

-- CreateIndex
CREATE INDEX "Student_email_idx" ON "Student"("email");
