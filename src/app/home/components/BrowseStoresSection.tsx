import type { BrowseStore } from "../mockData";
import { ChevronDown, FilterIcon, SearchIcon } from "./icons";
import StoreCard from "./StoreCard";

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
        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-teal-500 transition-colors">
          <ChevronDown />
        </button>
      </div>
    </section>
  );
}
