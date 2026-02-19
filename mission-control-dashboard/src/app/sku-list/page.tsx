"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
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
  const skus = useQuery(api.queries.getMasterSku) || [];
  const addSku = useMutation(api.queries.addMasterSku);
  const updateSku = useMutation(api.queries.updateMasterSku);
  
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [selectedBarcode, setSelectedBarcode] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [formData, setFormData] = useState<Partial<SkuRecord>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [commissionAutoFilled, setCommissionAutoFilled] = useState(false);

  // Get unique brands
  const brands = useMemo(() => {
    const brandSet = new Set(skus.map((s) => s.brand).filter(Boolean));
    return Array.from(brandSet).sort();
  }, [skus]);

  // Filter SKUs
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
        s.client?.toLowerCase().includes(searchLower) ||
        s.category?.toLowerCase().includes(searchLower) ||
        s.subcategory?.toLowerCase().includes(searchLower) ||
        s.amazon_asin?.toLowerCase().includes(searchLower) ||
        s.talabat_sku?.toLowerCase().includes(searchLower) ||
        s.noon_zsku?.toLowerCase().includes(searchLower) ||
        s.careem_code?.toLowerCase().includes(searchLower)
      );
    }
    
    return result;
  }, [skus, brandFilter, search]);

  const handleRowClick = (sku: SkuRecord) => {
    if (selectedBarcode === sku.barcode) {
      setSelectedBarcode(null);
    } else {
      setSelectedBarcode(sku.barcode);
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({});
    setErrors({});
    setCommissionAutoFilled(false);
    setModalOpen(true);
  };

  const openEditModal = () => {
    const sku = skus.find((s) => s.barcode === selectedBarcode);
    if (sku) {
      setModalMode("edit");
      setFormData({ ...sku });
      setErrors({});
      setCommissionAutoFilled(false);
      setModalOpen(true);
    }
  };

  const handleClientChange = (value: string) => {
    setFormData({ ...formData, client: value });
    
    // Auto-fill commission for existing client
    if (value) {
      const existingClientSku = skus.find((s) => s.client === value && s.mantaga_commission_pct);
      if (existingClientSku?.mantaga_commission_pct) {
        setFormData({ ...formData, client: value, mantaga_commission_pct: existingClientSku.mantaga_commission_pct });
        setCommissionAutoFilled(true);
      }
    }
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
    
    // Check barcode uniqueness for add mode
    if (modalMode === "add" && formData.barcode) {
      const exists = skus.some((s) => s.barcode === formData.barcode);
      if (exists) newErrors.barcode = "This barcode already exists";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      if (modalMode === "add") {
        await addSku({
          client: formData.client!,
          brand: formData.brand!,
          barcode: formData.barcode!,
          sku_name: formData.sku_name!,
          category: formData.category || undefined,
          subcategory: formData.subcategory || undefined,
          case_pack: formData.case_pack || undefined,
          shelf_life: formData.shelf_life || undefined,
          nutrition_info: formData.nutrition_info || undefined,
          ingredients_info: formData.ingredients_info || undefined,
          amazon_asin: formData.amazon_asin || undefined,
          talabat_sku: formData.talabat_sku || undefined,
          noon_zsku: formData.noon_zsku || undefined,
          careem_code: formData.careem_code || undefined,
          client_sellin_price: formData.client_sellin_price || undefined,
          mantaga_commission_pct: formData.mantaga_commission_pct || undefined,
        });
      } else {
        await updateSku({
          barcode: formData.barcode!,
          client: formData.client!,
          brand: formData.brand!,
          sku_name: formData.sku_name!,
          category: formData.category || undefined,
          subcategory: formData.subcategory || undefined,
          case_pack: formData.case_pack || undefined,
          shelf_life: formData.shelf_life || undefined,
          nutrition_info: formData.nutrition_info || undefined,
          ingredients_info: formData.ingredients_info || undefined,
          amazon_asin: formData.amazon_asin || undefined,
          talabat_sku: formData.talabat_sku || undefined,
          noon_zsku: formData.noon_zsku || undefined,
          careem_code: formData.careem_code || undefined,
          client_sellin_price: formData.client_sellin_price || undefined,
          mantaga_commission_pct: formData.mantaga_commission_pct || undefined,
        });
      }
      
      setModalOpen(false);
      setSelectedBarcode(null);
    } catch (e) {
      console.error("Save error:", e);
    }
  };

  const handleExport = async () => {
    const exportData = filteredSkus.map((sku) => ({
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
      {/* Top Bar */}
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
        
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium"
        >
          Export to Excel
        </button>
        
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium"
        >
          Add New SKU
        </button>
        
        <button
          onClick={openEditModal}
          disabled={!selectedBarcode}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium"
        >
          Edit SKU
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 sticky top-0">
              <tr>
                <th className="w-8"></th>
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
                const isSelected = selectedBarcode === sku.barcode;
                
                return (
                  <tr
                    key={sku._id}
                    onClick={() => handleRowClick(sku)}
                    className={`border-t border-slate-800 cursor-pointer transition-colors ${
                      isRed 
                        ? "bg-red-900/20 border-l-2 border-l-red-800" 
                        : isAmber 
                          ? "bg-amber-900/20 border-l-2 border-l-amber-800"
                          : isSelected 
                            ? "bg-amber-900/20 border-l-2 border-l-amber-500"
                            : "hover:bg-slate-800/50"
                    }`}
                  >
                    <td className="px-2">
                      {isRed && (
                        <span className="text-red-400" title={`Missing: ${missing.join(", ")}`}>⚠️</span>
                      )}
                      {isAmber && !isRed && (
                        <span className="text-amber-400" title={`Packshot missing: ${amberMissing.join(", ")}`}>📷</span>
                      )}
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
                    No SKUs found — upload a SKU list in Data Upload or add manually
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-white mb-6">
              {modalMode === "add" ? "Add New SKU" : `Edit SKU — ${formData.sku_name}`}
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Client *</label>
                <input
                  type="text"
                  value={formData.client || ""}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-white ${errors.client ? "border-red-500" : "border-slate-700"}`}
                />
                {errors.client && <p className="text-red-400 text-xs mt-1">{errors.client}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Brand *</label>
                <input
                  type="text"
                  value={formData.brand || ""}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-white ${errors.brand ? "border-red-500" : "border-slate-700"}`}
                />
                {errors.brand && <p className="text-red-400 text-xs mt-1">{errors.brand}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Barcode *</label>
                <input
                  type="text"
                  value={formData.barcode || ""}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  disabled={modalMode === "edit"}
                  className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-white ${errors.barcode ? "border-red-500" : "border-slate-700"} ${modalMode === "edit" ? "opacity-50" : ""}`}
                />
                {errors.barcode && <p className="text-red-400 text-xs mt-1">{errors.barcode}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">SKU Name *</label>
                <input
                  type="text"
                  value={formData.sku_name || ""}
                  onChange={(e) => setFormData({ ...formData, sku_name: e.target.value })}
                  className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-white ${errors.sku_name ? "border-red-500" : "border-slate-700"}`}
                />
                {errors.sku_name && <p className="text-red-400 text-xs mt-1">{errors.sku_name}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category || ""}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Subcategory</label>
                <input
                  type="text"
                  value={formData.subcategory || ""}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Case Pack *</label>
                <input
                  type="number"
                  value={formData.case_pack || ""}
                  onChange={(e) => setFormData({ ...formData, case_pack: parseInt(e.target.value) || undefined })}
                  className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-white ${errors.case_pack ? "border-red-500" : "border-slate-700"}`}
                />
                {errors.case_pack && <p className="text-red-400 text-xs mt-1">{errors.case_pack}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Shelf Life *</label>
                <input
                  type="text"
                  placeholder="e.g. 12 months"
                  value={formData.shelf_life || ""}
                  onChange={(e) => setFormData({ ...formData, shelf_life: e.target.value })}
                  className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-white ${errors.shelf_life ? "border-red-500" : "border-slate-700"}`}
                />
                {errors.shelf_life && <p className="text-red-400 text-xs mt-1">{errors.shelf_life}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nutrition Info</label>
                <select
                  value={formData.nutrition_info || ""}
                  onChange={(e) => setFormData({ ...formData, nutrition_info: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="">—</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Ingredients Info</label>
                <select
                  value={formData.ingredients_info || ""}
                  onChange={(e) => setFormData({ ...formData, ingredients_info: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="">—</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Amazon ASIN</label>
                <input
                  type="text"
                  value={formData.amazon_asin || ""}
                  onChange={(e) => setFormData({ ...formData, amazon_asin: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Talabat SKU *</label>
                <input
                  type="text"
                  value={formData.talabat_sku || ""}
                  onChange={(e) => setFormData({ ...formData, talabat_sku: e.target.value })}
                  className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-sm text-white ${errors.talabat_sku ? "border-red-500" : "border-slate-700"}`}
                />
                {errors.talabat_sku && <p className="text-red-400 text-xs mt-1">{errors.talabat_sku}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Noon ZSKU</label>
                <input
                  type="text"
                  value={formData.noon_zsku || ""}
                  onChange={(e) => setFormData({ ...formData, noon_zsku: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Careem Code</label>
                <input
                  type="text"
                  value={formData.careem_code || ""}
                  onChange={(e) => setFormData({ ...formData, careem_code: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Client Sell-in Price (AED)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.client_sellin_price || ""}
                  onChange={(e) => setFormData({ ...formData, client_sellin_price: parseFloat(e.target.value) || undefined })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Mantaga Commission %</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.mantaga_commission_pct || ""}
                  onChange={(e) => setFormData({ ...formData, mantaga_commission_pct: parseFloat(e.target.value) || undefined })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                />
                {commissionAutoFilled && (
                  <p className="text-xs text-emerald-400 mt-1">Auto-filled from existing client records.</p>
                )}
                <p className="text-xs text-slate-500 mt-1">Applied at client level. If client already exists, this will auto-populate.</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-800">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium"
              >
                Save & Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
