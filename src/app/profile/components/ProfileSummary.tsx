export default function ProfileSummary() {
  return (
    <aside className="md:col-span-4 rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-md">
          <img
            src="https://i.pravatar.cc/160?img=47"
            alt="Profile"
            className="h-full w-full object-cover"
          />
          <div className="absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400 text-xs font-bold text-white shadow-md">
            ✎
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Julian Amstani</h1>
          <p className="text-sm text-slate-500">julian@amstani.co</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Name</label>
          <input value="Julian Amstani" readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">State</label>
          <input value="Texas" readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
          <input value="julian@amstani.co" readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Phone Number</label>
          <input value="+1 (555) 890-4421" readOnly className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" />
        </div>
      </div>
    </aside>
  );
}
