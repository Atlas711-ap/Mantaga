// PDF parsing utilities for LPO
// Works with Quadrant International LPO format

import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Parse PDF text and extract LPO data
export function parseQuadrantLpo(pdfText: string): {
  po_number: string;
  order_date: string;
  delivery_date: string;
  supplier: string;
  delivery_location: string;
  customer: string;
  line_items: Array<{
    barcode: string;
    product_name: string;
    quantity_ordered: number;
    unit_cost: number;
    amount_excl_vat: number;
    vat_pct: number;
    vat_amount: number;
    amount_incl_vat: number;
  }>;
} | null {
  try {
    // Extract PO Number
    const poMatch = pdfText.match(/Purchase\s*Order:\s*([A-Z0-9]+)/i);
    if (!poMatch) return null;
    const po_number = poMatch[1];

    // Extract Supplier
    const supplierMatch = pdfText.match(/Supplier\s*Information:\s*([^\n]+)/i);
    const supplier = supplierMatch ? supplierMatch[1].trim() : "QUADRANT INTERNATIONAL";

    // Extract Store/Delivery Location
    const storeMatch = pdfText.match(/Store\s*Information:\s*([^\n]+)/i);
    const delivery_location = storeMatch ? storeMatch[1].trim() : "";

    // Extract Order Date
    const orderDateMatch = pdfText.match(/Order\s*Date:\s*(\d{2}\/\d{2}\/\d{4})/i);
    let order_date = new Date().toISOString().split('T')[0];
    if (orderDateMatch) {
      const [day, month, year] = orderDateMatch[1].split('/');
      order_date = `${year}-${month}-${day}`;
    }

    // Extract Delivery Date
    const deliveryDateMatch = pdfText.match(/Delivery\s*Date:\s*(\d{2}\/\d{2}\/\d{4})/i);
    let delivery_date = "";
    if (deliveryDateMatch) {
      const [day, month, year] = deliveryDateMatch[1].split('/');
      delivery_date = `${year}-${month}-${day}`;
    }

    // Extract line items
    const lineItems: Array<{
      barcode: string;
      product_name: string;
      quantity_ordered: number;
      unit_cost: number;
      amount_excl_vat: number;
      vat_pct: number;
      vat_amount: number;
      amount_incl_vat: number;
    }> = [];

    // Split by lines and look for SKU patterns
    const lines = pdfText.split('\n');
    let inItemsSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Start of items section
      if (line.includes('No.') && line.includes('SKU') && line.includes('Barcode')) {
        inItemsSection = true;
        continue;
      }
      
      // End of items section (summary)
      if (inItemsSection && (line.includes('Total') || line.includes('Subtotal'))) {
        inItemsSection = false;
        break;
      }
      
      // Parse item line - look for patterns like: number barcode product qty cost...
      if (inItemsSection && /^\d+\s+\d+/.test(line)) {
        // Split by whitespace
        const parts = line.split(/\s+/).filter(p => p.length > 0);
        
        if (parts.length >= 8) {
          // Try to parse the line
          // Format: No SKU Barcode Product Qty UnitCost Disc Amount VAT% VAT Amt Incl
          const qty = parseFloat(parts[parts.length - 7] || '0');
          const unitCost = parseFloat(parts[parts.length - 6] || '0');
          const amountExcl = parseFloat(parts[parts.length - 4] || '0');
          const vatPct = parseFloat(parts[parts.length - 3]?.replace('%', '') || '5');
          const vatAmt = parseFloat(parts[parts.length - 2] || '0');
          const amountIncl = parseFloat(parts[parts.length - 1] || '0');
          
          // Extract barcode (usually 2nd or 3rd field after number)
          const barcodeMatch = line.match(/(\d{10,13})/);
          const barcode = barcodeMatch ? barcodeMatch[1] : '';
          
          // Product name is typically between barcode and qty
          const productMatch = line.match(/\d{10,13}\s+(.+?)\s+\d+\s+[\d.]+/);
          const product_name = productMatch ? productMatch[1].trim() : 'Unknown Product';
          
          if (qty > 0) {
            lineItems.push({
              barcode,
              product_name,
              quantity_ordered: qty,
              unit_cost: unitCost,
              amount_excl_vat: amountExcl,
              vat_pct: vatPct,
              vat_amount: vatAmt,
              amount_incl_vat: amountIncl,
            });
          }
        }
      }
    }

    return {
      po_number,
      order_date,
      delivery_date,
      supplier,
      delivery_location,
      customer: "Talabat",
      line_items: lineItems,
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return null;
  }
}

// Alternative simpler parser for specific format
export function parseQuadrantLpoSimple(pdfText: string): {
  po_number: string;
  order_date: string;
  delivery_date: string;
  supplier: string;
  delivery_location: string;
  customer: string;
  line_items: Array<any>;
  total_excl_vat: number;
  total_vat: number;
  total_incl_vat: number;
} | null {
  try {
    const lines = pdfText.split('\n').map(l => l.trim()).filter(l => l);
    
    // Find PO number
    const poLine = lines.find(l => l.toLowerCase().includes('purchase order:') || l.toLowerCase().includes('po number:'));
    const poMatch = poLine?.match(/([A-Z0-9]+-?\d+)/);
    const po_number = poMatch ? poMatch[1] : `PO${Date.now()}`;
    
    // Find dates
    const orderDateLine = lines.find(l => l.toLowerCase().includes('order date:'));
    const orderDateMatch = orderDateLine?.match(/(\d{2}\/\d{2}\/\d{4})/);
    let order_date = new Date().toISOString().split('T')[0];
    if (orderDateMatch) {
      const [d, m, y] = orderDateMatch[1].split('/');
      order_date = `${y}-${m}-${d}`;
    }
    
    const deliveryDateLine = lines.find(l => l.toLowerCase().includes('delivery date:'));
    const deliveryDateMatch = deliveryDateLine?.match(/(\d{2}\/\d{2}\/\d{4})/);
    let delivery_date = '';
    if (deliveryDateMatch) {
      const [d, m, y] = deliveryDateMatch[1].split('/');
      delivery_date = `${y}-${m}-${d}`;
    }
    
    // Find supplier and location
    const supplierLine = lines.find(l => l.includes('QUADRANT') || l.includes('Supplier'));
    const supplier = supplierLine?.replace('Supplier', '').replace('Information:', '').trim() || 'QUADRANT INTERNATIONAL';
    
    const locationLine = lines.find(l => l.includes('UAE_Talabat') || l.includes('Store'));
    const delivery_location = locationLine?.replace('Store', '').replace('Information:', '').trim() || '';
    
    // Find line items - look for numeric patterns
    const lineItems: any[] = [];
    let totalExcl = 0;
    let totalVat = 0;
    let totalIncl = 0;
    
    // Look for table-like data
    for (const line of lines) {
      // Match lines with: number, barcode (10+ digits), product, qty, cost, amounts
      const itemMatch = line.match(/^\s*(\d+)\s+(\d{10,13})\s+(.+?)\s+(\d+)\s+([\d.]+)\s+([\d.]+)\s+(\d+)\s+(\d+\.\d+)\s*%?\s*([\d.]+)\s+([\d.]+)$/);
      
      if (itemMatch) {
        const qty = parseInt(itemMatch[4]);
        const unitCost = parseFloat(itemMatch[5]);
        const amountExcl = parseFloat(itemMatch[7]);
        const vatPct = parseFloat(itemMatch[8]);
        const vatAmt = parseFloat(itemMatch[9]);
        const amountIncl = parseFloat(itemMatch[10]);
        
        lineItems.push({
          barcode: itemMatch[2],
          product_name: itemMatch[3].trim(),
          quantity_ordered: qty,
          unit_cost: unitCost,
          amount_excl_vat: amountExcl,
          vat_pct: vatPct,
          vat_amount: vatAmt,
          amount_incl_vat: amountIncl,
        });
        
        totalExcl += amountExcl;
        totalVat += vatAmt;
        totalIncl += amountIncl;
      }
    }
    
    return {
      po_number,
      order_date,
      delivery_date,
      supplier,
      delivery_location,
      customer: 'Talabat',
      line_items: lineItems,
      total_excl_vat: totalExcl,
      total_vat: totalVat,
      total_incl_vat: totalIncl,
    };
  } catch (error) {
    console.error("Parse error:", error);
    return null;
  }
}
