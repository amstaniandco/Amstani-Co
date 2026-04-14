export default function ShippingSection() {
  return (
    <article className="md:col-span-8 rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Shipping Details</h2>
        <p className="text-sm text-slate-500">Recent Addresses</p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border-2 border-cyan-400 p-4 shadow-sm">
          <h3 className="font-semibold text-slate-800">Muhammad Taqi</h3>
          <p className="text-sm text-slate-600">House # 341, Street 18, I-16</p>
          <p className="text-sm text-slate-600">Islamabad</p>
          <p className="text-sm font-bold text-slate-800">4080</p>
        </div>
        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-800">Muhammad Taqi</h3>
          <p className="text-sm text-slate-600">House # 341, Street 18, I-16</p>
          <p className="text-sm text-slate-600">Islamabad</p>
          <p className="text-sm font-semibold text-slate-800">4080</p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="h-44 w-full rounded-lg bg-gray-200" />
        <div className="mt-4 flex justify-center">
          <button className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-cyan-500">
            Select Location
          </button>
        </div>
      </div>
    </article>
  );
}
