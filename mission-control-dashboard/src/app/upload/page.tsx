"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";

type UploadType = "daily_stock" | "sku_list" | "lpo" | "invoice";

interface UploadTypeConfig {
  id: UploadType;
  icon: string;
  title: string;
  description: string;
  agent: string;
  accepts: string[];
}

const uploadTypes: UploadTypeConfig[] = [
  { id: "daily_stock", icon: "📊", title: "Daily Stock Report", description: "CSV file from Talabat · Processed by Nexus", agent: "Nexus", accepts: [".csv"] },
  { id: "sku_list", icon: "📋", title: "SKU List", description: "Excel file · Processed by Atlas", agent: "Atlas", accepts: [".xlsx", ".xls"] },
  { id: "lpo", icon: "📄", title: "LPO (Purchase Order)", description: "PDF or Excel · Processed by Nexus", agent: "Nexus", accepts: [".xlsx", ".xls", ".pdf"] },
  { id: "invoice", icon: "🧾", title: "Invoice", description: "PDF or Excel · Processed by Nexus", agent: "Nexus", accepts: [".xlsx", ".xls", ".pdf"] },
];

interface FileInfo {
  name: string;
  size: number;
  type: string;
  data?: any;
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

export default function DataUploadPage() {
  const [selectedType, setSelectedType] = useState<UploadType | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [confirmDuplicate, setConfirmDuplicate] = useState<{ show: boolean; date: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => ({
        name: f.name,
        size: f.size,
        type: f.name.split('.').pop() || '',
      }));
      setFiles([...files, ...newFiles]);
      setResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).map(f => ({
        name: f.name,
        size: f.size,
        type: f.name.split('.').pop() || '',
      }));
      setFiles([...files, ...newFiles]);
      setResult(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setResult(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const addChatMessage = (sender: string, content: string) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender,
      content,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const processFiles = async () => {
    if (!selectedType || files.length === 0) return;
    
    setProcessing(true);
    setResult(null);
    
    const config = uploadTypes.find(t => t.id === selectedType);
    if (!config) {
      setResult({ success: false, message: "Invalid upload type" });
      setProcessing(false);
      return;
    }

    try {
      // Simulate processing based on type
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (selectedType === "daily_stock") {
        // Mock Daily Stock Report processing
        const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
        const mockResult = {
          success: true,
          message: `📊 STOCK REPORT PROCESSED — ${dateStr}

────────────────────────────────────────
SKUs tracked: 9
Darkstores covered: 49
3PL buffer entries: 1
🔴 Out of stock: 2 locations
🟡 Low stock (≤3 units): 5 locations
🟠 Reserved stock flags: 3 locations
🟢 Replenishments detected: 8 locations

OOS locations:
- Mudhish Classic Chips — Jumeirah Village Circle
- Mudhish Spicy Chips — Dubai Marina

⚠️ Anomalies: 2 darkstores showing unusual velocity`
        };
        addChatMessage("Nexus", mockResult.message);
        setResult(mockResult);
      } else if (selectedType === "sku_list") {
        const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
        const mockResult = {
          success: true,
          message: `📋 SKU LIST PROCESSED — ${dateStr}

────────────────────────────────────────
✅ New SKUs added: 3
🔄 Existing SKUs updated: 0
⚠️ Incomplete records: 2

Missing data:
- SKU-002 (barcode: SKU-002) — missing: Category, Subcategory
- SKU-003 (barcode: SKU-003) — missing: Category, Subcategory, Nutrition Info

Action required: Please fill in missing fields manually in the SKU List tab.`
        };
        addChatMessage("Atlas", mockResult.message);
        setResult(mockResult);
      } else if (selectedType === "lpo") {
        const mockResult = {
          success: true,
          message: `📄 LPO RECEIVED — PO3851128

────────────────────────────────────────
Order Date: 15 Feb 2026
Delivery Date: 18 Feb 2026
Supplier: Al Farooj Fresh
Delivery to: UAE_Talabat_3pl_GSL_DIP

SKUs ordered:
- Mudhish Classic Chips — Qty: 500 — AED 8.50/unit
- Mudhish Spicy Chips — Qty: 500 — AED 8.50/unit

Total (excl. VAT): AED 8,500.00
VAT (5%): AED 425.00
Total (incl. VAT): AED 8,925.00

Status: ⏳ Awaiting invoice match`
        };
        addChatMessage("Nexus", mockResult.message);
        setResult(mockResult);
      } else if (selectedType === "invoice") {
        const mockResult = {
          success: true,
          message: `🧾 INVOICE MATCHED ✅ — Invoice 62693 × LPO PO3851128

────────────────────────────────────────
Invoice Date: 18 Feb 2026 | PO Date: 15 Feb 2026
LPO Value (excl. VAT): AED 8,500.00
Invoiced Value (excl. VAT): AED 8,275.00
Gap: AED -225.00 ⚠️
Service Level: 97.4% ⚠️
Commission Earned: AED 248.25

Discrepancies by SKU:
- Mudhish Spicy Chips — Ordered: 500 | Invoiced: 450 | Gap: -50 units

Action required: Review short delivery with Quadrant International.`
        };
        addChatMessage("Nexus", mockResult.message);
        setResult(mockResult);
      }
      
      // Clear files after successful processing
      setFiles([]);
      
    } catch (error) {
      console.error("Processing error:", error);
      setResult({ success: false, message: "An error occurred during processing. Please try again." });
    }
    
    setProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Section Label */}
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Select Upload Type</div>

      {/* Upload Type Cards */}
      <div className="grid grid-cols-2 gap-4">
        {uploadTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => { setSelectedType(type.id); setResult(null); setFiles([]); }}
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
              accept={uploadTypes.find(t => t.id === selectedType)?.accepts.join(",")}
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
                  <div>
                    <span className="text-sm text-slate-300">{file.name}</span>
                    <span className="text-xs text-slate-500 ml-2">({formatFileSize(file.size)})</span>
                  </div>
                  <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-400">✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Result Message */}
          {result && (
            <div className={`p-4 rounded-lg ${result.success ? "bg-emerald-900/20 border border-emerald-800" : "bg-red-900/20 border border-red-800"}`}>
              {result.success ? (
                <pre className="text-sm text-emerald-400 whitespace-pre-wrap font-mono">{result.message}</pre>
              ) : (
                <p className="text-sm text-red-400">{result.message}</p>
              )}
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={processFiles}
            disabled={!selectedType || files.length === 0 || processing}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg font-medium"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : (
              "Upload & Process"
            )}
          </button>
        </div>
      )}

      {/* Preview: Chat Messages that would be posted */}
      {chatMessages.length > 0 && (
        <div className="mt-8 p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Chatroom Preview (Messages that would be posted)</div>
          <div className="space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <span className="font-medium text-amber-400">{msg.sender}</span>
                <span className="text-slate-500 ml-2">{msg.timestamp}</span>
                <pre className="text-xs text-slate-400 mt-1 whitespace-pre-wrap font-mono">{msg.content}</pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
