import { Prisma } from "@prisma/client";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateBoardInput } from "./board.schemas.js";

const boardListSelect = {
  id: true,
  workshopId: true,
  groupName: true,
  title: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.BoardSelect;

const boardDetailSelect = {
  id: true,
  workshopId: true,
  groupName: true,
  title: true,
  createdAt: true,
  updatedAt: true,
  columns: {
    where: {
      isActive: true
    },
    orderBy: {
      position: "asc"
    },
    select: {
      id: true,
      key: true,
      title: true,
      position: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  }
} satisfies Prisma.BoardSelect;

const normalizeGroupName = (value: string) => value.trim();

const getWorkshopOrThrow = async () => {
  const workshop = await prisma.workshop.findFirst({
    orderBy: {
      createdAt: "asc"
    },
    select: {
      id: true,
      name: true
    }
  });

  if (!workshop) {
    throw new AppError("Workshop is not initialized.", 500, "WORKSHOP_NOT_INITIALIZED");
  }

  return workshop;
};

const mapUniqueConstraintError = (error: unknown) => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray(error.meta?.target) &&
    error.meta.target.includes("groupName")
  ) {
    throw new AppError(
      "A board for this group already exists.",
      409,
      "BOARD_GROUP_ALREADY_EXISTS"
    );
  }

  throw error;
};

export const boardService = {
  async listBoards() {
    const workshop = await getWorkshopOrThrow();

    const boards = await prisma.board.findMany({
      where: {
        workshopId: workshop.id
      },
      orderBy: {
        groupName: "asc"
      },
      select: boardListSelect
    });

    return {
      workshop,
      boards
    };
  },

  async getBoardById(boardId: string) {
    const workshop = await getWorkshopOrThrow();

    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        workshopId: workshop.id
      },
      select: boardDetailSelect
    });

    if (!board) {
      throw new AppError("Board not found.", 404, "BOARD_NOT_FOUND");
    }

    return board;
  },

  async createBoard(input: CreateBoardInput) {
    const workshop = await getWorkshopOrThrow();

    try {
      return await prisma.board.create({
        data: {
          workshopId: workshop.id,
          groupName: normalizeGroupName(input.groupName),
          title: input.title.trim()
        },
        select: boardListSelect
      });
    } catch (error) {
      mapUniqueConstraintError(error);
    }
  }
};
