import { ChevronDown, Ellipsis, Plus, Store, Square } from "lucide-react";
import OwnerChatSidebar from "../store/chats/components/OwnerChatSidebar";

type ProductRow = {
  name: string;
  price: string;
  inStock: number;
  shippingCost: number;
};

const productRows: ProductRow[] = [
  { name: "Name Of Product", price: "$51", inStock: 423, shippingCost: 123 },
  { name: "Name Of Product", price: "$51", inStock: 423, shippingCost: 123 },
  { name: "Name Of Product", price: "$51", inStock: 423, shippingCost: 123 },
  { name: "Name Of Product", price: "$51", inStock: 423, shippingCost: 123 },
  { name: "Name Of Product", price: "$51", inStock: 423, shippingCost: 123 },
  { name: "Name Of Product", price: "$51", inStock: 423, shippingCost: 123 },
];

const discountOptions = ["Select Type", "Select Category"];

function ProductThumb() {
  return <div className="h-8 w-8 rounded-md bg-slate-200 sm:h-9 sm:w-9" />;
}

function ProductTable() {
  return (
    <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.05)]">
      <div className="px-4 py-5 sm:px-7 sm:py-7">
        <h3 className="text-[1.35rem] font-bold text-slate-900 sm:text-2xl">Product</h3>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[680px] sm:min-w-[760px]">
          <div className="grid grid-cols-[48px_1.7fr_0.7fr_0.85fr_0.95fr_0.45fr] border-b border-slate-100 px-4 pb-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400 sm:grid-cols-[56px_1.7fr_0.7fr_0.9fr_1fr_0.45fr] sm:px-7">
            <div>Image</div>
            <div>Name</div>
            <div>Price</div>
            <div>In Stock</div>
            <div>Shipping Cost</div>
            <div className="text-right">Actions</div>
          </div>

          <div className="divide-y divide-slate-100">
            {productRows.map((product, index) => (
              <div
                key={`${product.name}-${index}`}
                className="grid grid-cols-[48px_1.7fr_0.7fr_0.85fr_0.95fr_0.45fr] items-center px-4 py-3.5 text-sm sm:grid-cols-[56px_1.7fr_0.7fr_0.9fr_1fr_0.45fr] sm:px-7 sm:py-4"
              >
                <div>
                  <ProductThumb />
                </div>
                <div className="font-semibold text-slate-700">{product.name}</div>
                <div className="text-slate-500">{product.price}</div>
                <div className="text-slate-700">{product.inStock}</div>
                <div className="text-slate-700">{product.shippingCost}</div>
                <div className="flex justify-end">
                  <button type="button" className="text-2xl leading-none text-slate-500 hover:text-slate-900">
                    <Ellipsis className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerProductsPage() {
  return (
    <div className="min-h-screen bg-[#efefef] p-2 md:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] w-full max-w-[1400px] flex-col overflow-hidden rounded-sm border border-slate-300 bg-[#efefef] md:flex-row">
        <OwnerChatSidebar activeLabel="Products" />

        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <Store className="h-5 w-5 text-[#65bbc5]" />
              <h1 className="text-xl font-semibold sm:text-2xl">Name of the store here</h1>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-[#65bbc5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#53aab5] sm:self-auto sm:px-6"
            >
              <Square className="h-4 w-4" />
              Go Live
            </button>
          </section>

          <section className="mt-4 rounded-[32px] bg-white px-4 py-4 shadow-[0_14px_35px_rgba(15,23,42,0.05)] sm:px-6 sm:py-5">
            <h2 className="text-[1.35rem] font-bold tracking-tight text-slate-900 sm:text-2xl">Manage Discounts</h2>

            <div className="mt-4 grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-3">
              <select
                defaultValue={discountOptions[0]}
                className="h-7 w-full min-w-0 rounded-sm border border-slate-400 bg-white px-2 text-[11px] text-slate-700 outline-none sm:text-sm"
              >
                <option>{discountOptions[0]}</option>
                <option>Option One</option>
                <option>Option Two</option>
              </select>

              <select
                defaultValue={discountOptions[1]}
                className="h-7 w-full min-w-0 rounded-sm border border-slate-400 bg-white px-2 text-[11px] text-slate-700 outline-none sm:text-sm"
              >
                <option>{discountOptions[1]}</option>
                <option>Option One</option>
                <option>Option Two</option>
              </select>

              <input
                type="text"
                placeholder="Enter Percentage %"
                className="h-7 w-full min-w-0 rounded-sm border border-slate-400 bg-white px-2 text-[11px] text-slate-700 outline-none placeholder:text-slate-500 sm:text-sm"
              />

              <button
                type="button"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#65bbc5] text-white transition hover:bg-[#53aab5]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              className="mx-auto mt-3 block text-[13px] text-[#65bbc5] underline decoration-[#65bbc5]/50 underline-offset-4"
            >
              View Previous
            </button>
          </section>

          <section className="mt-4">
            <ProductTable />
          </section>
        </main>
      </div>
    </div>
  );
}
