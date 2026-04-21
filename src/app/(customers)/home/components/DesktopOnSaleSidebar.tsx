import Image from "next/image";
import Link from "next/link";
import type { OnSaleStore } from "../mockData";

interface DesktopOnSaleSidebarProps {
  onSaleStores: OnSaleStore[];
}

export default function DesktopOnSaleSidebar({ onSaleStores }: DesktopOnSaleSidebarProps) {
  return (
    <div className="rounded-2xl border border-[#d6dde5] bg-[#f6fafb] p-5">
      <div className="mb-3 flex items-center gap-1.5">
        <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">!</span>
        </span>
        <span className="text-sm font-semibold text-gray-800 tracking-wide uppercase">On Sale</span>
      </div>

      <div className="space-y-3">
        {onSaleStores.map((store) => (
          <Link
            key={store.id}
            href="/store"
            className="group flex items-center gap-2.5 cursor-pointer"
          >
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[#dbe3eb]">
              <Image
                src={store.img}
                alt={store.name}
                fill
                sizes="44px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="text-sm font-medium text-slate-600 transition-colors group-hover:text-teal-700">
              {store.name}
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/sale"
        className="mt-5 block w-full rounded-full border border-[#b7cad8] bg-white py-2 text-center text-sm font-medium text-slate-600 transition-colors hover:border-[#7abfce] hover:text-teal-700"
      >
        View All
      </Link>
    </div>
  );
}
