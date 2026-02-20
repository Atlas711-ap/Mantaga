"use client";

import { useState, useMemo } from "react";
import { useMasterSku, useLatestDailyStockSnapshot } from "../../hooks/useConvex";

interface SkuSummary {
  barcode: string;
  sku_name: string;
  soh: number; // Total stock on hand (all darkstores + 3PL)
  threepl_stock: number; // Stock in 3PL warehouse
  active_ds: number; // Darkstores with > 0 stock (excluding 3PL and central)
  inactive_ds: number; // Darkstores with 0 stock (excluding 3PL and central)
}

interface DarkstoreData {
  darkstore: string;
  current_stock: number;
  sold_7d: number;
  avg_daily_rate: number;
  last_replenishment: string;
  days_since_replenishment: number;
  avg_replenishment_cycle: number;
  status: "OOS" | "LOW" | "HEALTHY";
}

type ViewMode = "sku" | "darkstore";

function formatDarkstoreName(name: string): string {
  // Remove prefixes like UAE_Dubai_
  return name.replace(/^UAE_Dubai_/, "").replace(/_/g, " ");
}

function isCentralWarehouse(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes("central") || lower.includes("headquarter") || lower.includes("hq");
}

function is3PLWarehouse(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes("3pl") || lower.includes("buffer") || lower.includes("warehouse");
}

export default function CustomerPerformancePage() {
  const skus = useMasterSku();
  const stockData = useLatestDailyStockSnapshot();
  const [view, setView] = useState<ViewMode>("sku");
  const [selectedSku, setSelectedSku] = useState<SkuSummary | null>(null);

  // Transform Convex data to SKU summary format with new columns
  const skuSummary: SkuSummary[] = useMemo(() => {
    if (!skus || !stockData) return [];
    
    // Group stock by barcode
    const byBarcode: Record<string, typeof stockData> = {};
    stockData.forEach(s => {
      if (!byBarcode[s.barcode]) byBarcode[s.barcode] = [];
      byBarcode[s.barcode].push(s);
    });
    
    return skus.map(sku => {
      const stock = byBarcode[sku.barcode] || [];
      
      // SOH = Total stock on hand (all darkstores + 3PL)
      const soh = stock.reduce((sum, s) => sum + (s.stock_on_hand || 0), 0);
      
      // 3PL Stock = Stock in 3PL warehouse
      const threeplStock = stock
        .filter(s => is3PLWarehouse(s.warehouse_name))
        .reduce((sum, s) => sum + (s.stock_on_hand || 0), 0);
      
      // Active DS = Darkstores with > 0 stock (excluding 3PL and central)
      const activeDs = stock.filter(s => 
        !is3PLWarehouse(s.warehouse_name) && 
        !isCentralWarehouse(s.warehouse_name) && 
        (s.stock_on_hand || 0) > 0
      ).length;
      
      // Inactive DS = Darkstores with 0 stock (excluding 3PL and central)
      const inactiveDs = stock.filter(s => 
        !is3PLWarehouse(s.warehouse_name) && 
        !isCentralWarehouse(s.warehouse_name) && 
        (s.stock_on_hand || 0) === 0
      ).length;
      
      return {
        barcode: sku.barcode,
        sku_name: sku.sku_name,
        soh,
        threepl_stock: threeplStock,
        active_ds: activeDs,
        inactive_ds: inactiveDs,
      };
    }).filter(sku => sku.soh > 0); // Only show SKUs with stock data
  }, [skus, stockData]);

  // Get darkstore breakdown for selected SKU
  const selectedDarkstoreData: DarkstoreData[] = useMemo(() => {
    if (!selectedSku || !stockData) return [];
    
    return stockData
      .filter(s => s.barcode === selectedSku.barcode)
      .map(s => ({
        darkstore: s.warehouse_name,
        current_stock: s.stock_on_hand || 0,
        sold_7d: 0, // Would need sell_out_log for real data
        avg_daily_rate: 0,
        last_replenishment: s.report_date,
        days_since_replenishment: 0,
        avg_replenishment_cycle: 0,
        status: (s.stock_on_hand || 0) === 0 ? "OOS" as const : 
                (s.stock_on_hand || 0) <= 3 ? "LOW" as const : "HEALTHY" as const,
      }))
      .sort((a, b) => {
        const statusOrder = { OOS: 0, LOW: 1, HEALTHY: 2 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        return b.current_stock - a.current_stock;
      });
  }, [selectedSku, stockData]);

  const handleSkuClick = (sku: SkuSummary) => {
    setSelectedSku(sku);
    setView("darkstore");
  };

  const handleBack = () => {
    setSelectedSku(null);
    setView("sku");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Stock Overview by SKU
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setView("sku"); setSelectedSku(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === "sku" ? "bg-amber-500 text-white" : "bg-slate-700 text-slate-300"
            }`}
          >
            SKU Summary
          </button>
          <button
            onClick={() => setView("darkstore")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === "darkstore" ? "bg-amber-500 text-white" : "bg-slate-700 text-slate-300"
            }`}
          >
            Darkstore Drilldown
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total SKUs</div>
          <div className="text-2xl font-mono text-white">{skuSummary.length}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Stock</div>
          <div className="text-2xl font-mono text-white">
            {skuSummary.reduce((sum, s) => sum + s.soh, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Active Darkstores</div>
          <div className="text-2xl font-mono text-emerald-400">
            {skuSummary.reduce((sum, s) => sum + s.active_ds, 0)}
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Inactive Darkstores</div>
          <div className="text-2xl font-mono text-red-400">
            {skuSummary.reduce((sum, s) => sum + s.inactive_ds, 0)}
          </div>
        </div>
      </div>

      {/* VIEW 1: SKU SUMMARY */}
      {view === "sku" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">SKU Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Barcode</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">SOH</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">3PL Stock</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Active DS</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Inactive DS</th>
                </tr>
              </thead>
              <tbody>
                {skuSummary.length > 0 ? skuSummary.map((sku) => (
                  <tr
                    key={sku.barcode}
                    onClick={() => handleSkuClick(sku)}
                    className="border-t border-slate-800 cursor-pointer hover:bg-slate-800"
                  >
                    <td className="px-4 py-3 text-slate-300 max-w-[200px] truncate">{sku.sku_name}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono">{sku.barcode}</td>
                    <td className="px-4 py-3 text-white font-mono text-right">{sku.soh.toLocaleString()}</td>
                    <td className="px-4 py-3 text-cyan-400 font-mono text-right">{sku.threepl_stock.toLocaleString()}</td>
                    <td className="px-4 py-3 text-emerald-400 font-mono text-right">{sku.active_ds}</td>
                    <td className={`px-4 py-3 font-mono text-right ${sku.inactive_ds > 0 ? "text-red-400" : "text-slate-400"}`}>
                      {sku.inactive_ds}
                    </td>
                  </tr>
                )) : (
                  <tr className="border-t border-slate-800">
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No stock data available. Upload a Daily Stock Report to see data here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: DARKSTORE DRILLDOWN */}
      {view === "darkstore" && (
        <>
          {selectedSku ? (
            <>
              <div className="flex items-center gap-4">
                <button onClick={handleBack} className="text-sm text-slate-400 hover:text-slate-200">
                  ← Back to SKU Summary
                </button>
              </div>
              <div className="text-sm text-slate-300 mb-4">
                {selectedSku.sku_name} — {selectedSku.barcode}
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Movement by Darkstore</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Warehouse</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Type</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase">Stock on Hand</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase">Reserved</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase">Effective</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDarkstoreData.length > 0 ? selectedDarkstoreData.map((ds, i) => (
                        <tr key={i} className="border-t border-slate-800 hover:bg-slate-800/50">
                          <td className="px-4 py-3 text-slate-300">{formatDarkstoreName(ds.darkstore)}</td>
                          <td className="px-4 py-3 text-slate-400">
                            {is3PLWarehouse(ds.darkstore) ? (
                              <span className="text-cyan-400">3PL</span>
                            ) : isCentralWarehouse(ds.darkstore) ? (
                              <span className="text-purple-400">Central</span>
                            ) : (
                              <span className="text-amber-400">Darkstore</span>
                            )}
                          </td>
                          <td className={`px-4 py-3 font-mono text-right ${
                            ds.current_stock === 0 ? "text-red-400" : "text-white"
                          }`}>
                            {ds.current_stock}
                          </td>
                          <td className="px-4 py-3 text-slate-400 font-mono text-right">0</td>
                          <td className={`px-4 py-3 font-mono text-right ${
                            ds.current_stock === 0 ? "text-red-400" : "text-emerald-400"
                          }`}>
                            {ds.current_stock}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              ds.status === "OOS" ? "bg-red-500/20 text-red-400" :
                              ds.status === "LOW" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                            }`}>
                              {ds.status === "OOS" ? "🔴 OOS" : ds.status === "LOW" ? "🟡 LOW" : "🟢 HEALTHY"}
                            </span>
                          </td>
                        </tr>
                      )) : (
                        <tr className="border-t border-slate-800">
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                            No darkstore data available for this SKU
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-400 mb-4">Select a SKU from the SKU Summary to view darkstore breakdown</p>
              <button onClick={() => setView("sku")} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm">
                Go to SKU Summary →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
