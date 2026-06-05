"use client";

import { useState } from "react";
import AdminNavbar from "../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../components/admin/AdminSidebar";
import GlobalCatalogTable from "../../../../components/admin/GlobalCatalogTable";
import BrandsTab from "../../../../components/admin/BrandsTab";
import CategoryTab from "../../../../components/admin/CategoryTab";
import AddGlobalProductForm from "../../../../components/admin/AddGlobalProductForm";
import TaxPricingPage from "./tax-pricing/page";

export default function AdminGlobalCatalogPage() {
  const [activeTab, setActiveTab] = useState<"products" | "tax-pricing" | "brands" | "category" | "add-product">("products");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productsRefreshKey, setProductsRefreshKey] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ ok: boolean; log?: string[]; error?: string } | null>(null);

  const openAddProduct = () => {
    setEditingProductId(null);
    setActiveTab("add-product");
  };

  const openEditProduct = (productId: string) => {
    setEditingProductId(productId);
    setActiveTab("add-product");
  };

  const returnToProducts = () => {
    setEditingProductId(null);
    setActiveTab("products");
  };

  const fetchFromSupabase = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/admin/global-catalog/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setSyncResult({ ok: false, error: data.detail || data.error || "Sync failed" });
      } else {
        setSyncResult({ ok: true, log: data.log });
        setProductsRefreshKey((k) => k + 1);
      }
    } catch {
      setSyncResult({ ok: false, error: "Network error — could not reach sync endpoint" });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="admin-page-shell">
      <div className="admin-page-grid">
        <AdminSidebar activePath="/admin/global-catalog" className="admin-sidebar-flush" />

        <main className="admin-main-panel">
          <AdminNavbar />

          <section className="mt-3 rounded-xl md:rounded-[26px] bg-white px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:px-4 sm:py-4 md:px-5 md:py-5">
            <div className="flex flex-col gap-3 border-b border-[#e7edf1] pb-3 sm:gap-4 sm:pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-[26px]">
                  Global Catalog & System Admin
                </h1>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                  Manage master data, tax rules, and pricing constraints for all
                  customers.
                </p>
              </div>

              {activeTab === "products" && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchFromSupabase}
                    disabled={syncing}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#58b8c3] bg-white px-3 py-2 text-xs font-semibold text-[#2f7f8d] transition hover:bg-[#eaf7f9] disabled:opacity-60 sm:px-4 sm:py-2.5 sm:text-sm md:rounded-xl"
                  >
                    {syncing ? (
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    )}
                    {syncing ? "Fetching…" : "Fetch from Supabase"}
                  </button>
                  <button
                    type="button"
                    onClick={openAddProduct}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6ec0c9] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#5db1bb] sm:px-4 sm:py-2.5 sm:text-sm md:rounded-xl"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Global Product
                  </button>
                </div>
              )}
            </div>

            {syncResult && (
              <div
                className={`mt-3 rounded-lg px-4 py-3 text-sm ${
                  syncResult.ok
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {syncResult.ok ? (
                      <>
                        <p className="font-semibold">Sync complete</p>
                        {syncResult.log?.map((line, i) => (
                          <p key={i} className="mt-0.5 text-xs opacity-80">{line}</p>
                        ))}
                      </>
                    ) : (
                      <>
                        <p className="font-semibold">Sync failed</p>
                        <p className="mt-0.5 text-xs opacity-80 whitespace-pre-wrap">{syncResult.error}</p>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSyncResult(null)}
                    className="shrink-0 text-xs opacity-60 hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <div className="mt-3 flex gap-4 border-b border-[#e7edf1] text-xs font-semibold text-slate-700 sm:gap-6 sm:text-sm">
              <button
                onClick={returnToProducts}
                className={`border-b-2 pb-2 transition sm:pb-3 ${
                  activeTab === "products"
                    ? "border-[#58b8c3] text-[#2f7f8d]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setActiveTab("tax-pricing")}
                className={`border-b-2 pb-2 transition sm:pb-3 ${
                  activeTab === "tax-pricing"
                    ? "border-[#58b8c3] text-[#2f7f8d]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Tax & Pricing
              </button>
              <button
                onClick={() => setActiveTab("brands")}
                className={`border-b-2 pb-2 transition sm:pb-3 ${
                  activeTab === "brands"
                    ? "border-[#58b8c3] text-[#2f7f8d]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Brands
              </button>
              <button
                onClick={() => setActiveTab("category")}
                className={`border-b-2 pb-2 transition sm:pb-3 ${
                  activeTab === "category"
                    ? "border-[#58b8c3] text-[#2f7f8d]"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Category
              </button>
            </div>
          </section>

          <section className="mt-3 md:mt-4">
            {activeTab === "products" && <GlobalCatalogTable refreshKey={productsRefreshKey} onEdit={openEditProduct} />}
            {activeTab === "tax-pricing" && <TaxPricingPage />}
            {activeTab === "brands" && <BrandsTab />}
            {activeTab === "category" && <CategoryTab />}
            {activeTab === "add-product" && (
              <AddGlobalProductForm
                productId={editingProductId}
                onBack={returnToProducts}
                onSaved={() => setProductsRefreshKey((key) => key + 1)}
              />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
