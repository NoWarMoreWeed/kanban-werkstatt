import React from "react";
import type { CardItem } from "../../types/api";

type DeleteCardConfirmModalProps = {
  card: CardItem | null;
  isOpen: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function DeleteCardConfirmModal({
  card,
  isOpen,
  isDeleting,
  onCancel,
  onConfirm
}: DeleteCardConfirmModalProps) {
  if (!isOpen || !card) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
      <div className="w-full max-w-xl rounded-3xl border border-rose-200 bg-white shadow-2xl dark:border-rose-900 dark:bg-zinc-900">
        <div className="border-b border-rose-200 px-6 py-5 dark:border-rose-900">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700 dark:text-rose-300">
            Verwalteraktion
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-zinc-100">
            Karte wirklich löschen?
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">
            Diese Aktion entfernt die Karte dauerhaft. Archivieren ist der normale Arbeitsweg,
            Löschen bleibt bewusst die Ausnahme.
          </p>
        </div>

        <div className="px-6 py-6">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 dark:border-rose-900 dark:bg-rose-950/30">
            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {card.deviceName}
            </p>
            <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">
              Bearbeiter: {card.responsibleName}
            </p>
            <p className="mt-1 text-sm text-slate-700 dark:text-zinc-300">P/N: {card.partNumber}</p>
            <p className="mt-1 text-sm text-slate-700 dark:text-zinc-300">
              Meldungsnummer: {card.orderNumber}
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={() => void onConfirm()}
              disabled={isDeleting}
              className="rounded-xl bg-rose-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-rose-700 dark:hover:bg-rose-600"
            >
              {isDeleting ? "Wird gelöscht…" : "Karte endgültig löschen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
