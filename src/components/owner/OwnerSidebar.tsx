"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Boxes,
  ChartLine,
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
import { clearDemoSession } from "@/src/lib/auth/demoAuth";

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
  { label: "Claims", href: "/owner/claims", icon: TriangleAlert },
  { label: "Music", href: "/music", icon: Music2 },
  { label: "Profile", href: "/owner/profile", icon: UserRound },
];

function getActiveLabel(pathname: string) {
  if (pathname === "/owner/notifications") {
    return "Profile";
  }

  const match = sidebarItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return match?.label ?? "Chats";
}

export default function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const activeLabel = getActiveLabel(pathname || "");

  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    clearDemoSession();
    router.push("/login");
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
                <Icon className="h-4 w-4" />
                {item.label}
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
