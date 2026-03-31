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

const DEFAULT_SIDEBAR_WIDTH = 280;
const MIN_SIDEBAR_WIDTH = 220;
const MAX_SIDEBAR_WIDTH = 420;

function LayoutShell() {
  const { workshopName } = useBoards();
  const { themeMode, toggleThemeMode } = useThemeMode();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [sidebarWidth, setSidebarWidth] = React.useState(DEFAULT_SIDEBAR_WIDTH);
  const [isDraggingSidebar, setIsDraggingSidebar] = React.useState(false);
  const layoutRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isDraggingSidebar) {
      return;
    }

    function handleMouseMove(event: MouseEvent) {
      if (!layoutRef.current) {
        return;
      }

      const rect = layoutRef.current.getBoundingClientRect();
      const nextWidth = event.clientX - rect.left;
      const clampedWidth = Math.min(Math.max(nextWidth, MIN_SIDEBAR_WIDTH), MAX_SIDEBAR_WIDTH);
      setSidebarWidth(clampedWidth);
    }

    function handleMouseUp() {
      setIsDraggingSidebar(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingSidebar]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-[#212121] dark:text-zinc-100">
      <div ref={layoutRef} className="flex min-h-screen flex-col lg:flex-row lg:items-stretch">
        <div
          className={`hidden overflow-hidden border-r border-slate-200 dark:border-zinc-800 lg:flex lg:min-h-screen lg:flex-col ${
            isSidebarCollapsed ? "lg:w-0 lg:border-transparent" : ""
          }`}
          style={{
            width: isSidebarCollapsed ? 0 : sidebarWidth
          }}
        >
          {!isSidebarCollapsed ? <Sidebar className="w-full" /> : null}
        </div>

        {!isSidebarCollapsed ? (
          <button
            type="button"
            aria-label="Sidebar-Breite anpassen"
            className={`hidden lg:block h-full w-1 cursor-col-resize bg-slate-200 transition-colors hover:bg-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 dark:bg-zinc-800 dark:hover:bg-zinc-700 ${
              isDraggingSidebar ? "bg-slate-300 dark:bg-zinc-700" : ""
            }`}
            onMouseDown={() => setIsDraggingSidebar(true)}
          />
        ) : null}

        <main className="relative flex min-h-screen flex-1 flex-col bg-slate-50 dark:bg-[#2a2a2a]">
          <DesktopSidebarToggle
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed((current) => !current)}
          />
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

      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onExpandDesktop={() => setIsSidebarCollapsed(false)}
      />
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
  onExpandDesktop?: () => void;
};

function MobileSidebar({ isOpen, onClose, onExpandDesktop }: MobileSidebarProps) {
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
        <Sidebar
          className="h-[calc(100vh-52px)]"
          onNavigate={() => {
            onClose();
            onExpandDesktop?.();
          }}
        />
      </div>
    </>
  );
}

type DesktopSidebarToggleProps = {
  isCollapsed: boolean;
  onToggle: () => void;
};

function DesktopSidebarToggle({ isCollapsed, onToggle }: DesktopSidebarToggleProps) {
  return (
    <div className="hidden items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-[#1d1d1d] lg:flex">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-zinc-500">
          Navigation
        </p>
        <p className="text-sm font-semibold text-slate-900 dark:text-zinc-50">
          {isCollapsed ? "Ausgeblendet" : "Sichtbar"}
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
      >
        {isCollapsed ? "Sidebar einblenden" : "Sidebar ausblenden"}
      </button>
    </div>
  );
}
