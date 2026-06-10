"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Props = {
  warningCount?: number;
  activeWarningsTab?: boolean;
  onWarningsTabClick?: () => void;
};

type TabCounts = { applications: number; signups: number };

export default function StoreManagementTabs({ warningCount = 0, activeWarningsTab = false, onWarningsTabClick }: Props) {
  const pathname = usePathname();
  const [tabCounts, setTabCounts] = useState<TabCounts>({ applications: 0, signups: 0 });

  useEffect(() => {
    let cancelled = false;
    const sinceApps = localStorage.getItem("sb_seen_admin_stores_applications") ?? "";
    const sinceSignups = localStorage.getItem("sb_seen_admin_stores_signups") ?? "";
    const params = new URLSearchParams();
    if (sinceApps) params.set("since_applications", sinceApps);
    if (sinceSignups) params.set("since_signups", sinceSignups);
    const qs = params.toString();
    fetch(`/api/admin/store-tab-counts${qs ? `?${qs}` : ""}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (!cancelled && data) setTabCounts(data); })
      .catch(() => {});

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail === "admin_stores_applications") setTabCounts((p) => ({ ...p, applications: 0 }));
      if (detail === "admin_stores_signups") setTabCounts((p) => ({ ...p, signups: 0 }));
    };
    window.addEventListener("sb-seen", handler);
    return () => {
      cancelled = true;
      window.removeEventListener("sb-seen", handler);
    };
  }, [pathname]);

  const HREF_TABS = [
    { label: "All Stores", href: "/admin/stores", count: 0 },
    { label: "Store Applications", href: "/admin/stores/applications", count: tabCounts.applications },
    { label: "Signup Requests", href: "/admin/stores/signup-requests", count: tabCounts.signups },
  ];

  return (
    <div className="mt-3 overflow-x-auto border-b border-[#e7edf1] text-xs font-semibold text-slate-700 sm:mt-4 sm:text-sm">
      <div className="flex min-w-max gap-6">
        {HREF_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-1.5 border-b-2 pb-3 transition ${
                isActive ? "border-[#58b8c3] text-[#2f7f8d]" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {tab.count > 99 ? "99+" : tab.count}
                </span>
              )}
            </Link>
          );
        })}

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
