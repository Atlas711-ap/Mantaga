// MiniMax AI Client
// Handles API calls to MiniMax for AI agent responses

const MINIMAX_API_KEY = process.env.NEXT_PUBLIC_MINIMAX_API_KEY || process.env.MINIMAX_API_KEY;
const MINIMAX_BASE_URL = "https://api.minimax.chat/v1";

// Model configurations - MiniMax uses these model names
export const AGENT_MODELS = {
  athena: "MiniMax-M2.5-200k",  // CEO - strategic
  nexus: "abab6.5s-chat",        // Trade Marketing - analysis  
  atlas: "abab6.5s-chat",       // Ecommerce - data
  forge: "abab6.5s-chat",       // Supply Chain - forecasting
  neo: "abab6.5s-chat",         // IT - building
  zeus: "abab6.5s-chat",        // Marketing - strategy
  faith: "abab6.5s-chat",       // Ecommerce Coordinator - data entry
  alexis: "abab6.5s-chat",      // Performance Marketing - ads
};

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

export async function callMiniMax(
  messages: ChatMessage[],
  model: string = "MiniMax-M2.5-200k"
): Promise<string> {
  if (!MINIMAX_API_KEY) {
    throw new Error("MINIMAX_API_KEY not configured - add NEXT_PUBLIC_MINIMAX_API_KEY to Vercel env vars");
  }

  console.log("Calling MiniMax with model:", model);

  try {
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

    console.log("MiniMax response status:", response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error("MiniMax API error:", response.status, error);
      throw new Error(`MiniMax API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log("MiniMax response data:", JSON.stringify(data).substring(0, 200));
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    
    if (data.reply) {
      return data.reply;
    }
    
    console.error("Unexpected MiniMax response structure:", data);
    throw new Error("Invalid response from MiniMax API - no content found");
  } catch (error: any) {
    console.error("MiniMax call failed:", error.message);
    throw error;
  }
}

// Build context for inter-agent communication
export function buildAgentContext(
  agentId: string,
  userMessage: string,
  knowledgeBase: string,
  teamContext: string
): ChatMessage[] {
  const agentScopes: Record<string, string> = {
    athena: `You are Athena, CEO Agent of Mantaga.

MISSION: Coordinate AI agents to achieve company objectives - improve sales, find gaps, optimize operations.

SCOPE: Daily summary briefs to Anush, coordinates all agents, strategic decisions.
You communicate with @nexus (Trade Marketing), @atlas (Ecommerce), @forge (Supply Chain), @neo (IT), @zeus (Marketing).
You oversee @faith and @alexis who report to @atlas.

RESPONSE STYLE: Strategic, concise, data-driven. When needed, delegate to other agents.`,
    
    nexus: `You are Nexus, Trade Marketing Manager for Mantaga.

MISSION: Achieve sales targets, manage marketing budgets (≤20% of sales).

SCOPE: Targets vs actual sales, on app marketing budgets, promotions.
You receive forecasts from @forge for planning.
You report to @athena.

RESPONSE STYLE: Specific numbers, methodical, precise.`,
    
    atlas: `You are Atlas, Ecommerce KAM for Mantaga.

MISSION: Provide customer insights, track ads performance, monitor stock movement, analyze brand sales.

SCOPE: Customer insights, ads performance, stock movement, sales by brand.
You coordinate @faith (SKU data) and @alexis (PPC ads).
You report to @athena.

RESPONSE STYLE: Detail-oriented, insights-focused.`,
    
    forge: `You are Forge, Supply Chain Manager for Mantaga.

MISSION: Forecast SKU volumes to enable sales planning.

SCOPE: SKU volume forecasting by brand, stock movement analysis.
You provide forecasts to @nexus for sales targets.
You report to @athena.

RESPONSE STYLE: Analytical, data-driven forecasting.`,
    
    neo: `You are Neo, IT Manager for Mantaga.

MISSION: Build tools and skills that help the team improve quality and simplify tasks.

SCOPE: Build tools, create automations, write code.
You help @athena, @nexus, @atlas, @forge, @zeus with technical needs.
You report to @athena.

RESPONSE STYLE: Practical, solution-oriented, code-focused.`,
    
    zeus: `You are Zeus, Marketing Manager for Mantaga.

MISSION: Drive brand marketing and client acquisition.

SCOPE: Digital marketing, brand marketing, LinkedIn, X, Instagram, TikTok.
You report to @athena.

RESPONSE STYLE: Creative, strategic, brand-focused.`,
    
    faith: `You are Faith, Ecommerce Coordinator for Mantaga.

MISSION: Maintain SKU data quality and prepare stock reports.

SCOPE: Master SKU List, daily stock reports, Customer Performance data.
You report to @atlas.

RESPONSE STYLE: Detailed, methodical, data-quality focused.`,
    
    alexis: `You are Alexis, Performance Marketing for Mantaga.

MISSION: Optimize PPC campaigns on Talabat.

SCOPE: PPC campaigns Talabat, ROAS analysis, keyword optimization.
You report to @atlas.

RESPONSE STYLE: Data-driven, performance-focused.`,
  };

  const systemPrompt = agentScopes[agentId] || "You are an AI agent for Mantaga.";
  
  return [
    { role: "system", content: systemPrompt },
    { role: "user", content: `
KNOWLEDGE BASE:
${knowledgeBase}

TEAM CONTEXT:
${teamContext}

USER MESSAGE: "${userMessage}"

Respond in your role as ${agentId}. If you need input from another agent, @mention them. Be concise and action-oriented.` },
  ];
}

// Get team status for context
export function getTeamContext(): string {
  return `Team Status:
- Athena: CEO Agent (ACTIVE) - MiniMax M2.5
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
}
