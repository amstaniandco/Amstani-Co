"use client";

import { Moon, Sun } from "lucide-react";

type DarkModeToggleProps = {
  isDark: boolean;
  onToggle: () => void;
};

export default function DarkModeToggle({ isDark, onToggle }: DarkModeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        zIndex: 2147483647,
      }}
      className="fixed bottom-5 left-5 z-[1000] flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/70 bg-white/95 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:opacity-90 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100 dark:shadow-black/30"
    >
      <span className="transition-transform duration-300">
        {isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
      </span>
    </button>
  );
}
