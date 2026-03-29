import React from "react";
import { apiFetch } from "../../lib/api";
import { getFieldErrorMessage, useZodForm } from "../../lib/forms";
import type {
  BoardColumnsManagerResponse,
  CreateColumnPayload,
  ManagerColumnItem,
  ReorderColumnPayload,
  UpdateColumnActivePayload,
  UpdateColumnPayload
} from "../../types/api";
import {
  columnManagerFormDefaultValues,
  columnManagerFormSchema,
  type ColumnManagerFormValues
} from "./column-manager.schema";

type ColumnManagerModalProps = {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
  onColumnsChanged: () => Promise<void>;
};

export function ColumnManagerModal({
  boardId,
  isOpen,
  onClose,
  onColumnsChanged
}: ColumnManagerModalProps) {
  const [columns, setColumns] = React.useState<ManagerColumnItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [editingColumn, setEditingColumn] = React.useState<ManagerColumnItem | null>(null);
  const [busyColumnId, setBusyColumnId] = React.useState<string | null>(null);
  const [boardLabel, setBoardLabel] = React.useState<string>("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useZodForm({
    schema: columnManagerFormSchema,
    defaultValues: columnManagerFormDefaultValues
  });

  const loadColumns = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await apiFetch<BoardColumnsManagerResponse>(`/columns/boards/${boardId}`);
      setColumns(response.columns);
      setBoardLabel(response.board.title);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Spalten konnten nicht geladen werden."
      );
    } finally {
      setIsLoading(false);
    }
  }, [boardId]);

  React.useEffect(() => {
    if (!isOpen) {
      setEditingColumn(null);
      setSaveError(null);
      reset(columnManagerFormDefaultValues);
      return;
    }

    void loadColumns();
  }, [isOpen, loadColumns, reset]);

  if (!isOpen) {
    return null;
  }

  const refreshBoard = async () => {
    await Promise.all([loadColumns(), onColumnsChanged()]);
  };

  const submitForm = handleSubmit(async (values: ColumnManagerFormValues) => {
    setSaveError(null);

    try {
      if (editingColumn) {
        await apiFetch<ManagerColumnItem>(`/columns/${editingColumn.id}`, {
          method: "PUT",
          body: values satisfies UpdateColumnPayload
        });
      } else {
        await apiFetch<ManagerColumnItem>(`/columns/boards/${boardId}`, {
          method: "POST",
          body: values satisfies CreateColumnPayload
        });
      }

      setEditingColumn(null);
      reset(columnManagerFormDefaultValues);
      await refreshBoard();
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Spalte konnte nicht gespeichert werden."
      );
    }
  });

  const runColumnAction = async (
    columnId: string,
    action: () => Promise<void>
  ) => {
    setBusyColumnId(columnId);
    setSaveError(null);

    try {
      await action();
      await refreshBoard();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Spaltenaktion fehlgeschlagen.");
    } finally {
      setBusyColumnId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-zinc-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-zinc-500">
              Verwalter Modus
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-zinc-100">
              Spalten verwalten
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
              Board: {boardLabel || "Wird geladen..."}.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Schliessen
          </button>
        </div>

        <div className="grid gap-0 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="border-b border-slate-200 px-6 py-6 dark:border-zinc-800 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-lg font-semibold text-slate-950 dark:text-zinc-100">
                Spaltenliste
              </h4>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                {columns.length}
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-600 dark:text-zinc-400">
              Umbenennen, Reihenfolge aendern und leere Spalten aktivieren oder deaktivieren.
            </p>

            <div className="mt-5 space-y-3">
              {isLoading ? (
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  Spalten werden geladen...
                </p>
              ) : loadError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
                  {loadError}
                </div>
              ) : columns.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500 dark:border-zinc-800 dark:bg-[#232323] dark:text-zinc-500">
                  Noch keine Spalten vorhanden.
                </div>
              ) : (
                columns.map((column, index) => {
                  const isBusy = busyColumnId === column.id;
                  const hasCards = column.cardCount > 0 || column.previousCardCount > 0;

                  return (
                    <article
                      key={column.id}
                      className={`rounded-2xl border px-4 py-4 ${
                        column.isActive
                          ? "border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-[#232323]"
                          : "border-slate-200 bg-slate-100/80 opacity-85 dark:border-zinc-800 dark:bg-zinc-950/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-950 dark:text-zinc-100">
                              {column.position}. {column.title}
                            </p>
                            <span
                              className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                                column.isActive
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : "bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"
                              }`}
                            >
                              {column.isActive ? "Aktiv" : "Inaktiv"}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-slate-500 dark:text-zinc-500">
                            Key: {column.key}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                            Karten: {column.cardCount}
                            {column.previousCardCount > 0
                              ? `, UC Ruecksprung: ${column.previousCardCount}`
                              : ""}
                          </p>
                          {!column.canDeactivate && !column.isActive ? null : null}
                          {!column.canDeactivate && column.isActive ? (
                            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                              {hasCards
                                ? "Deaktivieren erst moeglich, wenn keine Karten oder UC Bezuege mehr vorhanden sind."
                                : column.key === "eingang"
                                  ? "Die Startspalte Eingang bleibt aktiv, damit neue Karten sauber angelegt werden koennen."
                                  : "Diese Spalte bleibt aktiv."}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingColumn(column);
                              setSaveError(null);
                              reset({ title: column.title });
                            }}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-white dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                          >
                            Bearbeiten
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void runColumnAction(column.id, async () => {
                                await apiFetch<ManagerColumnItem>(`/columns/${column.id}/reorder`, {
                                  method: "PATCH",
                                  body: { direction: "up" } satisfies ReorderColumnPayload
                                });
                              })
                            }
                            disabled={isBusy || index === 0}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                          >
                            Hoch
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void runColumnAction(column.id, async () => {
                                await apiFetch<ManagerColumnItem>(`/columns/${column.id}/reorder`, {
                                  method: "PATCH",
                                  body: { direction: "down" } satisfies ReorderColumnPayload
                                });
                              })
                            }
                            disabled={isBusy || index === columns.length - 1}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                          >
                            Runter
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void runColumnAction(column.id, async () => {
                                await apiFetch<ManagerColumnItem>(`/columns/${column.id}/active`, {
                                  method: "PATCH",
                                  body: {
                                    isActive: !column.isActive
                                  } satisfies UpdateColumnActivePayload
                                });
                              })
                            }
                            disabled={isBusy || (column.isActive && !column.canDeactivate)}
                            className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                              column.isActive
                                ? "border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                                : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                            }`}
                          >
                            {column.isActive ? "Deaktivieren" : "Aktivieren"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <section className="px-6 py-6">
            <h4 className="text-lg font-semibold text-slate-950 dark:text-zinc-100">
              {editingColumn ? "Spalte umbenennen" : "Neue Spalte anlegen"}
            </h4>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
              Neue Spalten werden am Ende einsortiert. Die technische Key-Struktur wird stabil aus
              dem Titel abgeleitet.
            </p>

            <form onSubmit={submitForm} className="mt-5 space-y-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
                  Spaltenname
                </span>
                <input
                  {...register("title")}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:bg-white dark:border-zinc-700 dark:bg-[#212121] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-[#1b1b1b]"
                  placeholder="Zum Beispiel Pruefung"
                />
                {getFieldErrorMessage(errors.title) ? (
                  <span className="text-sm text-rose-700 dark:text-rose-300">
                    {getFieldErrorMessage(errors.title)}
                  </span>
                ) : null}
              </label>

              {saveError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
                  {saveError}
                </div>
              ) : null}

              <div className="flex justify-end gap-3">
                {editingColumn ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingColumn(null);
                      setSaveError(null);
                      reset(columnManagerFormDefaultValues);
                    }}
                    disabled={isSubmitting}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                  >
                    Bearbeitung beenden
                  </button>
                ) : null}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                >
                  {isSubmitting
                    ? "Speichert..."
                    : editingColumn
                      ? "Aenderungen speichern"
                      : "Spalte hinzufuegen"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
