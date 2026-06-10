"use client";

import { useState } from "react";
import { Search, Trash2, X } from "lucide-react";

export type StoreProductItem = {
  _id?: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  mainImage?: string | null;
  quantity: number;
  listedAt?: string;
  brand?: string | null;
  category?: string | null;
  description?: string | null;
  sellingPrice?: number;
  discountPercent?: number;
  isOnSale?: boolean;
  isNewArrival?: boolean;
  originalPrice?: number;
};

type Props = {
  products: StoreProductItem[];
  loading?: boolean;
  onRemove: (productId: string) => void;
};

const PAGE_SIZE = 10;

function DetailsModal({ product, onClose }: { product: StoreProductItem; onClose: () => void }) {
  const originalPrice = product.originalPrice ?? product.price ?? 0;
  const sellingPrice = product.sellingPrice ?? originalPrice;
  const discount = product.discountPercent ?? 0;
  const effective = sellingPrice * (1 - discount / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-lg">Product Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto px-5 py-4 flex flex-col gap-4">
          <div className="flex gap-4">
            {product.mainImage ? (
              <img src={product.mainImage} alt={product.name} className="h-24 w-24 rounded-xl object-cover flex-shrink-0 border border-slate-100" />
            ) : (
              <div className="h-24 w-24 rounded-xl bg-slate-100 flex-shrink-0" />
            )}
            <div className="min-w-0">
              <h4 className="font-bold text-slate-900 text-base leading-tight">{product.name}</h4>
              {product.brand && <p className="mt-1 text-xs text-slate-500">Brand: <span className="font-semibold text-slate-700">{product.brand}</span></p>}
              {product.category && <p className="text-xs text-slate-500">Category: <span className="font-semibold text-slate-700">{product.category}</span></p>}
              <p className="text-xs text-slate-500 font-mono mt-1">SKU: {product.sku || "—"}</p>
              <p className="text-xs text-slate-500 mt-0.5">Product ID: <span className="font-mono">{product.productId}</span></p>
            </div>
          </div>

          {product.description && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Description</p>
              <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Original Price</p>
              <p className="text-sm font-bold text-slate-700 mt-0.5">${originalPrice.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Selling Price</p>
              <p className="text-sm font-bold text-slate-700 mt-0.5">${sellingPrice.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Customer Pays</p>
              <p className="text-base font-extrabold text-teal-600 mt-0.5">${effective.toFixed(2)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Stock</p>
              <p className="text-sm font-bold text-slate-700 mt-0.5">{product.quantity} units</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.isOnSale && discount > 0 && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{discount}% Sale</span>
            )}
            {product.isNewArrival && (
              <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">✦ New Arrival</span>
            )}
            {product.listedAt && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                Listed {new Date(product.listedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListedProducts({ products, loading, onRemove }: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterSale, setFilterSale] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [detailProduct, setDetailProduct] = useState<StoreProductItem | null>(null);

  if (loading) {
    return <div className="py-16 text-center text-sm text-slate-400">Loading products…</div>;
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-slate-400">
        No products listed for this store yet. Use <span className="font-semibold">Add New</span> to list products.
      </div>
    );
  }

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];
  const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))) as string[];

  const filtered = products.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.sku || "").toLowerCase().includes(q)) return false;
    }
    if (filterCategory !== "all" && p.category !== filterCategory) return false;
    if (filterBrand !== "all" && p.brand !== filterBrand) return false;
    if (filterSale === "on" && !p.isOnSale) return false;
    if (filterSale === "off" && p.isOnSale) return false;
    if (filterStock === "instock" && (p.quantity ?? 0) <= 0) return false;
    if (filterStock === "outofstock" && (p.quantity ?? 0) > 0) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = search || filterCategory !== "all" || filterBrand !== "all" || filterSale !== "all" || filterStock !== "all";

  return (
    <div>
      {/* Filters */}
      <div className="border-b border-[#eef2f5] px-4 py-3 flex flex-wrap gap-2 items-center bg-[#f8fafc]">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name or SKU…"
            className="h-8 w-full rounded-lg border border-[#dbe5ea] bg-white pl-8 pr-3 text-sm focus:outline-none focus:border-cyan-400"
          />
        </div>
        {categories.length > 0 && (
          <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            className="h-8 rounded-lg border border-[#dbe5ea] bg-white px-2 text-sm text-slate-700 focus:outline-none">
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        {brands.length > 0 && (
          <select value={filterBrand} onChange={(e) => { setFilterBrand(e.target.value); setPage(1); }}
            className="h-8 rounded-lg border border-[#dbe5ea] bg-white px-2 text-sm text-slate-700 focus:outline-none">
            <option value="all">All Brands</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        )}
        <select value={filterSale} onChange={(e) => { setFilterSale(e.target.value); setPage(1); }}
          className="h-8 rounded-lg border border-[#dbe5ea] bg-white px-2 text-sm text-slate-700 focus:outline-none">
          <option value="all">All Sale</option>
          <option value="on">On Sale</option>
          <option value="off">Not On Sale</option>
        </select>
        <select value={filterStock} onChange={(e) => { setFilterStock(e.target.value); setPage(1); }}
          className="h-8 rounded-lg border border-[#dbe5ea] bg-white px-2 text-sm text-slate-700 focus:outline-none">
          <option value="all">All Stock</option>
          <option value="instock">In Stock</option>
          <option value="outofstock">Out of Stock</option>
        </select>
        {hasFilters && (
          <button onClick={() => { setSearch(""); setFilterCategory("all"); setFilterBrand("all"); setFilterSale("all"); setFilterStock("all"); setPage(1); }}
            className="h-8 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50">
            Clear
          </button>
        )}
      </div>

      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-[#f8fafc] text-[11px] uppercase tracking-[0.14em] text-slate-500">
          <tr>
            <th className="px-4 py-4">Image</th>
            <th className="px-4 py-4">Name</th>
            <th className="px-4 py-4">SKU</th>
            <th className="px-4 py-4">Price</th>
            <th className="px-4 py-4">Quantity</th>
            <th className="px-4 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eef2f5] bg-white text-slate-700">
          {paginated.length === 0 ? (
            <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-400">No products match your filters.</td></tr>
          ) : paginated.map((product, index) => (
            <tr key={product.productId} className={index % 2 === 0 ? "bg-[#fbfcfd]" : "bg-white"}>
              <td className="px-4 py-4">
                {product.mainImage ? (
                  <img src={product.mainImage} alt={product.name} className="h-12 w-12 rounded-2xl object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                )}
              </td>
              <td className="px-4 py-4">
                <p className="font-semibold text-slate-900">{product.name}</p>
                {(product.brand || product.category) && (
                  <p className="text-[11px] text-slate-400 mt-0.5">{[product.brand, product.category].filter(Boolean).join(" · ")}</p>
                )}
              </td>
              <td className="px-4 py-4 font-mono text-xs text-slate-500">{product.sku || "—"}</td>
              <td className="px-4 py-4 text-slate-700">${Number(product.price).toLocaleString()}</td>
              <td className="px-4 py-4 text-slate-700">{product.quantity}</td>
              <td className="px-4 py-4 text-right">
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailProduct(product)}
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#d8e3e8] bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(product.productId)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#f1d3d8] bg-[#fff3f5] text-[#b91c1c] transition hover:bg-[#fee2e2]"
                    aria-label="Remove product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#eef2f5] px-4 py-3 text-sm text-slate-600">
          <span className="text-xs">{filtered.length} products · page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-[#dbe5ea] px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-40">Previous</button>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-[#dbe5ea] px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {detailProduct && <DetailsModal product={detailProduct} onClose={() => setDetailProduct(null)} />}
    </div>
  );
}
