import React from "react";
import type { BoardColumn } from "../../types/api";

type BulkActionType = "archive" | "assign" | "move" | "moveToUc";

type BulkCardActionModalProps = {
  action: BulkActionType | null;
  selectedCount: number;
  columns: BoardColumn[];
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: (values?: { responsibleName?: string; targetColumnId?: string }) => Promise<void>;
};

export function BulkCardActionModal({
  action,
  selectedCount,
  columns,
  isOpen,
  isSubmitting,
  error,
  onCancel,
  onConfirm
}: BulkCardActionModalProps) {
  const [responsibleName, setResponsibleName] = React.useState("");
  const [targetColumnId, setTargetColumnId] = React.useState("");
  const [localError, setLocalError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setResponsibleName("");
      setTargetColumnId(columns[0]?.id ?? "");
      setLocalError(null);
      return;
    }

    setLocalError(null);
    setTargetColumnId((current) => current || columns[0]?.id || "");
  }, [columns, isOpen]);

  if (!isOpen || !action) {
    return null;
  }

  const isArchive = action === "archive";
  const isAssign = action === "assign";
  const isMove = action === "move";
  const isMoveToUc = action === "moveToUc";

  const title = isArchive
    ? "Ausgewaehlte Karten archivieren?"
    : isAssign
      ? "Bearbeiter fuer Auswahl setzen"
      : isMove
        ? "Ausgewaehlte Karten verschieben"
        : "Ausgewaehlte Karten in UC legen?";

  const description = isArchive
    ? "Die ausgewaehlten aktiven Karten werden gemeinsam archiviert."
    : isAssign
      ? "Die ausgewaehlten aktiven Karten erhalten denselben Bearbeiter."
      : isMove
        ? "Die ausgewaehlten aktiven Karten werden gemeinsam in eine Zielspalte verschoben."
        : "Die ausgewaehlten aktiven Karten werden gemeinsam in UC gelegt.";

  const confirmLabel = isArchive
    ? "Jetzt archivieren"
    : isAssign
      ? "Bearbeiter zuweisen"
      : isMove
        ? "In Spalte verschieben"
        : "In UC legen";

  const handleConfirm = async () => {
    if (isAssign && responsibleName.trim().length === 0) {
      setLocalError("Bitte einen Bearbeiternamen eingeben.");
      return;
    }

    if (isMove && targetColumnId.trim().length === 0) {
      setLocalError("Bitte eine Zielspalte auswaehlen.");
      return;
    }

    setLocalError(null);
    await onConfirm({
      responsibleName: responsibleName.trim(),
      targetColumnId
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-zinc-500">
            Verwalter Aktion
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-zinc-100">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">{description}</p>
        </div>

        <div className="px-6 py-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700 dark:border-zinc-800 dark:bg-[#232323] dark:text-zinc-300">
            Auswahl: <span className="font-semibold">{selectedCount}</span> Karten
          </div>

          {isAssign ? (
            <label className="mt-5 flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
                Bearbeitername
              </span>
              <input
                value={responsibleName}
                onChange={(event) => setResponsibleName(event.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-[#212121] dark:text-zinc-100 dark:focus:border-zinc-600 dark:focus:bg-[#1b1b1b]"
                placeholder="Zustaendige Person"
              />
            </label>
          ) : null}

          {isMove ? (
            <label className="mt-5 flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
                Zielspalte
              </span>
              <select
                value={targetColumnId}
                onChange={(event) => setTargetColumnId(event.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-[#212121] dark:text-zinc-100 dark:focus:border-zinc-600 dark:focus:bg-[#1b1b1b]"
              >
                {columns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.title}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {localError || error ? (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
              {localError ?? error}
            </div>
          ) : null}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={isSubmitting}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-700 dark:hover:bg-zinc-600"
            >
              {isSubmitting ? "Speichert..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
