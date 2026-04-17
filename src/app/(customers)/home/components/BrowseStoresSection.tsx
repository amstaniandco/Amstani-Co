import type { BrowseStore } from "../mockData";
import Link from "next/link";
import StoreCard from "./StoreCard";

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 10h10M11 16h2" />
  </svg>
);

const ChevronDown = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Browse Stores</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search a store"
              className="pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-full bg-white outline-none focus:border-teal-400 transition-colors w-40"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </span>
          </div>
          <button className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:border-teal-400 hover:text-teal-500 transition-colors">
            <FilterIcon />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <Link href="/store" className="flex flex-col items-center gap-1 text-gray-400 hover:text-teal-500 transition-colors">
          <ChevronDown />
        </Link>
      </div>
    </section>
  );
}
