import Image from "next/image";
import Link from "next/link";
import type { OnSaleStore } from "../mockData";

interface DesktopOnSaleSidebarProps {
  onSaleStores: OnSaleStore[];
}

export default function DesktopOnSaleSidebar({ onSaleStores }: DesktopOnSaleSidebarProps) {
  return (
    <div className="home-side-card rounded-2xl border border-[#d6dde5] bg-[#f6fafb] p-5 dark:border-slate-700 dark:bg-[#0f1b2f]">
      <div className="mb-3 flex items-center gap-1.5">
        <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">!</span>
        </span>
        <span className="text-sm font-semibold tracking-wide uppercase text-gray-800 dark:text-slate-100">On Sale</span>
      </div>

      <div className="space-y-3">
        {onSaleStores.map((store) => (
          <Link
            key={store.id}
            href="/store"
            className="group flex items-center gap-2.5 cursor-pointer"
          >
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[#dbe3eb] dark:border-slate-600">
              <Image
                src={store.img}
                alt={store.name}
                fill
                sizes="44px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="text-sm font-medium text-slate-600 transition-colors group-hover:text-teal-700 dark:text-slate-300 dark:group-hover:text-[#7ad5df]">
              {store.name}
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/sale"
        className="mt-5 block w-full rounded-full border border-[#b7cad8] bg-white py-2 text-center text-sm font-medium text-slate-600 transition-colors hover:border-[#7abfce] hover:text-teal-700 dark:border-slate-600 dark:bg-[#12213a] dark:text-slate-200 dark:hover:border-[#4DB8B8] dark:hover:text-[#7ad5df]"
      >
        View All
      </Link>
    </div>
  );
}
