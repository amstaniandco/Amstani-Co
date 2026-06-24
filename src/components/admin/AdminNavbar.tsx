"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Download,
  Loader2,
  Mail,
  Menu,
  Package,
  Receipt,
  Search,
  Store as StoreIcon,
  Tag,
  TriangleAlert,
  UserCircle2,
  UserRound,
  X,
} from "lucide-react";

type AdminNavbarProps = {
  searchPlaceholder?: string;
  variant?: "dark" | "light";
};

type SearchResult = {
  id: string;
  type: "store" | "user" | "product" | "brand" | "category" | "order" | "claim";
  title: string;
  subtitle?: string;
  href: string;
};

type AdminNotification = {
  id: string;
  type: "application" | "signup" | "listing" | "claim" | "chat" | "live_warning";
  title: string;
  message: string;
  href: string;
  createdAt: string;
};

const TYPE_META: Record<SearchResult["type"], { label: string; icon: typeof StoreIcon }> = {
  store: { label: "Stores", icon: StoreIcon },
  user: { label: "Users", icon: UserRound },
  product: { label: "Products", icon: Package },
  brand: { label: "Brands", icon: Tag },
  category: { label: "Categories", icon: Tag },
  order: { label: "Orders", icon: Receipt },
  claim: { label: "Claims", icon: TriangleAlert },
};

const NOTIF_ICON: Record<AdminNotification["type"], typeof StoreIcon> = {
  application: StoreIcon,
  signup: UserRound,
  listing: Package,
  claim: TriangleAlert,
  chat: Mail,
  live_warning: TriangleAlert,
};

const SEEN_KEY = "admin_notifs_seen";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function AdminNavbar({
  searchPlaceholder = "Search dashboards, stores, and alerts...",
  variant = "dark",
}: AdminNavbarProps) {
  const isLight = variant === "light";
  const router = useRouter();

  // ── Search ──────────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(res.ok ? data.results ?? [] : []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  // ── Notifications ───────────────────────────────────────────────────────
  const [notifs, setNotifs] = useState<AdminNotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const computeUnread = (list: AdminNotification[]) => {
    const seen = typeof window !== "undefined" ? localStorage.getItem(SEEN_KEY) : null;
    const seenTime = seen ? new Date(seen).getTime() : 0;
    return list.filter((n) => new Date(n.createdAt).getTime() > seenTime).length;
  };

  const loadNotifs = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (res.ok) {
        const list: AdminNotification[] = data.notifications ?? [];
        setNotifs(list);
        setUnread(computeUnread(list));
      }
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadNotifs();
    const id = setInterval(loadNotifs, 60000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNotifs = () => {
    const next = !notifOpen;
    setNotifOpen(next);
    setSearchOpen(false);
    if (next) {
      // Mark everything as seen → clears the badge
      localStorage.setItem(SEEN_KEY, new Date().toISOString());
      setUnread(0);
    }
  };

  // ── Click-outside to close both popups ────────────────────────────────────
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (href: string) => {
    setSearchOpen(false);
    setNotifOpen(false);
    setQuery("");
    router.push(href);
  };

  // Group search results by type, preserving the order in TYPE_META
  const grouped = (Object.keys(TYPE_META) as SearchResult["type"][])
    .map((type) => ({ type, items: results.filter((r) => r.type === type) }))
    .filter((g) => g.items.length > 0);

  return (
    <header className="relative z-30 rounded-2xl border border-[#d7e0e5] bg-white/95 p-3 shadow-[0_8px_20px_rgba(15,23,42,0.08)] backdrop-blur max-lg:sticky max-lg:top-0">
      <div
        className={`pointer-events-none absolute inset-0 rounded-2xl ${
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

          {/* Search + dropdown */}
          <div ref={searchRef} className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder={searchPlaceholder}
              className="h-11 w-full rounded-xl border border-[#dbe5ea] bg-white pl-11 pr-9 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(""); setResults([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {searchOpen && query.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-[52px] z-50 max-h-[420px] overflow-y-auto rounded-2xl border border-slate-200 bg-white py-2 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.3)]">
                {searching ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" /> Searching…
                  </div>
                ) : grouped.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">
                    No matches for “{query.trim()}”.
                  </p>
                ) : (
                  grouped.map((group) => {
                    const Meta = TYPE_META[group.type];
                    const Icon = Meta.icon;
                    return (
                      <div key={group.type} className="px-1">
                        <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                          {Meta.label}
                        </p>
                        {group.items.map((item) => (
                          <button
                            key={`${item.type}-${item.id}`}
                            type="button"
                            onClick={() => go(item.href)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-slate-50"
                          >
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#eef5f7] text-[#338ca0]">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-slate-800">{item.title}</span>
                              {item.subtitle && (
                                <span className="block truncate text-xs text-slate-500">{item.subtitle}</span>
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    );
                  })
                )}
              </div>
            )}
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

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              type="button"
              onClick={openNotifs}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dbe5ea] bg-white text-slate-600 transition hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
                onClick={() => setNotifOpen(false)}
              >
                <div
                  className="flex max-h-[60vh] w-full max-w-[360px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_-12px_rgba(15,23,42,0.3)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-bold text-slate-900">Notifications</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {notifs.length}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {notifs.length === 0 ? (
                      <p className="px-4 py-10 text-center text-sm text-slate-400">You&apos;re all caught up 🎉</p>
                    ) : (
                      notifs.map((n) => {
                        const Icon = NOTIF_ICON[n.type];
                        return (
                          <button
                            key={`${n.type}-${n.id}`}
                            type="button"
                            onClick={() => go(n.href)}
                            className="flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition last:border-0 hover:bg-slate-50"
                          >
                            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#eef5f7] text-[#338ca0]">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-slate-800">{n.title}</span>
                              <span className="mt-0.5 block text-xs leading-snug text-slate-500">{n.message}</span>
                              <span className="mt-1 block text-[10px] font-medium uppercase tracking-wide text-slate-400">
                                {timeAgo(n.createdAt)}
                              </span>
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

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
