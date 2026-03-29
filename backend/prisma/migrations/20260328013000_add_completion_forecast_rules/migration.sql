CREATE TABLE "completion_forecast_rules" (
    "id" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "boardGroupName" TEXT,
    "partNumber" TEXT,
    "columnKey" TEXT NOT NULL,
    "estimatedRemainingDays" INTEGER NOT NULL,
    "blocksCompletion" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "completion_forecast_rules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "completion_forecast_rules_workshopId_columnKey_idx" ON "completion_forecast_rules"("workshopId", "columnKey");
CREATE INDEX "completion_forecast_rules_workshopId_boardGroupName_columnK_idx" ON "completion_forecast_rules"("workshopId", "boardGroupName", "columnKey");
CREATE INDEX "completion_forecast_rules_workshopId_partNumber_columnKey_idx" ON "completion_forecast_rules"("workshopId", "partNumber", "columnKey");

ALTER TABLE "completion_forecast_rules" ADD CONSTRAINT "completion_forecast_rules_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
