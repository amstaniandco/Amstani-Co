import LiveChat from "../components/LiveChat";
import Link from "next/link";

export default function StoreChatPage() {
  return (
    <div className="w-full min-h-screen bg-[#f7f7f7] py-6">
      <div className="mx-auto w-full px-4 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span className="text-lg">←</span>
            Back
          </Link>
        </div>

        <div className="rounded-[32px] bg-white p-4 shadow-sm">
          <LiveChat hideWrapper className="gap-4" />
        </div>
      </div>
    </div>
  );
}
