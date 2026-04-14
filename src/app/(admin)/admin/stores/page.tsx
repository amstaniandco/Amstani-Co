import Link from "next/link";
import { Plus } from "lucide-react";
import AdminNavbar from "../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../components/admin/AdminSidebar";
import StoreChatPanel from "../../../../components/admin/StoreChatPanel";
import StoreManagementTable from "../../../../components/admin/StoreManagementTable";

const tabs = [
  { label: "All Stores", href: "/admin/stores" },
  { label: "Store Applications", href: "/admin/stores/applications" },
];

export default function AdminStoresPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,#eef3f7_0%,#e8f1f5_42%,#f6fafb_100%)] px-4 py-4 text-slate-900 sm:px-6 sm:py-6">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <AdminSidebar activePath="/admin/stores" />

        <main className="rounded-[28px] border border-[#d8e0e6] bg-[#f7fafc] p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-4">
          <AdminNavbar />

          <section className="mt-4 rounded-[26px] bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-5 sm:py-5">
            <div className="flex flex-col gap-4 border-b border-[#e7edf1] pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-[26px] font-bold tracking-tight text-slate-900">Store Management</h1>
                <p className="mt-1 text-sm text-slate-600">Oversee multi-vendor operations and performance metrics.</p>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#6ec0c9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5db1bb]"
              >
                <Plus className="h-4 w-4" />
                Register New Store
              </button>
            </div>

            <div className="mt-4 flex gap-6 border-b border-[#e7edf1] text-sm font-semibold text-slate-700">
              {tabs.map((tab) => {
                const isActive = tab.href === "/admin/stores";

                return (
                  <Link
                    key={tab.label}
                    href={tab.href}
                    className={`border-b-2 pb-3 transition ${
                      isActive
                        ? "border-[#58b8c3] text-[#2f7f8d]"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mt-4">
            <StoreManagementTable />
          </section>

          <section className="mt-4 grid gap-4">
            <StoreChatPanel title="Chat" rightLabel="Monitoring: The Spice Merchant" />
            <StoreChatPanel title="Store Chat Monitor" rightLabel="Monitoring: The Spice Merchant" />
          </section>
        </main>
      </div>
    </div>
  );
}
