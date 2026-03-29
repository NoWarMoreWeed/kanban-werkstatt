import type { Request, Response } from "express";
import type {
  BulkCardActionInput,
  CardSearchQuery,
  CreateCardInput,
  MoveCardInput,
  UpdateCardInput,
  CreateCommentInput
} from "./card.schemas.js";
import { cardService } from "./card.service.js";

export const cardController = {
  async searchCards(request: Request, response: Response) {
    const result = await cardService.searchBoardCards(request.query as unknown as CardSearchQuery);

    response.json(result);
  },

  async listBoardCards(request: Request, response: Response) {
    const result = await cardService.listBoardCards(String(request.params.boardId));

    response.json(result);
  },

  async createCard(request: Request, response: Response) {
    const card = await cardService.createCard(request.body as CreateCardInput);

    response.status(201).json(card);
  },

  async bulkAction(request: Request, response: Response) {
    const result = await cardService.bulkAction(request.body as BulkCardActionInput);

    response.json(result);
  },

  async updateCard(request: Request, response: Response) {
    const card = await cardService.updateCard(
      String(request.params.cardId),
      request.body as UpdateCardInput
    );

    response.json(card);
  },

  async managerCorrectCard(request: Request, response: Response) {
    const card = await cardService.managerCorrectCard(
      String(request.params.cardId),
      request.body as UpdateCardInput
    );

    response.json(card);
  },

  async moveCard(request: Request, response: Response) {
    const card = await cardService.moveCard(
      String(request.params.cardId),
      request.body as MoveCardInput
    );

    response.json(card);
  },

  async archiveCard(request: Request, response: Response) {
    const card = await cardService.archiveCard(String(request.params.cardId));

    response.json(card);
  },

  async restoreArchivedCard(request: Request, response: Response) {
    const card = await cardService.restoreArchivedCard(String(request.params.cardId));

    response.json(card);
  },

  async deleteCard(request: Request, response: Response) {
    const card = await cardService.deleteCard(String(request.params.cardId));

    response.json(card);
  },

  async moveCardToUc(request: Request, response: Response) {
    const card = await cardService.moveCardToUc(String(request.params.cardId));

    response.json(card);
  },

  async removeCardFromUc(request: Request, response: Response) {
    const card = await cardService.removeCardFromUc(String(request.params.cardId));

    response.json(card);
  },

  async listComments(request: Request, response: Response) {
    const result = await cardService.listComments(String(request.params.cardId));

    response.json(result);
  },

  async addComment(request: Request, response: Response) {
    const comment = await cardService.addComment(
      String(request.params.cardId),
      request.body as CreateCommentInput
    );

    response.status(201).json(comment);
  }
};
