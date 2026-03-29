import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { requireManagerMode } from "../../middleware/require-manager-mode.js";
import { validateQuery } from "../../middleware/validate.js";
import { statisticsController } from "../../modules/statistics/statistics.controller.js";
import {
  statisticsForecastQuerySchema,
  statisticsProblemExportQuerySchema
} from "../../modules/statistics/statistics.schemas.js";

export const statisticsRouter = Router();

statisticsRouter.get(
  "/forecast",
  requireManagerMode,
  validateQuery(statisticsForecastQuerySchema),
  asyncHandler(statisticsController.getCompletionForecast)
);

statisticsRouter.get(
  "/problem-export",
  requireManagerMode,
  validateQuery(statisticsProblemExportQuerySchema),
  asyncHandler(statisticsController.exportProblemCards)
);
