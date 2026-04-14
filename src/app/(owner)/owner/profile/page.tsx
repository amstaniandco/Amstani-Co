import { Link2, PenLine, Square, Store } from "lucide-react";
import OwnerChatSidebar from "../../store/chats/components/OwnerChatSidebar";

function FacebookIcon() {
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

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <defs>
        <linearGradient id="profileInstagramGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F58529" />
          <stop offset="45%" stopColor="#DD2A7B" />
          <stop offset="100%" stopColor="#515BD4" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="url(#profileInstagramGradient)" />
      <circle cx="12" cy="12" r="4.1" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1.15" fill="#fff" />
      <rect x="4.9" y="4.9" width="14.2" height="14.2" rx="4.4" fill="none" stroke="#fff" strokeWidth="1.3" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#25D366" />
      <circle cx="12" cy="11.5" r="5.2" fill="#fff" />
      <path
        fill="#25D366"
        d="M13.5 13.7c-.2.2-1.1-.2-2-1.1-.8-.8-1.4-1.9-1.1-2.1l.4-.2c.1-.1.2-.2.2-.4l-.2-.8c-.1-.3-.2-.4-.5-.4h-.3c-.2 0-.4.1-.6.3-.7.8-.6 1.9.2 3 .8 1.4 2.1 2.4 3.6 2.9 1 .3 1.9.2 2.5-.4.2-.2.3-.4.3-.6v-.3c0-.2-.1-.4-.4-.5l-.8-.2c-.2 0-.3 0-.4.2l-.2.3Z"
      />
    </svg>
  );
}

function EditBadge() {
  return (
    <div className="grid h-7 w-7 place-items-center rounded-full bg-[#65bbc5] text-white shadow-sm">
      <PenLine className="h-3.5 w-3.5" />
    </div>
  );
}

function SocialLinkPill({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <button
      type="button"
      className="flex min-h-[56px] flex-1 items-center justify-between rounded-[18px] border border-slate-200 bg-white px-4 py-3 shadow-[0_6px_18px_rgba(15,23,42,0.04)] transition hover:bg-slate-50 sm:px-5"
    >
      <span className="flex items-center gap-2 font-semibold text-slate-900">
        {icon}
        <span className="text-[13.5px] sm:text-[15px]">{title}</span>
      </span>
      <Link2 className="h-4 w-4 text-slate-700" />
    </button>
  );
}

function ProfileHero() {
  return (
    <section className="overflow-hidden rounded-[26px] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-5">
      <div className="relative h-[126px] overflow-hidden rounded-[12px] bg-zinc-900 sm:h-[176px]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,0.96)_0%,rgba(26,26,26,0.9)_45%,rgba(14,14,14,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(236,236,236,0.72)_0_3.6%,rgba(34,34,34,0.88)_3.6%_9.1%,rgba(240,240,240,0.58)_9.1%_13.2%,rgba(20,20,20,0.92)_13.2%_20%)] opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_20%_60%,rgba(255,255,255,0.06),transparent_30%)]" />
        <div className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-[#65bbc5] text-white shadow-sm">
          <PenLine className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="relative h-[66px] w-[66px] shrink-0 rounded-full bg-[#9a9a9a]">
            <div className="absolute -right-1 -bottom-1">
              <EditBadge />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[1.75rem] font-bold leading-none text-slate-900 sm:text-[2rem]">Name of the store</h2>
              <div className="-mt-1">
                <EditBadge />
              </div>
            </div>
            <p className="mt-2 max-w-[300px] text-[13px] leading-5 text-slate-400">
              Description of the store can be written here
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#65bbc5] px-3 py-1 text-[11px] font-semibold text-white">Ranked #1</span>
              <span className="rounded-full border border-red-500 px-3 py-1 text-[11px] font-semibold text-red-500">
                On Sale
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:gap-8 lg:flex-col lg:items-end lg:gap-4">
          <div className="flex gap-10 text-center sm:gap-8 lg:gap-10">
            <div>
              <p className="text-[2rem] font-bold leading-none text-slate-900">8</p>
              <p className="mt-1 text-[13px] text-slate-600">Products</p>
            </div>
            <div>
              <p className="text-[2rem] font-bold leading-none text-slate-900">12K</p>
              <p className="mt-1 text-[13px] text-slate-600">Followers</p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            <Square className="h-4 w-4" />
            User Preview
          </button>
        </div>
      </div>
    </section>
  );
}

function BottomCard({ title, subtitle, buttonLabel }: { title: string; subtitle: string; buttonLabel: string }) {
  return (
    <section className="rounded-[26px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <h3 className="text-center text-[1.55rem] font-bold text-slate-900 sm:text-[2rem]">{title}</h3>
      <p className="mt-2 text-center text-[15px] text-slate-500">{subtitle}</p>
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          className="rounded-full border-2 border-slate-900 px-6 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
        >
          {buttonLabel}
        </button>
      </div>
    </section>
  );
}

export default function OwnerProfilePage() {
  return (
    <div className="min-h-screen bg-[#efefef] p-2 md:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] w-full max-w-[1400px] flex-col overflow-hidden rounded-sm border border-slate-300 bg-[#efefef] md:flex-row">
        <OwnerChatSidebar activeLabel="Profile" />

        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <Store className="h-5 w-5 text-[#65bbc5]" />
              <h1 className="text-xl font-semibold sm:text-2xl">Name of the store here</h1>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-[#65bbc5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#53aab5] sm:self-auto sm:px-6"
            >
              <Square className="h-4 w-4" />
              Go Live
            </button>
          </section>

          <section className="mt-4">
            <ProfileHero />
          </section>

          <section className="mt-4 grid gap-3 lg:grid-cols-3">
            <SocialLinkPill icon={<FacebookIcon />} title="Add Facebook Live Link" />
            <SocialLinkPill icon={<InstagramIcon />} title="Add Instagram Live Link" />
            <SocialLinkPill icon={<WhatsAppIcon />} title="Add WhatsApp Call Link" />
          </section>

          <section className="mt-4 grid gap-4 lg:grid-cols-2">
            <BottomCard title="Store Timing" subtitle="09:00 Am to 03:00 PM" buttonLabel="Change Timings" />

            <section className="rounded-[26px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <h3 className="text-center text-[1.55rem] font-bold text-slate-900 sm:text-[2rem]">Earn $100</h3>
              <p className="mt-2 text-center text-[15px] text-slate-500">Register a new store owner</p>
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  className="rounded-full border-2 border-slate-900 px-6 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                >
                  Fill Form
                </button>
              </div>
              <div className="mx-auto mt-6 flex max-w-[210px] items-center justify-between gap-3 text-[11px] text-slate-500">
                <span className="whitespace-nowrap">Accepting applications</span>
                <div className="relative h-5 w-11 rounded-full bg-slate-300">
                  <div className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-[#65bbc5]" />
                </div>
              </div>
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}
