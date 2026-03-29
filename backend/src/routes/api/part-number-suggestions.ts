import { Router } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import { requireManagerMode } from "../../middleware/require-manager-mode.js";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate.js";
import { partNumberSuggestionController } from "../../modules/part-number-suggestions/part-number-suggestion.controller.js";
import {
  createPartNumberSuggestionSchema,
  partNumberSuggestionParamsSchema,
  partNumberSuggestionQuerySchema,
  updatePartNumberSuggestionSchema
} from "../../modules/part-number-suggestions/part-number-suggestion.schemas.js";

export const partNumberSuggestionsRouter = Router();

partNumberSuggestionsRouter.get(
  "/",
  validateQuery(partNumberSuggestionQuerySchema),
  asyncHandler(partNumberSuggestionController.listSuggestions)
);

partNumberSuggestionsRouter.post(
  "/",
  requireManagerMode,
  validateBody(createPartNumberSuggestionSchema),
  asyncHandler(partNumberSuggestionController.createSuggestion)
);

partNumberSuggestionsRouter.put(
  "/:suggestionId",
  requireManagerMode,
  validateParams(partNumberSuggestionParamsSchema),
  validateBody(updatePartNumberSuggestionSchema),
  asyncHandler(partNumberSuggestionController.updateSuggestion)
);

partNumberSuggestionsRouter.delete(
  "/:suggestionId",
  requireManagerMode,
  validateParams(partNumberSuggestionParamsSchema),
  asyncHandler(partNumberSuggestionController.deleteSuggestion)
);
