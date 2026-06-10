"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Clock3, ExternalLink, FolderKanban, Store, TriangleAlert, X } from "lucide-react";

type ClaimMessage = {
  senderId: string;
  senderName: string;
  senderRole: "user" | "owner" | "admin";
  content: string;
  timestamp: string;
};

type ClaimItem = {
  productId: string;
  name: string;
  image?: string | null;
  price: number;
  quantity: number;
  variant?: string;
};

type Claim = {
  _id: string;
  claimNumber: string;
  customerName: string;
  storeId: string;
  storeName: string;
  orderId: string;
  orderNumber?: string;
  reason: string;
  description: string;
  items: ClaimItem[];
  mediaUrls?: string[];
  status: "open" | "owner_responded" | "resolved" | "admin_escalated" | "awaiting_reorder";
  messages: ClaimMessage[];
  resolveRequestPending?: boolean;
  resolveApprovedByAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
};

const STATUS_LABEL: Record<string, string> = {
  open: "OPEN",
  owner_responded: "RESPONDED",
  resolved: "RESOLVED",
  admin_escalated: "ESCALATED",
  awaiting_reorder: "AWAITING REORDER",
};

const STATUS_COLOR: Record<string, string> = {
  open: "text-slate-500",
  owner_responded: "text-[#0e8090]",
  resolved: "text-blue-500",
  admin_escalated: "text-red-500",
  awaiting_reorder: "text-purple-600",
};

// Returns the label and colour for the resolve button based on claim reason
function resolveButtonMeta(reason: string): { label: string; cls: string } {
  if (reason === "wrong") {
    return {
      label: "Resolve — Ask to Reorder",
      cls: "rounded-xl bg-purple-600 hover:bg-purple-700 px-3.5 py-2 text-[12px] font-semibold text-white transition disabled:opacity-60",
    };
  }
  if (reason === "refund") {
    return {
      label: "Mark Resolved",
      cls: "rounded-xl bg-slate-500 hover:bg-slate-600 px-3.5 py-2 text-[12px] font-semibold text-white transition disabled:opacity-60",
    };
  }
  // damaged / missing / other → resend
  return {
    label: "Resolve & Resend Item",
    cls: "rounded-xl bg-[#0e8090] hover:bg-[#0a6572] px-3.5 py-2 text-[12px] font-semibold text-white transition disabled:opacity-60",
  };
}

const ISSUE_LABEL: Record<string, string> = {
  damaged: "Damaged item",
  missing: "Missing item",
  refund: "Refund",
  wrong: "Wrong item",
  other: "Other",
};

function dueDate(createdAt: string): string {
  const d = new Date(createdAt);
  d.setDate(d.getDate() + 4);
  return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
}

export default function OwnerClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [storeName, setStoreName] = useState("");
  const [stats, setStats] = useState({ total: 0, escalated: 0 });
  const [loading, setLoading] = useState(true);
  const [activeClaim, setActiveClaim] = useState<Claim | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [requestingResolve, setRequestingResolve] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  async function loadClaims() {
    try {
      const res = await fetch("/api/owner/claims");
      if (!res.ok) return;
      const data = await res.json();
      setClaims(data.claims || []);
      setStoreName(data.storeName || "");
      setStats(data.stats || { total: 0, escalated: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadClaims(); }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeClaim?.messages]);

  async function handleSendMessage() {
    if (!chatInput.trim() || !activeClaim) return;
    setSending(true);
    try {
      const res = await fetch(`/api/claims/${activeClaim._id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: chatInput.trim() }),
      });
      if (!res.ok) return;
      const { message } = await res.json();
      const updated: Claim = {
        ...activeClaim,
        status: "owner_responded",
        messages: [...activeClaim.messages, message],
      };
      setActiveClaim(updated);
      setClaims((prev) => prev.map((c) => (c._id === activeClaim._id ? updated : c)));
      setChatInput("");
    } finally {
      setSending(false);
    }
  }

  async function handleResolve(claimId: string) {
    setResolving(true);
    try {
      const res = await fetch(`/api/owner/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      if (!res.ok) return;
      setActiveClaim(null);
      await loadClaims();
    } finally {
      setResolving(false);
    }
  }

  async function handleRequestResolve(claimId: string) {
    setRequestingResolve(true);
    try {
      const res = await fetch(`/api/owner/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request_resolve" }),
      });
      if (!res.ok) return;
      await loadClaims();
      // Update activeClaim state optimistically
      setActiveClaim((prev) => prev ? { ...prev, resolveRequestPending: true } : prev);
    } finally {
      setRequestingResolve(false);
    }
  }

  const summaryCards = [
    {
      title: "TOTAL ACTIVE CLAIMS",
      value: loading ? "—" : String(stats.total),
      note: "Monitor all open disputes",
      noteColor: "text-emerald-500",
      tone: "teal" as const,
      icon: FolderKanban,
    },
    {
      title: "ESCALATIONS PENDING",
      value: loading ? "—" : String(stats.escalated),
      note: "* Requires immediate intervention",
      noteColor: "text-red-600",
      tone: "red" as const,
      icon: TriangleAlert,
    },
    {
      title: "RESPONSE DEADLINE",
      value: "4 days",
      note: "◔ Claims auto-escalate after 4 days",
      noteColor: "text-slate-500",
      tone: "slate" as const,
      icon: Clock3,
    },
  ];

  return (
    <>
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-slate-900">
          <Store className="h-5 w-5 text-[#65bbc5]" />
          <h1 className="text-xl font-semibold sm:text-2xl">
            {storeName || "Your Store"}
          </h1>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-[26px] font-bold text-slate-900">Claim and Resolution Centre</h2>
        <p className="mt-1 text-sm text-slate-500">
          Monitor customer disputes. Claims ignored for 4+ days are automatically escalated to admin.
        </p>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {summaryCards.map((card) => {
            const borderTone =
              card.tone === "red"
                ? "border-red-200 bg-red-50"
                : "border-slate-200 bg-white";
            const iconTone =
              card.tone === "red"
                ? "bg-red-100 text-red-500"
                : "bg-slate-100 text-slate-500";
            const valueTone = card.tone === "red" ? "text-red-700" : "text-slate-900";
            return (
              <article
                key={card.title}
                className={`rounded-2xl border ${borderTone} px-4 py-4 shadow-[0_8px_22px_rgba(15,23,42,0.04)]`}
              >
                <div className={`grid h-9 w-9 place-items-center rounded-lg ${iconTone}`}>
                  <card.icon className="h-4 w-4" />
                </div>
                <p className="mt-3 text-[11px] font-bold tracking-[0.08em] text-slate-500">
                  {card.title}
                </p>
                <p className={`mt-1 text-[32px] font-extrabold leading-none ${valueTone}`}>
                  {card.value}
                </p>
                <p className={`mt-3 text-[11px] font-semibold ${card.noteColor}`}>
                  {card.note}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2 text-slate-900">
              <div className="grid h-5 w-5 place-items-center rounded-sm bg-[#0e8090] text-white">
                <span className="text-[11px] font-bold">▦</span>
              </div>
              <h3 className="text-[15px] font-bold">Claims & Escalations</h3>
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-slate-400">Loading claims…</div>
          ) : claims.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-400">
              No claims for your store yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[920px]">
                <div className="grid grid-cols-[1fr_1.15fr_1.05fr_0.95fr_0.9fr_1.35fr] border-t border-slate-200 bg-slate-50 px-4 py-4 text-[11px] font-extrabold uppercase leading-4 tracking-[0.08em] text-slate-700 sm:px-5">
                  <div>Claim ID</div>
                  <div>Customer</div>
                  <div>Issue Type</div>
                  <div>Due Date</div>
                  <div>Status</div>
                  <div>Action</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {claims.map((claim) => {
                    const isEscalated = claim.status === "admin_escalated";
                    return (
                      <div
                        key={claim._id}
                        className={`grid grid-cols-[1fr_1.15fr_1.05fr_0.95fr_0.9fr_1.35fr] items-center px-4 py-5 text-sm sm:px-5 ${
                          isEscalated ? "border-l-4 border-red-500 bg-red-50/35" : ""
                        }`}
                      >
                        <div>
                          <div className="text-[12px] font-semibold text-slate-600">#{claim.claimNumber}</div>
                          {claim.orderNumber && (
                            <div className="text-[11px] text-slate-400 mt-0.5">Order: {claim.orderNumber}</div>
                          )}
                        </div>
                        <div className="text-[12px] text-slate-700">{claim.customerName}</div>
                        <div>
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[12px] text-slate-500">
                            {ISSUE_LABEL[claim.reason] || claim.reason}
                          </span>
                        </div>
                        <div className="text-[12px] text-slate-700">{dueDate(claim.createdAt)}</div>
                        <div
                          className={`text-[12px] font-bold tracking-[0.02em] ${STATUS_COLOR[claim.status] || "text-slate-500"}`}
                        >
                          {STATUS_LABEL[claim.status] || claim.status.toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => setActiveClaim(claim)}
                            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50"
                          >
                            View / Chat
                          </button>
                          {claim.status !== "resolved" && claim.status !== "awaiting_reorder" && claim.status !== "admin_escalated" && (
                            claim.resolveApprovedByAdmin ? (() => {
                              const { label, cls } = resolveButtonMeta(claim.reason);
                              return (
                                <button onClick={() => handleResolve(claim._id)} disabled={resolving} className={cls}>
                                  {label}
                                </button>
                              );
                            })() : claim.resolveRequestPending ? (
                              <span className="rounded-xl bg-amber-100 px-3.5 py-2 text-[12px] font-semibold text-amber-700">
                                Awaiting Admin Approval
                              </span>
                            ) : (
                              <button
                                onClick={() => handleRequestResolve(claim._id)}
                                disabled={requestingResolve}
                                className="rounded-xl bg-slate-700 hover:bg-slate-800 px-3.5 py-2 text-[12px] font-semibold text-white transition disabled:opacity-60"
                              >
                                Request Admin Approval
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Claim Detail + Chat Modal */}
      {activeClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-slate-900">#{activeClaim.claimNumber}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeClaim.customerName} · {ISSUE_LABEL[activeClaim.reason] || activeClaim.reason}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-bold tracking-wide ${STATUS_COLOR[activeClaim.status] || "text-slate-500"}`}
                >
                  {STATUS_LABEL[activeClaim.status]}
                </span>
                {activeClaim.orderId && (
                  <Link
                    href={`/orders?orderId=${activeClaim.orderId}`}
                    title="View Order"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Order
                  </Link>
                )}
                <button
                  onClick={() => setActiveClaim(null)}
                  className="ml-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Disputed Items */}
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Disputed Items
              </p>
              <div className="flex flex-col gap-2">
                {activeClaim.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{item.name}</p>
                      {item.variant && (
                        <p className="text-xs text-slate-400">{item.variant}</p>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                      ${item.price} × {item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Evidence */}
            {activeClaim.mediaUrls && activeClaim.mediaUrls.length > 0 && (
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Photo Evidence</p>
                <div className="flex flex-wrap gap-2">
                  {activeClaim.mediaUrls.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setLightboxUrl(url)}
                      className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 hover:opacity-80 transition-opacity"
                    >
                      <img src={url} alt={`Evidence ${i + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
              {activeClaim.messages.map((msg, i) => {
                const isOwner = msg.senderRole === "owner";
                return (
                  <div key={i} className={`flex ${isOwner ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.senderRole === "admin"
                          ? "bg-red-50 border border-red-200 text-red-800"
                          : isOwner
                          ? "bg-[#0e8090] text-white"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      <p className="text-[10px] font-semibold opacity-70 mb-1">{msg.senderName}</p>
                      <p>{msg.content}</p>
                      <p className="text-[10px] opacity-60 mt-1 text-right">
                        {new Date(msg.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input + resolution action */}
            {activeClaim.status !== "resolved" && activeClaim.status !== "awaiting_reorder" && activeClaim.status !== "admin_escalated" && (
              <div className="px-5 py-3 border-t border-slate-200 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    placeholder="Reply to customer…"
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0e8090]"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !chatInput.trim()}
                    className="px-4 py-2 bg-[#0e8090] hover:bg-[#0a6572] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition"
                  >
                    Send
                  </button>
                </div>
                {activeClaim.resolveApprovedByAdmin ? (() => {
                  const { label, cls } = resolveButtonMeta(activeClaim.reason);
                  return (
                    <button
                      onClick={() => handleResolve(activeClaim._id)}
                      disabled={resolving}
                      className={`w-full py-2 text-xs font-semibold transition ${cls}`}
                    >
                      {resolving ? "Processing…" : label}
                    </button>
                  );
                })() : activeClaim.resolveRequestPending ? (
                  <div className="w-full py-2 rounded-xl bg-amber-50 border border-amber-200 text-center text-xs font-semibold text-amber-700">
                    Awaiting Admin Approval to Resolve
                  </div>
                ) : (
                  <button
                    onClick={() => handleRequestResolve(activeClaim._id)}
                    disabled={requestingResolve}
                    className="w-full py-2 rounded-xl bg-slate-700 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-semibold transition"
                  >
                    {requestingResolve ? "Requesting…" : "Request Admin Approval to Resolve"}
                  </button>
                )}
              </div>
            )}
            {activeClaim.status === "admin_escalated" && (
              <div className="px-5 py-3 border-t border-slate-200 text-xs text-red-500 text-center font-semibold">
                This claim has been escalated to admin. You can no longer respond directly.
              </div>
            )}
            {activeClaim.status === "awaiting_reorder" && (
              <div className="px-5 py-3 border-t border-slate-200 space-y-2">
                <p className="text-xs text-purple-600 text-center font-semibold">
                  Customer has been asked to reorder the correct product.
                </p>
                <button
                  onClick={() => handleResolve(activeClaim._id)}
                  disabled={resolving}
                  className="w-full py-2 rounded-xl bg-[#0e8090] hover:bg-[#0a6572] disabled:opacity-60 text-white text-xs font-semibold transition"
                >
                  {resolving ? "Resolving…" : "Mark as Resolved"}
                </button>
              </div>
            )}
            {activeClaim.status === "resolved" && (
              <div className="px-5 py-3 border-t border-slate-200 text-xs text-blue-500 text-center font-semibold">
                This claim is resolved.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightboxUrl}
            alt="Full view"
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
