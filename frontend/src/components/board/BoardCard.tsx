import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { CardItem } from "../../types/api";

type BoardCardProps = {
  card: CardItem;
  isAbsenceRisk?: boolean;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelected?: (cardId: string) => void;
  onEdit?: (card: CardItem) => void;
  onManagerEdit?: (card: CardItem) => void;
  onArchive?: (cardId: string) => void;
  onDelete?: (card: CardItem) => void;
  onRestoreFromArchive?: (card: CardItem) => void;
  onManagerMove?: (card: CardItem) => void;
  onMoveToUc?: (cardId: string) => void;
  onRemoveFromUc?: (cardId: string) => void;
  isEditing?: boolean;
  isArchiving?: boolean;
  isDeleting?: boolean;
  isRestoring?: boolean;
  isManagerMoving?: boolean;
  isMovingToUc?: boolean;
  isRemovingFromUc?: boolean;
  dragDisabled?: boolean;
};

export function BoardCard({
  card,
  isAbsenceRisk = false,
  selectable = false,
  isSelected = false,
  onToggleSelected,
  onEdit,
  onManagerEdit,
  onArchive,
  onDelete,
  onRestoreFromArchive,
  onManagerMove,
  onMoveToUc,
  onRemoveFromUc,
  isEditing = false,
  isArchiving = false,
  isDeleting = false,
  isRestoring = false,
  isManagerMoving = false,
  isMovingToUc = false,
  isRemovingFromUc = false,
  dragDisabled = false
}: BoardCardProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    disabled: dragDisabled,
    data: {
      type: "card",
      cardId: card.id,
      columnId: card.columnId
    }
  });

  const hasManagerActions = Boolean(
    onManagerEdit || onDelete || onRestoreFromArchive || onManagerMove
  );
  const hasPrimaryActions = Boolean(onEdit || onArchive || onMoveToUc || onRemoveFromUc);
  const canOpenMenu = hasPrimaryActions || hasManagerActions;

  return (
    <article
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: CSS.Translate.toString(transform)
      }}
      className={`rounded-xl border p-3 ${
        isAbsenceRisk
          ? "border-amber-300 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20"
          : "border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-[#232323]"
      } ${
        isDragging ? "opacity-60 shadow-md" : ""
      } ${dragDisabled ? "" : "cursor-grab active:cursor-grabbing"} rounded-lg border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            {selectable ? (
              <label
                className="mt-0.5 flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center"
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelected?.(card.id)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-500"
                />
              </label>
            ) : null}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-950 dark:text-zinc-100">
                P/N: {card.partNumber}
              </p>
              <p className="truncate text-sm font-semibold text-slate-950 dark:text-zinc-100">
                S/N: {card.serialNumber}
              </p>
              <p className="mt-2 truncate text-xs text-slate-600 dark:text-zinc-400">
                {card.responsibleName}
              </p>
            </div>
          </div>
        </div>

        <div
          className="relative flex shrink-0 items-start gap-2"
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label={isExpanded ? "Zusatzinfos einklappen" : "Zusatzinfos aufklappen"}
            title={isExpanded ? "Zusatzinfos einklappen" : "Zusatzinfos aufklappen"}
            onClick={() => setIsExpanded((current) => !current)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
          >
            <span
              aria-hidden="true"
              className={`text-sm leading-none transition-transform ${isExpanded ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </button>

          {card.archiveStatus === "ARCHIVED" ? (
            <span className="rounded-full bg-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
              Archiv
            </span>
          ) : null}

          {card.ucStatus === "IN_UC" ? (
            <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              UC
            </span>
          ) : null}

          {isAbsenceRisk ? (
            <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              Abwesend
            </span>
          ) : null}

          {canOpenMenu ? (
            <div className="relative">
              <button
                type="button"
                aria-label="Kartenaktionen"
                title="Kartenaktionen"
                onClick={() => setIsMenuOpen((current) => !current)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
              >
                <span className="flex items-center gap-1" aria-hidden="true">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                </span>
              </button>

              {isMenuOpen ? (
                <div className="absolute right-0 top-full z-50 mt-2 flex min-w-[180px] flex-col gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                  {onEdit ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onEdit(card);
                      }}
                      disabled={isEditing}
                      className="rounded-lg border border-transparent px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-slate-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      {isEditing ? "Wird gespeichert…" : "Bearbeiten"}
                    </button>
                  ) : null}

                  {onMoveToUc ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onMoveToUc(card.id);
                      }}
                      disabled={isMovingToUc}
                      className="rounded-lg border border-transparent px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-slate-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      {isMovingToUc ? "Wird gespeichert…" : "In UC legen"}
                    </button>
                  ) : null}

                  {onRemoveFromUc ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onRemoveFromUc(card.id);
                      }}
                      disabled={isRemovingFromUc}
                      className="rounded-lg border border-transparent px-3 py-2 text-left text-sm font-semibold text-emerald-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-emerald-300 dark:hover:border-emerald-900 dark:hover:bg-emerald-950/30"
                    >
                      {isRemovingFromUc ? "Wird gespeichert…" : "UC entfernen"}
                    </button>
                  ) : null}

                  {onArchive ? (
                    <>
                      <div className="my-1 border-t border-slate-200 dark:border-zinc-800" />
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onArchive(card.id);
                        }}
                        disabled={isArchiving}
                        className="rounded-lg border border-transparent px-3 py-2 text-left text-sm font-medium text-slate-500 transition-colors hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                      >
                        {isArchiving ? "Wird gespeichert…" : "Archivieren"}
                      </button>
                    </>
                  ) : null}

                  {hasManagerActions ? (
                    <>
                      <div className="my-1 border-t border-slate-200 dark:border-zinc-800" />
                      <p className="px-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-500">
                        Verwalter
                      </p>
                    </>
                  ) : null}

                  {onManagerEdit ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onManagerEdit(card);
                      }}
                      disabled={isEditing}
                      className="rounded-lg border border-transparent px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-slate-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      {isEditing ? "Wird gespeichert…" : "Korrektur bearbeiten"}
                    </button>
                  ) : null}

                  {onManagerMove ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onManagerMove(card);
                      }}
                      disabled={isManagerMoving}
                      className="rounded-lg border border-transparent px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-slate-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      {isManagerMoving ? "Wird gespeichert…" : "Spalte manuell setzen"}
                    </button>
                  ) : null}

                  {onRestoreFromArchive ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onRestoreFromArchive(card);
                      }}
                      disabled={isRestoring}
                      className="rounded-lg border border-transparent px-3 py-2 text-left text-sm font-semibold text-slate-700 transition-colors hover:border-slate-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      {isRestoring ? "Wird wiederhergestellt…" : "Aus dem Archiv zurückholen"}
                    </button>
                  ) : null}

                  {onDelete ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onDelete(card);
                      }}
                      disabled={isDeleting}
                      className="mt-1 rounded-lg border border-rose-200 px-3 py-2 text-left text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/30"
                    >
                      {isDeleting ? "Wird gelöscht…" : "Löschen"}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {isExpanded ? (
        <dl className="mt-3 grid gap-2 border-t border-slate-200 pt-3 text-xs text-slate-600 dark:border-zinc-800 dark:text-zinc-300">
          <CompactField label="Gerät" value={card.deviceName} />
          <CompactField label="P/N" value={card.partNumber} />
          <CompactField label="S/N" value={card.serialNumber} />
          <CompactField label="Bearbeiter" value={card.responsibleName} />
          <CompactField label="Auftragsnummer" value={card.sapNumber} />
          <CompactField label="Meldungsnummer" value={card.orderNumber} />
          <CompactField label="Priorität" value={card.priority} />
          <CompactField label="Eckende" value={formatDate(card.dueDate)} />
        </dl>
      ) : null}
    </article>
  );
}

type CompactFieldProps = {
  label: string;
  value: string;
};

function CompactField({ label, value }: CompactFieldProps) {
  return (
    <div className="grid grid-cols-[112px_1fr] gap-2">
      <dt className="font-semibold text-slate-500 dark:text-zinc-500">{label}</dt>
      <dd className="break-all">{value}</dd>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium"
  }).format(date);
}
