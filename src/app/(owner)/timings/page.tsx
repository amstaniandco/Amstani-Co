import { ChevronDown, Clock3, Store, Square, TriangleAlert } from "lucide-react";

type TimeRecord = {
  date: string;
  from: string;
  to: string;
  completed: string;
  highlight?: boolean;
};

const timeRecords: TimeRecord[] = [
  { date: "22/03/2026", from: "9:00 AM", to: "3:02 PM", completed: "6 hours 2 minutes" },
  {
    date: "22/03/2026",
    from: "9:00 AM",
    to: "2:45 PM",
    completed: "5 Hours 15 Minutes",
    highlight: true,
  },
  { date: "22/03/2026", from: "9:00 AM", to: "3:00 PM", completed: "6 Hours" },
  { date: "22/03/2026", from: "9:00 AM", to: "3:00 PM", completed: "6 Hours" },
  { date: "22/03/2026", from: "9:00 AM", to: "3:00 PM", completed: "6 Hours" },
  { date: "22/03/2026", from: "9:00 AM", to: "3:00 PM", completed: "6 Hours" },
  { date: "22/03/2026", from: "9:00 AM", to: "3:00 PM", completed: "6 Hours" },
  { date: "22/03/2026", from: "9:00 AM", to: "3:00 PM", completed: "6 Hours" },
];

function TimeField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="flex h-8 w-full max-w-[120px] items-center gap-2 rounded-md border border-slate-400 bg-white px-2 text-sm text-slate-700">
        <span className="grid h-4 w-4 place-items-center rounded-full border border-slate-500 text-[10px] text-slate-600">
          <Clock3 className="h-2.5 w-2.5" />
        </span>
        <span className="leading-none">{value}</span>
      </div>
    </div>
  );
}

function TimingCard() {
  return (
    <div className="rounded-[18px] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
      <h3 className="text-[1.45rem] font-bold text-slate-900">Set Store Timings</h3>
      <p className="mt-1 text-[13px] text-slate-500">Minimum 6 hours of live is mandatory</p>

      <div className="mt-5 grid grid-cols-1 items-end gap-4 sm:grid-cols-2 sm:gap-x-8">
        <TimeField label="From" value="9:00 AM" />
        <div className="sm:justify-self-end">
          <TimeField label="To" value="3:00 PM" />
        </div>
      </div>
    </div>
  );
}

function WarningCard() {
  return (
    <div className="rounded-[18px] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-2 text-slate-800">
        <TriangleAlert className="h-5 w-5 text-slate-600" />
        <h3 className="text-[1.45rem] font-bold text-slate-900">Warnings</h3>
      </div>
      <p className="mt-1 text-[13px] text-slate-500">This may lead to suspension of account</p>
      <p className="mt-4 text-center text-[2.15rem] font-bold leading-none text-slate-900">1/3</p>
      <p className="mt-3 text-center text-sm text-slate-500">Reset in: 24 Days</p>
    </div>
  );
}

function TimeRecordTable() {
  return (
    <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between px-5 py-6 sm:px-7 sm:py-7">
        <h3 className="text-[1.45rem] font-bold text-slate-900 sm:text-2xl">Monthly Time Record</h3>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
        >
          March 2026
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[680px] sm:min-w-[760px]">
          <div className="grid grid-cols-[1fr_0.8fr_0.8fr_1fr] border-b border-slate-100 px-7 pb-4 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
            <div>Date</div>
            <div>From</div>
            <div>To</div>
            <div>Time Completed</div>
          </div>

          <div className="divide-y divide-slate-100">
            {timeRecords.map((record, index) => (
              <div
                key={`${record.date}-${index}`}
                className={`grid grid-cols-[1fr_0.8fr_0.8fr_1fr] items-center px-7 py-5 text-[15px] ${record.highlight ? "bg-red-50" : ""}`}
              >
                <div className="font-semibold text-slate-700">{record.date}</div>
                <div className="text-slate-700">{record.from}</div>
                <div className="text-slate-700">{record.to}</div>
                <div className={`font-semibold ${record.highlight ? "text-red-500" : "text-slate-700"}`}>
                  {record.completed}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerTimingsPage() {
  return (
    <>
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

          <section className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
            <TimingCard />
            <WarningCard />
          </section>

          <section className="mt-4">
            <TimeRecordTable />
          </section>
    </>
  );
}
