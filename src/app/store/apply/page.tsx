import Link from "next/link";

export default function StoreOwnershipApplicationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 text-white px-8 py-6 rounded-t-3xl">
          <div className="text-2xl font-semibold">
            Store Ownership Application
          </div>
          <div className="text-sm text-gray-300 mt-1">
            Official registration for the State Founder Program. Please provide
            accurate legal documentation.
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Left Section */}
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-3 tracking-wide">
              SELECT JURISDICTION
            </div>

            <div className="bg-gray-100 rounded-2xl p-4 h-[260px] flex items-center justify-center">
              <div className="text-gray-400 text-sm">[ Map Here ]</div>
            </div>
          </div>

          {/* Right Section */}
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-3 tracking-wide">
              IDENTITY CREDENTIALS
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-100 rounded-xl px-4 py-3 text-gray-500">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth="2"
                      d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z"
                    />
                  </svg>
                  <div>Search for a State...</div>
                </div>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeWidth="2" d="M6 9l6 6 6-6" />
                </svg>
              </div>

              <input
                type="text"
                placeholder="Legal Full Name (as per Passport)"
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-700 outline-none border border-gray-200 focus:border-[#5fb9c3]"
              />

              <input
                type="text"
                placeholder="Physical Address"
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-700 outline-none border border-gray-200 focus:border-[#5fb9c3]"
              />

              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-700 outline-none border border-gray-200 focus:border-[#5fb9c3]"
              />

              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-700 outline-none border border-gray-200 focus:border-[#5fb9c3]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-t gap-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
              />
            </svg>
            Confidential high-security application environment.
          </div>

          <button className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-xl shadow-md">
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}
