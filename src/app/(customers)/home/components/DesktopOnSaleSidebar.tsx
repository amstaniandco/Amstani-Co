import Image from "next/image";
import Link from "next/link";
import type { OnSaleStore } from "../mockData";

interface DesktopOnSaleSidebarProps {
  onSaleStores: OnSaleStore[];
}

export default function DesktopOnSaleSidebar({ onSaleStores }: DesktopOnSaleSidebarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">!</span>
        </span>
        <span className="text-xs font-bold text-gray-800 tracking-wide uppercase">On Sale</span>
      </div>

      <div className="space-y-3">
        {onSaleStores.map((store) => (
          <Link
            key={store.id}
            href="/store"
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
              <Image
                src={store.img}
                alt={store.name}
                fill
                sizes="40px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="text-xs text-gray-700 font-medium group-hover:text-teal-600 transition-colors">
              {store.name}
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/sale"
        className="mt-4 block w-full border border-gray-200 rounded-full text-xs text-gray-600 py-1.5 hover:border-teal-400 hover:text-teal-600 transition-colors font-medium text-center"
      >
        View All
      </Link>
    </div>
  );
}
