"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Eye, Plus, Search, Store, Tag, X } from "lucide-react";

type ProductRow = {
  productId: string;
  name: string;
  sku: string;
  originalPrice: number;
  sellingPrice?: number;
  discountPercent?: number;
  isOnSale?: boolean;
  isNewArrival?: boolean;
  isCustomOrderEnabled?: boolean;
  price: number;
  quantity: number;
  mainImage?: string | null;
  brand?: string | null;
  category?: string | null;
  description?: string | null;
  listedAt?: string | null;
};

type CatalogDetail = {
  _id: string;
  name: string;
  sku?: string;
  category?: string;
  price?: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  totalStock?: number;
  stock?: number;
  stockStatus?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  description?: string;
  fullDescription?: string;
  imageUrls?: string[];
  brand?: { name?: string };
  variants?: Array<{ id?: string; size?: string; color?: string; stock?: number; stockQuantity?: number; skuVariant?: string; priceOverride?: number | null }>;
  sizeChart?: Array<{ id?: string; size?: string; measurements?: Record<string, string>; unit?: string }>;
  shipping?: { weight?: number | null; shippingClass?: string | null; dimensionL?: number | null; dimensionW?: number | null; dimensionH?: number | null } | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

type StoreProductDetail = {
  sellingPrice: number | null;
  originalPrice: number | null;
  discountPercent: number;
  isOnSale: boolean;
  isNewArrival: boolean;
  listedAt: string | null;
  quantity: number;
};

function ProductDetailModal({
  productId,
  onClose,
}: {
  productId: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [storeProduct, setStoreProduct] = useState<StoreProductDetail | null>(null);
  const [catalog, setCatalog] = useState<CatalogDetail | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetch(`/api/owner/products/${productId}/detail`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to load");
        setStoreProduct(data.storeProduct);
        setCatalog(data.catalog);
        setActiveImage(0);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [productId]);

  const sellingPrice = storeProduct?.sellingPrice ?? storeProduct?.originalPrice ?? 0;
  const originalPrice = storeProduct?.originalPrice ?? 0;
  const discount = storeProduct?.discountPercent ?? 0;
  const effectivePrice = sellingPrice * (1 - discount / 100);
  const images = catalog?.imageUrls ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl" style={{ maxHeight: "92vh" }}>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-lg font-bold text-slate-900">Product Detail</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-5 space-y-6">
          {loading && <p className="py-12 text-center text-sm text-slate-400">Loading…</p>}
          {error && <p className="py-12 text-center text-sm text-red-500">{error}</p>}

          {!loading && !error && catalog && (
            <>
              {/* Images + core info */}
              <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
                <div>
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {images[activeImage] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={images[activeImage]} alt={catalog.name} className="aspect-square w-full object-cover" />
                    ) : (
                      <div className="flex aspect-square items-center justify-center text-xs text-slate-400">No image</div>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="mt-2 grid grid-cols-5 gap-1">
                      {images.slice(0, 10).map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={url}
                          src={url}
                          alt=""
                          onClick={() => setActiveImage(i)}
                          className={`aspect-square cursor-pointer rounded-md border object-cover ${i === activeImage ? "border-[#65bbc5]" : "border-slate-200"}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xl font-bold leading-tight text-slate-900">{catalog.name}</h4>
                      <p className="mt-0.5 text-xs text-slate-500">{catalog.sku || "—"} · {catalog.brand?.name || "No brand"}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${catalog.isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {catalog.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Original Price</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-700">${originalPrice.toFixed(2)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Your Selling Price</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-700">${sellingPrice.toFixed(2)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Customer Pays</p>
                      <p className="mt-0.5 text-base font-extrabold text-teal-600">${effectivePrice.toFixed(2)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Compare At</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-700">{catalog.compareAtPrice != null ? `$${catalog.compareAtPrice.toFixed(2)}` : "—"}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Stock</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-700">{storeProduct?.quantity ?? 0} units</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Category</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-700">{catalog.category || "—"}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {storeProduct?.isOnSale && discount > 0 && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{discount}% Sale</span>
                    )}
                    {storeProduct?.isNewArrival && (
                      <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">✦ New Arrival</span>
                    )}
                    {catalog.isFeatured && (
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">★ Featured</span>
                    )}
                    {storeProduct?.listedAt && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                        Listed {new Date(storeProduct.listedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {(catalog.fullDescription || catalog.description) && (
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Description</p>
                  <p className="whitespace-pre-line text-sm leading-6 text-slate-700">{catalog.fullDescription || catalog.description}</p>
                </div>
              )}

              {/* Catalog & Shipping info blocks */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">Catalog Info</p>
                  <p>Stock Status: {catalog.stockStatus || "—"}</p>
                  <p>Total Stock: {catalog.totalStock ?? catalog.stock ?? 0}</p>
                  <p>Featured: {catalog.isFeatured ? "Yes" : "No"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">Shipping</p>
                  <p>Weight: {catalog.shipping?.weight ?? "—"}</p>
                  <p>Class: {catalog.shipping?.shippingClass || "—"}</p>
                  <p>Dimensions: {[catalog.shipping?.dimensionL, catalog.shipping?.dimensionW, catalog.shipping?.dimensionH].map((v) => v ?? "—").join(" × ")}</p>
                </div>
              </div>

              {/* Variants */}
              {(catalog.variants?.length ?? 0) > 0 && (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <p className="border-b border-slate-200 px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-500">Variants</p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          {["Size", "Color", "Stock", "SKU Variant", "Price Override"].map((h) => (
                            <th key={h} className="px-4 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {catalog.variants!.map((v, i) => (
                          <tr key={v.id ?? i}>
                            <td className="px-4 py-3 text-slate-700">{v.size || "—"}</td>
                            <td className="px-4 py-3 text-slate-700">{v.color || "—"}</td>
                            <td className="px-4 py-3 text-slate-700">{v.stock ?? v.stockQuantity ?? 0}</td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{v.skuVariant || "—"}</td>
                            <td className="px-4 py-3 text-slate-700">{v.priceOverride != null ? `$${v.priceOverride.toFixed(2)}` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Size chart */}
              {(catalog.sizeChart?.length ?? 0) > 0 && (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <p className="border-b border-slate-200 px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-500">Size Chart</p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          {["Size", "Measurements", "Unit"].map((h) => (
                            <th key={h} className="px-4 py-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {catalog.sizeChart!.map((row, i) => (
                          <tr key={row.id ?? i}>
                            <td className="px-4 py-3 text-slate-700">{row.size || "—"}</td>
                            <td className="px-4 py-3 text-slate-700">
                              {Object.entries(row.measurements ?? {}).map(([k, v]) => `${k}: ${v}`).join(", ") || "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-700">{row.unit || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SEO */}
              {(catalog.seoTitle || catalog.seoDescription) && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">SEO</p>
                  <p>Title: {catalog.seoTitle || "—"}</p>
                  <p>Description: {catalog.seoDescription || "—"}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductThumb({ src, alt }: { src?: string | null; alt: string }) {
  if (src) return <img src={src} alt={alt} className="h-9 w-9 rounded-md object-cover" />;
  return <div className="h-9 w-9 rounded-md bg-slate-200" />;
}

function PriceEditor({
  product,
  markupPercent,
  discountCap,
  onUpdated,
}: {
  product: ProductRow;
  markupPercent: number;
  discountCap: number;
  onUpdated: (productId: string, changes: Partial<ProductRow>) => void;
}) {
  const originalPrice = useRef<number>(
    product.originalPrice != null && product.originalPrice > 0
      ? product.originalPrice
      : product.price ?? 0
  ).current;

  const maxSellingPrice = originalPrice * (1 + markupPercent / 100);
  const currentSelling = product.sellingPrice ?? originalPrice;
  const currentDiscount = product.discountPercent ?? 0;
  const isOnSale = product.isOnSale ?? false;

  const [editingPrice, setEditingPrice] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [priceInput, setPriceInput] = useState(currentSelling.toFixed(2));
  const [discountInput, setDiscountInput] = useState(String(currentDiscount));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editingPrice) setPriceInput((product.sellingPrice ?? originalPrice).toFixed(2));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.sellingPrice]);

  async function patch(body: Record<string, unknown>) {
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/owner/products/${product.productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to update."); return false; }
      return true;
    } finally { setSaving(false); }
  }

  async function savePrice() {
    const sp = parseFloat(priceInput);
    if (isNaN(sp) || sp < 0) { setError("Enter a valid price."); return; }
    const ok = await patch({ sellingPrice: sp });
    if (ok) { onUpdated(product.productId, { sellingPrice: sp }); setEditingPrice(false); }
  }

  async function saveDiscount() {
    const dp = parseFloat(discountInput);
    if (isNaN(dp) || dp < 0) { setError("Enter a valid discount."); return; }
    const ok = await patch({ discountPercent: dp, isOnSale: dp > 0 });
    if (ok) { onUpdated(product.productId, { discountPercent: dp, isOnSale: dp > 0 }); setEditingDiscount(false); }
  }

  async function toggleSale() {
    const newVal = !isOnSale;
    const ok = await patch({ isOnSale: newVal, discountPercent: newVal ? currentDiscount : 0 });
    if (ok) onUpdated(product.productId, { isOnSale: newVal, discountPercent: newVal ? currentDiscount : 0 });
  }

  const isNewArrival = product.isNewArrival ?? false;
  async function toggleNewArrival() {
    const newVal = !isNewArrival;
    const ok = await patch({ isNewArrival: newVal });
    if (ok) onUpdated(product.productId, { isNewArrival: newVal });
  }

  const isCustomOrderEnabled = product.isCustomOrderEnabled ?? false;
  async function toggleCustomOrder() {
    const newVal = !isCustomOrderEnabled;
    const ok = await patch({ isCustomOrderEnabled: newVal });
    if (ok) onUpdated(product.productId, { isCustomOrderEnabled: newVal });
  }

  const effectivePrice = currentSelling * (1 - currentDiscount / 100);

  return (
    <div className="mx-4 mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:mx-7">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Original Price (Catalog)</p>
          <p className="text-sm font-bold text-slate-600">${originalPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">
            Your Selling Price <span className="ml-1 font-normal">(max ${maxSellingPrice.toFixed(2)})</span>
          </p>
          {editingPrice ? (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-500">$</span>
                <input type="number" min="0" max={maxSellingPrice} step="0.01" value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 pl-5 pr-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-400" autoFocus />
              </div>
              <button onClick={savePrice} disabled={saving} className="px-2.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold disabled:opacity-60">{saving ? "…" : "Save"}</button>
              <button onClick={() => { setEditingPrice(false); setError(""); }} className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-100">✕</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-800">${currentSelling.toFixed(2)}</p>
              <button onClick={() => { setPriceInput(currentSelling.toFixed(2)); setEditingPrice(true); setError(""); }} className="text-[11px] font-semibold text-teal-600 hover:underline">Edit</button>
            </div>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Sale Discount <span className="ml-1 font-normal">(max {discountCap}%)</span></p>
          <div className="flex items-center gap-2">
            <button onClick={toggleSale} disabled={saving} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-60 ${isOnSale ? "bg-amber-500 hover:bg-amber-600 text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-100"}`}>
              <Tag className="h-3 w-3" />{isOnSale ? "Sale ON" : "Sale OFF"}
            </button>
            {isOnSale && (editingDiscount ? (
              <div className="flex items-center gap-1.5">
                <div className="relative w-16">
                  <input type="number" min="0" max={discountCap} step="1" value={discountInput} onChange={(e) => setDiscountInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400" autoFocus />
                </div>
                <span className="text-xs text-slate-500">%</span>
                <button onClick={saveDiscount} disabled={saving} className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold disabled:opacity-60">{saving ? "…" : "OK"}</button>
                <button onClick={() => { setEditingDiscount(false); setError(""); }} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-amber-600">{currentDiscount}% off</span>
                <button onClick={() => { setDiscountInput(String(currentDiscount)); setEditingDiscount(true); setError(""); }} className="text-[11px] font-semibold text-amber-600 hover:underline">Edit</button>
              </div>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Customer Pays</p>
          <p className="text-base font-extrabold text-teal-600">${effectivePrice.toFixed(2)}</p>
          {isOnSale && currentDiscount > 0 && <p className="text-[11px] text-slate-400 line-through">${currentSelling.toFixed(2)}</p>}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
        <span className="text-xs font-semibold text-slate-500">Product Tags:</span>
        <button onClick={toggleNewArrival} disabled={saving}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-60 ${isNewArrival ? "bg-[#68B8C1] border-[#68B8C1] text-white" : "border-slate-300 text-slate-500 hover:border-[#68B8C1] hover:text-[#68B8C1]"}`}>
          ✦ {isNewArrival ? "New Arrival (ON)" : "Mark as New Arrival"}
        </button>
        <button onClick={toggleCustomOrder} disabled={saving}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-60 ${isCustomOrderEnabled ? "bg-purple-600 border-purple-600 text-white" : "border-slate-300 text-slate-500 hover:border-purple-500 hover:text-purple-600"}`}>
          ✎ {isCustomOrderEnabled ? "Custom Orders (ON)" : "Enable Custom Orders"}
        </button>
        <span className="text-[11px] text-slate-400">
          {isCustomOrderEnabled ? "Customers can request a custom order for this product." : "Custom orders off."}
        </span>
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function DetailsModal({ product, onClose }: { product: ProductRow; onClose: () => void }) {
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
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Your Selling Price</p>
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
            {!product.isOnSale && !product.isNewArrival && (
              <span className="text-xs text-slate-400 italic">No active tags</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [storeName, setStoreName] = useState("");
  const [markupPercent, setMarkupPercent] = useState(20);
  const [discountCap, setDiscountCap] = useState(20);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<ProductRow | null>(null);
  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  const [requestsBadge, setRequestsBadge] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterSale, setFilterSale] = useState("all");
  const [filterNewArrival, setFilterNewArrival] = useState("all");
  const [filterStock, setFilterStock] = useState("all");

  useEffect(() => {
    const since = localStorage.getItem("sb_seen_owner_listing_requests") ?? "";
    const params = since ? `?since_requests=${encodeURIComponent(since)}` : "";
    fetch(`/api/owner/sidebar-counts${params}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setRequestsBadge(data.listing_requests ?? 0); })
      .catch(() => {});
    const handler = (e: Event) => {
      if ((e as CustomEvent<string>).detail === "owner_listing_requests") setRequestsBadge(0);
    };
    window.addEventListener("sb-seen", handler);
    return () => window.removeEventListener("sb-seen", handler);
  }, []);

  useEffect(() => {
    fetch("/api/owner/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setStoreName(data.storeName ?? "");
        setMarkupPercent(data.markupPercent ?? 20);
        setDiscountCap(data.discountCap ?? 20);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleUpdated(productId: string, changes: Partial<ProductRow>) {
    setProducts((prev) => prev.map((p) => (p.productId === productId ? { ...p, ...changes } : p)));
  }

  // Derived filter options
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];
  const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))) as string[];

  const filteredProducts = products.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.sku || "").toLowerCase().includes(q)) return false;
    }
    if (filterCategory !== "all" && p.category !== filterCategory) return false;
    if (filterBrand !== "all" && p.brand !== filterBrand) return false;
    if (filterSale === "on" && !p.isOnSale) return false;
    if (filterSale === "off" && p.isOnSale) return false;
    if (filterNewArrival === "yes" && !p.isNewArrival) return false;
    if (filterNewArrival === "no" && p.isNewArrival) return false;
    if (filterStock === "instock" && (p.quantity ?? 0) <= 0) return false;
    if (filterStock === "outofstock" && (p.quantity ?? 0) > 0) return false;
    return true;
  });

  const hasFilters = search || filterCategory !== "all" || filterBrand !== "all" || filterSale !== "all" || filterNewArrival !== "all" || filterStock !== "all";

  if (loading) {
    return (
      <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
        <div className="px-7 py-16 text-center text-sm text-slate-400">Loading products…</div>
      </div>
    );
  }

  return (
    <>
      <section className="flex items-center gap-2 text-slate-900">
        <Store className="h-5 w-5 text-[#65bbc5]" />
        <h1 className="text-xl font-semibold sm:text-2xl">{storeName || "My Store"}</h1>
      </section>

      <section className="mt-4 rounded-2xl bg-white border border-slate-200 px-5 py-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700">Platform Pricing Rules</p>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
          <span>Max markup: <strong className="text-teal-600">+{markupPercent}%</strong> above original price</span>
          <span>Max discount: <strong className="text-amber-600">{discountCap}%</strong> off selling price</span>
        </div>
      </section>

      <section data-tutorial-id="owner-products-section" className="mt-4">
        <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
          {/* Header row */}
          <div className="flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-7">
            <h3 className="text-2xl font-bold text-slate-900">Products</h3>
            <Link href="/products/add" data-tutorial-id="owner-add-products-btn" className="relative inline-flex items-center gap-2 rounded-2xl bg-[#65bbc5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#53aab5]">
              <Plus className="h-4 w-4" /> Add Products
              {requestsBadge > 0 && (
                <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 py-0.5 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                  {requestsBadge > 99 ? "99+" : requestsBadge}
                </span>
              )}
            </Link>
          </div>

          {/* Search + Filters */}
          <div className="border-t border-slate-100 px-4 py-4 sm:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or SKU…"
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
              </div>

              {categories.length > 0 && (
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-400">
                  <option value="all">All Categories</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              )}

              {brands.length > 0 && (
                <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-400">
                  <option value="all">All Brands</option>
                  {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              )}

              <select value={filterSale} onChange={(e) => setFilterSale(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-400">
                <option value="all">All Sale Status</option>
                <option value="on">On Sale</option>
                <option value="off">Not On Sale</option>
              </select>

              <select value={filterNewArrival} onChange={(e) => setFilterNewArrival(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-400">
                <option value="all">All Arrivals</option>
                <option value="yes">New Arrivals Only</option>
                <option value="no">Not New Arrival</option>
              </select>

              <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-400">
                <option value="all">All Stock</option>
                <option value="instock">In Stock</option>
                <option value="outofstock">Out of Stock</option>
              </select>

              {hasFilters && (
                <button
                  onClick={() => { setSearch(""); setFilterCategory("all"); setFilterBrand("all"); setFilterSale("all"); setFilterNewArrival("all"); setFilterStock("all"); }}
                  className="h-9 rounded-xl border border-slate-300 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="px-7 pb-16 pt-4 text-center text-sm text-slate-400">
              {products.length === 0 ? "No products yet. Submit a listing request." : "No products match your filters."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-[48px_1.6fr_0.65fr_0.7fr_0.7fr_0.8fr_0.9fr] border-b border-slate-100 px-4 pb-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 sm:px-7">
                  <div />
                  <div>Name</div>
                  <div>SKU</div>
                  <div>Original</div>
                  <div>Selling</div>
                  <div>Stock</div>
                  <div className="text-right">Actions</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => {
                    const origP = product.originalPrice ?? product.price ?? 0;
                    const sellP = product.sellingPrice ?? origP;
                    const isOnSale = product.isOnSale ?? false;
                    const discount = product.discountPercent ?? 0;
                    const isExpanded = expandedId === product.productId;

                    return (
                      <div key={product.productId}>
                        <div className="grid grid-cols-[48px_1.6fr_0.65fr_0.7fr_0.7fr_0.8fr_0.9fr] items-center px-4 py-4 text-sm sm:px-7">
                          <ProductThumb src={product.mainImage} alt={product.name} />
                          <div>
                            <div className="font-semibold text-slate-700 truncate pr-2">{product.name}</div>
                            {(product.brand || product.category) && (
                              <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                                {[product.brand, product.category].filter(Boolean).join(" · ")}
                              </div>
                            )}
                          </div>
                          <div className="font-mono text-xs text-slate-500">{product.sku || "—"}</div>
                          <div className="text-slate-500 text-xs">${origP.toFixed(2)}</div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">${sellP.toFixed(2)}</p>
                            {isOnSale && discount > 0 && <p className="text-[10px] text-amber-500 font-semibold">{discount}% OFF</p>}
                          </div>
                          <div className="text-slate-700">{product.quantity}</div>
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setDetailProductId(product.productId)}
                              title="View full details"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : product.productId)}
                              className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                              {isExpanded ? "Close" : "Pricing"}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <PriceEditor product={product} markupPercent={markupPercent} discountCap={discountCap} onUpdated={handleUpdated} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {detailProductId && <ProductDetailModal productId={detailProductId} onClose={() => setDetailProductId(null)} />}
      {detailProduct && <DetailsModal product={detailProduct} onClose={() => setDetailProduct(null)} />}
    </>
  );
}
