"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Clock3,
  Mic,
  Plus,
  Search,
  SendHorizontal,
  Store,
  Users,
} from "lucide-react";
import ownerCard from "@/src/app/imagess/ownercard.png";
import MessageBubble, { type Message as ChatMessage } from "@/src/components/chat/MessageBubble";

function FacebookBrandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        fill="#fff"
        d="M13.6 7H15V4.5h-1.7C10.9 4.5 9.6 6 9.6 8v1.8H8v2.7h1.6v6h3v-6h2.2l.3-2.7h-2.5V8.4c0-.8.4-1.4 1-1.4Z"
      />
    </svg>
  );
}

function InstagramBrandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <defs>
        <linearGradient id="instagramGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F58529" />
          <stop offset="45%" stopColor="#DD2A7B" />
          <stop offset="100%" stopColor="#515BD4" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="url(#instagramGradient)" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="#fff" />
      <rect x="4.8" y="4.8" width="14.4" height="14.4" rx="4.6" fill="none" stroke="#fff" strokeWidth="1.4" />
    </svg>
  );
}

function TikTokBrandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <rect x="1.5" y="1.5" width="21" height="21" rx="5" fill="#000" />
      <path
        fill="#fff"
        d="M15.6 6.1c.6 1.2 1.7 2 3 2.2v2.1c-1.3-.1-2.4-.5-3.4-1.2v4.9c0 2.3-1.8 4-4 4s-3.9-1.8-3.9-4 1.7-4 3.9-4h.2v2.2h-.2c-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8 1.8-.8 1.8-1.8V6h2.6Z"
      />
    </svg>
  );
}

function WhatsAppBrandIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#25D366" />
      <path fill="#25D366" d="M7.1 19.2 8 16.7l-1.4-1.1.5 3.6Z" />
      <circle cx="12" cy="11.5" r="5.2" fill="#fff" />
      <path
        fill="#25D366"
        d="M13.4 13.8c-.2.2-1.2-.2-2.1-1.1-.8-.8-1.4-1.9-1.1-2.1l.4-.2c.1-.1.2-.2.2-.4l-.2-.8c-.1-.3-.2-.4-.5-.4h-.3c-.2 0-.4.1-.6.3-.7.8-.6 1.9.2 3 .9 1.4 2.2 2.4 3.6 2.9 1 .3 1.9.2 2.5-.4.2-.2.3-.4.3-.6v-.3c0-.2-.1-.4-.4-.5l-.8-.2c-.2 0-.3 0-.4.2l-.2.4Z"
      />
    </svg>
  );
}

type ChannelItem = {
  title: string;
  icon: React.ComponentType;
};

type CustomerThread = {
  _id: string;
  customerName: string;
  lastMessage: string;
  updatedAt: string;
};

const channels: ChannelItem[] = [
  { title: "facebook Live", icon: FacebookBrandIcon },
  { title: "Instagram Live", icon: InstagramBrandIcon },
  { title: "Tiktok Live", icon: TikTokBrandIcon },
  { title: "WhatsApp Call", icon: WhatsAppBrandIcon },
];

function messagePreview(message?: ChatMessage | null) {
  if (!message) return "No messages yet";
  return message.deleted ? "This message was deleted" : message.text;
}

export default function OwnerChatsPage() {
  const [activeThread, setActiveThread] = useState<"admin" | "customer">("admin");
  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("My Store");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [customerThreads, setCustomerThreads] = useState<CustomerThread[]>([]);
  const [selectedCustomerThread, setSelectedCustomerThread] = useState<CustomerThread | null>(null);
  const [customerMessages, setCustomerMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [customerReplyText, setCustomerReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [customerReplyingTo, setCustomerReplyingTo] = useState<ChatMessage | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
        } else if (data.type === "update") {
          setMessages((prev) =>
            prev.map((m) => m._id === data.message._id ? data.message : m)
          );
        } else if (data.type === "typing") {
          setAdminTyping(data.isTyping);
        }
      } catch {}
    };
  }, []);

  const startCustomerStream = useCallback((sid: string, chatId: string, afterId: string) => {
    esRef.current?.close();
    const params = new URLSearchParams({ chatId });
    if (afterId) params.set("after", afterId);
    const es = new EventSource(`/api/customer-conversations/${sid}/stream?${params.toString()}`);
    esRef.current = es;
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "message") {
          setCustomerMessages((prev) =>
            prev.find((m) => m._id === data.message._id) ? prev : [...prev, data.message]
          );
          setCustomerThreads((prev) =>
            prev.map((thread) =>
              thread._id === chatId
                ? { ...thread, lastMessage: data.message.text, updatedAt: data.message.createdAt }
                : thread
            )
          );
        } else if (data.type === "update") {
          setCustomerMessages((prev) =>
            prev.map((m) => m._id === data.message._id ? data.message : m)
          );
          setCustomerThreads((prev) =>
            prev.map((thread) =>
              thread._id === chatId
                ? { ...thread, lastMessage: messagePreview(data.message), updatedAt: data.message.createdAt }
                : thread
            )
          );
        }
      } catch {}
    };
  }, []);

  const loadCustomerThreads = useCallback(async () => {
    const res = await fetch("/api/customer-conversations/owner-store");
    if (!res.ok) return;
    const data = await res.json();
    setCustomerThreads(data.chats ?? []);
  }, []);

  const openAdminThread = useCallback(() => {
    setActiveThread("admin");
    if (storeId) {
      startStream(storeId, messages.at(-1)?._id ?? "");
    }
  }, [messages, startStream, storeId]);

  const openCustomerThread = useCallback(
    async (thread: CustomerThread) => {
      if (!storeId) return;
      setActiveThread("customer");
      setSelectedCustomerThread(thread);
      const res = await fetch(`/api/customer-conversations/${storeId}?chatId=${thread._id}`);
      if (!res.ok) return;
      const data = await res.json();
      const loadedMessages: ChatMessage[] = data.messages ?? [];
      setCustomerMessages(loadedMessages);
      startCustomerStream(storeId, thread._id, loadedMessages.at(-1)?._id ?? "");
    },
    [startCustomerStream, storeId]
  );

  useEffect(() => {
    fetch("/api/conversations/owner-store")
      .then((r) => r.json())
      .then(async (d) => {
        if (!d.storeId) return;
        setStoreId(d.storeId);
        setStoreName(d.storeName ?? "My Store");
        const res = await fetch(`/api/conversations/${d.storeId}`);
        if (res.ok) {
          const data = await res.json();
          const msgs: ChatMessage[] = data.messages ?? [];
          setMessages(msgs);
          const lastId = msgs[msgs.length - 1]?._id ?? "";
          startStream(d.storeId, lastId);
        }
        loadCustomerThreads();
      })
      .catch(() => {});
    return () => { esRef.current?.close(); };
  }, [loadCustomerThreads, startStream]);

  useEffect(() => {
    const box = messagesRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages, customerMessages, adminTyping]);

  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (!storeId) return;
      fetch(`/api/conversations/${storeId}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTyping }),
      }).catch(() => {});
    },
    [storeId]
  );

  const handleReplyChange = (value: string) => {
    setReplyText(value);
    sendTypingStatus(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTypingStatus(false), 3000);
  };

  const handleEdit = async (msgId: string, newText: string) => {
    const res = await fetch(`/api/conversations/${storeId}/${msgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "edit", text: newText }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => prev.map((m) => m._id === msgId ? data.message : m));
    }
  };

  const handleDelete = async (msgId: string) => {
    const res = await fetch(`/api/conversations/${storeId}/${msgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete" }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => prev.map((m) => m._id === msgId ? data.message : m));
    }
  };

  const handleCustomerEdit = async (msgId: string, newText: string) => {
    if (!storeId) return;
    const res = await fetch(`/api/customer-conversations/${storeId}/${msgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "edit", text: newText }),
    });
    if (res.ok) {
      const data = await res.json();
      setCustomerMessages((prev) => prev.map((m) => m._id === msgId ? data.message : m));
      setCustomerThreads((prev) =>
        prev.map((thread) =>
            thread._id === selectedCustomerThread?._id
            ? { ...thread, lastMessage: messagePreview(data.message), updatedAt: data.message.createdAt }
            : thread
        )
      );
    }
  };

  const handleCustomerDelete = async (msgId: string) => {
    if (!storeId) return;
    const res = await fetch(`/api/customer-conversations/${storeId}/${msgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete" }),
    });
    if (res.ok) {
      const data = await res.json();
      setCustomerMessages((prev) => prev.map((m) => m._id === msgId ? data.message : m));
      if (customerReplyingTo?._id === msgId) setCustomerReplyingTo(data.message);
      setCustomerThreads((prev) =>
        prev.map((thread) =>
          thread._id === selectedCustomerThread?._id
            ? { ...thread, lastMessage: messagePreview(data.message), updatedAt: data.message.createdAt }
            : thread
        )
      );
    }
  };

  const handleSendReply = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = replyText.trim();
    if (!trimmed || !storeId || sending) return;
    clearTimeout(typingTimeoutRef.current);
    sendTypingStatus(false);
    setSending(true);
    try {
      const body: Record<string, unknown> = { text: trimmed };
      if (replyingTo) {
        body.replyTo = {
          _id: replyingTo._id,
          senderName: replyingTo.senderName,
          text: replyingTo.text,
          deleted: replyingTo.deleted ?? false,
        };
      }
      const res = await fetch(`/api/conversations/${storeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.find((m) => m._id === data.message._id) ? prev : [...prev, data.message]
        );
        setReplyText("");
        setReplyingTo(null);
      }
    } finally {
      setSending(false);
    }
  };

  const handleSendCustomerReply = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = customerReplyText.trim();
    if (!trimmed || !storeId || !selectedCustomerThread || sending) return;

    setSending(true);
    try {
      const body: Record<string, unknown> = {
        text: trimmed,
        chatId: selectedCustomerThread._id,
      };
      if (customerReplyingTo) {
        body.replyTo = {
          _id: customerReplyingTo._id,
          senderName: customerReplyingTo.senderName,
          text: customerReplyingTo.text,
          deleted: customerReplyingTo.deleted ?? false,
        };
      }

      const res = await fetch(`/api/customer-conversations/${storeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setCustomerMessages((prev) =>
          prev.find((m) => m._id === data.message._id) ? prev : [...prev, data.message]
        );
        setCustomerThreads((prev) =>
          prev.map((thread) =>
              thread._id === selectedCustomerThread._id
              ? { ...thread, lastMessage: messagePreview(data.message), updatedAt: data.message.createdAt }
              : thread
          )
        );
        setCustomerReplyText("");
        setCustomerReplyingTo(null);
      }
    } finally {
      setSending(false);
    }
  };

  const lastAdminMsg = messages.filter((m) => m.sender === "admin").at(-1);

  return (
    <>
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-900">
          <Store className="h-5 w-5 text-[#65bbc5]" />
          <h1 className="text-xl font-semibold sm:text-2xl">{storeName}</h1>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 text-sm text-slate-600 sm:w-auto sm:gap-4">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>
              Customers: <strong className="font-semibold text-slate-900">15</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock3 className="h-4 w-4" />
            <span>
              Starts in <strong className="font-semibold text-slate-900">1:28:34</strong> min
            </span>
          </div>
          <button
            type="button"
            className="rounded-2xl bg-[#65bbc5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#53aab5] sm:px-6"
          >
            Go Live
          </button>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full bg-[#7f8ca0] text-white transition hover:bg-[#6d7a8d]"
          >
            <Mic className="h-5 w-5" />
          </button>
        </div>
      </section>

      <section className="mt-4 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {channels.map((channel) => {
          const Icon = channel.icon;
          return (
            <button
              key={channel.title}
              type="button"
              className="flex min-w-[210px] items-center justify-between rounded-xl bg-[#f8f8f8] px-4 py-3.5 text-left text-sm font-semibold text-slate-900 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] sm:min-w-[220px] sm:px-5 sm:py-4 sm:text-base"
            >
              <span className="flex items-center gap-2 whitespace-nowrap">
                <Icon />
                {channel.title}
              </span>
              <Plus className="h-4 w-4" />
            </button>
          );
        })}
      </section>

      <section className="mt-4 grid grid-cols-1 overflow-hidden rounded-[24px] border border-slate-200 bg-[#f7f7f7] lg:min-h-[620px] lg:grid-cols-[340px_1fr] lg:rounded-[30px]">
        {/* Inbox sidebar */}
        <div className="border-b border-slate-200 p-4 lg:border-b-0 lg:border-r">
          <div className="mb-4 flex items-center rounded-full border border-[#9fb0c6] bg-white px-4 py-2 text-slate-500">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent text-sm outline-none"
            />
            <Search className="h-4 w-4" />
          </div>

          <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1 lg:max-h-none lg:overflow-visible lg:pr-0">
            {/* Super Admin thread */}
            <button
              type="button"
              onClick={openAdminThread}
              className="flex w-full items-start gap-3 rounded-2xl px-2 py-2 text-left bg-slate-100"
            >
              <div className="h-12 w-12 rounded-full bg-[#65bbc5] flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
                A
              </div>
              <span className="flex flex-1 items-center justify-between gap-2">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#65bbc5]">Super Admin</span>
                  <span className="mt-0.5 flex items-center gap-2 truncate text-xs text-slate-700">
                    {messagePreview(lastAdminMsg)}
                  </span>
                </span>
                <span className="mt-2 h-3 w-3 rounded-full bg-[#65bbc5]" />
              </span>
            </button>

            {/* Live Chat placeholder */}
            {customerThreads.length === 0 ? (
              <button
                type="button"
                className="flex w-full items-start gap-3 rounded-2xl px-2 py-2 text-left text-slate-400"
              >
                <Image
                  src={ownerCard}
                  alt="Live Chat"
                  width={50}
                  height={50}
                  className="h-12 w-12 rounded-full border border-slate-300 object-cover"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#f04444]">Live Chat</span>
                  <span className="mt-0.5 block truncate text-xs">No customer messages yet</span>
                </span>
              </button>
            ) : (
              customerThreads.map((thread) => (
                <button
                  key={thread._id}
                  type="button"
                  onClick={() => openCustomerThread(thread)}
                  className={`flex w-full items-start gap-3 rounded-2xl px-2 py-2 text-left ${
                    selectedCustomerThread?._id === thread._id && activeThread === "customer"
                      ? "bg-slate-100"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <Image
                    src={ownerCard}
                    alt={thread.customerName}
                    width={50}
                    height={50}
                    className="h-12 w-12 rounded-full border border-slate-300 object-cover"
                  />
                  <span className="flex flex-1 items-center justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#f04444]">{thread.customerName}</span>
                      <span className="mt-0.5 block truncate text-xs text-slate-700">
                        {thread.lastMessage || "Customer chat"}
                      </span>
                    </span>
                    <span className="mt-2 h-3 w-3 rounded-full bg-[#f04444]" />
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex h-full flex-col p-4">
          <header className="mb-4 flex items-center gap-3 border-b border-[#9fb0c6] pb-3">
            <div className="h-14 w-14 rounded-full bg-[#65bbc5] flex-shrink-0 flex items-center justify-center text-white font-bold text-2xl">
              {activeThread === "admin" ? "A" : (selectedCustomerThread?.customerName?.[0] ?? "C").toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-medium text-slate-900 sm:text-2xl">
                {activeThread === "admin" ? "Super Admin" : selectedCustomerThread?.customerName ?? "Customer Chat"}
              </p>
              <p className="text-sm text-slate-600">
                {(activeThread === "admin" ? messages.length : customerMessages.length) > 0 ? "Active" : "No messages yet"}
              </p>
            </div>
          </header>

          <div ref={messagesRef} className="flex-1 overflow-y-auto space-y-4 py-2 pr-1" style={{ maxHeight: 360 }}>
            {activeThread === "customer" && !selectedCustomerThread ? (
              <p className="text-center text-xs text-slate-400 py-8">Select a customer conversation.</p>
            ) : (activeThread === "admin" ? messages.length : customerMessages.length) === 0 ? (
              <p className="text-center text-xs text-slate-400 py-8">No messages yet. Start the conversation!</p>
            ) : activeThread === "admin" ? (
              messages.map((message) => (
                <MessageBubble
                  key={message._id}
                  msg={message}
                  isOwn={message.sender === "owner"}
                  avatarLabel="A"
                  avatarClassName="bg-[#a8b4c6] text-white"
                  ownBubbleCls="rounded-[24px] rounded-br-sm bg-[#65bbc5] text-white"
                  otherBubbleCls="rounded-[24px] rounded-bl-sm bg-[#a8b4c6] text-white"
                  onReply={setReplyingTo}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              customerMessages.map((message) => (
                <MessageBubble
                  key={message._id}
                  msg={message}
                  isOwn={message.sender === "owner"}
                  avatarLabel={(selectedCustomerThread?.customerName?.[0] ?? "C").toUpperCase()}
                  avatarClassName="bg-[#a8b4c6] text-white"
                  ownBubbleCls="rounded-[24px] rounded-br-sm bg-[#65bbc5] text-white"
                  otherBubbleCls="rounded-[24px] rounded-bl-sm bg-[#a8b4c6] text-white"
                  onReply={setCustomerReplyingTo}
                  onEdit={handleCustomerEdit}
                  onDelete={handleCustomerDelete}
                />
              ))
            )}
            {activeThread === "admin" && adminTyping && (
              <div className="flex items-center gap-2 px-1">
                <div className="w-8 h-8 rounded-full bg-[#a8b4c6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">A</div>
                <div className="rounded-full bg-[#a8b4c6] px-4 py-3 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "160ms" }} />
                  <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "320ms" }} />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={activeThread === "admin" ? handleSendReply : handleSendCustomerReply} className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4">
            {/* Reply preview */}
            {activeThread === "admin" && replyingTo && (
              <div className="flex items-center justify-between rounded-lg border-l-2 border-[#65bbc5] bg-slate-50 px-3 py-1.5 text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-[#65bbc5]">Replying to {replyingTo.senderName}</p>
                  <p className="truncate text-slate-500">
                    {replyingTo.deleted ? <em>This message was deleted</em> : replyingTo.text}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="ml-2 flex-shrink-0 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
            )}
            {activeThread === "customer" && customerReplyingTo && (
              <div className="flex items-center justify-between rounded-lg border-l-2 border-[#65bbc5] bg-slate-50 px-3 py-1.5 text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-[#65bbc5]">Replying to {customerReplyingTo.senderName}</p>
                  <p className="truncate text-slate-500">
                    {customerReplyingTo.deleted ? <em>This message was deleted</em> : customerReplyingTo.text}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomerReplyingTo(null)}
                  className="ml-2 flex-shrink-0 text-slate-400 hover:text-slate-600"
                >
                  x
                </button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={activeThread === "admin" ? replyText : customerReplyText}
                onChange={(event) =>
                  activeThread === "admin"
                    ? handleReplyChange(event.target.value)
                    : setCustomerReplyText(event.target.value)
                }
                placeholder="Write your reply..."
                className="h-11 w-full rounded-full border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#65bbc5]"
              />
              <button
                type="submit"
                disabled={sending || !(activeThread === "admin" ? replyText : customerReplyText).trim() || (activeThread === "customer" && !selectedCustomerThread)}
                className="inline-flex h-11 shrink-0 items-center gap-1 rounded-full bg-[#65bbc5] px-4 text-sm font-semibold text-white transition hover:bg-[#53aab5] disabled:opacity-50"
              >
                <SendHorizontal className="h-4 w-4" />
                {sending ? "…" : "Send"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
