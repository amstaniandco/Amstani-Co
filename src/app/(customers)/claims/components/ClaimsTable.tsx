type Claim = {
  id: string;
  customer: string;
  issueType: string;
  status: string;
  statusClass: string;
  action: string | null;
  highlight: boolean;
};

interface ClaimsTableProps {
  claims: Claim[];
}

export default function ClaimsTable({ claims }: ClaimsTableProps) {
  return (
    <div className="bg-white rounded-2xl p-6 w-full shadow-sm">
      <h2 className="text-sm font-bold text-gray-800 tracking-widest uppercase mb-4">YOUR CLAIMS</h2>

      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <rect x="1" y="1" width="4" height="4" rx="0.6" fill="white" />
            <rect x="6" y="1" width="4" height="4" rx="0.6" fill="white" />
            <rect x="1" y="6" width="4" height="4" rx="0.6" fill="white" />
            <rect x="6" y="6" width="4" height="4" rx="0.6" fill="white" />
          </svg>
        </div>
        <span className="text-xs font-semibold text-gray-700">Global Claims & Escalations</span>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              {['Claim ID', 'Customer', 'Issue Type', 'Status', 'Action'].map((h) => (
                <th key={h} className="pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide pr-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id} className="border-b border-gray-50 last:border-0">
                <td className={`py-3 text-sm font-semibold pr-3 ${claim.highlight ? 'text-red-500' : 'text-gray-700'}`}>
                  {claim.id}
                </td>
                <td className="py-3 text-sm text-gray-600 pr-3 whitespace-nowrap">{claim.customer}</td>
                <td className="py-3 text-sm text-gray-600 pr-3 whitespace-nowrap">{claim.issueType}</td>
                <td className={`py-3 text-[10px] font-bold tracking-wide pr-3 whitespace-nowrap ${claim.statusClass}`}>
                  • {claim.status}
                </td>
                <td className="py-3">
                  {claim.action ? (
                    <button className="px-3 py-1 bg-red-500 hover:bg-red-600 transition-colors text-white text-[11px] font-semibold rounded-md">
                      {claim.action}
                    </button>
                  ) : (
                    <span className="text-gray-300 text-sm">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
