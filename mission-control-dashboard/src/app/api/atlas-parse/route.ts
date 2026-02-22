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
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "application/pdf";
    
    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "MINIMAX_API_KEY not configured" }, { status: 500 });
    }
    
    // Try using the coding plan API with correct model
    const response = await fetch("https://api.minimax.io/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "MiniMax-Text-01",
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
                text: `Extract all LPO data as JSON. Include: po_number, order_date (YYYY-MM-DD), delivery_date, supplier, delivery_location, line_items array with: barcode, product_name, quantity_ordered, unit_cost, vat_pct, amount_excl_vat, vat_amount, amount_incl_vat. Return ONLY JSON.`
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 8000,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("MiniMax API error:", response.status, errorText);
      return NextResponse.json({ 
        error: "API error", 
        details: errorText,
        status: response.status 
      }, { status: 500 });
    }
    
    const data = await response.json();
    console.log("MiniMax response keys:", Object.keys(data));
    console.log("First 200 chars:", JSON.stringify(data).substring(0, 200));
    
    // Try to find content in response
    let content = "";
    if (data.choices && data.choices[0]) {
      const msg = data.choices[0].message || data.choices[0];
      content = msg.content || msg.text || msg.response || "";
    }
    if (!content && data.output) {
      content = typeof data.output === 'string' ? data.output : JSON.stringify(data.output);
    }
    if (!content && data.text) {
      content = typeof data.text === 'string' ? data.text : JSON.stringify(data.text);
    }
    
    if (!content) {
      return NextResponse.json({ 
        error: "No content from AI", 
        debug: data 
      }, { status: 500 });
    }
    
    // Extract JSON
    let jsonStr = content.trim();
    // Remove markdown code blocks
    jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
    
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Try to find JSON in the text
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json({ error: "Could not parse JSON", raw: jsonStr }, { status: 400 });
      }
    }
    
    // Calculate totals
    if (parsed.line_items) {
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
