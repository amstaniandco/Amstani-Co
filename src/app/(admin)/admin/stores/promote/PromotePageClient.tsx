"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, Slash, Upload, X, Check } from "lucide-react";
import { useToast } from "../../../../../components/global/ToastProvider";
import { useConfirm } from "../../../../../components/global/ConfirmProvider";
import AdminNavbar from "../../../../../components/admin/AdminNavbar";
import AdminSidebar from "../../../../../components/admin/AdminSidebar";

type Promotion = {
  _id: string;
  storeId: string;
  storeName: string;
  storeEmail: string;
  storeState: string;
  imageUrl?: string | null;
  mediaType?: "image" | "video" | null;
  endDate: string;
  createdAt: string;
};

// Cloudinary video uploads are served under a /video/ delivery path; fall back to
// extension sniffing for any other source.
function isVideoMedia(url?: string | null, mediaType?: "image" | "video" | null): boolean {
  if (mediaType) return mediaType === "video";
  if (!url) return false;
  return /\/video\/upload\//.test(url) || /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url);
}

export default function PromotePageClient() {
  const searchParams = useSearchParams();
  const toast = useToast();
  const confirm = useConfirm();
  const storeId = searchParams.get("storeId") ?? "";

  const [storeName, setStoreName] = useState("Store");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [promoting, setPromoting] = useState(false);

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promoLoading, setPromoLoading] = useState(true);

  // Edit state: promotionId → new endDate being typed
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEndDate, setEditEndDate] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load store name
  useEffect(() => {
    if (!storeId) return;
    fetch("/api/admin/stores")
      .then((r) => r.json())
      .then((data) => {
        const store = data.stores?.find((s: { _id: string }) => s._id === storeId);
        if (store) setStoreName(store.name);
      })
      .catch(() => {});
  }, [storeId]);

  const fetchPromotions = useCallback(() => {
    setPromoLoading(true);
    fetch("/api/admin/stores/promotions")
      .then((r) => r.json())
      .then((data) => setPromotions(data.promotions ?? []))
      .catch(() => {})
      .finally(() => setPromoLoading(false));
  }, []);

  useEffect(() => { fetchPromotions(); }, [fetchPromotions]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Media upload failed"); return; }
      setImageUrl(data.url);
      setImagePreview(data.url);
      setMediaType(data.mediaType === "video" ? "video" : "image");
    } catch {
      toast.error("Media upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handlePromote() {
    if (!storeId) { toast.error("No store selected."); return; }
    if (!endDate) { toast.error("Please set an end date."); return; }

    setPromoting(true);
    try {
      const res = await fetch(`/api/admin/stores/${storeId}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, mediaType, endDate }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to promote store"); return; }
      toast.success("Store promoted successfully.");
      setImageUrl(null);
      setImagePreview(null);
      setMediaType(null);
      setEndDate("");
      fetchPromotions();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setPromoting(false);
    }
  }

  async function handleDelete(promotionId: string) {
    if (!(await confirm("Remove this promotion?"))) return;
    await fetch(`/api/admin/stores/promotions/${promotionId}`, { method: "DELETE" });
    fetchPromotions();
  }

  function startEdit(promotion: Promotion) {
    setEditingId(promotion._id);
    setEditEndDate(promotion.endDate);
  }

  async function saveEdit(promotionId: string) {
    setSavingEdit(true);
    try {
      await fetch(`/api/admin/stores/promotions/${promotionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endDate: editEndDate }),
      });
      setEditingId(null);
      fetchPromotions();
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="admin-page-shell">
      <div className="admin-page-grid">
        <AdminSidebar activePath="/admin/stores" className="admin-sidebar-flush" />

        <main className="admin-main-panel">
          <AdminNavbar />

          {/* Promote form */}
          <section className="mt-3 rounded-[28px] border border-[#d9e2e8] bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
            <div className="mb-6">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{storeName}</h1>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr] lg:items-start">
              {/* Image upload */}
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Store Card Media</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,video/ogg"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white disabled:opacity-60"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading…" : "Upload Image or Video"}
                </button>
                <div className="mt-4 flex items-center gap-3">
                  {imagePreview ? (
                    <div className="relative">
                      {isVideoMedia(imagePreview, mediaType) ? (
                        <video
                          src={imagePreview}
                          muted
                          playsInline
                          controls
                          className="h-12 w-12 rounded-2xl object-cover"
                        />
                      ) : (
                        <img src={imagePreview} alt="Preview" className="h-12 w-12 rounded-2xl object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => { setImageUrl(null); setImagePreview(null); setMediaType(null); }}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="h-12 w-12 rounded-2xl bg-slate-100" />
                      <div className="h-12 w-12 rounded-2xl bg-slate-100" />
                      <div className="h-12 w-12 rounded-2xl bg-slate-100" />
                    </>
                  )}
                </div>
              </div>

              {/* End date */}
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">End Date</p>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="mt-3 h-14 w-full rounded-3xl border border-[#d9e2e8] bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handlePromote}
              disabled={promoting || uploading}
              className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-3xl bg-[#5dc7d6] px-5 text-sm font-semibold text-white transition hover:bg-[#4bb2c1] disabled:opacity-60"
            >
              {promoting ? "Promoting…" : "Promote"}
            </button>
          </section>

          {/* Promoted stores list */}
          <section className="mt-4 rounded-[28px] border border-[#d9e2e8] bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
            <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Promoted Stores</h2>
            </div>

            {promoLoading ? (
              <div className="py-12 text-center text-sm text-slate-400">Loading promotions…</div>
            ) : promotions.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">No active promotions.</div>
            ) : (
              <div className="overflow-x-auto rounded-[22px] border border-[#e5edf1] bg-[#fbfcfd]">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-white text-[11px] uppercase tracking-[0.14em] text-slate-500">
                    <tr>
                      <th className="px-4 py-4">Media</th>
                      <th className="px-4 py-4">Name</th>
                      <th className="px-4 py-4">Email</th>
                      <th className="px-4 py-4">State</th>
                      <th className="px-4 py-4">End Date</th>
                      <th className="px-4 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2f5] bg-white text-slate-700">
                    {promotions.map((promo, index) => (
                      <tr key={promo._id} className={index % 2 === 0 ? "bg-[#fbfcfd]" : "bg-white"}>
                        <td className="px-4 py-4">
                          {promo.imageUrl ? (
                            isVideoMedia(promo.imageUrl, promo.mediaType) ? (
                              <video
                                src={promo.imageUrl}
                                muted
                                playsInline
                                controls
                                className="h-10 w-10 rounded-xl object-cover"
                              />
                            ) : (
                              <img src={promo.imageUrl} alt={promo.storeName} className="h-10 w-10 rounded-xl object-cover" />
                            )
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-slate-200" />
                          )}
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-900">{promo.storeName}</td>
                        <td className="px-4 py-4 text-slate-600">{promo.storeEmail || "—"}</td>
                        <td className="px-4 py-4 text-slate-600">{promo.storeState || "—"}</td>
                        <td className="px-4 py-4 text-slate-600">
                          {editingId === promo._id ? (
                            <input
                              type="date"
                              value={editEndDate}
                              onChange={(e) => setEditEndDate(e.target.value)}
                              className="rounded-lg border border-[#d9e2e8] px-2 py-1 text-sm outline-none focus:border-cyan-400"
                            />
                          ) : (
                            promo.endDate
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {editingId === promo._id ? (
                              <>
                                <button
                                  type="button"
                                  disabled={savingEdit}
                                  onClick={() => saveEdit(promo._id)}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                                  aria-label="Save"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingId(null)}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8e3e8] bg-white text-slate-600 transition hover:bg-slate-50"
                                  aria-label="Cancel"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEdit(promo)}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8e3e8] bg-white text-slate-600 transition hover:bg-slate-50"
                                  aria-label="Edit promotion"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(promo._id)}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#f1d3d8] bg-[#fff3f5] text-[#b91c1c] transition hover:bg-[#fee2e2]"
                                  aria-label="Remove promotion"
                                >
                                  <Slash className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
