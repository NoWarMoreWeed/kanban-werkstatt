import React from "react";
import { NavLink } from "react-router-dom";
import { useBoards } from "../../features/boards/BoardsContext";
import { useManagerMode } from "../../features/manager-mode/ManagerModeContext";
import { ManagerModeControls } from "./ManagerModeControls";
import { ThemeToggle } from "./ThemeToggle";

const baseLinkClassName =
  "block rounded-xl border px-4 py-3 transition-colors duration-150";

type SidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export function Sidebar({ className = "", onNavigate }: SidebarProps = {}) {
  const { boards, workshopName, isLoading, error } = useBoards();
  const { isManagerModeActive } = useManagerMode();

  return (
    <aside
      className={`flex h-full min-h-0 flex-col overflow-y-auto border-r border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#171717] ${className}`}
    >
      <div className="border-b border-slate-200 px-6 py-6 dark:border-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700 dark:text-zinc-400">
          {workshopName}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-zinc-100">
          Boards
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">
          Übersicht und direkter Zugriff auf die Bereiche in T/AO425.
        </p>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-5">
        <NavLink
          end
          to="/"
          onClick={() => onNavigate?.()}
          className={({ isActive }) =>
            `${baseLinkClassName} ${
              isActive
                ? "border-slate-300 bg-slate-100 text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                : "border-transparent bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-slate-100 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
            }`
          }
        >
          <span className="block text-sm font-semibold">Board-Übersicht</span>
          <span className="mt-1 block text-xs text-slate-500 dark:text-zinc-500">Alle Bereiche im Blick</span>
        </NavLink>

        {isManagerModeActive ? (
          <NavLink
            to="/statistics"
            onClick={() => onNavigate?.()}
            className={({ isActive }) =>
              `${baseLinkClassName} ${
                isActive
                  ? "border-slate-300 bg-slate-100 text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  : "border-transparent bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-slate-100 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
              }`
            }
          >
            <span className="block text-sm font-semibold">Statistik</span>
            <span className="mt-1 block text-xs text-slate-500 dark:text-zinc-500">
              Operative Übersicht für Verwalter
            </span>
          </NavLink>
        ) : null}

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            Boards werden geladen…
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        {boards.map((board) => (
          <NavLink
            key={board.id}
            to={`/boards/${board.id}`}
            onClick={() => onNavigate?.()}
            className={({ isActive }) =>
              `${baseLinkClassName} ${
                isActive
                  ? "border-slate-300 bg-slate-100 text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  : "border-transparent bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-slate-100 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
              }`
            }
          >
            <span className="block text-sm font-semibold">{board.title}</span>
            <span className="mt-1 block text-xs text-slate-500 dark:text-zinc-500">
              Gruppe {board.groupName}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-4 py-5 space-y-4 dark:border-zinc-800">
        <ManagerModeControls />
        <ThemeToggle />
      </div>
    </aside>
  );
}
