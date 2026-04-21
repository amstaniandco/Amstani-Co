"use client";

import { Search, MoreVertical } from "lucide-react";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  basePrice: number;
  status: "Active" | "Inactive";
  availability: number;
}

const PRODUCTS: Product[] = [
  {
    id: "1",
    sku: "ARPT-3003",
    name: "Premium Ceramic Vessel",
    category: "HOMEWARE",
    basePrice: 124.50,
    status: "Active",
    availability: 42,
  },
  {
    id: "2",
    sku: "ARPT-4412",
    name: "Brushed Nickel Handle",
    category: "HARDWARE",
    basePrice: 18.99,
    status: "Active",
    availability: 38,
  },
  {
    id: "3",
    sku: "ARPT-1003",
    name: "Minimalist Oak Chair",
    category: "FURNITURE",
    basePrice: 240.0,
    status: "Inactive",
    availability: 0,
  },
  {
    id: "4",
    sku: "ARPT-4412",
    name: "Brushed Nickel Handle",
    category: "HARDWARE",
    basePrice: 18.99,
    status: "Active",
    availability: 38,
  },
  {
    id: "5",
    sku: "ARPT-4412",
    name: "Brushed Nickel Handle",
    category: "HARDWARE",
    basePrice: 18.99,
    status: "Active",
    availability: 38,
  },
  {
    id: "6",
    sku: "ARPT-4412",
    name: "Brushed Nickel Handle",
    category: "HARDWARE",
    basePrice: 18.99,
    status: "Active",
    availability: 38,
  },
];

export default function GlobalCatalogTable() {
  return (
    <div className="rounded-xl bg-white shadow-sm md:rounded-[26px]">
      <div className="flex flex-col gap-3 border-b border-[#e7edf1] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-4 md:px-5 md:py-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Global SKU or Name..."
            className="w-full rounded-lg border border-[#e7edf1] bg-white py-2 pl-9 pr-3 text-xs text-slate-700 placeholder-slate-500 transition focus:border-[#58b8c3] focus:outline-none sm:text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[#e7edf1] bg-[#f8fafb]">
              <th className="px-3 py-3 text-left font-semibold text-slate-600 sm:px-4 md:px-5">SKU</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-600 sm:px-4 md:px-5">PRODUCT NAME</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-600 sm:px-4 md:px-5">GLOBAL CATEGORY</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-600 sm:px-4 md:px-5">BASE PRICE</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-600 sm:px-4 md:px-5">STATUS</th>
              <th className="px-3 py-3 text-left font-semibold text-slate-600 sm:px-4 md:px-5">AVAILABILITY</th>
              <th className="px-3 py-3 text-center font-semibold text-slate-600 sm:px-4 md:px-5">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((product) => (
              <tr key={product.id} className="border-b border-[#e7edf1] transition hover:bg-[#f8fafb]">
                <td className="px-3 py-3 font-medium text-slate-800 sm:px-4 md:px-5">{product.sku}</td>
                <td className="px-3 py-3 text-slate-800 sm:px-4 md:px-5">{product.name}</td>
                <td className="px-3 py-3 text-slate-700 sm:px-4 md:px-5">{product.category}</td>
                <td className="px-3 py-3 font-semibold text-slate-800 sm:px-4 md:px-5">${product.basePrice.toFixed(2)}</td>
                <td className="px-3 py-3 sm:px-4 md:px-5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      product.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${product.status === "Active" ? "bg-green-600" : "bg-red-600"}`} />
                    {product.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-slate-700 sm:px-4 md:px-5">
                  Active in {product.availability} <br />
                  Stores
                </td>
                <td className="px-3 py-3 text-center sm:px-4 md:px-5">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg p-2 transition hover:bg-[#f0f4f8]"
                    aria-label="Actions"
                  >
                    <MoreVertical className="h-4 w-4 text-slate-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
