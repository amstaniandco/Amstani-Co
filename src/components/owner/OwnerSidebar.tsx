"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Boxes,
  ChartLine,
  CreditCard,
  LogOut,
  Menu,
  MessageCircle,
  Music2,
  Package,
  TriangleAlert,
  Store,
  Timer,
  UserRound,
  X,
} from "lucide-react";

type SidebarItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const sidebarItems: SidebarItem[] = [
  { label: "Chats", href: "/store/chats", icon: MessageCircle },
  { label: "Orders", href: "/orders", icon: Package },
  { label: "Performance", href: "/performance", icon: ChartLine },
  { label: "Products", href: "/products", icon: Boxes },
  { label: "Timings", href: "/timings", icon: Timer },
  { label: "Communications", href: "/communications", icon: Bell },
  { label: "Notifications", href: "/owner/notifications", icon: Bell },
  { label: "Claims", href: "/owner/claims", icon: TriangleAlert },
  { label: "Music", href: "/music", icon: Music2 },
  { label: "Profile", href: "/owner/profile", icon: UserRound },
  { label: "Payouts", href: "/owner/stripe", icon: CreditCard },
];

type SidebarCounts = { orders: number; claims: number; notifications: number; listing_requests: number };

function getActiveLabel(pathname: string) {
  const match = sidebarItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return match?.label ?? "Chats";
}

function buildQuery(since: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(since)) if (v) params.set(k, v);
  const qs = params.toString();
  return `/api/owner/sidebar-counts${qs ? `?${qs}` : ""}`;
}

export default function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const activeLabel = getActiveLabel(pathname || "");
  const [isOpen, setIsOpen] = useState(false);
  const [counts, setCounts] = useState<SidebarCounts>({ orders: 0, claims: 0, notifications: 0, listing_requests: 0 });

  useEffect(() => {
    let cancelled = false;
    const since = {
      since_orders: localStorage.getItem("sb_seen_owner_orders") ?? "",
      since_claims: localStorage.getItem("sb_seen_owner_claims") ?? "",
      since_notifications: localStorage.getItem("sb_seen_owner_notifications") ?? "",
      since_requests: localStorage.getItem("sb_seen_owner_listing_requests") ?? "",
    };
    fetch(buildQuery(since))
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (!cancelled && data) setCounts(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [pathname]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail === "owner_orders") setCounts((p) => ({ ...p, orders: 0 }));
      if (detail === "owner_claims") setCounts((p) => ({ ...p, claims: 0 }));
      if (detail === "owner_notifications") setCounts((p) => ({ ...p, notifications: 0 }));
      if (detail === "owner_listing_requests") setCounts((p) => ({ ...p, listing_requests: 0 }));
    };
    window.addEventListener("sb-seen", handler);
    return () => window.removeEventListener("sb-seen", handler);
  }, []);

  const BADGE_MAP: Record<string, number> = {
    "/orders": counts.orders,
    "/owner/claims": counts.claims,
    "/owner/notifications": counts.notifications,
    "/products": counts.listing_requests,
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-900 shadow-md transition hover:bg-slate-50 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div
        className={`fixed inset-0 z-40 bg-slate-950/50 transition-opacity md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border border-slate-200 bg-[#f7f7f7] p-4 shadow-xl transition-transform duration-300 md:static md:translate-x-0 md:h-screen md:w-[220px] md:flex md:flex-col md:border-b-0 md:border-r ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-2 px-2 pt-1 md:mb-8 md:pt-2">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 shrink-0 text-[#61bbc5]" />
            <p className="whitespace-nowrap text-base font-bold tracking-tight text-slate-900">
              AMSTANI &amp; CO.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-900 transition hover:bg-slate-50 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 overflow-y-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:block md:space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === activeLabel;
            const badge = BADGE_MAP[item.href] ?? 0;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition md:w-full ${
                  isActive
                    ? "bg-[#65bbc5] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
                  <span className={`inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                    isActive ? "bg-white/30 text-white" : "bg-red-500 text-white"
                  }`}>
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            handleLogout();
          }}
          className="mt-3 flex items-center gap-3 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-50 md:mt-auto md:border-0"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </aside>
    </>
  );
}
