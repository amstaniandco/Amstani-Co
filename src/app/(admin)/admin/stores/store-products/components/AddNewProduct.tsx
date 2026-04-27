type AddNewProductProps = {
  storeName: string;
};

const rows = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  name: "Name Of Product",
  price: "$51",
  quantity: 423,
}));

export default function AddNewProduct({ storeName }: AddNewProductProps) {
  return (
    <div className="text-slate-700">
      <div className="overflow-hidden rounded-[28px] border border-[#e5ecf1] bg-white shadow-[0_14px_35px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-[#f8fafc] text-[11px] uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-4 py-4 w-[72px]"><span className="sr-only">Select</span></th>
                <th className="px-4 py-4">Image</th>
                <th className="px-4 py-4">Name</th>
                <th className="px-4 py-4">Price</th>
                <th className="px-4 py-4">Quantity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f5] bg-white text-slate-700">
              {rows.map((row, index) => (
                <tr key={row.id} className={index % 2 === 0 ? "bg-[#fbfcfd]" : "bg-white"}>
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-[#cbd5e1] text-cyan-600 focus:ring-cyan-500"
                      aria-label={`Select product ${row.name}`}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-900">{row.name}</td>
                  <td className="px-4 py-4 text-slate-700">{row.price}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        defaultValue={1}
                        className="h-10 w-16 rounded-xl border border-[#d9e2e8] bg-[#f8fafc] px-3 text-sm text-slate-900 outline-none focus:border-cyan-400"
                      />
                      <span className="text-sm text-slate-500">/{row.quantity}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
