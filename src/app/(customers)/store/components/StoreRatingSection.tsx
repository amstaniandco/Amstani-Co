export default function StoreRatingSection() {
  const ratingBreakdown = [
    { stars: 5, percent: "95%", width: "w-[95%]" },
    { stars: 4, percent: "5%", width: "w-[5%]" },
    { stars: 3, percent: "0%", width: "w-[0%]" },
  ];

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 bg-blue-100 flex items-center justify-center rounded">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-4 h-4 text-blue-500"
          >
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.26h6.584c.969 0 1.371 1.24.588 1.81l-5.33 3.872 2.036 6.26c.3.921-.755 1.688-1.538 1.118L12 18.347l-5.327 3.9c-.783.57-1.838-.197-1.538-1.118l2.036-6.26-5.33-3.872c-.783-.57-.38-1.81.588-1.81h6.584l2.036-6.26z" />
          </svg>
        </div>
        <div className="font-semibold text-gray-700">Store Rating</div>
      </div>

      <div className="flex items-start gap-6">
        <div className="flex flex-col items-start">
          <div className="text-5xl font-bold text-gray-800">5.0</div>
          <div className="flex text-yellow-400 mt-1">
            {[...Array(5)].map((_, idx) => (
              <svg
                key={idx}
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-5 h-5"
              >
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.26h6.584c.969 0 1.371 1.24.588 1.81l-5.33 3.872 2.036 6.26c.3.921-.755 1.688-1.538 1.118L12 18.347l-5.327 3.9c-.783.57-1.838-.197-1.538-1.118l2.036-6.26-5.33-3.872c-.783-.57-.38-1.81.588-1.81h6.584l2.036-6.26z" />
              </svg>
            ))}
          </div>
          <div className="text-sm text-gray-500 mt-1">128 reviews</div>
        </div>

        <div className="flex-1 space-y-3">
          {ratingBreakdown.map((item) => (
            <div key={item.stars} className="flex items-center gap-2">
              <div className="text-sm w-4">{item.stars}</div>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full bg-yellow-400 ${item.width}`} />
              </div>
              <div className="text-sm text-gray-500">{item.percent}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="font-medium text-gray-700 mb-2">Write a Review</div>
        <div className="flex gap-2 text-gray-400 cursor-pointer">
          {[...Array(5)].map((_, idx) => (
            <svg
              key={idx}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-6 h-6"
            >
              <path
                strokeWidth="1.5"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.26h6.584c.969 0 1.371 1.24.588 1.81l-5.33 3.872 2.036 6.26c.3.921-.755 1.688-1.538 1.118L12 18.347l-5.327 3.9c-.783.57-1.838-.197-1.538-1.118l2.036-6.26-5.33-3.872c-.783-.57-.38-1.81.588-1.81h6.584l2.036-6.26z"
              />
            </svg>
          ))}
        </div>

        <textarea
          rows={3}
          placeholder="Share your experience..."
          className="mt-3 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#5fb9c3]"
        />

        <button className="mt-3 rounded-xl bg-[#5fb9c3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4aaab4]">
          Submit Review
        </button>
      </div>
    </div>
  );
}
