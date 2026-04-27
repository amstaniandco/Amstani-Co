"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, Download } from "lucide-react";
import AdminNavbar from "../../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../../components/admin/AdminSidebar";
import { defaultRows } from "../../../../../components/admin/StoreManagementTable";
import ListedProducts, { ProductItem } from "./components/ListedProducts";
import ListingRequests, { ListingRequestItem } from "./components/ListingRequests";
import AddNewProduct from "./components/AddNewProduct";

const products: ProductItem[] = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  name: "Name Of Product",
  price: "$51",
  quantity: 423,
}));

const listingRequests: ListingRequestItem[] = Array.from({ length: 12 }, (_, index) => ({
  id: 12345 + index,
  orderDate: "02/10/2020",
  products: 2,
  productId: 12345 + index,
  quantity: 7,
  status: index % 2 === 0 ? "approved" : "rejected",
}));

function getStoreName(storeId?: string) {
  return defaultRows.find((store) => store.id === storeId)?.name ?? "Name of Store";
}

export default function StoreProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId") ?? "";
  const paramTab = searchParams.get("tab") ?? "listed";
  const [currentTab, setCurrentTab] = useState(paramTab);
  const storeName = getStoreName(storeId);

  const tabs = [
    { label: "Listed", value: "listed" },
    { label: "Listing Requests", value: "listing-requests" },
    { label: "Add New", value: "add-new" },
  ];

  const actionButtonLabel =
    currentTab === "listing-requests" || currentTab === "add-new"
      ? "Update Store Listing"
      : "Promote";

  useEffect(() => {
    if (searchParams.get("tab")) {
      const basePath = "/admin/stores/store-products";
      const path = storeId ? `${basePath}?storeId=${encodeURIComponent(storeId)}` : basePath;
      router.replace(path);
    }
  }, [router, searchParams, storeId]);

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
                  {storeName}
                </h1>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                  Manage listed items, listing requests, and add new products for this store.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (actionButtonLabel === "Promote") {
                    const path = storeId
                      ? `/admin/stores/promote?storeId=${encodeURIComponent(storeId)}`
                      : "/admin/stores/promote";
                    router.push(path);
                  }
                }}
                className="inline-flex items-center justify-center rounded-full border border-[#d8e3e8] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {actionButtonLabel}
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-b border-[#e7edf1] pb-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setCurrentTab(tab.value)}
                    className={`rounded-full px-4 py-2 transition ${
                      currentTab === tab.value
                        ? "bg-[#0f766e] text-white shadow-sm"
                        : "bg-[#f8fafb] text-slate-600 hover:bg-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative w-full max-w-[420px] md:w-[420px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Search by Product Name, ID, or..."
                    className="h-11 w-full rounded-xl border border-[#dbe5ea] bg-[#f8fafc] pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                  />
                </div>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#d8e3e8] bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Filter className="h-4 w-4" />
                  Category
                </button>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-[#d8e3e8] bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  aria-label="Download report"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          <section className="mt-4 overflow-hidden rounded-[28px] border border-[#d9e2e8] bg-white shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
            <div className="overflow-x-auto">
              {currentTab === "listing-requests" ? (
                <ListingRequests listingRequests={listingRequests} />
              ) : currentTab === "add-new" ? (
                <AddNewProduct storeName={storeName} />
              ) : (
                <ListedProducts products={products} />
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
