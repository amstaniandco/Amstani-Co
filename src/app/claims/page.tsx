"use client";

import { useState } from "react";

const products = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop",
    store: "STORE NAME",
    name: "NAME OF THE PRODUCT HERE",
    variant: "VARIANT",
    price: 249,
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=80&h=80&fit=crop",
    store: "STORE NAME",
    name: "NAME OF THE PRODUCT HERE",
    variant: "VARIANT",
    price: 249,
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=80&h=80&fit=crop",
    store: "STORE NAME",
    name: "NAME OF THE PRODUCT HERE",
    variant: "VARIANT",
    price: 249,
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=80&h=80&fit=crop",
    store: "STORE NAME",
    name: "NAME OF THE PRODUCT HERE",
    variant: "VARIANT",
    price: 249,
  },
];

const claims = [
  {
    id: "#CLM-9901",
    customer: "Sarah Jenkins",
    issueType: "Damaged item",
    status: "ESCALATED",
    statusClass: "text-red-500",
    action: "Report",
    highlight: true,
  },
  {
    id: "#CLR-0054",
    customer: "Mark Thompson",
    issueType: "Refund",
    status: "RESPONDED",
    statusClass: "text-green-600",
    action: null,
    highlight: false,
  },
  {
    id: "#CLR-8840",
    customer: "Jessica Alba",
    issueType: "Missing item",
    status: "OPEN",
    statusClass: "text-gray-400",
    action: null,
    highlight: false,
  },
];

export default function ClaimPage() {
  const [quantities, setQuantities] = useState<{ [key: number]: number }>(
    Object.fromEntries(products.map((p) => [p.id, 1])),
  );
  const [selected, setSelected] = useState<{ [key: number]: boolean }>({});
  const [issueType, setIssueType] = useState("");
  const [message, setMessage] = useState("");

  const handleQty = (id: number, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }));
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center gap-5 text-base">
      {/* Select Disputed Item */}
      <div className="bg-white rounded-2xl p-6 w-full shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-semibold text-gray-800">
            Select Disputed Item
          </h2>
          <span className="text-xs font-medium text-red-500 cursor-pointer">
            Report All
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
              />

              <div className="flex-1 min-w-0 flex items-center justify-between gap-6">
                <div className="min-w-0 max-w-[55%]">
                  <p className="text-xs font-semibold text-teal-500 tracking-widest uppercase">
                    {product.store}
                  </p>
                  <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {product.variant}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-1.5 min-w-[92px]">
                <button
                  onClick={() => handleQty(product.id, -1)}
                  className="w-5 h-5 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-500 text-sm leading-none hover:bg-gray-100 cursor-pointer"
                >
                  −
                </button>
                <span className="text-xs font-medium text-gray-700 w-3 text-center">
                  {quantities[product.id]}
                </span>
                <button
                  onClick={() => handleQty(product.id, 1)}
                  className="w-5 h-5 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-500 text-sm leading-none hover:bg-gray-100 cursor-pointer"
                >
                  +
                </button>
                </div>

                <span className="text-sm font-bold text-gray-800 flex-shrink-0 w-16 text-center">
                  ${product.price}
                </span>
              </div>

              <div
                onClick={() => toggleSelect(product.id)}
                className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
                  selected[product.id]
                    ? "bg-teal-500 border-teal-500"
                    : "bg-white border-gray-300"
                }`}
              >
                {selected[product.id] && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path
                      d="M1 3.5L3 5.5L8 1"
                      stroke="white"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Claim Form */}
      <div className="bg-white rounded-2xl p-6 w-full  shadow-sm">
        <h2 className="text-base font-bold text-gray-800 tracking-widest uppercase mb-1">
          CLAIM
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Please let us know the issue you are facing
        </p>

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Issue Type
          </label>
          <div className="relative">
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer"
            >
              <option value="" disabled>
                Select Issue Type
              </option>
              <option value="damaged">Damaged Item</option>
              <option value="missing">Missing Item</option>
              <option value="refund">Refund</option>
              <option value="wrong">Wrong Item</option>
              <option value="other">Other</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path
                  d="M1 1l4 4 4-4"
                  stroke="#a0aec0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Please type your message here"
            rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-700 placeholder-gray-300 resize-none focus:outline-none focus:ring-1 focus:ring-teal-400"
          />
        </div>

        <button className="w-full py-3 bg-teal-500 hover:bg-teal-600 transition-colors text-white text-sm font-semibold rounded-xl cursor-pointer">
          Submit
        </button>
      </div>

      {/* Your Claims */}
      <div className="bg-white rounded-2xl p-6 w-full shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 tracking-widest uppercase mb-4">
          YOUR CLAIMS
        </h2>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <rect x="1" y="1" width="4" height="4" rx="0.6" fill="white" />
              <rect x="6" y="1" width="4" height="4" rx="0.6" fill="white" />
              <rect x="1" y="6" width="4" height="4" rx="0.6" fill="white" />
              <rect x="6" y="6" width="4" height="4" rx="0.6" fill="white" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-gray-700">
            Global Claims & Escalations
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                {["Claim ID", "Customer", "Issue Type", "Status", "Action"].map(
                  (h) => (
                    <th
                      key={h}
                      className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide pr-3"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr
                  key={claim.id}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td
                    className={`py-3 text-sm font-semibold pr-3 ${claim.highlight ? "text-red-500" : "text-gray-700"}`}
                  >
                    {claim.id}
                  </td>
                  <td className="py-3 text-sm text-gray-600 pr-3 whitespace-nowrap">
                    {claim.customer}
                  </td>
                  <td className="py-3 text-sm text-gray-600 pr-3 whitespace-nowrap">
                    {claim.issueType}
                  </td>
                  <td
                    className={`py-3 text-[10px] font-bold tracking-wide pr-3 whitespace-nowrap ${claim.statusClass}`}
                  >
                    • {claim.status}
                  </td>
                  <td className="py-3">
                    {claim.action ? (
                      <button className="px-3 py-1 bg-red-500 hover:bg-red-600 transition-colors text-white text-[11px] font-semibold rounded-md cursor-pointer">
                        {claim.action}
                      </button>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
