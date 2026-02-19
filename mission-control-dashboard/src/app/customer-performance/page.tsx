"use client";

import { useState } from "react";

export default function CustomerPerformancePage() {
  const [view, setView] = useState<"sku" | "darkstore">("sku");

  const skuColumns = [
    "SKU Name", "Barcode", "7-Day Est. Sold", "14-Day Est. Sold", "30-Day Est. Sold",
    "Units Sold This Month", "Units Sold Last Month", "MoM Change %", "Avg. Replenishment Time", "Active Darkstores"
  ];

  const darkstoreColumns = [
    "Darkstore Name", "Current Stock", "7-Day Est. Sold", "Avg. Daily Rate",
    "Last Replenishment", "Days Since Replenishment", "Avg. Replenishment Cycle", "Status"
  ];

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {view === "sku" ? "Estimated Stock Movement by SKU" : "Movement by Darkstore"}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("sku")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              view === "sku" ? "bg-amber-500 text-white" : "bg-slate-800 text-slate-400"
            }`}
          >
            SKU Summary
          </button>
          <button
            onClick={() => setView("darkstore")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              view === "darkstore" ? "bg-amber-500 text-white" : "bg-slate-800 text-slate-400"
            }`}
          >
            Darkstore Drilldown
          </button>
        </div>
      </div>

      {view === "sku" ? (
        <>
          <div className="text-xs text-slate-500 mb-4">All sell-out figures are estimated based on daily stock movement</div>
          
          {/* SKU Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800 sticky top-0">
                  <tr>
                    {skuColumns.map((col, i) => (
                      <th key={i} className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-800">
                    <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                      No movement data yet — requires at least 2 days of stock reports
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <button className="text-sm text-slate-400 hover:text-slate-200 mb-4">← Back to SKU Summary</button>
          
          {/* Selected SKU Info */}
          <div className="text-sm text-slate-400 mb-4">SKU Name</div>

          {/* Darkstore Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800 sticky top-0">
                  <tr>
                    {darkstoreColumns.map((col, i) => (
                      <th key={i} className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-800">
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      Select a SKU to view darkstore details
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3PL Buffer */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">3PL Buffer Stock — UAE_Talabat_3pl_GSL_DIP</div>
            <div className="text-2xl font-mono text-white">—</div>
            <div className="text-xs text-slate-500 mt-1">This is the buffer stock that feeds darkstore replenishments</div>
          </div>
        </>
      )}
    </div>
  );
}
