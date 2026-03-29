import type { Request, Response } from "express";
import type { ActivateManagerModeInput } from "./manager-mode.schemas.js";
import { managerModeService } from "./manager-mode.service.js";

export const managerModeController = {
  getStatus(request: Request, response: Response) {
    response.json(managerModeService.getStatus(request.session));
  },

  activate(request: Request, response: Response) {
    const payload = request.body as ActivateManagerModeInput;
    response.json(managerModeService.activate(payload.password, request.session));
  },

  deactivate(request: Request, response: Response) {
    response.json(managerModeService.deactivate(request.session));
  }
};
