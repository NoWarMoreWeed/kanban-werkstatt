import { Prisma } from "@prisma/client";
import { AppError } from "../../errors/app-error.js";
import { prisma } from "../../lib/prisma.js";
import type {
  BulkCardActionInput,
  CardSearchQuery,
  CreateCardInput,
  MoveCardInput,
  UpdateCardInput,
  CreateCommentInput
} from "./card.schemas.js";

const cardSelect = {
  id: true,
  boardId: true,
  columnId: true,
  archiveStatus: true,
  ucStatus: true,
  previousColumnId: true,
  position: true,
  creatorName: true,
  responsibleName: true,
  deviceName: true,
  priority: true,
  dueDate: true,
  statusChangedAt: true,
  completedAt: true,
  completedYear: true,
  completedWeek: true,
  completedFromColumnKey: true,
  completedFromColumnTitle: true,
  partNumber: true,
  serialNumber: true,
  sapNumber: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.CardSelect;

const commentSelect = {
  id: true,
  cardId: true,
  authorName: true,
  message: true,
  createdAt: true
} satisfies Prisma.CommentSelect;

const CARD_ARCHIVE_STATUS = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED"
} as const;

const CARD_UC_STATUS = {
  NOT_IN_UC: "NOT_IN_UC",
  IN_UC: "IN_UC"
} as const;

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
    select: {
      id: true,
      boardId: true,
      key: true,
      title: true,
      position: true
    }
  });

  if (!column) {
    throw new AppError("Column not found.", 404, "COLUMN_NOT_FOUND");
  }

  return column;
};

const getCardOrThrow = async (cardId: string) => {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: cardSelect
  });

  if (!card) {
    throw new AppError("Card not found.", 404, "CARD_NOT_FOUND");
  }

  return card;
};

const assertColumnBelongsToBoard = (columnBoardId: string, boardId: string) => {
  if (columnBoardId !== boardId) {
    throw new AppError(
      "Column does not belong to the specified board.",
      400,
      "COLUMN_BOARD_MISMATCH"
    );
  }
};

const getNextPosition = async (
  tx: Prisma.TransactionClient,
  columnId: string,
  ucStatus: (typeof CARD_UC_STATUS)[keyof typeof CARD_UC_STATUS]
) => {
  const result = await tx.card.aggregate({
    where: { columnId, ucStatus },
    _max: { position: true }
  });

  return (result._max.position ?? 0) + 1;
};

const compactColumnPositions = async (
  tx: Prisma.TransactionClient,
  columnId: string,
  ucStatus: (typeof CARD_UC_STATUS)[keyof typeof CARD_UC_STATUS],
  excludedCardId?: string
) => {
  const cards = await tx.card.findMany({
    where: {
      columnId,
      ucStatus,
      ...(excludedCardId
        ? {
            id: {
              not: excludedCardId
            }
          }
        : {})
    },
    orderBy: {
      position: "asc"
    },
    select: {
      id: true
    }
  });

  for (const [index, card] of cards.entries()) {
    await tx.card.update({
      where: { id: card.id },
      data: {
        position: index + 1
      }
    });
  }
};

const normalizeCardFields = (input: CreateCardInput | UpdateCardInput) => ({
  responsibleName: input.responsibleName.trim(),
  deviceName: input.deviceName.trim(),
  priority: input.priority.trim(),
  dueDate: input.dueDate,
  partNumber: input.partNumber.trim(),
  serialNumber: input.serialNumber.trim(),
  sapNumber: input.sapNumber.trim(),
  orderNumber: input.orderNumber.trim()
});

const assertNoDuplicateActiveCards = async ({
  partNumber,
  serialNumber,
  orderNumber,
  excludeCardId
}: {
  partNumber: string;
  serialNumber: string;
  orderNumber: string;
  excludeCardId?: string;
}) => {
  const activeCardFilter = {
    archiveStatus: CARD_ARCHIVE_STATUS.ACTIVE,
    ...(excludeCardId
      ? {
          id: {
            not: excludeCardId
          }
        }
      : {})
  } satisfies Prisma.CardWhereInput;

  const duplicatePartSerialCard = await prisma.card.findFirst({
    where: {
      ...activeCardFilter,
      partNumber,
      serialNumber
    },
    select: {
      id: true,
      partNumber: true,
      serialNumber: true
    }
  });

  if (duplicatePartSerialCard) {
    throw new AppError(
      "Eine aktive Karte mit derselben Kombination aus P/N und S/N existiert bereits.",
      409,
      "CARD_DUPLICATE_PART_SERIAL",
      {
        duplicateCardId: duplicatePartSerialCard.id,
        partNumber,
        serialNumber
      }
    );
  }

  const duplicateOrderNumberCard = await prisma.card.findFirst({
    where: {
      ...activeCardFilter,
      orderNumber
    },
    select: {
      id: true,
      orderNumber: true
    }
  });

  if (duplicateOrderNumberCard) {
    throw new AppError(
      "Eine aktive Karte mit derselben Meldungsnummer existiert bereits.",
      409,
      "CARD_DUPLICATE_ORDER_NUMBER",
      {
        duplicateCardId: duplicateOrderNumberCard.id,
        orderNumber
      }
    );
  }
};

const getBulkCardsForManagerActionOrThrow = async (boardId: string, cardIds: string[]) => {
  const board = await getBoardOrThrow(boardId);
  const cards = await prisma.card.findMany({
    where: {
      boardId,
      id: {
        in: cardIds
      }
    },
    orderBy: {
      position: "asc"
    },
    select: cardSelect
  });

  if (cards.length !== cardIds.length) {
    throw new AppError(
      "Mindestens eine ausgewaehlte Karte wurde nicht gefunden oder gehoert nicht zu diesem Board.",
      404,
      "CARD_SELECTION_INVALID"
    );
  }

  const invalidCard = cards.find(
    (card) =>
      card.archiveStatus !== CARD_ARCHIVE_STATUS.ACTIVE || card.ucStatus !== CARD_UC_STATUS.NOT_IN_UC
  );

  if (invalidCard) {
    throw new AppError(
      "Massenaktionen sind nur fuer aktive Karten ausserhalb von UC moeglich.",
      409,
      "CARD_BULK_STATE_INVALID"
    );
  }

  return {
    board,
    cards
  };
};

const isFinishedColumn = (column: { key?: string; title: string }) =>
  column.key?.trim().toLowerCase() === "fertig" || column.title.trim().toLowerCase() === "fertig";

const getIsoWeekParts = (value: Date) => {
  const date = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const day = date.getUTCDay() || 7;

  date.setUTCDate(date.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return {
    year: date.getUTCFullYear(),
    week
  };
};

const getCompletionUpdateForColumn = (column: { key?: string; title: string }, completedAt: Date) => {
  if (!isFinishedColumn(column)) {
    return {};
  }

  const isoWeekParts = getIsoWeekParts(completedAt);

  return {
    completedAt,
    completedYear: isoWeekParts.year,
    completedWeek: isoWeekParts.week,
    completedFromColumnKey: column.key?.trim() || null,
    completedFromColumnTitle: column.title.trim()
  };
};

export const cardService = {
  async searchBoardCards(input: CardSearchQuery) {
    await getBoardOrThrow(input.boardId);

    const normalizedQuery = input.query.trim();
    const stateFilter =
      input.state === "active"
        ? {
            archiveStatus: CARD_ARCHIVE_STATUS.ACTIVE,
            ucStatus: CARD_UC_STATUS.NOT_IN_UC
          }
        : input.state === "archived"
          ? { archiveStatus: CARD_ARCHIVE_STATUS.ARCHIVED }
          : input.state === "uc"
            ? {
                archiveStatus: CARD_ARCHIVE_STATUS.ACTIVE,
                ucStatus: CARD_UC_STATUS.IN_UC
              }
            : {};

    const cards = await prisma.card.findMany({
      where: {
        boardId: input.boardId,
        ...stateFilter,
        OR: [
          {
            deviceName: {
              contains: normalizedQuery,
              mode: "insensitive"
            }
          },
          {
            partNumber: {
              contains: normalizedQuery,
              mode: "insensitive"
            }
          },
          {
            serialNumber: {
              contains: normalizedQuery,
              mode: "insensitive"
            }
          },
          {
            sapNumber: {
              contains: normalizedQuery,
              mode: "insensitive"
            }
          },
          {
            orderNumber: {
              contains: normalizedQuery,
              mode: "insensitive"
            }
          }
        ]
      },
      orderBy: [{ archiveStatus: "asc" }, { ucStatus: "asc" }, { columnId: "asc" }, { position: "asc" }],
      select: {
        ...cardSelect,
        column: {
          select: {
            id: true,
            key: true,
            title: true,
            position: true
          }
        }
      }
    });

    return {
      boardId: input.boardId,
      query: normalizedQuery,
      state: input.state,
      cards
    };
  },

  async listBoardCards(boardId: string) {
    await getBoardOrThrow(boardId);

    const cards = await prisma.card.findMany({
      where: { boardId },
      orderBy: [{ archiveStatus: "asc" }, { ucStatus: "asc" }, { columnId: "asc" }, { position: "asc" }],
      select: {
        ...cardSelect,
        column: {
          select: {
            id: true,
            key: true,
            title: true,
            position: true
          }
        }
      }
    });

    return { boardId, cards };
  },

  async createCard(input: CreateCardInput) {
    const board = await getBoardOrThrow(input.boardId);
    const column = await getColumnOrThrow(input.columnId);
    const normalizedInput = normalizeCardFields(input);

    assertColumnBelongsToBoard(column.boardId, board.id);
    await assertNoDuplicateActiveCards({
      partNumber: normalizedInput.partNumber,
      serialNumber: normalizedInput.serialNumber,
      orderNumber: normalizedInput.orderNumber
    });

    return prisma.$transaction(async (tx) => {
      const position = await getNextPosition(tx, column.id, CARD_UC_STATUS.NOT_IN_UC);

      return tx.card.create({
        data: {
          boardId: board.id,
          columnId: column.id,
          position,
          archiveStatus: CARD_ARCHIVE_STATUS.ACTIVE,
          ucStatus: CARD_UC_STATUS.NOT_IN_UC,
          previousColumnId: null,
          creatorName: normalizedInput.responsibleName,
          responsibleName: normalizedInput.responsibleName,
          deviceName: normalizedInput.deviceName,
          priority: normalizedInput.priority,
          dueDate: normalizedInput.dueDate,
          statusChangedAt: new Date(),
          partNumber: normalizedInput.partNumber,
          serialNumber: normalizedInput.serialNumber,
          sapNumber: normalizedInput.sapNumber,
          orderNumber: normalizedInput.orderNumber
        },
        select: cardSelect
      });
    });
  },

  async bulkAction(input: BulkCardActionInput) {
    const { board, cards } = await getBulkCardsForManagerActionOrThrow(input.boardId, input.cardIds);

    if (input.action === "assign") {
      await prisma.card.updateMany({
        where: {
          id: {
            in: cards.map((card) => card.id)
          }
        },
        data: {
          responsibleName: input.responsibleName.trim(),
          creatorName: input.responsibleName.trim()
        }
      });
    }

    if (input.action === "archive") {
      const columnsById = new Map(
        (
          await prisma.column.findMany({
            where: {
              id: {
                in: Array.from(new Set(cards.map((card) => card.columnId)))
              }
            },
            select: {
              id: true,
              key: true,
              title: true
            }
          })
        ).map((column) => [column.id, column])
      );
      const archivedAt = new Date();

      await prisma.$transaction(async (tx) => {
        for (const card of cards) {
          const column = columnsById.get(card.columnId);

          if (!column) {
            throw new AppError("Column not found.", 404, "COLUMN_NOT_FOUND");
          }

          await tx.card.update({
            where: {
              id: card.id
            },
            data: {
              archiveStatus: CARD_ARCHIVE_STATUS.ARCHIVED,
              statusChangedAt: archivedAt,
              ...getCompletionUpdateForColumn(column, archivedAt)
            }
          });
        }
      });
    }

    if (input.action === "move") {
      const targetColumn = await getColumnOrThrow(input.targetColumnId);
      assertColumnBelongsToBoard(targetColumn.boardId, board.id);

      await prisma.$transaction(async (tx) => {
        for (const [index, card] of cards.entries()) {
          await tx.card.update({
            where: { id: card.id },
            data: {
              position: -1 - index
            }
          });
        }

        const affectedSourceColumnIds = Array.from(new Set(cards.map((card) => card.columnId)));

        for (const sourceColumnId of affectedSourceColumnIds) {
          await compactColumnPositions(tx, sourceColumnId, CARD_UC_STATUS.NOT_IN_UC);
        }

        let nextPosition = await getNextPosition(tx, targetColumn.id, CARD_UC_STATUS.NOT_IN_UC);

        for (const card of cards) {
          await tx.card.update({
            where: { id: card.id },
            data: {
              columnId: targetColumn.id,
              position: nextPosition,
              statusChangedAt: new Date()
            }
          });

          nextPosition += 1;
        }
      });
    }

    if (input.action === "moveToUc") {
      await prisma.$transaction(async (tx) => {
        for (const [index, card] of cards.entries()) {
          await tx.card.update({
            where: { id: card.id },
            data: {
              position: -1 - index
            }
          });
        }

        const affectedSourceColumnIds = Array.from(new Set(cards.map((card) => card.columnId)));

        for (const sourceColumnId of affectedSourceColumnIds) {
          await compactColumnPositions(tx, sourceColumnId, CARD_UC_STATUS.NOT_IN_UC);
        }

        const nextUcPositionByColumn = new Map<string, number>();

        for (const card of cards) {
          if (!nextUcPositionByColumn.has(card.columnId)) {
            nextUcPositionByColumn.set(
              card.columnId,
              await getNextPosition(tx, card.columnId, CARD_UC_STATUS.IN_UC)
            );
          }

          const nextPosition = nextUcPositionByColumn.get(card.columnId) ?? 1;

          await tx.card.update({
            where: { id: card.id },
            data: {
              ucStatus: CARD_UC_STATUS.IN_UC,
              previousColumnId: card.columnId,
              position: nextPosition,
              statusChangedAt: new Date()
            }
          });

          nextUcPositionByColumn.set(card.columnId, nextPosition + 1);
        }
      });
    }

    const updatedCards = await prisma.card.findMany({
      where: {
        id: {
          in: cards.map((card) => card.id)
        }
      },
      orderBy: {
        position: "asc"
      },
      select: {
        ...cardSelect,
        column: {
          select: {
            id: true,
            key: true,
            title: true,
            position: true
          }
        }
      }
    });

    return {
      action: input.action,
      count: updatedCards.length,
      cards: updatedCards
    };
  },

  async updateCard(cardId: string, input: UpdateCardInput) {
    const card = await getCardOrThrow(cardId);
    const normalizedInput = normalizeCardFields(input);

    if (card.archiveStatus === CARD_ARCHIVE_STATUS.ARCHIVED || card.ucStatus === CARD_UC_STATUS.IN_UC) {
      throw new AppError(
        "Nur aktive Karten ausserhalb von UC koennen bearbeitet werden.",
        400,
        "CARD_NOT_EDITABLE"
      );
    }

    await assertNoDuplicateActiveCards({
      partNumber: normalizedInput.partNumber,
      serialNumber: normalizedInput.serialNumber,
      orderNumber: normalizedInput.orderNumber,
      excludeCardId: cardId
    });

    return prisma.card.update({
      where: { id: cardId },
      data: {
        creatorName: normalizedInput.responsibleName,
        responsibleName: normalizedInput.responsibleName,
        deviceName: normalizedInput.deviceName,
        priority: normalizedInput.priority,
        dueDate: normalizedInput.dueDate,
        partNumber: normalizedInput.partNumber,
        serialNumber: normalizedInput.serialNumber,
        sapNumber: normalizedInput.sapNumber,
        orderNumber: normalizedInput.orderNumber
      },
      select: cardSelect
    });
  },

  async managerCorrectCard(cardId: string, input: UpdateCardInput) {
    const card = await getCardOrThrow(cardId);
    const normalizedInput = normalizeCardFields(input);

    if (card.archiveStatus === CARD_ARCHIVE_STATUS.ACTIVE) {
      await assertNoDuplicateActiveCards({
        partNumber: normalizedInput.partNumber,
        serialNumber: normalizedInput.serialNumber,
        orderNumber: normalizedInput.orderNumber,
        excludeCardId: cardId
      });
    }

    return prisma.card.update({
      where: { id: cardId },
      data: {
        creatorName: normalizedInput.responsibleName,
        responsibleName: normalizedInput.responsibleName,
        deviceName: normalizedInput.deviceName,
        priority: normalizedInput.priority,
        dueDate: normalizedInput.dueDate,
        partNumber: normalizedInput.partNumber,
        serialNumber: normalizedInput.serialNumber,
        sapNumber: normalizedInput.sapNumber,
        orderNumber: normalizedInput.orderNumber
      },
      select: cardSelect
    });
  },

  async moveCard(cardId: string, input: MoveCardInput) {
    const card = await getCardOrThrow(cardId);
    const targetColumn = await getColumnOrThrow(input.targetColumnId);

    if (card.archiveStatus === CARD_ARCHIVE_STATUS.ARCHIVED || card.ucStatus === CARD_UC_STATUS.IN_UC) {
      throw new AppError(
        "Nur aktive Karten ausserhalb von UC koennen verschoben werden.",
        400,
        "CARD_NOT_MOVABLE"
      );
    }

    assertColumnBelongsToBoard(targetColumn.boardId, card.boardId);

    if (card.columnId === targetColumn.id) {
      return card;
    }

    return prisma.$transaction(async (tx) => {
      await tx.card.update({
        where: { id: card.id },
        data: {
          position: 0
        }
      });

      await compactColumnPositions(tx, card.columnId, CARD_UC_STATUS.NOT_IN_UC, card.id);
      const position = await getNextPosition(tx, targetColumn.id, CARD_UC_STATUS.NOT_IN_UC);

      return tx.card.update({
        where: { id: card.id },
        data: {
          columnId: targetColumn.id,
          position,
          statusChangedAt: new Date()
        },
        select: cardSelect
      });
    });
  },

  async archiveCard(cardId: string) {
    const card = await getCardOrThrow(cardId);

    if (card.archiveStatus === CARD_ARCHIVE_STATUS.ARCHIVED) {
      return card;
    }

    if (card.ucStatus === CARD_UC_STATUS.IN_UC) {
      throw new AppError(
        "UC Karten muessen zuerst aus UC entfernt werden, bevor sie archiviert werden koennen.",
        400,
        "CARD_IN_UC"
      );
    }

    const column = await getColumnOrThrow(card.columnId);
    const archivedAt = new Date();

    return prisma.card.update({
      where: { id: cardId },
      data: {
        archiveStatus: CARD_ARCHIVE_STATUS.ARCHIVED,
        statusChangedAt: archivedAt,
        ...getCompletionUpdateForColumn(column, archivedAt)
      },
      select: cardSelect
    });
  },

  async restoreArchivedCard(cardId: string) {
    const card = await getCardOrThrow(cardId);

    if (card.archiveStatus !== CARD_ARCHIVE_STATUS.ARCHIVED) {
      throw new AppError("Die Karte liegt nicht im Archiv.", 400, "CARD_NOT_ARCHIVED");
    }

    if (card.ucStatus === CARD_UC_STATUS.IN_UC) {
      throw new AppError(
        "UC Karten koennen nicht direkt aus dem Archiv zurueckgeholt werden.",
        400,
        "CARD_IN_UC"
      );
    }

    await assertNoDuplicateActiveCards({
      partNumber: card.partNumber,
      serialNumber: card.serialNumber,
      orderNumber: card.orderNumber
    });

    return prisma.$transaction(async (tx) => {
      const position = await getNextPosition(tx, card.columnId, CARD_UC_STATUS.NOT_IN_UC);

      return tx.card.update({
        where: { id: cardId },
        data: {
          archiveStatus: CARD_ARCHIVE_STATUS.ACTIVE,
          position,
          previousColumnId: null,
          statusChangedAt: new Date()
        },
        select: cardSelect
      });
    });
  },

  async deleteCard(cardId: string) {
    const card = await getCardOrThrow(cardId);

    await prisma.$transaction(async (tx) => {
      await tx.card.delete({
        where: { id: cardId }
      });

      await compactColumnPositions(tx, card.columnId, card.ucStatus);
    });

    return card;
  },

  async moveCardToUc(cardId: string) {
    const card = await getCardOrThrow(cardId);

    if (card.archiveStatus === CARD_ARCHIVE_STATUS.ARCHIVED) {
      throw new AppError("Archivierte Karten koennen nicht in UC gelegt werden.", 400, "CARD_ARCHIVED");
    }

    if (card.ucStatus === CARD_UC_STATUS.IN_UC) {
      return card;
    }

    return prisma.$transaction(async (tx) => {
      await tx.card.update({
        where: { id: card.id },
        data: {
          position: 0
        }
      });

      await compactColumnPositions(tx, card.columnId, CARD_UC_STATUS.NOT_IN_UC, card.id);
      const ucPosition = await getNextPosition(tx, card.columnId, CARD_UC_STATUS.IN_UC);

      return tx.card.update({
        where: { id: card.id },
        data: {
          ucStatus: CARD_UC_STATUS.IN_UC,
          previousColumnId: card.columnId,
          position: ucPosition,
          statusChangedAt: new Date()
        },
        select: cardSelect
      });
    });
  },

  async removeCardFromUc(cardId: string) {
    const card = await getCardOrThrow(cardId);

    if (card.ucStatus !== CARD_UC_STATUS.IN_UC) {
      throw new AppError("Die Karte liegt nicht in UC.", 400, "CARD_NOT_IN_UC");
    }

    if (!card.previousColumnId) {
      throw new AppError(
        "Die vorherige Spalte der UC Karte ist nicht gespeichert.",
        400,
        "CARD_PREVIOUS_COLUMN_MISSING"
      );
    }

    const previousColumn = await getColumnOrThrow(card.previousColumnId);
    assertColumnBelongsToBoard(previousColumn.boardId, card.boardId);

    return prisma.$transaction(async (tx) => {
      await tx.card.update({
        where: { id: card.id },
        data: {
          position: 0
        }
      });

      await compactColumnPositions(tx, card.columnId, CARD_UC_STATUS.IN_UC, card.id);
      const activePosition = await getNextPosition(tx, previousColumn.id, CARD_UC_STATUS.NOT_IN_UC);

      return tx.card.update({
        where: { id: card.id },
        data: {
          columnId: previousColumn.id,
          previousColumnId: null,
          ucStatus: CARD_UC_STATUS.NOT_IN_UC,
          position: activePosition,
          statusChangedAt: new Date()
        },
        select: cardSelect
      });
    });
  },

  async listComments(cardId: string) {
    await getCardOrThrow(cardId);

    const comments = await prisma.comment.findMany({
      where: {
        cardId
      },
      orderBy: {
        createdAt: "asc"
      },
      select: commentSelect
    });

    return {
      cardId,
      comments
    };
  },

  async addComment(cardId: string, input: CreateCommentInput) {
    await getCardOrThrow(cardId);

    return prisma.comment.create({
      data: {
        cardId,
        authorName: input.authorName.trim(),
        message: input.message.trim()
      },
      select: commentSelect
    });
  }
};
