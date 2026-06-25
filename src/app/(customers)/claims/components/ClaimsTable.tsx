import Link from "next/link";

type Claim = {
  _id?: string;
  claimNumber: string;
  customerName: string;
  reason: string;
  status: "open" | "owner_responded" | "resolved" | "admin_escalated" | "awaiting_reorder";
  storeId?: string;
  createdAt?: string;
};

function formatClaimDate(val?: string) {
  if (!val) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(val));
}

const STATUS_LABEL: Record<string, string> = {
  open: "OPEN",
  owner_responded: "RESPONDED",
  resolved: "RESOLVED",
  admin_escalated: "ESCALATED",
  awaiting_reorder: "REORDER NEEDED",
};

const STATUS_CLASS: Record<string, string> = {
  open: "text-gray-400",
  owner_responded: "text-green-600",
  resolved: "text-blue-500",
  admin_escalated: "text-red-500",
  awaiting_reorder: "text-purple-600",
};

const ISSUE_LABEL: Record<string, string> = {
  damaged: "Damaged item",
  missing: "Missing item",
  refund: "Refund",
  wrong: "Wrong item",
  other: "Other",
};

interface ClaimsTableProps {
  claims: Claim[];
}

export default function ClaimsTable({ claims }: ClaimsTableProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full shadow-sm">
      <h2 className="text-sm font-bold text-gray-800 dark:text-slate-200 tracking-widest uppercase mb-4">YOUR CLAIMS</h2>

      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <rect x="1" y="1" width="4" height="4" rx="0.6" fill="white" />
            <rect x="6" y="1" width="4" height="4" rx="0.6" fill="white" />
            <rect x="1" y="6" width="4" height="4" rx="0.6" fill="white" />
            <rect x="6" y="6" width="4" height="4" rx="0.6" fill="white" />
          </svg>
        </div>
        <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">Your Claims History</span>
      </div>

      {claims.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-slate-500 py-4 text-center">No claims filed yet.</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700">
                {["Claim ID", "Issue Type", "Filed", "Status", "Action"].map((h) => (
                  <th
                    key={h}
                    className="pb-2 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide pr-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => {
                const isEscalated = claim.status === "admin_escalated";
                const needsReorder = claim.status === "awaiting_reorder";

                return (
                  <tr key={claim._id || claim.claimNumber} className={`border-b border-gray-50 dark:border-slate-700 last:border-0 ${needsReorder ? "bg-purple-50/50 dark:bg-purple-900/10" : ""}`}>
                    <td className={`py-3 text-sm font-semibold pr-3 ${isEscalated ? "text-red-500" : needsReorder ? "text-purple-600" : "text-gray-700 dark:text-slate-300"}`}>
                      #{claim.claimNumber}
                    </td>
                    <td className="py-3 text-sm text-gray-600 dark:text-slate-300 pr-3 whitespace-nowrap">
                      {ISSUE_LABEL[claim.reason] || claim.reason}
                    </td>
                    <td className="py-3 text-xs text-gray-500 dark:text-slate-400 pr-3 whitespace-nowrap">
                      {formatClaimDate(claim.createdAt)}
                    </td>
                    <td className={`py-3 text-[10px] font-bold tracking-wide pr-3 whitespace-nowrap ${STATUS_CLASS[claim.status] || "text-gray-400"}`}>
                      • {STATUS_LABEL[claim.status] || claim.status.toUpperCase()}
                    </td>
                    <td className="py-3">
                      {needsReorder && claim.storeId ? (
                        <Link
                          href={`/store?storeId=${claim.storeId}`}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 transition-colors text-white text-[11px] font-semibold rounded-md"
                        >
                          Reorder from Store
                        </Link>
                      ) : isEscalated ? (
                        <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 text-[11px] font-semibold rounded-md">
                          Escalated
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-slate-600 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
