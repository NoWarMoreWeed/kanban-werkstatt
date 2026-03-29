import {
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { useDeferredValue, useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";
import type {
  BulkCardActionPayload,
  BulkCardActionResponse,
  BoardCardsResponse,
  BoardDetail,
  CardItem,
  CardSearchResponse,
  CreateCardPayload
} from "../../types/api";
import type { CardBaseFormValues } from "../cards";
import { filterCardsByMode, moveCardToColumn } from "./board-detail.utils";

type ViewMode = "active" | "archived" | "uc";
type EditMode = "normal" | "manager";
type BulkActionType = "archive" | "assign" | "move" | "moveToUc";

type UseBoardDetailResult = {
  board: BoardDetail | null;
  cards: CardItem[];
  isBoardLoading: boolean;
  isCardsLoading: boolean;
  error: string | null;
  saveError: string | null;
  isCreateModalOpen: boolean;
  isCreatingCard: boolean;
  editingCard: CardItem | null;
  editMode: EditMode;
  deleteCandidate: CardItem | null;
  restoreCandidate: CardItem | null;
  managerMoveCandidate: CardItem | null;
  isUpdatingCard: boolean;
  isBulkActionRunning: boolean;
  activeBulkAction: BulkActionType | null;
  archivingCardId: string | null;
  deletingCardId: string | null;
  restoringCardId: string | null;
  managerMovingCardId: string | null;
  movingToUcCardId: string | null;
  removingFromUcCardId: string | null;
  viewMode: ViewMode;
  searchTerm: string;
  dragDisabled: boolean;
  sensors: ReturnType<typeof useSensors>;
  setViewMode: (viewMode: ViewMode) => void;
  setSearchTerm: (value: string) => void;
  refreshBoardData: () => Promise<void>;
  openCreateCardModal: () => void;
  closeCreateCardModal: () => void;
  handleCreateCard: (values: CardBaseFormValues) => Promise<void>;
  openEditCardModal: (card: CardItem) => void;
  openManagerEditCardModal: (card: CardItem) => void;
  closeEditCardModal: () => void;
  requestDeleteCard: (card: CardItem) => void;
  closeDeleteCardModal: () => void;
  confirmDeleteCard: () => Promise<void>;
  requestRestoreCard: (card: CardItem) => void;
  closeRestoreCardModal: () => void;
  confirmRestoreCard: () => Promise<void>;
  requestManagerMoveCard: (card: CardItem) => void;
  closeManagerMoveModal: () => void;
  confirmManagerMoveCard: (targetColumnId: string) => Promise<void>;
  handleUpdateCard: (values: CardBaseFormValues) => Promise<void>;
  runBulkAction: (
    action: BulkActionType,
    cardIds: string[],
    values?: { responsibleName?: string; targetColumnId?: string }
  ) => Promise<void>;
  handleDragEnd: (event: DragEndEvent) => Promise<void>;
  handleArchiveCard: (cardId: string) => Promise<void>;
  handleMoveCardToUc: (cardId: string) => Promise<void>;
  handleRemoveCardFromUc: (cardId: string) => Promise<void>;
};

const findInitialColumnId = (board: BoardDetail) => {
  const initialColumn = board.columns.find(
    (column) =>
      column.key.toLowerCase() === "eingang" || column.title.trim().toLowerCase() === "eingang"
  );

  if (!initialColumn) {
    throw new Error("Die Startspalte Eingang ist für dieses Board nicht vorhanden.");
  }

  return initialColumn.id;
};

export function useBoardDetail(boardId: string | undefined): UseBoardDetailResult {
  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [isBoardLoading, setIsBoardLoading] = useState(true);
  const [isCardsLoading, setIsCardsLoading] = useState(true);
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [isUpdatingCard, setIsUpdatingCard] = useState(false);
  const [isBulkActionRunning, setIsBulkActionRunning] = useState(false);
  const [activeBulkAction, setActiveBulkAction] = useState<BulkActionType | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardItem | null>(null);
  const [editMode, setEditMode] = useState<EditMode>("normal");
  const [deleteCandidate, setDeleteCandidate] = useState<CardItem | null>(null);
  const [restoreCandidate, setRestoreCandidate] = useState<CardItem | null>(null);
  const [managerMoveCandidate, setManagerMoveCandidate] = useState<CardItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [archivingCardId, setArchivingCardId] = useState<string | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [restoringCardId, setRestoringCardId] = useState<string | null>(null);
  const [managerMovingCardId, setManagerMovingCardId] = useState<string | null>(null);
  const [movingToUcCardId, setMovingToUcCardId] = useState<string | null>(null);
  const [removingFromUcCardId, setRemovingFromUcCardId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("active");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const dragDisabled = viewMode !== "active" || deferredSearchTerm.trim().length > 0;

  const loadCardsForState = async (
    currentBoardId: string,
    currentViewMode: ViewMode,
    currentSearchTerm: string
  ) => {
    const trimmedQuery = currentSearchTerm.trim();

    if (trimmedQuery) {
      const searchParams = new URLSearchParams();
      searchParams.set("boardId", currentBoardId);
      searchParams.set("query", trimmedQuery);
      searchParams.set("state", currentViewMode);

      const searchData = await apiFetch<CardSearchResponse>(`/cards/search?${searchParams.toString()}`);
      return searchData.cards;
    }

    const cardData = await apiFetch<BoardCardsResponse>(`/boards/${currentBoardId}/cards`);
    return filterCardsByMode(cardData.cards, currentViewMode);
  };

  const loadBoardById = async (currentBoardId: string) =>
    apiFetch<BoardDetail>(`/boards/${currentBoardId}`);

  const refreshBoardData = async () => {
    if (!boardId) {
      return;
    }

    const [nextBoard, nextCards] = await Promise.all([
      loadBoardById(boardId),
      loadCardsForState(boardId, viewMode, deferredSearchTerm)
    ]);

    setBoard(nextBoard);
    setCards(nextCards);
  };

  useEffect(() => {
    if (!boardId) {
      setBoard(null);
      setCards([]);
      setIsBoardLoading(false);
      setIsCardsLoading(false);
      setError("Board konnte nicht geladen werden.");
      return;
    }

    let isActive = true;

    async function loadBoard() {
      try {
        setIsBoardLoading(true);
        setError(null);
        setSaveError(null);

        const currentBoardId = boardId;

        if (!currentBoardId) {
          return;
        }

        const boardData = await loadBoardById(currentBoardId);

        if (!isActive) {
          return;
        }

        setBoard(boardData);
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Board konnte nicht geladen werden.");
      } finally {
        if (isActive) {
          setIsBoardLoading(false);
        }
      }
    }

    void loadBoard();

    return () => {
      isActive = false;
    };
  }, [boardId]);

  useEffect(() => {
    if (!boardId) {
      return;
    }

    let isActive = true;

    async function loadCards() {
      try {
        setIsCardsLoading(true);
        setError(null);
        setSaveError(null);

        const currentBoardId = boardId;

        if (!currentBoardId) {
          return;
        }

        const nextCards = await loadCardsForState(currentBoardId, viewMode, deferredSearchTerm);

        if (!isActive) {
          return;
        }

        setCards(nextCards);
      } catch (loadError) {
        if (!isActive) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Karten konnten nicht geladen werden.");
      } finally {
        if (isActive) {
          setIsCardsLoading(false);
        }
      }
    }

    void loadCards();

    return () => {
      isActive = false;
    };
  }, [boardId, deferredSearchTerm, viewMode]);

  const handleCreateCard = async (values: CardBaseFormValues) => {
    if (!board || !boardId) {
      throw new Error("Board konnte nicht geladen werden.");
    }

    const initialColumnId = findInitialColumnId(board);
    const payload: CreateCardPayload = {
      boardId,
      columnId: initialColumnId,
      responsibleName: values.responsibleName.trim(),
      deviceName: values.deviceName.trim(),
      priority: values.priority.trim(),
      dueDate: values.dueDate,
      partNumber: values.partNumber.trim(),
      serialNumber: values.serialNumber.trim(),
      sapNumber: values.sapNumber.trim(),
      orderNumber: values.orderNumber.trim()
    };

    setIsCreatingCard(true);
    setSaveError(null);

    try {
      await apiFetch<CardItem>("/cards", {
        method: "POST",
        body: payload
      });

      const nextViewMode: ViewMode = "active";
      const nextSearchTerm = "";
      setViewMode(nextViewMode);
      setSearchTerm(nextSearchTerm);

      const nextCards = await loadCardsForState(boardId, nextViewMode, nextSearchTerm);
      setCards(nextCards);
      setIsCreateModalOpen(false);
    } catch (createError) {
      setSaveError(
        createError instanceof Error
          ? createError.message
          : "Die Karte konnte nicht angelegt werden."
      );
      throw createError;
    } finally {
      setIsCreatingCard(false);
    }
  };

  const handleUpdateCard = async (values: CardBaseFormValues) => {
    if (!editingCard || !boardId) {
      throw new Error("Die Karte konnte nicht geladen werden.");
    }

    setIsUpdatingCard(true);
    setSaveError(null);

    try {
      await apiFetch<CardItem>(
        editMode === "manager" ? `/cards/${editingCard.id}/manager-correct` : `/cards/${editingCard.id}`,
        {
          method: "PUT",
          body: {
            responsibleName: values.responsibleName.trim(),
            deviceName: values.deviceName.trim(),
            priority: values.priority.trim(),
            dueDate: values.dueDate,
            partNumber: values.partNumber.trim(),
            serialNumber: values.serialNumber.trim(),
            sapNumber: values.sapNumber.trim(),
            orderNumber: values.orderNumber.trim()
          }
        }
      );

      const nextCards = await loadCardsForState(boardId, viewMode, deferredSearchTerm);
      setCards(nextCards);
      setEditingCard(null);
      setEditMode("normal");
    } catch (updateError) {
      setSaveError(
        updateError instanceof Error
          ? updateError.message
          : "Die Karte konnte nicht aktualisiert werden."
      );
      throw updateError;
    } finally {
      setIsUpdatingCard(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!board) {
      return;
    }

    const cardId = event.active.data.current?.cardId as string | undefined;
    const sourceColumnId = event.active.data.current?.columnId as string | undefined;
    const targetColumnId = event.over?.data.current?.columnId as string | undefined;

    if (!cardId || !sourceColumnId || !targetColumnId || sourceColumnId === targetColumnId) {
      return;
    }

    const previousCards = cards;
    const nextCards = moveCardToColumn(previousCards, board.columns, cardId, targetColumnId);

    setSaveError(null);
    setCards(nextCards);

    try {
      await apiFetch(`/cards/${cardId}/move`, {
        method: "PATCH",
        body: {
          targetColumnId
        }
      });
    } catch (saveMoveError) {
      setCards(previousCards);
      setSaveError(
        saveMoveError instanceof Error
          ? saveMoveError.message
          : "Die Kartenposition konnte nicht gespeichert werden."
      );
    }
  };

  const runBulkAction = async (
    action: BulkActionType,
    cardIds: string[],
    values?: { responsibleName?: string; targetColumnId?: string }
  ) => {
    if (!boardId) {
      throw new Error("Board konnte nicht geladen werden.");
    }

    let payload: BulkCardActionPayload;

    if (action === "archive") {
      payload = {
        action,
        boardId,
        cardIds
      };
    } else if (action === "assign") {
      payload = {
        action,
        boardId,
        cardIds,
        responsibleName: values?.responsibleName ?? ""
      };
    } else if (action === "move") {
      payload = {
        action,
        boardId,
        cardIds,
        targetColumnId: values?.targetColumnId ?? ""
      };
    } else {
      payload = {
        action,
        boardId,
        cardIds
      };
    }

    setIsBulkActionRunning(true);
    setActiveBulkAction(action);
    setSaveError(null);

    try {
      await apiFetch<BulkCardActionResponse>("/cards/bulk", {
        method: "POST",
        body: payload
      });

      const nextCards = await loadCardsForState(boardId, viewMode, deferredSearchTerm);
      setCards(nextCards);
    } catch (bulkError) {
      setSaveError(
        bulkError instanceof Error
          ? bulkError.message
          : "Die Massenaktion konnte nicht abgeschlossen werden."
      );
      throw bulkError;
    } finally {
      setIsBulkActionRunning(false);
      setActiveBulkAction(null);
    }
  };

  const handleArchiveCard = async (cardId: string) => {
    const previousCards = cards;

    setArchivingCardId(cardId);
    setSaveError(null);
    setCards((currentCards) => currentCards.filter((card) => card.id !== cardId));

    try {
      await apiFetch<CardItem>(`/cards/${cardId}/archive`, {
        method: "PATCH"
      });
    } catch (archiveError) {
      setCards(previousCards);
      setSaveError(
        archiveError instanceof Error
          ? archiveError.message
          : "Die Karte konnte nicht archiviert werden."
      );
    } finally {
      setArchivingCardId(null);
    }
  };

  const handleMoveCardToUc = async (cardId: string) => {
    const previousCards = cards;

    setMovingToUcCardId(cardId);
    setSaveError(null);
    setCards((currentCards) => currentCards.filter((card) => card.id !== cardId));

    try {
      await apiFetch<CardItem>(`/cards/${cardId}/uc`, {
        method: "PATCH"
      });
    } catch (moveToUcError) {
      setCards(previousCards);
      setSaveError(
        moveToUcError instanceof Error
          ? moveToUcError.message
          : "Die Karte konnte nicht in UC gelegt werden."
      );
    } finally {
      setMovingToUcCardId(null);
    }
  };

  const confirmDeleteCard = async () => {
    if (!deleteCandidate) {
      return;
    }

    const cardId = deleteCandidate.id;
    const previousCards = cards;

    setDeletingCardId(cardId);
    setSaveError(null);
    setCards((currentCards) => currentCards.filter((card) => card.id !== cardId));

    if (editingCard?.id === cardId) {
      setEditingCard(null);
    }

    try {
      await apiFetch<CardItem>(`/cards/${cardId}`, {
        method: "DELETE"
      });
      setDeleteCandidate(null);
    } catch (deleteError) {
      setCards(previousCards);
      setSaveError(
        deleteError instanceof Error ? deleteError.message : "Die Karte konnte nicht gelöscht werden."
      );
    } finally {
      setDeletingCardId(null);
    }
  };

  const confirmRestoreCard = async () => {
    if (!restoreCandidate || !boardId) {
      return;
    }

    const cardId = restoreCandidate.id;

    setRestoringCardId(cardId);
    setSaveError(null);

    try {
      await apiFetch<CardItem>(`/cards/${cardId}/archive/restore`, {
        method: "PATCH"
      });
      const nextCards = await loadCardsForState(boardId, viewMode, deferredSearchTerm);
      setCards(nextCards);
      setRestoreCandidate(null);
    } catch (restoreError) {
      setSaveError(
        restoreError instanceof Error
          ? restoreError.message
          : "Die Karte konnte nicht aus dem Archiv zurückgeholt werden."
      );
    } finally {
      setRestoringCardId(null);
    }
  };

  const confirmManagerMoveCard = async (targetColumnId: string) => {
    if (!managerMoveCandidate || !boardId) {
      return;
    }

    const cardId = managerMoveCandidate.id;

    setManagerMovingCardId(cardId);
    setSaveError(null);

    try {
      await apiFetch<CardItem>(`/cards/${cardId}/manager-move`, {
        method: "PATCH",
        body: {
          targetColumnId
        }
      });
      const nextCards = await loadCardsForState(boardId, viewMode, deferredSearchTerm);
      setCards(nextCards);
      setManagerMoveCandidate(null);
    } catch (moveError) {
      setSaveError(
        moveError instanceof Error
          ? moveError.message
          : "Die Karte konnte nicht manuell in die Spalte gesetzt werden."
      );
      throw moveError;
    } finally {
      setManagerMovingCardId(null);
    }
  };

  const handleRemoveCardFromUc = async (cardId: string) => {
    const previousCards = cards;

    setRemovingFromUcCardId(cardId);
    setSaveError(null);
    setCards((currentCards) => currentCards.filter((card) => card.id !== cardId));

    try {
      await apiFetch<CardItem>(`/cards/${cardId}/uc/remove`, {
        method: "PATCH"
      });
    } catch (removeUcError) {
      setCards(previousCards);
      setSaveError(
        removeUcError instanceof Error
          ? removeUcError.message
          : "Die Karte konnte nicht aus UC entfernt werden."
      );
    } finally {
      setRemovingFromUcCardId(null);
    }
  };

  return {
    board,
    cards,
    isBoardLoading,
    isCardsLoading,
    error,
    saveError,
    isCreateModalOpen,
    isCreatingCard,
    editingCard,
    editMode,
    deleteCandidate,
    restoreCandidate,
    managerMoveCandidate,
    isUpdatingCard,
    isBulkActionRunning,
    activeBulkAction,
    archivingCardId,
    deletingCardId,
    restoringCardId,
    managerMovingCardId,
    movingToUcCardId,
    removingFromUcCardId,
    viewMode,
    searchTerm,
    dragDisabled,
    sensors,
    setViewMode,
    setSearchTerm,
    refreshBoardData,
    openCreateCardModal: () => {
      setSaveError(null);
      setIsCreateModalOpen(true);
    },
    closeCreateCardModal: () => {
      if (isCreatingCard) {
        return;
      }

      setSaveError(null);
      setIsCreateModalOpen(false);
    },
    handleCreateCard,
    openEditCardModal: (card) => {
      if (card.archiveStatus === "ARCHIVED" || card.ucStatus === "IN_UC") {
        return;
      }

      setSaveError(null);
      setEditMode("normal");
      setEditingCard(card);
    },
    openManagerEditCardModal: (card) => {
      setSaveError(null);
      setEditMode("manager");
      setEditingCard(card);
    },
    closeEditCardModal: () => {
      if (isUpdatingCard) {
        return;
      }

      setSaveError(null);
      setEditMode("normal");
      setEditingCard(null);
    },
    requestDeleteCard: (card) => {
      setSaveError(null);
      setDeleteCandidate(card);
    },
    closeDeleteCardModal: () => {
      if (deletingCardId) {
        return;
      }

      setDeleteCandidate(null);
    },
    confirmDeleteCard,
    requestRestoreCard: (card) => {
      setSaveError(null);
      setRestoreCandidate(card);
    },
    closeRestoreCardModal: () => {
      if (restoringCardId) {
        return;
      }

      setRestoreCandidate(null);
    },
    confirmRestoreCard,
    requestManagerMoveCard: (card) => {
      setSaveError(null);
      setManagerMoveCandidate(card);
    },
    closeManagerMoveModal: () => {
      if (managerMovingCardId) {
        return;
      }

      setManagerMoveCandidate(null);
    },
    confirmManagerMoveCard,
    handleUpdateCard,
    runBulkAction,
    handleDragEnd,
    handleArchiveCard,
    handleMoveCardToUc,
    handleRemoveCardFromUc
  };
}
