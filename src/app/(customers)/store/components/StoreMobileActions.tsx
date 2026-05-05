import Link from "next/link";
import { useStore } from "../../../../context/StoreContext";

export default function StoreMobileActions() {
  const store = useStore();
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href={store?._id ? `/store/offer?storeId=${store._id}` : "/store/offer"}
          className="rounded-3xl border border-gray-200 bg-white p-4 transition hover:shadow-md"
        >
          <div className="flex items-center gap-3 text-slate-900">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path d="M3 7h18M12 7v14M7 7v4m10-4v4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold">Offering stores for purchase</p>
              <p className="mt-1 text-xs text-slate-500">Connect to learn more about available opportunities</p>
            </div>
          </div>
          <div className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700">
            Chat With Store Owner
          </div>
        </Link>

        <div className="rounded-3xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3 text-slate-900">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M8 5v14l11-7L8 5Z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold">Join Our Live Streams</p>
              <p className="mt-1 text-xs text-slate-500">Don't miss out exclusive opportunities</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2">
            <button className="flex h-11 flex-1 items-center justify-center rounded-2xl border border-gray-200 text-blue-600 hover:bg-blue-50">
              <span className="sr-only">Facebook</span>
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.876v-6.99H7.898v-2.886h2.54V9.797c0-2.508 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.886h-2.33V21.876C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </button>
            <button className="flex h-11 flex-1 items-center justify-center rounded-2xl border border-gray-200 text-pink-500 hover:bg-pink-50">
              <span className="sr-only">Instagram</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <path d="M16 11.37a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                <path d="M17.5 6.5h.01" />
              </svg>
            </button>
            <button className="flex h-11 flex-1 items-center justify-center rounded-2xl border border-gray-200 text-emerald-600 hover:bg-emerald-50">
              <span className="sr-only">WhatsApp</span>
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M20.52 3.48A11.95 11.95 0 0012 0C5.372 0 0 5.373 0 12a11.96 11.96 0 001.748 6.085L0 24l5.984-1.737A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12 0-3.216-1.26-6.21-3.48-8.52zM17.21 15.56c-.26.72-1.5 1.37-2.07 1.45-.55.08-1.02.11-1.93-.1-1.8-.34-3.04-1.62-3.51-2.09-.46-.46-1.03-.31-1.55-.15-.48.15-1.86.68-2.83-1.32-.3-.55-1.07-.9-1.07-.9s-.18-.52-.18-1.25c0-.74.53-1.1.72-1.24.19-.14.42-.17.63-.1.22.06.53.24.72.36.19.12.39.14.58.05.18-.08.84-.33 1.08-.41.24-.08.45-.03.63.04.18.08.56.21.87.47.31.26.88.95 1.05 1.15.17.2.28.44.19.7-.09.26-.41.71-.56.95-.15.24-.29.42-.07.68.22.26 1.2 1.96 2.6 2.66 1.06.54 1.54.65 1.88.53.35-.12 1.14-.41 1.3-.65.16-.24.16-.45.11-.62-.05-.17-.18-.29-.37-.43z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <Link
        href="/store/chat"
        className="flex items-center justify-between rounded-3xl border border-gray-200 bg-white px-4 py-5 text-sm font-semibold text-slate-900 transition hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M17 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2" />
              <path d="M9 12l3 3 3-3" />
            </svg>
          </div>
          <div>Join Live Chat</div>
        </div>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-slate-500">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>
    </div>
  );
}
