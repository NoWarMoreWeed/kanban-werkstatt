import React from "react";
import { Link } from "react-router-dom";
import { useBoards } from "../features/boards/BoardsContext";

export function BoardOverviewPage() {
  const { boards, workshopName, isLoading, error } = useBoards();

  return (
    <section className="flex min-h-screen flex-col px-10 py-10">
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700 dark:text-zinc-500">
          {workshopName}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-zinc-100">
          Board-Übersicht
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-zinc-400">
          Wähle links ein Board aus oder springe von hier direkt in den passenden Bereich.
        </p>
      </div>

      {isLoading ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
          Boards werden geladen…
        </div>
      ) : null}

      {error ? (
        <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700 shadow-sm dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        {boards.map((board) => (
          <Link
            key={board.id}
            to={`/boards/${board.id}`}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-zinc-500">
              Gruppe
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-zinc-100">{board.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">
              Board für die Gruppe {board.groupName}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
