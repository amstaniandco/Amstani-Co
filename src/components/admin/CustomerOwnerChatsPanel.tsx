"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ReadOnlyMessage = {
  _id: string;
  sender: "customer" | "owner";
  senderName: string;
  text: string;
  createdAt: string;
  deleted?: boolean;
  edited?: boolean;
  replyTo?: {
    _id: string;
    senderName: string;
    text: string;
    deleted?: boolean;
  };
};

type CustomerThread = {
  _id: string;
  customerName: string;
  storeName: string;
  lastMessage: string;
  updatedAt: string;
};

function previewText(message: string) {
  return message || "No messages yet";
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function ReadOnlyBubble({ message }: { message: ReadOnlyMessage }) {
  const isOwner = message.sender === "owner";

  return (
    <div className={`flex items-end gap-1.5 ${isOwner ? "justify-end" : "justify-start"}`}>
      {!isOwner && (
        <div className="h-7 w-7 flex-shrink-0 rounded-full bg-[#dfe7ec] flex items-center justify-center text-xs font-bold text-slate-600">
          C
        </div>
      )}

      <div className={`flex max-w-[260px] flex-col gap-0.5 sm:max-w-[360px] ${isOwner ? "items-end" : "items-start"}`}>
        {message.replyTo && (
          <div className="w-full rounded-lg border-l-2 border-slate-400 bg-slate-100 px-2 py-1 text-xs text-slate-500">
            <p className="font-semibold">{message.replyTo.senderName}</p>
            <p className="truncate">
              {message.replyTo.deleted ? <em>This message was deleted</em> : message.replyTo.text}
            </p>
          </div>
        )}

        {message.deleted ? (
          <div className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm italic text-slate-400">
            This message was deleted
          </div>
        ) : (
          <div
            className={`rounded-2xl px-4 py-2.5 text-sm ${
              isOwner
                ? "rounded-br-sm bg-[#54b9c9] text-white"
                : "rounded-bl-sm bg-[#e8ecef] text-slate-700"
            }`}
          >
            <p className="mb-0.5 text-[10px] font-semibold opacity-60">{message.senderName}</p>
            <p className="leading-relaxed">{message.text}</p>
            {message.edited && <p className="mt-0.5 text-[10px] opacity-60">(edited)</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerOwnerChatsPanel() {
  const [threads, setThreads] = useState<CustomerThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [messages, setMessages] = useState<ReadOnlyMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async (threadId: string) => {
    if (!threadId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customer-conversations?chatId=${threadId}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/admin/customer-conversations")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        const loadedThreads: CustomerThread[] = data?.chats ?? [];
        setThreads(loadedThreads);
        if (loadedThreads[0]) {
          setActiveThreadId(loadedThreads[0]._id);
          loadMessages(loadedThreads[0]._id);
        }
      })
      .catch(() => {});
  }, [loadMessages]);

  useEffect(() => {
    const box = messagesRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages]);

  const activeThread = threads.find((thread) => thread._id === activeThreadId);

  return (
    <section className="overflow-hidden rounded-xl border border-[#d8e1e7] bg-white shadow-[0_10px_25px_rgba(15,23,42,0.04)] sm:rounded-[18px]">
      <div className="flex flex-col gap-2 border-b border-[#e5edf1] bg-[#f8fbfc] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <h3 className="text-sm font-semibold text-slate-800">Customer Owner Conversations</h3>
        <span className="max-w-full truncate rounded-full border border-[#d7e0e6] bg-white px-3 py-1 text-xs text-slate-600 sm:max-w-[260px]">
          View only
        </span>
      </div>

      <div className="grid border-b border-[#edf2f5] md:grid-cols-[260px_1fr]" style={{ minHeight: 400 }}>
        <div className="hidden border-b border-[#edf2f5] bg-[#f9fbfc] md:flex md:flex-col md:border-b-0 md:border-r overflow-y-auto" style={{ maxHeight: 400 }}>
          {threads.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-slate-400">No customer conversations yet.</p>
          ) : (
            threads.map((thread) => {
              const isActive = thread._id === activeThreadId;
              return (
                <button
                  key={thread._id}
                  type="button"
                  onClick={() => {
                    setActiveThreadId(thread._id);
                    loadMessages(thread._id);
                  }}
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
                      {thread.customerName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-900">{thread.customerName}</p>
                      <p className="truncate text-[10px] text-slate-500">{thread.storeName}</p>
                      <p className="mt-1 truncate text-[10px] text-slate-400">{previewText(thread.lastMessage)}</p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="flex flex-col bg-[#fdfefe]">
          <div className="border-b border-[#edf2f5] px-3 py-3 sm:px-4">
            <p className="text-xs font-semibold text-slate-800">
              {activeThread ? `${activeThread.customerName} and ${activeThread.storeName}` : "Select a conversation"}
            </p>
            {activeThread?.updatedAt && (
              <p className="mt-1 text-[10px] text-slate-400">Updated {formatTime(activeThread.updatedAt)}</p>
            )}
          </div>

          <div ref={messagesRef} className="overflow-y-auto space-y-3 px-3 py-4 sm:px-4 sm:py-5" style={{ height: 320 }}>
            {!activeThreadId ? (
              <p className="py-8 text-center text-xs text-slate-400">No conversation selected.</p>
            ) : loading ? (
              <p className="py-8 text-center text-xs text-slate-400">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No messages yet.</p>
            ) : (
              messages.map((message) => <ReadOnlyBubble key={message._id} message={message} />)
            )}
          </div>
        </div>
      </div>

      <div className="block border-t border-[#edf2f5] bg-[#f9fbfc] md:hidden">
        <div className="flex gap-2 overflow-x-auto px-3 py-3 sm:px-4">
          {threads.length === 0 ? (
            <span className="py-1 text-xs text-slate-400">No customer conversations</span>
          ) : (
            threads.map((thread) => (
              <button
                key={thread._id}
                type="button"
                onClick={() => {
                  setActiveThreadId(thread._id);
                  loadMessages(thread._id);
                }}
                className={`flex-shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  thread._id === activeThreadId
                    ? "border-[#54b9c9] bg-[#e8f4f7] text-[#2f7f8d]"
                    : "border-[#dfe7ec] bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {thread.customerName}
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
