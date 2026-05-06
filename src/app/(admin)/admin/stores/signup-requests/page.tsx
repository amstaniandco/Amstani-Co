"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import AdminNavbar from "../../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../../components/admin/AdminSidebar";

const tabs = [
  { label: "All Stores", href: "/admin/stores" },
  { label: "Store Applications", href: "/admin/stores/applications" },
  { label: "Signup Requests", href: "/admin/stores/signup-requests" },
];

type SignupRequestRow = {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  state: string;
  storeName: string;
  status: "pending" | "approved" | "denied";
};

type SignupRequestResponse = {
  _id: string;
  userData?: {
    name?: string;
    address?: string;
    email?: string;
    phone?: string;
    state?: string;
  };
  storeData?: {
    storeName?: string;
  };
  status?: "pending" | "approved" | "denied";
};

export default function AdminStoreSignupRequestsPage() {
  const [signupRequests, setSignupRequests] = useState<SignupRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/api/admin/stores/signup-requests");
        const data = await res.json();
        if (!mounted) return;

        if (!res.ok) {
          setError(data.error || "Failed to load signup requests");
          return;
        }

        const mapped: SignupRequestRow[] = ((data.requests || []) as SignupRequestResponse[]).map((request) => ({
          id: String(request._id),
          name: request.userData?.name || "",
          address: request.userData?.address || "-",
          email: request.userData?.email || "",
          phone: request.userData?.phone || "-",
          state: request.userData?.state || "-",
          storeName: request.storeData?.storeName || "-",
          status: request.status || "pending",
        }));

        setSignupRequests(mapped);
      } catch {
        if (mounted) setError("Failed to load signup requests");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const updateStatus = async (requestId: string, action: "approve" | "deny") => {
    try {
      const res = await fetch(`/api/admin/stores/signup-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update signup request");
        return;
      }

      setSignupRequests((prev) =>
        prev.map((request) =>
          request.id === requestId
            ? { ...request, status: action === "approve" ? "approved" : "denied" }
            : request
        )
      );
    } catch {
      setError("Failed to update signup request");
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(155deg,#eef3f7_0%,#e8f1f5_42%,#f6fafb_100%)] px-2 py-2 text-slate-900 sm:px-4 sm:py-4 md:px-6 md:py-6">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <AdminSidebar activePath="/admin/stores" />

        <main className="rounded-xl border border-[#d8e0e6] bg-[#f7fafc] p-2 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:rounded-[28px] sm:p-3 md:p-4">
          <AdminNavbar />

          <section className="mt-3 rounded-xl bg-white px-3 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:mt-4 sm:rounded-[26px] sm:px-4 sm:py-4 md:px-5 md:py-5">
            <div className="flex flex-col gap-4 border-b border-[#e7edf1] pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-[26px]">
                  Signup Requests
                </h1>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                  Review new store signup requests before approving them into the marketplace.
                </p>
              </div>
            </div>

            <div className="mt-3 overflow-x-auto border-b border-[#e7edf1] text-xs font-semibold text-slate-700 sm:mt-4 sm:text-sm">
              <div className="flex min-w-max gap-6">
                {tabs.map((tab) => {
                  const isActive = tab.href === "/admin/stores/signup-requests";

                  return (
                    <Link
                      key={tab.label}
                      href={tab.href}
                      className={`border-b-2 pb-3 transition ${
                        isActive
                          ? "border-[#58b8c3] text-[#2f7f8d]"
                          : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {tab.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-4">
            {error && <div className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <div className="overflow-hidden rounded-[28px] border border-[#e5ecf1] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-[#f3f7f9] text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    <tr>
                      <th className="px-4 py-4">Name</th>
                      <th className="px-4 py-4">Store</th>
                      <th className="px-4 py-4">Address</th>
                      <th className="px-4 py-4">Email</th>
                      <th className="px-4 py-4">Phone Number</th>
                      <th className="px-4 py-4">State</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2f5] bg-white text-slate-700">
                    {loading && (
                      <tr>
                        <td className="px-4 py-4 text-slate-600" colSpan={8}>Loading signup requests...</td>
                      </tr>
                    )}
                    {!loading && signupRequests.length === 0 && (
                      <tr>
                        <td className="px-4 py-4 text-slate-600" colSpan={8}>No signup requests found.</td>
                      </tr>
                    )}
                    {signupRequests.map((request, index) => (
                      <tr key={request.id} className={index % 2 === 0 ? "bg-[#fbfcfd]" : "bg-white"}>
                        <td className="px-4 py-4 font-medium text-slate-900">{request.name}</td>
                        <td className="px-4 py-4 text-slate-600">{request.storeName}</td>
                        <td className="px-4 py-4 text-slate-600">{request.address}</td>
                        <td className="px-4 py-4 text-slate-600">{request.email}</td>
                        <td className="px-4 py-4 text-slate-600">{request.phone}</td>
                        <td className="px-4 py-4 text-slate-600">{request.state}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            request.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : request.status === "denied"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateStatus(request.id, "approve")}
                              disabled={request.status === "approved"}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8faf7] text-[#0f766e] transition hover:bg-[#d4f1ec] disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label="Approve signup request"
                            >
                              <CheckCircle2 className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => updateStatus(request.id, "deny")}
                              disabled={request.status === "denied"}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1f3] text-[#b91c1c] transition hover:bg-[#fee2e2] disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label="Reject signup request"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
