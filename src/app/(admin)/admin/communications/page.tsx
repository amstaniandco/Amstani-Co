"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import AdminNavbar from "../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../components/admin/AdminSidebar";
import CommunicationsTable from "../../../../components/admin/CommunicationsTable";

export default function AdminCommunicationsPage() {
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  return (
    <div className="admin-page-shell">
      <div className="admin-page-grid">
        <AdminSidebar activePath="/admin/communications" className="admin-sidebar-flush" />

        <main className="admin-main-panel">
          <AdminNavbar searchPlaceholder="Search broadcasts..." />

          <section className="mt-3 rounded-xl bg-white px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] md:rounded-[26px] sm:px-4 sm:py-4 md:px-5 md:py-5">
            <div className="flex flex-col gap-3 border-b border-[#e7edf1] pb-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Global Announcements & Banners</h1>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                  Manage push notifications and dashboard banners for merchants.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsComposerOpen(true)}
                className="inline-flex h-9 w-9 items-center justify-center self-start rounded-md border border-[#d8e1e8] bg-white text-slate-700 transition hover:bg-slate-50"
                aria-label="Add announcement"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <CommunicationsTable
                isComposerOpen={isComposerOpen}
                onCloseComposer={() => setIsComposerOpen(false)}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
