import Link from "next/link";
import { useStore } from "../../../../context/StoreContext";

export default function OfferingSection() {
  const store = useStore();
  return (
    <div className="ui-panel rounded-2xl bg-white p-5 shadow-sm dark:border dark:border-slate-700 dark:bg-slate-800">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-slate-700 dark:text-sky-300">
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
            <h3 className="mb-2 text-sm font-bold text-gray-800 dark:text-slate-100">Offering stores for purchase</h3>
            <p className="text-sm text-gray-500 dark:text-slate-300">
              Connect to learn more about available opportunities and own your e-commerce textile marketplace now
            </p>
          </div>
        </div>

        <Link
          href={store?._id ? `/form?storeId=${store._id}` : "/form"}
          data-tutorial-id="customer-store-form"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-[#68B8C1] bg-white px-6 py-2 text-sm font-semibold text-[#68B8C1] transition hover:bg-[#eef9fa] dark:border-[#4f9ea7] dark:bg-slate-700 dark:text-[#7dc8d1] dark:hover:bg-slate-600"
        >
          Fill form
        </Link>
      </div>
    </div>
  );
}
