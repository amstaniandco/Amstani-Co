"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminNavbar from "../../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../../components/admin/AdminSidebar";
import StoreApplicationsTables from "../../../../../components/admin/StoreApplicationsTable";

export default function AdminStoreApplicationsPage() {
  const [monthlyLimit, setMonthlyLimit]           = useState(10);
  const [limitInput, setLimitInput]               = useState("10");
  const [acceptingApplications, setAccepting]     = useState(true);
  const [settingsLoading, setSettingsLoading]     = useState(true);
  const [saving, setSaving]                       = useState(false);

  // Load settings on mount
  useEffect(() => {
    fetch("/api/admin/stores/applications/settings")
      .then((r) => r.json())
      .then((d) => {
        setMonthlyLimit(d.monthlyLimit ?? 10);
        setLimitInput(String(d.monthlyLimit ?? 10));
        setAccepting(d.acceptingApplications ?? true);
      })
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  }, []);

  const saveSettings = async (patch: { monthlyLimit?: number; acceptingApplications?: boolean }) => {
    setSaving(true);
    await fetch("/api/admin/stores/applications/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => {});
    setSaving(false);
  };

  const handleLimitBlur = () => {
    const val = parseInt(limitInput, 10);
    if (isNaN(val) || val < 0) { setLimitInput(String(monthlyLimit)); return; }
    setMonthlyLimit(val);
    saveSettings({ monthlyLimit: val });
  };

  const handleToggle = () => {
    const next = !acceptingApplications;
    setAccepting(next);
    saveSettings({ acceptingApplications: next });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,#eef3f7_0%,#e8f1f5_42%,#f6fafb_100%)] px-2 py-2 text-slate-900 sm:px-4 sm:py-4 md:px-6 md:py-6">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 gap-3 md:gap-4 lg:grid-cols-[280px_1fr]">
        <AdminSidebar activePath="/admin/stores" />

        <main className="rounded-xl md:rounded-[28px] border border-[#d8e0e6] bg-[#f7fafc] p-2 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-3 md:p-4">
          <AdminNavbar />

          <section className="mt-3 rounded-xl md:rounded-[26px] bg-white px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-4 sm:py-4 md:px-5 md:py-5">
            <div className="border-b border-[#e7edf1] pb-3 sm:pb-4">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-[26px]">
                Store Management
              </h1>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                Oversee multi-vendor operations and performance metrics.
              </p>
            </div>

            <div className="mt-3 flex gap-4 border-b border-[#e7edf1] text-xs font-semibold text-slate-700 sm:gap-6 sm:text-sm">
              <Link href="/admin/stores" className="border-b-2 border-transparent pb-2 text-slate-500 transition hover:text-slate-700 sm:pb-3">
                All Stores
              </Link>
              <Link href="/admin/stores/applications" className="border-b-2 border-[#58b8c3] pb-2 text-[#2f7f8d] sm:pb-3">
                Store Applications
              </Link>
              <Link href="/admin/stores/signup-requests" className="border-b-2 border-transparent pb-2 text-slate-500 transition hover:text-slate-700 sm:pb-3">
                Signup Requests
              </Link>
            </div>
          </section>

          <section className="mt-3 md:mt-4">
            {/* Controls bar */}
            <div className="mb-3 flex flex-row items-center justify-between gap-3 px-1 text-xs text-slate-600 sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Monthly limit</span>
                <input
                  type="number"
                  min={0}
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  onBlur={handleLimitBlur}
                  onKeyDown={(e) => e.key === "Enter" && handleLimitBlur()}
                  disabled={settingsLoading}
                  className="w-16 rounded-lg border border-[#d8e2e8] px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-[#58b8c3] focus:ring-1 focus:ring-[#58b8c3] disabled:opacity-50"
                />
                {saving && <span className="text-xs text-slate-400">Saving…</span>}
              </div>

              <div className="flex items-center gap-2">
                <span className={`font-medium ${acceptingApplications ? "text-emerald-600" : "text-slate-500"}`}>
                  {acceptingApplications ? "Accepting applications" : "Not accepting"}
                </span>
                <button
                  onClick={handleToggle}
                  type="button"
                  disabled={settingsLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                    acceptingApplications ? "bg-[#58b8c3]" : "bg-[#c7d2d9]"
                  }`}
                  aria-label="Toggle accepting applications"
                >
                  <span className={`absolute h-5 w-5 rounded-full bg-white shadow-sm transition-all ${acceptingApplications ? "right-0.5" : "left-0.5"}`} />
                </button>
              </div>
            </div>

            <StoreApplicationsTables
              monthlyLimit={monthlyLimit}
              acceptingApplications={acceptingApplications}
              onMonthlyLimitChange={(val) => { setMonthlyLimit(val); setLimitInput(String(val)); }}
              onAcceptingChange={setAccepting}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
