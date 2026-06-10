"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StoreManagementTabs from "../../../../components/admin/StoreManagementTabs";
import { CircleCheck, CircleSlash, Mail, Package, ShieldX, TriangleAlert, Trash2, Megaphone } from "lucide-react";
import { useToast } from "../../../../components/global/ToastProvider";
import AdminNavbar from "../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../components/admin/AdminSidebar";
import CustomerOwnerChatsPanel from "../../../../components/admin/CustomerOwnerChatsPanel";
import StoreChatPanel from "../../../../components/admin/StoreChatPanel";
import StoreManagementTable, {
  type StoreRow,
} from "../../../../components/admin/StoreManagementTable";
import { fetchAllStores, updateStoreStatus, type StoreData } from "../../../../services/admin/storesService";

const NAV_TABS = [
  { label: "All Stores",        href: "/admin/stores",                key: "stores" },
  { label: "Store Applications",href: "/admin/stores/applications",   key: null },
  { label: "Signup Requests",   href: "/admin/stores/signup-requests",key: null },
  { label: "Live Warnings",     href: null,                           key: "warnings" },
];

function convertStoreToRow(store: StoreData & { rating?: number }): StoreRow {
  const statusMap: Record<string, "Active" | "Suspended" | "Dormant"> = {
    active: "Active",
    suspended: "Suspended",
    pending: "Dormant",
  };

  return {
    id: store._id,
    name: store.name,
    status: statusMap[store.status] || "Dormant",
    owner: store.owner?.name || "Unknown",
    onboarding: store.createdAt ? new Date(store.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A",
    revenue: "$0",
    rating: store.rating != null && store.rating > 0 ? Number(store.rating).toFixed(1) : "0.0",
    ownerEmail: store.owner?.email,
    ownerPhone: store.owner?.phone,
    location: store.owner?.state,
    monthlyOrders: "0",
    fulfillmentRate: "0%",
    returnRate: "0%",
    escalationRisk: "Low",
  };
}

export default function AdminStoresPage() {
  const router = useRouter();
  const toast = useToast();
  const [selectedStore, setSelectedStore] = useState<StoreRow | null>(null);
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Suspended" | "Dormant">("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"stores" | "warnings">(
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tab") === "warnings" ? "warnings" : "stores"
  );
  const [openChats, setOpenChats] = useState<{ id: string; name: string }[]>([]);
  const [activeChatId, setActiveChatId] = useState("");
  const [pendingListingCount, setPendingListingCount] = useState(0);
  const [chatBadges, setChatBadges] = useState<Record<string, number>>({});
  const [liveWarnings, setLiveWarnings] = useState<{
    storeId: string; storeName: string; warnings: number;
    warningsResetAt: string | null; ownerName: string; ownerEmail: string;
  }[]>([]);

  // Get unique states from stores
  const uniqueStates = Array.from(new Set(stores.map(s => s.location).filter(Boolean)));

  // Filter stores based on search and filters
  const filteredStores = stores.filter(store => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      store.name.toLowerCase().includes(searchLower) ||
      store.id.toLowerCase().includes(searchLower) ||
      store.owner.toLowerCase().includes(searchLower) ||
      (store.ownerEmail?.toLowerCase().includes(searchLower) ?? false);

    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter !== "all" && store.status !== statusFilter) return false;

    // State filter
    if (stateFilter !== "all" && store.location !== stateFilter) return false;

    // Rating filter
    if (ratingFilter !== "all") {
      const rating = parseFloat(store.rating);
      switch (ratingFilter) {
        case "4+":
          if (rating < 4) return false;
          break;
        case "3-4":
          if (rating < 3 || rating >= 4) return false;
          break;
        case "below3":
          if (rating >= 3) return false;
          break;
      }
    }

    return true;
  });

  const PAGE_SIZE = 6;
  const totalPages = Math.max(1, Math.ceil(filteredStores.length / PAGE_SIZE));
  const pagedStores = filteredStores.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset to page 1 whenever filters / search change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, stateFilter, ratingFilter]);

  useEffect(() => {
    // Read BEFORE clearing so we can show badges for messages since last visit
    const prevSinceChats = localStorage.getItem("sb_seen_admin_chats") ?? "";

    const now = new Date().toISOString();
    localStorage.setItem("sb_seen_admin_stores", now);
    localStorage.setItem("sb_seen_admin_chats", now);
    window.dispatchEvent(new CustomEvent("sb-seen", { detail: "admin_stores" }));
    window.dispatchEvent(new CustomEvent("sb-seen", { detail: "admin_chats" }));

    // Fetch per-store chat badge counts using the previous since timestamp
    const params = prevSinceChats ? `?since=${encodeURIComponent(prevSinceChats)}` : "";
    fetch(`/api/admin/stores/chat-counts${params}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setChatBadges(data.counts ?? {}); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const loadStores = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAllStores();
        const convertedStores = data.map(convertStoreToRow);
        setStores(convertedStores);
        if (convertedStores.length > 0) {
          setSelectedStore(convertedStores[0]);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to fetch stores");
        console.error("Error loading stores:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStores();

    fetch("/api/admin/live-warnings")
      .then((r) => r.json())
      .then((d) => setLiveWarnings(d.warnings || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedStore) { setPendingListingCount(0); return; }
    let cancelled = false;
    fetch(`/api/admin/stores/${encodeURIComponent(selectedStore.id)}/listing-requests`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (cancelled || !data) return;
        const pending = (data.requests as { status: string }[]).filter((r) => r.status === "pending").length;
        setPendingListingCount(pending);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [selectedStore?.id]);

  const openOwnerChat = (store: StoreRow) => {
    setOpenChats((prev) =>
      prev.find((chat) => chat.id === store.id) ? prev : [...prev, { id: store.id, name: store.name }]
    );
    setActiveChatId(store.id);
  };

  const handleStoreClick = (store: StoreRow) => {
    setSelectedStore(store);
    openOwnerChat(store);
  };

  const handleUpdateStatus = async (storeId: string, newStatus: "active" | "suspended" | "pending") => {
    try {
      setIsUpdating(true);
      await updateStoreStatus(storeId, newStatus);
      
      // Update local state
      const updatedStores = stores.map(store => {
        if (store.id === storeId) {
          const statusMap: Record<string, "Active" | "Suspended" | "Dormant"> = {
            active: "Active",
            suspended: "Suspended",
            pending: "Dormant",
          };
          return { ...store, status: statusMap[newStatus] || "Dormant" };
        }
        return store;
      });
      setStores(updatedStores);
      
      // Update selected store
      if (selectedStore?.id === storeId) {
        const statusMap: Record<string, "Active" | "Suspended" | "Dormant"> = {
          active: "Active",
          suspended: "Suspended",
          pending: "Dormant",
        };
        setSelectedStore({ ...selectedStore, status: statusMap[newStatus] || "Dormant" });
      }
    } catch (err) {
      console.error("Error updating store status:", err);
      toast.error("Failed to update store status");
    } finally {
      setIsUpdating(false);
    }
  };

  const chatRef = useRef<HTMLDivElement>(null);

  const handleContactOwner = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    if (!store) return;
    openOwnerChat(store);
    // Switch to stores tab first so the chat section is rendered, then scroll
    setActiveTab("stores");
    setTimeout(() => {
      chatRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  };

  return (
    <div className="admin-page-shell">
      <div className="admin-page-grid">
        <AdminSidebar activePath="/admin/stores" className="admin-sidebar-flush" />

        <main className="admin-main-panel">
          <AdminNavbar />

          <section className="mt-3 rounded-xl bg-white px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:mt-4 sm:rounded-[26px] sm:px-4 sm:py-4 md:px-5 md:py-5">
            <div className="border-b border-[#e7edf1] pb-4">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-[26px]">
                Store Management
              </h1>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                Oversee multi-vendor operations and performance metrics.
              </p>
            </div>

            <StoreManagementTabs
              warningCount={liveWarnings.length}
              activeWarningsTab={activeTab === "warnings"}
              onWarningsTabClick={() => setActiveTab(activeTab === "warnings" ? "stores" : "warnings")}
            />
          </section>

          {/* Live Warnings tab content */}
          {activeTab === "warnings" && (
            <section className="mt-4 rounded-[22px] border border-amber-200 bg-amber-50 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <TriangleAlert className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <h2 className="text-sm font-bold text-amber-800">
                  Compliance Warnings — {liveWarnings.length} Store{liveWarnings.length !== 1 ? "s" : ""} at 3/3
                </h2>
              </div>
              {liveWarnings.length === 0 ? (
                <p className="text-sm text-amber-700">No stores have reached the warning limit.</p>
              ) : (
                <div className="space-y-2">
                  {liveWarnings.map((w) => (
                    <div key={w.storeId} className="flex flex-col gap-1.5 rounded-xl border border-amber-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{w.storeName}</p>
                        <p className="text-xs text-slate-500">{w.ownerName} · {w.ownerEmail}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">
                          3/3 Warnings
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            handleContactOwner(w.storeId);
                            chatRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                          }}
                          className="rounded-lg bg-[#6ec0c9] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#5db1bb]"
                        >
                          Contact Owner
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm(`Remove all warnings from ${w.storeName}?`)) return;
                            await fetch("/api/admin/live-warnings", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ storeId: w.storeId }),
                            });
                            setLiveWarnings((prev) => prev.filter((x) => x.storeId !== w.storeId));
                            toast.success(`Warnings cleared for ${w.storeName}`);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                        >
                          <ShieldX className="h-3.5 w-3.5" /> Remove Warning
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === "stores" && isLoading && (
            <section className="mt-4 flex items-center justify-center rounded-[22px] border border-[#d9e2e8] bg-white p-12 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <div className="text-center">
                <div className="mb-4 inline-flex h-10 w-10 animate-spin rounded-full border-4 border-[#d8e3e8] border-t-[#6ec0c9]" />
                <p className="text-sm font-medium text-slate-600">Loading stores...</p>
              </div>
            </section>
          )}

          {activeTab === "stores" && !isLoading && stores.length === 0 && (
            <section className="mt-4 rounded-[22px] border border-[#d9e2e8] bg-white p-8 text-center shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-12">
              <p className="text-slate-600">No stores found</p>
            </section>
          )}

          {activeTab === "stores" && !isLoading && stores.length > 0 && filteredStores.length === 0 && (
            <section className="mt-4 rounded-[22px] border border-[#e5edf1] bg-blue-50 p-8 text-center shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-12">
              <p className="text-slate-600">No stores match your filters. Try adjusting your search or filter criteria.</p>
            </section>
          )}

          {activeTab === "stores" && !isLoading && stores.length > 0 && filteredStores.length > 0 && (
            <>
              <section className="mt-4">
                <StoreManagementTable
                  rows={pagedStores}
                  selectedStoreId={selectedStore?.id}
                  onSelectStore={handleStoreClick}
                  onSuspend={(storeId) => handleUpdateStatus(storeId, "suspended")}
                  onActivate={(storeId) => handleUpdateStatus(storeId, "active")}
                  onContact={(storeId) => handleContactOwner(storeId)}
                  onMoreActions={(storeId) => {
                    const store = stores.find(s => s.id === storeId);
                    if (store) setSelectedStore(store);
                  }}
                  onManageProducts={(storeId) => {
                    router.push(`/admin/stores/store-products?storeId=${encodeURIComponent(storeId)}`);
                  }}
                  onDeleteStore={(storeId) => {
                    if (confirm("Are you sure you want to delete this store? This action cannot be undone.")) {
                      alert("Delete functionality coming soon");
                    }
                  }}
                  onViewAnalytics={(storeId) => {
                    router.push(`/admin/stores/${storeId}/analytics`);
                  }}
                  onViewStore={(storeId) => {
                    const store = stores.find(s => s.id === storeId);
                    if (store) window.open(`/store/${storeId}`, "_blank");
                  }}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                  stateFilter={stateFilter}
                  onStateFilterChange={setStateFilter}
                  availableStates={uniqueStates as string[]}
                  chatBadges={chatBadges}
                />
              </section>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#d9e2e8] bg-white text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition ${
                        page === currentPage
                          ? "border-[#6ec0c9] bg-[#6ec0c9] text-white"
                          : "border-[#d9e2e8] bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#d9e2e8] bg-white text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                  >
                    ›
                  </button>
                </div>
              )}

              {selectedStore && (
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



                  {/* Action buttons */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedStore.status !== "Active" ? (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(selectedStore.id, "active")}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                      >
                        <CircleCheck className="h-4 w-4" /> Activate Store
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(selectedStore.id, "suspended")}
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-600 disabled:opacity-60"
                      >
                        <CircleSlash className="h-4 w-4" /> Suspend Store
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => { handleContactOwner(selectedStore.id); chatRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#6ec0c9] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#5db1bb]"
                    >
                      <Mail className="h-4 w-4" /> Contact Owner
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/stores/store-products?storeId=${encodeURIComponent(selectedStore.id)}`)}
                      className="relative inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Package className="h-4 w-4" /> Manage Products
                      {pendingListingCount > 0 && (
                        <span className="ml-0.5 inline-flex min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 py-0.5 text-[10px] font-bold leading-none text-white">
                          {pendingListingCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/stores/promote?storeId=${encodeURIComponent(selectedStore.id)}`)}
                      className="inline-flex items-center gap-2 rounded-lg bg-violet-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-600"
                    >
                      <Megaphone className="h-4 w-4" /> Promote
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (confirm("Delete this store? This cannot be undone.")) alert("Delete coming soon"); }}
                      className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" /> Delete Store
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
                        selectedStore.rating === "0.0" || !selectedStore.rating
                          ? "0/0"
                          : `${selectedStore.rating}/5`
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
              )}
              
              <div ref={chatRef} className="mt-4 grid gap-4 grid-cols-1">
                <StoreChatPanel
                  title="Owner Communications"
                  rightLabel="Select a store to chat with its owner"
                  stores={openChats}
                  activeStoreId={activeChatId}
                  onSelectStore={setActiveChatId}
                  panelType="owner"
                />
                <CustomerOwnerChatsPanel />
              </div>
            </>
          )}
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
