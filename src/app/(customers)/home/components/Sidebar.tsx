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

      <div className="rounded-2xl border border-[#d6dde5] bg-[#f6fafb] p-5">
        <div className="mb-3 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-sm font-semibold text-gray-800 tracking-wide uppercase">Active Orders</span>
        </div>

        {activeOrders.map((order) => (
          <div key={order.id} className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-1 self-stretch rounded-full bg-teal-200" />
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pending Tackle</p>
                <p className="text-sm font-semibold text-gray-800">{order.id}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 mt-2">
              <div className="w-1 self-stretch rounded-full bg-green-200" />
              <div>
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">{order.status}</p>
                <p className="text-sm font-semibold text-gray-800">{order.detail}</p>
                <p className="text-xs text-gray-400">{order.sub}</p>
              </div>
            </div>
          </div>
        ))}

        <Link href="/profile" className="mt-5 block w-full rounded-full border border-[#b7cad8] bg-white py-2 text-center text-sm font-medium text-slate-600 transition-colors hover:border-[#7abfce] hover:text-teal-700">
          View All History
        </Link>
      </div>
    </aside>
  );
}
