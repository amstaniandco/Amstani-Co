import Link from "next/link";
import { PenLine, Square, Store } from "lucide-react";

type StoreApplication = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  requestedAt: string;
  category: string;
};

const storeApplications: StoreApplication[] = [
  {
    id: "APP-2401",
    fullName: "Avery James",
    email: "avery.james@mail.com",
    phone: "+1 444 912 7812",
    requestedAt: "Apr 22, 2026",
    category: "Fashion",
  },
  {
    id: "APP-2402",
    fullName: "Mia Cooper",
    email: "mia.cooper@mail.com",
    phone: "+1 444 221 3378",
    requestedAt: "Apr 21, 2026",
    category: "Accessories",
  },
  {
    id: "APP-2403",
    fullName: "Noah Riley",
    email: "noah.riley@mail.com",
    phone: "+1 444 803 1547",
    requestedAt: "Apr 21, 2026",
    category: "Lifestyle",
  },
];

function EditBadge() {
  return (
    <div className="grid h-7 w-7 place-items-center rounded-full bg-[#65bbc5] text-white shadow-sm">
      <PenLine className="h-3.5 w-3.5" />
    </div>
  );
}

function ApplicationsCard() {
  return (
    <section className="rounded-[26px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[1.2rem] font-bold text-slate-900 sm:text-[1.45rem]">Applications</h3>
        <Link
          href="/owner/profile/applications"
          className="text-sm font-semibold text-[#4caeb8] transition hover:text-[#3b97a6]"
        >
          View all
        </Link>
      </div>

      <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
        {storeApplications.map((application) => (
          <Link
            key={application.id}
            href="/owner/profile/applications"
            className="block rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 transition hover:bg-slate-100"
            aria-label={`View application list for ${application.fullName}`}
          >
            <p className="text-sm font-semibold text-slate-900">{application.fullName}</p>
            <p className="text-xs text-slate-600">{application.email}</p>
            <p className="text-xs text-slate-600">{application.phone}</p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>{application.requestedAt}</span>
              <span className="font-semibold text-slate-700">{application.category}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
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

function EarnReferralCard() {
  return (
    <section className="rounded-[26px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <h3 className="text-center text-[1.55rem] font-bold text-slate-900 sm:text-[2rem]">Earn $100</h3>
      <p className="mt-2 text-center text-[15px] text-slate-500">Register applicant details directly</p>

      <div className="mt-4 space-y-3">
        <input
          type="text"
          placeholder="Customer full name"
          className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-700 outline-none"
        />
        <input
          type="email"
          placeholder="Customer email"
          className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-700 outline-none"
        />
        <input
          type="text"
          placeholder="Phone number"
          className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-700 outline-none"
        />
        <textarea
          rows={3}
          placeholder="Application notes"
          className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none"
        />
      </div>

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          className="rounded-full border-2 border-slate-900 px-6 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
        >
          Submit Application
        </button>
      </div>

      <div className="mx-auto mt-6 flex max-w-[220px] items-center justify-between gap-3 text-[11px] text-slate-500">
        <span className="whitespace-nowrap">Accepting applications</span>
        <div className="relative h-5 w-11 rounded-full bg-slate-300">
          <div className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-[#65bbc5]" />
        </div>
      </div>
    </section>
  );
}

function StoreCustomizationCard() {
  return (
    <section className="rounded-[26px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-6">
      <h3 className="text-[1.2rem] font-bold text-slate-900 sm:text-[1.45rem]">Store Customization</h3>
      <p className="mt-1 text-sm text-slate-500">Update store name, password, photos and owner contact details.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Store name"
          className="h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 outline-none"
        />
        <input
          type="text"
          placeholder="Owner display name"
          className="h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 outline-none"
        />
        <input
          type="email"
          placeholder="Owner email"
          className="h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 outline-none"
        />
        <input
          type="password"
          placeholder="New password"
          className="h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 outline-none"
        />
        <div className="rounded-lg border border-slate-300 p-3 text-sm text-slate-600 sm:col-span-2">
          <p className="font-semibold text-slate-800">Languages You Speak</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              "English",
              "Urdu",
              "Arabic",
              "Spanish",
              "French",
              "German",
              "Chinese",
              "Turkish",
            ].map((language) => (
              <label
                key={language}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700"
              >
                <input type="checkbox" className="h-3.5 w-3.5 accent-[#65bbc5]" />
                {language}
              </label>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-slate-300 p-3 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Profile picture</p>
          <input type="file" className="mt-2 block w-full text-xs" />
        </div>
        <div className="rounded-lg border border-slate-300 p-3 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Cover image</p>
          <input type="file" className="mt-2 block w-full text-xs" />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          className="rounded-xl bg-[#65bbc5] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#53aab5]"
        >
          Save Customization
        </button>
      </div>
    </section>
  );
}

export default function OwnerProfilePage() {
  return (
    <>
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

          <section className="mt-4 grid gap-4 lg:grid-cols-2">
            <ApplicationsCard />
            <EarnReferralCard />
          </section>

          <section className="mt-4">
            <StoreCustomizationCard />
          </section>
    </>
  );
}
