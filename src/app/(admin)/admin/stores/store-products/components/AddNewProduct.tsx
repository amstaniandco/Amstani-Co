"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useToast } from "../../../../../../components/global/ToastProvider";

type CatalogProduct = {
  _id: string;
  name: string;
  sku: string;
  price: number;
  mainImage?: string | null;
  totalStock?: number;
};

type Props = {
  storeId: string;
  storeName: string;
  onAdded: () => void;
};

const PAGE_SIZE = 10;

export default function AddNewProduct({ storeId, onAdded }: Props) {
  const toast = useToast();

  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  // Debounce search so we don't hit the API on every keypress
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch page from server
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), page: String(page) });
    if (debouncedSearch) params.set("q", debouncedSearch);

    fetch(`/api/admin/global-catalog/products?${params}`)
      .then((r) => r.json())
      .then((data) => { setCatalog(data.products ?? []); setTotal(data.total ?? 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, debouncedSearch]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const toggle = (productId: string) => {
    setSelected((prev) => {
      if (prev[productId] !== undefined) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: 1 };
    });
  };

  const setQty = (productId: string, qty: number) => {
    setSelected((prev) => ({ ...prev, [productId]: Math.max(1, qty) }));
  };

  const handleSubmit = async () => {
    const items = Object.entries(selected).map(([productId, quantity]) => ({ productId, quantity }));
    if (items.length === 0) { toast.error("Select at least one product."); return; }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/stores/${storeId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to add products"); return; }
      toast.success("Products added to store successfully.");
      setSelected({});
      onAdded();
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = Object.keys(selected).length;

  return (
    <div className="p-4">
      {/* Search + submit bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search global catalog…"
          className="w-full rounded-xl border border-[#dbe5ea] bg-[#f8fafc] px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-cyan-400 sm:max-w-xs"
        />
        <div className="flex items-center gap-3">
          {selectedCount > 0 && (
            <span className="text-sm text-slate-600">{selectedCount} selected</span>
          )}
          <button
            type="button"
            disabled={selectedCount === 0 || saving}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d6560] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {saving ? "Adding…" : "Add to Store"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-400">Loading catalog…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-[#f8fafc] text-[11px] uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="w-12 px-4 py-4"><span className="sr-only">Select</span></th>
                <th className="px-4 py-4">Image</th>
                <th className="px-4 py-4">Name</th>
                <th className="px-4 py-4">SKU</th>
                <th className="px-4 py-4">Price</th>
                <th className="px-4 py-4">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f5] bg-white text-slate-700">
              {catalog.map((product, index) => {
                const isChecked = selected[product._id] !== undefined;
                return (
                  <tr key={product._id} className={`cursor-pointer ${index % 2 === 0 ? "bg-[#fbfcfd]" : "bg-white"} ${isChecked ? "ring-1 ring-inset ring-cyan-300" : ""}`}>
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(product._id)}
                        className="h-4 w-4 rounded border-[#cbd5e1] text-cyan-600 focus:ring-cyan-500"
                      />
                    </td>
                    <td className="px-4 py-4" onClick={() => toggle(product._id)}>
                      {product.mainImage ? (
                        <img src={product.mainImage} alt={product.name} className="h-12 w-12 rounded-2xl object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                      )}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900" onClick={() => toggle(product._id)}>
                      {product.name}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-slate-500" onClick={() => toggle(product._id)}>
                      {product.sku || "—"}
                    </td>
                    <td className="px-4 py-4 text-slate-700" onClick={() => toggle(product._id)}>
                      ${Number(product.price).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={isChecked ? selected[product._id] : 1}
                          disabled={!isChecked}
                          onChange={(e) => setQty(product._id, Number(e.target.value))}
                          onClick={(e) => e.stopPropagation()}
                          className="h-10 w-20 rounded-xl border border-[#d9e2e8] bg-[#f8fafc] px-3 text-sm text-slate-900 outline-none focus:border-cyan-400 disabled:opacity-40"
                        />
                        {product.totalStock != null && (
                          <span className="text-xs text-slate-400">/{product.totalStock}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {catalog.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-slate-400">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#eef2f5] px-4 py-3 text-sm text-slate-600">
              <span className="text-xs">{total} products · page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-[#dbe5ea] px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-40">
                  Previous
                </button>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-[#dbe5ea] px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-40">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
