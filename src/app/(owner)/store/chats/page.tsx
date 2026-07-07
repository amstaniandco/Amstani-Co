"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Ban,
  Clock3,
  Loader2,
  Plus,
  Search,
  SendHorizontal,
  Store,
  Trash2,
  Users,
} from "lucide-react";
import ownerCard from "@/src/app/imagess/ownercard.png";
import MessageBubble, { type Message as ChatMessage } from "@/src/components/chat/MessageBubble";
import GoLiveModal from "@/src/components/owner/GoLiveModal";
import { useConfirm } from "@/src/components/global/ConfirmProvider";

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
  key: string;
  title: string;
  icon: React.ComponentType;
};

type CustomerThread = {
  _id: string;
  customerName: string;
  customerAvatarUrl?: string;
  lastMessage: string;
  updatedAt: string;
};

type ChatUnreads = { admin: number; group: number; customers: Record<string, number> };

function totalUnread(u: ChatUnreads) {
  return u.admin + u.group + Object.values(u.customers).reduce((sum, n) => sum + n, 0);
}

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

const channels: ChannelItem[] = [
  { key: "facebook", title: "Facebook Live", icon: FacebookBrandIcon },
  { key: "instagram", title: "Instagram Live", icon: InstagramBrandIcon },
  { key: "tiktok", title: "TikTok Live", icon: TikTokBrandIcon },
  { key: "whatsapp", title: "WhatsApp Chat", icon: WhatsAppBrandIcon },
];

function messagePreview(message?: ChatMessage | null) {
  if (!message) return "No messages yet";
  return message.deleted ? "This message was deleted" : message.text;
}

function getCurrentUserId(): string {
  if (typeof document === "undefined") return "";
  const entry = document.cookie.split(";").map((p) => p.trim()).find((p) => p.startsWith("token="));
  if (!entry) return "";
  try {
    const token = decodeURIComponent(entry.slice("token=".length));
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.id ?? "";
  } catch {
    return "";
  }
}

function useCountdown(fromTime: string, isLive: boolean, liveSessionStartedAt: string | null) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      if (isLive && liveSessionStartedAt) {
        const diff = now.getTime() - new Date(liveSessionStartedAt).getTime();
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setDisplay(`Live ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
        return;
      }
      const [fh, fm] = fromTime.split(":").map(Number);
      const target = new Date(now);
      target.setHours(fh, fm, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      const diff = target.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setDisplay(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [fromTime, isLive, liveSessionStartedAt]);

  return display;
}

export default function OwnerChatsPage() {
  const [activeThread, setActiveThread] = useState<"admin" | "customer" | "group">("admin");
  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("My Store");
  const [storeStatus, setStoreStatus] = useState("pending");
  const [isLive, setIsLive] = useState(false);
  const [liveSessionStartedAt, setLiveSessionStartedAt] = useState<string | null>(null);
  const [dailyFrom, setDailyFrom] = useState("09:00");
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [showGoLiveModal, setShowGoLiveModal] = useState(false);
  const [preselectedPlatform, setPreselectedPlatform] = useState<string | undefined>(undefined);
  const [goingLive, setGoingLive] = useState(false);
  const [goingOffline, setGoingOffline] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [customerThreads, setCustomerThreads] = useState<CustomerThread[]>([]);
  const [selectedCustomerThread, setSelectedCustomerThread] = useState<CustomerThread | null>(null);
  const [customerMessages, setCustomerMessages] = useState<ChatMessage[]>([]);
  const [groupMessages, setGroupMessages] = useState<ChatMessage[]>([]);
  const [groupBlockedUserIds, setGroupBlockedUserIds] = useState<string[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<{ id: string; name: string; avatarUrl: string }[]>([]);
  const [unreads, setUnreads] = useState<ChatUnreads>({ admin: 0, group: 0, customers: {} });
  const [myUserId] = useState(getCurrentUserId);
  const confirm = useConfirm();
  const [replyText, setReplyText] = useState("");
  const [customerReplyText, setCustomerReplyText] = useState("");
  const [groupReplyText, setGroupReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [customerReplyingTo, setCustomerReplyingTo] = useState<ChatMessage | null>(null);
  const [groupReplyingTo, setGroupReplyingTo] = useState<ChatMessage | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const timerDisplay = useCountdown(dailyFrom, isLive, liveSessionStartedAt);

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

  const handleDeleteThread = useCallback(
    async (thread: CustomerThread) => {
      const ok = await confirm({
        title: "Delete conversation",
        message: `Delete your chat with ${thread.customerName}? This removes all messages and cannot be undone.`,
        confirmLabel: "Delete",
        danger: true,
      });
      if (!ok || !storeId) return;
      const res = await fetch(`/api/customer-conversations/${storeId}?chatId=${thread._id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCustomerThreads((prev) => prev.filter((t) => t._id !== thread._id));
        setUnreads((prev) => {
          const customers = { ...prev.customers };
          delete customers[thread._id];
          return { ...prev, customers };
        });
        if (selectedCustomerThread?._id === thread._id) {
          esRef.current?.close();
          setSelectedCustomerThread(null);
          setCustomerMessages([]);
          setActiveThread("admin");
        }
      }
    },
    [confirm, selectedCustomerThread, storeId]
  );

  const refreshUnreads = useCallback(async () => {
    try {
      const res = await fetch("/api/owner/chat-unreads");
      if (res.ok) {
        const data = await res.json();
        setUnreads({ admin: data.admin ?? 0, group: data.group ?? 0, customers: data.customers ?? {} });
      }
    } catch {}
  }, []);

  // Clears a thread's unread badge locally. (Telling the nav sidebar to drop its
  // Chats badge is handled by the effect below, once the total reaches zero — doing
  // it inside the state updater would setState on another component mid-render.)
  const markThreadRead = useCallback((thread: "admin" | "group") => {
    setUnreads((prev) => ({ ...prev, [thread]: 0 }));
    fetch("/api/owner/chat-reads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thread }),
    }).catch(() => {});
  }, []);

  const markCustomerRead = useCallback((chatId: string) => {
    setUnreads((prev) => ({ ...prev, customers: { ...prev.customers, [chatId]: 0 } }));
  }, []);

  // Notify the nav sidebar when the owner has cleared all unread chats.
  const prevTotalRef = useRef<number | null>(null);
  useEffect(() => {
    const total = totalUnread(unreads);
    if (prevTotalRef.current !== null && prevTotalRef.current > 0 && total === 0) {
      window.dispatchEvent(new CustomEvent("sb-seen", { detail: "owner_chats" }));
    }
    prevTotalRef.current = total;
  }, [unreads]);

  const openAdminThread = useCallback(() => {
    setActiveThread("admin");
    markThreadRead("admin");
    if (storeId) {
      startStream(storeId, messages.at(-1)?._id ?? "");
    }
  }, [markThreadRead, messages, startStream, storeId]);

  const openCustomerThread = useCallback(
    async (thread: CustomerThread) => {
      if (!storeId) return;
      setActiveThread("customer");
      setSelectedCustomerThread(thread);
      markCustomerRead(thread._id);
      const res = await fetch(`/api/customer-conversations/${storeId}?chatId=${thread._id}`);
      if (!res.ok) return;
      const data = await res.json();
      const loadedMessages: ChatMessage[] = data.messages ?? [];
      setCustomerMessages(loadedMessages);
      startCustomerStream(storeId, thread._id, loadedMessages.at(-1)?._id ?? "");
    },
    [markCustomerRead, startCustomerStream, storeId]
  );

  const startGroupStream = useCallback((sid: string, afterId: string) => {
    esRef.current?.close();
    const url = `/api/group-conversations/${sid}/stream${afterId ? `?after=${afterId}` : ""}`;
    const es = new EventSource(url);
    esRef.current = es;
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "message") {
          setGroupMessages((prev) =>
            prev.find((m) => m._id === data.message._id) ? prev : [...prev, data.message]
          );
        } else if (data.type === "update") {
          setGroupMessages((prev) =>
            prev.map((m) => m._id === data.message._id ? data.message : m)
          );
        } else if (data.type === "blocked") {
          setGroupBlockedUserIds(data.blockedUserIds ?? []);
          setBlockedUsers(data.blockedUsers ?? []);
        }
      } catch {}
    };
  }, []);

  const openGroupThread = useCallback(async () => {
    if (!storeId) return;
    setActiveThread("group");
    markThreadRead("group");
    const res = await fetch(`/api/group-conversations/${storeId}`);
    if (!res.ok) return;
    const data = await res.json();
    const loadedMessages: ChatMessage[] = data.messages ?? [];
    setGroupMessages(loadedMessages);
    setGroupBlockedUserIds(data.blockedUserIds ?? []);
    setBlockedUsers(data.blockedUsers ?? []);
    startGroupStream(storeId, loadedMessages.at(-1)?._id ?? "");
  }, [markThreadRead, startGroupStream, storeId]);

  const blockUser = useCallback(
    async (userId: string, block: boolean) => {
      if (!storeId || !userId) return;
      // Optimistic update so the menu/list reflects the new state immediately.
      setGroupBlockedUserIds((prev) =>
        block ? (prev.includes(userId) ? prev : [...prev, userId]) : prev.filter((id) => id !== userId)
      );
      if (!block) setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
      const res = await fetch(`/api/group-conversations/${storeId}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: block ? "block" : "unblock" }),
      });
      if (res.ok) {
        const data = await res.json();
        setGroupBlockedUserIds(data.blockedUserIds ?? []);
        setBlockedUsers(data.blockedUsers ?? []);
      }
    },
    [storeId]
  );

  const handleGroupBlock = useCallback(
    (message: ChatMessage, block: boolean) => blockUser(message.senderId ?? "", block),
    [blockUser]
  );

  useEffect(() => {
    refreshUnreads();

    fetch("/api/owner/timings")
      .then((r) => r.json())
      .then((d) => {
        setStoreStatus(d.storeStatus || "pending");
        setIsLive(d.isLive || false);
        setLiveSessionStartedAt(d.liveSessionStartedAt || null);
        setDailyFrom(d.dailyTimings?.from || "09:00");
        setFollowerCount(d.followerCount ?? 0);
      })
      .catch(() => {});

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
  }, [loadCustomerThreads, refreshUnreads, startStream]);

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
        setShowGoLiveModal(false);
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

  const openGoLiveModal = (platform?: string) => {
    setPreselectedPlatform(platform);
    setShowGoLiveModal(true);
  };

  useEffect(() => {
    const box = messagesRef.current;
    if (!box) return;
    // Defer to next frame so newly-rendered messages (and lazily-loaded avatars)
    // are laid out before we jump to the bottom.
    requestAnimationFrame(() => { box.scrollTop = box.scrollHeight; });
  }, [messages, customerMessages, groupMessages, activeThread, selectedCustomerThread, adminTyping]);

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

  const handleReact = async (msgId: string, emoji: string) => {
    if (!storeId) return;
    const res = await fetch(`/api/conversations/${storeId}/${msgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "react", emoji }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => prev.map((m) => m._id === msgId ? data.message : m));
    }
  };

  const handleCustomerReact = async (msgId: string, emoji: string) => {
    if (!storeId) return;
    const res = await fetch(`/api/customer-conversations/${storeId}/${msgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "react", emoji }),
    });
    if (res.ok) {
      const data = await res.json();
      setCustomerMessages((prev) => prev.map((m) => m._id === msgId ? data.message : m));
    }
  };

  const handleGroupReact = async (msgId: string, emoji: string) => {
    if (!storeId) return;
    const res = await fetch(`/api/group-conversations/${storeId}/${msgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "react", emoji }),
    });
    if (res.ok) {
      const data = await res.json();
      setGroupMessages((prev) => prev.map((m) => m._id === msgId ? data.message : m));
    }
  };

  const handleGroupEdit = async (msgId: string, newText: string) => {
    if (!storeId) return;
    const res = await fetch(`/api/group-conversations/${storeId}/${msgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "edit", text: newText }),
    });
    if (res.ok) {
      const data = await res.json();
      setGroupMessages((prev) => prev.map((m) => m._id === msgId ? data.message : m));
    }
  };

  const handleGroupDelete = async (msgId: string) => {
    if (!storeId) return;
    const res = await fetch(`/api/group-conversations/${storeId}/${msgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete" }),
    });
    if (res.ok) {
      const data = await res.json();
      setGroupMessages((prev) => prev.map((m) => m._id === msgId ? data.message : m));
      if (groupReplyingTo?._id === msgId) setGroupReplyingTo(data.message);
    }
  };

  const handleSendGroupReply = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = groupReplyText.trim();
    if (!trimmed || !storeId || sending) return;

    setSending(true);
    try {
      const body: Record<string, unknown> = { text: trimmed };
      if (groupReplyingTo) {
        body.replyTo = {
          _id: groupReplyingTo._id,
          senderName: groupReplyingTo.senderName,
          text: groupReplyingTo.text,
          deleted: groupReplyingTo.deleted ?? false,
        };
      }
      const res = await fetch(`/api/group-conversations/${storeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setGroupMessages((prev) =>
          prev.find((m) => m._id === data.message._id) ? prev : [...prev, data.message]
        );
        setGroupReplyText("");
        setGroupReplyingTo(null);
      }
    } finally {
      setSending(false);
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
      <GoLiveModal
        isOpen={showGoLiveModal}
        onClose={() => setShowGoLiveModal(false)}
        onGoLive={handleGoLive}
        loading={goingLive}
        preselectedPlatform={preselectedPlatform}
      />

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-900">
          <Store className="h-5 w-5 text-[#65bbc5]" />
          <h1 className="text-xl font-semibold sm:text-2xl">{storeName}</h1>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 text-sm text-slate-600 sm:w-auto sm:gap-4">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>
              Followers: <strong className="font-semibold text-slate-900">{followerCount ?? "—"}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock3 className={`h-4 w-4 ${isLive ? "text-green-500" : ""}`} />
            <span>
              {isLive
                ? <strong className="font-semibold text-green-600">{timerDisplay}</strong>
                : <><span>Starts in </span><strong className="font-semibold text-slate-900">{timerDisplay}</strong></>
              }
            </span>
          </div>

          {isLive ? (
            <button
              type="button"
              onClick={handleGoOffline}
              disabled={goingOffline}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 sm:px-6 disabled:opacity-60"
            >
              {goingOffline && <Loader2 className="h-4 w-4 animate-spin" />}
              End Live
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openGoLiveModal()}
              disabled={storeStatus !== "active"}
              title={storeStatus !== "active" ? "Store must be approved to go live" : ""}
              className="rounded-2xl bg-[#65bbc5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#53aab5] sm:px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Go Live
            </button>
          )}
        </div>
      </section>

      <section className="mt-4 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {channels.map((channel) => {
          const Icon = channel.icon;
          return (
            <button
              key={channel.title}
              type="button"
              onClick={() => openGoLiveModal(channel.key)}
              disabled={isLive}
              className="flex min-w-[210px] items-center justify-between rounded-xl bg-[#f8f8f8] px-4 py-3.5 text-left text-sm font-semibold text-slate-900 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] transition hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed sm:min-w-[220px] sm:px-5 sm:py-4 sm:text-base"
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

      <section data-tutorial-id="owner-chats-section" className="mt-4 grid grid-cols-1 overflow-hidden rounded-[24px] border border-slate-200 bg-[#f7f7f7] lg:min-h-[620px] lg:grid-cols-[340px_1fr] lg:rounded-[30px]">
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
              className={`flex w-full items-start gap-3 rounded-2xl px-2 py-2 text-left transition ${
                activeThread === "admin"
                  ? "bg-slate-200 ring-1 ring-inset ring-[#65bbc5]"
                  : "hover:bg-slate-100"
              }`}
            >
              <div className="h-12 w-12 rounded-full bg-[#65bbc5] flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
                A
              </div>
              <span className="flex flex-1 items-center justify-between gap-2">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#65bbc5]">Super Admin</span>
                  <span className={`mt-0.5 flex items-center gap-2 truncate text-xs ${unreads.admin > 0 ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                    {messagePreview(lastAdminMsg)}
                  </span>
                </span>
                {unreads.admin > 0
                  ? <UnreadBadge count={unreads.admin} />
                  : <span className="mt-2 h-3 w-3 rounded-full bg-[#65bbc5]" />}
              </span>
            </button>

            {/* Group Chat — public room shared by every customer + the owner */}
            <button
              type="button"
              onClick={openGroupThread}
              className={`flex w-full items-start gap-3 rounded-2xl px-2 py-2 text-left transition ${
                activeThread === "group" ? "bg-slate-200 ring-1 ring-inset ring-[#8a6fd6]" : "hover:bg-slate-100"
              }`}
            >
              <div className="h-12 w-12 rounded-full bg-[#8a6fd6] flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
                G
              </div>
              <span className="flex flex-1 items-center justify-between gap-2">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#8a6fd6]">Group Chat</span>
                  <span className={`mt-0.5 flex items-center gap-2 truncate text-xs ${unreads.group > 0 ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                    {messagePreview(groupMessages.at(-1))}
                  </span>
                </span>
                {unreads.group > 0
                  ? <UnreadBadge count={unreads.group} />
                  : <span className="mt-2 h-3 w-3 rounded-full bg-[#8a6fd6]" />}
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
              customerThreads.map((thread) => {
                const isActive = selectedCustomerThread?._id === thread._id && activeThread === "customer";
                const unread = unreads.customers[thread._id] ?? 0;
                return (
                <div key={thread._id} className="group relative">
                <button
                  type="button"
                  onClick={() => openCustomerThread(thread)}
                  className={`flex w-full items-start gap-3 rounded-2xl px-2 py-2 pr-9 text-left transition ${
                    isActive
                      ? "bg-slate-200 ring-1 ring-inset ring-[#f04444]"
                      : "hover:bg-slate-100"
                  }`}
                >
                  {thread.customerAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thread.customerAvatarUrl}
                      alt={thread.customerName}
                      className="h-12 w-12 rounded-full border border-slate-300 object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#f04444] text-lg font-bold text-white">
                      {(thread.customerName?.[0] ?? "C").toUpperCase()}
                    </div>
                  )}
                  <span className="flex flex-1 items-center justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#f04444]">{thread.customerName}</span>
                      <span className={`mt-0.5 block truncate text-xs ${unread > 0 ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                        {thread.lastMessage || "Customer chat"}
                      </span>
                    </span>
                    {unread > 0
                      ? <UnreadBadge count={unread} />
                      : <span className="mt-2 h-3 w-3 rounded-full bg-[#f04444]" />}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteThread(thread)}
                  title="Delete conversation"
                  aria-label={`Delete conversation with ${thread.customerName}`}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-slate-400 opacity-0 shadow-sm transition hover:bg-red-50 hover:text-red-500 focus:opacity-100 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex h-full flex-col p-4">
          <header className="mb-4 flex items-center gap-3 border-b border-[#9fb0c6] pb-3">
            <div className={`h-14 w-14 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-2xl ${activeThread === "group" ? "bg-[#8a6fd6]" : "bg-[#65bbc5]"}`}>
              {activeThread === "admin" ? "A" : activeThread === "group" ? "G" : (selectedCustomerThread?.customerName?.[0] ?? "C").toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-medium text-slate-900 sm:text-2xl">
                {activeThread === "admin" ? "Super Admin" : activeThread === "group" ? "Group Chat" : selectedCustomerThread?.customerName ?? "Customer Chat"}
              </p>
              <p className="text-sm text-slate-600">
                {(activeThread === "admin" ? messages.length : activeThread === "group" ? groupMessages.length : customerMessages.length) > 0 ? "Active" : "No messages yet"}
              </p>
            </div>
          </header>

          <div ref={messagesRef} className="flex-1 overflow-y-auto space-y-4 py-2 pr-1" style={{ maxHeight: 360 }}>
            {activeThread === "customer" && !selectedCustomerThread ? (
              <p className="text-center text-xs text-slate-400 py-8">Select a customer conversation.</p>
            ) : (activeThread === "admin" ? messages.length : activeThread === "group" ? groupMessages.length : customerMessages.length) === 0 ? (
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
                  onReact={handleReact}
                  currentUserId={myUserId}
                />
              ))
            ) : activeThread === "group" ? (
              groupMessages.map((message) => (
                <MessageBubble
                  key={message._id}
                  msg={message}
                  isOwn={message.sender === "owner"}
                  avatarLabel={(message.senderName?.[0] ?? "C").toUpperCase()}
                  avatarClassName="bg-[#a8b4c6] text-white"
                  ownBubbleCls="rounded-[24px] rounded-br-sm bg-[#8a6fd6] text-white"
                  otherBubbleCls="rounded-[24px] rounded-bl-sm bg-[#a8b4c6] text-white"
                  onReply={setGroupReplyingTo}
                  onEdit={handleGroupEdit}
                  onDelete={handleGroupDelete}
                  onBlock={handleGroupBlock}
                  blocked={!!message.senderId && groupBlockedUserIds.includes(message.senderId)}
                  onReact={handleGroupReact}
                  currentUserId={myUserId}
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
                  onReact={handleCustomerReact}
                  currentUserId={myUserId}
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

          <form
            onSubmit={activeThread === "admin" ? handleSendReply : activeThread === "group" ? handleSendGroupReply : handleSendCustomerReply}
            className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4"
          >
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
            {activeThread === "group" && groupReplyingTo && (
              <div className="flex items-center justify-between rounded-lg border-l-2 border-[#8a6fd6] bg-slate-50 px-3 py-1.5 text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-[#8a6fd6]">Replying to {groupReplyingTo.senderName}</p>
                  <p className="truncate text-slate-500">
                    {groupReplyingTo.deleted ? <em>This message was deleted</em> : groupReplyingTo.text}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGroupReplyingTo(null)}
                  className="ml-2 flex-shrink-0 text-slate-400 hover:text-slate-600"
                >
                  x
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
                value={activeThread === "admin" ? replyText : activeThread === "group" ? groupReplyText : customerReplyText}
                onChange={(event) =>
                  activeThread === "admin"
                    ? handleReplyChange(event.target.value)
                    : activeThread === "group"
                    ? setGroupReplyText(event.target.value)
                    : setCustomerReplyText(event.target.value)
                }
                placeholder="Write your reply..."
                className="h-11 w-full rounded-full border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#65bbc5]"
              />
              <button
                type="submit"
                disabled={
                  sending ||
                  !(activeThread === "admin" ? replyText : activeThread === "group" ? groupReplyText : customerReplyText).trim() ||
                  (activeThread === "customer" && !selectedCustomerThread)
                }
                className="inline-flex h-11 shrink-0 items-center gap-1 rounded-full bg-[#65bbc5] px-4 text-sm font-semibold text-white transition hover:bg-[#53aab5] disabled:opacity-50"
              >
                <SendHorizontal className="h-4 w-4" />
                {sending ? "…" : "Send"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Blocked users — quick unblock list */}
      {blockedUsers.length > 0 && (
        <section className="mt-4 rounded-[24px] border border-slate-200 bg-white p-4 lg:rounded-[30px]">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Ban className="h-4 w-4 text-red-500" />
            Blocked users ({blockedUsers.length})
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Blocked users can’t post in the group chat and their messages are hidden from everyone.
          </p>
          <ul className="mt-3 space-y-2">
            {blockedUsers.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2"
              >
                <span className="flex min-w-0 items-center gap-2">
                  {u.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatarUrl} alt={u.name} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#8a6fd6] text-sm font-bold text-white">
                      {(u.name?.[0] ?? "U").toUpperCase()}
                    </span>
                  )}
                  <span className="truncate text-sm font-medium text-slate-800">{u.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => blockUser(u.id, false)}
                  className="shrink-0 rounded-full border border-[#65bbc5] px-3 py-1.5 text-xs font-semibold text-[#65bbc5] transition hover:bg-[#eef9fa]"
                >
                  Unblock
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
