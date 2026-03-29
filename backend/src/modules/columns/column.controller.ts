import type { Request, Response } from "express";
import type {
  CreateColumnInput,
  ReorderColumnInput,
  UpdateColumnActiveInput,
  UpdateColumnInput
} from "./column.schemas.js";
import { columnService } from "./column.service.js";

export const columnController = {
  async listBoardColumns(request: Request, response: Response) {
    const result = await columnService.listBoardColumns(String(request.params.boardId));

    response.json(result);
  },

  async createColumn(request: Request, response: Response) {
    const column = await columnService.createColumn(
      String(request.params.boardId),
      request.body as CreateColumnInput
    );

    response.status(201).json(column);
  },

  async updateColumn(request: Request, response: Response) {
    const column = await columnService.updateColumn(
      String(request.params.columnId),
      request.body as UpdateColumnInput
    );

    response.json(column);
  },

  async reorderColumn(request: Request, response: Response) {
    const column = await columnService.reorderColumn(
      String(request.params.columnId),
      request.body as ReorderColumnInput
    );

    response.json(column);
  },

  async updateColumnActive(request: Request, response: Response) {
    const column = await columnService.updateColumnActive(
      String(request.params.columnId),
      request.body as UpdateColumnActiveInput
    );

    response.json(column);
  }
};
