export default function BrandPerformancePage() {
  const summaryCards = [
    { label: "Total Invoiced Value MTD", value: "—", sub: "AED" },
    { label: "Total Commission Earned MTD", value: "—", sub: "AED" },
    { label: "Number of LPOs This Month", value: "—", sub: "orders" },
    { label: "Average Service Level %", value: "—", sub: "%" },
  ];

  const columns = [
    "Year", "Month", "PO Date", "Invoice Date", "LPO No.", "Invoice No.", 
    "LPO Value (AED)", "Invoiced Value (AED)", "Gap (AED)", "Service Level %", 
    "Commission (AED)", "Match Status"
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{card.label}</div>
            <div className="text-2xl font-mono text-white">{card.value}</div>
            <div className="text-xs text-slate-500 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 sticky top-0">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-800">
                <td colSpan={12} className="px-4 py-8 text-center text-slate-500">
                  No LPO/Invoice data yet — upload documents in Data Upload tab
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Weekly Invoiced Value — Last 8 Weeks</div>
        <div className="h-48 flex items-end justify-around gap-2">
          <div className="w-12 bg-cyan-500/50 rounded-t"></div>
          <div className="w-12 bg-cyan-500/50 rounded-t"></div>
          <div className="w-12 bg-cyan-500/50 rounded-t"></div>
          <div className="w-12 bg-cyan-500/50 rounded-t"></div>
          <div className="w-12 bg-cyan-500/50 rounded-t"></div>
          <div className="w-12 bg-cyan-500/50 rounded-t"></div>
          <div className="w-12 bg-cyan-500/50 rounded-t"></div>
          <div className="w-12 bg-cyan-500/50 rounded-t"></div>
        </div>
        <div className="text-center mt-4 text-sm text-slate-500">Insufficient data for chart</div>
      </div>
    </div>
  );
}
