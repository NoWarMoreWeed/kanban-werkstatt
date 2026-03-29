import type { Request, Response } from "express";
import { boardService } from "./board.service.js";
import type { CreateBoardInput } from "./board.schemas.js";

export const boardController = {
  async listBoards(_request: Request, response: Response) {
    const result = await boardService.listBoards();

    response.json(result);
  },

  async getBoardById(request: Request, response: Response) {
    const board = await boardService.getBoardById(String(request.params.boardId));

    response.json(board);
  },

  async createBoard(request: Request<unknown, unknown, CreateBoardInput>, response: Response) {
    const board = await boardService.createBoard(request.body);

    response.status(201).json(board);
  }
};
