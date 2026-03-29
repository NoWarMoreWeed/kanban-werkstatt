import React from "react";
import { useDroppable } from "@dnd-kit/core";
import type { BoardColumn as BoardColumnType, CardItem } from "../../types/api";
import { BoardCard } from "./BoardCard";

type BoardColumnProps = {
  column: BoardColumnType;
  cards: CardItem[];
  absentNameSet?: Set<string>;
  selectableCards?: boolean;
  selectedCardIds?: string[];
  onToggleSelectedCard?: (cardId: string) => void;
  onEdit?: (card: CardItem) => void;
  onManagerEdit?: (card: CardItem) => void;
  onArchive?: (cardId: string) => void;
  onDelete?: (card: CardItem) => void;
  onRestoreFromArchive?: (card: CardItem) => void;
  onManagerMove?: (card: CardItem) => void;
  onMoveToUc?: (cardId: string) => void;
  onRemoveFromUc?: (cardId: string) => void;
  editingCardId?: string | null;
  archivingCardId?: string | null;
  deletingCardId?: string | null;
  restoringCardId?: string | null;
  managerMovingCardId?: string | null;
  movingToUcCardId?: string | null;
  removingFromUcCardId?: string | null;
  dragDisabled?: boolean;
};

export function BoardColumn({
  column,
  cards,
  absentNameSet,
  selectableCards = false,
  selectedCardIds = [],
  onToggleSelectedCard,
  onEdit,
  onManagerEdit,
  onArchive,
  onDelete,
  onRestoreFromArchive,
  onManagerMove,
  onMoveToUc,
  onRemoveFromUc,
  editingCardId,
  archivingCardId,
  deletingCardId,
  restoringCardId,
  managerMovingCardId,
  movingToUcCardId,
  removingFromUcCardId,
  dragDisabled = false
}: BoardColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
    disabled: dragDisabled,
    data: {
      type: "column",
      columnId: column.id
    }
  });

  return (
    <section
      ref={setNodeRef}
      className={`min-h-[280px] rounded-2xl border bg-white p-4 shadow-sm transition-colors dark:bg-zinc-900 ${
        isOver
          ? "border-slate-300 bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800"
          : "border-slate-200 dark:border-zinc-800"
      }`}
    >
      <header className="border-b border-slate-100 pb-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700 dark:text-zinc-200">
          {column.title}
        </h3>
        <p className="mt-2 text-xs text-slate-500 dark:text-zinc-500">{cards.length} Karten</p>
      </header>

      <div className="mt-4 space-y-3">
        {cards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-zinc-800 dark:bg-[#232323] dark:text-zinc-500">
            {dragDisabled ? "Keine Karten in dieser Spalte" : "Karte hier ablegen"}
          </div>
        ) : (
          cards.map((card) => (
            <BoardCard
              key={card.id}
              card={card}
              isAbsenceRisk={Boolean(
                absentNameSet?.has(card.responsibleName.trim().toLocaleLowerCase("de-DE"))
              )}
              selectable={selectableCards}
              isSelected={selectedCardIds.includes(card.id)}
              onToggleSelected={onToggleSelectedCard}
              onEdit={onEdit}
              onManagerEdit={onManagerEdit}
              onArchive={onArchive}
              onDelete={onDelete}
              onRestoreFromArchive={onRestoreFromArchive}
              onManagerMove={onManagerMove}
              onMoveToUc={onMoveToUc}
              onRemoveFromUc={onRemoveFromUc}
              isEditing={editingCardId === card.id}
              isArchiving={archivingCardId === card.id}
              isDeleting={deletingCardId === card.id}
              isRestoring={restoringCardId === card.id}
              isManagerMoving={managerMovingCardId === card.id}
              isMovingToUc={movingToUcCardId === card.id}
              isRemovingFromUc={removingFromUcCardId === card.id}
              dragDisabled={dragDisabled}
            />
          ))
        )}
      </div>
    </section>
  );
}
