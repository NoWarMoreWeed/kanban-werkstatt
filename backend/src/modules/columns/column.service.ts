import { Prisma } from "@prisma/client";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import type {
  CreateColumnInput,
  ReorderColumnInput,
  UpdateColumnActiveInput,
  UpdateColumnInput
} from "./column.schemas.js";

const columnManagerSelect = {
  id: true,
  boardId: true,
  key: true,
  title: true,
  position: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      cards: true,
      previousCards: true
    }
  }
} satisfies Prisma.ColumnSelect;

const getBoardOrThrow = async (boardId: string) => {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: {
      id: true,
      title: true,
      groupName: true
    }
  });

  if (!board) {
    throw new AppError("Board not found.", 404, "BOARD_NOT_FOUND");
  }

  return board;
};

const getColumnOrThrow = async (columnId: string) => {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    select: columnManagerSelect
  });

  if (!column) {
    throw new AppError("Column not found.", 404, "COLUMN_NOT_FOUND");
  }

  return column;
};

const mapColumn = (
  column: Prisma.ColumnGetPayload<{
    select: typeof columnManagerSelect;
  }>
) => ({
  id: column.id,
  boardId: column.boardId,
  key: column.key,
  title: column.title,
  position: column.position,
  isActive: column.isActive,
  createdAt: column.createdAt,
  updatedAt: column.updatedAt,
  cardCount: column._count.cards,
  previousCardCount: column._count.previousCards,
  canDeactivate:
    column.isActive &&
    column.key !== "eingang" &&
    column._count.cards === 0 &&
    column._count.previousCards === 0
});

const createColumnKeyBase = (value: string) => {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || "spalte";
};

const createUniqueColumnKey = async (boardId: string, title: string) => {
  const baseKey = createColumnKeyBase(title);
  let nextKey = baseKey;
  let suffix = 2;

  while (true) {
    const existingColumn = await prisma.column.findFirst({
      where: {
        boardId,
        key: nextKey
      },
      select: {
        id: true
      }
    });

    if (!existingColumn) {
      return nextKey;
    }

    nextKey = `${baseKey}_${suffix}`;
    suffix += 1;
  }
};

const compactColumnPositions = async (tx: Prisma.TransactionClient, boardId: string) => {
  const columns = await tx.column.findMany({
    where: { boardId },
    orderBy: {
      position: "asc"
    },
    select: {
      id: true
    }
  });

  for (const [index, column] of columns.entries()) {
    await tx.column.update({
      where: { id: column.id },
      data: {
        position: index + 1
      }
    });
  }
};

export const columnService = {
  async listBoardColumns(boardId: string) {
    const board = await getBoardOrThrow(boardId);

    const columns = await prisma.column.findMany({
      where: { boardId },
      orderBy: {
        position: "asc"
      },
      select: columnManagerSelect
    });

    return {
      board,
      columns: columns.map(mapColumn)
    };
  },

  async createColumn(boardId: string, input: CreateColumnInput) {
    await getBoardOrThrow(boardId);

    const key = await createUniqueColumnKey(boardId, input.title);
    const maxPosition = await prisma.column.aggregate({
      where: { boardId },
      _max: {
        position: true
      }
    });

    const column = await prisma.column.create({
      data: {
        boardId,
        key,
        title: input.title.trim(),
        position: (maxPosition._max.position ?? 0) + 1,
        isActive: true
      },
      select: columnManagerSelect
    });

    return mapColumn(column);
  },

  async updateColumn(columnId: string, input: UpdateColumnInput) {
    await getColumnOrThrow(columnId);

    const column = await prisma.column.update({
      where: { id: columnId },
      data: {
        title: input.title.trim()
      },
      select: columnManagerSelect
    });

    return mapColumn(column);
  },

  async reorderColumn(columnId: string, input: ReorderColumnInput) {
    const column = await getColumnOrThrow(columnId);

    const sibling = await prisma.column.findFirst({
      where: {
        boardId: column.boardId,
        position: input.direction === "up" ? column.position - 1 : column.position + 1
      },
      select: {
        id: true,
        position: true
      }
    });

    if (!sibling) {
      return mapColumn(column);
    }

    const updatedColumn = await prisma.$transaction(async (tx) => {
      await tx.column.update({
        where: { id: sibling.id },
        data: {
          position: column.position
        }
      });

      return tx.column.update({
        where: { id: column.id },
        data: {
          position: sibling.position
        },
        select: columnManagerSelect
      });
    });

    return mapColumn(updatedColumn);
  },

  async updateColumnActive(columnId: string, input: UpdateColumnActiveInput) {
    const column = await getColumnOrThrow(columnId);

    if (column.isActive === input.isActive) {
      return mapColumn(column);
    }

    if (input.isActive) {
      const updatedColumn = await prisma.column.update({
        where: { id: columnId },
        data: {
          isActive: true
        },
        select: columnManagerSelect
      });

      return mapColumn(updatedColumn);
    }

    if (column.key === "eingang") {
      throw new AppError(
        "Die Startspalte Eingang kann nicht deaktiviert werden.",
        409,
        "COLUMN_DEACTIVATION_NOT_ALLOWED"
      );
    }

    if (column._count.cards > 0 || column._count.previousCards > 0) {
      throw new AppError(
        "Spalten mit Karten oder UC Ruecksprungbezug koennen nicht deaktiviert werden.",
        409,
        "COLUMN_HAS_CARDS"
      );
    }

    const activeColumnCount = await prisma.column.count({
      where: {
        boardId: column.boardId,
        isActive: true
      }
    });

    if (activeColumnCount <= 1) {
      throw new AppError(
        "Mindestens eine aktive Spalte muss pro Board bestehen bleiben.",
        409,
        "COLUMN_LAST_ACTIVE"
      );
    }

    const updatedColumn = await prisma.$transaction(async (tx) => {
      const nextColumn = await tx.column.update({
        where: { id: columnId },
        data: {
          isActive: false
        },
        select: columnManagerSelect
      });

      await compactColumnPositions(tx, column.boardId);
      return nextColumn;
    });

    return mapColumn(updatedColumn);
  }
};
