import Link from "next/link";
import type { ActiveOrder, OnSaleStore } from "../mockData";
import DesktopOnSaleSidebar from "./DesktopOnSaleSidebar";

interface SidebarProps {
  onSaleStores: OnSaleStore[];
  activeOrders: ActiveOrder[];
}

export default function Sidebar({ onSaleStores, activeOrders }: SidebarProps) {
  return (
    <aside className="w-full shrink-0 space-y-5 lg:ml-2 lg:w-[280px]">
      <div className="hidden lg:block">
        <DesktopOnSaleSidebar onSaleStores={onSaleStores} />
      </div>

      <div className="home-side-card rounded-2xl border border-[#d6dde5] bg-[#f6fafb] p-5 dark:border-slate-700 dark:bg-[#0f1b2f]">
        <div className="mb-3 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-sm font-semibold tracking-wide uppercase text-gray-800 dark:text-slate-100">Active Orders</span>
        </div>

        {activeOrders.map((order) => (
          <div key={order.id} className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-1 self-stretch rounded-full bg-teal-200" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Pending Tackle</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">{order.id}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 mt-2">
              <div className="w-1 self-stretch rounded-full bg-green-200" />
              <div>
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">{order.status}</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">{order.detail}</p>
                <p className="text-xs text-gray-400 dark:text-slate-400">{order.sub}</p>
              </div>
            </div>
          </div>
        ))}

        <Link href="/profile" className="mt-5 block w-full rounded-full border border-[#b7cad8] bg-white py-2 text-center text-sm font-medium text-slate-600 transition-colors hover:border-[#7abfce] hover:text-teal-700 dark:border-slate-600 dark:bg-[#12213a] dark:text-slate-200 dark:hover:border-[#4DB8B8] dark:hover:text-[#7ad5df]">
          View All History
        </Link>
      </div>
    </aside>
  );
}
