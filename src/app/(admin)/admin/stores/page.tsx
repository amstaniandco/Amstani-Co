"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import AdminNavbar from "../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../components/admin/AdminSidebar";
import StoreChatPanel from "../../../../components/admin/StoreChatPanel";
import StoreManagementTable, {
  defaultRows,
  type StoreRow,
} from "../../../../components/admin/StoreManagementTable";

const tabs = [
  { label: "All Stores", href: "/admin/stores" },
  { label: "Store Applications", href: "/admin/stores/applications" },
  { label: "Signup Requests", href: "/admin/stores/signup-requests" },
];

export default function AdminStoresPage() {
  const [selectedStore, setSelectedStore] = useState<StoreRow>(defaultRows[0]);

  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,#eef3f7_0%,#e8f1f5_42%,#f6fafb_100%)] px-2 py-2 text-slate-900 sm:px-4 sm:py-4 md:px-6 md:py-6">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <AdminSidebar activePath="/admin/stores" />

        <main className="rounded-xl border border-[#d8e0e6] bg-[#f7fafc] p-2 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:rounded-[28px] sm:p-3 md:p-4">
          <AdminNavbar />

          <section className="mt-3 rounded-xl bg-white px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:mt-4 sm:rounded-[26px] sm:px-4 sm:py-4 md:px-5 md:py-5">
            <div className="flex flex-col gap-4 border-b border-[#e7edf1] pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-[26px]">
                  Store Management
                </h1>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                  Oversee multi-vendor operations and performance metrics.
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-[#6ec0c9] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#5db1bb] sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
              >
                <Plus className="h-4 w-4" />
                Register New Store
              </button>
            </div>

            <div className="mt-3 overflow-x-auto border-b border-[#e7edf1] text-xs font-semibold text-slate-700 sm:mt-4 sm:text-sm">
              <div className="flex min-w-max gap-6">
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
            </div>
          </section>

          <section className="mt-4">
            <StoreManagementTable
              rows={defaultRows}
              selectedStoreId={selectedStore.id}
              onSelectStore={setSelectedStore}
            />
          </section>

          <section className="mt-4 rounded-[22px] border border-[#d9e2e8] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-5">
            <div className="flex flex-col gap-2 border-b border-[#e8eef2] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  Store Details
                </h2>
                <p className="text-sm text-slate-600">
                  Selected store: {selectedStore.name} ({selectedStore.id})
                </p>
              </div>
              <span className="inline-flex rounded-full border border-[#cde7ea] bg-[#ecf8fa] px-3 py-1 text-xs font-semibold text-[#2f7f8d]">
                {selectedStore.status}
              </span>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                type="button"
                className="rounded-xl bg-[#65bbc5] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#53aab5]"
              >
                Promote
              </button>
            </div>

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <DetailItem label="Owner" value={selectedStore.owner} />
              <DetailItem
                label="Owner Email"
                value={selectedStore.ownerEmail ?? "-"}
              />
              <DetailItem
                label="Owner Phone"
                value={selectedStore.ownerPhone ?? "-"}
              />
              <DetailItem
                label="Location"
                value={selectedStore.location ?? "-"}
              />
              <DetailItem
                label="Category"
                value={selectedStore.category ?? "-"}
              />
              <DetailItem
                label="Onboarding Date"
                value={selectedStore.onboarding}
              />
              <DetailItem label="Revenue (30d)" value={selectedStore.revenue} />
              <DetailItem
                label="Store Rating"
                value={
                  selectedStore.rating === "0.0" ? "n/a" : selectedStore.rating
                }
              />
              <DetailItem
                label="Monthly Orders"
                value={selectedStore.monthlyOrders ?? "-"}
              />
              <DetailItem
                label="Fulfillment Rate"
                value={selectedStore.fulfillmentRate ?? "-"}
              />
              <DetailItem
                label="Return Rate"
                value={selectedStore.returnRate ?? "-"}
              />
              <DetailItem
                label="Escalation Risk"
                value={selectedStore.escalationRisk ?? "-"}
              />
            </div>
          </section>

          <section className="mt-4 grid gap-4">
            <StoreChatPanel
              title="Customer Chats"
              rightLabel={`Monitoring: ${selectedStore.name}`}
              storeId={selectedStore.id}
              panelType="customer"
            />
            <StoreChatPanel
              title="Owner Chats"
              rightLabel={`Monitoring: ${selectedStore.name}`}
              storeId={selectedStore.id}
              panelType="owner"
            />
          </section>
        </main>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#e6edf2] bg-[#f9fbfd] px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
