import React from "react";
import type { CardItem } from "../../types/api";

type RestoreArchivedCardConfirmModalProps = {
  card: CardItem | null;
  isOpen: boolean;
  isRestoring: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function RestoreArchivedCardConfirmModal({
  card,
  isOpen,
  isRestoring,
  onCancel,
  onConfirm
}: RestoreArchivedCardConfirmModalProps) {
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
            Karte aus dem Archiv zurückholen?
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">
            Die Karte wird wieder aktiv und in ihrer bisherigen Spalte am Ende der aktiven Karten
            einsortiert.
          </p>
        </div>

        <div className="px-6 py-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-zinc-800 dark:bg-[#232323]">
            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              {card.deviceName}
            </p>
            <p className="mt-2 text-sm text-slate-700 dark:text-zinc-300">
              Bearbeiter: {card.responsibleName}
            </p>
            <p className="mt-1 text-sm text-slate-700 dark:text-zinc-300">P/N: {card.partNumber}</p>
            <p className="mt-1 text-sm text-slate-700 dark:text-zinc-300">S/N: {card.serialNumber}</p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isRestoring}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={() => void onConfirm()}
              disabled={isRestoring}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-700 dark:hover:bg-zinc-600"
            >
              {isRestoring ? "Wird wiederhergestellt…" : "Aus dem Archiv zurückholen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
