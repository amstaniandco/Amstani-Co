"use client";

import { Minus, Plus, Store } from "lucide-react";
import { useState } from "react";

type Status = "Pending" | "Approved" | "Denied";

type ProductEntry = {
  productId: string;
  quantity: string;
};

type Request = {
  orderId: string;
  orderDate: string;
  noOfProducts: number;
  items: ProductEntry[];
  status: Status;
};

const initialRequests: Request[] = [
  {
    orderId: "12345",
    orderDate: "02/10/2020",
    noOfProducts: 2,
    items: [
      { productId: "12345", quantity: "7" },
      { productId: "12346", quantity: "3" },
    ],
    status: "Pending",
  },
  {
    orderId: "12345",
    orderDate: "02/10/2020",
    noOfProducts: 2,
    items: [
      { productId: "12345", quantity: "7" },
      { productId: "12346", quantity: "3" },
    ],
    status: "Approved",
  },
  {
    orderId: "12345",
    orderDate: "02/10/2020",
    noOfProducts: 2,
    items: [
      { productId: "12345", quantity: "7" },
      { productId: "12346", quantity: "3" },
    ],
    status: "Denied",
  },
  {
    orderId: "12345",
    orderDate: "02/10/2020",
    noOfProducts: 2,
    items: [
      { productId: "12345", quantity: "7" },
      { productId: "12346", quantity: "3" },
    ],
    status: "Pending",
  },
  {
    orderId: "12345",
    orderDate: "02/10/2020",
    noOfProducts: 2,
    items: [
      { productId: "12345", quantity: "7" },
      { productId: "12346", quantity: "3" },
    ],
    status: "Pending",
  },
];

const statusClass: Record<Status, string> = {
  Pending: "text-gray-400",
  Approved: "text-teal-500",
  Denied: "text-red-500",
};

export default function AddNewProductsPage() {
  const [form, setForm] = useState({
    orderId: "",
    orderDate: "",
    numberOfProducts: 1,
    items: [{ productId: "", quantity: "" }],
  });

  const productCount = form.numberOfProducts;
  const totalQuantity = form.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  function incrementProductCount() {
    setForm((prev) => ({
      ...prev,
      numberOfProducts: prev.numberOfProducts + 1,
      items: [...prev.items, { productId: "", quantity: "" }],
    }));
  }

  function decrementProductCount() {
    setForm((prev) => {
      if (prev.numberOfProducts <= 1) return prev;
      return {
        ...prev,
        numberOfProducts: prev.numberOfProducts - 1,
        items: prev.items.slice(0, -1),
      };
    });
  }

  const [requests, setRequests] = useState<Request[]>(initialRequests);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleItemChange(
    index: number,
    field: keyof ProductEntry,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }
 
  function handleSubmit() {
    if (!form.orderId || !form.orderDate) return;
    if (form.items.some((item) => !item.productId || !item.quantity)) return;
    setRequests((prev) => [
      {
        orderId: form.orderId,
        orderDate: form.orderDate,
        noOfProducts: form.numberOfProducts,
        items: form.items,
        status: "Pending",
      },
      ...prev,
    ]);
    setForm({
      orderId: "",
      orderDate: "",
      numberOfProducts: 1,
      items: [{ productId: "", quantity: "" }],
    });
  }

  return (
    <div className="min-h-screen">
      {/* Page Content */}
      <main className="mx-auto px-6 flex flex-col gap-6 text-base">
        <div className="flex items-center gap-2 text-slate-900">
          <Store className="h-5 w-5 text-teal-500" />
          <h1 className="text-2xl font-semibold">Name of the store here</h1>
        </div>

        {/* Add New Products Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-7">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Add New Products
          </h1>
          <p className="text-base text-gray-500 italic mb-7">
            Product Must be ordered from Official Amstani Wholesale Website
          </p>

          {/* Row 1 */}
          <div className="grid grid-cols-3 gap-5 mb-5">
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Order ID
              </label>
              <input
                name="orderId"
                value={form.orderId}
                onChange={handleChange}
                placeholder="Enter Order ID"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-base text-gray-600 placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Order Date
              </label>
              <input
                name="orderDate"
                value={form.orderDate}
                onChange={handleChange}
                placeholder="DD/MM/YYYY"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-base text-gray-600 placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Number of products
              </label>
              <div className="flex items-center rounded-md border border-gray-300 bg-white px-2 py-2.5">
                <button
                  type="button"
                  onClick={decrementProductCount}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="mx-3 min-w-[48px] text-center text-base font-semibold text-slate-900">
                  {productCount}
                </div>
                <button
                  type="button"
                  onClick={incrementProductCount}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Products: {productCount}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Total quantity: {totalQuantity}
                </span>
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid gap-5 mb-7">
            {form.items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    Product ID {index + 1}
                  </label>
                  <input
                    value={item.productId}
                    onChange={(e) =>
                      handleItemChange(index, "productId", e.target.value)
                    }
                    placeholder="Enter Product ID"
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-base text-gray-600 placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">
                    Quantity {index + 1}
                  </label>
                  <input
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    placeholder="Quantity or items ordered"
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-base text-gray-600 placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-teal-400 hover:bg-teal-500 transition-colors text-white font-semibold text-base py-3.5 rounded-xl mb-4"
          >
            Submit Request
          </button>

          <p className="text-center text-base text-gray-400 italic">
            Request will be submitted to the admin and shall be listed on the
            store after approval..
          </p>
        </div>

        {/* Request History Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-7">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Request History
          </h2>

          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 tracking-widest pb-3">
                  ORDER ID
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 tracking-widest pb-3">
                  ORDER DATE
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 tracking-widest pb-3">
                  NO OF PRODUCTS
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 tracking-widest pb-3">
                  PRODUCT ID
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 tracking-widest pb-3">
                  QUANTITY
                </th>
                <th className="text-right text-xs font-semibold text-gray-400 tracking-widest pb-3">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 last:border-none"
                >
                  <td className="py-3.5 text-sm text-gray-700">
                    {req.orderId}
                  </td>
                  <td className="py-3.5 text-sm text-gray-700">
                    {req.orderDate}
                  </td>
                  <td className="py-3.5 text-sm text-gray-700">
                    {req.noOfProducts}
                  </td>
                  <td className="py-3.5 text-sm text-gray-700">
                    {req.items.map((item) => item.productId).join(", ")}
                  </td>
                  <td className="py-3.5 text-sm text-gray-700">
                    {req.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}
                  </td>
                  <td
                    className={`py-3.5 text-sm font-medium text-right ${statusClass[req.status]}`}
                  >
                    {req.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
