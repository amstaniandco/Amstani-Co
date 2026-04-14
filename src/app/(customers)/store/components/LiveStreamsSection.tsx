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
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 5v14l11-7L8 5Z" fill="currentColor" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Join Our Live Streams</h3>
            <p className="text-sm text-gray-500">Don&apos;t miss out exclusive opportunities</p>
          </div>
        </div>

        <div className="flex gap-3">
          {['f', '☐', '☎'].map((label) => (
            <button
              key={label}
              className="flex h-11 w-14 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
