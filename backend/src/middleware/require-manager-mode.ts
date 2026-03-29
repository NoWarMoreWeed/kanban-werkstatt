import type { RequestHandler } from "express";
import { managerModeService } from "../modules/manager-mode/manager-mode.service.js";

export const requireManagerMode: RequestHandler = (request, _response, next) => {
  try {
    managerModeService.assertActive(request.session);
    next();
  } catch (error) {
    next(error);
  }
};
