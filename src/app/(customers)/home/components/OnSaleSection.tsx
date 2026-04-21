import Image from "next/image";
import Link from "next/link";
import type { OnSaleStore } from "../mockData";

interface OnSaleSectionProps {
  onSaleStores: OnSaleStore[];
}

export default function OnSaleSection({ onSaleStores }: OnSaleSectionProps) {
  return (
    <section className="mb-6 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-center gap-1.5 mb-3 sm:justify-start">
        <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white text-[8px] font-bold">!</span>
        </span>
        <span className="text-xs font-bold text-gray-800 tracking-wide uppercase">On Sale</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {onSaleStores.map((store) => (
          <Link
            key={store.id}
            href="/store"
            className="flex min-w-[84px] flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-slate-50 p-2 text-center transition hover:border-teal-300 hover:bg-white"
          >
            <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={store.img}
                alt={store.name}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <span className="text-[10px] font-medium text-slate-700 truncate max-w-[70px]">
              {store.name}
            </span>
          </Link>
        ))}
      </div>

      <Link
        href="/sale"
        className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
      >
        View All
      </Link>
    </section>
  );
}
