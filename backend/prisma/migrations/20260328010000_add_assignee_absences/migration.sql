CREATE TABLE "assignee_absences" (
    "id" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "responsibleName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignee_absences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "assignee_absences_responsibleName_key" ON "assignee_absences"("responsibleName");
CREATE INDEX "assignee_absences_workshopId_idx" ON "assignee_absences"("workshopId");
CREATE INDEX "assignee_absences_responsibleName_idx" ON "assignee_absences"("responsibleName");

ALTER TABLE "assignee_absences" ADD CONSTRAINT "assignee_absences_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
