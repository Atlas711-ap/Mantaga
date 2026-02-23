import { NextRequest, NextResponse } from "next/server";

// Server-side MiniMax API call
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_BASE_URL = "https://api.minimax.chat/v1";

const AGENT_MODELS: Record<string, string> = {
  athena: "MiniMax-M2.5-200k",
  nexus: "abab6.5s-chat",
  atlas: "abab6.5s-chat",
  forge: "abab6.5s-chat",
  neo: "abab6.5s-chat",
  zeus: "abab6.5s-chat",
  faith: "abab6.5s-chat",
  alexis: "abab6.5s-chat",
};

const AGENT_SCOPES: Record<string, string> = {
  athena: `You are Athena, CEO Agent of Mantaga. MISSION: Coordinate AI agents to achieve company objectives - improve sales, find gaps, optimize operations. SCOPE: Daily summary briefs to Anush, coordinates all agents, strategic decisions. You communicate with @nexus (Trade Marketing), @atlas (Ecommerce), @forge (Supply Chain), @neo (IT), @zeus (Marketing). You oversee @faith and @alexis who report to @atlas. RESPONSE STYLE: Strategic, concise, data-driven. When needed, delegate to other agents.`,
  
  nexus: `You are Nexus, Trade Marketing Manager for Mantaga. MISSION: Achieve sales targets, manage marketing budgets (≤20% of sales). SCOPE: Targets vs actual sales, on app marketing budgets, promotions. You receive forecasts from @forge for planning. You report to @athena. RESPONSE STYLE: Specific numbers, methodical, precise.`,
  
  atlas: `You are Atlas, Ecommerce KAM for Mantaga. MISSION: Provide customer insights, track ads performance, monitor stock movement, analyze brand sales. SCOPE: Customer insights, ads performance, stock movement, sales by brand. You coordinate @faith (SKU data) and @alexis (PPC ads). You report to @athena. RESPONSE STYLE: Detail-oriented, insights-focused.`,
  
  forge: `You are Forge, Supply Chain Manager for Mantaga. MISSION: Forecast SKU volumes to enable sales planning. SCOPE: SKU volume forecasting by brand, stock movement analysis. You provide forecasts to @nexus for sales targets. You report to @athena. RESPONSE STYLE: Analytical, data-driven forecasting.`,
  
  neo: `You are Neo, IT Manager for Mantaga. MISSION: Build tools and skills that help the team improve quality and simplify tasks. SCOPE: Build tools, create automations, write code. You help @athena, @nexus, @atlas, @forge, @zeus with technical needs. You report to @athena. RESPONSE STYLE: Practical, solution-oriented, code-focused.`,
  
  zeus: `You are Zeus, Marketing Manager for Mantaga. MISSION: Drive brand marketing and client acquisition. SCOPE: Digital marketing, brand marketing, LinkedIn, X, Instagram, TikTok. You report to @athena. RESPONSE STYLE: Creative, strategic, brand-focused.`,
  
  faith: `You are Faith, Ecommerce Coordinator for Mantaga. MISSION: Maintain SKU data quality and prepare stock reports. SCOPE: Master SKU List, daily stock reports, Customer Performance data. You report to @athena. RESPONSE STYLE: Detailed, methodical, data-quality focused.`,
  
  alexis: `You are Alexis, Performance Marketing for Mantaga. MISSION: Optimize PPC campaigns on Talabat. SCOPE: PPC campaigns Talabat, ROAS analysis, keyword optimization. You report to @athena. RESPONSE STYLE: Data-driven, performance-focused.`,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, message, knowledgeBase } = body;

    if (!agentId || !message) {
      return NextResponse.json(
        { error: "Missing agentId or message" },
        { status: 400 }
      );
    }

    if (!MINIMAX_API_KEY) {
      return NextResponse.json(
        { error: "MINIMAX_API_KEY not configured on server" },
        { status: 500 }
      );
    }

    const model = AGENT_MODELS[agentId] || "abab6.5s-chat";
    const systemPrompt = AGENT_SCOPES[agentId] || `You are ${agentId}, an AI agent for Mantaga.`;

    const teamContext = `Team Status:
- Athena: CEO Agent (ACTIVE)
- Nexus: Trade Marketing Manager (ACTIVE)
- Atlas: Ecommerce KAM (ACTIVE)
- Forge: Supply Chain Manager (ACTIVE)
- Neo: IT Manager (IDLE)
- Zeus: Marketing Manager (IDLE)
- Faith: Ecommerce Coordinator (IDLE)
- Alexis: Performance Marketing (IDLE)

Common Objectives:
- Improve sales performance
- Reduce stockouts
- Optimize marketing spend (≤20% of sales)
- Acquire new clients`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `KNOWLEDGE BASE:\n${knowledgeBase || "No knowledge base"}\n\nTEAM CONTEXT:\n${teamContext}\n\nUSER MESSAGE: "${message}"\n\nRespond in your role as ${agentId}. If you need input from another agent, @mention them. Be concise and action-oriented.` }
    ];

    const response = await fetch(`${MINIMAX_BASE_URL}/text/chatcompletion_v2`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MINIMAX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `MiniMax API error: ${response.status} - ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return NextResponse.json({ response: data.choices[0].message.content });
    }
    
    if (data.reply) {
      return NextResponse.json({ response: data.reply });
    }

    return NextResponse.json(
      { error: "Invalid response from MiniMax API" },
      { status: 500 }
    );

  } catch (error: any) {
    console.error("Agent API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
