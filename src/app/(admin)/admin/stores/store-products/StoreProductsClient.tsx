"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search, Filter, Download } from "lucide-react";
import AdminNavbar from "../../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../../components/admin/AdminSidebar";
import { useConfirm } from "../../../../../components/global/ConfirmProvider";
import ListedProducts, { type StoreProductItem } from "./components/ListedProducts";
import ListingRequests, { type ListingRequestItem } from "./components/ListingRequests";
import AddNewProduct from "./components/AddNewProduct";
import Pagination from "../../../../../components/admin/Pagination";

const PAGE_SIZE = 10;

export default function StoreProductsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirm = useConfirm();
  const storeId = searchParams.get("storeId") ?? "";
  const [currentTab, setCurrentTab] = useState("listed");
  const [storeName, setStoreName] = useState("Store");
  const [search, setSearch] = useState("");

  // Listed products state
  const [listedProducts, setListedProducts] = useState<StoreProductItem[]>([]);
  const [listedLoading, setListedLoading] = useState(false);

  // Listing requests state
  const [listingRequests, setListingRequests] = useState<ListingRequestItem[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Fetch store name
  useEffect(() => {
    if (!storeId) return;
    fetch("/api/admin/stores")
      .then((r) => r.json())
      .then((data) => {
        const store = data.stores?.find((s: { _id: string }) => s._id === storeId);
        if (store) setStoreName(store.name);
      })
      .catch(() => {});
  }, [storeId]);

  const fetchListedProducts = useCallback(() => {
    if (!storeId) return;
    setListedLoading(true);
    fetch(`/api/admin/stores/${storeId}/products`)
      .then((r) => r.json())
      .then((data) => setListedProducts(data.products ?? []))
      .catch(() => {})
      .finally(() => setListedLoading(false));
  }, [storeId]);

  const fetchListingRequests = useCallback(() => {
    if (!storeId) return;
    setRequestsLoading(true);
    fetch(`/api/admin/stores/${storeId}/listing-requests`)
      .then((r) => r.json())
      .then((data) => setListingRequests(data.requests ?? []))
      .catch(() => {})
      .finally(() => setRequestsLoading(false));
  }, [storeId]);

  useEffect(() => {
    if (currentTab === "listed") fetchListedProducts();
    if (currentTab === "listing-requests") fetchListingRequests();
  }, [currentTab, fetchListedProducts, fetchListingRequests]);

  // Fetch listing requests once on mount to populate the tab badge
  useEffect(() => {
    if (storeId) fetchListingRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const handleRemoveProduct = async (productId: string) => {
    if (!(await confirm("Remove this product from the store?"))) return;
    await fetch(`/api/admin/stores/${storeId}/products`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    fetchListedProducts();
  };

  const handleRequestAction = async (requestId: string, action: "approve" | "reject") => {
    await fetch(`/api/admin/stores/${storeId}/listing-requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    fetchListingRequests();
    if (action === "approve") fetchListedProducts();
  };

  const handleProductsAdded = () => {
    setCurrentTab("listed");
    fetchListedProducts();
  };

  const pendingRequestsCount = listingRequests.filter((r) => r.status === "pending").length;

  const tabs = [
    { label: "Listed", value: "listed", badge: 0 },
    { label: "Listing Requests", value: "listing-requests", badge: pendingRequestsCount },
    { label: "Add New", value: "add-new", badge: 0 },
  ];

  // Filter by search
  const filteredListed = listedProducts.filter(
    (p) =>
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredRequests = listingRequests.filter(
    (r) => !search || r.orderId?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination for the active list tab
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [currentTab, search]);
  const activeList = currentTab === "listing-requests" ? filteredRequests : filteredListed;
  const pageCount = Math.max(1, Math.ceil(activeList.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pagedListed = filteredListed.slice(pageStart, pageStart + PAGE_SIZE);
  const pagedRequests = filteredRequests.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <div className="admin-page-shell">
      <div className="admin-page-grid">
        <AdminSidebar activePath="/admin/stores" className="admin-sidebar-flush" />

        <main className="admin-main-panel">
          <AdminNavbar />

          <section className="mt-3 rounded-xl bg-white px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:mt-4 sm:rounded-[26px] sm:px-4 sm:py-4 md:px-5 md:py-5">
            <div className="flex flex-col gap-4 border-b border-[#e7edf1] pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <button
                  type="button"
                  onClick={() => router.push("/admin/stores")}
                  className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Stores
                </button>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-[26px]">
                  {storeName}
                </h1>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                  Manage listed items, listing requests, and add new products for this store.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-b border-[#e7edf1] pb-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setCurrentTab(tab.value)}
                    className={`relative rounded-full px-4 py-2 transition ${
                      currentTab === tab.value
                        ? "bg-[#0f766e] text-white shadow-sm"
                        : "bg-[#f8fafb] text-slate-600 hover:bg-white"
                    }`}
                  >
                    {tab.label}
                    {tab.badge > 0 && (
                      <span className="absolute -right-1 -top-1 inline-flex min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 py-0.5 text-[9px] font-bold leading-none text-white ring-2 ring-white">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative w-full max-w-[420px] md:w-[420px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by Product Name, ID, or SKU..."
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
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          <section className="mt-4 overflow-hidden rounded-[28px] border border-[#d9e2e8] bg-white shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
            <div className="overflow-x-auto">
              {currentTab === "listing-requests" ? (
                <ListingRequests
                  listingRequests={pagedRequests}
                  loading={requestsLoading}
                  onAction={handleRequestAction}
                />
              ) : currentTab === "add-new" ? (
                <AddNewProduct storeId={storeId} storeName={storeName} onAdded={handleProductsAdded} />
              ) : (
                <ListedProducts
                  products={pagedListed}
                  loading={listedLoading}
                  onRemove={handleRemoveProduct}
                />
              )}
            </div>
            {currentTab !== "add-new" && (
              <Pagination
                page={page}
                pageCount={pageCount}
                onChange={setPage}
                totalItems={activeList.length}
                pageSize={PAGE_SIZE}
                className="border-t border-[#edf2f5]"
              />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
