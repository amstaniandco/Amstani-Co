import { Download, Filter, Search, Shield } from "lucide-react";

export type ApplicationRow = {
  name: string;
  email: string;
  number: string;
  address: string;
  state: string;
  vacancy: string;
};

const applicationRows: ApplicationRow[] = [
  {
    name: "Applicant name",
    email: "email@example.com",
    number: "96576738461",
    address: "House 1, Street 2, Colony 3, City 4",
    state: "State Name",
    vacancy: "27",
  },
  {
    name: "Applicant name",
    email: "email@example.com",
    number: "96576738461",
    address: "House 1, Street 2, Colony 3, City 4",
    state: "State Name",
    vacancy: "2",
  },
  {
    name: "Applicant name",
    email: "email@example.com",
    number: "96576738461",
    address: "House 1, Street 2, Colony 3, City 4",
    state: "State Name",
    vacancy: "33",
  },
  {
    name: "Applicant name",
    email: "email@example.com",
    number: "96576738461",
    address: "House 1, Street 2, Colony 3, City 4",
    state: "State Name",
    vacancy: "71",
  },
];

const stateRows = [
  { name: "STATE", max: "100", occupied: "12" },
  { name: "STATE", max: "100", occupied: "12" },
  { name: "STATE", max: "100", occupied: "12" },
  { name: "STATE", max: "100", occupied: "12" },
];

function Toolbar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6ecef] bg-[#f8fbfc] px-4 py-4">
      <div className="flex w-full max-w-[640px] items-center gap-2 rounded-full border border-[#d8e2e8] bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
        <Search className="h-4 w-4 text-slate-500" />
        <span>Search Applications</span>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" className="rounded-xl border border-[#d8e2e8] bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
          All Status
        </button>
        <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8e2e8] bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Filter applications">
          <Filter className="h-4 w-4" />
        </button>
        <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8e2e8] bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Download applications">
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ApplicationsTable() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-[#d9e2e8] bg-white shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
      <Toolbar />

      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[1.2fr_1.2fr_1fr_1.6fr_1fr_0.7fr_0.9fr] border-b border-[#e7eef2] bg-[#fbfcfd] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            <div>Name</div>
            <div>Email</div>
            <div>Number</div>
            <div>Address</div>
            <div>State</div>
            <div>Vacancy</div>
            <div className="text-right">Actions</div>
          </div>

          <div className="divide-y divide-[#edf2f5]">
            {applicationRows.map((row, index) => (
              <div
                key={`${row.email}-${index}`}
                className={`grid grid-cols-[1.2fr_1.2fr_1fr_1.6fr_1fr_0.7fr_0.9fr] items-center px-5 py-4 text-sm text-slate-800 ${index % 2 === 1 ? "bg-[#fff8f8]" : "bg-white"}`}
              >
                <div className="font-medium text-slate-700">{row.name}</div>
                <div className="text-slate-600">{row.email}</div>
                <div className="text-slate-600">{row.number}</div>
                <div className="max-w-[180px] text-sm leading-5 text-slate-600">{row.address}</div>
                <div className="text-slate-600">{row.state}</div>
                <div className="text-slate-700">{row.vacancy}</div>
                <div className="flex justify-end gap-2 text-slate-500">
                  <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 transition hover:bg-slate-50" aria-label="Accept application">
                    ✓
                  </button>
                  <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 transition hover:bg-slate-50" aria-label="Reject application">
                    ⦸
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

function StateAvailabilityTable() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-[#d9e2e8] bg-white shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#e5edf1] bg-[#f8fbfc] px-4 py-4">
        <div className="flex w-full max-w-[640px] items-center gap-2 rounded-full border border-[#d8e2e8] bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
          <Search className="h-4 w-4 text-slate-500" />
          <span>Search State</span>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className="rounded-xl border border-[#d8e2e8] bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
            All Status
          </button>
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8e2e8] bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Filter states">
            <Filter className="h-4 w-4" />
          </button>
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8e2e8] bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Download states">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[1.2fr_0.6fr_0.8fr_0.6fr] border-b border-[#e7eef2] bg-[#fbfcfd] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
            <div>Name</div>
            <div>Max</div>
            <div>Occupied</div>
            <div className="text-right">Action</div>
          </div>

          <div className="divide-y divide-[#edf2f5]">
            {stateRows.map((row, index) => (
              <div
                key={`${row.name}-${index}`}
                className="grid grid-cols-[1.2fr_0.6fr_0.8fr_0.6fr] items-center px-5 py-4 text-sm text-slate-800"
              >
                <div className="font-medium text-slate-700">{row.name}</div>
                <div className="text-slate-600">{row.max}</div>
                <div className="text-slate-600">{row.occupied}</div>
                <div className="flex justify-end">
                  <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50" aria-label="Edit state">
                    ✎
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

export default function StoreApplicationsTables() {
  return (
    <div className="space-y-4">
      <ApplicationsTable />
      <StateAvailabilityTable />
    </div>
  );
}
