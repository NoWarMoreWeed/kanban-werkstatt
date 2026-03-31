import React from "react";
import { Outlet } from "react-router-dom";
import { BoardsProvider, useBoards } from "../../features/boards/BoardsContext";
import { ManagerModeProvider } from "../../features/manager-mode/ManagerModeContext";
import { ThemeProvider, useThemeMode } from "../../features/theme/ThemeContext";
import { ManagerModeBanner } from "./ManagerModeBanner";
import { ManagerModeModal } from "../../features/manager-mode/ManagerModeModal";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <ThemeProvider>
      <ManagerModeProvider>
        <BoardsProvider>
          <LayoutShell />
          <ManagerModeModal />
        </BoardsProvider>
      </ManagerModeProvider>
    </ThemeProvider>
  );
}

function LayoutShell() {
  const { workshopName } = useBoards();
  const { themeMode, toggleThemeMode } = useThemeMode();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-[#212121] dark:text-zinc-100">
      <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:flex lg:min-h-screen">
          <Sidebar className="w-[280px]" />
        </div>

        <main className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#2a2a2a]">
          <MobileTopBar
            workshopName={workshopName}
            themeMode={themeMode}
            onToggleTheme={toggleThemeMode}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
          <ManagerModeBanner />
          <Outlet />
        </main>
      </div>

      <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  );
}

type MobileTopBarProps = {
  workshopName: string;
  themeMode: "light" | "dark";
  onToggleTheme: () => void;
  onOpenSidebar: () => void;
};

function MobileTopBar({ workshopName, themeMode, onToggleTheme, onOpenSidebar }: MobileTopBarProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-[#1d1d1d] lg:hidden">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition-colors hover:border-slate-300 hover:bg-white dark:border-zinc-700 dark:bg-[#2b2b2b] dark:text-zinc-100"
      >
        <span className="sr-only">Navigation öffnen</span>
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="5" y1="12" x2="19" y2="12" />
          <line x1="7" y1="18" x2="17" y2="18" />
        </svg>
      </button>

      <div className="flex flex-col text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700 dark:text-zinc-400">
          {workshopName || "Werkstatt"}
        </p>
        <p className="text-base font-semibold text-slate-900 dark:text-zinc-100">Boards</p>
      </div>

      <button
        type="button"
        onClick={onToggleTheme}
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-white dark:border-zinc-700 dark:bg-[#2b2b2b] dark:text-zinc-100"
      >
        {themeMode === "dark" ? "Hell" : "Dunkel"}
      </button>
    </div>
  );
}

type MobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/50 opacity-0 transition-opacity duration-200 lg:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-xs -translate-x-full transform bg-white shadow-2xl transition-transform duration-200 dark:bg-[#171717] lg:hidden ${
          isOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-zinc-800">
          <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">Navigation</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Schließen
          </button>
        </div>
        <Sidebar className="h-[calc(100vh-52px)]" onNavigate={onClose} />
      </div>
    </>
  );
}
