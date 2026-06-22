"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Edit2, Package, Power, Search, Trash2, X } from "lucide-react";

type BrandProduct = {
  _id: string;
  name: string;
  sku?: string;
  price: number;
  status: string;
  mainImage?: string | null;
  brandSuspended?: boolean;
};

type Brand = {
  _id: string;
  name: string;
  slug?: string;
  productCount?: number;
  source?: string;
  status?: "active" | "suspended";
  sourceBrandId?: string;
};

type ConfirmDialog = {
  title: string;
  message: string;
  confirmLabel: string;
  variant: "danger" | "warning" | "success";
  onConfirm: () => void;
};

export default function BrandsTab() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [newBrandName, setNewBrandName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit modal
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editName, setEditName] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  // Confirm dialog
  const [confirm, setConfirm] = useState<ConfirmDialog | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [brandProducts, setBrandProducts] = useState<Record<string, BrandProduct[]>>({});
  const [productsLoading, setProductsLoading] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.set("q", searchTerm.trim());
        const res = await fetch(`/api/admin/global-catalog/brands?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || "Failed to load brands"); return; }
        setBrands((data.brands || []) as Brand[]);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError("Failed to load brands");
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [searchTerm]);

  useEffect(() => {
    if (editingBrand) setTimeout(() => editInputRef.current?.focus(), 50);
  }, [editingBrand]);

  const addBrand = async (event: FormEvent) => {
    event.preventDefault();
    if (!newBrandName.trim()) return;
    try {
      const res = await fetch("/api/admin/global-catalog/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBrandName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to add brand"); return; }
      setBrands((prev) => [...prev, data.brand as Brand].sort((a, b) => a.name.localeCompare(b.name)));
      setNewBrandName("");
      setError("");
    } catch {
      setError("Failed to add brand");
    }
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setEditName(brand.name);
    setEditError("");
  };

  const closeEditModal = () => {
    setEditingBrand(null);
    setEditName("");
    setEditError("");
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingBrand || !editName.trim()) return;
    setEditSaving(true);
    setEditError("");
    try {
      const res = await fetch(`/api/admin/global-catalog/brands/${editingBrand._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.error || "Failed to save brand"); return; }
      setBrands((prev) => prev.map((b) => (b._id === editingBrand._id ? { ...b, ...data.brand } : b)));
      closeEditModal();
    } catch {
      setEditError("Failed to save brand");
    } finally {
      setEditSaving(false);
    }
  };

  const toggleExpand = async (brand: Brand) => {
    if (expandedId === brand._id) { setExpandedId(null); return; }
    setExpandedId(brand._id);
    if (brandProducts[brand._id] !== undefined) return;
    setProductsLoading(brand._id);
    try {
      const params = new URLSearchParams({ limit: "200" });
      params.set("brand", brand.name);
      if (brand.sourceBrandId) params.set("brandSourceId", brand.sourceBrandId);
      const res = await fetch(`/api/admin/global-catalog/products?${params.toString()}`);
      const data = await res.json();
      setBrandProducts((prev) => ({ ...prev, [brand._id]: (data.products || []) as BrandProduct[] }));
    } catch {
      setBrandProducts((prev) => ({ ...prev, [brand._id]: [] }));
    } finally {
      setProductsLoading(null);
    }
  };

  const confirmSuspend = (brand: Brand) => {
    const isSuspended = brand.status === "suspended";
    const count = brand.productCount ?? 0;
    setConfirm({
      title: isSuspended ? `Activate "${brand.name}"?` : `Suspend "${brand.name}"?`,
      message: isSuspended
        ? `Its ${count} product${count !== 1 ? "s" : ""} will become visible everywhere again.`
        : `Its ${count} product${count !== 1 ? "s" : ""} will be hidden from all stores, catalogs, and owner dashboards.`,
      confirmLabel: isSuspended ? "Activate" : "Suspend",
      variant: isSuspended ? "success" : "warning",
      onConfirm: () => doSuspend(brand),
    });
  };

  const doSuspend = async (brand: Brand) => {
    const action = brand.status === "suspended" ? "activate" : "suspend";
    try {
      const res = await fetch(`/api/admin/global-catalog/brands/${brand._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to update brand"); return; }
      setBrands((prev) => prev.map((b) => (b._id === brand._id ? { ...b, status: data.brand.status } : b)));
      setBrandProducts((prev) => { const next = { ...prev }; delete next[brand._id]; return next; });
    } catch {
      setError("Failed to update brand");
    }
  };

  const confirmDelete = (brand: Brand) => {
    const count = brand.productCount ?? 0;
    setConfirm({
      title: `Delete "${brand.name}"?`,
      message: count > 0
        ? `This will permanently delete all ${count} product${count !== 1 ? "s" : ""} from the global catalog, every store listing, and all owner dashboards. This cannot be undone.`
        : `The brand will be permanently removed. This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
      onConfirm: () => doDelete(brand),
    });
  };

  const doDelete = async (brand: Brand) => {
    try {
      const res = await fetch(`/api/admin/global-catalog/brands/${brand._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to delete brand"); return; }
      setBrands((prev) => prev.filter((b) => b._id !== brand._id));
      if (expandedId === brand._id) setExpandedId(null);
    } catch {
      setError("Failed to delete brand");
    }
  };

  const variantStyles = {
    danger:  { btn: "bg-red-600 hover:bg-red-700 text-white", icon: "text-red-500" },
    warning: { btn: "bg-orange-500 hover:bg-orange-600 text-white", icon: "text-orange-400" },
    success: { btn: "bg-[#6FAFB3] hover:bg-[#5da0a5] text-white", icon: "text-[#6FAFB3]" },
  };

  return (
    <>
      {/* ── Confirm dialog ── */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setConfirm(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-1 flex items-start justify-between gap-3">
              <h3 className="text-base font-bold text-slate-900">{confirm.title}</h3>
              <button type="button" onClick={() => setConfirm(null)} className="mt-0.5 shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X size={17} />
              </button>
            </div>
            <p className="mb-5 text-sm text-slate-500">{confirm.message}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { confirm.onConfirm(); setConfirm(null); }}
                className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${variantStyles[confirm.variant].btn}`}
              >
                {confirm.confirmLabel}
              </button>
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit name modal ── */}
      {editingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={closeEditModal}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Edit Brand Name</h3>
              <button type="button" onClick={closeEditModal} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            {editError && <div className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{editError}</div>}
            <form onSubmit={saveEdit} className="space-y-4">
              <input
                ref={editInputRef}
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Brand name"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6FAFB3]"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={editSaving || !editName.trim()}
                  className="flex-1 rounded-2xl bg-[#6FAFB3] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5da0a5] disabled:opacity-50"
                >
                  {editSaving ? "Saving…" : "Save"}
                </button>
                <button type="button" onClick={closeEditModal} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Main card ── */}
      <div className="rounded-xl bg-white px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] md:rounded-[26px] sm:px-4 sm:py-4 md:px-5 md:py-5">
        <form onSubmit={addBrand} className="mb-6">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Add Brand</h2>
          {error && <div className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Brand name</span>
              <input
                type="text"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Brand name"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6FAFB3]"
              />
            </label>
            <button type="submit" className="w-full rounded-2xl bg-[#6FAFB3] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5da0a5]">
              Add Brand
            </button>
          </div>
        </form>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">All Brands</h2>
            <Search size={20} className="text-slate-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search brands..."
            className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6FAFB3]"
          />

          <div className="space-y-2">
            {loading && <div className="py-8 text-center text-slate-500">Loading brands...</div>}
            {!loading && brands.length === 0 && <div className="py-8 text-center text-slate-500">No brands found</div>}

            {brands.map((brand) => {
              const isSuspended = brand.status === "suspended";
              const isExpanded = expandedId === brand._id;
              const products = brandProducts[brand._id];

              return (
                <div key={brand._id} className={`rounded-xl border transition ${isSuspended ? "border-orange-200 bg-orange-50/40" : "border-slate-200 bg-white"}`}>
                  <div className="flex items-center gap-2 px-4 py-3">
                    <button type="button" onClick={() => toggleExpand(brand)} className="flex-1 flex items-center gap-3 text-left">
                      <span className="text-slate-400">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${isSuspended ? "text-slate-400 line-through" : "text-slate-800"}`}>
                            {brand.name}
                          </span>
                          {isSuspended && (
                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">Suspended</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {brand.productCount ?? 0} product{(brand.productCount ?? 0) !== 1 ? "s" : ""} · {brand.source || "local"}
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => openEditModal(brand)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" aria-label="Edit brand">
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmSuspend(brand)}
                        className={`rounded-lg p-1.5 transition ${isSuspended ? "text-orange-400 hover:bg-orange-100 hover:text-orange-600" : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"}`}
                        aria-label={isSuspended ? "Activate brand" : "Suspend brand"}
                        title={isSuspended ? "Activate" : "Suspend"}
                      >
                        <Power size={15} />
                      </button>
                      <button type="button" onClick={() => confirmDelete(brand)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600" aria-label="Delete brand">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 px-4 pb-3 pt-2">
                      {productsLoading === brand._id && (
                        <p className="py-4 text-center text-xs text-slate-400">Loading products…</p>
                      )}
                      {productsLoading !== brand._id && products && products.length === 0 && (
                        <p className="flex items-center gap-2 py-3 text-xs text-slate-400"><Package size={14} />No products in this brand</p>
                      )}
                      {productsLoading !== brand._id && products && products.length > 0 && (
                        <div className="space-y-1">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Products ({products.length})</p>
                          {products.map((p) => (
                            <div key={p._id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50">
                              {p.mainImage ? (
                                <img src={p.mainImage} alt={p.name} className="h-9 w-9 rounded-md object-cover" />
                              ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100">
                                  <Package size={14} className="text-slate-400" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium text-slate-700">{p.name}</p>
                                <p className="text-xs text-slate-400">{p.sku ? `SKU: ${p.sku} · ` : ""}PKR {p.price?.toLocaleString()}</p>
                              </div>
                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                                {p.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
