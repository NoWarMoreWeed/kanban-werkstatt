import React from "react";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { useParams } from "react-router-dom";
import { BoardColumn } from "../components/board/BoardColumn";
import { StatePanel } from "../components/ui/StatePanel";
import { useAssigneeFilter } from "../features/assignee-filter/useAssigneeFilter";
import { useAssigneeAbsences } from "../features/assignee-absences";
import {
  BulkCardActionModal,
  CreateCardModal,
  DeleteCardConfirmModal,
  EditCardModal,
  ManagerMoveCardModal,
  RestoreArchivedCardConfirmModal
} from "../features/cards";
import { useBoardDetail } from "../features/board-detail/useBoardDetail";
import { ColumnManagerModal } from "../features/columns";
import { CardDetailsModal } from "../features/comments";
import { useManagerMode } from "../features/manager-mode/ManagerModeContext";
import { pagePaddingClass, panelPaddingClass } from "../styles/layout";
import type { CardItem } from "../types/api";

export function BoardDetailPage() {
  const [detailsCard, setDetailsCard] = React.useState<CardItem | null>(null);
  const [isColumnManagerOpen, setIsColumnManagerOpen] = React.useState(false);
  const [selectedCardIds, setSelectedCardIds] = React.useState<string[]>([]);
  const [bulkActionModal, setBulkActionModal] = React.useState<"archive" | "assign" | "move" | "moveToUc" | null>(null);
  const { boardId } = useParams();
  const {
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
    openCreateCardModal,
    closeCreateCardModal,
    handleCreateCard,
    openEditCardModal,
    openManagerEditCardModal,
    closeEditCardModal,
    requestDeleteCard,
    closeDeleteCardModal,
    confirmDeleteCard,
    requestRestoreCard,
    closeRestoreCardModal,
    confirmRestoreCard,
    requestManagerMoveCard,
    closeManagerMoveModal,
    confirmManagerMoveCard,
    handleUpdateCard,
    runBulkAction,
    handleDragEnd,
    handleArchiveCard,
    handleMoveCardToUc,
    handleRemoveCardFromUc
  } = useBoardDetail(boardId);
  const { isManagerModeActive } = useManagerMode();
  const { absentNameSet } = useAssigneeAbsences();
  const {
    currentUserName,
    assigneeNameFilter,
    filteredCards,
    filterMode,
    activeFilterLabel,
    hasCurrentUserName,
    hasActiveFilter,
    setCurrentUserName,
    setAssigneeNameFilter,
    toggleMineFilter,
    clearFilters
  } = useAssigneeFilter(cards, viewMode);

  React.useEffect(() => {
    setSelectedCardIds([]);
    setBulkActionModal(null);
  }, [boardId, viewMode, searchTerm]);

  if (isBoardLoading) {
    return (
      <section className={`flex min-h-screen items-center ${pagePaddingClass}`}>
        <StatePanel message="Board wird geladen…" />
      </section>
    );
  }

  if (error) {
    return (
      <section className={`flex min-h-screen items-center ${pagePaddingClass}`}>
        <StatePanel message={error} tone="error" />
      </section>
    );
  }

  if (!board) {
    return (
      <section className={`flex min-h-screen items-center ${pagePaddingClass}`}>
        <StatePanel message="Das angeforderte Board wurde nicht gefunden." tone="error" />
      </section>
    );
  }

  const managerSelectionEnabled = isManagerModeActive && viewMode === "active";
  return (
    <section className={`flex min-h-screen flex-col ${pagePaddingClass}`}>
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700 dark:text-zinc-500">
          {board.groupName}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-zinc-100">
          {board.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-zinc-400">
          Aktive Karten, UC und Archiv lassen sich getrennt betrachten. Die Suche bezieht sich
          immer auf die aktuell geöffnete Ansicht.
        </p>
      </div>

      {saveError ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200 sm:px-6">
          {saveError}
        </div>
      ) : null}

      <div
        className={`mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 xl:flex-row xl:items-center xl:justify-between ${panelPaddingClass}`}
      >
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setViewMode("active")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              viewMode === "active"
                ? "bg-slate-900 text-white dark:bg-zinc-700 dark:text-zinc-100"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            Aktive Karten
          </button>
          <button
            type="button"
            onClick={() => setViewMode("uc")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              viewMode === "uc"
                ? "bg-slate-900 text-white dark:bg-zinc-700 dark:text-zinc-100"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            UC
          </button>
          <button
            type="button"
            onClick={() => setViewMode("archived")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              viewMode === "archived"
                ? "bg-slate-900 text-white dark:bg-zinc-700 dark:text-zinc-100"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            Archiv
          </button>
          <button
            type="button"
            onClick={openCreateCardModal}
            className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 dark:bg-zinc-700 dark:hover:bg-zinc-600"
          >
            Neue Karte
          </button>
          {isManagerModeActive ? (
            <button
              type="button"
              onClick={() => setIsColumnManagerOpen(true)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
            >
              Spalten verwalten
            </button>
          ) : null}
        </div>

        <div className="flex w-full max-w-md flex-col gap-2">
          <label
            htmlFor="board-search"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-500"
          >
            Suche im aktuellen Modus
          </label>
          <input
            id="board-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Gerätebezeichnung, P/N, S/N, Auftragsnummer oder Meldungsnummer"
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:bg-white dark:border-zinc-700 dark:bg-[#212121] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-[#1b1b1b]"
          />
        </div>
      </div>

      {viewMode === "active" ? (
        <div
          className={`mt-4 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${panelPaddingClass}`}
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,280px)_minmax(0,280px)_auto] xl:items-end">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="current-user-name"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-500"
              >
                Mein Name für den Schnellfilter
              </label>
              <input
                id="current-user-name"
                type="text"
                value={currentUserName}
                onChange={(event) => setCurrentUserName(event.target.value)}
                placeholder="Zum Beispiel Max Müller"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:bg-white dark:border-zinc-700 dark:bg-[#212121] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-[#1b1b1b]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="assignee-filter"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-500"
              >
                Nach Bearbeiter filtern
              </label>
              <input
                id="assignee-filter"
                type="text"
                value={assigneeNameFilter}
                onChange={(event) => setAssigneeNameFilter(event.target.value)}
                placeholder="Bearbeitername eingeben"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:bg-white dark:border-zinc-700 dark:bg-[#212121] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-[#1b1b1b]"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleMineFilter}
                disabled={!hasCurrentUserName}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  filterMode === "mine"
                    ? "bg-slate-900 text-white dark:bg-zinc-700 dark:text-zinc-100"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                Nur meine Geräte
              </button>
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasActiveFilter}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              >
                Filter zurücksetzen
              </button>
            </div>
          </div>

          {!hasCurrentUserName ? (
            <p className="mt-3 text-sm text-slate-600 dark:text-zinc-400">
              Für den Schnellfilter `Nur meine Geräte` bitte zuerst den eigenen Namen eintragen.
            </p>
          ) : null}

          {activeFilterLabel ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white dark:bg-zinc-700 dark:text-zinc-100">
                Aktiver Filter
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">
                {activeFilterLabel}
              </span>
            </div>
          ) : null}

          {managerSelectionEnabled ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-zinc-800 dark:bg-[#232323]">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-500">
                    Verwalter Auswahl
                  </p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-zinc-300">
                    {selectedCardIds.length === 0
                      ? "Keine Karten ausgewählt."
                      : `${selectedCardIds.length} Karten ausgewählt.`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkActionModal("assign")}
                    disabled={selectedCardIds.length === 0}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                  >
                    Bearbeiter zuweisen
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkActionModal("move")}
                    disabled={selectedCardIds.length === 0}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                  >
                    In Spalte verschieben
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkActionModal("moveToUc")}
                    disabled={selectedCardIds.length === 0}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                  >
                    Auf UC setzen
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkActionModal("archive")}
                    disabled={selectedCardIds.length === 0}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                  >
                    Archivieren
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCardIds([])}
                    disabled={selectedCardIds.length === 0}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                  >
                    Auswahl löschen
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {filteredCards.some((card) =>
            absentNameSet.has(card.responsibleName.trim().toLocaleLowerCase("de-DE"))
          ) ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              Karten von aktuell abwesenden Bearbeitern sind im Board mit `Abwesend` markiert.
            </div>
          ) : null}
        </div>
      ) : null}

      {isCardsLoading ? (
        <div className="mt-4">
          <StatePanel message="Karten werden geladen…" />
        </div>
      ) : null}

      {dragDisabled && viewMode === "active" ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          Während einer Suche ist Drag-and-Drop deaktiviert, damit die Ansicht stabil bleibt.
        </div>
      ) : null}

      {viewMode === "archived" ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          Archivierte Karten werden getrennt vom aktiven Board angezeigt. Im Verwaltermodus können
          sie von hier aus gezielt zurückgeholt werden.
        </div>
      ) : null}

      {viewMode === "uc" ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          UC-Karten sind fachlich aus dem aktiven Board herausgenommen. Von hier aus können sie
          wieder in ihre vorherige Spalte zurückgeführt werden.
        </div>
      ) : null}

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="mt-8">
          <div className="flex gap-4 overflow-x-auto pb-4 xl:grid xl:grid-cols-5 xl:overflow-visible xl:pb-0">
            {board.columns.map((column) => {
              const sourceCards = viewMode === "active" ? filteredCards : cards;
              const columnCards = sourceCards
                .filter((card) => card.columnId === column.id)
                .sort((left, right) => left.position - right.position);

              return (
                <div
                  key={column.id}
                  className="flex-shrink-0 basis-[85%] sm:basis-[55%] md:basis-[360px] xl:flex-shrink xl:basis-auto"
                >
                  <BoardColumn
                    column={column}
                    cards={columnCards}
                    absentNameSet={absentNameSet}
                    selectableCards={managerSelectionEnabled}
                    selectedCardIds={selectedCardIds}
                    onToggleSelectedCard={(cardId) => {
                      setSelectedCardIds((current) =>
                        current.includes(cardId)
                          ? current.filter((selectedId) => selectedId !== cardId)
                          : [...current, cardId]
                      );
                    }}
                    onEdit={viewMode === "active" ? openEditCardModal : undefined}
                    onManagerEdit={
                      isManagerModeActive && viewMode !== "active"
                        ? openManagerEditCardModal
                        : undefined
                    }
                    onArchive={viewMode === "active" ? handleArchiveCard : undefined}
                    onDelete={isManagerModeActive ? requestDeleteCard : undefined}
                    onRestoreFromArchive={
                      isManagerModeActive && viewMode === "archived" ? requestRestoreCard : undefined
                    }
                    onManagerMove={
                      isManagerModeActive && viewMode === "active"
                        ? requestManagerMoveCard
                        : undefined
                    }
                    onMoveToUc={viewMode === "active" ? handleMoveCardToUc : undefined}
                    onRemoveFromUc={viewMode === "uc" ? handleRemoveCardFromUc : undefined}
                    editingCardId={editingCard?.id ?? null}
                    archivingCardId={archivingCardId}
                    deletingCardId={deletingCardId}
                    restoringCardId={restoringCardId}
                    managerMovingCardId={managerMovingCardId}
                    movingToUcCardId={movingToUcCardId}
                    removingFromUcCardId={removingFromUcCardId}
                    dragDisabled={dragDisabled}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </DndContext>

      <CreateCardModal
        boardTitle={board.title}
        isOpen={isCreateModalOpen}
        isSaving={isCreatingCard}
        saveError={saveError}
        onClose={closeCreateCardModal}
        onSubmit={handleCreateCard}
      />
      <EditCardModal
        card={editingCard}
        isOpen={editingCard !== null}
        isSaving={isUpdatingCard}
        saveError={saveError}
        mode={editMode}
        onClose={closeEditCardModal}
        onSubmit={handleUpdateCard}
      />
      <DeleteCardConfirmModal
        card={deleteCandidate}
        isOpen={deleteCandidate !== null}
        isDeleting={deletingCardId !== null}
        onCancel={closeDeleteCardModal}
        onConfirm={confirmDeleteCard}
      />
      <RestoreArchivedCardConfirmModal
        card={restoreCandidate}
        isOpen={restoreCandidate !== null}
        isRestoring={restoringCardId !== null}
        onCancel={closeRestoreCardModal}
        onConfirm={confirmRestoreCard}
      />
      <ManagerMoveCardModal
        card={managerMoveCandidate}
        columns={board.columns}
        isOpen={managerMoveCandidate !== null}
        isSaving={managerMovingCardId !== null}
        saveError={saveError}
        onCancel={closeManagerMoveModal}
        onConfirm={confirmManagerMoveCard}
      />
      <CardDetailsModal
        card={detailsCard}
        isOpen={detailsCard !== null}
        onClose={() => setDetailsCard(null)}
      />
      <BulkCardActionModal
        action={bulkActionModal}
        selectedCount={selectedCardIds.length}
        columns={board.columns}
        isOpen={bulkActionModal !== null}
        isSubmitting={isBulkActionRunning}
        error={saveError}
        onCancel={() => {
          if (isBulkActionRunning) {
            return;
          }

          setBulkActionModal(null);
        }}
        onConfirm={async (values) => {
          if (!bulkActionModal || !boardId) {
            return;
          }

          await runBulkAction(bulkActionModal, selectedCardIds, values);
          setSelectedCardIds([]);
          setBulkActionModal(null);
        }}
      />
      {boardId ? (
        <ColumnManagerModal
          boardId={boardId}
          isOpen={isColumnManagerOpen}
          onClose={() => setIsColumnManagerOpen(false)}
          onColumnsChanged={refreshBoardData}
        />
      ) : null}
    </section>
  );
}
