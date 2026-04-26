import { Store } from "lucide-react";
import OwnerChatSidebar from "../../../store/chats/components/OwnerChatSidebar";

const applicationRows = [
  {
    id: "APP-2401",
    name: "John Doe",
    address: "H#1 St#2, XYZ",
    email: "name@gmail.com",
    phone: "1234567890",
    state: "LA",
  },
  {
    id: "APP-2402",
    name: "Jane Smith",
    address: "H#1 St#2, XYZ",
    email: "jane.smith@gmail.com",
    phone: "1234567890",
    state: "LA",
  },
  {
    id: "APP-2403",
    name: "Michael Brown",
    address: "H#1 St#2, XYZ",
    email: "michael.brown@gmail.com",
    phone: "1234567890",
    state: "LA",
  },
  {
    id: "APP-2404",
    name: "Emily Johnson",
    address: "H#1 St#2, XYZ",
    email: "emily.johnson@gmail.com",
    phone: "1234567890",
    state: "LA",
  },
  {
    id: "APP-2405",
    name: "Samuel Lee",
    address: "H#1 St#2, XYZ",
    email: "samuel.lee@gmail.com",
    phone: "1234567890",
    state: "LA",
  },
];

export default function OwnerProfileApplicationsPage() {
  return (
    <div className="min-h-screen bg-[#efefef] p-2 md:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] w-full max-w-[1400px] flex-col overflow-hidden rounded-sm border border-slate-300 bg-[#efefef] md:flex-row">
        <OwnerChatSidebar activeLabel="Profile" />

        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-slate-900">
              <Store className="h-5 w-5 text-[#65bbc5]" />
              <h1 className="text-xl font-semibold sm:text-2xl">Name of the store here</h1>
            </div>
          </section>

          <section className="mt-6 rounded-[26px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <div className="mb-4">
              <h2 className="text-[1.3rem] font-semibold text-slate-900">Store Applications</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.16em] text-slate-900">
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Address</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Phone Number</th>
                    <th className="px-4 py-3 font-semibold">State</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applicationRows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-200 text-sm text-slate-900 last:border-b-0">
                      <td className="px-4 py-4">{row.name}</td>
                      <td className="px-4 py-4">{row.address}</td>
                      <td className="px-4 py-4">{row.email}</td>
                      <td className="px-4 py-4">{row.phone}</td>
                      <td className="px-4 py-4">{row.state}</td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          className="font-bold transition"
                          style={{ color: "#15803D" }}
                        >
                          Forward To Admin
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
