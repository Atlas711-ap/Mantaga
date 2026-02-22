import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Use pdf-parse (works in Node.js)
    const pdfParse = require("pdf-parse");
    const pdfData = pdfParse(buffer);
    
    const text = pdfData.text;
    
    // Parse the extracted text
    const parsed = parseQuadrantLpoFromText(text);
    
    if (!parsed) {
      return NextResponse.json({ error: "Could not parse PDF" }, { status: 400 });
    }
    
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("PDF parse error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// Parse Quadrant LPO PDF text (same as client-side)
function parseQuadrantLpoFromText(text: string): {
  po_number: string;
  order_date: string;
  delivery_date: string;
  supplier: string;
  delivery_location: string;
  total_excl_vat: number;
  total_vat: number;
  total_incl_vat: number;
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
    const poMatch = text.match(/PO\s*#?\s*:?\s*([A-Z0-9\-]+)/i) || text.match(/Purchase\s*Order\s*:?\s*([A-Z0-9\-]+)/i);
    const po_number = poMatch ? poMatch[1] : `PO${Date.now()}`;
    
    // Extract Order Date
    const orderDateMatch = text.match(/Order\s*Date\s*:?\s*(\d{2})[\/\-](\d{2})[\/\-](\d{4})/i);
    let order_date = new Date().toISOString().split('T')[0];
    if (orderDateMatch) {
      order_date = `${orderDateMatch[3]}-${orderDateMatch[2]}-${orderDateMatch[1]}`;
    }
    
    // Extract Delivery Date
    const deliveryDateMatch = text.match(/Delivery\s*Date\s*:?\s*(\d{2})[\/\-](\d{2})[\/\-](\d{4})/i);
    let delivery_date = '';
    if (deliveryDateMatch) {
      delivery_date = `${deliveryDateMatch[3]}-${deliveryDateMatch[2]}-${deliveryDateMatch[1]}`;
    }
    
    // Extract Supplier
    const supplierMatch = text.match(/QUADRANT\s+INTERNATIONAL/i);
    const supplier = supplierMatch ? 'QUADRANT INTERNATIONAL (L.L.C)' : 'Unknown';
    
    // Extract Delivery Location
    const locationMatch = text.match(/(UAE_[^\s]+)/i);
    const delivery_location = locationMatch ? locationMatch[1] : 'Talabat 3PL';
    
    // Extract line items - look for patterns like: number barcode product qty cost amounts
    const lineItems: any[] = [];
    const itemRegex = /(\d+)\s+(\d{10,})\s+(.+?)\s+(\d+)\s+([\d.]+)\s+([\d.]+)\s+([\d,]+)\s+(\d+(?:\.\d+)?)\s*%\s*([\d.,]+)\s+([\d.,]+)/g;
    let match;
    
    while ((match = itemRegex.exec(text)) !== null) {
      const qty = parseInt(match[4]);
      const unitCost = parseFloat(match[5]);
      const amountExcl = parseFloat(match[7].replace(/,/g, ''));
      const vatPct = parseFloat(match[8]);
      const vatAmt = parseFloat(match[9].replace(/,/g, ''));
      const amountIncl = parseFloat(match[10].replace(/,/g, ''));
      
      if (qty > 0 && amountExcl > 0) {
        lineItems.push({
          barcode: match[2],
          product_name: match[3].trim(),
          quantity_ordered: qty,
          unit_cost: unitCost,
          amount_excl_vat: amountExcl,
          vat_pct: vatPct,
          vat_amount: vatAmt,
          amount_incl_vat: amountIncl,
        });
      }
    }
    
    // Calculate totals
    const total_excl_vat = lineItems.reduce((sum, item) => sum + item.amount_excl_vat, 0);
    const total_vat = lineItems.reduce((sum, item) => sum + item.vat_amount, 0);
    const total_incl_vat = lineItems.reduce((sum, item) => sum + item.amount_incl_vat, 0);
    
    return {
      po_number,
      order_date,
      delivery_date,
      supplier,
      delivery_location,
      total_excl_vat,
      total_vat,
      total_incl_vat,
      line_items: lineItems,
    };
  } catch (error) {
    console.error("Parse error:", error);
    return null;
  }
}
