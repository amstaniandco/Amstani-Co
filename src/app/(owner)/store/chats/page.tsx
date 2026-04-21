"use client";

import { FormEvent, useState } from "react";
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
import OwnerChatSidebar from "./components/OwnerChatSidebar";

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

type InboxItem = {
  name: string;
  message: string;
  pending: string;
  time: string;
  highlight?: "red" | "teal";
};

const channels: ChannelItem[] = [
  { title: "facebook Live", icon: FacebookBrandIcon },
  { title: "Instagram Live", icon: InstagramBrandIcon },
  { title: "Tiktok Live", icon: TikTokBrandIcon },
  { title: "WhatsApp Call", icon: WhatsAppBrandIcon },
];

const inboxItems: InboxItem[] = [
  {
    name: "Live Chat",
    message: "Hey! Id like to get a store",
    pending: "5 Pending",
    time: "",
    highlight: "red",
  },
  {
    name: "Super Admin",
    message: "Hello sir I have a que...",
    pending: "5 Pending",
    time: "",
    highlight: "teal",
  },
  {
    name: "John Doe",
    message: "Hey! Id like to get a store",
    pending: "",
    time: "12m",
  },
  {
    name: "John Doe",
    message: "Hey! Id like to get a store",
    pending: "",
    time: "10m",
  },
  {
    name: "John Doe",
    message: "Hey! Id like to get a store",
    pending: "",
    time: "10m",
  },
];

type ChatMessage = {
  text: string;
  from: "owner" | "customer";
};

const initialMessages: ChatMessage[] = [
  { text: "Hello! How are you?", from: "customer" },
  { text: "Hi Im good gow are you?", from: "owner" },
  { text: "I want to get a store", from: "customer" },
  { text: "Sure! I would Like to ask you a few questions about that.", from: "owner" },
];

export default function OwnerChatsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [replyText, setReplyText] = useState("");

  const handleSendReply = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = replyText.trim();
    if (!trimmed) {
      return;
    }

    setMessages((prev) => [...prev, { text: trimmed, from: "owner" }]);
    setReplyText("");
  };

  return (
    <div className="min-h-screen bg-[#efefef] p-2 md:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] w-full max-w-[1400px] flex-col overflow-hidden rounded-sm border border-slate-300 bg-[#efefef] md:flex-row">
        <OwnerChatSidebar />

        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <section className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-900">
              <Store className="h-5 w-5 text-[#65bbc5]" />
              <h1 className="text-xl font-semibold sm:text-2xl">Name of the store here</h1>
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
            <div className="border-b border-slate-200 p-4 lg:border-b-0 lg:border-r">
              <div className="mb-4 flex items-center rounded-full border border-[#9fb0c6] bg-white px-4 py-2 text-slate-500">
                <input
                  type="text"
                  defaultValue="Hinted search text"
                  className="w-full bg-transparent text-sm outline-none"
                />
                <Search className="h-4 w-4" />
              </div>

              <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1 lg:max-h-none lg:overflow-visible lg:pr-0">
                {inboxItems.map((item, index) => (
                  <button
                    key={`${item.name}-${index}`}
                    type="button"
                    className="flex w-full items-start gap-3 rounded-2xl px-2 py-2 text-left hover:bg-slate-100"
                  >
                    <Image
                      src={ownerCard}
                      alt="User avatar"
                      width={50}
                      height={50}
                      className="h-12 w-12 rounded-full border border-slate-300 object-cover"
                    />

                    <span className="flex flex-1 items-center justify-between gap-2">
                      <span className="min-w-0">
                        <span
                          className={`block text-sm font-semibold ${
                            item.highlight === "red"
                              ? "text-[#f04444]"
                              : item.highlight === "teal"
                                ? "text-[#65bbc5]"
                                : "text-slate-900"
                          }`}
                        >
                          {item.name}
                        </span>
                        <span className="mt-0.5 flex items-center gap-2 truncate text-xs text-slate-700">
                          {item.message}
                          {item.pending && <strong className="font-semibold">{item.pending}</strong>}
                          {item.time && <span>{item.time}</span>}
                        </span>
                      </span>
                      <span
                        className={`mt-2 h-3 w-3 rounded-full ${
                          item.highlight === "red" ? "bg-[#f04444]" : "bg-[#65bbc5]"
                        }`}
                      />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex h-full flex-col p-4">
              <header className="mb-4 flex items-center gap-3 border-b border-[#9fb0c6] pb-3">
                <Image
                  src={ownerCard}
                  alt="John Doe avatar"
                  width={54}
                  height={54}
                  className="h-14 w-14 rounded-full border border-slate-300 object-cover"
                />
                <div>
                  <p className="text-xl font-medium text-slate-900 sm:text-2xl">John Doe</p>
                  <p className="text-sm text-slate-600">12 Minutes Ago</p>
                </div>
              </header>

              <div className="max-h-[360px] flex-1 space-y-4 overflow-y-auto py-2 pr-1">
                {messages.map((message, index) => (
                  <div
                    key={`${message.from}-${index}`}
                    className={`w-fit max-w-[85%] px-5 py-3 text-sm text-white sm:max-w-[360px] sm:px-6 ${
                      message.from === "owner"
                        ? "ml-auto rounded-[24px] bg-[#65bbc5]"
                        : "rounded-full bg-[#a8b4c6]"
                    }`}
                  >
                    {message.text}
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendReply} className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-4">
                <input
                  type="text"
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  placeholder="Write your reply..."
                  className="h-11 w-full rounded-full border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#65bbc5]"
                />
                <button
                  type="submit"
                  className="inline-flex h-11 shrink-0 items-center gap-1 rounded-full bg-[#65bbc5] px-4 text-sm font-semibold text-white transition hover:bg-[#53aab5]"
                >
                  <SendHorizontal className="h-4 w-4" />
                  Send
                </button>
              </form>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
