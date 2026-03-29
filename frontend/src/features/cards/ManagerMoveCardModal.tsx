import React from "react";
import type { BoardColumn, CardItem } from "../../types/api";

type ManagerMoveCardModalProps = {
  card: CardItem | null;
  columns: BoardColumn[];
  isOpen: boolean;
  isSaving: boolean;
  saveError: string | null;
  onCancel: () => void;
  onConfirm: (targetColumnId: string) => Promise<void>;
};

export function ManagerMoveCardModal({
  card,
  columns,
  isOpen,
  isSaving,
  saveError,
  onCancel,
  onConfirm
}: ManagerMoveCardModalProps) {
  const [targetColumnId, setTargetColumnId] = React.useState("");

  React.useEffect(() => {
    if (!isOpen || !card) {
      setTargetColumnId("");
      return;
    }

    setTargetColumnId(card.columnId);
  }, [card, isOpen]);

  if (!isOpen || !card) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-zinc-500">
            Verwalteraktion
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-zinc-100">
            Karte manuell in Spalte setzen
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">
            Diese Korrektur ist für Ausnahmefälle gedacht, wenn der normale Ablauf nicht
            ausreicht.
          </p>
        </div>

        <div className="px-6 py-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-zinc-800 dark:bg-[#232323]">
            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {card.deviceName}
            </p>
            <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">P/N: {card.partNumber}</p>
            <p className="mt-1 text-sm text-slate-700 dark:text-zinc-300">S/N: {card.serialNumber}</p>
          </div>

          <label className="mt-5 flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
              Zielspalte
            </span>
            <select
              value={targetColumnId}
              onChange={(event) => setTargetColumnId(event.target.value)}
              disabled={isSaving}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-[#212121] dark:text-zinc-100 dark:focus:border-zinc-600 dark:focus:bg-[#1b1b1b]"
            >
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>
          </label>

          {saveError ? (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
              {saveError}
            </div>
          ) : null}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={() => void onConfirm(targetColumnId)}
              disabled={isSaving || !targetColumnId || targetColumnId === card.columnId}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-700 dark:hover:bg-zinc-600"
            >
              {isSaving ? "Wird gespeichert…" : "Spalte korrigieren"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
