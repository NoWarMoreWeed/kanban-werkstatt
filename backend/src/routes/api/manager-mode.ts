import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { validateBody } from "../../middleware/validate.js";
import { managerModeController } from "../../modules/manager-mode/manager-mode.controller.js";
import { activateManagerModeSchema } from "../../modules/manager-mode/manager-mode.schemas.js";

export const managerModeRouter = Router();

managerModeRouter.get("/", asyncHandler(managerModeController.getStatus));
managerModeRouter.post(
  "/activate",
  validateBody(activateManagerModeSchema),
  asyncHandler(managerModeController.activate)
);
managerModeRouter.post("/deactivate", asyncHandler(managerModeController.deactivate));
