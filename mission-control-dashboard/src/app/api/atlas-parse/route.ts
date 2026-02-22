import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string || "lpo";
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    // Read file as base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "application/pdf";
    
    // Call MiniMax API
    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "MINIMAX_API_KEY not configured" }, { status: 500 });
    }
    
    const prompt = type === "lpo" 
      ? `You are Atlas, a document parsing AI. Extract the LPO (Purchase Order) data from this PDF and return ONLY valid JSON - no markdown, no explanation. 

Format:
{
  "po_number": "PO1234567",
  "order_date": "YYYY-MM-DD",
  "delivery_date": "YYYY-MM-DD", 
  "supplier": "Supplier Name",
  "delivery_location": "UAE_Talabat_3pl_XXX",
  "line_items": [
    {
      "barcode": "09501033112124",
      "product_name": "Product Name",
      "quantity_ordered": 100,
      "unit_cost": 4.00,
      "vat_pct": 5,
      "amount_excl_vat": 400.00,
      "vat_amount": 20.00,
      "amount_incl_vat": 420.00
    }
  ]
}

Extract ALL line items from the PDF. Return ONLY the JSON object.`
      : `Extract data from this document and return as JSON.`;
    
    // Use MiniMax chat completion API
    const response = await fetch("https://api.minimax.io/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "MiniMax-M2.5",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64}`
                }
              },
              {
                type: "text",
                text: prompt
              }
            ]
          }
        ],
        max_tokens: 32000,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("MiniMax API error:", response.status, errorText);
      return NextResponse.json({ 
        error: "Failed to parse with AI", 
        details: errorText,
        status: response.status 
      }, { status: 500 });
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response
    let jsonStr = content.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith("```")) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();
    
    // Parse JSON
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", jsonStr);
      return NextResponse.json({ error: "Could not parse AI response as JSON", raw: jsonStr }, { status: 400 });
    }
    
    // Calculate totals if not provided
    if (parsed.line_items && !parsed.total_excl_vat) {
      parsed.total_excl_vat = parsed.line_items.reduce((sum: number, item: any) => sum + (item.amount_excl_vat || 0), 0);
      parsed.total_vat = parsed.line_items.reduce((sum: number, item: any) => sum + (item.vat_amount || 0), 0);
      parsed.total_incl_vat = parsed.line_items.reduce((sum: number, item: any) => sum + (item.amount_incl_vat || 0), 0);
    }
    
    return NextResponse.json(parsed);
    
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
