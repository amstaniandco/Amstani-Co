import LiveChat from "../components/LiveChat";
import Link from "next/link";

export default function StoreChatPage() {
  return (
    <div className="w-full bg-[#f7f7f7] py-6">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-600">Store</p>
            <h1 className="text-2xl font-bold text-slate-900">Live Chat</h1>
          </div>
          <Link
            href="/store"
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back
          </Link>
        </div>
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <LiveChat />
        </div>
      </div>
    </div>
  );
}
