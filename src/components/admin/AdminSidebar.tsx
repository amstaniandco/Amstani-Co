import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { LayoutGrid, ShieldCheck, Store, WalletCards, Megaphone, FileWarning, LogOut } from "lucide-react";

export type AdminSidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type AdminSidebarProps = {
  activePath?: string;
  items?: AdminSidebarItem[];
  variant?: "dark" | "light";
};

const defaultItems: AdminSidebarItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
  { label: "Stores", href: "/admin/stores", icon: Store },
  { label: "Global Catalog", href: "/admin/global-catalog", icon: Store },
  { label: "Finance & Stock", href: "/admin/finance-stock", icon: WalletCards },
  { label: "Communications", href: "/admin/communications", icon: Megaphone },
  { label: "Claims", href: "/admin/claims", icon: FileWarning },
];

export default function AdminSidebar({
  activePath,
  items = defaultItems,
  variant = "dark",
}: AdminSidebarProps) {
  const isLight = variant === "light";

  return (
    <aside
      className={`relative overflow-hidden rounded-[28px] p-5 ${
        isLight
          ? "border border-[#d8e0e6] bg-[#f7fafc] text-slate-700"
          : "border border-[#2b3950] bg-[#101a2f] text-slate-100"
      }`}
    >
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

      <nav className="relative space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
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
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        className={`relative mt-8 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
          isLight
            ? "border border-[#e0e7ec] bg-white text-slate-700 hover:bg-slate-50"
            : "border border-white/20 bg-white/5 text-slate-200 hover:bg-white/10"
        }`}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );
}
