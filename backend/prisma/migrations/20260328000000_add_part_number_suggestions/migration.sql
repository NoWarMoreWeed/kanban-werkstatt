CREATE TABLE "part_number_suggestions" (
  "id" TEXT NOT NULL,
  "partNumber" TEXT NOT NULL,
  "deviceName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "part_number_suggestions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "part_number_suggestions_partNumber_key" ON "part_number_suggestions"("partNumber");
CREATE INDEX "part_number_suggestions_partNumber_idx" ON "part_number_suggestions"("partNumber");
CREATE INDEX "part_number_suggestions_deviceName_idx" ON "part_number_suggestions"("deviceName");
