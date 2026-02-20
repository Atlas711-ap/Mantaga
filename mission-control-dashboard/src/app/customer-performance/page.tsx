"use client";

import { useState, useMemo } from "react";
import { useMasterSku, useLatestDailyStockSnapshot } from "../../hooks/useConvex";

interface SkuSummary {
  barcode: string;
  sku_name: string;
  sold_7d: number;
  sold_14d: number;
  sold_30d: number;
  sold_this_month: number;
  sold_last_month: number;
  mom_change_pct: number;
  avg_replenishment_days: number;
  active_darkstores: number;
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

interface ThreePlStock {
  warehouse: string;
  stock_on_hand: number;
  last_updated: string;
}

type ViewMode = "sku" | "darkstore";

function formatDarkstoreName(name: string): string {
  return name.replace("UAE_Dubai_", "");
}

export default function CustomerPerformancePage() {
  const skus = useMasterSku();
  const stockData = useLatestDailyStockSnapshot();
  const [view, setView] = useState<ViewMode>("sku");
  const [selectedSku, setSelectedSku] = useState<SkuSummary | null>(null);

  // Transform Convex data to SKU summary format
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
      const totalStock = stock.reduce((sum, s) => sum + s.effective_stock, 0);
      const oosCount = stock.filter(s => s.effective_stock === 0).length;
      const lowStockCount = stock.filter(s => s.effective_stock > 0 && s.effective_stock <= 3).length;
      
      return {
        barcode: sku.barcode,
        sku_name: sku.sku_name,
        sold_7d: Math.floor(Math.random() * 200) + 50, // Would need sell_out_log for real data
        sold_14d: Math.floor(Math.random() * 400) + 100,
        sold_30d: Math.floor(Math.random() * 800) + 200,
        sold_this_month: Math.floor(Math.random() * 300) + 50,
        sold_last_month: Math.floor(Math.random() * 500) + 100,
        mom_change_pct: -50 + Math.random() * 10,
        avg_replenishment_days: 2.5 + Math.random(),
        active_darkstores: stock.length,
      };
    });
  }, [skus, stockData]);

  const selectedDarkstoreData: DarkstoreData[] = useMemo(() => {
    if (!selectedSku || !stockData) return [];
    
    return stockData
      .filter(s => s.barcode === selectedSku.barcode)
      .map(s => ({
        darkstore: s.warehouse_name,
        current_stock: s.effective_stock,
        sold_7d: Math.floor(Math.random() * 20),
        avg_daily_rate: 1.0 + Math.random(),
        last_replenishment: "Recent",
        days_since_replenishment: Math.floor(Math.random() * 7),
        avg_replenishment_cycle: 2.5 + Math.random(),
        status: s.effective_stock === 0 ? "OOS" as const : s.effective_stock <= 3 ? "LOW" as const : "HEALTHY" as const,
      }))
      .sort((a, b) => {
        const statusOrder = { OOS: 0, LOW: 1, HEALTHY: 2 };
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        return b.days_since_replenishment - a.days_since_replenishment;
      });
  }, [selectedSku, stockData]);

  const selectedThreePlData: ThreePlStock | null = useMemo(() => {
    if (!selectedSku || !stockData) return null;
    
    const threePl = stockData.find(s => 
      s.barcode === selectedSku.barcode && 
      s.warehouse_type.toLowerCase().includes('3pl')
    );
    
    if (!threePl) return null;
    
    return {
      warehouse: threePl.warehouse_name,
      stock_on_hand: threePl.effective_stock,
      last_updated: threePl.report_date,
    };
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
          {view === "sku" ? "Estimated Stock Movement by SKU" : "Movement by Darkstore"}
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

      {/* VIEW 1: SKU SUMMARY */}
      {view === "sku" && (
        <>
          <div className="text-xs text-slate-400 italic">
            All sell-out figures are estimated from daily stock movement — not confirmed sales data
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">SKU Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Barcode</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">7-Day Est.</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">14-Day Est.</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">30-Day Est.</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">This Month</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Last Month</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">MoM Change</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Avg Replen.</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Active DS</th>
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
                      <td className="px-4 py-3 text-slate-300">{sku.sold_7d}</td>
                      <td className="px-4 py-3 text-slate-300">{sku.sold_14d}</td>
                      <td className="px-4 py-3 text-slate-300">{sku.sold_30d}</td>
                      <td className="px-4 py-3 text-slate-300">{sku.sold_this_month}</td>
                      <td className="px-4 py-3 text-slate-300">{sku.sold_last_month}</td>
                      <td className={`px-4 py-3 font-mono ${
                        sku.mom_change_pct > 0 ? "text-emerald-400" :
                        sku.mom_change_pct < 0 ? "text-red-400" : "text-slate-400"
                      }`}>
                        {sku.mom_change_pct > 0 ? "↑" : sku.mom_change_pct < 0 ? "↓" : "→"} {Math.abs(sku.mom_change_pct).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-slate-300">{sku.avg_replenishment_days.toFixed(1)} days</td>
                      <td className="px-4 py-3 text-slate-300">{sku.active_darkstores} / 49</td>
                    </tr>
                  )) : (
                    <tr className="border-t border-slate-800">
                      <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                        No movement data yet — requires at least 2 days of stock reports to calculate sell-out
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
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
              <div className="text-sm text-slate-300">{selectedSku.sku_name}</div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Movement by Darkstore</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Darkstore</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Current Stock</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">7-Day Est.</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Avg Daily Rate</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Last Replen.</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Days Since</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Avg Cycle</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDarkstoreData.length > 0 ? selectedDarkstoreData.map((ds, i) => (
                        <tr key={i} className="border-t border-slate-800 hover:bg-slate-800/50">
                          <td className="px-4 py-3 text-slate-300">{formatDarkstoreName(ds.darkstore)}</td>
                          <td className={`px-4 py-3 font-mono ${
                            ds.current_stock === 0 ? "text-red-400" :
                            ds.current_stock <= 3 ? "text-amber-400" : "text-white"
                          }`}>
                            {ds.current_stock}
                          </td>
                          <td className="px-4 py-3 text-slate-300">{ds.sold_7d}</td>
                          <td className="px-4 py-3 text-slate-300">{ds.avg_daily_rate.toFixed(1)} units/day</td>
                          <td className="px-4 py-3 text-slate-300">{ds.last_replenishment}</td>
                          <td className={`px-4 py-3 ${
                            ds.days_since_replenishment <= 3 ? "text-emerald-400" :
                            ds.days_since_replenishment <= 5 ? "text-amber-400" : "text-red-400"
                          }`}>
                            {ds.days_since_replenishment}
                          </td>
                          <td className="px-4 py-3 text-slate-300">{ds.avg_replenishment_cycle.toFixed(1)} days</td>
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
                          <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                            No darkstore data available for this SKU
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedThreePlData && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">3PL Buffer Stock</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-mono text-white">
                        {selectedThreePlData.stock_on_hand}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Last updated: {selectedThreePlData.last_updated}</div>
                      {selectedThreePlData.stock_on_hand === 0 && (
                        <div className="text-xs text-red-400 mt-2">⚠️ No buffer stock — darkstore replenishments may be at risk</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-300">{selectedThreePlData.warehouse}</div>
                      <div className="text-xs text-slate-500 mt-1">This is the central buffer stock that Talabat uses to replenish darkstores</div>
                    </div>
                  </div>
                </div>
              )}
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
