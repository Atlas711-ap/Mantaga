"use client";

import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import * as XLSX from "xlsx";

interface BrandRecord {
  year: number;
  month: number;
  po_number: string;
  po_date: string;
  invoice_number: string;
  invoice_date: string;
  lpo_value_excl_vat: number;
  lpo_value_incl_vat: number;
  invoiced_value_excl_vat: number;
  invoiced_value_incl_vat: number;
  gap_value: number;
  service_level_pct: number;
  commission_aed: number;
  match_status: "MATCHED" | "DISCREPANCY";
}

const mockData: BrandRecord[] = [
  { year: 2026, month: 2, po_number: "PO3851128", po_date: "12/02/2026", invoice_number: "62693", invoice_date: "14/02/2026", lpo_value_excl_vat: 4000.00, lpo_value_incl_vat: 4200.00, invoiced_value_excl_vat: 4000.00, invoiced_value_incl_vat: 4200.00, gap_value: 0.00, service_level_pct: 100, commission_aed: 420.00, match_status: "MATCHED" },
  { year: 2026, month: 1, po_number: "PO3821045", po_date: "07/01/2026", invoice_number: "61890", invoice_date: "09/01/2026", lpo_value_excl_vat: 6000.00, lpo_value_incl_vat: 6300.00, invoiced_value_excl_vat: 5400.00, invoiced_value_incl_vat: 5670.00, gap_value: 600.00, service_level_pct: 90, commission_aed: 567.00, match_status: "DISCREPANCY" },
  { year: 2026, month: 1, po_number: "PO3798234", po_date: "14/01/2026", invoice_number: "61945", invoice_date: "16/01/2026", lpo_value_excl_vat: 4000.00, lpo_value_incl_vat: 4200.00, invoiced_value_excl_vat: 4000.00, invoiced_value_incl_vat: 4200.00, gap_value: 0.00, service_level_pct: 100, commission_aed: 420.00, match_status: "MATCHED" },
  { year: 2025, month: 12, po_number: "PO3754112", po_date: "03/12/2025", invoice_number: "60877", invoice_date: "05/12/2025", lpo_value_excl_vat: 8000.00, lpo_value_incl_vat: 8400.00, invoiced_value_excl_vat: 7200.00, invoiced_value_incl_vat: 7560.00, gap_value: 800.00, service_level_pct: 90, commission_aed: 756.00, match_status: "DISCREPANCY" },
  { year: 2025, month: 11, po_number: "PO3712009", po_date: "05/11/2025", invoice_number: "60201", invoice_date: "07/11/2025", lpo_value_excl_vat: 4000.00, lpo_value_incl_vat: 4200.00, invoiced_value_excl_vat: 4000.00, invoiced_value_incl_vat: 4200.00, gap_value: 0.00, service_level_pct: 100, commission_aed: 420.00, match_status: "MATCHED" },
];

const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatAED(value: number): string {
  return "AED " + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getServiceColor(pct: number): string {
  if (pct >= 95) return "text-emerald-400";
  if (pct >= 80) return "text-amber-400";
  return "text-red-400";
}

export default function BrandPerformancePage() {
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // MTD calculations (February 2026)
  const mtdData = useMemo(() => {
    const currentMonth = 2;
    const currentYear = 2026;
    return mockData.filter(d => d.month === currentMonth && d.year === currentYear);
  }, []);

  const mtdStats = useMemo(() => {
    const totalInvoiced = mtdData.reduce((sum, d) => sum + d.invoiced_value_incl_vat, 0);
    const totalCommission = mtdData.reduce((sum, d) => sum + d.commission_aed, 0);
    const lpoCount = mtdData.length;
    const avgService = lpoCount > 0 ? mtdData.reduce((sum, d) => sum + d.service_level_pct, 0) / lpoCount : 0;
    return { totalInvoiced, totalCommission, lpoCount, avgService };
  }, [mtdData]);

  // YTD calculations (2026)
  const ytdData = useMemo(() => {
    const currentYear = 2026;
    return mockData.filter(d => d.year === currentYear);
  }, []);

  const ytdStats = useMemo(() => {
    const totalInvoiced = ytdData.reduce((sum, d) => sum + d.invoiced_value_incl_vat, 0);
    const totalCommission = ytdData.reduce((sum, d) => sum + d.commission_aed, 0);
    const lpoCount = ytdData.length;
    const avgService = lpoCount > 0 ? ytdData.reduce((sum, d) => sum + d.service_level_pct, 0) / lpoCount : 0;
    return { totalInvoiced, totalCommission, lpoCount, avgService };
  }, [ytdData]);

  // Sorted data
  const sortedData = useMemo(() => {
    return [...mockData].sort((a, b) => {
      if (a.year !== b.year) {
        return sortOrder === "desc" ? b.year - a.year : a.year - b.year;
      }
      return sortOrder === "desc" ? b.month - a.month : a.month - a.month;
    });
  }, [sortOrder]);

  // Weekly chart data
  const weeklyData = useMemo(() => {
    return [
      { week: "3 Feb", value: 4200 },
      { week: "10 Feb", value: 0 },
      { week: "17 Feb", value: 0 },
      { week: "24 Feb", value: 0 },
    ];
  }, []);

  // Monthly history
  const monthlyHistory = useMemo(() => {
    const grouped: Record<string, BrandRecord[]> = {};
    mockData.forEach(d => {
      const key = `${d.year}-${d.month}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(d);
    });
    
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, records]) => {
        const [year, month] = key.split('-').map(Number);
        const totalInvoiced = records.reduce((sum, r) => sum + r.invoiced_value_incl_vat, 0);
        const totalCommission = records.reduce((sum, r) => sum + r.commission_aed, 0);
        const avgService = records.length > 0 
          ? records.reduce((sum, r) => sum + r.service_level_pct, 0) / records.length 
          : 0;
        return { year, month, lpoCount: records.length, totalInvoiced, avgService, totalCommission };
      });
  }, []);

  const handleExport = () => {
    const exportData = sortedData.map(d => ({
      Year: d.year,
      Month: monthNames[d.month],
      "PO Date": d.po_date,
      "Invoice Date": d.invoice_date,
      "LPO No.": d.po_number,
      "Invoice No.": d.invoice_number,
      "LPO Value excl VAT (AED)": d.lpo_value_excl_vat,
      "LPO Value incl VAT (AED)": d.lpo_value_incl_vat,
      "Invoiced Value excl VAT (AED)": d.invoiced_value_excl_vat,
      "Invoiced Value incl VAT (AED)": d.invoiced_value_incl_vat,
      "Gap (AED)": d.gap_value,
      "Service Level %": d.service_level_pct + "%",
      "Commission (AED)": d.commission_aed,
      "Match Status": d.match_status,
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Brand Performance");
    
    // Export to file
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `Mantaga_Brand_Performance_${date}.xlsx`);
  };

  const columns = [
    "Year", "Month", "PO Date", "Invoice Date", "LPO No.", "Invoice No.",
    "LPO Value (AED)", "Invoiced Value (AED)", "Gap (AED)", "Service Level %", "Commission (AED)", "Match Status"
  ];

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Brand Performance</div>
        <button onClick={handleExport} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium">
          Export to Excel
        </button>
      </div>

      {/* MTD Summary Cards */}
      <div>
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">This Month</div>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Invoiced Value MTD</div>
            <div className="text-2xl font-mono text-white">{formatAED(mtdStats.totalInvoiced)}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Commission Earned MTD</div>
            <div className="text-2xl font-mono text-white">{formatAED(mtdStats.totalCommission)}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">LPOs This Month</div>
            <div className="text-2xl font-mono text-white">{mtdStats.lpoCount}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Avg Service Level % MTD</div>
            <div className={`text-2xl font-mono ${getServiceColor(mtdStats.avgService)}`}>{mtdStats.avgService.toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* YTD Summary Cards */}
      <div>
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Year to Date</div>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Invoiced Value YTD</div>
            <div className="text-2xl font-mono text-white">{formatAED(ytdStats.totalInvoiced)}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Commission Earned YTD</div>
            <div className="text-2xl font-mono text-white">{formatAED(ytdStats.totalCommission)}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total LPOs YTD</div>
            <div className="text-2xl font-mono text-white">{ytdStats.lpoCount}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Avg Service Level % YTD</div>
            <div className={`text-2xl font-mono ${getServiceColor(ytdStats.avgService)}`}>{ytdStats.avgService.toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 sticky top-0">
              <tr>
                {columns.map((col) => (
                  <th 
                    key={col} 
                    className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-white"
                    onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                  >
                    {col} {col === "Year" || col === "Month" ? (sortOrder === "desc" ? "↓" : "↑") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.length > 0 ? sortedData.map((record, i) => (
                <tr key={i} className="border-t border-slate-800 hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-slate-300">{record.year}</td>
                  <td className="px-4 py-3 text-slate-300">{monthNames[record.month]}</td>
                  <td className="px-4 py-3 text-slate-300">{record.po_date}</td>
                  <td className="px-4 py-3 text-slate-300">{record.invoice_date}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{record.po_number}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{record.invoice_number}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{formatAED(record.lpo_value_incl_vat)}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{formatAED(record.invoiced_value_incl_vat)}</td>
                  <td className={`px-4 py-3 font-mono ${record.gap_value > 0 ? "text-red-400" : "text-slate-300"}`}>
                    {formatAED(record.gap_value)}
                  </td>
                  <td className={`px-4 py-3 font-mono ${getServiceColor(record.service_level_pct)}`}>
                    {record.service_level_pct}%
                  </td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{formatAED(record.commission_aed)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      record.match_status === "MATCHED" 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-red-500/20 text-red-400"
                    }`}>
                      {record.match_status === "MATCHED" ? "✅ MATCHED" : "⚠️ DISCREPANCY"}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr className="border-t border-slate-800">
                  <td colSpan={12} className="px-4 py-8 text-center text-slate-500">
                    No financial data yet — upload an LPO and Invoice in the Data Upload tab
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Weekly Invoiced Value — Last 8 Weeks</div>
        {weeklyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} tickFormatter={(v) => `AED ${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value) => [formatAED(value as number), "Invoiced Value"]}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#06B6D4" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-slate-500">
            Insufficient data — requires at least 2 weeks of invoices
          </div>
        )}
      </div>

      {/* Monthly Service Level History */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Monthly Service Level History</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Year</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Month</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">LPOs</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Total Invoiced (AED)</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Avg Service Level %</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Total Commission (AED)</th>
              </tr>
            </thead>
            <tbody>
              {monthlyHistory.length > 0 ? monthlyHistory.map((row, i) => (
                <tr key={i} className="border-t border-slate-800 hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-slate-300">{row.year}</td>
                  <td className="px-4 py-3 text-slate-300">{monthNames[row.month]}</td>
                  <td className="px-4 py-3 text-slate-300">{row.lpoCount}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{formatAED(row.totalInvoiced)}</td>
                  <td className={`px-4 py-3 font-mono ${getServiceColor(row.avgService)}`}>{row.avgService.toFixed(0)}%</td>
                  <td className="px-4 py-3 text-slate-300 font-mono">{formatAED(row.totalCommission)}</td>
                </tr>
              )) : (
                <tr className="border-t border-slate-800">
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No historical data yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
