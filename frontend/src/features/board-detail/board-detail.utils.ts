import type { BoardColumn, CardItem } from "../../types/api";

export function moveCardToColumn(
  cards: CardItem[],
  columns: BoardColumn[],
  cardId: string,
  targetColumnId: string
) {
  const cardToMove = cards.find((card) => card.id === cardId);
  const targetColumn = columns.find((column) => column.id === targetColumnId);

  if (!cardToMove || !targetColumn || cardToMove.columnId === targetColumnId) {
    return cards;
  }

  const sourceCards = cards
    .filter((card) => card.columnId === cardToMove.columnId && card.id !== cardId)
    .sort((left, right) => left.position - right.position)
    .map((card, index) => ({
      ...card,
      position: index + 1
    }));

  const targetCards = cards
    .filter((card) => card.columnId === targetColumnId)
    .sort((left, right) => left.position - right.position)
    .map((card, index) => ({
      ...card,
      position: index + 1
    }));

  const movedCard: CardItem = {
    ...cardToMove,
    columnId: targetColumnId,
    column: {
      id: targetColumn.id,
      key: targetColumn.key,
      title: targetColumn.title,
      position: targetColumn.position
    },
    position: targetCards.length + 1
  };

  const untouchedCards = cards.filter(
    (card) =>
      card.id !== cardId &&
      card.columnId !== cardToMove.columnId &&
      card.columnId !== targetColumnId
  );

  return [...untouchedCards, ...sourceCards, ...targetCards, movedCard];
}

export function filterCardsByMode(cards: CardItem[], viewMode: "active" | "archived" | "uc") {
  return cards.filter((card) => {
    if (viewMode === "active") {
      return card.archiveStatus === "ACTIVE" && card.ucStatus === "NOT_IN_UC";
    }

    if (viewMode === "uc") {
      return card.archiveStatus === "ACTIVE" && card.ucStatus === "IN_UC";
    }

    return card.archiveStatus === "ARCHIVED";
  });
}
