import React from "react";
import { apiFetch } from "../../lib/api";
import { getFieldErrorMessage, useZodForm } from "../../lib/forms";
import type {
  CreatePartNumberSuggestionPayload,
  PartNumberSuggestionItem,
  PartNumberSuggestionListResponse
} from "../../types/api";
import {
  partNumberSuggestionFormDefaultValues,
  partNumberSuggestionFormSchema,
  type PartNumberSuggestionFormValues
} from "./part-number-suggestion.schema";

type PartNumberSuggestionManagerModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function PartNumberSuggestionManagerModal({
  isOpen,
  onClose
}: PartNumberSuggestionManagerModalProps) {
  const [suggestions, setSuggestions] = React.useState<PartNumberSuggestionItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [editingSuggestion, setEditingSuggestion] = React.useState<PartNumberSuggestionItem | null>(
    null
  );
  const [deletingSuggestionId, setDeletingSuggestionId] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useZodForm({
    schema: partNumberSuggestionFormSchema,
    defaultValues: partNumberSuggestionFormDefaultValues
  });

  const loadSuggestions = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await apiFetch<PartNumberSuggestionListResponse>(
        "/part-number-suggestions?limit=50"
      );
      setSuggestions(response.suggestions);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Die P/N-Vorschläge konnten nicht geladen werden."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      setEditingSuggestion(null);
      setSaveError(null);
      reset(partNumberSuggestionFormDefaultValues);
      return;
    }

    void loadSuggestions();
  }, [isOpen, loadSuggestions, reset]);

  if (!isOpen) {
    return null;
  }

  const submitForm = handleSubmit(async (values: PartNumberSuggestionFormValues) => {
    setSaveError(null);

    try {
      if (editingSuggestion) {
        const updated = await apiFetch<PartNumberSuggestionItem>(
          `/part-number-suggestions/${editingSuggestion.id}`,
          {
            method: "PUT",
            body: values satisfies CreatePartNumberSuggestionPayload
          }
        );

        setSuggestions((current) =>
          current
            .map((suggestion) => (suggestion.id === updated.id ? updated : suggestion))
            .sort((left, right) => left.partNumber.localeCompare(right.partNumber))
        );
      } else {
        const created = await apiFetch<PartNumberSuggestionItem>("/part-number-suggestions", {
          method: "POST",
          body: values satisfies CreatePartNumberSuggestionPayload
        });

        setSuggestions((current) =>
          [...current, created].sort((left, right) => left.partNumber.localeCompare(right.partNumber))
        );
      }

      setEditingSuggestion(null);
      reset(partNumberSuggestionFormDefaultValues);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Der P/N-Vorschlag konnte nicht gespeichert werden."
      );
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-zinc-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-zinc-500">
              Verwaltermodus
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-zinc-100">
              P/N Vorschlagsliste
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
              Neue P/N-Einträge können hier schlank gepflegt werden. Die Kartenformulare nutzen
              diese Liste direkt für Vorschläge.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Schließen
          </button>
        </div>

        <div className="grid gap-0 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="border-b border-slate-200 px-6 py-6 dark:border-zinc-800 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-lg font-semibold text-slate-950 dark:text-zinc-100">
                Bestehende Eintraege
              </h4>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                {suggestions.length}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {isLoading ? (
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  P/N-Vorschläge werden geladen…
                </p>
              ) : loadError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
                  {loadError}
                </div>
              ) : suggestions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500 dark:border-zinc-800 dark:bg-[#232323] dark:text-zinc-500">
                  Noch keine P/N-Vorschläge vorhanden.
                </div>
              ) : (
                suggestions.map((suggestion) => (
                  <article
                    key={suggestion.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-zinc-800 dark:bg-[#232323]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-950 dark:text-zinc-100">
                          {suggestion.partNumber}
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
                          {suggestion.deviceName || "Keine Gerätebezeichnung hinterlegt"}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSuggestion(suggestion);
                            setSaveError(null);
                            reset({
                              partNumber: suggestion.partNumber,
                              deviceName: suggestion.deviceName ?? ""
                            });
                          }}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-white dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                        >
                          Bearbeiten
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const shouldDelete = window.confirm(
                              `P/N ${suggestion.partNumber} wirklich entfernen?`
                            );

                            if (!shouldDelete) {
                              return;
                            }

                            setDeletingSuggestionId(suggestion.id);
                            setSaveError(null);

                            try {
                              await apiFetch(`/part-number-suggestions/${suggestion.id}`, {
                                method: "DELETE"
                              });
                              setSuggestions((current) =>
                                current.filter((entry) => entry.id !== suggestion.id)
                              );

                              if (editingSuggestion?.id === suggestion.id) {
                                setEditingSuggestion(null);
                                reset(partNumberSuggestionFormDefaultValues);
                              }
                            } catch (error) {
                              setSaveError(
                                error instanceof Error
                                  ? error.message
                                  : "Der P/N-Vorschlag konnte nicht entfernt werden."
                              );
                            } finally {
                              setDeletingSuggestionId(null);
                            }
                          }}
                          disabled={deletingSuggestionId === suggestion.id}
                          className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/30"
                        >
                          {deletingSuggestionId === suggestion.id ? "Wird entfernt…" : "Entfernen"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="px-6 py-6">
            <h4 className="text-lg font-semibold text-slate-950 dark:text-zinc-100">
              {editingSuggestion ? "P/N-Eintrag ändern" : "Neuen P/N-Eintrag anlegen"}
            </h4>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
              P/N ist ein Pflichtfeld. Die Gerätebezeichnung ist optional und kann später für Autofill
              genutzt werden.
            </p>

            <form onSubmit={submitForm} className="mt-5 space-y-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200">P/N</span>
                <input
                  {...register("partNumber")}
                  className={inputClassName}
                  placeholder="Zum Beispiel 1809"
                />
                {getFieldErrorMessage(errors.partNumber) ? (
                  <span className="text-sm text-rose-700 dark:text-rose-300">
                    {getFieldErrorMessage(errors.partNumber)}
                  </span>
                ) : null}
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
                  Gerätebezeichnung
                </span>
                <input
                  {...register("deviceName")}
                  className={inputClassName}
                  placeholder="Optional"
                />
                {getFieldErrorMessage(errors.deviceName) ? (
                  <span className="text-sm text-rose-700 dark:text-rose-300">
                    {getFieldErrorMessage(errors.deviceName)}
                  </span>
                ) : null}
              </label>

              {saveError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
                  {saveError}
                </div>
              ) : null}

              <div className="flex justify-end gap-3">
                {editingSuggestion ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSuggestion(null);
                      setSaveError(null);
                      reset(partNumberSuggestionFormDefaultValues);
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
                    ? "Wird gespeichert…"
                    : editingSuggestion
                      ? "Änderungen speichern"
                      : "P/N hinzufuegen"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:bg-white dark:border-zinc-700 dark:bg-[#212121] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-[#1b1b1b]";
