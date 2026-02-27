import { NextRequest, NextResponse } from "next/server";

// OpenAI config
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = "https://api.openai.com/v1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images, type } = body;

    if (!images || images.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json({ error: "No type provided" }, { status: 400 });
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    // Parse with GPT-4V using images
    const parsedData = await parseWithGPT(images, type);

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("Atlas parse error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

async function parseWithGPT(images: string[], type: string): Promise<any> {
  let userPrompt = "";

  if (type === "lpo") {
    userPrompt = `You are an expert at parsing LPO (Local Purchase Order) documents from UAE/Talabat. 

Extract the following fields from this LPO document and return ONLY valid JSON:
{
  "po_number": "The purchase order number (e.g., LPO-2026-001234)",
  "order_date": "Date the order was placed (YYYY-MM-DD format)",
  "delivery_date": "Expected delivery date (YYYY-MM-DD format)",  
  "supplier": "The supplier/vendor name",
  "delivery_location": "Where the order should be delivered (e.g., Talabat 3PL, Darkstore)",
  "customer": "The customer or channel name (usually Talabat)",
  "total_excl_vat": Total amount excluding VAT (AED) - number only,
  "total_vat": VAT amount (AED) - number only,
  "total_incl_vat": Total amount including VAT (AED) - number only,
  "line_items": [
    {
      "barcode": "Product barcode/SKU",
      "product_name": "Product name",
      "quantity_ordered": quantity - number,
      "unit_cost": Cost per unit (AED) - number,
      "amount_excl_vat": Line total excluding VAT - number,
      "vat_pct": VAT percentage (usually 5),
      "vat_amount": VAT amount for this line - number,
      "amount_incl_vat": Line total including VAT - number
    }
  ]
}

Return ONLY JSON, no markdown. If a field cannot be determined, use null.`;

  } else if (type === "invoice") {
    userPrompt = `You are an expert at parsing Invoice documents from UAE. 

Extract the following fields and return ONLY valid JSON:
{
  "invoice_number": "Invoice number",
  "invoice_date": "Invoice date (YYYY-MM-DD)",
  "po_number": "Related PO number if visible",
  "customer": "Customer name",
  "subtotal": "Subtotal before VAT (AED) - number",
  "vat_amount": "VAT amount (AED) - number",
  "grand_total": "Total including VAT (AED) - number",
  "line_items": [
    {
      "barcode": "Product barcode",
      "product_name": "Product name", 
      "quantity_invoiced": quantity - number,
      "unit_rate": "Unit rate (AED) - number",
      "taxable_amount": "Taxable amount - number",
      "vat_amount": "VAT amount - number"
    }
  ]
}

Return ONLY JSON, no markdown.`;
  }

  // Build content array with text and all images
  const content: any[] = [{ type: "text", text: userPrompt }];
  
  // Add all images
  for (const imageBase64 of images) {
    content.push({
      type: "image_url",
      image_url: {
        url: `data:image/jpeg;base64,${imageBase64}`,
        detail: "high"
      }
    });
  }

  // Call OpenAI API with GPT-4V
  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: content
        }
      ],
      temperature: 0.1,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("OpenAI API error:", error);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const contentResult = data.choices?.[0]?.message?.content || "";

  // Parse JSON from response
  try {
    // Try to extract JSON from the response
    const jsonMatch = contentResult.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("No JSON found in response");
  } catch (parseError: any) {
    console.error("JSON parse error:", parseError);
    console.error("Raw response:", contentResult);
    return {
      error: "Failed to parse structured data",
      raw_content: contentResult
    };
  }
}
