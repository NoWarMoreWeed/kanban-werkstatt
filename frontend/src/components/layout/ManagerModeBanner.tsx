import React from "react";
import { useManagerMode } from "../../features/manager-mode/ManagerModeContext";

export function ManagerModeBanner() {
  const { isManagerModeActive } = useManagerMode();

  if (!isManagerModeActive) {
    return null;
  }

  return (
    <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200 sm:px-6 lg:px-10">
      Verwaltermodus ist für diese Sitzung aktiv.
    </div>
  );
}
