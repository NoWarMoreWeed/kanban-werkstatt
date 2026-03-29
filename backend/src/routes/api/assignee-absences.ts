import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { requireManagerMode } from "../../middleware/require-manager-mode.js";
import { validateBody } from "../../middleware/validate.js";
import { assigneeAbsenceController } from "../../modules/assignee-absences/assignee-absence.controller.js";
import { setAssigneeAbsenceSchema } from "../../modules/assignee-absences/assignee-absence.schemas.js";

export const assigneeAbsencesRouter = Router();

assigneeAbsencesRouter.get("/", asyncHandler(assigneeAbsenceController.listAbsences));

assigneeAbsencesRouter.put(
  "/",
  requireManagerMode,
  validateBody(setAssigneeAbsenceSchema),
  asyncHandler(assigneeAbsenceController.setAbsence)
);
