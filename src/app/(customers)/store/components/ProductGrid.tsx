"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type StoreProduct = {
  productId: string;
  name: string;
  sku: string;
  price: number;
  mainImage?: string | null;
  quantity: number;
};

export default function ProductGrid({ storeId }: { storeId?: string | null }) {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) { setLoading(false); return; }
    fetch(`/api/stores/${storeId}/products`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [storeId]);

  if (loading) {
    return (
      <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800">
        <div className="py-12 text-center text-sm text-slate-400">Loading products…</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-5 flex items-center gap-2">
          <span className="text-[#5fb9c3]">📦</span>
          <h3 className="text-base font-semibold text-[#68B8C1]">Our Products</h3>
        </div>
        <div className="py-8 text-center text-sm text-slate-400">No products listed yet.</div>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-5 flex items-center gap-2">
        <span className="text-[#5fb9c3]">📦</span>
        <h3 className="text-base font-semibold text-[#68B8C1]">Our Products</h3>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product.productId} className="overflow-hidden rounded-3xl border border-gray-100 bg-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
            <Link href={`/product?productId=${product.productId}`} className="relative block h-[300px] w-full overflow-hidden bg-white dark:bg-slate-900">
              {product.mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.mainImage} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-slate-200 dark:bg-slate-700" />
              )}
            </Link>

            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link href={`/product?productId=${product.productId}`} className="text-sm font-semibold text-[#68B8C1] hover:text-[#4f9ea7]">
                    {product.name}
                  </Link>
                  {product.sku && (
                    <p className="mt-1 text-xs font-mono uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                      {product.sku}
                    </p>
                  )}
                </div>

                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                  {product.quantity} in stock
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Rs {Number(product.price).toLocaleString()}
                </p>

                <div className="flex items-center gap-2">
                  <Link
                    href="/wishlist"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-slate-500 transition hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12.1 21.55l-.1.1-.11-.1C7.14 17.24 4 14.39 4 10.5 4 7.42 6.42 5 9.5 5c1.74 0 3.41.81 4.5 2.09C15.09 5.81 16.76 5 18.5 5 21.58 5 24 7.42 24 10.5c0 3.89-3.14 6.74-7.9 11.05z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                  <Link
                    href="/cart"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#68B8C1] text-white transition hover:bg-[#4f9ea7]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M6 6h.01M6 6l1.5 9.3a1 1 0 001 .92h9a1 1 0 001-.92L18 6H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 6V4a2 2 0 114 0v2m4 0V4a2 2 0 114 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
