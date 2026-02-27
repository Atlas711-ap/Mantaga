"use client";

export const dynamic = 'force-dynamic';

import { useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { 
  useUpsertDailyStockSnapshot,
  useBulkUpsertMasterSku, 
  useInsertLpoTable, 
  useInsertLpoLineItems,
  useInsertInvoiceTable,
  useInsertInvoiceLineItems,
  useInsertBrandPerformance,
  useInsertMessage
} from "../../hooks/useConvex";

type UploadType = "daily_stock" | "sku_list" | "lpo" | "invoice";

interface UploadTypeConfig {
  id: UploadType;
  icon: string;
  title: string;
  description: string;
  agent: string;
  accepts: string[];
  mimeTypes?: string[];
}

const uploadTypes: UploadTypeConfig[] = [
  { id: "daily_stock", icon: "📊", title: "Daily Stock Report", description: "CSV file from Talabat · Processed by Nexus", agent: "Nexus", accepts: [".csv"] },
  { id: "sku_list", icon: "📋", title: "SKU List", description: "Excel file · Processed by Atlas", agent: "Atlas", accepts: [".xlsx", ".xls"] },
  { id: "lpo", icon: "📄", title: "LPO (Purchase Order)", description: "PDF or Excel · Processed by Atlas (AI)", agent: "Atlas", accepts: [".xlsx", ".xls", ".csv", ".pdf"], mimeTypes: ["application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "text/csv"] },
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // Date picker for daily stock report
  const [stockReportDate, setStockReportDate] = useState<Date>(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Convex mutations
  const upsertStockSnapshot = useUpsertDailyStockSnapshot();
  const bulkUpsertSku = useBulkUpsertMasterSku();
  const insertLpo = useInsertLpoTable();
  const insertLpoLineItem = useInsertLpoLineItems();
  const insertInvoice = useInsertInvoiceTable();
  const insertInvoiceLineItem = useInsertInvoiceLineItems();
  const insertBrandPerf = useInsertBrandPerformance();
  const insertChatMessage = useInsertMessage();

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

  const addChatMessage = async (sender: string, content: string) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender,
      content,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, newMsg]);
    
    // Also save to Convex
    try {
      await insertChatMessage({
        sender,
        sender_type: sender === "Nexus" || sender === "Atlas" || sender === "Athena" || sender === "Forge" ? "agent" : "user",
        content,
        timestamp: new Date().toISOString(),
        is_system_message: false,
      });
    } catch (error) {
      console.error("Failed to save chat message:", error);
    }
  };

  // Convert PDF to images (base64) - client-side using CDN
  const convertPdfToImages = async (file: File, maxPages: number = 2): Promise<string[]> => {
    // Load pdf.js from CDN
    if (!(window as any).pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      document.head.appendChild(script);
      await new Promise(resolve => script.onload = resolve);
      
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
    
    const pdfjs = (window as any).pdfjsLib;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const images: string[] = [];
    
    const numPages = Math.min(pdf.numPages, 1); // Only first page for accuracy
    
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.5 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({ canvasContext: context!, viewport }).promise;
      const imageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
      images.push(imageBase64);
    }
    
    return images;
  };

  // Process Daily Stock CSV
  const processDailyStock = async (file: File, reportDate: string): Promise<{ success: boolean; message: string; recordsProcessed: number }> => {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const data = results.data as any[];
            let inserted = 0;
            let updated = 0;
            let skipped = 0;

            // Process all rows - be more flexible with column names
            const allRows = data.filter((row: any) => {
              // Check if row has any identifying data
              const barcode = row.barcodes || row.barcode || row.Barcode || row.sku_barcode || row.product_barcode || row["SKU Barcode"] || "";
              return barcode && barcode.length > 0;
            });

            // For now, process all rows without filtering
            const validWarehouses = allRows;

            for (const row of validWarehouses) {
              // Flexible column name matching
              const barcode = row.barcodes || row.barcode || row.Barcode || row.sku_barcode || row.product_barcode || row["SKU Barcode"] || "";
              const warehouseName = row.warehouse_name || row.Warehouse || row.warehouse || row.WarehouseName || row.location || "";
              const productName = row.product_name || row.Product || row.sku_name || row.name || row["Product Name"] || "Unknown";
              const stockOnHand = parseInt(row.stock_on_hand || row.Stock || row.stock || row.qty || row.Quantity || row["Stock on Hand"] || "0");
              const putawayReserved = parseInt(row.putaway_reserved || row.reserved || row.Reserved || row["Reserved Qty"] || "0");
              const effectiveStock = stockOnHand - putawayReserved;
              const warehouseType = warehouseName.toLowerCase().includes("3pl") ? "3PL" : "Darkstore";

              if (barcode && warehouseName) {
                try {
                  const result = await upsertStockSnapshot({
                    report_date: reportDate,
                    sku_id: "",
                    barcode,
                    product_name: row.product_name || row.sku_name || row.name || "Unknown",
                    warehouse_name: warehouseName,
                    warehouse_type: warehouseType,
                    stock_on_hand: stockOnHand,
                    putaway_reserved_qty: putawayReserved,
                    effective_stock: effectiveStock,
                  });
                  if (result?.action === "inserted") {
                    inserted++;
                  } else {
                    updated++;
                  }
                } catch (e: any) {
                  // Skip errors but count them
                  skipped++;
                }
              }
            }

            // Calculate metrics
            const threePlStock = validWarehouses
              .filter((r: any) => (r.warehouse_name || r.warehouse || "").toLowerCase().includes("3pl"))
              .reduce((sum: number, r: any) => {
                const stock = parseInt(r.stock_on_hand || r.stock || "0");
                const reserved = parseInt(r.putaway_reserved || r.reserved || "0");
                return sum + (stock - reserved);
              }, 0);

            const darkstores = validWarehouses.filter((r: any) => 
              !(r.warehouse_name || r.warehouse || "").toLowerCase().includes("3pl")
            );
            
            const darkstoresWithStock = darkstores.filter((r: any) => {
              const stock = parseInt(r.stock_on_hand || r.stock || "0");
              const reserved = parseInt(r.putaway_reserved || r.reserved || "0");
              return (stock - reserved) > 0;
            }).length;

            const darkstoresOOS = darkstores.filter((r: any) => {
              const stock = parseInt(r.stock_on_hand || r.stock || "0");
              const reserved = parseInt(r.putaway_reserved || r.reserved || "0");
              return (stock - reserved) <= 0;
            }).length;

            const uniqueSkus = new Set(validWarehouses.map((r: any) => r.barcode || r.sku_barcode || r.product_barcode)).size;

            const lowStockCount = validWarehouses.filter((r: any) => {
              const stock = parseInt(r.stock_on_hand || r.stock || "0");
              const reserved = parseInt(r.putaway_reserved || r.reserved || "0");
              const effective = stock - reserved;
              return effective > 0 && effective <= 3;
            }).length;

            resolve({
              success: true,
              message: `📊 STOCK REPORT PROCESSED — ${new Date(reportDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}

────────────────────────────────────────
📦 3PL Buffer Stock: ${threePlStock.toLocaleString()} units
🏪 Darkstores with Stock: ${darkstoresWithStock}
🏪 Darkstores OOS: ${darkstoresOOS}
📋 Unique SKUs: ${uniqueSkus}

🔴 Out of stock: ${darkstoresOOS} locations
🟡 Low stock (≤3 units): ${lowStockCount} locations
🟢 New records: ${inserted} | Updated: ${updated}
⚠️ Errors: ${skipped}`,
              recordsProcessed: inserted + updated,
            });
          } catch (error) {
            resolve({
              success: false,
              message: `Error processing stock report: ${error}`,
              recordsProcessed: 0,
            });
          }
        },
        error: (error) => {
          resolve({
            success: false,
            message: `Error parsing CSV: ${error.message}`,
            recordsProcessed: 0,
          });
        }
      });
    });
  };

  // Process SKU List Excel
  const processSkuList = async (file: File): Promise<{ success: boolean; message: string; recordsProcessed: number }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

          const skus = jsonData.map(row => ({
            client: String(row.Client || row.client || "Quadrant International"),
            brand: String(row.Brand || row.brand || "Mudhish"),
            barcode: String(row.Barcode || row.barcode || "").trim(),
            sku_name: String(row["SKU Name"] || row.sku_name || row.name || ""),
            category: row.Category || row.category ? String(row.Category || row.category) : undefined,
            subcategory: row.Subcategory || row.subcategory ? String(row.Subcategory || row.subcategory) : undefined,
            case_pack: row["Case Pack"] || row.case_pack ? parseInt(String(row["Case Pack"] || row.case_pack || "0")) : undefined,
            shelf_life: row["Shelf life"] || row["Shelf Life"] || row.shelf_life ? String(row["Shelf life"] || row["Shelf Life"] || row.shelf_life) : undefined,
            nutrition_info: row["Nutrition Info"] || row.nutrition_info ? String(row["Nutrition Info"] || row.nutrition_info) : undefined,
            ingredients_info: row["Ingredients Info"] || row.ingredients_info ? String(row["Ingredients Info"] || row.ingredients_info) : undefined,
            amazon_asin: row["Amazon ASIN"] || row.amazon_asin ? String(row["Amazon ASIN"] || row.amazon_asin) : undefined,
            talabat_sku: row["Talabat SKU"] || row.talabat_sku ? String(row["Talabat SKU"] || row.talabat_sku) : undefined,
            noon_zsku: row["Noon ZSKU"] || row.noon_zsku ? String(row["Noon ZSKU"] || row.noon_zsku) : undefined,
            careem_code: row["Careem Code"] || row.careem_code ? String(row["Careem Code"] || row.careem_code) : undefined,
            // PTT = Price to Trade (platform-specific sell prices)
            amazon_ptt: row["Amazon PTT"] || row.amazon_ptt ? parseFloat(String(row["Amazon PTT"] || row.amazon_ptt || "0")) : undefined,
            talabat_ptt: row["Talabat PTT"] || row.talabat_ptt ? parseFloat(String(row["Talabat PTT"] || row.talabat_ptt || "0")) : undefined,
            noon_ptt: row["Noon PTT"] || row.noon_ptt ? parseFloat(String(row["Noon PTT"] || row.noon_ptt || "0")) : undefined,
            careem_ptt: row["Careem PTT"] || row.careem_ptt ? parseFloat(String(row["Careem PTT"] || row.careem_ptt || "0")) : undefined,
            // Commission - Excel stores percentages as decimals (10% = 0.1), so multiply by 100
            mantaga_commission_pct: row["Commission %"] || row["Mantaga Commission %"] || row.mantaga_commission_pct ? 
              (parseFloat(String(row["Commission %"] || row["Mantaga Commission %"] || row.mantaga_commission_pct || "0")) * 100) : undefined,
          })).filter(sku => sku.barcode && sku.sku_name);

          if (skus.length > 0) {
            await bulkUpsertSku({ skus });
          }

          resolve({
            success: true,
            message: `📋 SKU LIST PROCESSED — ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}

────────────────────────────────────────
✅ SKUs synced: ${skus.length}
Total SKUs in database: Now available in SKU List tab

Use the SKU List tab to view and manage all products.`,
            recordsProcessed: skus.length,
          });
        } catch (error) {
          resolve({
            success: false,
            message: `Error processing SKU list: ${error}`,
            recordsProcessed: 0,
          });
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Process LPO - handles PDF (via qwen3.5:35b) and Excel
  const processLpo = async (file: File): Promise<{ success: boolean; message: string; poNumber: string }> => {
    
    // Handle PDF files - send to Atlas (qwen3.5:35b)
    if (file.name.toLowerCase().endsWith('.pdf')) {
      try {
        setResult({ success: true, message: "Converting PDF to images..." });
        
        // Convert PDF to images client-side
        const images = await convertPdfToImages(file, 2);
        
        if (images.length === 0) {
          throw new Error('Could not convert PDF to images');
        }
        
        setResult({ success: true, message: "Atlas is reading the PDF..." });
        
        // Send images to API
        const response = await fetch('/api/atlas-parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            images: images,
            type: 'lpo'
          }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Atlas failed to parse PDF');
        }
        
        const parsed = await response.json();
        
        if (!parsed || !parsed.po_number) {
          throw new Error(parsed?.error || 'Could not extract LPO data from PDF');
        }
        
        // Insert LPO header
        await insertLpo({
          po_number: parsed.po_number,
          order_date: parsed.order_date || new Date().toISOString().split('T')[0],
          delivery_date: parsed.delivery_date || '',
          supplier: parsed.supplier || 'Unknown',
          delivery_location: parsed.delivery_location || 'Talabat 3PL',
          customer: "Talabat",
          total_excl_vat: parsed.total_excl_vat || 0,
          total_vat: parsed.total_vat || 0,
          total_incl_vat: parsed.total_incl_vat || 0,
          status: "pending",
        });
        
        // Insert line items
        let lineItemsCount = 0;
        for (const item of parsed.line_items || []) {
          await insertLpoLineItem({
            po_number: parsed.po_number,
            barcode: item.barcode || '',
            product_name: item.product_name || 'Unknown',
            quantity_ordered: item.quantity_ordered || 0,
            unit_cost: item.unit_cost || 0,
            amount_excl_vat: item.amount_excl_vat || 0,
            vat_pct: item.vat_pct || 5,
            vat_amount: item.vat_amount || 0,
            amount_incl_vat: item.amount_incl_vat || 0,
          });
          lineItemsCount++;
        }
        
        return {
          success: true,
          message: `📄 LPO RECEIVED — ${parsed.po_number}

────────────────────────────────────────
Parsed by: Atlas (AI)
Order Date: ${parsed.order_date}
Delivery Date: ${parsed.delivery_date}
Supplier: ${parsed.supplier}
Delivery to: ${parsed.delivery_location}

Line items: ${lineItemsCount}
Total (excl. VAT): AED ${(parsed.total_excl_vat || 0).toLocaleString()}
Total (incl. VAT): AED ${(parsed.total_incl_vat || 0).toLocaleString()}

Status: ⏳ Awaiting invoice match`,
          poNumber: parsed.po_number,
        };
        
      } catch (error: any) {
        return {
          success: false,
          message: `Atlas failed to parse PDF: ${error.message}. Try converting to Excel or enter manually.`,
          poNumber: "",
        };
      }
    }
    
    // Handle Excel/CSV files with new format (multiple LPOs supported)
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

          // Check for new format headers
          const hasNewFormat = jsonData.length > 0 && (
            jsonData[0].po_number !== undefined || 
            jsonData[0]["po_number"] !== undefined
          );

          if (!hasNewFormat) {
            resolve({
              success: false,
              message: "Excel file doesn't have the expected format. Required columns: po_number, product_name, barcode, etc.",
              poNumber: "",
            });
            return;
          }

          // Helper to clean barcode
          const cleanBarcode = (barcode: string): string => {
            if (!barcode) return "";
            // Remove brackets and quotes
            let cleaned = String(barcode).replace(/[\[\]']/g, "");
            // Remove leading zero if present
            if (cleaned.startsWith("0")) {
              cleaned = cleaned.replace(/^0+/, "");
            }
            return cleaned || "";
          };

          // Helper to parse date
          const parseDate = (dateValue: any): string => {
            if (!dateValue) return "";
            try {
              // Handle string dates
              if (typeof dateValue === "string") {
                // If it looks like "2025 12:36-12-30" (weird format), extract the date part
                const datePart = dateValue.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
                if (datePart) {
                  return `${datePart[1]}-${datePart[2]}-${datePart[3]}`;
                }
                // Handle DD/MM/YYYY format
                const parts = dateValue.split("/");
                if (parts.length === 3) {
                  return `${parts[2]}-${parts[1]}-${parts[0]}`;
                }
                // Try parsing as normal date
                const parsed = new Date(dateValue);
                if (!isNaN(parsed.getTime())) {
                  return parsed.toISOString().split("T")[0];
                }
                return dateValue;
              }
              // Handle Excel date serial (number)
              if (typeof dateValue === "number") {
                const date = new Date((dateValue - 25569) * 86400 * 1000);
                return date.toISOString().split("T")[0];
              }
              return String(dateValue);
            } catch {
              return String(dateValue);
            }
          };

          // Group rows by PO number, then deduplicate by barcode
          const poGroups: Record<string, any[]> = {};
          for (const row of jsonData) {
            const poNumber = row.po_number || row["po_number"];
            if (poNumber) {
              if (!poGroups[poNumber]) poGroups[poNumber] = [];
              poGroups[poNumber].push(row);
            }
          }

          let totalLposProcessed = 0;
          let totalLineItemsProcessed = 0;

          // Process each PO
          for (const [poNumber, poRows] of Object.entries(poGroups)) {
            // Deduplicate by barcode - keep first occurrence only
            const seenBarcodes = new Set();
            const uniqueRows: any[] = [];
            
            for (const row of poRows) {
              const rawBarcode = row.barcode || row["barcode"] || "";
              const barcode = cleanBarcode(rawBarcode);
              
              if (!seenBarcodes.has(barcode)) {
                seenBarcodes.add(barcode);
                uniqueRows.push(row);
              }
            }

            const headerRow = uniqueRows[0];
            
            // Parse dates
            const orderDate = parseDate(headerRow.po_creation_date || headerRow["po_creation_date"]);
            const deliveryDate = parseDate(headerRow.po_receiving_date || headerRow["po_receiving_date"]);
            
            // Get supplier from first row (supplier_name column)
            const supplier = headerRow.supplier_name || headerRow["supplier_name"] || "Unknown";
            const customer = headerRow.channel_name || "Talabat";
            const status = headerRow.po_status || "pending";
            const deliveryLocation = "Talabat 3PL"; // Default
            
            // Calculate totals for this PO (from qty x unit_cost)
            let totalExclVat = 0;
            let totalVat = 0;
            let totalInclVat = 0;
            
            for (const row of uniqueRows) {
              const qty = parseInt(row.qty || row["qty"] || "0");
              const unitCost = parseFloat(row.unit_cost || row["unit_cost"] || "0");
              const lineExclVat = qty * unitCost;
              const lineVat = lineExclVat * 0.05;
              const lineInclVat = lineExclVat + lineVat;
              totalExclVat += lineExclVat;
              totalVat += lineVat;
              totalInclVat += lineInclVat;
            }

            // Insert LPO header
            await insertLpo({
              po_number: poNumber,
              order_date: orderDate,
              delivery_date: deliveryDate,
              supplier,
              delivery_location: deliveryLocation,
              customer,
              total_excl_vat: totalExclVat,
              total_vat: totalVat,
              total_incl_vat: totalInclVat,
              status,
            });

            // Process line items (only unique barcodes)
            for (const row of uniqueRows) {
              const rawBarcode = row.barcode || row["barcode"] || "";
              const barcode = cleanBarcode(rawBarcode);
              const productName = row.product_name || row["product_name"] || "Unknown";
              const quantity = parseInt(row.qty || row["qty"] || "0");
              const unitCost = parseFloat(row.unit_cost || row["unit_cost"] || "0");
              const vatPct = 5;

              if (barcode && productName && quantity > 0) {
                // Calculate ordered amount (qty x unit cost x 1.05 for VAT)
                const orderedAmtExclVat = quantity * unitCost;
                const orderedAmtVat = orderedAmtExclVat * 0.05;
                const orderedAmtInclVat = orderedAmtExclVat + orderedAmtVat;
                
                await insertLpoLineItem({
                  po_number: poNumber,
                  barcode: barcode,
                  product_name: productName,
                  quantity_ordered: quantity,
                  quantity_delivered: 0, // Will be entered manually later
                  unit_cost: unitCost,
                  amount_excl_vat: orderedAmtExclVat,
                  vat_pct: vatPct,
                  vat_amount: orderedAmtVat,
                  amount_incl_vat: orderedAmtInclVat,
                });
                totalLineItemsProcessed++;
              }
            }
            totalLposProcessed++;
          }

          resolve({
            success: true,
            message: `📄 LPOs PROCESSED — ${totalLposProcessed} PO(s)

────────────────────────────────────────
✅ Line items: ${totalLineItemsProcessed}
Total LPOs: ${totalLposProcessed}

Data saved to database.

View in LPO tab.`,
            poNumber: "Multiple",
          });
          return;
        } catch (error) {
          resolve({
            success: false,
            message: `Error processing LPO: ${error}`,
            poNumber: "",
          });
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // Process Invoice Excel
  const processInvoice = async (file: File): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

          const headerRow = jsonData.find((row: any) => 
            row["Invoice Number"] || row["Invoice No"] || row.invoice_number
          );

          if (!headerRow) {
            resolve({
              success: false,
              message: "Could not find Invoice information in the file.",
            });
            return;
          }

          const invoiceNumber = headerRow["Invoice Number"] || headerRow["Invoice No"] || headerRow.invoice_number || `INV${Date.now()}`;
          const invoiceDate = headerRow["Invoice Date"] || headerRow.InvoiceDate || headerRow.invoice_date || new Date().toISOString().split('T')[0];
          const poNumber = headerRow["PO Number"] || headerRow["PO No"] || headerRow.po_number || "";
          const customer = headerRow.Customer || headerRow.customer || "Quadrant International";
          const subtotal = parseFloat(headerRow.Subtotal || headerRow.subtotal || "0");
          const vatAmount = parseFloat(headerRow["VAT Amount"] || headerRow.vat_amount || "0");
          const grandTotal = parseFloat(headerRow["Grand Total"] || headerRow["Total (incl. VAT)"] || headerRow.grand_total || (subtotal + vatAmount));

          // Insert Invoice header
          await insertInvoice({
            invoice_number: invoiceNumber,
            invoice_date: invoiceDate,
            po_number: poNumber,
            customer,
            subtotal,
            vat_amount: vatAmount,
            grand_total: grandTotal,
          });

          // Process line items
          let lineItemsCount = 0;
          let totalInvoicedExclVat = 0;
          
          for (const row of jsonData) {
            const barcode = row.Barcode || row.barcode || row["SKU Barcode"];
            const productName = row["Product Name"] || row.Product || row.sku_name || row.name;
            const quantity = parseInt(row.Quantity || row.qty || row["Qty Invoiced"] || "0");
            const unitRate = parseFloat(row["Unit Rate"] || row["Unit Price"] || row.unit_rate || "0");
            const taxableAmount = parseFloat(row["Taxable Amount"] || row.taxable_amount || (quantity * unitRate));
            const lineVatAmount = parseFloat(row["VAT Amount"] || row.vat_amount || "0");
            const expiryDate = row["Expiry Date"] || row.expiry_date || undefined;

            if (barcode && productName && quantity > 0) {
              await insertInvoiceLineItem({
                invoice_number: invoiceNumber,
                po_number: poNumber,
                barcode,
                product_name: productName,
                expiry_date: expiryDate,
                unit_rate: unitRate,
                quantity_invoiced: quantity,
                taxable_amount: taxableAmount,
                vat_amount: lineVatAmount,
              });
              lineItemsCount++;
              totalInvoicedExclVat += taxableAmount;
            }
          }

          // Get LPO value for comparison
          let lpoValueExclVat = subtotal; // fallback
          let serviceLevelPct = 100;
          let gapValue = 0;
          let matchStatus = "MATCHED";

          if (poNumber) {
            gapValue = lpoValueExclVat - totalInvoicedExclVat;
            if (Math.abs(gapValue) < 0.01) {
              serviceLevelPct = 100;
              matchStatus = "MATCHED";
            } else if (gapValue > 0) {
              serviceLevelPct = Math.max(0, (totalInvoicedExclVat / lpoValueExclVat) * 100);
              matchStatus = "DISCREPANCY";
            } else {
              serviceLevelPct = 100;
              matchStatus = "MATCHED";
            }
          }

          const commissionAed = totalInvoicedExclVat * 0.05; // 5% commission

          // Insert brand performance record
          const now = new Date();
          await insertBrandPerf({
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            po_number: poNumber,
            po_date: invoiceDate,
            customer: "Talabat",
            brand: undefined,
            client: undefined,
            invoice_number: invoiceNumber,
            invoice_date: invoiceDate,
            barcode: "N/A",
            product_name: "Multiple Items",
            quantity_ordered: 0,
            quantity_delivered: 0,
            unit_cost: 0,
            lpo_value_excl_vat: lpoValueExclVat,
            lpo_value_incl_vat: lpoValueExclVat * 1.05,
            invoiced_value_excl_vat: totalInvoicedExclVat,
            invoiced_value_incl_vat: totalInvoicedExclVat * 1.05,
            vat_amount_invoiced: totalInvoicedExclVat * 0.05,
            total_incl_vat_invoiced: totalInvoicedExclVat * 1.05,
            gap_value: gapValue,
            service_level_pct: serviceLevelPct,
            commission_pct: 5,
            commission_aed: commissionAed,
            match_status: matchStatus,
          });

          resolve({
            success: true,
            message: `🧾 INVOICE PROCESSED — ${invoiceNumber}

────────────────────────────────────────
Invoice Date: ${invoiceDate}
PO Number: ${poNumber || "N/A"}
Customer: ${customer}

Line items: ${lineItemsCount}
Invoiced Value (excl. VAT): AED ${totalInvoicedExclVat.toLocaleString()}
VAT: AED ${vatAmount.toLocaleString()}
Total: AED ${grandTotal.toLocaleString()}

Service Level: ${serviceLevelPct.toFixed(1)}%
Commission Earned: AED ${commissionAed.toFixed(2)}
Match Status: ${matchStatus}

Data available in Brand Performance tab.`,
          });
        } catch (error) {
          resolve({
            success: false,
            message: `Error processing invoice: ${error}`,
          });
        }
      };
      reader.readAsArrayBuffer(file);
    });
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
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const uploadedFiles = fileInput?.files;
      
      if (!uploadedFiles || uploadedFiles.length === 0) {
        setResult({ success: false, message: "No file selected" });
        setProcessing(false);
        return;
      }

      let processedResult: { success: boolean; message: string; recordsProcessed?: number };

      if (selectedType === "daily_stock") {
        // Process ALL CSV files and aggregate results
        const dateStr = stockReportDate.toISOString().split('T')[0];
        
        let totalInserted = 0;
        let totalUpdated = 0;
        let totalSkipped = 0;
        
        for (let i = 0; i < uploadedFiles.length; i++) {
          const result = await processDailyStock(uploadedFiles[i], dateStr) as any;
          totalInserted += result.inserted || 0;
          totalUpdated += result.updated || 0;
          totalSkipped += result.skipped || 0;
        }
        
        processedResult = {
          success: true,
          message: `📊 STOCK REPORT PROCESSED — ${new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}

────────────────────────────────────────
📁 Files Processed: ${uploadedFiles.length}
🟢 New records: ${totalInserted}
🔄 Records updated: ${totalUpdated}
⚠️ Errors: ${totalSkipped}

All ${uploadedFiles.length} files have been merged into the database.`,
          recordsProcessed: totalInserted + totalUpdated,
        };
        
      } else if (selectedType === "sku_list") {
        processedResult = await processSkuList(uploadedFiles[0]);
      } else if (selectedType === "lpo") {
        processedResult = await processLpo(uploadedFiles[0]);
      } else if (selectedType === "invoice") {
        processedResult = await processInvoice(uploadedFiles[0]);
      } else {
        processedResult = { success: false, message: "Unknown upload type" };
      }

      if (processedResult.success) {
        addChatMessage(config.agent, processedResult.message);
      }
      setResult(processedResult);
      
      // Clear files after successful processing
      if (processedResult.success) {
        setFiles([]);
      }
      
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
              accept={(uploadTypes.find(t => t.id === selectedType)?.accepts.join(",") + "," + (uploadTypes.find(t => t.id === selectedType) as any)?.mimeTypes?.join(",") || "")}
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Date Picker for Daily Stock */}
          {selectedType === "daily_stock" && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <label className="block text-xs font-medium text-slate-400 mb-2">
                📊 Report Date (for all rows in this CSV)
              </label>
              <div className="relative">
                <DatePicker
                  selected={stockReportDate}
                  onChange={(date: Date | null) => date && setStockReportDate(date)}
                  open={datePickerOpen}
                  onInputClick={() => setDatePickerOpen(true)}
                  onClickOutside={() => setDatePickerOpen(false)}
                  dateFormat="EEEE, dd MMMM yyyy"
                  inline
                  maxDate={new Date()}
                />
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Selected: <span className="text-white font-medium">{stockReportDate.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                This date will be used as the report_date for every row written to the database.
              </p>
            </div>
          )}

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

      {/* Preview: Chat Messages */}
      {chatMessages.length > 0 && (
        <div className="mt-8 p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-4">Chatroom Messages (Saved to Database)</div>
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
