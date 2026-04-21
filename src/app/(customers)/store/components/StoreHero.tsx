"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye } from "lucide-react";

export default function StoreHero() {
  const [showLanguages, setShowLanguages] = useState(false);

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm">
      <div className="relative h-[260px] w-full overflow-hidden rounded-2xl bg-slate-200">
        <Image
          src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=80"
          alt="Store banner"
          fill
          className="object-cover"
        />
      </div>

      <div className="mt-4 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 sm:min-w-0 sm:flex-1">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-xl font-semibold text-slate-600">
            S
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">Name of the store</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Description of the store can be written here
            </p>

            <div className="relative mt-3">
              <div className="flex flex-nowrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLanguages((prev) => !prev)}
                  aria-label="View languages spoken"
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  Ranked #1
                </span>
                <span className="shrink-0 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                  On Sale
                </span>
              </div>

              {showLanguages ? (
                <div className="absolute left-0 top-9 z-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-md">
                  Languages: English, Spanish, Arabic
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:shrink-0 sm:pl-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">8</p>
            <p className="text-xs uppercase tracking-[.12em] text-slate-500">Products</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">12K</p>
            <p className="text-xs uppercase tracking-[.12em] text-slate-500">Followers</p>
          </div>

          <button className="rounded-full bg-[#68B8C1] px-7 py-2 text-sm font-semibold text-white transition hover:bg-[#4f9ea7] sm:ml-2">
            Follow
          </button>
        </div>
      </div>
    </div>
  );
}
