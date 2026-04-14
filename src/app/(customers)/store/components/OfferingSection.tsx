import Link from "next/link";

export default function OfferingSection() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 7h18M12 7v14M7 7v4m10-4v4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Offering stores for purchase</h3>
            <p className="text-sm text-gray-500">
              Connect to learn more about available opportunities and own your e-commerce textile marketplace now
            </p>
          </div>
        </div>

        <Link
          href="/store/apply"
          className="h-11 rounded-xl border border-gray-200 bg-white px-6 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 inline-flex items-center justify-center"
        >
          Fill form
        </Link>
      </div>
    </div>
  );
}
