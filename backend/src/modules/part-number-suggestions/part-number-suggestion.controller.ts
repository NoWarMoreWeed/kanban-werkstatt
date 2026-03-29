import type { Request, Response } from "express";
import type {
  CreatePartNumberSuggestionInput,
  PartNumberSuggestionQuery,
  UpdatePartNumberSuggestionInput
} from "./part-number-suggestion.schemas.js";
import { partNumberSuggestionService } from "./part-number-suggestion.service.js";

export const partNumberSuggestionController = {
  async listSuggestions(request: Request, response: Response) {
    const result = await partNumberSuggestionService.listSuggestions(
      request.query as unknown as PartNumberSuggestionQuery
    );

    response.json(result);
  },

  async createSuggestion(request: Request, response: Response) {
    const suggestion = await partNumberSuggestionService.createSuggestion(
      request.body as CreatePartNumberSuggestionInput
    );

    response.status(201).json(suggestion);
  },

  async updateSuggestion(request: Request, response: Response) {
    const suggestion = await partNumberSuggestionService.updateSuggestion(
      String(request.params.suggestionId),
      request.body as UpdatePartNumberSuggestionInput
    );

    response.json(suggestion);
  },

  async deleteSuggestion(request: Request, response: Response) {
    const suggestion = await partNumberSuggestionService.deleteSuggestion(
      String(request.params.suggestionId)
    );

    response.json(suggestion);
  }
};
