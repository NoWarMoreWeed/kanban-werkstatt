import React from "react";
import { useThemeMode } from "../../features/theme/ThemeContext";

export function ThemeToggle() {
  const { themeMode, setThemeMode } = useThemeMode();

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-100 p-1.5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-zinc-500">
        Darstellung
      </p>
      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setThemeMode("light")}
          className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
            themeMode === "light"
              ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
              : "text-slate-600 hover:bg-white/70 dark:text-zinc-400 dark:hover:bg-zinc-800/80"
          }`}
        >
          Hell
        </button>
        <button
          type="button"
          onClick={() => setThemeMode("dark")}
          className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
            themeMode === "dark"
              ? "bg-zinc-900 text-zinc-100 shadow-sm dark:bg-zinc-700"
              : "text-slate-600 hover:bg-white/70 dark:text-zinc-400 dark:hover:bg-zinc-800/80"
          }`}
        >
          Dunkel
        </button>
      </div>
    </div>
  );
}
