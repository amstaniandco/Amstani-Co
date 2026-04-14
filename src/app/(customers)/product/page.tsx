export default function ProductPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Product Section */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Image Side - Separate Container */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col">
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="relative flex items-center justify-center rounded-2xl bg-slate-100 flex-1 overflow-hidden">
                <div className="absolute left-6 top-6 inline-flex items-center rounded-full border border-red-400 bg-white px-3 py-1 text-xs font-semibold text-red-600 z-10">
                  On Sale
                </div>
                <div className="absolute right-6 top-6 inline-flex items-center rounded-full border border-red-400 bg-white px-3 py-1 text-xs font-semibold text-red-600 z-10">
                  15% Off
                </div>
                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
                  alt="Product"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-3 mt-auto">
                {[1, 2, 3, 4].map((i) => (
                  <button
                    key={i}
                    className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80"
                      alt={`Thumbnail ${i}`}
                      className="h-20 w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Text Side - Separate Container */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs">
            <div className="space-y-6">
              <div>
                <h1 className="text-5xl font-bold text-teal-500">PRODUCT NAME</h1>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-3xl font-bold text-slate-900">$51</span>
                  <span className="text-lg text-slate-400 line-through">$60</span>
                </div>
              </div>

              <div>
                <p className="text-lg font-bold text-slate-900">Material: Material Name</p>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
                  commodo ligula eget dolor. Aenean massa. Cum sociis natoque
                  penatibus et magnis dis parturient montes, nascetur ridiculus mus.
                  Donec quam felis, ultricies nec, pellentesque eu, pretium quis,
                  sem. Nulla consequat massa quis enim. Donec pede justo, fringilla
                  vel, aliquet nec, vulputate
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">Select Size</p>
                  <div className="flex gap-2">
                    {['38', '40', '42', '44'].map((size) => (
                      <button
                        key={size}
                        className="h-10 w-10 rounded-full border-2 border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-slate-400 transition"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">Select Color</p>
                  <div className="flex gap-2">
                    {[
                      { color: '#8BD7DF', border: 'border-teal-400 ring-2 ring-teal-200' },
                      { color: '#000000', border: 'border-slate-300' },
                      { color: '#D5B8A0', border: 'border-slate-300' },
                      { color: '#D4AF37', border: 'border-slate-300' },
                    ].map((item, i) => (
                      <button
                        key={i}
                        className={`h-10 w-10 rounded-lg border-2 ${item.border} transition hover:ring-2 hover:ring-slate-300`}
                        style={{ backgroundColor: item.color }}
                        aria-label={`Color option ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <button className="w-full rounded-full bg-teal-500 py-4 text-base font-bold text-white hover:bg-teal-600 transition">
                  Add to cart
                </button>
                <button className="w-full rounded-full border-2 border-slate-900 bg-white py-4 text-base font-bold text-slate-900 hover:bg-slate-50 transition">
                  Custom Order
                </button>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-center">
                <p className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-teal-500 text-xs text-teal-500">
                    ✓
                  </span>
                  Secure Checkout
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor. Aenean
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Section */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xs">
          <div className="flex items-start gap-8">
            <div className="w-40">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-slate-900">5.0</span>
                <div className="flex gap-1 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="text-lg">★</span>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-500">128 reviews</p>
            </div>

            <div className="flex-1 space-y-4">
              {[
                { stars: 5, count: 95, percent: 95 },
                { stars: 4, count: 5, percent: 5 },
                { stars: 3, count: 0, percent: 0 },
              ].map((item) => (
                <div key={item.stars} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{item.stars}</span>
                    <div className="h-2 flex-1 mx-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{item.percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="text-sm font-bold text-slate-700 mb-4">Write a Review</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} className="text-2xl text-slate-300 hover:text-yellow-400 transition">
                  ☆
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mx-auto max-w-6xl px-4 py-6 pb-20">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xs">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 border-b border-slate-200 pb-6 last:border-0">
                <div className="h-12 w-12 rounded-xl bg-slate-400 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-bold text-slate-900">Name of user</p>
                    <div className="flex gap-1 text-yellow-400">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <span key={j} className="text-sm">★</span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Supporting line text lorem ipsum dolor sit amet, consectetur.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

