import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { requireManagerMode } from "../../middleware/require-manager-mode.js";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate.js";
import { cardController } from "../../modules/cards/card.controller.js";
import {
  bulkCardActionSchema,
  cardSearchQuerySchema,
  cardParamsSchema,
  createCommentSchema,
  createCardSchema,
  moveCardSchema,
  updateCardSchema
} from "../../modules/cards/card.schemas.js";

export const cardsRouter = Router();

cardsRouter.get("/search", validateQuery(cardSearchQuerySchema), asyncHandler(cardController.searchCards));
cardsRouter.post("/", validateBody(createCardSchema), asyncHandler(cardController.createCard));
cardsRouter.post(
  "/bulk",
  requireManagerMode,
  validateBody(bulkCardActionSchema),
  asyncHandler(cardController.bulkAction)
);
cardsRouter.get(
  "/:cardId/comments",
  validateParams(cardParamsSchema),
  asyncHandler(cardController.listComments)
);
cardsRouter.post(
  "/:cardId/comments",
  validateParams(cardParamsSchema),
  validateBody(createCommentSchema),
  asyncHandler(cardController.addComment)
);
cardsRouter.put(
  "/:cardId",
  validateParams(cardParamsSchema),
  validateBody(updateCardSchema),
  asyncHandler(cardController.updateCard)
);
cardsRouter.put(
  "/:cardId/manager-correct",
  requireManagerMode,
  validateParams(cardParamsSchema),
  validateBody(updateCardSchema),
  asyncHandler(cardController.managerCorrectCard)
);
cardsRouter.patch(
  "/:cardId/move",
  validateParams(cardParamsSchema),
  validateBody(moveCardSchema),
  asyncHandler(cardController.moveCard)
);
cardsRouter.patch(
  "/:cardId/manager-move",
  requireManagerMode,
  validateParams(cardParamsSchema),
  validateBody(moveCardSchema),
  asyncHandler(cardController.moveCard)
);
cardsRouter.patch(
  "/:cardId/archive",
  validateParams(cardParamsSchema),
  asyncHandler(cardController.archiveCard)
);
cardsRouter.patch(
  "/:cardId/archive/restore",
  requireManagerMode,
  validateParams(cardParamsSchema),
  asyncHandler(cardController.restoreArchivedCard)
);
cardsRouter.delete(
  "/:cardId",
  requireManagerMode,
  validateParams(cardParamsSchema),
  asyncHandler(cardController.deleteCard)
);
cardsRouter.patch(
  "/:cardId/uc",
  validateParams(cardParamsSchema),
  asyncHandler(cardController.moveCardToUc)
);
cardsRouter.patch(
  "/:cardId/uc/remove",
  validateParams(cardParamsSchema),
  asyncHandler(cardController.removeCardFromUc)
);
