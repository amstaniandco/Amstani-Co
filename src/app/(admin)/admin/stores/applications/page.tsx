"use client";

import { useEffect, useState } from "react";
import AdminNavbar from "../../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../../components/admin/AdminSidebar";
import StoreManagementTabs from "../../../../../components/admin/StoreManagementTabs";
import StoreApplicationsTables from "../../../../../components/admin/StoreApplicationsTable";

export default function AdminStoreApplicationsPage() {
  const [monthlyLimit, setMonthlyLimit]           = useState(10);
  const [limitInput, setLimitInput]               = useState("10");
  const [acceptingApplications, setAccepting]     = useState(true);
  const [settingsLoading, setSettingsLoading]     = useState(true);
  const [saving, setSaving]                       = useState(false);

  useEffect(() => {
    localStorage.setItem("sb_seen_admin_stores_applications", new Date().toISOString());
    localStorage.setItem("sb_seen_admin_stores", new Date().toISOString());
    window.dispatchEvent(new CustomEvent("sb-seen", { detail: "admin_stores_applications" }));
  }, []);

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
    <div className="admin-page-shell">
      <div className="admin-page-grid">
        <AdminSidebar activePath="/admin/stores" className="admin-sidebar-flush" />

        <main className="admin-main-panel">
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

            <StoreManagementTabs />
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
