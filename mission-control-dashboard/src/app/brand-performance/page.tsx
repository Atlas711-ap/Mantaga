"use client";

export const dynamic = 'force-dynamic';

import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import * as XLSX from "xlsx";
import { useBrandPerformance, useInsertBrandPerformance } from "../../hooks/useConvex";

interface BrandRecord {
  _id: string;
  year: number;
  month: number;
  po_number: string;
  po_date: string;
  customer: string;
  brand?: string;
  client?: string;
  invoice_number: string;
  invoice_date: string;
  lpo_value_excl_vat: number;
  lpo_value_incl_vat: number;
  invoiced_value_excl_vat: number;
  invoiced_value_incl_vat: number;
  gap_value: number;
  service_level_pct: number;
  commission_aed: number;
  match_status: string;
}

const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatAED(value: number): string {
  return "AED " + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function getServiceColor(pct: number): string {
  if (pct >= 95) return "text-emerald-500";
  if (pct >= 80) return "text-amber-500";
  return "text-red-500";
}

export default function BrandPerformancePage() {
  const brandData = useBrandPerformance();
  const insertBrandPerf = useInsertBrandPerformance();
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [selectedLpo, setSelectedLpo] = useState<BrandRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Invoice entry form
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [lineItems, setLineItems] = useState<{barcode: string; product_name: string; qty_ordered: number; qty_delivered: number}[]>([]);

  const mockData: BrandRecord[] = brandData || [];

  // MTD calculations (February 2026)
  const currentDate = new Date();
  const mtdData = useMemo(() => {
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    return mockData.filter(d => d.month === currentMonth && d.year === currentYear);
  }, [mockData]);

  const mtdStats = useMemo(() => {
    const totalInvoiced = mtdData.reduce((sum, d) => sum + d.invoiced_value_incl_vat, 0);
    const totalCommission = mtdData.reduce((sum, d) => sum + d.commission_aed, 0);
    const lpoCount = mtdData.length;
    const avgService = lpoCount > 0 ? mtdData.reduce((sum, d) => sum + d.service_level_pct, 0) / lpoCount : 0;
    return { totalInvoiced, totalCommission, lpoCount, avgService };
  }, [mtdData]);

  // YTD calculations
  const ytdData = useMemo(() => {
    const currentYear = currentDate.getFullYear();
    return mockData.filter(d => d.year === currentYear);
  }, [mockData]);

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
  }, [mockData, sortOrder]);

  // Weekly chart data
  const weeklyData = useMemo(() => {
    const weeks: Record<string, number> = {};
    mockData.forEach(d => {
      const week = `${d.invoice_date}`;
      weeks[week] = (weeks[week] || 0) + d.invoiced_value_incl_vat;
    });
    return Object.entries(weeks).map(([week, value]) => ({ week, value })).slice(0, 8);
  }, [mockData]);

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
  }, [mockData]);

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
    
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `Mantaga_Brand_Performance_${date}.xlsx`);
  };

  const handleLpoClick = (record: BrandRecord) => {
    setSelectedLpo(record);
    setInvoiceNumber(record.invoice_number || "");
    setInvoiceDate(record.invoice_date || "");
    // For now, create placeholder line items
    setLineItems([
      { barcode: "N/A", product_name: "Products from LPO", qty_ordered: 0, qty_delivered: 0 }
    ]);
    setShowModal(true);
  };

  const handleSaveInvoice = async () => {
    if (!selectedLpo) return;
    
    // Calculate totals from line items
    const totalDelivered = lineItems.reduce((sum, item) => sum + item.qty_delivered, 0);
    const totalOrdered = lineItems.reduce((sum, item) => sum + item.qty_ordered, 0);
    
    const serviceLevelPct = totalOrdered > 0 ? (totalDelivered / totalOrdered) * 100 : 100;
    const gapValue = totalOrdered - totalDelivered;
    const invoicedValue = selectedLpo.lpo_value_excl_vat * (serviceLevelPct / 100);
    const commissionAed = invoicedValue * 0.05;
    
    try {
      await insertBrandPerf({
        year: selectedLpo.year,
        month: selectedLpo.month,
        po_number: selectedLpo.po_number,
        po_date: selectedLpo.po_date,
        customer: selectedLpo.customer || "Talabat",
        brand: selectedLpo.brand,
        client: selectedLpo.client,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        lpo_value_excl_vat: selectedLpo.lpo_value_excl_vat,
        lpo_value_incl_vat: selectedLpo.lpo_value_incl_vat,
        invoiced_value_excl_vat: invoicedValue,
        invoiced_value_incl_vat: invoicedValue * 1.05,
        gap_value: gapValue,
        service_level_pct: serviceLevelPct,
        commission_aed: commissionAed,
        match_status: Math.abs(gapValue) <= 2 ? "MATCHED" : "DISCREPANCY",
      });
      setShowModal(false);
    } catch (error) {
      console.error("Failed to save invoice:", error);
    }
  };

  const columns = [
    "Year", "Month", "PO Date", "Invoice Date", "LPO No.", "Invoice No.",
    "LPO Value (AED)", "Invoiced Value (AED)", "Gap (AED)", "Service Level %", "Commission (AED)", "Match Status"
  ];

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-500">Brand Performance</div>
        <button onClick={handleExport} className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Export
        </button>
      </div>

      {/* MTD Summary Cards */}
      <div>
        <div className="text-xs font-medium text-gray-500 mb-3">This Month</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Total Invoiced</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{formatAED(mtdStats.totalInvoiced)}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Commission</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{formatAED(mtdStats.totalCommission)}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">LPOs</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{mtdStats.lpoCount}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Service Level</div>
            <div className={`text-2xl font-semibold ${getServiceColor(mtdStats.avgService)}`}>{mtdStats.avgService.toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* YTD Summary Cards */}
      <div>
        <div className="text-xs font-medium text-gray-500 mb-3">Year to Date</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Total Invoiced</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{formatAED(ytdStats.totalInvoiced)}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Commission</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{formatAED(ytdStats.totalCommission)}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">LPOs YTD</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{ytdStats.lpoCount}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Service Level</div>
            <div className={`text-2xl font-semibold ${getServiceColor(ytdStats.avgService)}`}>{ytdStats.avgService.toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500">All Records</div>
          <button 
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Sort: {sortOrder === "desc" ? "Newest First" : "Oldest First"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.length > 0 ? sortedData.map((record) => (
                <tr 
                  key={record._id} 
                  onClick={() => handleLpoClick(record)}
                  className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4 text-gray-900 dark:text-white">{record.year}</td>
                  <td className="px-5 py-4 text-gray-900 dark:text-white">{monthNames[record.month]}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{record.po_date}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{record.invoice_date || "—"}</td>
                  <td className="px-5 py-4 text-gray-900 dark:text-white font-medium">{record.po_number}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{record.invoice_number || "—"}</td>
                  <td className="px-5 py-4 text-gray-900 dark:text-white">{formatAED(record.lpo_value_incl_vat)}</td>
                  <td className="px-5 py-4 text-gray-900 dark:text-white">{record.invoiced_value_incl_vat > 0 ? formatAED(record.invoiced_value_incl_vat) : "—"}</td>
                  <td className={`px-5 py-4 font-medium ${record.gap_value > 0 ? "text-red-500" : "text-gray-600 dark:text-gray-400"}`}>
                    {record.gap_value !== 0 ? formatAED(record.gap_value) : "—"}
                  </td>
                  <td className={`px-5 py-4 font-medium ${getServiceColor(record.service_level_pct)}`}>
                    {record.service_level_pct}%
                  </td>
                  <td className="px-5 py-4 text-gray-900 dark:text-white">{record.commission_aed > 0 ? formatAED(record.commission_aed) : "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      record.match_status === "MATCHED" 
                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                        : "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    }`}>
                      {record.match_status || "PENDING"}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr className="border-t border-gray-100 dark:border-gray-800">
                  <td colSpan={12} className="px-5 py-12 text-center text-gray-500">
                    No records yet. Upload LPO and Invoice to populate this table.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Entry Modal */}
      {showModal && selectedLpo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Invoice Details
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                PO: {selectedLpo.po_number}
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Enter invoice number"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Line Items (for quantity tracking)
                </label>
                {lineItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3 mb-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={item.qty_ordered}
                        onChange={(e) => {
                          const newItems = [...lineItems];
                          newItems[idx].qty_ordered = parseInt(e.target.value) || 0;
                          setLineItems(newItems);
                        }}
                        placeholder="Qty Ordered"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        value={item.qty_delivered}
                        onChange={(e) => {
                          const newItems = [...lineItems];
                          newItems[idx].qty_delivered = parseInt(e.target.value) || 0;
                          setLineItems(newItems);
                        }}
                        placeholder="Qty Delivered"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInvoice}
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                Save Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
