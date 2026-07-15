import Link from "next/link";

export default async function StoreOfferPage({
  searchParams,
}: {
  searchParams: Promise<{ storeId?: string }>;
}) {
  const params = await searchParams;
  const storeId = params?.storeId;
  return (
    <div className="w-full bg-[#f7f7f7] py-6">
      <div className="mx-auto w-full max-w-2xl items-center px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-600">Store</p>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Offering stores for purchase
            </h1>
          </div>
          <Link
            href="/store"
            className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back
          </Link>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            Connect to learn more about available opportunities and own your
            e-commerce textile marketplace now.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/store/chat"
              className="flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Chat With Store Owner
            </Link>
            <Link
              href={storeId ? `/form?storeId=${storeId}` : "/form"}
              className="flex h-14 items-center justify-center rounded-2xl bg-[#5fb9c3] text-sm font-semibold text-white transition hover:bg-[#4aaab4]"
            >
              Fill form
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
