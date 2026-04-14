import {
  Bell,
  Boxes,
  ChartLine,
  LogOut,
  MessageCircle,
  Music2,
  Package,
  TriangleAlert,
  Store,
  Timer,
  UserRound,
} from "lucide-react";

type SidebarItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
};

const sidebarItems: SidebarItem[] = [
  { label: "Chats", icon: MessageCircle },
  { label: "Orders", icon: Package },
  { label: "Performance", icon: ChartLine },
  { label: "Products", icon: Boxes },
  { label: "Timings", icon: Timer },
  { label: "Communications", icon: Bell },
  { label: "Claims", icon: TriangleAlert },
  { label: "Music", icon: Music2 },
  { label: "Profile", icon: UserRound },
];

type OwnerChatSidebarProps = {
  activeLabel?: SidebarItem["label"];
};

export default function OwnerChatSidebar({ activeLabel = "Chats" }: OwnerChatSidebarProps) {
  return (
    <aside className="w-full border-b border-slate-200 bg-[#f7f7f7] p-4 md:flex md:min-h-full md:max-w-[220px] md:flex-col md:border-b-0 md:border-r">
      <div className="mb-4 flex items-center gap-2 px-2 pt-1 md:mb-8 md:pt-2">
        <Store className="h-6 w-6 text-[#61bbc5]" />
        <p className="text-lg font-bold tracking-tight text-slate-900">AMSTANI &amp; CO.</p>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:block md:space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.label === activeLabel;

          return (
            <button
              key={item.label}
              type="button"
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition md:w-full ${
                isActive
                  ? "bg-[#65bbc5] text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        className="mt-3 flex items-center gap-3 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-50 md:mt-auto md:border-0"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </aside>
  );
}
