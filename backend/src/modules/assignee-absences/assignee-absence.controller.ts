import type { Request, Response } from "express";
import type { SetAssigneeAbsenceInput } from "./assignee-absence.schemas.js";
import { assigneeAbsenceService } from "./assignee-absence.service.js";

export const assigneeAbsenceController = {
  async listAbsences(_request: Request, response: Response) {
    const result = await assigneeAbsenceService.listAbsences();

    response.json(result);
  },

  async setAbsence(request: Request, response: Response) {
    const absence = await assigneeAbsenceService.setAbsence(
      request.body as SetAssigneeAbsenceInput
    );

    response.json({
      absence
    });
  }
};
