import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { requireManagerMode } from "../../middleware/require-manager-mode.js";
import { validateBody, validateParams } from "../../middleware/validate.js";
import { columnController } from "../../modules/columns/column.controller.js";
import {
  boardColumnsParamsSchema,
  columnParamsSchema,
  createColumnSchema,
  reorderColumnSchema,
  updateColumnActiveSchema,
  updateColumnSchema
} from "../../modules/columns/column.schemas.js";

export const columnsRouter = Router();

columnsRouter.get(
  "/boards/:boardId",
  requireManagerMode,
  validateParams(boardColumnsParamsSchema),
  asyncHandler(columnController.listBoardColumns)
);

columnsRouter.post(
  "/boards/:boardId",
  requireManagerMode,
  validateParams(boardColumnsParamsSchema),
  validateBody(createColumnSchema),
  asyncHandler(columnController.createColumn)
);

columnsRouter.put(
  "/:columnId",
  requireManagerMode,
  validateParams(columnParamsSchema),
  validateBody(updateColumnSchema),
  asyncHandler(columnController.updateColumn)
);

columnsRouter.patch(
  "/:columnId/reorder",
  requireManagerMode,
  validateParams(columnParamsSchema),
  validateBody(reorderColumnSchema),
  asyncHandler(columnController.reorderColumn)
);

columnsRouter.patch(
  "/:columnId/active",
  requireManagerMode,
  validateParams(columnParamsSchema),
  validateBody(updateColumnActiveSchema),
  asyncHandler(columnController.updateColumnActive)
);
