"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import DarkModeToggle from "./DarkModeToggle";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const THEME_STORAGE_KEY = "amstanico-theme";
const OWNER_PANEL_PATHS = [
  "/chats",
  "/communications",
  "/music",
  "/orders",
  "/owner",
  "/performance",
  "/products",
  "/store/apply",
  "/store/chats",
  "/timings",
];

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const body = document.body;
  root.setAttribute("data-theme", theme);
  body.setAttribute("data-theme", theme);

  if (theme === "dark") {
    root.classList.add("dark");
    body.classList.add("dark");
  } else {
    root.classList.remove("dark");
    body.classList.remove("dark");
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Important: keep the very first render deterministic (matches server HTML)
  // to avoid hydration mismatches when a stored theme exists in localStorage.
  const [theme, setTheme] = useState<Theme>("light");
  const hideToggle =
    pathname === "/admin" ||
    pathname?.startsWith("/admin/") ||
    OWNER_PANEL_PATHS.some((path) => pathname === path || pathname?.startsWith(`${path}/`));

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "dark" || storedTheme === "light") {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }, []);

  const contextValue = useMemo(
    () => ({
      theme,
      toggleTheme,
    }),
    [theme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
      {!hideToggle && <DarkModeToggle isDark={theme === "dark"} onToggle={toggleTheme} />}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
