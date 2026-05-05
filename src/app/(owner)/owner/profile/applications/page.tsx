"use client";

import { useEffect, useMemo, useState } from "react";
import { Store } from "lucide-react";

type ApplicationRow = {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  state: string;
  status: string;
  ownerSignupLink?: string;
};

function extractFromMessage(message: string | undefined) {
  if (!message) return { state: "", address: "" };
  const stateMatch = message.match(/State:\s*([^|]+)/i);
  const addressMatch = message.match(/Address:\s*(.*)$/i);
  return {
    state: stateMatch?.[1]?.trim() || "",
    address: addressMatch?.[1]?.trim() || "",
  };
}

export default function OwnerProfileApplicationsPage() {
  const [storeName, setStoreName] = useState("Name of the store here");
  const [rows, setRows] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState("");

  const copyLink = async (id: string, link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1500);
    } catch (error) {
      console.error("Failed to copy signup link:", error);
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [storeRes, appsRes] = await Promise.all([
          fetch("/api/owner/store"),
          fetch("/api/owner/applications"),
        ]);

        if (!mounted) return;

        if (storeRes.ok) {
          const storeData = await storeRes.json();
          setStoreName(storeData?.store?.name || "Name of the store here");
        }

        if (appsRes.ok) {
          const appsData = await appsRes.json();
          const mapped: ApplicationRow[] = (appsData?.applications || []).map((app: any) => {
            const parsed = extractFromMessage(app?.applicant?.message);
            return {
              id: String(app?._id),
              name: app?.applicant?.name || "",
              address: parsed.address,
              email: app?.applicant?.email || "",
              phone: app?.applicant?.phone || "",
              state: parsed.state,
              status: app?.status || "new",
              ownerSignupLink: app?.ownerSignupLink,
            };
          });
          setRows(mapped);
        }
      } catch (error) {
        console.error("Failed loading owner applications page:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const hasRows = useMemo(() => rows.length > 0, [rows]);

  return (
    <>
          <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <Store className="h-5 w-5 text-[#65bbc5]" />
              <h1 className="text-xl font-semibold sm:text-2xl">{storeName}</h1>
            </div>
          </section>

          <section className="mt-6 rounded-[26px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <div className="mb-4">
              <h2 className="text-[1.3rem] font-semibold text-slate-900">Store Applications</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.16em] text-slate-900">
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Address</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Phone Number</th>
                    <th className="px-4 py-3 font-semibold">State</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && !hasRows && (
                    <tr className="border-b border-slate-200 text-sm text-slate-900 last:border-b-0">
                      <td className="px-4 py-4" colSpan={7}>No applications received yet.</td>
                    </tr>
                  )}
                  {loading && (
                    <tr className="border-b border-slate-200 text-sm text-slate-900 last:border-b-0">
                      <td className="px-4 py-4" colSpan={7}>Loading applications...</td>
                    </tr>
                  )}
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-200 text-sm text-slate-900 last:border-b-0">
                      <td className="px-4 py-4">{row.name}</td>
                      <td className="px-4 py-4">{row.address}</td>
                      <td className="px-4 py-4">{row.email}</td>
                      <td className="px-4 py-4">{row.phone}</td>
                      <td className="px-4 py-4">{row.state}</td>
                      <td className="px-4 py-4">
                        {row.status === "approved_by_admin" ? "Approved" : row.status === "denied_by_admin" ? "Denied" : row.status === "forwarded_to_admin" ? "Forwarded" : "New"}
                      </td>
                      <td className="px-4 py-4">
                        {row.status === "approved_by_admin" ? (
                          <div className="flex flex-col gap-2">
                            <a href={row.ownerSignupLink || "http://localhost:3000/store-signup"} className="font-bold text-emerald-700 break-all" target="_blank" rel="noreferrer">
                              {row.ownerSignupLink || "http://localhost:3000/store-signup"}
                            </a>
                            <button
                              type="button"
                              onClick={() => copyLink(row.id, row.ownerSignupLink || "http://localhost:3000/store-signup")}
                              className="w-fit rounded-md border border-emerald-600 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                            >
                              {copiedId === row.id ? "Copied" : "Copy"}
                            </button>
                          </div>
                        ) : row.status === "denied_by_admin" || row.status === "forwarded_to_admin" ? (
                          <span className="text-slate-500">No Action</span>
                        ) : (
                          <a
                            href={`/owner/profile?forwardAppId=${row.id}`}
                            className="font-bold transition"
                            style={{ color: "#15803D" }}
                          >
                            Forward To Admin
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
    </>
  );
}
