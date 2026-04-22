import type { BrowseStore } from "../mockData";
import Link from "next/link";
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

const ChevronDown = () => (
  <svg className="h-5 w-5 text-gray-400 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

interface BrowseStoreSectionProps {
  stores: BrowseStore[];
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

export default function BrowseStoresSection({ stores, searchQuery, onSearchQueryChange }: BrowseStoreSectionProps) {
  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <section className="home-section">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="home-heading text-[28px] font-extrabold leading-none text-[#0f172a] dark:text-slate-100 sm:text-[32px]">Browse Stores</h2>
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
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d4dbe2] bg-[#f7fafc] text-slate-500 transition-colors hover:border-[#7acbd6] hover:text-[#0f172a] dark:border-slate-600 dark:bg-[#101a2d] dark:text-slate-300 dark:hover:text-white">
            <FilterIcon />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:gap-5">
        {filteredStores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>

      <div className="mt-5 flex justify-center">
        <Link href="/store" className="flex flex-col items-center gap-1 text-[#0b6bff] transition-colors hover:text-[#0354c9] dark:text-[#78d2de] dark:hover:text-[#5dbbc9]">
          <ChevronDown />
        </Link>
      </div>
    </section>
  );
}
