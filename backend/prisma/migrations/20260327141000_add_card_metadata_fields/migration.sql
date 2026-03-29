-- AlterTable
ALTER TABLE "cards"
ADD COLUMN "creatorName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "responsibleName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "priority" TEXT NOT NULL DEFAULT '',
ADD COLUMN "dueDate" TIMESTAMP(3);

-- Backfill
UPDATE "cards"
SET "dueDate" = CURRENT_TIMESTAMP
WHERE "dueDate" IS NULL;

-- Finalize not-null constraints
ALTER TABLE "cards"
ALTER COLUMN "dueDate" SET NOT NULL;

-- Cleanup defaults used only for migration safety
ALTER TABLE "cards"
ALTER COLUMN "creatorName" DROP DEFAULT,
ALTER COLUMN "responsibleName" DROP DEFAULT,
ALTER COLUMN "priority" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "cards_dueDate_idx" ON "cards"("dueDate");
