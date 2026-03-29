CREATE TYPE "CardUcStatus" AS ENUM ('NOT_IN_UC', 'IN_UC');

ALTER TABLE "cards"
ADD COLUMN "ucStatus" "CardUcStatus" NOT NULL DEFAULT 'NOT_IN_UC',
ADD COLUMN "previousColumnId" TEXT;

DROP INDEX IF EXISTS "cards_columnId_position_key";

CREATE UNIQUE INDEX "cards_columnId_position_ucStatus_key" ON "cards"("columnId", "position", "ucStatus");
CREATE INDEX "cards_ucStatus_idx" ON "cards"("ucStatus");
CREATE INDEX "cards_previousColumnId_idx" ON "cards"("previousColumnId");

ALTER TABLE "cards"
ADD CONSTRAINT "cards_previousColumnId_fkey"
FOREIGN KEY ("previousColumnId") REFERENCES "columns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
