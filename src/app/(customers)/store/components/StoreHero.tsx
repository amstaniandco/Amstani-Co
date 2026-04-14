import Image from "next/image";

export default function StoreHero() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="relative h-[220px] w-full overflow-hidden rounded-2xl bg-gray-200">
        <Image
          src="/store-banner.jpg"
          alt="store banner"
          fill
          className="object-cover"
        />
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gray-300" />

          <div>
            <h2 className="text-xl font-bold text-gray-900">Name of the store</h2>
            <p className="mt-1 text-sm text-gray-500">
              Description of the store can be written here
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                Ranked #1
              </span>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                On Sale
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">8</p>
            <p className="text-xs text-gray-500">Products</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">12K</p>
            <p className="text-xs text-gray-500">Followers</p>
          </div>

          <button className="rounded-xl bg-[#5fb9c3] px-8 py-2 text-sm font-semibold text-white hover:bg-[#4aaab4]">
            Follow
          </button>
        </div>
      </div>
    </div>
  );
}
