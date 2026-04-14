import { Plus } from "lucide-react";
import AdminNavbar from "../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../components/admin/AdminSidebar";
import CommunicationsTable from "../../../../components/admin/CommunicationsTable";

export default function AdminCommunicationsPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,#eef3f7_0%,#e8f1f5_42%,#f6fafb_100%)] px-2 py-2 text-slate-900 sm:px-4 sm:py-4 md:px-6 md:py-6">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 gap-3 md:gap-4 lg:grid-cols-[280px_1fr]">
        <AdminSidebar activePath="/admin/communications" />

        <main className="rounded-xl border border-[#d8e0e6] bg-[#f7fafc] p-2 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:rounded-[28px] sm:p-3 md:p-4">
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
                className="inline-flex h-9 w-9 items-center justify-center self-start rounded-md border border-[#d8e1e8] bg-white text-slate-700 transition hover:bg-slate-50"
                aria-label="Add announcement"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <CommunicationsTable />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
