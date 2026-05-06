"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Store } from "lucide-react";

type ProductRow = {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  mainImage?: string | null;
};

const discountOptions = ["Select Type", "Select Category"];

function ProductThumb({ src, alt }: { src?: string | null; alt: string }) {
  if (src) {
    return <img src={src} alt={alt} className="h-8 w-8 rounded-md object-cover sm:h-9 sm:w-9" />;
  }
  return <div className="h-8 w-8 rounded-md bg-slate-200 sm:h-9 sm:w-9" />;
}

function ProductTable({ products, loading }: { products: ProductRow[]; loading: boolean }) {
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
        <div className="px-7 py-16 text-center text-sm text-slate-400">Loading products…</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-7">
          <h3 className="text-[1.35rem] font-bold text-slate-900 sm:text-2xl">Products</h3>
          <Link
            href="/products/add"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#65bbc5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#53aab5]"
          >
            <Plus className="h-4 w-4" />
            Add Products
          </Link>
        </div>
        <div className="px-7 pb-16 text-center text-sm text-slate-400">
          No products listed yet. Submit a listing request to get products approved.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-7">
        <h3 className="text-[1.35rem] font-bold text-slate-900 sm:text-2xl">Products</h3>
        <Link
          href="/products/add"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#65bbc5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#53aab5]"
        >
          <Plus className="h-4 w-4" />
          Add Products
        </Link>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[620px]">
          <div className="grid grid-cols-[48px_1.7fr_0.7fr_0.7fr_0.9fr_0.45fr] border-b border-slate-100 px-4 pb-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 sm:grid-cols-[56px_1.7fr_0.7fr_0.7fr_0.9fr_0.45fr] sm:px-7">
            <div>Image</div>
            <div>Name</div>
            <div>SKU</div>
            <div>Price</div>
            <div>In Stock</div>
            <div className="text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-100">
            {products.map((product, index) => (
              <div key={product.productId}>
                <div className="grid grid-cols-[48px_1.7fr_0.7fr_0.7fr_0.9fr_0.45fr] items-center px-4 py-3.5 text-sm sm:grid-cols-[56px_1.7fr_0.7fr_0.7fr_0.9fr_0.45fr] sm:px-7 sm:py-4">
                  <div>
                    <ProductThumb src={product.mainImage} alt={product.name} />
                  </div>
                  <div className="font-semibold text-slate-700">{product.name}</div>
                  <div className="font-mono text-xs text-slate-500">{product.sku || "—"}</div>
                  <div className="text-slate-500">Rs {Number(product.price).toLocaleString()}</div>
                  <div className="text-slate-700">{product.quantity}</div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setExpandedRowIndex((prev) => (prev === index ? null : index))}
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      {expandedRowIndex === index ? "Hide" : "Details"}
                    </button>
                  </div>
                </div>

                {expandedRowIndex === index && (
                  <div className="mx-4 mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:mx-7 sm:p-4">
                    <div className="grid gap-3 text-xs text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <p className="font-semibold text-slate-900">Product ID</p>
                        <p className="font-mono break-all">{product.productId}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">SKU</p>
                        <p>{product.sku || "—"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Quantity in Stock</p>
                        <p>{product.quantity}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/owner/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setStoreName(data.storeName ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="flex items-center gap-2 text-slate-900">
        <Store className="h-5 w-5 text-[#65bbc5]" />
        <h1 className="text-xl font-semibold sm:text-2xl">
          {storeName || "My Store"}
        </h1>
      </section>

      <section className="mt-4 rounded-[32px] bg-white px-4 py-4 shadow-[0_14px_35px_rgba(15,23,42,0.05)] sm:px-6 sm:py-5">
        <h2 className="text-[1.35rem] font-bold tracking-tight text-slate-900 sm:text-2xl">
          Manage Discounts
        </h2>

        <div className="mt-4 grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-3">
          <select
            defaultValue={discountOptions[0]}
            className="h-7 w-full min-w-0 rounded-sm border border-slate-400 bg-white px-2 text-[11px] text-slate-700 outline-none sm:text-sm"
          >
            <option>{discountOptions[0]}</option>
            <option>Option One</option>
            <option>Option Two</option>
          </select>

          <select
            defaultValue={discountOptions[1]}
            className="h-7 w-full min-w-0 rounded-sm border border-slate-400 bg-white px-2 text-[11px] text-slate-700 outline-none sm:text-sm"
          >
            <option>{discountOptions[1]}</option>
            <option>Option One</option>
            <option>Option Two</option>
          </select>

          <input
            type="text"
            placeholder="Enter Percentage %"
            className="h-7 w-full min-w-0 rounded-sm border border-slate-400 bg-white px-2 text-[11px] text-slate-700 outline-none placeholder:text-slate-500 sm:text-sm"
          />

          <button
            type="button"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#65bbc5] text-white transition hover:bg-[#53aab5]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          className="mx-auto mt-3 block text-[13px] text-[#65bbc5] underline decoration-[#65bbc5]/50 underline-offset-4"
        >
          View Previous
        </button>
      </section>

      <section className="mt-4">
        <ProductTable products={products} loading={loading} />
      </section>
    </>
  );
}
