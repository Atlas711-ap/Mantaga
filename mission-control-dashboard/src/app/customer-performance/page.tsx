"use client";

export const dynamic = 'force-dynamic';

import { useMemo, useEffect, useState } from "react";
import { useMasterSku, useLatestDailyStockSnapshot, useAllDailyStockSnapshot } from "../../hooks/useConvex";

interface SkuData {
  barcode: string;
  sku_name: string;
  client: string;
  brand: string;
  soh: number;
  threepl_stock: number;
  avg_stock_per_ds: number;
  active_ds: number;
  inactive_ds: number;
}

function normalizeBarcode(barcode: string): string {
  return String(barcode).replace(/^0+/, '').replace(/[^0-9]/g, '');
}

function is3PLWarehouse(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes("3pl") || lower.includes("buffer") || lower.includes("warehouse");
}

function isCentralWarehouse(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes("central") || lower.includes("headquarter") || lower.includes("hq");
}

export default function CustomerPerformancePage() {
  const skus = useMasterSku();
  const latestStockData = useLatestDailyStockSnapshot();
  const allStockData = useAllDailyStockSnapshot();
  const [knownSkus, setKnownSkus] = useState<Set<string>>(new Set());

  // Accumulate known SKUs from all stock data
  useEffect(() => {
    if (allStockData && allStockData.length > 0) {
      setKnownSkus(prev => {
        const newKnown = new Set(prev);
        allStockData.forEach(s => {
          const normalized = normalizeBarcode(s.barcode);
          if (normalized) newKnown.add(normalized);
        });
        return newKnown;
      });
    }
  }, [allStockData]);

  const stockData = latestStockData;

  // Build SKU data with client and brand from master SKU
  const skuData: SkuData[] = useMemo(() => {
    if (!stockData) return [];
    
    const knownBarcodes = Array.from(knownSkus);
    
    // Create maps from master SKU
    const skuInfoMap: Record<string, { sku_name: string; client: string; brand: string }> = {};
    if (skus) {
      skus.forEach(sku => {
        const normalized = normalizeBarcode(sku.barcode);
        if (normalized) {
          skuInfoMap[normalized] = {
            sku_name: sku.sku_name || "",
            client: sku.client || "",
            brand: sku.brand || ""
          };
        }
      });
    }
    
    // Group by barcode
    const byBarcode: Record<string, typeof stockData> = {};
    stockData.forEach(s => {
      const normalized = normalizeBarcode(s.barcode);
      if (!byBarcode[normalized]) byBarcode[normalized] = [];
      byBarcode[normalized].push(s);
    });
    
    return knownBarcodes.map(barcode => {
      const stock = byBarcode[barcode] || [];
      const info = skuInfoMap[barcode] || { sku_name: stock[0]?.product_name || barcode, client: "", brand: "" };
      
      // Filter out 3PL and Central for DS calculations
      const dsStock = stock.filter(s => !is3PLWarehouse(s.warehouse_name) && !isCentralWarehouse(s.warehouse_name));
      
      const soh = stock.reduce((sum, s) => sum + (s.stock_on_hand || 0), 0);
      const threeplStock = stock.filter(s => is3PLWarehouse(s.warehouse_name)).reduce((sum, s) => sum + (s.stock_on_hand || 0), 0);
      const activeDs = dsStock.filter(s => (s.stock_on_hand || 0) > 0).length;
      const inactiveDs = dsStock.filter(s => (s.stock_on_hand || 0) === 0).length;
      const avgStockPerDs = dsStock.length > 0 ? Math.round(soh / dsStock.length) : 0;
      
      return {
        barcode,
        sku_name: info.sku_name,
        client: info.client,
        brand: info.brand,
        soh,
        threepl_stock: threeplStock,
        avg_stock_per_ds: avgStockPerDs,
        active_ds: activeDs,
        inactive_ds: inactiveDs,
      };
    }).filter(sku => sku.sku_name);
  }, [skus, stockData, knownSkus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-sm font-medium text-gray-500">
        Customers - Stock Overview
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Brand</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">SKU Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Barcode</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">SOH</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">3PL Stock</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Avg Stock/DS</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Active DS</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Inactive DS</th>
              </tr>
            </thead>
            <tbody>
              {skuData.length > 0 ? skuData.map((sku) => (
                <tr key={sku.barcode} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{sku.client}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{sku.brand}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100 max-w-[200px] truncate">{sku.sku_name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{sku.barcode}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-mono text-right">{sku.soh.toLocaleString()}</td>
                  <td className="px-4 py-3 text-cyan-600 dark:text-cyan-400 font-mono text-right">{sku.threepl_stock.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-mono text-right">{sku.avg_stock_per_ds}</td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-mono text-right">{sku.active_ds}</td>
                  <td className={`px-4 py-3 font-mono text-right ${sku.inactive_ds > 0 ? "text-red-500" : "text-gray-500"}`}>{sku.inactive_ds}</td>
                </tr>
              )) : (
                <tr className="border-t border-gray-100 dark:border-gray-800">
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No stock data available. Upload a Daily Stock Report to see data.
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
