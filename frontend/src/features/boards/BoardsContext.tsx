import React from "react";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState
} from "react";
import { apiFetch } from "../../lib/api";
import type { BoardListItem, BoardListResponse } from "../../types/api";

type BoardsContextValue = {
  boards: BoardListItem[];
  workshopName: string;
  isLoading: boolean;
  error: string | null;
};

const toDisplayUnitName = (value: string) =>
  value.trim().toLocaleLowerCase("de-DE") === "werkstatt" ? "T/AO425" : value;

const BoardsContext = createContext<BoardsContextValue | undefined>(undefined);

export function BoardsProvider({ children }: PropsWithChildren) {
  const [boards, setBoards] = useState<BoardListItem[]>([]);
  const [workshopName, setWorkshopName] = useState("T/AO425");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadBoards() {
      try {
        setIsLoading(true);
        setError(null);

        const data = await apiFetch<BoardListResponse>("/boards");

        if (!isActive) {
          return;
        }

        setBoards(data.boards);
        setWorkshopName(toDisplayUnitName(data.workshop.name));
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setError(
          loadError instanceof Error ? loadError.message : "Die Boards konnten nicht geladen werden."
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadBoards();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <BoardsContext.Provider value={{ boards, workshopName, isLoading, error }}>
      {children}
    </BoardsContext.Provider>
  );
}

export function useBoards() {
  const context = useContext(BoardsContext);

  if (!context) {
    throw new Error("useBoards must be used within a BoardsProvider.");
  }

  return context;
}
