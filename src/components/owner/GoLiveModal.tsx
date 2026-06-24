"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path fill="#fff" d="M13.6 7H15V4.5h-1.7C10.9 4.5 9.6 6 9.6 8v1.8H8v2.7h1.6v6h3v-6h2.2l.3-2.7h-2.5V8.4c0-.8.4-1.4 1-1.4Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <defs>
        <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F58529" />
          <stop offset="45%" stopColor="#DD2A7B" />
          <stop offset="100%" stopColor="#515BD4" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="url(#igGrad)" />
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="#fff" />
      <rect x="4.8" y="4.8" width="14.4" height="14.4" rx="4.6" fill="none" stroke="#fff" strokeWidth="1.4" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <rect x="1.5" y="1.5" width="21" height="21" rx="5" fill="#000" />
      <path fill="#fff" d="M15.6 6.1c.6 1.2 1.7 2 3 2.2v2.1c-1.3-.1-2.4-.5-3.4-1.2v4.9c0 2.3-1.8 4-4 4s-3.9-1.8-3.9-4 1.7-4 3.9-4h.2v2.2h-.2c-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8 1.8-.8 1.8-1.8V6h2.6Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#25D366" />
      <circle cx="12" cy="11.5" r="5.2" fill="#fff" />
      <path fill="#25D366" d="M13.4 13.8c-.2.2-1.2-.2-2.1-1.1-.8-.8-1.4-1.9-1.1-2.1l.4-.2c.1-.1.2-.2.2-.4l-.2-.8c-.1-.3-.2-.4-.5-.4h-.3c-.2 0-.4.1-.6.3-.7.8-.6 1.9.2 3 .9 1.4 2.2 2.4 3.6 2.9 1 .3 1.9.2 2.5-.4.2-.2.3-.4.3-.6v-.3c0-.2-.1-.4-.4-.5l-.8-.2c-.2 0-.3 0-.4.2l-.2.4Z" />
    </svg>
  );
}

const PLATFORMS = [
  { key: "instagram", label: "Instagram Live", icon: InstagramIcon, placeholder: "https://www.instagram.com/..." },
  { key: "whatsapp", label: "WhatsApp Chat", icon: WhatsAppIcon, placeholder: "+1 555 123 4567" },
  { key: "facebook", label: "Facebook Live", icon: FacebookIcon, placeholder: "https://www.facebook.com/..." },
  { key: "tiktok", label: "TikTok Live", icon: TikTokIcon, placeholder: "https://www.tiktok.com/..." },
] as const;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onGoLive: (link: string) => void;
  loading?: boolean;
  preselectedPlatform?: string;
};

export default function GoLiveModal({ isOpen, onClose, onGoLive, loading, preselectedPlatform }: Props) {
  const [selectedPlatform, setSelectedPlatform] = useState(preselectedPlatform || "instagram");
  const [link, setLink] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setSelectedPlatform(preselectedPlatform || "instagram");
    setLink("");
  }, [isOpen, preselectedPlatform]);

  if (!isOpen) return null;

  const platform = PLATFORMS.find((p) => p.key === selectedPlatform) || PLATFORMS[0];
  const isWhatsApp = platform.key === "whatsapp";
  const whatsappNumber = link.replace(/\D/g, "");
  const canSubmit = isWhatsApp ? whatsappNumber.length >= 7 : Boolean(link.trim());

  const handleSubmit = () => {
    if (!canSubmit) return;
    onGoLive(isWhatsApp ? `https://wa.me/${whatsappNumber}` : link.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Go Live</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Choose a platform and add the details customers will use to join.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {PLATFORMS.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPlatform === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => {
                  setSelectedPlatform(p.key);
                  setLink("");
                }}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  isSelected
                    ? "border-[#65bbc5] bg-[#e8f8fa] text-[#2a8c98] dark:border-cyan-500 dark:bg-cyan-900/30 dark:text-cyan-300"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                <Icon />
                <span className="truncate">{p.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            {isWhatsApp ? "WhatsApp phone number" : `Your ${platform.label} link`}
          </label>
          <input
            type={isWhatsApp ? "tel" : "url"}
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder={platform.placeholder}
            className="h-10 w-full rounded-lg border border-slate-300 dark:border-slate-600 px-3 text-sm text-slate-700 dark:bg-slate-700 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#65bbc5]"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          {isWhatsApp && (
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Include country code. Customers will open WhatsApp chat through wa.me.
            </p>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#65bbc5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#53aab5] disabled:opacity-50 dark:bg-cyan-600 dark:hover:bg-cyan-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Go Live
          </button>
        </div>
      </div>
    </div>
  );
}
