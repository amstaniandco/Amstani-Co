import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import AdminNavbar from "../../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../../components/admin/AdminSidebar";

const tabs = [
  { label: "All Stores", href: "/admin/stores" },
  { label: "Store Applications", href: "/admin/stores/applications" },
  { label: "Signup Requests", href: "/admin/stores/signup-requests" },
];

const signupRequests = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  name: "John Doe",
  address: "H#1 St#2, XYZ",
  email: "name@gmail.com",
  phone: "1234567890",
  state: "LA",
}));

export default function AdminStoreSignupRequestsPage() {
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
            <div className="overflow-hidden rounded-[28px] border border-[#e5ecf1] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-[#f3f7f9] text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    <tr>
                      <th className="px-4 py-4">Name</th>
                      <th className="px-4 py-4">Address</th>
                      <th className="px-4 py-4">Email</th>
                      <th className="px-4 py-4">Phone Number</th>
                      <th className="px-4 py-4">State</th>
                      <th className="px-4 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2f5] bg-white text-slate-700">
                    {signupRequests.map((request, index) => (
                      <tr key={request.id} className={index % 2 === 0 ? "bg-[#fbfcfd]" : "bg-white"}>
                        <td className="px-4 py-4 font-medium text-slate-900">{request.name}</td>
                        <td className="px-4 py-4 text-slate-600">{request.address}</td>
                        <td className="px-4 py-4 text-slate-600">{request.email}</td>
                        <td className="px-4 py-4 text-slate-600">{request.phone}</td>
                        <td className="px-4 py-4 text-slate-600">{request.state}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8faf7] text-[#0f766e] transition hover:bg-[#d4f1ec]"
                              aria-label="Approve signup request"
                            >
                              <CheckCircle2 className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff1f3] text-[#b91c1c] transition hover:bg-[#fee2e2]"
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
