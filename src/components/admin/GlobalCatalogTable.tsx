"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Edit3, Eye, Power, Search,
  Trash2, SlidersHorizontal, X, CheckSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useConfirm } from "../global/ConfirmProvider";
import { useToast } from "../global/ToastProvider";

export type CatalogProductRow = {
  _id: string;
  sku?: string;
  name: string;
  category?: string;
  brand?: { name: string };
  price?: number;
  adminAdjustedPrice?: number | null;
  status?: "active" | "draft" | "archived";
  totalStock?: number;
  stock?: number;
  isPublished?: boolean;
  imageUrls?: string[];
  allowCustomOrders?: boolean;
  isSuspended?: boolean;
  brandSuspended?: boolean;
  isFeatured?: boolean;
  source?: string;
};

type Props = { refreshKey?: number; onEdit: (productId: string) => void };

const PAGE_SIZE = 10;

// Persisted search/filter/page state — kept in sessionStorage so it survives
// editing or opening a product (which unmounts this table) and is only cleared
// when the admin clears it themselves.
const STORAGE_KEY = "globalCatalogTableState";

type SavedState = {
  search?: string;
  page?: number;
  showFilters?: boolean;
  statusFilter?: string;
  suspendedFilter?: string;
  sourceFilter?: string;
  stockFilter?: string;
  customOrdersFilter?: string;
  featuredFilter?: string;
  categoryFilter?: string;
  brandFilter?: string;
};

function loadSavedState(): SavedState {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}") as SavedState;
  } catch {
    return {};
  }
}

const FilterSelect = ({
  value, onChange, children,
}: { value: string; onChange: (v: string) => void; children: React.ReactNode }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="h-8 rounded-lg border border-[#e7edf1] bg-white px-2 text-xs text-slate-700 focus:border-[#58b8c3] focus:outline-none"
  >
    {children}
  </select>
);

export default function GlobalCatalogTable({ refreshKey = 0, onEdit }: Props) {
  const router  = useRouter();
  const confirm = useConfirm();
  const toast   = useToast();

  const [saved] = useState(loadSavedState);

  const [products,   setProducts]   = useState<CatalogProductRow[]>([]);
  const [search,     setSearch]     = useState(saved.search ?? "");
  const [page,       setPage]       = useState(saved.page ?? 1);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  // Bumped after actions that change a product's price adjustment server-side
  // (publish/unpublish/suspend/activate) so the table re-fetches the new prices.
  const [reloadTick, setReloadTick] = useState(0);
  const [showFilters, setShowFilters] = useState(saved.showFilters ?? false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Filters
  const [statusFilter,       setStatusFilter]       = useState(saved.statusFilter ?? "");
  const [suspendedFilter,    setSuspendedFilter]    = useState(saved.suspendedFilter ?? "");
  const [sourceFilter,       setSourceFilter]       = useState(saved.sourceFilter ?? "");
  const [stockFilter,        setStockFilter]        = useState(saved.stockFilter ?? "");
  const [customOrdersFilter, setCustomOrdersFilter] = useState(saved.customOrdersFilter ?? "");
  const [featuredFilter,     setFeaturedFilter]     = useState(saved.featuredFilter ?? "");
  const [categoryFilter,     setCategoryFilter]     = useState(saved.categoryFilter ?? "");
  const [brandFilter,        setBrandFilter]        = useState(saved.brandFilter ?? "");

  // Filter dropdown options
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [brandOptions,    setBrandOptions]    = useState<string[]>([]);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const totalPages    = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeFilters = [statusFilter, suspendedFilter, stockFilter, customOrdersFilter, featuredFilter, categoryFilter, brandFilter].filter(Boolean).length;

  // Fetch category and brand lists once for filter dropdowns
  useEffect(() => {
    fetch("/api/admin/global-catalog/categories")
      .then((r) => r.ok ? r.json() : { categories: [] })
      .then((d) => setCategoryOptions((d.categories ?? []).map((c: { name: string }) => c.name).sort()))
      .catch(() => {});
    fetch("/api/admin/global-catalog/brands")
      .then((r) => r.ok ? r.json() : { brands: [] })
      .then((d) => setBrandOptions((d.brands ?? []).map((b: { name: string }) => b.name).sort()))
      .catch(() => {});
  }, []);

  const clearFilters = () => {
    setStatusFilter(""); setSuspendedFilter(""); setSourceFilter("");
    setStockFilter(""); setCustomOrdersFilter(""); setFeaturedFilter("");
    setCategoryFilter(""); setBrandFilter("");
  };

  const clearAll = () => { setSearch(""); clearFilters(); };

  // Persist search/filters/page so they survive editing or opening a product
  useEffect(() => {
    if (typeof window === "undefined") return;
    const toSave: SavedState = {
      search, page, showFilters,
      statusFilter, suspendedFilter, sourceFilter, stockFilter,
      customOrdersFilter, featuredFilter, categoryFilter, brandFilter,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  }, [search, page, showFilters, statusFilter, suspendedFilter, sourceFilter, stockFilter, customOrdersFilter, featuredFilter, categoryFilter, brandFilter]);

  // Reset page when filters/search actually change. We compare against a
  // signature seeded with the *restored* values, so the saved page survives
  // remounts (after editing/opening a product) and dev StrictMode re-runs —
  // it only resets to page 1 on a genuine user-initiated filter/search change.
  const filterSig = [search, statusFilter, suspendedFilter, sourceFilter, stockFilter, customOrdersFilter, featuredFilter, categoryFilter, brandFilter].join("|");
  const prevFilterSig = useRef(filterSig);
  useEffect(() => {
    if (prevFilterSig.current === filterSig) return;
    prevFilterSig.current = filterSig;
    setPage(1); setSelectedIds(new Set());
  }, [filterSig]);

  // Fetch products
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    const timeout = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ limit: String(PAGE_SIZE), page: String(page) });
        if (search.trim())          params.set("q",            search.trim());
        if (statusFilter)           params.set("status",       statusFilter);
        if (suspendedFilter)        params.set("suspended",    suspendedFilter);
        if (sourceFilter)           params.set("source",       sourceFilter);
        if (stockFilter)            params.set("stockFilter",  stockFilter);
        if (customOrdersFilter)     params.set("customOrders", customOrdersFilter);
        if (featuredFilter)         params.set("featured",     featuredFilter);
        if (categoryFilter)         params.set("category",     categoryFilter);
        if (brandFilter)            params.set("brand",        brandFilter);

        const res  = await fetch(`/api/admin/global-catalog/products?${params}`, { signal: controller.signal });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Failed to load products"); return; }
        setProducts((data.products || []) as CatalogProductRow[]);
        setTotal(data.total ?? 0);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [search, page, refreshKey, reloadTick, statusFilter, suspendedFilter, sourceFilter, stockFilter, customOrdersFilter, featuredFilter, categoryFilter, brandFilter]);

  // ── Single-row actions ──────────────────────────────────────────────────────

  const deleteProduct = async (productId: string) => {
    if (!(await confirm("Delete this product from the global catalog?"))) return;
    try {
      const res  = await fetch(`/api/admin/global-catalog/products/${productId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to delete product"); return; }
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      setTotal((t) => t - 1);
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(productId); return n; });
    } catch { setError("Failed to delete product"); }
  };

  const toggleCustomOrder = async (productId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/global-catalog/products/${productId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowCustomOrders: !current }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to update"); return; }
      setProducts((prev) => prev.map((p) => p._id === productId ? { ...p, allowCustomOrders: !current } : p));
    } catch { setError("Failed to update custom order setting"); }
  };

  const toggleSuspend = async (product: CatalogProductRow) => {
    if (product.brandSuspended) {
      setError(`"${product.name}" is suspended via its brand. Manage it from the Brands tab.`);
      return;
    }
    const current = product.isSuspended ?? false;
    if (!(await confirm(current
      ? "Activate this product? It will become visible again."
      : "Suspend this product? It will be hidden everywhere."
    ))) return;
    try {
      const res = await fetch(`/api/admin/global-catalog/products/${product._id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSuspended: !current }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to update"); return; }
      setProducts((prev) => prev.map((p) => p._id === product._id ? { ...p, isSuspended: !current } : p));
      // Suspend/activate applies or removes the price adjustment server-side —
      // re-fetch so the displayed price updates without a manual refresh.
      setReloadTick((t) => t + 1);
    } catch { setError("Failed to update suspension"); }
  };

  // ── Bulk actions ────────────────────────────────────────────────────────────

  const bulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (!(await confirm(`Delete ${ids.length} selected product${ids.length > 1 ? "s" : ""}? This cannot be undone.`))) return;
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/global-catalog/products", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Bulk delete failed"); return; }
      toast.success(`${data.deleted} product${data.deleted !== 1 ? "s" : ""} deleted`);
      setProducts((prev) => prev.filter((p) => !selectedIds.has(p._id)));
      setTotal((t) => t - (data.deleted as number));
      setSelectedIds(new Set());
    } catch { toast.error("Bulk delete failed"); }
    finally { setBulkLoading(false); }
  };

  const bulkPatch = async (update: Record<string, unknown>, successMsg: string) => {
    const ids = Array.from(selectedIds);
    setBulkLoading(true);
    try {
      const res = await fetch("/api/admin/global-catalog/products", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, ...update }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Bulk update failed"); return; }
      toast.success(successMsg);
      setProducts((prev) => prev.map((p) => selectedIds.has(p._id) ? { ...p, ...update } : p));
      setSelectedIds(new Set());
      // Publish/unpublish/suspend/activate applies or removes the price
      // adjustment server-side — re-fetch so displayed prices update at once.
      setReloadTick((t) => t + 1);
    } catch { toast.error("Bulk update failed"); }
    finally { setBulkLoading(false); }
  };

  // ── Selection helpers ───────────────────────────────────────────────────────

  const allPageSelected  = products.length > 0 && products.every((p) => selectedIds.has(p._id));
  const somePageSelected = products.some((p) => selectedIds.has(p._id));

  const toggleSelectAll = useCallback(() => {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const n = new Set(prev);
        products.forEach((p) => n.delete(p._id));
        return n;
      });
    } else {
      setSelectedIds((prev) => {
        const n = new Set(prev);
        products.forEach((p) => n.add(p._id));
        return n;
      });
    }
  }, [allPageSelected, products]);

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const numSelected = selectedIds.size;

  return (
    <div className="rounded-xl bg-white shadow-sm md:rounded-[26px]">

      {/* ── Top bar: search + filter toggle ── */}
      <div className="flex flex-col gap-3 border-b border-[#e7edf1] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-4 md:px-5 md:py-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU, name, category, brand…"
            className="w-full rounded-lg border border-[#e7edf1] bg-white py-2 pl-9 pr-9 text-xs text-slate-700 placeholder-slate-400 transition focus:border-[#58b8c3] focus:outline-none sm:text-sm"
          />
          {search && (
            <button
              type="button" onClick={() => setSearch("")} title="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-slate-500">{total} product{total !== 1 ? "s" : ""}</span>
          <button
            type="button" onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              showFilters || activeFilters > 0
                ? "border-[#58b8c3] bg-[#eaf7f9] text-[#2f7f8d]"
                : "border-[#e7edf1] bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters{activeFilters > 0 ? ` (${activeFilters})` : ""}
          </button>
          {(activeFilters > 0 || search.trim()) && (
            <button
              type="button" onClick={clearAll}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
            >
              <X className="h-3.5 w-3.5" /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Filter row ── */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 border-b border-[#e7edf1] bg-[#f8fafb] px-3 py-3 sm:px-4 md:px-5">
          <FilterSelect value={statusFilter} onChange={setStatusFilter}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft / Inactive</option>
          </FilterSelect>

          <FilterSelect value={suspendedFilter} onChange={setSuspendedFilter}>
            <option value="">All Visibility</option>
            <option value="false">Not Suspended</option>
            <option value="true">Suspended</option>
          </FilterSelect>

          <FilterSelect value={stockFilter} onChange={setStockFilter}>
            <option value="">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </FilterSelect>

          <FilterSelect value={customOrdersFilter} onChange={setCustomOrdersFilter}>
            <option value="">Custom Orders: All</option>
            <option value="true">Custom Orders: On</option>
            <option value="false">Custom Orders: Off</option>
          </FilterSelect>

          <FilterSelect value={featuredFilter} onChange={setFeaturedFilter}>
            <option value="">All Products</option>
            <option value="true">Featured Only</option>
          </FilterSelect>

          <FilterSelect value={categoryFilter} onChange={setCategoryFilter}>
            <option value="">All Categories</option>
            {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </FilterSelect>

          <FilterSelect value={brandFilter} onChange={setBrandFilter}>
            <option value="">All Brands</option>
            {brandOptions.map((b) => <option key={b} value={b}>{b}</option>)}
          </FilterSelect>

          {activeFilters > 0 && (
            <button type="button" onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50">
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>
      )}

      {/* ── Bulk actions bar ── */}
      {numSelected > 0 && (
        <div className="border-b border-[#e7edf1] bg-[#eaf7f9] px-3 py-2.5 sm:px-4 md:px-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4 text-[#2f7f8d]" />
              <span className="text-xs font-bold text-[#2f7f8d]">{numSelected} product{numSelected > 1 ? "s" : ""} selected</span>
            </div>
            <button type="button" onClick={() => setSelectedIds(new Set())}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-50">
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {/* Publish / status */}
            <button type="button" disabled={bulkLoading}
              onClick={() => bulkPatch({ isPublished: true, status: "active" }, `${numSelected} published`)}
              className="rounded-lg bg-green-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-green-600 disabled:opacity-60">
              Publish
            </button>
            <button type="button" disabled={bulkLoading}
              onClick={() => bulkPatch({ isPublished: false, status: "draft" }, `${numSelected} set to draft`)}
              className="rounded-lg bg-slate-400 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-slate-500 disabled:opacity-60">
              Unpublish
            </button>

            {/* Suspend / activate */}
            <button type="button" disabled={bulkLoading}
              onClick={() => bulkPatch({ isSuspended: false }, `${numSelected} activated`)}
              className="rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60">
              Activate
            </button>
            <button type="button" disabled={bulkLoading}
              onClick={() => bulkPatch({ isSuspended: true }, `${numSelected} suspended`)}
              className="rounded-lg bg-orange-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60">
              Suspend
            </button>

            <span className="w-px bg-[#cde7ea]" />

            {/* Custom orders */}
            <button type="button" disabled={bulkLoading}
              onClick={() => bulkPatch({ allowCustomOrders: true }, `Custom orders enabled for ${numSelected}`)}
              className="rounded-lg bg-purple-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-purple-600 disabled:opacity-60">
              Custom Orders ON
            </button>
            <button type="button" disabled={bulkLoading}
              onClick={() => bulkPatch({ allowCustomOrders: false }, `Custom orders disabled for ${numSelected}`)}
              className="rounded-lg border border-purple-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-purple-600 transition hover:bg-purple-50 disabled:opacity-60">
              Custom Orders OFF
            </button>

            <span className="w-px bg-[#cde7ea]" />

            {/* Featured */}
            <button type="button" disabled={bulkLoading}
              onClick={() => bulkPatch({ isFeatured: true }, `${numSelected} marked as featured`)}
              className="rounded-lg bg-amber-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60">
              ★ Feature
            </button>
            <button type="button" disabled={bulkLoading}
              onClick={() => bulkPatch({ isFeatured: false }, `${numSelected} unfeatured`)}
              className="rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-amber-600 transition hover:bg-amber-50 disabled:opacity-60">
              ☆ Unfeature
            </button>

            <span className="w-px bg-[#cde7ea]" />

            {/* Delete */}
            <button type="button" disabled={bulkLoading} onClick={bulkDelete}
              className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60">
              Delete
            </button>
          </div>
        </div>
      )}

      {error && <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">{error}</div>}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="min-w-[1000px] w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[#e7edf1] bg-[#f8fafb]">
              {/* Select-all checkbox */}
              <th className="w-10 px-3 py-3 sm:px-4">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  ref={(el) => { if (el) el.indeterminate = somePageSelected && !allPageSelected; }}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 cursor-pointer rounded accent-[#58b8c3]"
                />
              </th>
              <th className="px-3 py-3 text-left font-semibold text-slate-600 sm:px-4">SKU</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-600 sm:px-4">PRODUCT</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-600 sm:px-4">CATEGORY</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-600 sm:px-4">BRAND</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-600 sm:px-4">PRICE</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-600 sm:px-4">STATUS</th>
              <th className="px-3 py-3 text-center font-semibold text-slate-600 sm:px-4">CUSTOM</th>
              <th className="px-3 py-3 text-center font-semibold text-slate-600 sm:px-4">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td className="px-5 py-8 text-center text-slate-400" colSpan={9}>Loading…</td></tr>
            )}
            {!loading && products.length === 0 && (
              <tr><td className="px-5 py-8 text-center text-slate-400" colSpan={9}>No products found.</td></tr>
            )}
            {!loading && products.map((product) => {
              const isActive   = product.status === "active" || product.isPublished;
              const isSuspended = (product.isSuspended ?? false) || (product.brandSuspended ?? false);
              const isSelected  = selectedIds.has(product._id);

              return (
                <tr
                  key={product._id}
                  className={`border-b border-[#e7edf1] transition ${
                    isSelected ? "bg-[#eaf7f9]" : isSuspended ? "bg-orange-50/40" : "hover:bg-[#f8fafb]"
                  }`}
                >
                  {/* Checkbox */}
                  <td className="px-3 py-3 sm:px-4">
                    <input
                      type="checkbox" checked={isSelected} onChange={() => toggleRow(product._id)}
                      className="h-4 w-4 cursor-pointer rounded accent-[#58b8c3]"
                    />
                  </td>

                  {/* SKU */}
                  <td className="px-3 py-3 font-mono text-[11px] text-slate-600 sm:px-4">
                    {product.sku || <span className="text-slate-400">—</span>}
                  </td>

                  {/* Product image + name */}
                  <td className="px-3 py-3 sm:px-4">
                    <div className="flex items-center gap-2.5">
                      {product.imageUrls?.[0] ? (
                        <img src={product.imageUrls[0]} alt="" className="h-9 w-9 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-slate-100 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className={`max-w-[180px] truncate font-medium leading-tight ${isSuspended ? "text-slate-400 line-through" : "text-slate-800"}`}>
                          {product.name}
                        </p>
                        {product.isFeatured && (
                          <span className="mt-0.5 inline-block rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-3 py-3 text-slate-600 sm:px-4">
                    <span className="max-w-[120px] truncate block">{product.category || <span className="text-slate-400">—</span>}</span>
                  </td>

                  {/* Brand */}
                  <td className="px-3 py-3 text-slate-600 sm:px-4">
                    <span className="max-w-[100px] truncate block">{product.brand?.name || <span className="text-slate-400">—</span>}</span>
                  </td>

                  {/* Price */}
                  <td className="px-3 py-3 sm:px-4">
                    <span className="font-semibold text-slate-800">
                      ${(product.adminAdjustedPrice ?? product.price ?? 0).toFixed(2)}
                    </span>
                    {product.adminAdjustedPrice != null && product.adminAdjustedPrice !== product.price && (
                      <span className="ml-1 text-[11px] text-slate-400 line-through">
                        ${(product.price ?? 0).toFixed(2)}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3 sm:px-4">
                    <div className="flex flex-wrap gap-1">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-slate-400"}`} />
                        {isActive ? "Active" : "Draft"}
                      </span>
                      {isSuspended && (
                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-600">
                          {product.brandSuspended ? "Brand Susp." : "Suspended"}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Custom order toggle */}
                  <td className="px-3 py-3 text-center sm:px-4">
                    <button type="button"
                      onClick={() => toggleCustomOrder(product._id, product.allowCustomOrders ?? false)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                        product.allowCustomOrders
                          ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {product.allowCustomOrders ? "ON" : "OFF"}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-3 sm:px-4">
                    <div className="flex justify-center gap-1.5">
                      <button type="button" title="View"
                        onClick={() => router.push(`/admin/global-catalog/products/${product._id}`)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-[#f0f4f8]">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" title="Edit"
                        onClick={() => onEdit(product._id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-[#f0f4f8]">
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button type="button"
                        onClick={() => toggleSuspend(product)}
                        title={product.brandSuspended ? "Suspended via brand" : isSuspended ? "Activate" : "Suspend"}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                          isSuspended ? "border-orange-200 text-orange-500 hover:bg-orange-50" : "border-slate-200 text-slate-500 hover:bg-[#f0f4f8]"
                        }`}>
                        <Power className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" title="Delete"
                        onClick={() => deleteProduct(product._id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between border-t border-[#e7edf1] px-4 py-3 md:px-5">
        <span className="text-xs text-slate-500">
          Page {page} of {totalPages} · {total} total
        </span>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setPage(1)} disabled={page <= 1} title="First page"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40">
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} title="Previous page"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
            const p = start + i;
            return (
              <button key={p} onClick={() => setPage(p)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition ${
                  p === page ? "bg-[#6FAFB3] text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}>
                {p}
              </button>
            );
          })}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} title="Next page"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button onClick={() => setPage(totalPages)} disabled={page >= totalPages} title="Last page"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40">
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
