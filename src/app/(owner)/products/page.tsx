"use client";

import { useState } from "react";
import { ChevronDown, Plus, Store, Square } from "lucide-react";

type ProductRow = {
  name: string;
  price: number;
  inStock: number;
  shippingCost: number;
  taxRate: number;
  discountRate: number;
  maxAllowedIncreasePct: number;
  currentIncreasePct: number;
  minAllowedPrice: number;
};

const productRows: ProductRow[] = [
  {
    name: "Classic Linen Shirt",
    price: 51,
    inStock: 423,
    shippingCost: 123,
    taxRate: 12,
    discountRate: 8,
    maxAllowedIncreasePct: 15,
    currentIncreasePct: 6,
    minAllowedPrice: 44,
  },
  {
    name: "Urban Fit Chino",
    price: 74,
    inStock: 251,
    shippingCost: 98,
    taxRate: 10,
    discountRate: 5,
    maxAllowedIncreasePct: 18,
    currentIncreasePct: 11,
    minAllowedPrice: 68,
  },
  {
    name: "Silk Blend Kurta",
    price: 89,
    inStock: 149,
    shippingCost: 135,
    taxRate: 9,
    discountRate: 12,
    maxAllowedIncreasePct: 20,
    currentIncreasePct: 9,
    minAllowedPrice: 79,
  },
  {
    name: "Heritage Denim Jacket",
    price: 120,
    inStock: 112,
    shippingCost: 165,
    taxRate: 14,
    discountRate: 4,
    maxAllowedIncreasePct: 12,
    currentIncreasePct: 7,
    minAllowedPrice: 109,
  },
  {
    name: "Premium Cotton Polo",
    price: 44,
    inStock: 381,
    shippingCost: 86,
    taxRate: 8,
    discountRate: 10,
    maxAllowedIncreasePct: 16,
    currentIncreasePct: 13,
    minAllowedPrice: 39,
  },
  {
    name: "Monogram Tee",
    price: 38,
    inStock: 602,
    shippingCost: 79,
    taxRate: 7,
    discountRate: 6,
    maxAllowedIncreasePct: 22,
    currentIncreasePct: 10,
    minAllowedPrice: 33,
  },
];

const discountOptions = ["Select Type", "Select Category"];

function ProductThumb() {
  return <div className="h-8 w-8 rounded-md bg-slate-200 sm:h-9 sm:w-9" />;
}

function ProductTable() {
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);

  return (
    <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
      <div className="px-4 py-5 sm:px-7 sm:py-7">
        <h3 className="text-[1.35rem] font-bold text-slate-900 sm:text-2xl">Products</h3>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[680px] sm:min-w-[760px]">
          <div className="grid grid-cols-[48px_1.7fr_0.7fr_0.85fr_0.95fr_0.45fr] border-b border-slate-100 px-4 pb-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 sm:grid-cols-[56px_1.7fr_0.7fr_0.9fr_1fr_0.45fr] sm:px-7">
            <div>Image</div>
            <div>Name</div>
            <div>Price</div>
            <div>In Stock</div>
            <div>Shipping Cost</div>
            <div className="text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-100">
            {productRows.map((product, index) => (
              <div key={`${product.name}-${index}`}>
                <div className="grid grid-cols-[48px_1.7fr_0.7fr_0.85fr_0.95fr_0.45fr] items-center px-4 py-3.5 text-sm sm:grid-cols-[56px_1.7fr_0.7fr_0.9fr_1fr_0.45fr] sm:px-7 sm:py-4">
                  <div>
                    <ProductThumb />
                  </div>
                  <div className="font-semibold text-slate-700">{product.name}</div>
                  <div className="text-slate-500">${product.price.toFixed(2)}</div>
                  <div className="text-slate-700">{product.inStock}</div>
                  <div className="text-slate-700">${product.shippingCost}</div>
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
                    <div className="grid gap-3 text-xs text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="font-semibold text-slate-900">Tax</p>
                        <p>{product.taxRate}%</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Discount</p>
                        <p>{product.discountRate}%</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Max Price Increase Allowed</p>
                        <p>{product.maxAllowedIncreasePct}%</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Current Price Increase</p>
                        <p>{product.currentIncreasePct}%</p>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 text-xs text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <p className="font-semibold text-slate-900">Current Selling Price</p>
                        <p>${product.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Maximum Allowed Price Now</p>
                        <p>${(product.price * (1 + (product.maxAllowedIncreasePct - product.currentIncreasePct) / 100)).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Remaining Increase Headroom</p>
                        <p className="font-semibold text-[#65bbc5]">
                          {(product.maxAllowedIncreasePct - product.currentIncreasePct).toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-600">
                      <p>
                        Allowed price range right now: ${product.minAllowedPrice.toFixed(2)} -
                        {(product.price * (1 + (product.maxAllowedIncreasePct - product.currentIncreasePct) / 100)).toFixed(2)}
                      </p>
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
  return (
    <>
          <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <Store className="h-5 w-5 text-[#65bbc5]" />
              <h1 className="text-xl font-semibold sm:text-2xl">Name of the store here</h1>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-[#65bbc5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#53aab5] sm:self-auto sm:px-6"
            >
              <Square className="h-4 w-4" />
              Go Live
            </button>
          </section>

          <section className="mt-4 rounded-[32px] bg-white px-4 py-4 shadow-[0_14px_35px_rgba(15,23,42,0.05)] sm:px-6 sm:py-5">
            <h2 className="text-[1.35rem] font-bold tracking-tight text-slate-900 sm:text-2xl">Manage Discounts</h2>

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
            <ProductTable />
          </section>
    </>
  );
}
