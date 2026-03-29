ALTER TABLE "cards"
ADD COLUMN "completedAt" TIMESTAMP(3),
ADD COLUMN "completedYear" INTEGER,
ADD COLUMN "completedWeek" INTEGER,
ADD COLUMN "completedFromColumnKey" TEXT,
ADD COLUMN "completedFromColumnTitle" TEXT;

CREATE INDEX "cards_completedAt_idx" ON "cards"("completedAt");
CREATE INDEX "cards_completedYear_completedWeek_idx" ON "cards"("completedYear", "completedWeek");
