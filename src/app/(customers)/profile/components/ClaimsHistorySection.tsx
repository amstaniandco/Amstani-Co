"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, X } from "lucide-react";
import Header from "../../../../components/pages/Header";

type ClaimMessage = {
  senderId: string;
  senderName: string;
  senderRole: "user" | "owner" | "admin";
  content: string;
  timestamp: string;
};

type ClaimItem = {
  name: string;
  image?: string | null;
  price: number;
  quantity: number;
  variant?: string;
};

type Claim = {
  _id: string;
  claimNumber: string;
  storeName: string;
  storeId: string;
  reason: string;
  description: string;
  items: ClaimItem[];
  status: "open" | "owner_responded" | "resolved" | "admin_escalated" | "awaiting_reorder";
  messages: ClaimMessage[];
  createdAt: string;
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  owner_responded: "Responded",
  resolved: "Resolved",
  admin_escalated: "Escalated",
  awaiting_reorder: "Reorder Needed",
};

const STATUS_DOT: Record<string, string> = {
  open: "bg-gray-400",
  owner_responded: "bg-green-500",
  resolved: "bg-blue-500",
  admin_escalated: "bg-red-500",
  awaiting_reorder: "bg-purple-500",
};

const STATUS_TEXT: Record<string, string> = {
  open: "text-gray-500",
  owner_responded: "text-green-600",
  resolved: "text-blue-600",
  admin_escalated: "text-red-500",
  awaiting_reorder: "text-purple-600",
};

const ISSUE_LABEL: Record<string, string> = {
  damaged: "Damaged item",
  missing: "Missing item",
  refund: "Refund",
  wrong: "Wrong item",
  other: "Other",
};

const CHAT_CLOSED_STATUSES = new Set(["resolved", "admin_escalated"]);

function formatDate(val: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
  }).format(new Date(val));
}

function timeAgo(val: string) {
  const diff = Date.now() - new Date(val).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(val));
}

export default function ClaimsHistorySection() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeClaim, setActiveClaim] = useState<Claim | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  async function loadClaims() {
    setLoading(true);
    try {
      const res = await fetch("/api/claims");
      if (res.ok) {
        const data = await res.json();
        setClaims(data.claims ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open && claims.length === 0) loadClaims();
  }, [open]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeClaim?.messages?.length]);

  async function sendMessage() {
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
      const updated = { ...activeClaim, messages: [...activeClaim.messages, message] };
      setActiveClaim(updated);
      setClaims((prev) => prev.map((c) => (c._id === activeClaim._id ? updated : c)));
      setChatInput("");
    } finally {
      setSending(false);
    }
  }

  const isChatClosed = activeClaim ? CHAT_CLOSED_STATUSES.has(activeClaim.status) : true;

  return (
    <>
      {/* Trigger button — shown in profile */}
      <section className="ui-panel mt-6 rounded-2xl bg-white p-6 shadow-xl dark:border dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Claims History</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              View your filed claims, track status, and chat with the store.
            </p>
          </div>
          <button
            onClick={() => { setOpen(true); loadClaims(); }}
            className="flex items-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition"
          >
            <MessageCircle className="h-4 w-4" />
            View Claims
          </button>
        </div>
      </section>

      {/* Full-screen panel overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
          <Header />
          <div className="flex flex-1 overflow-hidden">
          {/* Claims list sidebar */}
          <div
            className={`flex flex-col bg-white w-full max-w-sm border-r border-slate-200 ${activeClaim ? "hidden sm:flex" : "flex"}`}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="font-bold text-slate-900 text-lg">My Claims</h2>
              <button onClick={() => { setOpen(false); setActiveClaim(null); }} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading ? (
                <p className="text-sm text-slate-400 text-center py-8">Loading…</p>
              ) : claims.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <p className="text-sm text-slate-400">No claims filed yet.</p>
                  <Link href="/claims" className="text-sm font-semibold text-teal-600 hover:underline">
                    File a claim →
                  </Link>
                </div>
              ) : (
                claims.map((claim) => (
                  <button
                    key={claim._id}
                    onClick={() => setActiveClaim(claim)}
                    className={`w-full text-left rounded-xl p-3 border transition ${
                      activeClaim?._id === claim._id
                        ? "border-teal-400 bg-teal-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-700">#{claim.claimNumber}</span>
                      <span className="flex items-center gap-1">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS_DOT[claim.status] ?? "bg-gray-300"}`} />
                        <span className={`text-[10px] font-semibold ${STATUS_TEXT[claim.status] ?? "text-gray-500"}`}>
                          {STATUS_LABEL[claim.status] ?? claim.status}
                        </span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate">{claim.storeName}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {ISSUE_LABEL[claim.reason] ?? claim.reason} · {formatDate(claim.createdAt)}
                    </p>
                    {claim.messages.length > 0 && (
                      <p className="text-[11px] text-slate-500 mt-1 truncate italic">
                        "{claim.messages[claim.messages.length - 1].content}"
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="px-3 py-3 border-t border-slate-200">
              <Link
                href="/claims"
                className="block w-full text-center py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition"
              >
                + File New Claim
              </Link>
            </div>
          </div>

          {/* Chat / detail panel */}
          <div className={`flex-1 flex flex-col bg-white ${!activeClaim ? "hidden sm:flex items-center justify-center" : "flex"}`}>
            {!activeClaim ? (
              <div className="text-center space-y-2">
                <MessageCircle className="h-10 w-10 text-slate-300 mx-auto" />
                <p className="text-sm text-slate-400">Select a claim to view details and chat</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
                  <button
                    onClick={() => setActiveClaim(null)}
                    className="sm:hidden text-slate-400 hover:text-slate-700 mr-1"
                  >
                    ←
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">#{activeClaim.claimNumber}</h3>
                      <span className={`text-[10px] font-semibold ${STATUS_TEXT[activeClaim.status]}`}>
                        · {STATUS_LABEL[activeClaim.status]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {activeClaim.storeName} · {ISSUE_LABEL[activeClaim.reason] ?? activeClaim.reason}
                    </p>
                  </div>
                  <button
                    onClick={() => { setOpen(false); setActiveClaim(null); }}
                    className="hidden sm:block text-slate-400 hover:text-slate-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Disputed items strip */}
                {activeClaim.items?.length > 0 && (
                  <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex gap-2 overflow-x-auto">
                    {activeClaim.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 flex-shrink-0 bg-white rounded-lg border border-slate-200 px-2.5 py-1.5">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded" />
                        )}
                        <div>
                          <p className="text-[11px] font-semibold text-slate-800 max-w-[120px] truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400">×{item.quantity} · ${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* awaiting_reorder action */}
                {activeClaim.status === "awaiting_reorder" && (
                  <div className="mx-5 mt-3 rounded-xl bg-purple-50 border border-purple-200 px-4 py-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-purple-700 font-medium">
                      The store acknowledged the wrong item. Please reorder the correct product.
                    </p>
                    <Link
                      href={`/store?storeId=${activeClaim.storeId}`}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition"
                    >
                      Reorder ↗
                    </Link>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                  {activeClaim.messages.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">No messages yet.</p>
                  ) : (
                    activeClaim.messages.map((msg, i) => {
                      const isMe = msg.senderRole === "user";
                      return (
                        <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                              msg.senderRole === "admin"
                                ? "bg-red-50 border border-red-200 text-red-800"
                                : isMe
                                ? "bg-teal-500 text-white"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {!isMe && (
                              <p className="text-[10px] font-semibold opacity-70 mb-0.5">{msg.senderName}</p>
                            )}
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                            <p className="text-[10px] opacity-60 mt-1 text-right">{timeAgo(msg.timestamp)}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input or closed notice */}
                {isChatClosed ? (
                  <div className="px-5 py-3 border-t border-slate-200 text-center text-xs font-semibold text-slate-400">
                    {activeClaim.status === "resolved"
                      ? "This claim is resolved. Chat is closed."
                      : "This claim was escalated to admin. Chat is closed."}
                  </div>
                ) : (
                  <div className="px-5 py-3 border-t border-slate-200 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                      placeholder="Send a message to the store…"
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-400"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sending || !chatInput.trim()}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition"
                    >
                      Send
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          </div>
        </div>
      )}
    </>
  );
}
