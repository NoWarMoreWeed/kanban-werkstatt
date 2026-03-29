import React from "react";
type StatePanelProps = {
  message: string;
  tone?: "neutral" | "error";
};

export function StatePanel({ message, tone = "neutral" }: StatePanelProps) {
  const toneClassName =
    tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200"
      : "border-slate-200 bg-white text-slate-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300";

  return (
    <div className={`rounded-2xl border px-6 py-5 ${toneClassName}`}>
      {message}
    </div>
  );
}
