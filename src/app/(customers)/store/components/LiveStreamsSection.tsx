export default function LiveStreamsSection() {
  return (
    <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 5v14l11-7L8 5Z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Join Our Live Streams</h3>
            <p className="text-sm text-slate-500">Don’t miss out exclusive opportunities</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            aria-label="Facebook"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-blue-600 hover:bg-gray-50"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.876v-6.99H7.898v-2.886h2.54V9.797c0-2.508 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.886h-2.33V21.876C18.343 21.128 22 16.991 22 12z" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Instagram"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-pink-500 hover:bg-gray-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <path d="M16 11.37a4 4 0 1 1-7.999.001A4 4 0 0 1 16 11.37z" />
              <path d="M17.5 6.5h.01" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="WhatsApp"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-emerald-600 hover:bg-gray-50"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M20.52 3.48A11.95 11.95 0 0012 0C5.372 0 0 5.373 0 12a11.96 11.96 0 001.748 6.085L0 24l5.984-1.737A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12 0-3.216-1.26-6.21-3.48-8.52zM17.21 15.56c-.26.72-1.5 1.37-2.07 1.45-.55.08-1.02.11-1.93-.1-1.8-.34-3.04-1.62-3.51-2.09-.46-.46-1.03-.31-1.55-.15-.48.15-1.86.68-2.83-1.32-.3-.55-1.07-.9-1.07-.9s-.18-.52-.18-1.25c0-.74.53-1.1.72-1.24.19-.14.42-.17.63-.1.22.06.53.24.72.36.19.12.39.14.58.05.18-.08.84-.33 1.08-.41.24-.08.45-.03.63.04.18.08.56.21.87.47.31.26.88.95 1.05 1.15.17.2.28.44.19.7-.09.26-.41.71-.56.95-.15.24-.29.42-.07.68.22.26 1.2 1.96 2.6 2.66 1.06.54 1.54.65 1.88.53.35-.12 1.14-.41 1.3-.65.16-.24.16-.45.11-.62-.05-.17-.18-.29-.37-.43z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
