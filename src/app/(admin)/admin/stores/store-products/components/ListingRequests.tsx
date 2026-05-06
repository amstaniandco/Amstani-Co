"use client";

import { useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

export type ListingRequestItem = {
  _id: string;
  storeId: string;
  orderId: string;
  orderDate: string;
  noOfProducts: number;
  items: Array<{ productId: string; quantity: number }>;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

type Props = {
  listingRequests: ListingRequestItem[];
  loading?: boolean;
  onAction: (requestId: string, action: "approve" | "reject") => Promise<void>;
};

const statusBadge: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-rose-50 text-rose-600 border border-rose-200",
};

export default function ListingRequests({ listingRequests, loading, onAction }: Props) {
  const [processing, setProcessing] = useState<string | null>(null);

  const handle = async (id: string, action: "approve" | "reject") => {
    setProcessing(id);
    await onAction(id, action);
    setProcessing(null);
  };

  if (loading) {
    return <div className="py-16 text-center text-sm text-slate-400">Loading requests…</div>;
  }

  if (listingRequests.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-slate-400">No listing requests yet.</div>
    );
  }

  return (
    <table className="min-w-full border-collapse text-left text-sm">
      <thead className="bg-[#f8fafc] text-[11px] uppercase tracking-[0.14em] text-slate-500">
        <tr>
          <th className="px-4 py-4">Order ID</th>
          <th className="px-4 py-4">Order Date</th>
          <th className="px-4 py-4">No. of Products</th>
          <th className="px-4 py-4">Product IDs</th>
          <th className="px-4 py-4">Quantity</th>
          <th className="px-4 py-4">Status</th>
          <th className="px-4 py-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#eef2f5] bg-white text-slate-700">
        {listingRequests.map((req, index) => (
          <tr key={req._id} className={index % 2 === 0 ? "bg-[#fbfcfd]" : "bg-white"}>
            <td className="px-4 py-4 font-semibold text-slate-900">{req.orderId}</td>
            <td className="px-4 py-4 text-slate-600">{req.orderDate}</td>
            <td className="px-4 py-4 text-slate-600">{req.noOfProducts}</td>
            <td className="px-4 py-4 text-slate-600 font-mono text-xs">
              {req.items?.map((i) => i.productId).join(", ") || "—"}
            </td>
            <td className="px-4 py-4 text-slate-600">
              {req.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0}
            </td>
            <td className="px-4 py-4">
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusBadge[req.status] ?? ""}`}>
                {req.status}
              </span>
            </td>
            <td className="px-4 py-4 text-right">
              {req.status === "pending" ? (
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    disabled={processing === req._id}
                    onClick={() => handle(req._id, "approve")}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 border border-emerald-200 transition hover:bg-emerald-100 disabled:opacity-50"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={processing === req._id}
                    onClick={() => handle(req._id, "reject")}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-rose-50 px-3 text-xs font-semibold text-rose-600 border border-rose-200 transition hover:bg-rose-100 disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">Processed</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
