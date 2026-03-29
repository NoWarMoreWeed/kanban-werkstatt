import React from "react";
import { useManagerMode } from "../../features/manager-mode/ManagerModeContext";
import { PartNumberSuggestionManagerModal } from "../../features/part-number-suggestions";

export function ManagerModeControls() {
  const [isPartNumberModalOpen, setIsPartNumberModalOpen] = React.useState(false);
  const {
    isManagerModeActive,
    idleTimeoutMinutes,
    isLoading,
    isSubmitting,
    openModal,
    deactivateManagerMode
  } = useManagerMode();

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-zinc-500">
            Zugriff
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-zinc-100">
            {isManagerModeActive ? "Verwaltermodus aktiv" : "Normaler Modus"}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-zinc-400">
            {isManagerModeActive
              ? idleTimeoutMinutes
                ? `Gilt für diese Sitzung. Bei Inaktivität endet er nach ${idleTimeoutMinutes} Minuten.`
                : "Gilt für diese Sitzung, bis du ihn wieder beendest."
              : "Schaltet für diese Sitzung erweiterte Verwalterrechte frei."}
          </p>
        </div>
        <span
          className={`mt-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
            isManagerModeActive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-slate-200 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {isManagerModeActive ? "Aktiv" : "Aus"}
        </span>
      </div>

      <div className="mt-3">
        {isManagerModeActive ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setIsPartNumberModalOpen(true)}
              disabled={isLoading || isSubmitting}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
            >
              P/N Liste pflegen
            </button>
            <button
              type="button"
              onClick={() => void deactivateManagerMode()}
              disabled={isLoading || isSubmitting}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
            >
              Verwaltermodus beenden
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={openModal}
            disabled={isLoading || isSubmitting}
            className="w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-700 dark:hover:bg-zinc-600"
          >
            Verwaltermodus aktivieren
          </button>
        )}
      </div>
      <PartNumberSuggestionManagerModal
        isOpen={isPartNumberModalOpen}
        onClose={() => setIsPartNumberModalOpen(false)}
      />
    </div>
  );
}
