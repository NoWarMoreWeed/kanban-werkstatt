ALTER TABLE "columns"
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "columns_boardId_isActive_idx" ON "columns"("boardId", "isActive");
