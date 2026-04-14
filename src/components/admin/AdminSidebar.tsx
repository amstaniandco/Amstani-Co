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
};

const defaultItems: AdminSidebarItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
  { label: "Stores", href: "/admin", icon: Store },
  { label: "Global Catalog", href: "/admin/dashboard", icon: Store },
  { label: "Finance & Stock", href: "/admin/dashboard", icon: WalletCards },
  { label: "Communications", href: "/admin/dashboard", icon: Megaphone },
  { label: "Claims", href: "/admin/dashboard", icon: FileWarning },
];

export default function AdminSidebar({ activePath, items = defaultItems }: AdminSidebarProps) {
  return (
    <aside className="relative overflow-hidden rounded-[28px] border border-[#2b3950] bg-[#101a2f] p-5 text-slate-100">
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-indigo-400/20 blur-3xl" />

      <div className="relative mb-8 border-b border-white/15 pb-5">
        <p className="mb-1 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
          <ShieldCheck className="h-3.5 w-3.5" />
          Control Room
        </p>
        <h2 className="text-2xl font-bold tracking-tight">Amstani Admin</h2>
        <p className="mt-1 text-xs text-slate-300">Operations and governance panel</p>
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
                isActive
                  ? "bg-gradient-to-r from-cyan-400/30 via-cyan-300/15 to-transparent text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${
                  isActive
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
        className="relative mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );
}
