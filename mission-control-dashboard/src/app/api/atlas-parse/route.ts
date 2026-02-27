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
    userPrompt = `You are an expert at parsing Talabat LPO documents.

TABLE COLUMN STRUCTURE - READ IN THIS ORDER:
Column 1: No. (row number)
Column 2: SKU (internal SKU code like 913327)
Column 3: Barcode (13-digit like 09501033112124)  
Column 4: Product Name
Column 5: Qty (QUANTITY - the number of units like 1554, 1050, 252)
Column 6: Unit Cost (price per single unit like 74.00, 50.00)
Column 7: Disc. Cost
Column 8: Amt. Excl. VAT (Qty × Unit Cost)
Column 9: VAT % (usually 5)
Column 10: VAT Amt (Amt Excl VAT × 0.05)
Column 11: Amt. Incl. VAT

CRITICAL: The Qty column contains LARGE numbers like 1554, 1050, 252, 443, 322. 
The Unit Cost column contains SMALL numbers like 74, 50, 12, 21, 15.
DO NOT confuse these columns!

Extract exactly:
{
  "po_number": "PO number exactly",
  "order_date": "YYYY-MM-DD",
  "delivery_date": "YYYY-MM-DD",
  "supplier": "Supplier name exactly",
  "delivery_location": "Delivery location exactly", 
  "customer": "Talabat",
  "total_excl_vat": Number (subtotal before VAT),
  "total_vat": Number (VAT amount),
  "total_incl_vat": Number (grand total),
  "line_items": [
    {
      "barcode": "13-digit barcode exactly",
      "product_name": "Full product name exactly",
      "quantity_ordered": LARGE number from Qty column,
      "unit_cost": SMALL number from Unit Cost column,
      "amount_excl_vat": Number from Amt. Excl. VAT column,
      "vat_pct": 5,
      "vat_amount": Number from VAT Amt column,
      "amount_incl_vat": Number from Amt. Incl. VAT column
    }
  ]
}

Return ONLY valid JSON.`;

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
