import { Edit3, Trash2 } from "lucide-react";

export type ProductItem = {
  id: number;
  name: string;
  price: string;
  quantity: number;
};

type ListedProductsProps = {
  products: ProductItem[];
};

export default function ListedProducts({ products }: ListedProductsProps) {
  return (
    <table className="min-w-full border-collapse text-left text-sm">
      <thead className="bg-[#f8fafc] text-[11px] uppercase tracking-[0.14em] text-slate-500">
        <tr>
          <th className="px-4 py-4">Image</th>
          <th className="px-4 py-4">Name</th>
          <th className="px-4 py-4">Price</th>
          <th className="px-4 py-4">Quantity</th>
          <th className="px-4 py-4 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#eef2f5] bg-white text-slate-700">
        {products.map((product, index) => (
          <tr key={product.id} className={index % 2 === 0 ? "bg-[#fbfcfd]" : "bg-white"}>
            <td className="px-4 py-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-200" />
            </td>
            <td className="px-4 py-4 font-semibold text-slate-900">{product.name}</td>
            <td className="px-4 py-4 text-slate-700">{product.price}</td>
            <td className="px-4 py-4 text-slate-700">{product.quantity}</td>
            <td className="px-4 py-4 text-right">
              <div className="inline-flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8e3e8] bg-white text-slate-600 transition hover:bg-slate-50"
                  aria-label="Edit product"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#f1d3d8] bg-[#fff3f5] text-[#b91c1c] transition hover:bg-[#fee2e2]"
                  aria-label="Delete product"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
