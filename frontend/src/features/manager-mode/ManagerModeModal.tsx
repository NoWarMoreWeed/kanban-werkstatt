import React from "react";
import { getFieldErrorMessage, useZodForm } from "../../lib/forms";
import { managerModeFormDefaultValues, managerModeFormSchema } from "./manager-mode.schema";
import { useManagerMode } from "./ManagerModeContext";

export function ManagerModeModal() {
  const { isModalOpen, closeModal, activateManagerMode, isSubmitting, submitError } =
    useManagerMode();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useZodForm({
    schema: managerModeFormSchema,
    defaultValues: managerModeFormDefaultValues
  });

  React.useEffect(() => {
    if (isModalOpen) {
      reset(managerModeFormDefaultValues);
    }
  }, [isModalOpen, reset]);

  if (!isModalOpen) {
    return null;
  }

  const submitForm = handleSubmit(async (values) => {
    await activateManagerMode(values.password);
    reset(managerModeFormDefaultValues);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-zinc-800">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-zinc-500">
            Verwaltermodus
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-zinc-100">
            Passwort eingeben
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
            Der Verwaltermodus gilt nur für diese Sitzung und kann jederzeit wieder beendet
            werden.
          </p>
        </div>

        <form onSubmit={submitForm} className="px-6 py-6">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-zinc-200">
              Passwort
            </span>
            <input
              {...register("password")}
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 focus:bg-white dark:border-zinc-700 dark:bg-[#212121] dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-[#1b1b1b]"
              placeholder="Passwort für den Verwaltermodus"
            />
            {getFieldErrorMessage(errors.password) ? (
              <span className="text-sm text-rose-700 dark:text-rose-300">
                {getFieldErrorMessage(errors.password)}
              </span>
            ) : null}
          </label>

          {submitError ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
              {submitError}
            </div>
          ) : null}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-700 dark:hover:bg-zinc-600"
            >
              {isSubmitting ? "Wird geprüft…" : "Aktivieren"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
