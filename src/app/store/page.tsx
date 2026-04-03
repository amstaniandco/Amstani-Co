import Image from "next/image";
import Link from "next/link";

type ChatMessageProps = {
  name: string;
  time: string;
  text: string;
  avatarLabel: string;
  avatarClass?: string;
  bubbleClass?: string;
};

function ChatMessage({
  name,
  time,
  text,
  avatarLabel,
  avatarClass = "bg-gray-200 text-gray-600",
  bubbleClass = "bg-gray-50",
}: ChatMessageProps) {
  return (
    <div className="flex gap-3">
      <div
        className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${avatarClass}`}
      >
        {avatarLabel}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-gray-800">{name}</p>
          <span className="text-xs text-gray-400">{time}</span>
        </div>
        <p className={`mt-1 rounded-xl px-3 py-2 text-sm ${bubbleClass}`}>
          {text}
        </p>
      </div>
    </div>
  );
}

export default function StorePage() {
  const products = Array.from({ length: 9 }).map((_, i) => ({
    id: i + 1,
    name: "Name of product",
    price: 51,
    oldPrice: 60,
    rating: 4.9,
    image: "/product.png",
  }));

  return (
    <div className="w-full bg-[#f7f7f7] py-6">
      <div className="mx-auto w-full">
        {/* TOP SECTION (Store Card + Live Chat) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Store Card */}
          <div className="col-span-2 rounded-2xl bg-white p-5 shadow-sm">
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
                  <h2 className="text-xl font-bold text-gray-900">
                    Name of the store
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Description of the store can be written here
                  </p>

                  <div className="mt-2 flex items-center gap-2">
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

          {/* Live Chat */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Live Chat
              </h3>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                9:00 AM to 3:00 PM
              </span>
            </div>

            <div className="mt-4 space-y-4">
              <ChatMessage
                name="Sarah M."
                time="10:42 AM"
                text="Is the Midnight Blue silk stretchy?"
                avatarLabel="S"
                avatarClass="bg-gray-200 text-gray-600"
              />

              <ChatMessage
                name="California Store"
                time="10:43 AM"
                text="Hi Sarah! It has a very slight natural give, but it's a woven silk so no elastane. Beautiful drape though!"
                avatarLabel="CS"
                avatarClass="bg-[#5fb9c3] text-white"
                bubbleClass="bg-blue-50 border border-blue-100 text-gray-700"
              />

              <ChatMessage
                name="David K."
                time="10:44 AM"
                text="Just bought 5 yards of the brocade. Stunning quality! 😍"
                avatarLabel="D"
                avatarClass="bg-gray-200 text-gray-600"
              />
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <input
                placeholder="Say something..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
              <button className="text-[#5fb9c3] hover:text-[#3e9ca6]">➤</button>
            </div>

            <button className="mt-4 w-full rounded-xl bg-[#5fb9c3] py-3 text-sm font-semibold text-white hover:bg-[#4aaab4]">
              Join WhatsApp Call
            </button>
          </div>
        </div>

        {/* OFFERING STORES */}
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
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
                  <path d="M3 7h18M12 7v14M7 7v4m10-4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-gray-800 mb-2">Offering stores for purchase</h3>
                <p className="text-sm text-gray-500">
                  Connect to learn more about available opportunities and own your e-commerce textile marketplace now
                </p>
              </div>
            </div>

            <Link href="/store/apply" className="h-11 rounded-xl border border-gray-200 bg-white px-6 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 inline-flex items-center justify-center">
              Fill form
            </Link>
          </div>
        </div>
      </div>

      {/* LIVE STREAMS */}
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
              <h3 className="text-sm font-bold text-gray-800 mb-2">
                Join Our Live Streams
              </h3>
              <p className="text-sm text-gray-500">
                Don&apos;t miss out exclusive opportunities
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex h-11 w-14 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50">
              f
            </button>
            <button className="flex h-11 w-14 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50">
              ☐
            </button>
            <button className="flex h-11 w-14 items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50">
              ☎
            </button>
          </div>
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <span className="text-[#5fb9c3]">📦</span>
          <h3 className="text-base font-semibold text-gray-800">
            Our Products
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="relative h-[230px] w-full overflow-hidden rounded-2xl bg-gray-100">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="mt-3 flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {p.name}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-lg font-bold text-gray-900">
                      ${p.price}
                    </p>
                    <p className="text-sm text-gray-400 line-through">
                      ${p.oldPrice}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-semibold text-[#5fb9c3]">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline-block mr-1"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    {p.rating}
                  </p>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.1 21.55l-.1.1-.11-.1C7.14 17.24 4 14.39 4 10.5 4 7.42 6.42 5 9.5 5c1.74 0 3.41.81 4.5 2.09C15.09 5.81 16.76 5 18.5 5 21.58 5 24 7.42 24 10.5c0 3.89-3.14 6.74-7.9 11.05z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5fb9c3] text-white hover:bg-[#4aaab4]">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 6h.01M6 6l1.5 9.3a1 1 0 001 .92h9a1 1 0 001-.92L18 6H6Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8 6V4a2 2 0 114 0v2m4 0V4a2 2 0 114 0v2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STORE RATING */}
      <div className="mt-8 mx-auto bg-white rounded-2xl shadow-lg p-6">
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
            {[
              { stars: 5, percent: "95%", width: "w-[95%]" },
              { stars: 4, percent: "5%", width: "w-[5%]" },
              { stars: 3, percent: "0%", width: "w-[0%]" },
            ].map((item) => (
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
    </div>
  );
}
