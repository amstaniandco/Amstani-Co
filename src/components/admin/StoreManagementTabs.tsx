"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  warningCount?: number;
  activeWarningsTab?: boolean;
  onWarningsTabClick?: () => void;
};

const HREF_TABS = [
  { label: "All Stores",         href: "/admin/stores" },
  { label: "Store Applications", href: "/admin/stores/applications" },
  { label: "Signup Requests",    href: "/admin/stores/signup-requests" },
];

export default function StoreManagementTabs({ warningCount = 0, activeWarningsTab = false, onWarningsTabClick }: Props) {
  const pathname = usePathname();

  return (
    <div className="mt-3 overflow-x-auto border-b border-[#e7edf1] text-xs font-semibold text-slate-700 sm:mt-4 sm:text-sm">
      <div className="flex min-w-max gap-6">
        {HREF_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-b-2 pb-3 transition ${
                isActive ? "border-[#58b8c3] text-[#2f7f8d]" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}

        {/* Live Warnings — in-page tab only on /admin/stores, button on other pages */}
        {onWarningsTabClick ? (
          <button
            type="button"
            onClick={onWarningsTabClick}
            className={`flex items-center gap-1.5 border-b-2 pb-3 transition ${
              activeWarningsTab ? "border-[#58b8c3] text-[#2f7f8d]" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Live Warnings
            {warningCount > 0 && (
              <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {warningCount}
              </span>
            )}
          </button>
        ) : (
          // On non-stores pages, link back to /admin/stores and auto-select warnings tab via query param
          <Link
            href="/admin/stores?tab=warnings"
            className="flex items-center gap-1.5 border-b-2 border-transparent pb-3 text-slate-500 transition hover:text-slate-700"
          >
            Live Warnings
            {warningCount > 0 && (
              <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {warningCount}
              </span>
            )}
          </Link>
        )}
      </div>
    </div>
  );
}
