"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import FormMapCard from "./components/FormMapCard";
import { ChevronDown, Search } from "lucide-react";

type UsStatesGeoJson = {
  features?: Array<{
    properties?: {
      NAME?: string;
    };
  }>;
};

export default function FormPageClient() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId") || "";
  const [state, setState] = useState("");
  const [states, setStates] = useState<string[]>([]);
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/us-states.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load states");
        }
        return res.json() as Promise<UsStatesGeoJson>;
      })
      .then((data) => {
        if (!active) {
          return;
        }

        const names = (data.features || [])
          .map((feature) => feature.properties?.NAME)
          .filter((name): name is string => Boolean(name))
          .sort((a, b) => a.localeCompare(b));

        setStates(names);
      })
      .catch(() => {
        if (active) {
          setStates([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async () => {
    if (!storeId) {
      setNotice({
        type: "error",
        title: "Missing Store",
        message: "Store ID is missing. Please open this form from a store page.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          name: fullName,
          email,
          phone,
          message: `State: ${state}${address ? ` | Address: ${address}` : ""}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to submit form");
      }
      setNotice({
        type: "success",
        title: "Application Submitted",
        message: "Your application has been sent to the store owner.",
      });
      setFullName("");
      setAddress("");
      setEmail("");
      setPhone("");
      setState("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit form";
      setNotice({ type: "error", title: "Submission Failed", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-4">
      {notice && (
        <div
          className={`fixed top-4 left-1/2 z-[9999] -translate-x-1/2 rounded-xl px-4 py-3 shadow-lg ${
            notice.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="text-sm font-semibold">{notice.title}</div>
          <div className="text-xs opacity-95">{notice.message}</div>
        </div>
      )}
      <div className="w-full rounded-4xl bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#3f4447] px-8 py-6">
          <h1 className="text-2xl font-semibold text-white">
            Store Ownership Application
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Official registration for the State Founder Program. Please provide
            accurate legal documentation.
          </p>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* LEFT SIDE - MAP */}
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-[0.24em] mb-3">
              Select Jurisdiction
            </h3>

            <FormMapCard
              selectedState={state}
              onStateSelect={(value) => setState(value)}
            />
          </div>

          {/* RIGHT SIDE - FORM */}
          <div>
            <h3 className="text-sm font-bold text-black uppercase tracking-[0.24em] mb-3">
              Identity Credentials
            </h3>

            <div className="space-y-4">
              {/* Dropdown */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-3xl bg-white px-10 py-3 text-sm text-black outline-none shadow-sm focus:ring-2 focus:ring-teal-400 appearance-none"
                >
                  <option value="">Search for a State...</option>
                  {states.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>

              {/* Inputs */}
              <input
                type="text"
                placeholder="Legal Full Name (as per Passport)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-3xl bg-white px-4 py-3 text-sm text-black outline-none shadow-sm focus:ring-2 focus:ring-teal-400"
              />

              <input
                type="text"
                placeholder="Physical Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-3xl bg-white px-4 py-3 text-sm text-black outline-none shadow-sm focus:ring-2 focus:ring-teal-400"
              />

              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-3xl bg-white px-4 py-3 text-sm text-black outline-none shadow-sm focus:ring-2 focus:ring-teal-400"
              />

              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-3xl bg-white px-4 py-3 text-sm text-black outline-none shadow-sm focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 px-8 py-6 sm:flex-row sm:items-center sm:justify-between bg-gray-50 shadow-inner">
          <p className="flex items-center gap-2 text-sm text-black/70">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/10 bg-white text-xs font-bold text-black">
              i
            </span>
            Confidential high-security application environment.
          </p>

          <button
            onClick={handleSubmit}
            disabled={submitting || !fullName.trim() || !email.trim() || !storeId}
            className="bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
