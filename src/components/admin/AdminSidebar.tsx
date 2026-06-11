"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { LayoutGrid, ShieldCheck, Store, WalletCards, Megaphone, FileWarning, LogOut, Users, X } from "lucide-react";

export type AdminSidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type AdminSidebarProps = {
  activePath?: string;
  items?: AdminSidebarItem[];
  variant?: "dark" | "light";
  className?: string;
};

const defaultItems: AdminSidebarItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
  { label: "User Management", href: "/admin/users", icon: Users },
  { label: "Stores", href: "/admin/stores", icon: Store },
  { label: "Global Catalog", href: "/admin/global-catalog", icon: Store },
  { label: "Finance & Stock", href: "/admin/finance-stock", icon: WalletCards },
  { label: "Communications", href: "/admin/communications", icon: Megaphone },
  { label: "Claims", href: "/admin/claims", icon: FileWarning },
];

type SidebarCounts = { stores: number; claims: number; chats: number };

function buildQuery(since_claims: string, since_stores: string, since_chats: string) {
  const params = new URLSearchParams();
  if (since_claims) params.set("since_claims", since_claims);
  if (since_stores) params.set("since_stores", since_stores);
  if (since_chats) params.set("since_chats", since_chats);
  const qs = params.toString();
  return `/api/admin/sidebar-counts${qs ? `?${qs}` : ""}`;
}

export default function AdminSidebar({
  activePath,
  items = defaultItems,
  variant = "dark",
  className = "",
}: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isLight = variant === "light";
  const [counts, setCounts] = useState<SidebarCounts>({ stores: 0, claims: 0, chats: 0 });
  const [isOpen, setIsOpen] = useState(false);

  const resolvedActive = activePath ?? pathname ?? "";

  // Close the mobile drawer whenever the route changes
  useEffect(() => { setIsOpen(false); }, [pathname]);

  // Open the drawer when the navbar hamburger dispatches the event
  useEffect(() => {
    const open = () => setIsOpen(true);
    window.addEventListener("admin-sidebar-open", open);
    return () => window.removeEventListener("admin-sidebar-open", open);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const since_claims = localStorage.getItem("sb_seen_admin_claims") ?? "";
    const since_stores = localStorage.getItem("sb_seen_admin_stores") ?? "";
    const since_chats = localStorage.getItem("sb_seen_admin_chats") ?? "";
    fetch(buildQuery(since_claims, since_stores, since_chats))
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (!cancelled && data) setCounts(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [pathname]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail === "admin_claims") setCounts((p) => ({ ...p, claims: 0 }));
      if (detail === "admin_stores" || detail === "admin_stores_applications" || detail === "admin_stores_signups") {
        setCounts((p) => ({ ...p, stores: 0 }));
      }
      if (detail === "admin_chats") setCounts((p) => ({ ...p, chats: 0 }));
    };
    window.addEventListener("sb-seen", handler);
    return () => window.removeEventListener("sb-seen", handler);
  }, []);

  const BADGE_MAP: Record<string, number> = {
    "/admin/stores": counts.stores + counts.chats,
    "/admin/claims": counts.claims,
  };

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <>
    {/* Backdrop (mobile only) */}
    <div
      onClick={() => setIsOpen(false)}
      className={`fixed inset-0 z-40 bg-slate-950/50 transition-opacity lg:hidden ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    />

    <aside
      className={`relative flex flex-col overflow-hidden rounded-[28px] p-5 transition-transform duration-300 max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:w-72! max-lg:max-w-[85vw] max-lg:rounded-r-2xl max-lg:shadow-2xl ${
        isOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
      } ${
        isLight
          ? "border border-[#d8e0e6] bg-[#f7fafc] text-slate-700"
          : "border border-[#2b3950] bg-[#101a2f] text-slate-100"
      } ${className}`}
    >
      {/* Mobile close button */}
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        aria-label="Close menu"
        className={`absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-xl border transition lg:hidden ${
          isLight
            ? "border-[#d8e0e6] bg-white text-slate-600 hover:bg-slate-50"
            : "border-white/20 bg-white/10 text-slate-200 hover:bg-white/20"
        }`}
      >
        <X className="h-4 w-4" />
      </button>
      {isLight ? (
        <>
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-sky-300/15 blur-3xl" />
        </>
      ) : (
        <>
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-indigo-400/20 blur-3xl" />
        </>
      )}

      <div className={`relative mb-8 pb-5 ${isLight ? "border-b border-[#e2e8ed]" : "border-b border-white/15"}`}>
        <p
          className={`mb-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
            isLight
              ? "border border-[#d6e2ea] bg-white text-slate-700"
              : "border border-white/20 bg-white/10 text-cyan-100"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {isLight ? "Super Admin" : "Control Room"}
        </p>
        <h2 className={`text-2xl font-bold tracking-tight ${isLight ? "text-slate-900" : "text-inherit"}`}>
          Amstani & Co
        </h2>
        <p className={`mt-1 text-xs ${isLight ? "text-slate-600" : "text-slate-300"}`}>
          {isLight ? "Super Admin" : "Operations and governance panel"}
        </p>
      </div>

      <nav className="relative flex-1 space-y-2 overflow-y-auto pr-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = resolvedActive === item.href || resolvedActive.startsWith(item.href + "/");
          const badge = BADGE_MAP[item.href] ?? 0;

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isLight
                  ? isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-700 hover:bg-white hover:text-slate-900"
                  : isActive
                    ? "bg-gradient-to-r from-cyan-400/30 via-cyan-300/15 to-transparent text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${
                  isLight
                    ? isActive
                      ? "border-[#d5e1e8] bg-[#f1f7fa]"
                      : "border-[#e3ebef] bg-white group-hover:border-[#cedae2]"
                    : isActive
                      ? "border-cyan-200/60 bg-cyan-300/25"
                      : "border-white/15 bg-white/5 group-hover:border-white/30"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 font-medium">{item.label}</span>
              {badge > 0 && (
                <span className="ml-auto inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className={`relative mt-8 flex w-full shrink-0 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
          isLight
            ? "border border-[#e0e7ec] bg-white text-slate-700 hover:bg-slate-50"
            : "border border-white/20 bg-white/5 text-slate-200 hover:bg-white/10"
        }`}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
    </>
  );
}
