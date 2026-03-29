import React, { useEffect } from "react";
import { apiFetch } from "../../lib/api";
import { getFieldErrorMessage, useZodForm } from "../../lib/forms";
import {
  cardPriorityOptions,
  type CardBaseFormValues,
  cardBaseFormSchema
} from "./card-form.schema";
import type { PartNumberSuggestionItem, PartNumberSuggestionListResponse } from "../../types/api";

type CardFormModalProps = {
  eyebrow: string;
  title: string;
  description: string;
  submitLabel: string;
  initialValues: CardBaseFormValues;
  isOpen: boolean;
  isSaving: boolean;
  saveError: string | null;
  onClose: () => void;
  onSubmit: (values: CardBaseFormValues) => Promise<void>;
};

export function CardFormModal({
  eyebrow,
  title,
  description,
  submitLabel,
  initialValues,
  isOpen,
  isSaving,
  saveError,
  onClose,
  onSubmit
}: CardFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useZodForm({
    schema: cardBaseFormSchema,
    defaultValues: initialValues
  });
  const partNumberValue = watch("partNumber");
  const [partNumberSuggestions, setPartNumberSuggestions] = React.useState<PartNumberSuggestionItem[]>(
    []
  );

  useEffect(() => {
    const trimmedQuery = partNumberValue.trim();

    if (trimmedQuery.length === 0) {
      setPartNumberSuggestions([]);
      return;
    }

    let isActive = true;

    async function loadSuggestions() {
      try {
        const response = await apiFetch<PartNumberSuggestionListResponse>(
          `/part-number-suggestions?query=${encodeURIComponent(trimmedQuery)}&limit=8`
        );

        if (!isActive) {
          return;
        }

        setPartNumberSuggestions(response.suggestions);
      } catch {
        if (isActive) {
          setPartNumberSuggestions([]);
        }
      }
    }

    void loadSuggestions();

    return () => {
      isActive = false;
    };
  }, [partNumberValue]);

  useEffect(() => {
    if (isOpen) {
      reset(initialValues);
    }
  }, [initialValues, isOpen, reset]);

  if (!isOpen) {
    return null;
  }

  const submitForm = handleSubmit(onSubmit);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-zinc-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-zinc-500">
              {eyebrow}
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-zinc-100">
              {title}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">{description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Schließen
          </button>
        </div>

        <form onSubmit={submitForm} className="px-6 py-6">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label="Zuständige Person"
              error={getFieldErrorMessage(errors.responsibleName)}
              input={
                <input
                  {...register("responsibleName")}
                  className={inputClassName}
                  placeholder="Zum Beispiel Max Müller"
                />
              }
            />
            <FormField
              label="Gerätebezeichnung"
              error={getFieldErrorMessage(errors.deviceName)}
              input={
                <input
                  {...register("deviceName")}
                  className={inputClassName}
                  placeholder="Gerätebezeichnung"
                />
              }
            />
            <FormField
              label="Priorität"
              error={getFieldErrorMessage(errors.priority)}
              input={
                <select
                  {...register("priority")}
                  className={inputClassName}
                >
                  {cardPriorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              }
            />
            <FormField
              label="Eckende"
              error={getFieldErrorMessage(errors.dueDate)}
              input={<input {...register("dueDate")} type="date" className={inputClassName} />}
            />
            <FormField
              label="P/N"
              error={getFieldErrorMessage(errors.partNumber)}
              input={
                <>
                  <input {...register("partNumber")} list="part-number-suggestions" className={inputClassName} />
                  <datalist id="part-number-suggestions">
                    {partNumberSuggestions.map((suggestion) => (
                      <option key={suggestion.id} value={suggestion.partNumber}>
                        {suggestion.deviceName ?? suggestion.partNumber}
                      </option>
                    ))}
                  </datalist>
                </>
              }
            />
            <FormField
              label="S/N"
              error={getFieldErrorMessage(errors.serialNumber)}
              input={<input {...register("serialNumber")} className={inputClassName} />}
            />
            <FormField
              label="Auftragsnummer"
              error={getFieldErrorMessage(errors.sapNumber)}
              input={<input {...register("sapNumber")} className={inputClassName} />}
            />
            <FormField
              label="Meldungsnummer"
              error={getFieldErrorMessage(errors.orderNumber)}
              input={<input {...register("orderNumber")} className={inputClassName} />}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 dark:border-zinc-800 dark:bg-[#232323] dark:text-zinc-400">
            Später kann die P/N-Eingabe genutzt werden, um eine bekannte Gerätebezeichnung
            automatisch vorzubelegen. In Version 1 bleibt die Gerätebezeichnung bewusst manuell
            editierbar.
          </div>

          {saveError ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
              {saveError}
            </div>
          ) : null}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-700 dark:hover:bg-zinc-600"
            >
              {isSaving ? "Wird gespeichert…" : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:bg-white dark:border-zinc-700 dark:bg-[#212121] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-[#1b1b1b]";

type FormFieldProps = {
  label: string;
  error?: string;
  input: React.ReactNode;
};

function FormField({ label, error, input }: FormFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200">{label}</span>
      {input}
      {error ? <span className="text-sm text-rose-700 dark:text-rose-300">{error}</span> : null}
    </label>
  );
}
