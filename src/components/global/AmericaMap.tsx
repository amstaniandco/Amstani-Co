export default function AmericaMap() {
  return (
    <section className="py-20 bg-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-slate-900 mb-3">
            Shipping Across the United States
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Amstani Co delivers nationwide with reliable service from coast to
            coast. Explore our coverage and see how quickly we can reach you.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.15),_transparent_30%)]" />
            <div className="relative p-8 sm:p-12">
              <svg
                viewBox="0 0 1024 640"
                className="mx-auto h-auto w-full max-w-4xl"
                role="img"
                aria-label="United States map with delivery locations"
              >
                <path
                  d="M96 192c40-40 96-64 160-64h48l16-32 80-16 24 24 64 8 8 56 32 8 56-8 40 24 24 56 8 32 40 56 40 24 88 8 72-16 48 24 24 24 48 8 16 48 8 24 40 16 24 16 8 24-16 24-24 8-16 16-40 8-24-8-24-48-8-16-8-24-24-24-40-16-24-24-8-24-32-24-48-8-24-24-24-24-24-8-40-16-56-8-40-24-24-40-24-16-24-24-8-16-24-16-24-24-24-24-24-8-16-24-16-8-16-24-8-24-8-16-24 8-24 24-16 24-8 40 8 56 8 32 8 24 24 24 24 24 8 40 16 56 8 40 24 24 40 24 16 24 24 8 16 24 16 24 24 24 24 24 8 16 24 16 8 16 24 8 24 8 16 24 8 24 8 16 24 8 24 8 16 24 8 24 8 16 24 8 24 8 16 24 8 24 8 16 24 8 24 8 16 24 8 24 8" 
                  fill="#cbd5e1"
                />
                <circle cx="240" cy="260" r="10" fill="#2563eb" />
                <circle cx="400" cy="220" r="10" fill="#16a34a" />
                <circle cx="560" cy="280" r="10" fill="#0ea5e9" />
                <circle cx="720" cy="240" r="10" fill="#ef4444" />
                <circle cx="840" cy="340" r="10" fill="#f59e0b" />
                <g fill="#0f172a" opacity="0.9">
                  <circle cx="240" cy="260" r="4" />
                  <circle cx="400" cy="220" r="4" />
                  <circle cx="560" cy="280" r="4" />
                  <circle cx="720" cy="240" r="4" />
                  <circle cx="840" cy="340" r="4" />
                </g>
              </svg>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-3xl font-semibold text-slate-900">48</div>
                  <div className="mt-2 text-sm text-slate-500">States served</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-3xl font-semibold text-slate-900">2-day</div>
                  <div className="mt-2 text-sm text-slate-500">Average delivery time</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-3xl font-semibold text-slate-900">100%</div>
                  <div className="mt-2 text-sm text-slate-500">Trusted nationwide shipping</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
