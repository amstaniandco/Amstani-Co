"use client";

import { CalendarDays, Clock3, Copy, Eye, ImagePlus, MoreVertical, Power, Send, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";

type Communication = {
  _id: string;
  title: string;
  subtitle: string;
  audience: "customers" | "owners" | "all";
  communicationType: "banner" | "announcement";
  imageUrl?: string;
  status: "Live" | "Draft";
  createdAt: string;
};

function getStatusClass(status: Communication["status"]) {
  if (status === "Live") return "text-[#16a34a]";
  return "text-slate-500";
}

function audienceLabel(value: Communication["audience"]) {
  if (value === "customers") return "Customers";
  if (value === "owners") return "Store Owners";
  return "Customers & Stores";
}

function typeLabel(value: Communication["communicationType"]) {
  return value === "banner" ? "Homepage Banner" : "Notification";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

type CommunicationsTableProps = {
  isComposerOpen?: boolean;
  onCloseComposer?: () => void;
};

export default function CommunicationsTable({
  isComposerOpen = false,
  onCloseComposer,
}: CommunicationsTableProps) {
  const [items, setItems] = useState<Communication[]>([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [audience, setAudience] = useState<Communication["audience"]>("all");
  const [communicationType, setCommunicationType] = useState<Communication["communicationType"]>("announcement");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<Communication | null>(null);

  useEffect(() => {
    fetch("/api/admin/communications")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => setItems(data?.communications ?? []))
      .catch(() => {});
  }, []);

  const handleImageUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Image upload failed");
        return;
      }
      setImageUrl(data.url);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/communications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, subtitle, audience, communicationType, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to publish communication");
        return;
      }

      setItems((prev) => [data.communication, ...prev]);
      setTitle("");
      setSubtitle("");
      setAudience("all");
      setCommunicationType("announcement");
      setImageUrl("");
      onCloseComposer?.();
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (item: Communication) => {
    const nextStatus = item.status === "Live" ? "Draft" : "Live";
    const res = await fetch("/api/admin/communications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item._id, status: nextStatus }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setItems((prev) => prev.map((entry) => entry._id === item._id ? data.communication : entry));
    setOpenMenuId(null);
  };

  const handleDelete = async (item: Communication) => {
    const confirmed = window.confirm("Delete this communication?");
    if (!confirmed) return;
    const res = await fetch(`/api/admin/communications?id=${item._id}`, { method: "DELETE" });
    if (!res.ok) return;
    setItems((prev) => prev.filter((entry) => entry._id !== item._id));
    setOpenMenuId(null);
  };

  const handleCopyImageUrl = async (item: Communication) => {
    if (!item.imageUrl) return;
    await navigator.clipboard.writeText(item.imageUrl);
    setOpenMenuId(null);
  };

  return (
    <>
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl rounded-2xl border border-[#dbe5ea] bg-white p-4 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-[#e7edf1] pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Add Communication</h2>
                <p className="mt-1 text-xs text-slate-500">Create a notification or homepage banner.</p>
              </div>
              <button
                type="button"
                onClick={onCloseComposer}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d8e1e8] text-slate-500 transition hover:bg-slate-50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Announcement title"
                className="rounded-lg border border-[#d8e3e8] bg-white px-3 py-2 text-sm outline-none focus:border-[#54b9c9]"
              />
              <input
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                placeholder="Message details"
                className="rounded-lg border border-[#d8e3e8] bg-white px-3 py-2 text-sm outline-none focus:border-[#54b9c9]"
              />
              <select
                value={audience}
                onChange={(event) => setAudience(event.target.value as Communication["audience"])}
                className="rounded-lg border border-[#d8e3e8] bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                disabled={communicationType === "banner"}
              >
                <option value="all">All users</option>
                <option value="customers">Customers</option>
                <option value="owners">Store owners</option>
              </select>
              <select
                value={communicationType}
                onChange={(event) => {
                  const nextType = event.target.value as Communication["communicationType"];
                  setCommunicationType(nextType);
                  if (nextType === "banner") setAudience("customers");
                }}
                className="rounded-lg border border-[#d8e3e8] bg-white px-3 py-2 text-sm text-slate-700 outline-none"
              >
                <option value="announcement">Notification</option>
                <option value="banner">Homepage banner</option>
              </select>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-lg border border-[#d8e3e8] bg-white px-3 py-2">
                  <ImagePlus className="h-4 w-4" />
                  {uploading ? "Uploading..." : imageUrl ? "Image ready" : "Upload banner image"}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(event) => handleImageUpload(event.target.files?.[0])}
                />
              </label>

              <button
                type="submit"
                disabled={saving || uploading || !title.trim() || !subtitle.trim() || (communicationType === "banner" && !imageUrl)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#54b9c9] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#489fad] disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {saving ? "Publishing..." : communicationType === "banner" ? "Publish Banner" : "Send Notification"}
              </button>
            </div>

            {imageUrl && (
              <p className="mt-2 truncate text-xs text-slate-500">Banner image: {imageUrl}</p>
            )}
            {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
          </form>
        </div>
      )}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#dbe5ea] bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-[#e7edf1] pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{previewItem.title}</h2>
                <p className="mt-1 text-xs text-slate-500">{typeLabel(previewItem.communicationType)}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d8e1e8] text-slate-500 transition hover:bg-slate-50"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {previewItem.imageUrl && (
              <Image
                src={previewItem.imageUrl}
                alt={previewItem.title}
                width={640}
                height={260}
                className="mb-4 max-h-64 w-full rounded-xl object-cover"
              />
            )}
            <p className="text-sm text-slate-700">{previewItem.subtitle}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md bg-[#eef3f7] px-2.5 py-1 font-medium text-slate-700">
                {audienceLabel(previewItem.audience)}
              </span>
              <span className={`rounded-md px-2.5 py-1 font-semibold ${getStatusClass(previewItem.status)}`}>
                {previewItem.status}
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-slate-600">
                {formatDate(previewItem.createdAt)}
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="overflow-x-auto rounded-xl border border-[#dbe5ea] bg-white">
        <table className="w-full min-w-[920px] border-collapse text-left text-xs sm:text-sm">
          <thead className="border-b border-[#e6edf2] bg-[#f8fbfd] text-[10px] uppercase tracking-[0.08em] text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Message Content</th>
              <th className="px-4 py-3 font-semibold">Target Audience</th>
              <th className="px-4 py-3 font-semibold">Schedule</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">
                  No communications published yet.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id} className="border-b border-[#edf2f6] text-slate-700">
                  <td className="px-4 py-3.5">
                    <p className="text-[22px] font-semibold leading-5 text-slate-800">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
                    <p className="mt-1 text-[11px] font-semibold text-slate-400">{typeLabel(item.communicationType)}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex rounded-md bg-[#eef3f7] px-2.5 py-1 text-xs font-medium text-slate-700">
                      {audienceLabel(item.audience)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                      {item.status === "Live" ? <Clock3 className="h-3.5 w-3.5" /> : <CalendarDays className="h-3.5 w-3.5" />}
                      {item.status === "Live" ? "Live Now" : formatDate(item.createdAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${getStatusClass(item.status)}`}>
                      <span className={`h-2 w-2 rounded-full ${item.status === "Live" ? "bg-[#22c55e]" : "bg-[#cbd5e1]"}`} />
                      {item.status === "Live" ? "Live" : "DRAFT"}
                    </span>
                  </td>
                  <td className="relative px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId((current) => current === item._id ? null : item._id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      aria-label="Row actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {openMenuId === item._id && (
                      <div className="absolute right-4 top-11 z-20 w-48 rounded-lg border border-[#e5edf1] bg-white py-1 text-left shadow-lg">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewItem(item);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View details
                        </button>
                        {item.imageUrl && (
                          <button
                            type="button"
                            onClick={() => handleCopyImageUrl(item)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copy image URL
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(item)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          <Power className="h-3.5 w-3.5" />
                          {item.status === "Live" ? "Set as draft" : "Set live"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
