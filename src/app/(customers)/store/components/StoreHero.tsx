import Image from "next/image";

export default function StoreHero() {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm">
      <div className="relative h-[260px] w-full overflow-hidden rounded-2xl bg-slate-200">
        <Image
          src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=80"
          alt="Store banner"
          fill
          className="object-cover"
        />
      </div>

      <div className="mt-4 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-xl font-semibold text-slate-600">
            S
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">Name of the store</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Description of the store can be written here
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                Ranked #1
              </span>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                On Sale
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">8</p>
            <p className="text-xs uppercase tracking-[.12em] text-slate-500">Products</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">12K</p>
            <p className="text-xs uppercase tracking-[.12em] text-slate-500">Followers</p>
          </div>

          <button className="rounded-full bg-[#5fb9c3] px-7 py-2 text-sm font-semibold text-white transition hover:bg-[#4aaab4]">
            Follow
          </button>
        </div>
      </div>
    </div>
  );
}
