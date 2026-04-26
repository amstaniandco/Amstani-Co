"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Boxes,
  ChartLine,
  LogOut,
  MessageCircle,
  Music2,
  Package,
  TriangleAlert,
  Store,
  Timer,
  UserRound,
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

  const handleLogout = () => {
    clearDemoSession();
    router.push("/login");
  };

  return (
    <aside className="w-full border-b border-slate-200 bg-[#f7f7f7] p-4 md:h-screen md:w-[220px] md:sticky md:top-0 md:flex md:flex-col md:border-b-0 md:border-r">
      <div className="mb-4 flex items-center gap-2 px-2 pt-1 md:mb-8 md:pt-2">
        <Store className="h-6 w-6 shrink-0 text-[#61bbc5]" />
        <p className="whitespace-nowrap text-base font-bold tracking-tight text-slate-900">
          AMSTANI &amp; CO.
        </p>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:block md:space-y-2">
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
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-3 flex items-center gap-3 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-50 md:mt-auto md:border-0"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </aside>
  );
}
