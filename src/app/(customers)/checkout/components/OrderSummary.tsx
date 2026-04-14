"use client";

const orderItems = [
  {
    id: 1,
    name: "Amstani Horizon Chrono",
    store: "Name of Store",
    subtitle: "Bespoke Engraving Included",
    price: "$4,250",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop",
  },
];

const summary = {
  subtotal: "$4,250.00",
  totalTax: "$340.00",
  totalShipping: "$123",
  totalDue: "$4,590.00",
  storeA: "$2000.00",
  storeATax: "$123.00",
  storeAShipping: "$123.00",
  storeB: "$2250.00",
  storeBTax: "$123.00",
  storeBShipping: "$123.00",
};

export default function OrderSummary() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-7 lg:sticky lg:top-10">
      <h2 className="text-2xl font-bold text-black mb-5 tracking-tight">
        Order Summary
      </h2>

      <div className="flex items-start gap-4 pb-5 border-b border-gray-100 mb-5">
        <img
          src={orderItems[0].image}
          alt={orderItems[0].name}
          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold tracking-widest uppercase text-black mb-0.5">
            {orderItems[0].store}
          </p>
          <p className="text-sm font-semibold text-black truncate">
            {orderItems[0].name}
          </p>
          <p className="text-xs text-black/70 mt-0.5">{orderItems[0].subtitle}</p>
        </div>
        <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
          {orderItems[0].price}
        </p>
      </div>

      <div className="space-y-2.5 text-sm text-black/80">
        <LineItem label="Store A" value={summary.storeA} />
        <LineItem label="Store A Tax" value={summary.storeATax} />
        <LineItem label="Store A Shipping" value={summary.storeAShipping} />

        <div className="h-px bg-gray-100" />

        <LineItem label="Store B" value={summary.storeB} />
        <LineItem label="Store B Tax" value={summary.storeBTax} />
        <LineItem label="Store B Shipping" value={summary.storeBShipping} />

        <div className="h-px bg-gray-100" />

        <LineItem label="Subtotal" value={summary.subtotal} />

        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1 text-black/80">
            Total Tax
            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-gray-300 text-[9px] text-black/70 cursor-default leading-none">
              i
            </span>
          </span>
          <span className="font-medium text-black">{summary.totalTax}</span>
        </div>

        <LineItem label="Total Shipping" value={summary.totalShipping} />
      </div>

      <div className="flex justify-between items-center mt-5 pt-4 border-t-2 border-gray-900">
        <span className="text-[11px] font-bold tracking-widest uppercase text-gray-900">
          Total Due
        </span>
        <span className="text-3xl font-bold text-gray-900">{summary.totalDue}</span>
      </div>

      <button className="mt-5 w-full py-4 rounded-xl bg-gradient-to-r from-teal-300 to-indigo-400 text-white text-sm font-semibold tracking-wide hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150">
        Select Payment Method
      </button>

      <p className="text-center text-[11px] text-black/70 mt-3">
        Secure payment processed via Amstani Global Gateway
      </p>
    </div>
  );
}

function LineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-black/90">
      <span>{label}</span>
      <span className="font-medium text-black">{value}</span>
    </div>
  );
}
