"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Pencil, Reply, Trash2 } from "lucide-react";

export type Message = {
  _id: string;
  sender: "admin" | "owner" | "customer";
  senderName: string;
  /** User id of whoever sent this — needed to tell apart "my own" messages from other customers' in a multi-party group chat */
  senderId?: string;
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

type Props = {
  msg: Message;
  /** True when the current user sent this message */
  isOwn: boolean;
  /** Letter shown in the other party's avatar (e.g. "A" or "O") */
  avatarLabel?: string;
  /** Tailwind classes applied to the avatar div (bg + text colour) */
  avatarClassName?: string;
  /** Tailwind classes for own-side bubble */
  ownBubbleCls?: string;
  /** Tailwind classes for other-side bubble */
  otherBubbleCls?: string;
  onReply: (msg: Message) => void;
  onEdit: (msgId: string, newText: string) => void;
  onDelete: (msgId: string) => void;
};

export default function MessageBubble({
  msg,
  isOwn,
  avatarLabel = "?",
  avatarClassName = "bg-[#dfe7ec] text-slate-600",
  ownBubbleCls = "rounded-br-sm bg-[#54b9c9] text-white",
  otherBubbleCls = "rounded-bl-sm bg-[#e8ecef] text-slate-700",
  onReply,
  onEdit,
  onDelete,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ bottom: number; left?: number; right?: number } | null>(null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(msg.text);
  const touchStartX = useRef(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPos(
        isOwn
          ? { bottom: window.innerHeight - rect.top + 4, right: window.innerWidth - rect.right }
          : { bottom: window.innerHeight - rect.top + 4, left: rect.left }
      );
    }
    setMenuOpen(true);
  };

  // Close on outside click/scroll. Rendered via a portal, so "outside" is
  // checked by actual DOM containment rather than relying on every menu item
  // to stopPropagation — a click landing on an overlapping element (a
  // stacking-context/z-index issue) was being misread as "outside" before.
  useEffect(() => {
    if (!menuOpen) return;
    const closeIfOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    const close = () => setMenuOpen(false);
    document.addEventListener("mousedown", closeIfOutside);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", closeIfOutside);
      window.removeEventListener("scroll", close, true);
    };
  }, [menuOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 60 && !msg.deleted) onReply(msg);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editText.trim();
    if (trimmed && trimmed !== msg.text) onEdit(msg._id, trimmed);
    setEditing(false);
  };

  const menu = (
    <div className="relative flex-shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (menuOpen) setMenuOpen(false);
          else openMenu();
        }}
        className="p-1 rounded-full hover:bg-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <MoreHorizontal className="h-4 w-4 text-slate-500" />
      </button>
      {menuOpen && menuPos && createPortal(
        <div
          ref={menuRef}
          style={{ position: "fixed", bottom: menuPos.bottom, left: menuPos.left, right: menuPos.right }}
          className="z-[1000] min-w-[110px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            onClick={() => { onReply(msg); setMenuOpen(false); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
          >
            <Reply className="h-3.5 w-3.5" /> Reply
          </button>
          {isOwn && (
            <>
              <button
                type="button"
                onClick={() => { setEditText(msg.text); setEditing(true); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                type="button"
                onClick={() => { onDelete(msg._id); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </div>
  );

  return (
    <div
      className={`group flex items-end gap-1.5 ${isOwn ? "justify-end" : "justify-start"}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Other party avatar */}
      {!isOwn && (
        <div
          className={`h-6 w-6 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${avatarClassName}`}
        >
          {avatarLabel}
        </div>
      )}

      <div className={`flex max-w-[200px] flex-col gap-0.5 sm:max-w-[280px] ${isOwn ? "items-end" : "items-start"}`}>
        {/* Reply quote */}
        {msg.replyTo && (
          <div className="w-full rounded-lg border-l-2 border-slate-400 bg-slate-100 px-2 py-1 text-xs text-slate-500">
            <p className="font-semibold">{msg.replyTo.senderName}</p>
            <p className="truncate">
              {msg.replyTo.deleted ? <em>This message was deleted</em> : msg.replyTo.text}
            </p>
          </div>
        )}

        <div className={`flex items-end gap-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          {/* Three-dot menu (hidden for deleted messages) */}
          {!msg.deleted && menu}

          {/* Bubble */}
          {editing ? (
            <form onSubmit={handleEditSubmit} className="flex items-center gap-1">
              <input
                autoFocus
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-[#54b9c9]"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
              />
              <button type="submit" className="text-xs font-semibold text-[#54b9c9]">
                Save
              </button>
              <button type="button" onClick={() => setEditing(false)} className="text-xs text-slate-400">
                ✕
              </button>
            </form>
          ) : msg.deleted ? (
            <div className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm italic text-slate-400">
              This message was deleted
            </div>
          ) : (
            <div className={`rounded-2xl px-3 py-1.5 text-xs ${isOwn ? ownBubbleCls : otherBubbleCls}`}>
              {!isOwn && (
                <p className="mb-0.5 text-[10px] font-semibold opacity-60">{msg.senderName}</p>
              )}
              <p className="leading-snug">{msg.text}</p>
              {msg.edited && <p className="mt-0.5 text-[10px] opacity-60">(edited)</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
