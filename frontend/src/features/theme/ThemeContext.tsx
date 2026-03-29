import React, {
  createContext,
  type PropsWithChildren,
  useContext,
  useLayoutEffect,
  useMemo,
  useState
} from "react";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (themeMode: ThemeMode) => void;
  toggleThemeMode: () => void;
};

const STORAGE_KEY = "werkstatt-kanban-theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyThemeMode(themeMode: ThemeMode) {
  document.documentElement.classList.toggle("dark", themeMode === "dark");
  document.documentElement.style.colorScheme = themeMode;
}

function getInitialThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);

  return storedTheme === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);

  useLayoutEffect(() => {
    applyThemeMode(themeMode);
    window.localStorage.setItem(STORAGE_KEY, themeMode);
  }, [themeMode]);

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      toggleThemeMode: () => {
        setThemeMode((currentThemeMode) =>
          currentThemeMode === "light" ? "dark" : "light"
        );
      }
    }),
    [themeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeProvider.");
  }

  return context;
}
