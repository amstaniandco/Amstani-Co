"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Message = {
  _id: string;
  sender: "admin" | "owner";
  senderName: string;
  text: string;
  createdAt: string;
};

type StoreEntry = {
  id: string;
  name: string;
};

type StoreChatPanelProps = {
  title: string;
  rightLabel: string;
  /** All stores currently open in the chat sidebar */
  stores: StoreEntry[];
  /** The store whose thread is shown in the main area */
  activeStoreId: string;
  onSelectStore: (id: string) => void;
  panelType?: "customer" | "owner";
};

function TypingDots() {
  return (
    <div className="flex items-end gap-2 justify-start">
      <div className="h-7 w-7 flex-shrink-0 rounded-full bg-[#dfe7ec] flex items-center justify-center text-xs font-bold text-slate-600">
        O
      </div>
      <div className="bg-[#e8ecef] rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "160ms" }} />
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "320ms" }} />
      </div>
    </div>
  );
}

export default function StoreChatPanel({
  title,
  rightLabel,
  stores,
  activeStoreId,
  onSelectStore,
  panelType = "customer",
}: StoreChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const esRef = useRef<EventSource | null>(null);

  // Load messages when active store changes
  const loadMessages = useCallback(async (sid: string) => {
    setLoading(true);
    setMessages([]);
    setOtherTyping(false);
    try {
      const res = await fetch(`/api/conversations/${sid}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages ?? []);
        return (data.messages as Message[])[data.messages.length - 1]?._id ?? "";
      }
    } catch {}
    finally { setLoading(false); }
    return "";
  }, []);

  // Start SSE stream
  const startStream = useCallback((sid: string, afterId: string) => {
    esRef.current?.close();
    const url = `/api/conversations/${sid}/stream${afterId ? `?after=${afterId}` : ""}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "message") {
          setMessages((prev) =>
            prev.find((m) => m._id === data.message._id) ? prev : [...prev, data.message]
          );
        } else if (data.type === "typing") {
          setOtherTyping(data.isTyping);
        }
      } catch {}
    };
  }, []);

  useEffect(() => {
    if (!activeStoreId || panelType !== "owner") return;
    loadMessages(activeStoreId).then((lastId) => {
      startStream(activeStoreId, lastId);
    });
    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, [activeStoreId, panelType, loadMessages, startStream]);

  // Scroll to bottom on new messages or typing indicator change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (!activeStoreId) return;
      fetch(`/api/conversations/${activeStoreId}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTyping }),
      }).catch(() => {});
    },
    [activeStoreId]
  );

  const handleInputChange = (value: string) => {
    setInputText(value);
    sendTypingStatus(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTypingStatus(false), 3000);
  };

  async function handleSend() {
    const trimmed = inputText.trim();
    if (!trimmed || !activeStoreId || sending) return;
    clearTimeout(typingTimeoutRef.current);
    sendTypingStatus(false);
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${activeStoreId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.find((m) => m._id === data.message._id) ? prev : [...prev, data.message]
        );
        setInputText("");
      }
    } finally {
      setSending(false);
    }
  }

  const activeStore = stores.find((s) => s.id === activeStoreId);

  return (
    <section className="overflow-hidden rounded-xl border border-[#d8e1e7] bg-white shadow-[0_10px_25px_rgba(15,23,42,0.04)] sm:rounded-[18px]">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-[#e5edf1] bg-[#f8fbfc] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <span className="max-w-full truncate rounded-full border border-[#d7e0e6] bg-white px-3 py-1 text-xs text-slate-600 sm:max-w-[260px]">
          {activeStore ? activeStore.name : rightLabel}
        </span>
      </div>

      <div className="grid border-b border-[#edf2f5] md:grid-cols-[220px_1fr]" style={{ minHeight: 400 }}>
        {/* Sidebar — stacked store conversations */}
        <div className="hidden border-b border-[#edf2f5] bg-[#f9fbfc] md:flex md:flex-col md:border-b-0 md:border-r overflow-y-auto" style={{ maxHeight: 400 }}>
          {stores.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-slate-400">
              {panelType === "owner"
                ? 'Click "Contact Owner" on any store to open a conversation.'
                : "No conversations yet."}
            </p>
          ) : (
            stores.map((store) => {
              const isActive = store.id === activeStoreId;
              return (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => onSelectStore(store.id)}
                  className={`w-full border-b border-[#edf2f5] px-4 py-3 text-left transition ${
                    isActive ? "bg-[#e8f4f7] hover:bg-[#e0eef2]" : "bg-white hover:bg-[#f5f7f9]"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                        isActive ? "bg-[#54b9c9] text-white" : "bg-[#dfe7ec] text-slate-700"
                      }`}
                    >
                      {store.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 truncate">{store.name}</p>
                      <p className="mt-1 text-[10px] text-slate-400">{isActive ? "● Active" : "Open chat"}</p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Main chat area */}
        <div className="flex flex-col bg-[#fdfefe]">
          {/* Messages — fixed height, internal scroll only */}
          <div
            className="overflow-y-auto space-y-3 px-3 py-4 sm:px-4 sm:py-5"
            style={{ height: 320 }}
          >
            {!activeStoreId ? (
              <p className="text-xs text-center text-slate-400 py-8">
                {panelType === "owner"
                  ? 'Click "Contact Owner" to start a conversation.'
                  : "Select a store to view conversations."}
              </p>
            ) : loading ? (
              <p className="text-xs text-center text-slate-400 py-8">Loading messages…</p>
            ) : messages.length === 0 ? (
              <p className="text-xs text-center text-slate-400 py-8">No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex items-end gap-2 ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                >
                  {/* Owner avatar — left side */}
                  {msg.sender === "owner" && (
                    <div className="h-7 w-7 flex-shrink-0 rounded-full bg-[#dfe7ec] flex items-center justify-center text-xs font-bold text-slate-600">
                      O
                    </div>
                  )}
                  <div
                    className={`max-w-[260px] rounded-2xl px-4 py-2.5 ${
                      msg.sender === "admin"
                        ? "rounded-br-sm bg-[#54b9c9] text-white"
                        : "rounded-bl-sm bg-[#e8ecef] text-slate-700"
                    }`}
                  >
                    {msg.sender === "owner" && (
                      <p className="text-[10px] font-semibold mb-1 opacity-60">{msg.senderName}</p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))
            )}
            {otherTyping && <TypingDots />}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {panelType === "owner" && activeStoreId && (
            <div className="border-t border-[#edf2f5] bg-[#fdfefe] px-3 py-3 sm:px-4 sm:py-4">
              <div className="flex items-center gap-2 rounded-lg border border-[#dce5ea] bg-white px-3 py-2.5 focus-within:border-[#54b9c9] focus-within:ring-1 focus-within:ring-[#54b9c9]">
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  placeholder="Type a message…"
                  value={inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || !inputText.trim()}
                  className="flex-shrink-0 rounded-md bg-[#54b9c9] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-[#489fad] disabled:opacity-50"
                >
                  {sending ? "…" : "Send"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile store tabs */}
      <div className="block border-t border-[#edf2f5] bg-[#f9fbfc] md:hidden">
        <div className="flex gap-2 overflow-x-auto px-3 py-3 sm:px-4">
          {stores.length === 0 ? (
            <span className="text-xs text-slate-400 py-1">No open conversations</span>
          ) : (
            stores.map((store) => (
              <button
                key={store.id}
                type="button"
                onClick={() => onSelectStore(store.id)}
                className={`flex-shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  store.id === activeStoreId
                    ? "border-[#54b9c9] bg-[#e8f4f7] text-[#2f7f8d]"
                    : "border-[#dfe7ec] bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {store.name}
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
