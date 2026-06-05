"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Plus, Store, Tag } from "lucide-react";

type ProductRow = {
  productId: string;
  name: string;
  sku: string;
  originalPrice: number;
  sellingPrice?: number;
  discountPercent?: number;
  isOnSale?: boolean;
  isNewArrival?: boolean;
  price: number;
  quantity: number;
  mainImage?: string | null;
};

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
  // Lock originalPrice at mount so it never shifts when sellingPrice changes
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

  // Sync input when parent state updates sellingPrice (e.g. after a successful save)
  useEffect(() => {
    if (!editingPrice) {
      setPriceInput((product.sellingPrice ?? originalPrice).toFixed(2));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.sellingPrice]);

  async function patch(body: Record<string, unknown>) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/owner/products/${product.productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to update."); return false; }
      return true;
    } finally {
      setSaving(false);
    }
  }

  async function savePrice() {
    const sp = parseFloat(priceInput);
    if (isNaN(sp) || sp < 0) { setError("Enter a valid price."); return; }
    const ok = await patch({ sellingPrice: sp });
    if (ok) {
      // Only update sellingPrice — never update price/originalPrice so the reference stays fixed
      onUpdated(product.productId, { sellingPrice: sp });
      setEditingPrice(false);
    }
  }

  async function saveDiscount() {
    const dp = parseFloat(discountInput);
    if (isNaN(dp) || dp < 0) { setError("Enter a valid discount."); return; }
    const ok = await patch({ discountPercent: dp, isOnSale: dp > 0 });
    if (ok) {
      onUpdated(product.productId, { discountPercent: dp, isOnSale: dp > 0 });
      setEditingDiscount(false);
    }
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

  const effectivePrice = currentSelling * (1 - currentDiscount / 100);

  return (
    <div className="mx-4 mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:mx-7">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* Original price (read-only) */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">
            Original Price (Catalog)
          </p>
          <p className="text-sm font-bold text-slate-600">${originalPrice.toFixed(2)}</p>
        </div>

        {/* Selling price */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">
            Your Selling Price
            <span className="ml-1 font-normal text-slate-400">(max ${maxSellingPrice.toFixed(2)})</span>
          </p>
          {editingPrice ? (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-500">$</span>
                <input
                  type="number"
                  min="0"
                  max={maxSellingPrice}
                  step="0.01"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 pl-5 pr-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-teal-400"
                  autoFocus
                />
              </div>
              <button onClick={savePrice} disabled={saving}
                className="px-2.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold disabled:opacity-60">
                {saving ? "…" : "Save"}
              </button>
              <button onClick={() => { setEditingPrice(false); setError(""); }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-slate-100">
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-800">${currentSelling.toFixed(2)}</p>
              <button onClick={() => { setPriceInput(currentSelling.toFixed(2)); setEditingPrice(true); setError(""); }}
                className="text-[11px] font-semibold text-teal-600 hover:underline">
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Discount */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">
            Sale Discount
            <span className="ml-1 font-normal text-slate-400">(max {discountCap}%)</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSale}
              disabled={saving}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-60 ${
                isOnSale
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "border border-slate-300 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Tag className="h-3 w-3" />
              {isOnSale ? "Sale ON" : "Sale OFF"}
            </button>
            {isOnSale && (
              <>
                {editingDiscount ? (
                  <div className="flex items-center gap-1.5">
                    <div className="relative w-16">
                      <input
                        type="number"
                        min="0"
                        max={discountCap}
                        step="1"
                        value={discountInput}
                        onChange={(e) => setDiscountInput(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
                        autoFocus
                      />
                    </div>
                    <span className="text-xs text-slate-500">%</span>
                    <button onClick={saveDiscount} disabled={saving}
                      className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold disabled:opacity-60">
                      {saving ? "…" : "OK"}
                    </button>
                    <button onClick={() => { setEditingDiscount(false); setError(""); }}
                      className="text-xs text-slate-400 hover:text-slate-600">✕</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-amber-600">{currentDiscount}% off</span>
                    <button onClick={() => { setDiscountInput(String(currentDiscount)); setEditingDiscount(true); setError(""); }}
                      className="text-[11px] font-semibold text-amber-600 hover:underline">Edit</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Effective price */}
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">
            Customer Pays
          </p>
          <p className="text-base font-extrabold text-teal-600">${effectivePrice.toFixed(2)}</p>
          {isOnSale && currentDiscount > 0 && (
            <p className="text-[11px] text-slate-400 line-through">${currentSelling.toFixed(2)}</p>
          )}
        </div>
      </div>

      {/* New Arrival tag */}
      <div className="mt-4 flex items-center gap-3 border-t border-slate-200 pt-4">
        <span className="text-xs font-semibold text-slate-500">Product Tags:</span>
        <button
          onClick={toggleNewArrival}
          disabled={saving}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition disabled:opacity-60 ${
            isNewArrival
              ? "bg-[#68B8C1] border-[#68B8C1] text-white"
              : "border-slate-300 text-slate-500 hover:border-[#68B8C1] hover:text-[#68B8C1]"
          }`}
        >
          ✦ {isNewArrival ? "New Arrival (ON)" : "Mark as New Arrival"}
        </button>
        <span className="text-[11px] text-slate-400">
          {isNewArrival ? "Visible on the New Arrivals page." : "Off — not shown on New Arrivals."}
        </span>
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
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
    setProducts((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, ...changes } : p))
    );
  }

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

      {/* Pricing rules summary */}
      <section className="mt-4 rounded-2xl bg-white border border-slate-200 px-5 py-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-700">Platform Pricing Rules</p>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
          <span>
            Max markup:{" "}
            <strong className="text-teal-600">+{markupPercent}%</strong> above original price
          </span>
          <span>
            Max discount:{" "}
            <strong className="text-amber-600">{discountCap}%</strong> off selling price
          </span>
        </div>
      </section>

      {/* Product table */}
      <section className="mt-4">
        {products.length === 0 ? (
          <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-7">
              <h3 className="text-2xl font-bold text-slate-900">Products</h3>
              <Link href="/products/add" className="inline-flex items-center gap-2 rounded-2xl bg-[#65bbc5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#53aab5]">
                <Plus className="h-4 w-4" /> Add Products
              </Link>
            </div>
            <div className="px-7 pb-16 text-center text-sm text-slate-400">
              No products yet. Submit a listing request.
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-7">
              <h3 className="text-2xl font-bold text-slate-900">Products</h3>
              <Link href="/products/add" className="inline-flex items-center gap-2 rounded-2xl bg-[#65bbc5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#53aab5]">
                <Plus className="h-4 w-4" /> Add Products
              </Link>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[680px]">
                <div className="grid grid-cols-[48px_1.6fr_0.65fr_0.8fr_0.8fr_0.9fr_0.45fr] border-b border-slate-100 px-4 pb-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 sm:px-7">
                  <div />
                  <div>Name</div>
                  <div>SKU</div>
                  <div>Original</div>
                  <div>Selling</div>
                  <div>Stock</div>
                  <div className="text-right">Actions</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {products.map((product) => {
                    const originalPrice = product.originalPrice ?? product.price ?? 0;
                    const sellingPrice = product.sellingPrice ?? originalPrice;
                    const isOnSale = product.isOnSale ?? false;
                    const discount = product.discountPercent ?? 0;
                    const isExpanded = expandedId === product.productId;

                    return (
                      <div key={product.productId}>
                        <div className="grid grid-cols-[48px_1.6fr_0.65fr_0.8fr_0.8fr_0.9fr_0.45fr] items-center px-4 py-4 text-sm sm:px-7">
                          <ProductThumb src={product.mainImage} alt={product.name} />
                          <div className="font-semibold text-slate-700 truncate pr-2">{product.name}</div>
                          <div className="font-mono text-xs text-slate-500">{product.sku || "—"}</div>
                          <div className="text-slate-500 text-xs">${originalPrice.toFixed(2)}</div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">${sellingPrice.toFixed(2)}</p>
                            {isOnSale && discount > 0 && (
                              <p className="text-[10px] text-amber-500 font-semibold">{discount}% OFF</p>
                            )}
                          </div>
                          <div className="text-slate-700">{product.quantity}</div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : product.productId)}
                              className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                              {isExpanded ? "Close" : "Pricing"}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <PriceEditor
                            product={product}
                            markupPercent={markupPercent}
                            discountCap={discountCap}
                            onUpdated={handleUpdated}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
