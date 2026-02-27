import { NextRequest, NextResponse } from "next/server";

// Ollama server config
const OLLAMA_BASE_URL = "http://100.126.131.51:11434/v1";
const OLLAMA_MODEL = "qwen3.5:35b";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images, type, filename } = body;

    if (!images || images.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: "No type provided" }, { status: 400 });
    }

    // Parse with qwen3.5:35b
    const parsedData = await parseWithQwen(images, type);

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Atlas parse error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

async function parseWithQwen(images: string[], type: string): Promise<any> {
  // Build the prompt based on document type
  let systemPrompt = "";
  let userPrompt = "";

  if (type === "lpo") {
    systemPrompt = `You are an expert at parsing LPO (Local Purchase Order) documents from UAE/Talabat. Extract structured data from the provided document images. Return ONLY valid JSON with no markdown formatting.`;

    userPrompt = `Extract the following fields from this LPO document:
- po_number: The purchase order number (e.g., LPO-2026-001234)
- order_date: The date the order was placed (YYYY-MM-DD format)
- delivery_date: The expected delivery date (YYYY-MM-DD format)  
- supplier: The supplier/vendor name
- delivery_location: Where the order should be delivered (e.g., Talabat 3PL, Darkstore)
- customer: The customer or channel name (usually "Talabat")
- total_excl_vat: Total amount excluding VAT (AED)
- total_vat: VAT amount (usually 5% of subtotal)
- total_incl_vat: Total amount including VAT (AED)
- line_items: Array of items with:
  - barcode: Product barcode/SKU
  - product_name: Product name
  - quantity_ordered: Quantity ordered
  - unit_cost: Cost per unit (AED)
  - amount_excl_vat: Line total excluding VAT
  - vat_pct: VAT percentage (usually 5)
  - vat_amount: VAT amount for this line
  - amount_incl_vat: Line total including VAT

Return JSON like:
{
  "po_number": "LPO-XXX",
  "order_date": "2026-01-01",
  "delivery_date": "2026-01-03",
  "supplier": "Supplier Name",
  "delivery_location": "Talabat 3PL",
  "customer": "Talabat",
  "total_excl_vat": 1000,
  "total_vat": 50,
  "total_incl_vat": 1050,
  "line_items": [
    {
      "barcode": "123456789",
      "product_name": "Product Name",
      "quantity_ordered": 10,
      "unit_cost": 100,
      "amount_excl_vat": 1000,
      "vat_pct": 5,
      "vat_amount": 50,
      "amount_incl_vat": 1050
    }
  ]
}

If you cannot read a field, use null. Be precise with numbers.`;

  } else if (type === "invoice") {
    systemPrompt = `You are an expert at parsing Invoice documents from UAE. Extract structured data from the provided document images. Return ONLY valid JSON with no markdown formatting.`;

    userPrompt = `Extract the following fields from this Invoice:
- invoice_number: Invoice number
- invoice_date: Invoice date (YYYY-MM-DD)
- po_number: Related PO number if visible
- customer: Customer name
- subtotal: Subtotal before VAT (AED)
- vat_amount: VAT amount (usually 5%)
- grand_total: Total including VAT (AED)
- line_items: Array of items with barcode, product_name, quantity_invoiced, unit_rate, taxable_amount, vat_amount

Return JSON format. Be precise with numbers.`;
  }

  // Prepare messages with image (send first page only to keep it simple)
  const messages: any[] = [
    {
      role: "system",
      content: systemPrompt
    },
    {
      role: "user",
      content: [
        { type: "text", text: userPrompt },
        {
          type: "image_url",
          image_url: {
            url: `data:image/png;base64,${images[0]}`
          }
        }
      ]
    }
  ];

  // Call Ollama API
  const response = await fetch(`${OLLAMA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      temperature: 0.1,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  // Parse JSON from response
  try {
    // Try to extract JSON from the response (it might have markdown wrappers)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("No JSON found in response");
  } catch (parseError: any) {
    console.error("JSON parse error:", parseError);
    console.error("Raw response:", content);
    // Return raw content if JSON parsing fails
    return {
      error: "Failed to parse structured data",
      raw_content: content
    };
  }
}
