"use client";

import { Store } from "lucide-react";
import { useState } from "react";

type Status = "Pending" | "Approved" | "Denied";

type Request = {
  orderId: string;
  orderDate: string;
  noOfProducts: number;
  productId: string;
  quantity: number;
  status: Status;
};

const initialRequests: Request[] = [
  {
    orderId: "12345",
    orderDate: "02/10/2020",
    noOfProducts: 2,
    productId: "12345",
    quantity: 7,
    status: "Pending",
  },
  {
    orderId: "12345",
    orderDate: "02/10/2020",
    noOfProducts: 2,
    productId: "12345",
    quantity: 7,
    status: "Approved",
  },
  {
    orderId: "12345",
    orderDate: "02/10/2020",
    noOfProducts: 2,
    productId: "12345",
    quantity: 7,
    status: "Denied",
  },
  {
    orderId: "12345",
    orderDate: "02/10/2020",
    noOfProducts: 2,
    productId: "12345",
    quantity: 7,
    status: "Pending",
  },
  {
    orderId: "12345",
    orderDate: "02/10/2020",
    noOfProducts: 2,
    productId: "12345",
    quantity: 7,
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
    numberOfProducts: "1",
    productId: "",
    quantity: "",
  });
  const [requests, setRequests] = useState<Request[]>(initialRequests);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit() {
    if (!form.orderId || !form.orderDate || !form.productId || !form.quantity)
      return;
    setRequests((prev) => [
      {
        orderId: form.orderId,
        orderDate: form.orderDate,
        noOfProducts: Number(form.numberOfProducts),
        productId: form.productId,
        quantity: Number(form.quantity),
        status: "Pending",
      },
      ...prev,
    ]);
    setForm({
      orderId: "",
      orderDate: "",
      numberOfProducts: "1",
      productId: "",
      quantity: "",
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
              <input
                name="numberOfProducts"
                value={form.numberOfProducts}
                onChange={handleChange}
                placeholder="1"
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-base text-gray-600 placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-5 mb-7">
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Product ID
              </label>
              <input
                name="productId"
                value={form.productId}
                onChange={handleChange}
                placeholder="Enter Product ID"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-base text-gray-600 placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2">
                Quantity
              </label>
              <input
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="Quantity or items ordered"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-base text-gray-600 placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
              />
            </div>
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
                    {req.productId}
                  </td>
                  <td className="py-3.5 text-sm text-gray-700">
                    {req.quantity}
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
