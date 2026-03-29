import React from "react";
import { useBoards } from "../boards/BoardsContext";
import { apiFetch } from "../../lib/api";
import type { BoardCardsResponse } from "../../types/api";
import type { BoardCardsBundle } from "./statistics.utils";

export function useStatistics() {
  const { boards, isLoading: areBoardsLoading, error: boardsError } = useBoards();
  const [boardCards, setBoardCards] = React.useState<BoardCardsBundle[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (areBoardsLoading) {
      return;
    }

    if (boardsError) {
      setError(boardsError);
      setIsLoading(false);
      return;
    }

    if (boards.length === 0) {
      setBoardCards([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isActive = true;

    async function loadAllBoardCards() {
      setIsLoading(true);
      setError(null);

      try {
        const responses = await Promise.all(
          boards.map(async (board) => {
            const data = await apiFetch<BoardCardsResponse>(`/boards/${board.id}/cards`);

            return {
              board,
              cards: data.cards
            };
          })
        );

        if (!isActive) {
          return;
        }

        setBoardCards(responses);
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Statistikdaten konnten nicht geladen werden."
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadAllBoardCards();

    return () => {
      isActive = false;
    };
  }, [areBoardsLoading, boards, boardsError]);

  return {
    boards,
    boardCards,
    isLoading: areBoardsLoading || isLoading,
    error
  };
}
