import Link from "next/link";

export default function OrderHistorySection() {
  const orders = [
    { id: "#AM-1024", date: "Oct 24, 2023", total: "$2,450.00", status: "Delivered" },
    { id: "#AM-1022", date: "Oct 18, 2023", total: "$1,120.00", status: "Dispatched" },
    { id: "#AM-0985", date: "Oct 12, 2023", total: "$4,200.00", status: "Delivered" },
    { id: "#AM-0972", date: "Oct 05, 2023", total: "$890.00", status: "Delivered" },
    { id: "#AM-0951", date: "Sep 28, 2023", total: "$1,540.00", status: "Delivered" },
  ];

  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-xl">
      <h2 className="text-xl font-bold text-slate-900">Order History</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 text-slate-600">
            <tr>
              <th className="py-3">Order ID</th>
              <th className="py-3">Date</th>
              <th className="py-3">Total Price</th>
              <th className="py-3">Status</th>
              <th className="py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="py-3 font-semibold text-slate-800">{order.id}</td>
                <td className="py-3">{order.date}</td>
                <td className="py-3">{order.total}</td>
                <td className="py-3">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    order.status === "Delivered" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-cyan-600">View Receipt</span>
                    <Link
                      href="/claims"
                      aria-label="Open claims"
                      className="inline-flex items-center justify-center text-slate-500 hover:text-slate-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <circle cx="12" cy="6" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="18" r="1.5" />
                      </svg>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
