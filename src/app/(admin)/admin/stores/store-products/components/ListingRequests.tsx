export type ListingRequestItem = {
  id: number;
  orderDate: string;
  products: number;
  productId: number;
  quantity: number;
  status: "approved" | "rejected";
};

type ListingRequestsProps = {
  listingRequests: ListingRequestItem[];
};

export default function ListingRequests({ listingRequests }: ListingRequestsProps) {
  return (
    <table className="min-w-full border-collapse text-left text-sm">
      <thead className="bg-[#f8fafc] text-[11px] uppercase tracking-[0.14em] text-slate-500">
        <tr>
          <th className="px-4 py-4">ORDER ID</th>
          <th className="px-4 py-4">ORDER DATE</th>
          <th className="px-4 py-4">NO OF PRODUCTS</th>
          <th className="px-4 py-4">PRODUCT ID</th>
          <th className="px-4 py-4">QUANTITY</th>
          <th className="px-4 py-4">STATUS</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#eef2f5] bg-white text-slate-700">
        {listingRequests.map((request, index) => (
          <tr key={request.id} className={index % 2 === 0 ? "bg-[#fbfcfd]" : "bg-white"}>
            <td className="px-4 py-4 font-semibold text-slate-900">{request.id}</td>
            <td className="px-4 py-4 text-slate-600">{request.orderDate}</td>
            <td className="px-4 py-4 text-slate-600">{request.products}</td>
            <td className="px-4 py-4 text-slate-600">{request.productId}</td>
            <td className="px-4 py-4 text-slate-600">{request.quantity}</td>
            <td className="px-4 py-4 text-slate-700">
              <div className="inline-flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${request.status === "approved" ? "bg-emerald-500" : "bg-slate-400"}`} />
                <span className="capitalize">{request.status}</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
