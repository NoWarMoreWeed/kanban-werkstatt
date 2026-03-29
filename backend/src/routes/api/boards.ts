import { Router } from "express";
import { boardController } from "../../modules/boards/board.controller.js";
import { boardParamsSchema, createBoardSchema } from "../../modules/boards/board.schemas.js";
import { asyncHandler } from "../../middleware/async-handler.js";
import { requireBoardAdminRule } from "../../middleware/board-admin-rule.js";
import { validateBody, validateParams } from "../../middleware/validate.js";
import { cardController } from "../../modules/cards/card.controller.js";
import { boardCardsParamsSchema } from "../../modules/cards/card.schemas.js";

export const boardsRouter = Router();

boardsRouter.get("/", asyncHandler(boardController.listBoards));
boardsRouter.get(
  "/:boardId/cards",
  validateParams(boardCardsParamsSchema),
  asyncHandler(cardController.listBoardCards)
);
boardsRouter.get(
  "/:boardId",
  validateParams(boardParamsSchema),
  asyncHandler(boardController.getBoardById)
);
boardsRouter.post(
  "/",
  requireBoardAdminRule,
  validateBody(createBoardSchema),
  asyncHandler(boardController.createBoard)
);
