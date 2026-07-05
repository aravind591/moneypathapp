-- One application per student: replace the plain index with a unique constraint
-- so concurrent creates can't race past the app-code duplicate check.
-- DropIndex
DROP INDEX "Application_studentId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Application_studentId_key" ON "Application"("studentId");
