import React from "react";
import { Outlet } from "react-router-dom";
import { BoardsProvider } from "../../features/boards/BoardsContext";
import { ManagerModeProvider } from "../../features/manager-mode/ManagerModeContext";
import { ThemeProvider } from "../../features/theme/ThemeContext";
import { ManagerModeBanner } from "./ManagerModeBanner";
import { ManagerModeModal } from "../../features/manager-mode/ManagerModeModal";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <ThemeProvider>
      <ManagerModeProvider>
        <BoardsProvider>
          <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-[#212121] dark:text-zinc-100">
            <div className="grid min-h-screen grid-cols-[280px_1fr]">
              <Sidebar />
              <main className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#2a2a2a]">
                <ManagerModeBanner />
                <Outlet />
              </main>
            </div>
          </div>
          <ManagerModeModal />
        </BoardsProvider>
      </ManagerModeProvider>
    </ThemeProvider>
  );
}
