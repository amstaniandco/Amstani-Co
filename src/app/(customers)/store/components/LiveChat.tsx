"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Languages, Lock, SendHorizontal, Users } from "lucide-react";
import { useStore } from "../../../../context/StoreContext";
import MessageBubble, { type Message as ChatMessage } from "@/src/components/chat/MessageBubble";

type LiveChatProps = {
  className?: string;
  hideWrapper?: boolean;
};

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const encodedName = `${encodeURIComponent(name)}=`;
  const entry = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(encodedName));
  if (!entry) return null;
  return decodeURIComponent(entry.slice(encodedName.length));
}

function getCurrentUserId(): string {
  const token = getCookieValue("token");
  if (!token) return "";
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.id ?? "";
  } catch {
    return "";
  }
}

export default function LiveChat({ className = "", hideWrapper = false }: LiveChatProps) {
  const store = useStore();
  const [view, setView] = useState<"group" | "private">("group");
  const [myUserId] = useState(getCurrentUserId);

  // ── Group chat (public — every customer + the owner) ──────────────────────
  const [groupMessages, setGroupMessages] = useState<ChatMessage[]>([]);
  const [groupDraft, setGroupDraft] = useState("");
  const [groupSending, setGroupSending] = useState(false);
  const [groupAuthError, setGroupAuthError] = useState("");
  const [groupReplyingTo, setGroupReplyingTo] = useState<ChatMessage | null>(null);

  // ── Private chat (1:1 with the store owner) ────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [authError, setAuthError] = useState("");
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  const messagesRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  const storeId = store?._id;
  const storeName = store?.name ?? "Store Owner";

  const startGroupStream = useCallback((sid: string, afterId = "") => {
    esRef.current?.close();
    const url = `/api/group-conversations/${sid}/stream${afterId ? `?after=${afterId}` : ""}`;
    const es = new EventSource(url);
    esRef.current = es;
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message") {
          setGroupMessages((prev) =>
            prev.some((message) => message._id === data.message._id) ? prev : [...prev, data.message]
          );
        } else if (data.type === "update") {
          setGroupMessages((prev) =>
            prev.map((message) => (message._id === data.message._id ? data.message : message))
          );
        }
      } catch {}
    };
  }, []);

  const startPrivateStream = useCallback((sid: string, afterId = "") => {
    esRef.current?.close();
    const url = `/api/customer-conversations/${sid}/stream${afterId ? `?after=${afterId}` : ""}`;
    const es = new EventSource(url);
    esRef.current = es;
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message") {
          setMessages((prev) =>
            prev.some((message) => message._id === data.message._id) ? prev : [...prev, data.message]
          );
        } else if (data.type === "update") {
          setMessages((prev) =>
            prev.map((message) => (message._id === data.message._id ? data.message : message))
          );
        }
      } catch {}
    };
  }, []);

  const loadGroup = useCallback(
    (sid: string) => {
      fetch(`/api/group-conversations/${sid}`)
        .then(async (res) => {
          if (res.status === 401) {
            setGroupAuthError("Sign in to join the chat.");
            return;
          }
          if (!res.ok) return;
          const data = await res.json();
          const loaded: ChatMessage[] = data.messages ?? [];
          setGroupMessages(loaded);
          startGroupStream(sid, loaded.at(-1)?._id ?? "");
        })
        .catch(() => {});
    },
    [startGroupStream]
  );

  const loadPrivate = useCallback(
    (sid: string) => {
      fetch(`/api/customer-conversations/${sid}`)
        .then(async (res) => {
          if (res.status === 401) {
            setAuthError("Sign in to chat with this store.");
            return;
          }
          if (!res.ok) return;
          const data = await res.json();
          const loaded: ChatMessage[] = data.messages ?? [];
          setMessages(loaded);
          startPrivateStream(sid, loaded.at(-1)?._id ?? "");
        })
        .catch(() => {});
    },
    [startPrivateStream]
  );

  // The public group chat is the default view, loaded as soon as the store is known.
  useEffect(() => {
    if (!storeId) return;
    loadGroup(storeId);
    return () => {
      esRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const openGroup = () => {
    setView("group");
    if (storeId) loadGroup(storeId);
  };

  const openPrivate = () => {
    setView("private");
    if (storeId) loadPrivate(storeId);
  };

  useEffect(() => {
    const box = messagesRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages, groupMessages]);

  const handleGroupEdit = async (messageId: string, newText: string) => {
    if (!storeId) return;
    const res = await fetch(`/api/group-conversations/${storeId}/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "edit", text: newText }),
    });
    if (res.ok) {
      const data = await res.json();
      setGroupMessages((prev) => prev.map((message) => (message._id === messageId ? data.message : message)));
    }
  };

  const handleGroupDelete = async (messageId: string) => {
    if (!storeId) return;
    const res = await fetch(`/api/group-conversations/${storeId}/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete" }),
    });
    if (res.ok) {
      const data = await res.json();
      setGroupMessages((prev) => prev.map((message) => (message._id === messageId ? data.message : message)));
    }
  };

  const handleEdit = async (messageId: string, newText: string) => {
    if (!storeId) return;
    const res = await fetch(`/api/customer-conversations/${storeId}/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "edit", text: newText }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => prev.map((message) => (message._id === messageId ? data.message : message)));
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!storeId) return;
    const res = await fetch(`/api/customer-conversations/${storeId}/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete" }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => prev.map((message) => (message._id === messageId ? data.message : message)));
    }
  };

  const handleSendGroup = async (event: FormEvent) => {
    event.preventDefault();
    const text = groupDraft.trim();
    if (!text || !storeId || groupSending) return;

    setGroupSending(true);
    setGroupAuthError("");
    try {
      const body: Record<string, unknown> = { text };
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

      if (res.status === 401) {
        setGroupAuthError("Sign in to join the chat.");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setGroupMessages((prev) =>
          prev.some((message) => message._id === data.message._id) ? prev : [...prev, data.message]
        );
        startGroupStream(storeId, data.message._id);
        setGroupDraft("");
        setGroupReplyingTo(null);
      }
    } finally {
      setGroupSending(false);
    }
  };

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !storeId || sending) return;

    setSending(true);
    setAuthError("");
    try {
      const body: Record<string, unknown> = { text };
      if (replyingTo) {
        body.replyTo = {
          _id: replyingTo._id,
          senderName: replyingTo.senderName,
          text: replyingTo.text,
          deleted: replyingTo.deleted ?? false,
        };
      }

      const res = await fetch(`/api/customer-conversations/${storeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        setAuthError("Sign in to chat with this store.");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.some((message) => message._id === data.message._id) ? prev : [...prev, data.message]
        );
        startPrivateStream(storeId, data.message._id);
        setDraft("");
        setReplyingTo(null);
      }
    } finally {
      setSending(false);
    }
  };

  const isGroup = view === "group";
  const activeMessages = isGroup ? groupMessages : messages;
  const activeDraft = isGroup ? groupDraft : draft;
  const activeSending = isGroup ? groupSending : sending;
  const activeAuthError = isGroup ? groupAuthError : authError;
  const activeReplyingTo = isGroup ? groupReplyingTo : replyingTo;

  return (
    <div className={`${hideWrapper ? "flex h-full flex-col" : "ui-panel flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800"} ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-slate-100">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          {isGroup ? "Group Chat" : "Private Chat"}
        </h3>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:bg-slate-700 dark:text-sky-300">
          9:00 AM to 3:00 PM
        </span>
      </div>

      <div className="ui-subpanel mt-3 flex items-center gap-2 rounded-xl border border-[#d6edf0] bg-[#f2fbfc] px-3 py-2 text-xs font-medium text-[#3f98a3] dark:border-slate-600 dark:bg-slate-700 dark:text-sky-300">
        <Languages className="h-4 w-4" />
        Store owner languages: {store?.settings?.languages?.join(", ") ?? "English, Spanish, Arabic"}
      </div>

      <div ref={messagesRef} className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {!storeId ? (
          <p className="py-8 text-center text-sm text-slate-400">Select a store to start chatting.</p>
        ) : activeMessages.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            {isGroup ? "No messages yet. Say hello to the group." : "No messages yet. Say hello to the owner."}
          </p>
        ) : isGroup ? (
          groupMessages.map((message) => (
            <MessageBubble
              key={message._id}
              msg={message}
              isOwn={!!myUserId && message.senderId === myUserId}
              avatarLabel={(message.senderName?.[0] ?? "?").toUpperCase()}
              avatarClassName={message.sender === "owner" ? "bg-[#68B8C1] text-white" : "bg-slate-300 text-slate-700"}
              ownBubbleCls="rounded-[18px] rounded-br-sm bg-gray-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100"
              otherBubbleCls="rounded-[18px] rounded-bl-sm border border-blue-100 bg-blue-50 text-gray-700 dark:border-slate-500 dark:bg-slate-600 dark:text-slate-100"
              onReply={setGroupReplyingTo}
              onEdit={handleGroupEdit}
              onDelete={handleGroupDelete}
            />
          ))
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message._id}
              msg={message}
              isOwn={message.sender === "customer"}
              avatarLabel={(storeName[0] ?? "S").toUpperCase()}
              avatarClassName="bg-[#68B8C1] text-white"
              ownBubbleCls="rounded-[18px] rounded-br-sm bg-gray-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100"
              otherBubbleCls="rounded-[18px] rounded-bl-sm border border-blue-100 bg-blue-50 text-gray-700 dark:border-slate-500 dark:bg-slate-600 dark:text-slate-100"
              onReply={setReplyingTo}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {activeAuthError && <p className="mt-3 text-xs font-medium text-red-500">{activeAuthError}</p>}

      <form onSubmit={isGroup ? handleSendGroup : handleSend} className="ui-subpanel mt-5 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-700">
        <div className="flex w-full flex-col gap-2">
          {activeReplyingTo && (
            <div className="flex items-center justify-between rounded-lg border-l-2 border-[#68B8C1] bg-white px-3 py-1.5 text-xs dark:bg-slate-800">
              <div className="min-w-0">
                <p className="font-semibold text-[#3f98a3]">Replying to {activeReplyingTo.senderName}</p>
                <p className="truncate text-slate-500">
                  {activeReplyingTo.deleted ? <em>This message was deleted</em> : activeReplyingTo.text}
                </p>
              </div>
              <button
                type="button"
                onClick={() => (isGroup ? setGroupReplyingTo(null) : setReplyingTo(null))}
                className="ml-2 shrink-0 text-slate-400 hover:text-slate-600"
              >
                x
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              value={activeDraft}
              onChange={(event) => (isGroup ? setGroupDraft(event.target.value) : setDraft(event.target.value))}
              placeholder="Say something..."
              className="ui-input w-full bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={activeSending || !activeDraft.trim() || !storeId}
              className="text-[#68B8C1] transition hover:text-[#4f9ea7] disabled:opacity-50"
              aria-label="Send message"
            >
              <SendHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={isGroup ? openPrivate : openGroup}
          className="rounded-xl border border-[#68B8C1] py-3 text-sm font-semibold text-[#68B8C1] transition hover:bg-[#eef9fa] dark:border-[#4f9ea7] dark:text-[#7dc8d1] dark:hover:bg-slate-700"
        >
          <span className="inline-flex items-center gap-1.5">
            {isGroup ? <Lock className="h-4 w-4" /> : <Users className="h-4 w-4" />}
            {isGroup ? "Private Chat" : "Group Chat"}
          </span>
        </button>
        {store?.ownerPhone ? (
          <a
            href={`https://wa.me/${store.ownerPhone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-[#68B8C1] py-3 text-sm font-semibold text-white hover:bg-[#4f9ea7] flex items-center justify-center"
          >
            Open WhatsApp Chat
          </a>
        ) : (
          <button
            disabled
            className="rounded-xl bg-[#68B8C1] py-3 text-sm font-semibold text-white opacity-50 cursor-not-allowed"
          >
            Open WhatsApp Chat
          </button>
        )}
      </div>
    </div>
  );
}
