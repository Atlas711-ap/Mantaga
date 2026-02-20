"use client";

import { useState, useMemo } from "react";

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

const mockSkuSummary: SkuSummary[] = [
  { barcode: "09501033112124", sku_name: "Al Mudhish Chips Ready Salt 75g", sold_7d: 142, sold_14d: 298, sold_30d: 601, sold_this_month: 187, sold_last_month: 412, mom_change_pct: -54.6, avg_replenishment_days: 2.8, active_darkstores: 38 },
  { barcode: "09501033112421", sku_name: "Al Mudhish Ripple Crunch Sour Cream & Onion 75g", sold_7d: 168, sold_14d: 341, sold_30d: 689, sold_this_month: 221, sold_last_month: 468, mom_change_pct: -52.8, avg_replenishment_days: 2.5, active_darkstores: 42 },
  { barcode: "09501033112636", sku_name: "Al Mudhish Chips Rip. Cru. Chill 75g", sold_7d: 98, sold_14d: 201, sold_30d: 388, sold_this_month: 124, sold_last_month: 264, mom_change_pct: -53.0, avg_replenishment_days: 3.1, active_darkstores: 35 },
  { barcode: "09501033112629", sku_name: "Al Mudhish Ripples Crunch Chilli 15g", sold_7d: 201, sold_14d: 398, sold_30d: 812, sold_this_month: 267, sold_last_month: 545, mom_change_pct: -51.0, avg_replenishment_days: 2.1, active_darkstores: 29 },
  { barcode: "09501033112049", sku_name: "Al Mudhish Chips Tortilla Pizza 100g", sold_7d: 87, sold_14d: 178, sold_30d: 356, sold_this_month: 112, sold_last_month: 244, mom_change_pct: -54.1, avg_replenishment_days: 3.4, active_darkstores: 31 },
  { barcode: "09501100482648", sku_name: "Suroor Chips Tomato 14g", sold_7d: 312, sold_14d: 621, sold_30d: 1244, sold_this_month: 398, sold_last_month: 846, mom_change_pct: -52.9, avg_replenishment_days: 1.8, active_darkstores: 18 },
  { barcode: "06291105470339", sku_name: "Suroor Potato Chips Mexican 15g", sold_7d: 287, sold_14d: 571, sold_30d: 1102, sold_this_month: 356, sold_last_month: 746, mom_change_pct: -52.3, avg_replenishment_days: 2.0, active_darkstores: 36 },
  { barcode: "09501100482327", sku_name: "Suroor Tomato Flavour Crispstix 18g", sold_7d: 198, sold_14d: 401, sold_30d: 798, sold_this_month: 245, sold_last_month: 553, mom_change_pct: -55.7, avg_replenishment_days: 2.3, active_darkstores: 38 },
  { barcode: "09501100482471", sku_name: "Suroor Minoman Cheese Flavour Corn Puffs 22g", sold_7d: 176, sold_14d: 354, sold_30d: 701, sold_this_month: 219, sold_last_month: 482, mom_change_pct: -54.6, avg_replenishment_days: 2.6, active_darkstores: 37 },
];

const mockDarkstoreData: Record<string, DarkstoreData[]> = {
  "09501033112124": [
    { darkstore: "UAE_Dubai_DS_36_Bahia", current_stock: 14, sold_7d: 8, avg_daily_rate: 1.1, last_replenishment: "17 Feb 2026", days_since_replenishment: 2, avg_replenishment_cycle: 2.8, status: "HEALTHY" },
    { darkstore: "UAE_Dubai_DS_43-Qusais", current_stock: 24, sold_7d: 12, avg_daily_rate: 1.7, last_replenishment: "16 Feb 2026", days_since_replenishment: 3, avg_replenishment_cycle: 2.5, status: "HEALTHY" },
    { darkstore: "UAE_Dubai_DS_60 - Sanaya", current_stock: 7, sold_7d: 6, avg_daily_rate: 0.9, last_replenishment: "15 Feb 2026", days_since_replenishment: 4, avg_replenishment_cycle: 3.1, status: "HEALTHY" },
    { darkstore: "UAE_Dubai_DS_4 - Barsha 1", current_stock: 0, sold_7d: 4, avg_daily_rate: 0.6, last_replenishment: "10 Feb 2026", days_since_replenishment: 9, avg_replenishment_cycle: 3.2, status: "OOS" },
    { darkstore: "UAE_Dubai_DS_59 - Jumeirah 2", current_stock: 3, sold_7d: 5, avg_daily_rate: 0.7, last_replenishment: "14 Feb 2026", days_since_replenishment: 5, avg_replenishment_cycle: 2.9, status: "LOW" },
    { darkstore: "UAE_Dubai_DS_6 - JVC", current_stock: 8, sold_7d: 9, avg_daily_rate: 1.3, last_replenishment: "16 Feb 2026", days_since_replenishment: 3, avg_replenishment_cycle: 2.6, status: "HEALTHY" },
    { darkstore: "UAE_Dubai_DS_41_Nad Al Hamar", current_stock: 8, sold_7d: 7, avg_daily_rate: 1.0, last_replenishment: "15 Feb 2026", days_since_replenishment: 4, avg_replenishment_cycle: 3.0, status: "HEALTHY" },
    { darkstore: "UAE_Dubai_DS_25- Barsha South", current_stock: 24, sold_7d: 11, avg_daily_rate: 1.6, last_replenishment: "17 Feb 2026", days_since_replenishment: 2, avg_replenishment_cycle: 2.4, status: "HEALTHY" },
    { darkstore: "UAE_Dubai_DS_15_Khaldiya Tmart", current_stock: 0, sold_7d: 3, avg_daily_rate: 0.4, last_replenishment: "08 Feb 2026", days_since_replenishment: 11, avg_replenishment_cycle: 3.5, status: "OOS" },
    { darkstore: "UAE_Dubai_DS_1 - Business Bay", current_stock: 0, sold_7d: 2, avg_daily_rate: 0.3, last_replenishment: "07 Feb 2026", days_since_replenishment: 12, avg_replenishment_cycle: 4.0, status: "OOS" },
  ],
};

const mockThreePlStock: Record<string, ThreePlStock> = {
  "09501033112124": { warehouse: "UAE_Talabat_3pl_GSL_DIP", stock_on_hand: 276, last_updated: "19 Feb 2026" },
  "09501033112421": { warehouse: "UAE_Talabat_3pl_GSL_DIP", stock_on_hand: 120, last_updated: "19 Feb 2026" },
  "09501033112636": { warehouse: "UAE_Talabat_3pl_GSL_DIP", stock_on_hand: 60, last_updated: "19 Feb 2026" },
  "09501033112629": { warehouse: "UAE_Talabat_3pl_GSL_DIP", stock_on_hand: 55, last_updated: "19 Feb 2026" },
  "09501033112049": { warehouse: "UAE_Talabat_3pl_GSL_DIP", stock_on_hand: 0, last_updated: "19 Feb 2026" },
  "09501100482648": { warehouse: "UAE_Talabat_3pl_GSL_DIP", stock_on_hand: 64, last_updated: "19 Feb 2026" },
  "06291105470339": { warehouse: "UAE_Talabat_3pl_GSL_DIP", stock_on_hand: 537, last_updated: "19 Feb 2026" },
  "09501100482327": { warehouse: "UAE_Talabat_3pl_GSL_DIP", stock_on_hand: 412, last_updated: "19 Feb 2026" },
  "09501100482471": { warehouse: "UAE_Talabat_3pl_GSL_DIP", stock_on_hand: 193, last_updated: "19 Feb 2026" },
};

type ViewMode = "sku" | "darkstore";

function formatDarkstoreName(name: string): string {
  return name.replace("UAE_Dubai_", "");
}

export default function CustomerPerformancePage() {
  const [view, setView] = useState<ViewMode>("sku");
  const [selectedSku, setSelectedSku] = useState<SkuSummary | null>(null);

  const selectedDarkstoreData = useMemo(() => {
    if (!selectedSku) return [];
    return mockDarkstoreData[selectedSku.barcode] || [];
  }, [selectedSku]);

  const selectedThreePlData = useMemo(() => {
    if (!selectedSku) return null;
    return mockThreePlStock[selectedSku.barcode] || null;
  }, [selectedSku]);

  const sortedDarkstoreData = useMemo(() => {
    const statusOrder = { OOS: 0, LOW: 1, HEALTHY: 2 };
    return [...selectedDarkstoreData].sort((a, b) => {
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return b.days_since_replenishment - a.days_since_replenishment;
    });
  }, [selectedDarkstoreData]);

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
                  {mockSkuSummary.length > 0 ? mockSkuSummary.map((sku) => (
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
              {/* Back Button and Subtitle */}
              <div className="flex items-center gap-4">
                <button onClick={handleBack} className="text-sm text-slate-400 hover:text-slate-200">
                  ← Back to SKU Summary
                </button>
              </div>
              <div className="text-sm text-slate-300">{selectedSku.sku_name}</div>

              {/* Darkstore Table */}
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
                      {sortedDarkstoreData.length > 0 ? sortedDarkstoreData.map((ds, i) => (
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

              {/* 3PL Buffer Stock Card */}
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
