"use client";

import { Bell, Download, Menu, Search, UserCircle2 } from "lucide-react";

type AdminNavbarProps = {
  searchPlaceholder?: string;
  variant?: "dark" | "light";
};

export default function AdminNavbar({
  searchPlaceholder = "Search dashboards, stores, and alerts...",
  variant = "dark",
}: AdminNavbarProps) {
  const isLight = variant === "light";

  return (
    <header className="relative z-30 overflow-hidden rounded-2xl border border-[#d7e0e5] bg-white/95 p-3 shadow-[0_8px_20px_rgba(15,23,42,0.08)] backdrop-blur max-lg:sticky max-lg:top-0">
      <div
        className={`pointer-events-none absolute inset-0 ${
          isLight
            ? "bg-[radial-gradient(circle_at_top_right,rgba(125,211,252,0.18),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(148,163,184,0.08),transparent_45%)]"
            : "bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.2),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.15),transparent_45%)]"
        }`}
      />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex w-full items-center gap-2.5 lg:max-w-xl">
          {/* Mobile menu trigger — toggles the AdminSidebar drawer (hidden on lg) */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("admin-sidebar-open"))}
            aria-label="Open menu"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#dbe5ea] bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              className="h-11 w-full rounded-xl border border-[#dbe5ea] bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition ${
              isLight ? "bg-[#6bbdc7] hover:bg-[#5baeb8]" : "bg-[#0f766e] hover:bg-[#0d655e]"
            }`}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download Report</span>
          </button>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dbe5ea] bg-white text-slate-600 transition hover:bg-slate-50"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          {isLight ? (
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe5ea] bg-white text-slate-700 transition hover:bg-slate-50"
              aria-label="Account"
            >
              <UserCircle2 className="h-5 w-5" />
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#dbe5ea] bg-white px-3 py-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 text-white">
                <UserCircle2 className="h-3.5 w-3.5" />
              </span>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold leading-none text-slate-700">Super Admin</p>
                <p className="mt-1 text-[11px] leading-none text-slate-500">Operations</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
