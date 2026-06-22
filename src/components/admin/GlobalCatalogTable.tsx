"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Edit3, Eye, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export type CatalogProductRow = {
  _id: string;
  sku?: string;
  name: string;
  category?: string;
  price?: number;
  status?: "active" | "draft" | "archived";
  totalStock?: number;
  stock?: number;
  isPublished?: boolean;
  imageUrls?: string[];
  allowCustomOrders?: boolean;
};

type GlobalCatalogTableProps = {
  refreshKey?: number;
  onEdit: (productId: string) => void;
};

const PAGE_SIZE = 10;

export default function GlobalCatalogTable({ refreshKey = 0, onEdit }: GlobalCatalogTableProps) {
  const router = useRouter();
  const [products, setProducts] = useState<CatalogProductRow[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    setPage(1); // reset to page 1 when search changes
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    const timeout = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ limit: String(PAGE_SIZE), page: String(page) });
        if (search.trim()) params.set("q", search.trim());

        const res = await fetch(`/api/admin/global-catalog/products?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load products");
          return;
        }

        setProducts((data.products || []) as CatalogProductRow[]);
        setTotal(data.total ?? 0);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [search, page, refreshKey]);

  const deleteProduct = async (productId: string) => {
    const confirmed = window.confirm("Delete this product from the global catalog?");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/global-catalog/products/${productId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to delete product"); return; }
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      setTotal((t) => t - 1);
    } catch {
      setError("Failed to delete product");
    }
  };

  const toggleCustomOrder = async (productId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/admin/global-catalog/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowCustomOrders: !current }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to update"); return; }
      setProducts((prev) => prev.map((p) => p._id === productId ? { ...p, allowCustomOrders: !current } : p));
    } catch {
      setError("Failed to update custom order setting");
    }
  };

  return (
    <div className="rounded-xl bg-white shadow-sm md:rounded-[26px]">
      {/* Search bar */}
      <div className="flex flex-col gap-3 border-b border-[#e7edf1] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-4 md:px-5 md:py-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU or name..."
            className="w-full rounded-lg border border-[#e7edf1] bg-white py-2 pl-9 pr-3 text-xs text-slate-700 placeholder-slate-500 transition focus:border-[#58b8c3] focus:outline-none sm:text-sm"
          />
        </div>
        <span className="text-xs text-slate-500 flex-shrink-0">
          {total} product{total !== 1 ? "s" : ""}
        </span>
      </div>

      {error && <div className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">{error}</div>}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[#e7edf1] bg-[#f8fafb]">
              <th className="px-3 py-3 text-left font-semibold text-slate-600 sm:px-4 md:px-5">SKU</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-600 sm:px-4 md:px-5">PRODUCT NAME</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-600 sm:px-4 md:px-5">CATEGORY</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-600 sm:px-4 md:px-5">BASE PRICE</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-600 sm:px-4 md:px-5">STATUS</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-600 sm:px-4 md:px-5">STOCK</th>
              <th className="px-3 py-3 text-center font-semibold text-slate-600 sm:px-4 md:px-5">CUSTOM ORDER</th>
              <th className="px-3 py-3 text-center font-semibold text-slate-600 sm:px-4 md:px-5">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-5 py-8 text-center text-slate-400" colSpan={8}>Loading…</td>
              </tr>
            )}
            {!loading && products.length === 0 && (
              <tr>
                <td className="px-5 py-8 text-center text-slate-400" colSpan={8}>No products found.</td>
              </tr>
            )}
            {!loading && products.map((product) => {
              const isActive = product.status === "active" || product.isPublished;
              const stock = product.totalStock ?? product.stock ?? 0;
              return (
                <tr key={product._id} className="border-b border-[#e7edf1] transition hover:bg-[#f8fafb]">
                  <td className="px-3 py-3 font-medium text-slate-800 sm:px-4 md:px-5">{product.sku || "—"}</td>
                  <td className="px-3 py-3 text-slate-800 sm:px-4 md:px-5">
                    <div className="flex items-center gap-3">
                      {product.imageUrls?.[0] && (
                        <img src={product.imageUrls[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      )}
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-700 sm:px-4 md:px-5">{product.category || "—"}</td>
                  <td className="px-3 py-3 font-semibold text-slate-800 sm:px-4 md:px-5">
                    ${(product.price ?? 0).toFixed(2)}
                  </td>
                  <td className="px-3 py-3 sm:px-4 md:px-5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      <span className={`h-2 w-2 rounded-full ${isActive ? "bg-green-600" : "bg-red-600"}`} />
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-700 sm:px-4 md:px-5">{stock}</td>
                  <td className="px-3 py-3 text-center sm:px-4 md:px-5">
                    <button
                      type="button"
                      onClick={() => toggleCustomOrder(product._id, product.allowCustomOrders ?? false)}
                      title={product.allowCustomOrders ? "Disable custom orders" : "Enable custom orders"}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                        product.allowCustomOrders
                          ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      ✎ {product.allowCustomOrders ? "ON" : "OFF"}
                    </button>
                  </td>
                  <td className="px-3 py-3 sm:px-4 md:px-5">
                    <div className="flex justify-center gap-2">
                      <button type="button" onClick={() => router.push(`/admin/global-catalog/products/${product._id}`)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-[#f0f4f8]" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => onEdit(product._id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-[#f0f4f8]" title="Edit">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => deleteProduct(product._id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-[#e7edf1] px-5 py-3">
        <span className="text-xs text-slate-500">
          Page {page} of {totalPages} · {total} total
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {/* Page number pills */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
            const p = startPage + i;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition ${
                  p === page
                    ? "bg-[#6FAFB3] text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
