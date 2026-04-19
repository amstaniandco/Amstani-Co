import Link from "next/link";
import type { ActiveOrder, OnSaleStore } from "../mockData";
import DesktopOnSaleSidebar from "./DesktopOnSaleSidebar";

interface SidebarProps {
  onSaleStores: OnSaleStore[];
  activeOrders: ActiveOrder[];
}

export default function Sidebar({ onSaleStores, activeOrders }: SidebarProps) {
  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-4">
      <div className="hidden lg:block">
        <DesktopOnSaleSidebar onSaleStores={onSaleStores} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-gray-800 tracking-wide uppercase">Active Orders</span>
        </div>

        {activeOrders.map((order) => (
          <div key={order.id} className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-1 self-stretch bg-teal-200 rounded-full" />
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pending Tackle</p>
                <p className="text-xs font-semibold text-gray-800">{order.id}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 mt-2">
              <div className="w-1 self-stretch bg-green-200 rounded-full" />
              <div>
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">{order.status}</p>
                <p className="text-xs font-semibold text-gray-800">{order.detail}</p>
                <p className="text-[10px] text-gray-400">{order.sub}</p>
              </div>
            </div>
          </div>
        ))}

        <Link href="/profile" className="mt-4 block w-full border border-gray-200 rounded-full text-xs text-gray-600 py-1.5 hover:border-teal-400 hover:text-teal-600 transition-colors font-medium text-center">
          View All History
        </Link>
      </div>
    </aside>
  );
}
