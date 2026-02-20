"use client";

import { useState, useMemo } from "react";
import * as XLSX from "xlsx";

type SkuRecord = {
  _id: string;
  client: string;
  brand: string;
  barcode: string;
  sku_name: string;
  category?: string;
  subcategory?: string;
  case_pack?: number;
  shelf_life?: string;
  nutrition_info?: string;
  ingredients_info?: string;
  amazon_asin?: string;
  talabat_sku?: string;
  noon_zsku?: string;
  careem_code?: string;
  client_sellin_price?: number;
  mantaga_commission_pct?: number;
};

const sampleData: SkuRecord[] = [
  { _id: "1", client: "Quadrant International", brand: "Mudhish", barcode: "SKU-001", sku_name: "Mudhish Classic Chips", category: "Snacks", subcategory: "Chips", case_pack: 24, shelf_life: "6 months", nutrition_info: "Yes", ingredients_info: "Yes", talabat_sku: "TAL-001", noon_zsku: "NOON-001", client_sellin_price: 12.50, mantaga_commission_pct: 15 },
  { _id: "2", client: "Quadrant International", brand: "Mudhish", barcode: "SKU-002", sku_name: "Mudhish Spicy Chips", category: "Snacks", subcategory: "Chips", case_pack: 24, shelf_life: "6 months", nutrition_info: "No", ingredients_info: "No", talabat_sku: "TAL-002", client_sellin_price: 12.50, mantaga_commission_pct: 15 },
  { _id: "3", client: "Quadrant International", brand: "Mudhish", barcode: "SKU-003", sku_name: "Mudhish Onion Rings", case_pack: 24, shelf_life: "6 months", talabat_sku: "TAL-003", client_sellin_price: 14.00, mantaga_commission_pct: 15 },
];

const requiredFields = ["client", "brand", "barcode", "sku_name", "case_pack", "shelf_life", "talabat_sku"];

function isRedRow(record: SkuRecord): { isRed: boolean; missing: string[] } {
  const missing = requiredFields.filter((field) => {
    const value = record[field as keyof SkuRecord];
    return value === undefined || value === null || value === "";
  });
  return { isRed: missing.length > 0, missing };
}

function isAmberRow(record: SkuRecord): { isAmber: boolean; missing: string[] } {
  const { isRed } = isRedRow(record);
  if (isRed) return { isAmber: false, missing: [] };
  
  const missing: string[] = [];
  if (record.nutrition_info === "No") missing.push("Nutrition Info");
  if (record.ingredients_info === "No") missing.push("Ingredients Info");
  
  return { isAmber: missing.length > 0, missing };
}

export default function SkuListPage() {
  const [skus] = useState<SkuRecord[]>(sampleData);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [selectedSkus, setSelectedSkus] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<Partial<SkuRecord>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const brands = useMemo(() => {
    const brandSet = new Set(skus.map((s) => s.brand).filter(Boolean));
    return Array.from(brandSet).sort();
  }, [skus]);

  const filteredSkus = useMemo(() => {
    let result = skus;
    
    if (brandFilter !== "All") {
      result = result.filter((s) => s.brand === brandFilter);
    }
    
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter((s) => 
        s.barcode?.toLowerCase().includes(searchLower) ||
        s.sku_name?.toLowerCase().includes(searchLower) ||
        s.brand?.toLowerCase().includes(searchLower) ||
        s.client?.toLowerCase().includes(searchLower)
      );
    }
    
    return result;
  }, [skus, brandFilter, search]);

  const toggleSelectAll = () => {
    if (selectedSkus.size === filteredSkus.length) {
      setSelectedSkus(new Set());
    } else {
      setSelectedSkus(new Set(filteredSkus.map(s => s.barcode)));
    }
  };

  const toggleSelect = (barcode: string) => {
    const newSelected = new Set(selectedSkus);
    if (newSelected.has(barcode)) {
      newSelected.delete(barcode);
    } else {
      newSelected.add(barcode);
    }
    setSelectedSkus(newSelected);
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({});
    setErrors({});
    setModalOpen(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.client?.trim()) newErrors.client = "Required";
    if (!formData.brand?.trim()) newErrors.brand = "Required";
    if (!formData.barcode?.trim()) newErrors.barcode = "Required";
    if (!formData.sku_name?.trim()) newErrors.sku_name = "Required";
    if (!formData.case_pack) newErrors.case_pack = "Required";
    if (!formData.shelf_life?.trim()) newErrors.shelf_life = "Required";
    if (!formData.talabat_sku?.trim()) newErrors.talabat_sku = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    setModalOpen(false);
  };

  const handleExport = () => {
    const dataToExport = selectedSkus.size > 0 
      ? filteredSkus.filter(s => selectedSkus.has(s.barcode))
      : filteredSkus;
    
    const exportData = dataToExport.map((sku) => ({
      Client: sku.client,
      Brand: sku.brand,
      Barcode: sku.barcode,
      "SKU Name": sku.sku_name,
      Category: sku.category || "",
      Subcategory: sku.subcategory || "",
      "Case Pack": sku.case_pack || "",
      "Shelf Life": sku.shelf_life || "",
      "Nutrition Info": sku.nutrition_info || "",
      "Ingredients Info": sku.ingredients_info || "",
      "Amazon ASIN": sku.amazon_asin || "",
      "Talabat SKU": sku.talabat_sku || "",
      "Noon ZSKU": sku.noon_zsku || "",
      "Careem Code": sku.careem_code || "",
      "Client Sell-in Price (AED)": sku.client_sellin_price || "",
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SKU List");
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `Mantaga_SKU_List_${date}.xlsx`);
  };

  const columns = [
    "Client", "Brand", "Barcode", "SKU Name", "Category", "Subcategory", 
    "Case Pack", "Shelf Life", "Nutrition Info", "Ingredients Info", 
    "Amazon ASIN", "Talabat SKU", "Noon ZSKU", "Careem Code",
    "Client Sell-in Price (AED)", "Mantaga Commission %"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search SKUs, barcodes, brands..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500"
        />
        
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200"
        >
          <option value="All">All Brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
        
        {brandFilter !== "All" && (
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
            {filteredSkus.length} of {skus.length} SKUs
          </span>
        )}
        
        <button onClick={handleExport} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium">
          {selectedSkus.size > 0 ? `Export Selected (${selectedSkus.size})` : "Export to Excel"}
        </button>
        
        <button onClick={openAddModal} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium">
          Add New SKU
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 sticky top-0">
              <tr>
                <th className="w-10 px-2">
                  <input
                    type="checkbox"
                    checked={selectedSkus.size === filteredSkus.length && filteredSkus.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded"
                  />
                </th>
                {columns.map((col) => (
                  <th key={col} className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSkus.length > 0 ? filteredSkus.map((sku) => {
                const { isRed, missing } = isRedRow(sku);
                const { isAmber, missing: amberMissing } = isAmberRow(sku);
                const isSelected = selectedSkus.has(sku.barcode);
                
                return (
                  <tr
                    key={sku._id}
                    onClick={() => toggleSelect(sku.barcode)}
                    className={`border-t border-slate-800 cursor-pointer hover:bg-slate-800/50 ${
                      isRed ? "bg-red-900/20 border-l-2 border-l-red-800" : 
                      isAmber ? "bg-amber-900/20 border-l-2 border-l-amber-800" : ""
                    } ${isSelected ? "bg-blue-900/20" : ""}`}
                  >
                    <td className="px-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(sku.barcode)}
                        className="w-4 h-4 rounded"
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{sku.client}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{sku.brand}</td>
                    <td className="px-4 py-3 text-slate-300 font-mono whitespace-nowrap">{sku.barcode}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{sku.sku_name}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{sku.category || "—"}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{sku.subcategory || "—"}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{sku.case_pack || "—"}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{sku.shelf_life || "—"}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{sku.nutrition_info || "—"}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{sku.ingredients_info || "—"}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{sku.amazon_asin || "—"}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{sku.talabat_sku || "—"}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{sku.noon_zsku || "—"}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{sku.careem_code || "—"}</td>
                    <td className="px-4 py-3 text-slate-300 font-mono whitespace-nowrap">{sku.client_sellin_price ? `AED ${sku.client_sellin_price}` : "—"}</td>
                    <td className="px-4 py-3 text-slate-300 font-mono whitespace-nowrap">{sku.mantaga_commission_pct ? `${sku.mantaga_commission_pct}%` : "—"}</td>
                  </tr>
                );
              }) : (
                <tr className="border-t border-slate-800">
                  <td colSpan={17} className="px-4 py-8 text-center text-slate-500">
                    No SKUs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-6">
              Add New SKU
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Client *</label>
                <input type="text" value={formData.client || ""} onChange={(e) => setFormData({...formData, client: e.target.value})}
                  className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-white ${errors.client ? "border-red-500" : "border-slate-700"}`} />
                {errors.client && <p className="text-red-400 text-xs mt-1">{errors.client}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Brand *</label>
                <input type="text" value={formData.brand || ""} onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-white ${errors.brand ? "border-red-500" : "border-slate-700"}`} />
                {errors.brand && <p className="text-red-400 text-xs mt-1">{errors.brand}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Barcode *</label>
                <input type="text" value={formData.barcode || ""} onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                  className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-white ${errors.barcode ? "border-red-500" : "border-slate-700"}`} />
                {errors.barcode && <p className="text-red-400 text-xs mt-1">{errors.barcode}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">SKU Name *</label>
                <input type="text" value={formData.sku_name || ""} onChange={(e) => setFormData({...formData, sku_name: e.target.value})}
                  className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-white ${errors.sku_name ? "border-red-500" : "border-slate-700"}`} />
                {errors.sku_name && <p className="text-red-400 text-xs mt-1">{errors.sku_name}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Case Pack *</label>
                <input type="number" value={formData.case_pack || ""} onChange={(e) => setFormData({...formData, case_pack: parseInt(e.target.value) || undefined})}
                  className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-white ${errors.case_pack ? "border-red-500" : "border-slate-700"}`} />
                {errors.case_pack && <p className="text-red-400 text-xs mt-1">{errors.case_pack}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Shelf Life *</label>
                <input type="text" placeholder="e.g. 12 months" value={formData.shelf_life || ""} onChange={(e) => setFormData({...formData, shelf_life: e.target.value})}
                  className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-white ${errors.shelf_life ? "border-red-500" : "border-slate-700"}`} />
                {errors.shelf_life && <p className="text-red-400 text-xs mt-1">{errors.shelf_life}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Talabat SKU *</label>
                <input type="text" value={formData.talabat_sku || ""} onChange={(e) => setFormData({...formData, talabat_sku: e.target.value})}
                  className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-white ${errors.talabat_sku ? "border-red-500" : "border-slate-700"}`} />
                {errors.talabat_sku && <p className="text-red-400 text-xs mt-1">{errors.talabat_sku}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Client Sell-in Price (AED)</label>
                <input type="number" step="0.01" value={formData.client_sellin_price || ""} onChange={(e) => setFormData({...formData, client_sellin_price: parseFloat(e.target.value) || undefined})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-800">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium">
                Save & Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
