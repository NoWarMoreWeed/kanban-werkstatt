ALTER TABLE "cards"
ADD COLUMN "statusChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "cards_statusChangedAt_idx" ON "cards"("statusChangedAt");
