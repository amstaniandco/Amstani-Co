import { useState } from "react";
import { Trash2 } from "lucide-react";

export type StoreProductItem = {
  _id?: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  mainImage?: string | null;
  quantity: number;
  listedAt?: string;
};

type Props = {
  products: StoreProductItem[];
  loading?: boolean;
  onRemove: (productId: string) => void;
};

const PAGE_SIZE = 10;

export default function ListedProducts({ products, loading, onRemove }: Props) {
  const [page, setPage] = useState(1);

  if (loading) {
    return <div className="py-16 text-center text-sm text-slate-400">Loading products…</div>;
  }

  if (products.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-slate-400">
        No products listed for this store yet. Use <span className="font-semibold">Add New</span> to list products.
      </div>
    );
  }

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const paginated = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-[#f8fafc] text-[11px] uppercase tracking-[0.14em] text-slate-500">
          <tr>
            <th className="px-4 py-4">Image</th>
            <th className="px-4 py-4">Name</th>
            <th className="px-4 py-4">SKU</th>
            <th className="px-4 py-4">Price</th>
            <th className="px-4 py-4">Quantity</th>
            <th className="px-4 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eef2f5] bg-white text-slate-700">
          {paginated.map((product, index) => (
            <tr key={product.productId} className={index % 2 === 0 ? "bg-[#fbfcfd]" : "bg-white"}>
              <td className="px-4 py-4">
                {product.mainImage ? (
                  <img src={product.mainImage} alt={product.name} className="h-12 w-12 rounded-2xl object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                )}
              </td>
              <td className="px-4 py-4 font-semibold text-slate-900">{product.name}</td>
              <td className="px-4 py-4 font-mono text-xs text-slate-500">{product.sku || "—"}</td>
              <td className="px-4 py-4 text-slate-700">${Number(product.price).toLocaleString()}</td>
              <td className="px-4 py-4 text-slate-700">{product.quantity}</td>
              <td className="px-4 py-4 text-right">
                <button
                  type="button"
                  onClick={() => onRemove(product.productId)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#f1d3d8] bg-[#fff3f5] text-[#b91c1c] transition hover:bg-[#fee2e2]"
                  aria-label="Remove product"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#eef2f5] px-4 py-3 text-sm text-slate-600">
          <span className="text-xs">{products.length} products · page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-[#dbe5ea] px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-[#dbe5ea] px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
