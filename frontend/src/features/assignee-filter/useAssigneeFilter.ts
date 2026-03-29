import React from "react";
import type { CardItem } from "../../types/api";

type ViewMode = "active" | "archived" | "uc";
type AssigneeFilterMode = "all" | "mine" | "name";

const STORAGE_KEY = "werkstatt-kanban:current-user-name";

const normalize = (value: string) => value.trim().toLocaleLowerCase();

export function useAssigneeFilter(cards: CardItem[], viewMode: ViewMode) {
  const [currentUserName, setCurrentUserNameState] = React.useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  });
  const [assigneeNameFilter, setAssigneeNameFilterState] = React.useState("");
  const [filterMode, setFilterMode] = React.useState<AssigneeFilterMode>("all");

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const trimmedValue = currentUserName.trim();

    if (trimmedValue) {
      window.localStorage.setItem(STORAGE_KEY, trimmedValue);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentUserName]);

  React.useEffect(() => {
    if (filterMode === "mine" && !currentUserName.trim()) {
      setFilterMode("all");
    }
  }, [currentUserName, filterMode]);

  const filteredCards = React.useMemo(() => {
    if (viewMode !== "active") {
      return cards;
    }

    if (filterMode === "mine") {
      const normalizedCurrentUser = normalize(currentUserName);

      if (!normalizedCurrentUser) {
        return cards;
      }

      return cards.filter((card) =>
        normalize(card.responsibleName).includes(normalizedCurrentUser)
      );
    }

    if (filterMode === "name") {
      const normalizedAssigneeFilter = normalize(assigneeNameFilter);

      if (!normalizedAssigneeFilter) {
        return cards;
      }

      return cards.filter((card) =>
        normalize(card.responsibleName).includes(normalizedAssigneeFilter)
      );
    }

    return cards;
  }, [assigneeNameFilter, cards, currentUserName, filterMode, viewMode]);

  const setCurrentUserName = (value: string) => {
    setCurrentUserNameState(value);
  };

  const setAssigneeNameFilter = (value: string) => {
    setAssigneeNameFilterState(value);
    setFilterMode(value.trim() ? "name" : "all");
  };

  const toggleMineFilter = () => {
    if (!currentUserName.trim()) {
      return;
    }

    setAssigneeNameFilterState("");
    setFilterMode((currentMode) => (currentMode === "mine" ? "all" : "mine"));
  };

  const clearFilters = () => {
    setAssigneeNameFilterState("");
    setFilterMode("all");
  };

  const activeFilterLabel =
    filterMode === "mine"
      ? `Nur meine Geraete: ${currentUserName.trim()}`
      : filterMode === "name" && assigneeNameFilter.trim()
        ? `Bearbeiter: ${assigneeNameFilter.trim()}`
        : null;

  return {
    currentUserName,
    assigneeNameFilter,
    filteredCards,
    filterMode,
    activeFilterLabel,
    hasCurrentUserName: currentUserName.trim().length > 0,
    hasActiveFilter: filterMode !== "all",
    setCurrentUserName,
    setAssigneeNameFilter,
    toggleMineFilter,
    clearFilters
  };
}
