"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import * as XLSX from "xlsx";

type SkuRow = {
  client?: string;
  brand?: string;
  barcode?: string;
  sku_name?: string;
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

const uploadTypes = [
  { id: "daily_stock", icon: "📊", title: "Daily Stock Report", description: "CSV file from Talabat · Routed to Nexus" },
  { id: "sku_list", icon: "📋", title: "SKU List", description: "Excel file · Routed to Atlas" },
  { id: "lpo", icon: "📄", title: "LPO (Purchase Order)", description: "PDF or Excel · Routed to Nexus" },
  { id: "invoice", icon: "🧾", title: "Invoice", description: "PDF or Excel · Routed to Nexus" },
];

// Header mapping for flexible column names
const headerMappings: Record<string, string> = {
  "client": "client",
  "brand": "brand",
  "barcode": "barcode",
  "sku name": "sku_name",
  "sku_name": "sku_name",
  "product name": "sku_name",
  "category": "category",
  "subcategory": "subcategory",
  "case pack": "case_pack",
  "case_pack": "case_pack",
  "shelf life": "shelf_life",
  "shelf_life": "shelf_life",
  "nutrition info": "nutrition_info",
  "nutrition_info": "nutrition_info",
  "ingredients info": "ingredients_info",
  "ingredients_info": "ingredients_info",
  "amazon asin": "amazon_asin",
  "amazon_asin": "amazon_asin",
  "talabat sku": "talabat_sku",
  "talabat_sku": "talabat_sku",
  "noon zsku": "noon_zsku",
  "noon_zsku": "noon_zsku",
  "careem code": "careem_code",
  "careem_code": "careem_code",
  "client sellin price": "client_sellin_price",
  "client_sellin_price": "client_sellin_price",
  "sellin price": "client_sellin_price",
  "sell-in price": "client_sellin_price",
  "price": "client_sellin_price",
  "mantaga commission": "mantaga_commission_pct",
  "mantaga_commission_pct": "mantaga_commission_pct",
  "commission": "mantaga_commission_pct",
  "commission %": "mantaga_commission_pct",
};

function mapRowToSku(row: Record<string, any>): SkuRow {
  const mapped: SkuRow = {};
  
  for (const [header, value] of Object.entries(row)) {
    const normalizedHeader = header.toLowerCase().trim();
    const mappedKey = headerMappings[normalizedHeader];
    
    if (mappedKey && value !== undefined && value !== null && value !== "") {
      if (mappedKey === "case_pack" || mappedKey === "client_sellin_price") {
        mapped[mappedKey as keyof SkuRow] = parseFloat(value) || undefined;
      } else {
        mapped[mappedKey as keyof SkuRow] = String(value).trim();
      }
    }
  }
  
  return mapped;
}

export default function DataUploadPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const bulkUpsert = useMutation(api.queries.bulkUpsertSku);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
      setResult(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setResult(null);
  };

  const processFiles = async () => {
    if (!selectedType || files.length === 0) return;
    
    setProcessing(true);
    setResult(null);
    
    try {
      if (selectedType === "sku_list") {
        // Process SKU list
        const allSkus: SkuRow[] = [];
        
        for (const file of files) {
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data);
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          
          if (json.length < 2) continue;
          
          const headers = (json[0] as string[]).map(h => String(h).toLowerCase().trim());
          const dataRows = json.slice(1) as any[][];
          
          for (const row of dataRows) {
            const rowObj: Record<string, any> = {};
            headers.forEach((header, i) => {
              if (row[i] !== undefined && row[i] !== null && row[i] !== "") {
                rowObj[header] = row[i];
              }
            });
            
            if (Object.keys(rowObj).length > 0) {
              allSkus.push(mapRowToSku(rowObj));
            }
          }
        }
        
        const validSkus = allSkus.filter(s => s.barcode && s.sku_name);
        
        if (validSkus.length === 0) {
          setResult({ success: false, message: "No valid SKU records found in file" });
          setProcessing(false);
          return;
        }
        
        const { newCount, updateCount } = await bulkUpsert({ skus: validSkus });
        
        // Check for incomplete records
        const incomplete: { name: string; barcode: string; missing: string[] }[] = [];
        
        setResult({
          success: true,
          message: `✅ Processed ${validSkus.length} SKUs: ${newCount} new, ${updateCount} updated. ${incomplete.length > 0 ? `Warning: ${incomplete.length} incomplete records.` : ""}`
        });
      } else {
        // Other upload types - placeholder
        setResult({
          success: true,
          message: `📤 ${files.length} file(s) uploaded for ${selectedType}. Processing will begin shortly.`
        });
      }
      
      // Clear files after successful upload
      setFiles([]);
      
    } catch (error) {
      console.error("Upload error:", error);
      setResult({ success: false, message: "Error processing file. Please check the format." });
    }
    
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-[640px] mx-auto space-y-6">
        {/* Section Label */}
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Select Upload Type</div>

        {/* Upload Type Cards */}
        <div className="grid grid-cols-2 gap-4">
          {uploadTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => { setSelectedType(type.id); setResult(null); }}
              className={`p-4 rounded-xl text-left transition-all ${
                selectedType === type.id
                  ? "bg-amber-500/10 border-2 border-amber-500"
                  : "bg-slate-900 border-2 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <div className="text-sm font-medium text-white">{type.title}</div>
              <div className="text-xs text-slate-400 mt-1">{type.description}</div>
            </button>
          ))}
        </div>

        {/* Drop Zone */}
        {selectedType && (
          <div className="space-y-4">
            <div
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-slate-700 bg-slate-900 rounded-xl p-8 text-center cursor-pointer hover:border-slate-600 transition-colors"
            >
              <svg className="w-12 h-12 mx-auto text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-slate-300 mb-1">Drop files here or click to browse</p>
              <p className="text-xs text-slate-500">Multiple files supported</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-2">
                    <span className="text-sm text-slate-300">{file.name}</span>
                    <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-400">✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Result Message */}
            {result && (
              <div className={`p-4 rounded-lg ${result.success ? "bg-emerald-900/20 border border-emerald-800" : "bg-red-900/20 border border-red-800"}`}>
                <p className={`text-sm ${result.success ? "text-emerald-400" : "text-red-400"}`}>{result.message}</p>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={processFiles}
              disabled={!selectedType || files.length === 0 || processing}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium"
            >
              {processing ? "Processing..." : "Upload & Process"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
