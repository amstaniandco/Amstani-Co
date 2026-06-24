"use client";

import { useState, useRef, useEffect } from "react";
import type { BrowseStore } from "../mockData";
import StoreCard from "./StoreCard";

const SearchIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 10h10M11 16h2" />
  </svg>
);

type SortOption = "default" | "az" | "za";

interface BrowseStoreSectionProps {
  stores: BrowseStore[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  stateFilter?: string;
}

export default function BrowseStoresSection({ stores, searchQuery, onSearchQueryChange, stateFilter }: BrowseStoreSectionProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("default");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  let filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (sort === "az") filteredStores = [...filteredStores].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "za") filteredStores = [...filteredStores].sort((a, b) => b.name.localeCompare(a.name));

  const SORT_LABELS: Record<SortOption, string> = { default: "Default", az: "A–Z", za: "Z–A" };

  return (
    <section className="home-section">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="home-heading text-[20px] font-extrabold leading-none text-[#0f172a] dark:text-slate-100 sm:text-[32px]">Browse Stores</h2>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-[320px] lg:w-[420px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search a store"
              className="home-input h-10 w-full rounded-full border border-[#d4dbe2] bg-[#f7fafc] pl-4 pr-9 text-sm text-slate-700 outline-none transition-colors focus:border-[#7acbd6] dark:border-slate-600 dark:bg-[#101a2d] dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-[#4DB8B8]"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300">
              <SearchIcon />
            </span>
          </div>

          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setSortOpen((v) => !v)}
              title="Sort stores"
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                sort !== "default"
                  ? "border-[#7acbd6] bg-[#7acbd6]/10 text-[#0f172a] dark:border-[#4DB8B8] dark:text-[#4DB8B8]"
                  : "border-[#d4dbe2] bg-[#f7fafc] text-slate-500 hover:border-[#7acbd6] hover:text-[#0f172a] dark:border-slate-600 dark:bg-[#101a2d] dark:text-slate-300 dark:hover:text-white"
              }`}
            >
              <FilterIcon />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-36 rounded-xl border border-[#d4dbe2] bg-white py-1 shadow-lg dark:border-slate-600 dark:bg-[#101a2d]">
                {(["default", "az", "za"] as SortOption[]).map((option) => (
                  <button
                    key={option}
                    onClick={() => { setSort(option); setSortOpen(false); }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                      sort === option ? "font-semibold text-[#0b9db0] dark:text-[#4DB8B8]" : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {SORT_LABELS[option]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {filteredStores.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:gap-5">
          {filteredStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-semibold text-slate-500 dark:text-slate-400">
            {stateFilter ? `No stores found in ${stateFilter}` : "No stores found"}
          </p>
          {stateFilter && (
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
              Try selecting a different state or check back later.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
