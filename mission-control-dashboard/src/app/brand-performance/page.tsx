"use client";

export const dynamic = 'force-dynamic';

import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import * as XLSX from "xlsx";
import { useBrandPerformance } from "../../hooks/useConvex";

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
  barcode: string;
  product_name: string;
  quantity_ordered: number;
  quantity_delivered: number;
  unit_cost: number;
  lpo_value_excl_vat: number;
  lpo_value_incl_vat: number;
  invoiced_value_excl_vat: number;
  invoiced_value_incl_vat: number;
  vat_amount_invoiced?: number;
  total_incl_vat_invoiced?: number;
  gap_value: number;
  service_level_pct: number;
  commission_pct?: number;
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
  const mockData: BrandRecord[] = brandData || [];
  
  // Filters
  const [filters, setFilters] = useState({
    client: "",
    brand: "",
    customer: "",
    year: new Date().getFullYear().toString(),
    month: "",
  });
  
  // Get unique values for dropdowns
  const uniqueClients = useMemo(() => [...new Set(mockData.map(d => d.client).filter(Boolean))], [mockData]);
  const uniqueBrands = useMemo(() => [...new Set(mockData.map(d => d.brand).filter(Boolean))], [mockData]);
  const uniqueCustomers = useMemo(() => [...new Set(mockData.map(d => d.customer).filter(Boolean))], [mockData]);
  const uniqueYears = useMemo(() => [...new Set(mockData.map(d => d.year))], [mockData]);
  const uniqueMonths = useMemo(() => [...new Set(mockData.map(d => d.month))], [mockData]);
  
  // Filtered data
  const filteredData = useMemo(() => {
    return mockData.filter(d => {
      if (filters.client && d.client !== filters.client) return false;
      if (filters.brand && d.brand !== filters.brand) return false;
      if (filters.customer && d.customer !== filters.customer) return false;
      if (filters.year && d.year !== parseInt(filters.year)) return false;
      if (filters.month && d.month !== parseInt(filters.month)) return false;
      return true;
    });
  }, [mockData, filters]);
  
  // MTD calculations
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  const mtdData = useMemo(() => {
    return filteredData.filter(d => d.month === currentMonth && d.year === currentYear);
  }, [filteredData]);

  const mtdStats = useMemo(() => {
    const totalInvoiced = mtdData.reduce((sum, d) => sum + (d.invoiced_value_incl_vat || 0), 0);
    const totalCommission = mtdData.reduce((sum, d) => sum + d.commission_aed, 0);
    const lpoCount = new Set(mtdData.map(d => d.po_number)).size;
    const skuCount = mtdData.length;
    const avgService = skuCount > 0 ? mtdData.reduce((sum, d) => sum + d.service_level_pct, 0) / skuCount : 0;
    return { totalInvoiced, totalCommission, lpoCount, skuCount, avgService };
  }, [mtdData]);

  // YTD calculations
  const ytdData = useMemo(() => {
    return filteredData.filter(d => d.year === currentYear);
  }, [filteredData, currentYear]);

  const ytdStats = useMemo(() => {
    const totalInvoiced = ytdData.reduce((sum, d) => sum + (d.invoiced_value_incl_vat || 0), 0);
    const totalCommission = ytdData.reduce((sum, d) => sum + d.commission_aed, 0);
    const lpoCount = new Set(ytdData.map(d => d.po_number)).size;
    const skuCount = ytdData.length;
    const avgService = skuCount > 0 ? ytdData.reduce((sum, d) => sum + d.service_level_pct, 0) / skuCount : 0;
    return { totalInvoiced, totalCommission, lpoCount, skuCount, avgService };
  }, [ytdData]);

  // Filtered totals
  const filteredStats = useMemo(() => {
    const totalInvoiced = filteredData.reduce((sum, d) => sum + (d.invoiced_value_incl_vat || 0), 0);
    const totalCommission = filteredData.reduce((sum, d) => sum + d.commission_aed, 0);
    const lpoCount = new Set(filteredData.map(d => d.po_number)).size;
    const skuCount = filteredData.length;
    const avgService = skuCount > 0 ? filteredData.reduce((sum, d) => sum + d.service_level_pct, 0) / skuCount : 0;
    return { totalInvoiced, totalCommission, lpoCount, skuCount, avgService };
  }, [filteredData]);

  // Monthly history (from filtered data)
  const monthlyHistory = useMemo(() => {
    const grouped: Record<string, BrandRecord[]> = {};
    filteredData.forEach(d => {
      const key = `${d.year}-${d.month}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(d);
    });
    
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, records]) => {
        const [year, month] = key.split('-').map(Number);
        const totalInvoiced = records.reduce((sum, r) => sum + (r.invoiced_value_incl_vat || 0), 0);
        const totalCommission = records.reduce((sum, r) => sum + r.commission_aed, 0);
        const lpoCount = new Set(records.map(r => r.po_number)).size;
        const avgService = records.length > 0 
          ? records.reduce((sum, r) => sum + r.service_level_pct, 0) / records.length 
          : 0;
        return { year, month, lpoCount, totalInvoiced, avgService, totalCommission };
      });
  }, [filteredData]);

  const handleExport = () => {
    const exportData = filteredData.map(d => ({
      Year: d.year,
      Month: monthNames[d.month],
      "PO Date": d.po_date,
      "Invoice Date": d.invoice_date,
      "LPO No.": d.po_number,
      "Invoice No.": d.invoice_number,
      "Barcode": d.barcode,
      "Product": d.product_name,
      "Client": d.client,
      "Brand": d.brand,
      "Customer": d.customer,
      "Qty Ordered": d.quantity_ordered,
      "Qty Delivered": d.quantity_delivered,
      "Unit Cost": d.unit_cost,
      "LPO Value excl VAT (AED)": d.lpo_value_excl_vat,
      "LPO Value incl VAT (AED)": d.lpo_value_incl_vat,
      "Invoiced Value excl VAT (AED)": d.invoiced_value_excl_vat,
      "Invoiced Value incl VAT (AED)": d.invoiced_value_incl_vat,
      "Gap (AED)": d.gap_value,
      "Service Level %": d.service_level_pct + "%",
      "Commission %": d.commission_pct ? d.commission_pct + "%" : "",
      "Commission (AED)": d.commission_aed,
      "Match Status": d.match_status,
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Brand Performance");
    
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `Mantaga_Brand_Performance_${date}.xlsx`);
  };

  const clearFilters = () => {
    setFilters({
      client: "",
      brand: "",
      customer: "",
      year: currentYear.toString(),
      month: "",
    });
  };

  const columns = [
    "Year", "Month", "PO Date", "Invoice Date", "LPO No.", "Invoice No.",
    "Barcode", "Product", "Client", "Brand", "Customer", 
    "Qty Ord", "Qty Del", "LPO Value", "Invoiced", "Service Level", "Commission", "Status"
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

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</span>
          {(filters.client || filters.brand || filters.customer || filters.month) && (
            <button onClick={clearFilters} className="text-xs text-blue-500 hover:text-blue-600">
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <select
            value={filters.client}
            onChange={(e) => setFilters({...filters, client: e.target.value})}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="">All Clients</option>
            {uniqueClients.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={filters.brand}
            onChange={(e) => setFilters({...filters, brand: e.target.value})}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="">All Brands</option>
            {uniqueBrands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select
            value={filters.customer}
            onChange={(e) => setFilters({...filters, customer: e.target.value})}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="">All Customers</option>
            {uniqueCustomers.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={filters.year}
            onChange={(e) => setFilters({...filters, year: e.target.value})}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="">All Years</option>
            {uniqueYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select
            value={filters.month}
            onChange={(e) => setFilters({...filters, month: e.target.value})}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="">All Months</option>
            {uniqueMonths.map(m => (
              <option key={m} value={m}>{monthNames[m]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filtered Results Summary */}
      <div>
        <div className="text-xs font-medium text-gray-500 mb-3">Filtered Results ({filteredStats.skuCount} SKUs, {filteredStats.lpoCount} LPOs)</div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Total Invoiced</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{formatAED(filteredStats.totalInvoiced)}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Commission</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{formatAED(filteredStats.totalCommission)}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">LPOs</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{filteredStats.lpoCount}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">SKUs</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{filteredStats.skuCount}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Service Level</div>
            <div className={`text-2xl font-semibold ${getServiceColor(filteredStats.avgService)}`}>{filteredStats.avgService.toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* MTD Summary Cards */}
      <div>
        <div className="text-xs font-medium text-gray-500 mb-3">This Month ({monthNames[currentMonth]} {currentYear})</div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
            <div className="text-xs text-gray-500 mb-1">SKUs</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{mtdStats.skuCount}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Service Level</div>
            <div className={`text-2xl font-semibold ${getServiceColor(mtdStats.avgService)}`}>{mtdStats.avgService.toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* YTD Summary Cards */}
      <div>
        <div className="text-xs font-medium text-gray-500 mb-3">Year to Date ({currentYear})</div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Total Invoiced</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{formatAED(ytdStats.totalInvoiced)}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Commission</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{formatAED(ytdStats.totalCommission)}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">LPOs</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{ytdStats.lpoCount}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">SKUs</div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">{ytdStats.skuCount}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Service Level</div>
            <div className={`text-2xl font-semibold ${getServiceColor(ytdStats.avgService)}`}>{ytdStats.avgService.toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Main Table - SKU Level */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="text-sm font-medium text-gray-500">All Records (SKU-wise)</div>
          <div className="text-xs text-gray-400">
            {filteredData.length} records
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="text-left px-3 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? filteredData.slice(0, 100).map((record) => (
                <tr 
                  key={record._id} 
                  className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-3 py-2.5 text-gray-900 dark:text-white">{record.year}</td>
                  <td className="px-3 py-2.5 text-gray-900 dark:text-white">{monthNames[record.month]}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{record.po_date}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{record.invoice_date || "—"}</td>
                  <td className="px-3 py-2.5 text-gray-900 dark:text-white font-medium">{record.po_number}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{record.invoice_number || "—"}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400 font-mono text-xs">{record.barcode}</td>
                  <td className="px-3 py-2.5 text-gray-900 dark:text-white max-w-xs truncate">{record.product_name}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{record.client || "—"}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{record.brand || "—"}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{record.customer}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400 text-right">{record.quantity_ordered}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400 text-right">{record.quantity_delivered}</td>
                  <td className="px-3 py-2.5 text-gray-900 dark:text-white text-right">{formatAED(record.lpo_value_incl_vat)}</td>
                  <td className="px-3 py-2.5 text-gray-900 dark:text-white text-right">{record.invoiced_value_incl_vat > 0 ? formatAED(record.invoiced_value_incl_vat) : "—"}</td>
                  <td className={`px-3 py-2.5 text-right font-medium ${getServiceColor(record.service_level_pct)}`}>
                    {record.service_level_pct.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2.5 text-gray-900 dark:text-white text-right">{record.commission_aed > 0 ? formatAED(record.commission_aed) : "—"}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      record.match_status === "MATCHED" 
                        ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                        : "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    }`}>
                      {record.match_status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr className="border-t border-gray-100 dark:border-gray-800">
                  <td colSpan={17} className="px-3 py-12 text-center text-gray-500">
                    No records found. Add invoice details in LPO Tracking to populate this table.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredData.length > 100 && (
          <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-center text-sm text-gray-500">
            Showing first 100 of {filteredData.length} records. Export to see all.
          </div>
        )}
      </div>
    </div>
  );
}
