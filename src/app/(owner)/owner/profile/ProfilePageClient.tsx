"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PenLine, Store, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "../../../../components/global/ToastProvider";

function isProfileComplete(store: any): boolean {
  return !!(
    store?.name?.trim() &&
    store?.description?.trim() &&
    store?.logoUrl?.trim() &&
    store?.bannerUrl?.trim() &&
    (store?.settings?.languages?.length ?? 0) > 0
  );
}

function CheckItem({ done, label }: { done: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-2 text-sm ${done ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}`}>
      {done
        ? <CheckCircle2 className="h-4 w-4 shrink-0" />
        : <XCircle className="h-4 w-4 shrink-0" />}
      <span>{label}</span>
    </li>
  );
}

type StoreApplication = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  requestedAt: string;
  category: string;
  status?: string;
  ownerSignupLink?: string;
};

function EditBadge({ onClick, loading }: { onClick?: () => void; loading?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded-full bg-[#65bbc5] text-white shadow-sm transition hover:bg-[#53aab5] disabled:opacity-60"
      disabled={loading}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PenLine className="h-3.5 w-3.5" />}
    </button>
  );
}

function ApplicationsCard({ applications }: { applications: StoreApplication[] }) {
  return (
    <section className="rounded-[26px] bg-white dark:bg-slate-800 dark:border dark:border-slate-700 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[1.2rem] font-bold text-slate-900 dark:text-slate-100 sm:text-[1.45rem]">Applications</h3>
        <Link
          href="/owner/profile/applications"
          className="text-sm font-semibold text-[#4caeb8] dark:text-cyan-400 transition hover:text-[#3b97a6] dark:hover:text-cyan-300"
        >
          View all
        </Link>
      </div>

      <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
        {applications.length === 0 && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-3 text-sm text-slate-600 dark:text-slate-300">
            No applications received yet.
          </div>
        )}
        {applications.map((application) => (
          <Link
            key={application.id}
            href="/owner/profile/applications"
            className="block rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-3 py-3 transition hover:bg-slate-100 dark:hover:bg-slate-600"
            aria-label={`View application list for ${application.fullName}`}
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{application.fullName}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{application.email}</p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>{application.requestedAt}</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{application.status === "approved_by_admin" ? "Approved" : application.status === "denied_by_admin" ? "Denied" : "Pending"}</span>
            </div>
            {application.status === "approved_by_admin" && (
              <div className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-300 break-all">
                Owner signup link: {application.ownerSignupLink || "http://localhost:3000/store-signup"}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProfileHero({ store, onRefresh, followerCount, productCount }: { store: any; onRefresh: () => void; followerCount: number; productCount: number }) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const uploadImage = async (
    file: File,
    field: "logoUrl" | "bannerUrl",
    setUploading: (v: boolean) => void
  ) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) return;

      await fetch("/api/owner/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: uploadData.url }),
      });

      onRefresh();
    } catch {
      // silent — user can retry by clicking again
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="overflow-visible rounded-[26px] bg-white dark:bg-slate-800 dark:border dark:border-slate-700 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-5">
      {/* Hidden file inputs */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadImage(file, "logoUrl", setUploadingLogo);
          e.target.value = "";
        }}
      />
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadImage(file, "bannerUrl", setUploadingBanner);
          e.target.value = "";
        }}
      />

      <div className="relative h-[126px] overflow-hidden rounded-[12px] bg-zinc-900 sm:h-[176px]">
        {store?.bannerUrl ? (
          <img src={store.bannerUrl} alt="Store Banner" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,0.96)_0%,rgba(26,26,26,0.9)_45%,rgba(14,14,14,0.96)_100%)]" />
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(236,236,236,0.72)_0_3.6%,rgba(34,34,34,0.88)_3.6%_9.1%,rgba(240,240,240,0.58)_9.1%_13.2%,rgba(20,20,20,0.92)_13.2%_20%)] opacity-90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_20%_60%,rgba(255,255,255,0.06),transparent_30%)]" />
          </>
        )}
        <div className="absolute top-3 right-3">
          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            disabled={uploadingBanner}
            className="grid h-8 w-8 place-items-center rounded-full bg-[#65bbc5] dark:bg-cyan-600 text-white shadow-sm transition hover:bg-[#53aab5] disabled:opacity-60"
          >
            {uploadingBanner ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative h-[66px] w-[66px] shrink-0 overflow-visible">
            <div className="h-full w-full overflow-hidden rounded-full bg-[#9a9a9a]">
              {store?.logoUrl ? <img src={store.logoUrl} alt="Logo" className="h-full w-full object-cover" /> : null}
            </div>
            <div className="absolute -right-2 -bottom-2 z-20">
              <EditBadge onClick={() => logoInputRef.current?.click()} loading={uploadingLogo} />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[1.75rem] font-bold leading-none text-slate-900 dark:text-slate-100 sm:text-[2rem]">{store?.name || "Setup Your Store"}</h2>
            </div>
            <p className="mt-2 max-w-[300px] text-[13px] leading-5 text-slate-400 dark:text-slate-500">
              {store?.description || "Description of the store can be written here"}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#65bbc5] dark:bg-cyan-600 px-3 py-1 text-[11px] font-semibold text-white">Ranked #1</span>
              <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                store?.status === "active"
                  ? "border-green-500 text-green-500 dark:border-green-400 dark:text-green-400"
                  : store?.status === "suspended"
                  ? "border-red-500 text-red-500 dark:border-red-400 dark:text-red-400"
                  : !isProfileComplete(store)
                  ? "border-amber-400 text-amber-600 dark:border-amber-400 dark:text-amber-400"
                  : "border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400"
              }`}>
                {store?.status === "active"
                  ? "Live"
                  : store?.status === "suspended"
                  ? "Suspended"
                  : !isProfileComplete(store)
                  ? "Incomplete"
                  : "Awaiting Activation"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:gap-8 lg:flex-col lg:items-end lg:gap-4">
          <div className="flex gap-10 text-center sm:gap-8 lg:gap-10">
            <div>
              <p className="text-[2rem] font-bold leading-none text-slate-900 dark:text-slate-100">{productCount}</p>
              <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400">Products</p>
            </div>
            <div>
              <p className="text-[2rem] font-bold leading-none text-slate-900 dark:text-slate-100">{followerCount}</p>
              <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-400">Followers</p>
            </div>
          </div>

          <Link
            href={`/store?storeId=${store?._id}`}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 dark:border-slate-600 bg-white dark:bg-slate-700 px-5 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100 transition hover:bg-slate-50 dark:hover:bg-slate-600"
          >
            User Preview
          </Link>
        </div>
      </div>
    </section>
  );
}

function EarnReferralCard({
  storeId,
  onSubmitted,
  prefillName,
  prefillEmail,
  forwardApplicationId,
}: {
  storeId?: string;
  onSubmitted?: () => void;
  prefillName?: string;
  prefillEmail?: string;
  forwardApplicationId?: string;
}) {
  const toast = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (prefillName) setFullName(prefillName);
    if (prefillEmail) setEmail(prefillEmail);
  }, [prefillName, prefillEmail]);

  const handleSubmit = async () => {
    if (!forwardApplicationId) {
      toast.error("Open an application and click Forward To Admin first.");
      return;
    }
    if (!fullName.trim() || !email.trim()) {
      toast.error("Please enter name and email.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/owner/applications/${forwardApplicationId}/forward`, {
        method: "PATCH",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to submit application");
      }

      toast.success("Application forwarded to admin successfully.");
      setFullName("");
      setEmail("");
      onSubmitted?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to submit application";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-[26px] bg-white dark:bg-slate-800 dark:border dark:border-slate-700 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <h3 className="text-center text-[1.55rem] font-bold text-slate-900 dark:text-slate-100 sm:text-[2rem]">Earn $100</h3>
      <p className="mt-2 text-center text-[15px] text-slate-500 dark:text-slate-400">Register applicant details directly</p>
      <div className="mt-4 space-y-3">
        <input 
          type="text" 
          placeholder="Customer full name" 
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 text-sm text-slate-700 dark:bg-slate-700 dark:text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400" 
        />
        <input 
          type="email" 
          placeholder="Customer email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 text-sm text-slate-700 dark:bg-slate-700 dark:text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400" 
        />
        <button 
          type="button" 
          onClick={handleSubmit}
          disabled={submitting || !forwardApplicationId}
          className="mt-4 w-full rounded-full border-2 border-slate-900 dark:border-slate-400 px-6 py-2.5 text-sm font-semibold text-slate-900 dark:text-slate-100 transition hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </section>
  );
}

function StoreCustomizationCard({ user, store, onSave }: { user: any; store: any; onSave: (data: any) => void }) {
  const toast = useToast();
  const [storeName, setStoreName] = useState(store?.name || "");
  const [storeDescription, setStoreDescription] = useState(store?.description || "");
  const [ownerName, setOwnerName] = useState(user?.name || "");
  const [ownerEmail, setOwnerEmail] = useState(user?.email || "");
  const [ownerPhone, setOwnerPhone] = useState(user?.phone || "");
  const [languages, setLanguages] = useState<string[]>(store?.settings?.languages || []);
  const [logoUrl, setLogoUrl] = useState(store?.logoUrl || "");
  const [bannerUrl, setBannerUrl] = useState(store?.bannerUrl || "");

  // Sync form fields when parent re-fetches after a successful save
  useEffect(() => {
    setStoreName(store?.name || "");
    setStoreDescription(store?.description || "");
    setLogoUrl(store?.logoUrl || "");
    setBannerUrl(store?.bannerUrl || "");
    setLanguages(store?.settings?.languages || []);
  }, [store]);

  useEffect(() => {
    setOwnerName(user?.name || "");
    setOwnerEmail(user?.email || "");
    setOwnerPhone(user?.phone || "");
  }, [user]);
  const [isSaving, setIsSaving] = useState(false);

  const availableLanguages = ["English", "Urdu", "Arabic", "Spanish", "French", "German", "Chinese", "Turkish"];

  const toggleLanguage = (lang: string) => {
    setLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };

  const validateForm = () => {
    if (!storeName.trim()) {
      toast.error("Store name is required");
      return false;
    }
    if (!storeDescription.trim()) {
      toast.error("Store description is required for profile completion");
      return false;
    }
    if (!ownerName.trim()) {
      toast.error("Owner name is required");
      return false;
    }
    if (!ownerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
      toast.error("Valid email is required");
      return false;
    }
    if (ownerPhone && !/^\+?[\d\s\-\(\)]{10,}$/.test(ownerPhone)) {
      toast.error("Invalid phone number format");
      return false;
    }
    if (languages.length === 0) {
      toast.error("Select at least one language");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/owner/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          storeDescription,
          ownerName,
          ownerEmail,
          ownerPhone,
          languages,
          logoUrl,
          bannerUrl,
        }),
      });

      if (response.ok) {
        await onSave({ storeName, storeDescription, ownerName, ownerEmail, ownerPhone, languages, logoUrl, bannerUrl });
        toast.success("Store updated successfully!");
      } else {
        toast.error("Failed to save changes. Please try again.");
      }
    } catch (e) {
      console.error("Error saving store:", e);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-[26px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:border dark:border-slate-700 dark:bg-slate-800 sm:p-6">
      <h3 className="text-[1.2rem] font-bold text-slate-900 dark:text-slate-100 sm:text-[1.45rem]">Store Customization</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update store name, description, photos and owner contact details.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Store Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Store name"
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Owner Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Owner display name"
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Owner Email <span className="text-red-500">*</span></label>
          <input
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            placeholder="Owner email"
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Owner Phone</label>
          <input
            type="tel"
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Store Description <span className="text-red-500">*</span></label>
          <textarea
            value={storeDescription}
            onChange={(e) => setStoreDescription(e.target.value)}
            placeholder="Tell customers about your store..."
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        <div className="sm:col-span-2 rounded-lg border border-slate-300 dark:border-slate-600 p-3 text-sm text-slate-600 dark:text-slate-300">
          <p className="font-semibold text-slate-800 dark:text-slate-100">Languages You Speak <span className="text-red-500">*</span></p>
          <div className="mt-2 flex flex-wrap gap-2">
            {availableLanguages.map((language) => (
              <label
                key={language}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition"
              >
                <input 
                  type="checkbox" 
                  checked={languages.includes(language)}
                  onChange={() => toggleLanguage(language)}
                  className="h-3.5 w-3.5 accent-[#65bbc5]" 
                />
                {language}
              </label>
            ))}
          </div>
        </div>

      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving || !storeName.trim() || !ownerName.trim() || !ownerEmail.trim() || languages.length === 0}
          type="button"
          className="rounded-xl bg-[#65bbc5] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#53aab5] disabled:opacity-50 dark:bg-cyan-600 dark:hover:bg-cyan-700"
        >
          {isSaving ? "Saving..." : "Save Customization"}
        </button>
      </div>
    </section>
  );
}

export default function ProfilePageClient() {
  const searchParams = useSearchParams();
  const forwardAppId = searchParams.get("forwardAppId") || "";
  const [user, setUser] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [applications, setApplications] = useState<StoreApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const showToast = (type: "success" | "error", message: string) => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/owner/store");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setStore(data.store);
        setFollowerCount(data.followerCount ?? 0);
        setProductCount(data.productCount ?? 0);

        const appsRes = await fetch("/api/owner/applications");
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          const mapped: StoreApplication[] = (appsData.applications || []).map((app: any) => ({
            id: String(app._id),
            fullName: app.applicant?.name || "Unknown",
            email: app.applicant?.email || "",
            phone: app.applicant?.phone || "",
            requestedAt: app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "",
            category: app.storeName || "Store",
            status: app.status || "new",
            ownerSignupLink: app.ownerSignupLink,
          }));
          setApplications(mapped);
        }
      } else {
        showToast("error", "Failed to fetch profile");
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
      showToast("error", "Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveStore = async (data: any) => {
    try {
      await fetchProfile();
    } catch (e) {
      console.error("Error saving store:", e);
      showToast("error", "Error saving store profile");
    }
  };

  const selectedForwardApplication = applications.find((app) => app.id === forwardAppId);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-48 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-48 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="dark:bg-slate-950">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Store className="h-5 w-5 text-[#65bbc5]" />
          <h1 className="text-xl font-semibold sm:text-2xl">{store?.name || "Setup Your Store"}</h1>
        </div>

        <span className={`inline-flex items-center self-start rounded-full border px-4 py-1.5 text-sm font-semibold sm:self-auto ${
          store?.status === "active"
            ? "border-green-500 text-green-600 dark:border-green-400 dark:text-green-400"
            : store?.status === "suspended"
            ? "border-red-400 text-red-500 dark:border-red-400 dark:text-red-400"
            : !isProfileComplete(store)
            ? "border-amber-400 text-amber-600 dark:border-amber-400 dark:text-amber-400"
            : "border-amber-500 text-amber-600 dark:border-amber-400 dark:text-amber-400"
        }`}>
          {store?.status === "active"
            ? "Active"
            : store?.status === "suspended"
            ? "Suspended"
            : !isProfileComplete(store)
            ? "Incomplete Profile"
            : "Awaiting Activation"}
        </span>
      </section>

      <section className="mt-4">
        <ProfileHero store={store} onRefresh={fetchProfile} followerCount={followerCount} productCount={productCount} />
      </section>

      {!isProfileComplete(store) && (
        <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-700 dark:bg-amber-900/20">
          <p className="font-semibold text-amber-800 dark:text-amber-300">Complete your profile to get your store activated</p>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">Your store will not be visible to customers until all required fields are filled and an admin activates it.</p>
          <ul className="mt-3 space-y-1.5">
            <CheckItem done={!!store?.name?.trim()} label="Store name" />
            <CheckItem done={!!store?.description?.trim()} label="Store description" />
            <CheckItem done={!!store?.logoUrl?.trim()} label="Store logo (click the edit icon on your profile picture)" />
            <CheckItem done={!!store?.bannerUrl?.trim()} label="Store banner (click the edit icon on the banner)" />
            <CheckItem done={(store?.settings?.languages?.length ?? 0) > 0} label="At least one language selected" />
          </ul>
        </section>
      )}

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <ApplicationsCard applications={applications} />
        <EarnReferralCard
          storeId={store?._id ? String(store._id) : undefined}
          onSubmitted={fetchProfile}
          prefillName={selectedForwardApplication?.fullName}
          prefillEmail={selectedForwardApplication?.email}
          forwardApplicationId={selectedForwardApplication?.id}
        />
      </section>

      <section className="mt-4">
        <StoreCustomizationCard user={user} store={store} onSave={handleSaveStore} />
      </section>
    </div>
  );
}
