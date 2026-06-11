"use client";

import {
  CalendarDays,
  CircleAlert,
  Clock3,
  EllipsisVertical,
  Info,
  Loader2,
  Mail,
  MoreVertical,
  Plus,
  Power,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import GoLiveModal from "@/src/components/owner/GoLiveModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type TemplateKey = "orderAcceptance" | "orderOnHold" | "statusUpdate";

type TemplateCard = {
  key: TemplateKey;
  title: string;
  description: string;
  trigger: string;
  icon: "mail" | "alert" | "info";
};

type Announcement = {
  _id: string;
  title: string;
  body: string;
  audience: string;
  status: "Live" | "Draft";
  createdAt: string;
};

// ─── Static template definitions ─────────────────────────────────────────────

const TEMPLATE_CARDS: TemplateCard[] = [
  {
    key: "orderAcceptance",
    title: "Order Acceptance",
    description: "Sent to customer when merchant accepts the order",
    trigger: "ORDER_STATUS_ACCEPTED",
    icon: "mail",
  },
  {
    key: "orderOnHold",
    title: "Order on Hold",
    description: "Notification for inventory discrepancies or verification.",
    trigger: "STOCK_EXCEPTION_HOLD",
    icon: "alert",
  },
  {
    key: "statusUpdate",
    title: "Status Update",
    description: "General update for stage progression in processing.",
    trigger: "LIFECYCLE_STAGE_CHANGE",
    icon: "info",
  },
];

const DEFAULT_TEMPLATES: Record<TemplateKey, boolean> = {
  orderAcceptance: true,
  orderOnHold: true,
  statusUpdate: false,
};

// ─── Small helpers ────────────────────────────────────────────────────────────

function TemplateIcon({ icon }: { icon: TemplateCard["icon"] }) {
  if (icon === "mail")
    return (
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#66c4cf]/25 text-[#3daebc]">
        <Mail className="h-5 w-5" />
      </div>
    );
  if (icon === "alert")
    return (
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#f8a94a]/20 text-[#f08c22]">
        <CircleAlert className="h-5 w-5" />
      </div>
    );
  return (
    <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#66c4cf]/25 text-[#3daebc]">
      <Info className="h-5 w-5" />
    </div>
  );
}

function Toggle({ enabled }: { enabled: boolean }) {
  return (
    <span
      className={`relative inline-flex h-[22px] w-10 items-center rounded-full transition ${
        enabled ? "bg-[#007f88]" : "bg-slate-200"
      }`}
    >
      <span
        className={`h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-[20px]" : "translate-x-0.5"
        }`}
      />
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OwnerCommunicationsPage() {
  const [storeName, setStoreName] = useState("My Store");
  const [storeStatus, setStoreStatus] = useState("pending");
  const [isLive, setIsLive] = useState(false);
  const [liveSessionStartedAt, setLiveSessionStartedAt] = useState<string | null>(null);

  const [templates, setTemplates] = useState<Record<TemplateKey, boolean>>(DEFAULT_TEMPLATES);
  const [savingTemplate, setSavingTemplate] = useState<TemplateKey | null>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnn, setLoadingAnn] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [showComposer, setShowComposer] = useState(false);
  const [compTitle, setCompTitle] = useState("");
  const [compBody, setCompBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [compError, setCompError] = useState("");

  const [showGoLive, setShowGoLive] = useState(false);
  const [goingLive, setGoingLive] = useState(false);
  const [goingOffline, setGoingOffline] = useState(false);

  // ── Load data on mount ───────────────────────────────────────────────────

  useEffect(() => {
    fetch("/api/owner/store")
      .then((r) => r.json())
      .then((d) => {
        setStoreName(d.store?.name || "My Store");
        setStoreStatus(d.store?.status || "pending");
        if (d.store?.automatedTemplates) {
          setTemplates({ ...DEFAULT_TEMPLATES, ...d.store.automatedTemplates });
        }
      })
      .catch(() => {});

    fetch("/api/owner/timings")
      .then((r) => r.json())
      .then((d) => {
        setIsLive(d.isLive || false);
        setLiveSessionStartedAt(d.liveSessionStartedAt || null);
        setStoreStatus(d.storeStatus || "pending");
      })
      .catch(() => {});

    fetch("/api/owner/announcements")
      .then((r) => r.json())
      .then((d) => setAnnouncements(d.announcements || []))
      .catch(() => {})
      .finally(() => setLoadingAnn(false));
  }, []);

  // ── Template toggle ──────────────────────────────────────────────────────

  const handleTemplateToggle = async (key: TemplateKey) => {
    const newVal = !templates[key];
    const newTemplates = { ...templates, [key]: newVal };
    setTemplates(newTemplates);
    setSavingTemplate(key);
    try {
      await fetch("/api/owner/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ automatedTemplates: newTemplates }),
      });
    } finally {
      setSavingTemplate(null);
    }
  };

  // ── Go Live / Offline ────────────────────────────────────────────────────

  const handleGoLive = async (liveLink: string) => {
    setGoingLive(true);
    try {
      const res = await fetch("/api/owner/store/go-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liveLink }),
      });
      if (res.ok) {
        setIsLive(true);
        setLiveSessionStartedAt(new Date().toISOString());
        setShowGoLive(false);
      }
    } finally {
      setGoingLive(false);
    }
  };

  const handleGoOffline = async () => {
    setGoingOffline(true);
    try {
      const res = await fetch("/api/owner/store/go-offline", { method: "POST" });
      if (res.ok) {
        setIsLive(false);
        setLiveSessionStartedAt(null);
      }
    } finally {
      setGoingOffline(false);
    }
  };

  // ── Announcements CRUD ───────────────────────────────────────────────────

  const handleCreate = async () => {
    setCompError("");
    if (!compTitle.trim() || !compBody.trim()) {
      setCompError("Title and message are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/owner/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: compTitle.trim(), body: compBody.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setCompError(data.error || "Failed to create."); return; }
      setAnnouncements((prev) => [data.announcement, ...prev]);
      setCompTitle("");
      setCompBody("");
      setShowComposer(false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item: Announcement) => {
    const next = item.status === "Live" ? "Draft" : "Live";
    const res = await fetch("/api/owner/announcements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item._id, status: next }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setAnnouncements((prev) => prev.map((a) => a._id === item._id ? data.announcement : a));
    setOpenMenuId(null);
  };

  const handleDelete = async (item: Announcement) => {
    if (!window.confirm("Delete this announcement?")) return;
    const res = await fetch(`/api/owner/announcements?id=${item._id}`, { method: "DELETE" });
    if (!res.ok) return;
    setAnnouncements((prev) => prev.filter((a) => a._id !== item._id));
    setOpenMenuId(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <GoLiveModal
        isOpen={showGoLive}
        onClose={() => setShowGoLive(false)}
        onGoLive={handleGoLive}
        loading={goingLive}
      />

      {/* Composer modal */}
      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">New Announcement</h2>
                <p className="mt-0.5 text-xs text-slate-500">Sent to your store followers</p>
              </div>
              <button
                type="button"
                onClick={() => { setShowComposer(false); setCompError(""); }}
                className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <input
                value={compTitle}
                onChange={(e) => setCompTitle(e.target.value)}
                placeholder="Announcement title"
                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:border-[#65bbc5] focus:ring-1 focus:ring-[#65bbc5]"
              />
              <textarea
                value={compBody}
                onChange={(e) => setCompBody(e.target.value)}
                placeholder="Message details..."
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#65bbc5] focus:ring-1 focus:ring-[#65bbc5]"
              />
            </div>

            {compError && <p className="mt-2 text-xs text-red-500">{compError}</p>}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => { setShowComposer(false); setCompError(""); }}
                className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#65bbc5] py-2.5 text-sm font-semibold text-white hover:bg-[#53aab5] disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-slate-900">
          <Store className="h-5 w-5 text-[#65bbc5]" />
          <h1 className="text-xl font-semibold sm:text-2xl">{storeName}</h1>
        </div>

        {isLive ? (
          <button
            type="button"
            onClick={handleGoOffline}
            disabled={goingOffline}
            className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 sm:self-auto sm:px-6 disabled:opacity-60"
          >
            {goingOffline && <Loader2 className="h-4 w-4 animate-spin" />}
            End Live
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowGoLive(true)}
            disabled={storeStatus !== "active"}
            title={storeStatus !== "active" ? "Store must be approved to go live" : ""}
            className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-[#65bbc5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#53aab5] sm:self-auto sm:px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Go Live
          </button>
        )}
      </section>

      {/* Automated Email Templates */}
      <section data-tutorial-id="owner-communications-templates" className="mt-6">
        <h2 className="text-xl font-bold text-slate-900 sm:text-[25px]">
          Automated Email Templates &amp; Triggers
        </h2>
        <p className="mt-1 text-sm text-slate-500">System-wide notifications based on transaction events.</p>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {TEMPLATE_CARDS.map((item) => (
            <article key={item.key} className="min-h-[236px] rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <TemplateIcon icon={item.icon} />
                <button
                  type="button"
                  onClick={() => handleTemplateToggle(item.key)}
                  disabled={savingTemplate === item.key}
                  className="disabled:opacity-50"
                  aria-label={`Toggle ${item.title}`}
                >
                  {savingTemplate === item.key
                    ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    : <Toggle enabled={templates[item.key]} />
                  }
                </button>
              </div>

              <h3 className="mt-3 text-xl font-bold leading-tight text-slate-900 sm:text-[22px]">
                {item.title}
              </h3>
              <p className="mt-1 text-[12px] leading-[1.35] text-slate-500">{item.description}</p>

              <div className="mt-3 rounded-md bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">Trigger:</p>
                <p className="mt-1 text-[13px] font-semibold text-slate-600">{item.trigger}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Announcements table */}
      <section data-tutorial-id="owner-communications-announcements" className="mt-7">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 sm:text-[25px]">
              Store Announcements
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Send push notifications to your store followers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowComposer(true)}
            className="grid h-8 w-8 place-items-center rounded-full border border-slate-700 text-slate-700 transition hover:bg-slate-100"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[2.4fr_1.2fr_1.4fr_1fr_0.45fr] border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 sm:px-6">
                <div>Message Content</div>
                <div>Target Audience</div>
                <div>Schedule</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </div>

              {loadingAnn ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                </div>
              ) : announcements.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-slate-400">
                  No announcements yet. Click + to create one.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {announcements.map((item) => (
                    <div
                      key={item._id}
                      className="grid grid-cols-[2.4fr_1.2fr_1.4fr_1fr_0.45fr] items-center px-4 py-3 text-sm sm:px-6"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{item.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{item.body}</p>
                      </div>

                      <div>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold capitalize text-slate-600">
                          {item.audience}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        {item.status === "Live"
                          ? <Clock3 className="h-3.5 w-3.5" />
                          : <CalendarDays className="h-3.5 w-3.5" />
                        }
                        <span>
                          {item.status === "Live" ? "Live Now" : formatDate(item.createdAt)}
                        </span>
                      </div>

                      <div>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          item.status === "Live" ? "text-emerald-500" : "text-slate-400"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            item.status === "Live" ? "bg-emerald-500" : "bg-slate-300"
                          }`} />
                          {item.status}
                        </span>
                      </div>

                      <div className="relative flex justify-end">
                        <button
                          type="button"
                          onClick={() => setOpenMenuId((c) => c === item._id ? null : item._id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100"
                        >
                          <EllipsisVertical className="h-4 w-4" />
                        </button>

                        {openMenuId === item._id && (
                          <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                            >
                              <Power className="h-3.5 w-3.5" />
                              {item.status === "Live" ? "Set as Draft" : "Set Live"}
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
