// Agent Response System
// Routes messages to correct agents via server-side API

import { AGENT_MODELS, getTeamContext } from "./minimax-client";

// Detect which agent is mentioned in message
export function detectAgentMention(message: string): string | null {
  const mentionMatch = message.match(/@(athena|nexus|atlas|forge|neo|zeus|faith|alexis)/i);
  return mentionMatch ? mentionMatch[1].toLowerCase() : null;
}

// Get agent config by ID
export function getAgentConfig(agentId: string) {
  const configs: Record<string, { name: string; role: string; model: string; scope: string }> = {
    athena: { name: "Athena", role: "CEO Agent", model: "MiniMax-M2.5-200k", scope: "Daily summary briefs to Anush, coordinates all agents, strategic decisions" },
    nexus: { name: "Nexus", role: "Trade Marketing Manager", model: "abab6.5s-chat", scope: "Targets vs actual sales, on app marketing budgets, promotions (≤20% of sales)" },
    atlas: { name: "Atlas", role: "Ecommerce KAM", model: "abab6.5s-chat", scope: "Customer insights, ads performance, stock movement, sales by brand" },
    forge: { name: "Forge", role: "Supply Chain Manager", model: "abab6.5s-chat", scope: "SKU volume forecasting by brand, stock movement → Nexus for targets" },
    neo: { name: "Neo", role: "IT Manager", model: "abab6.5s-chat", scope: "Build tools and skills for team, automations, code" },
    zeus: { name: "Zeus", role: "Marketing Manager", model: "abab6.5s-chat", scope: "Digital marketing, brand marketing, client acquisition, LinkedIn/X/Instagram/TikTok" },
    faith: { name: "Faith", role: "Ecommerce Coordinator", model: "abab6.5s-chat", scope: "Master SKU List, daily stock reports, Customer Performance data → Atlas" },
    alexis: { name: "Alexis", role: "Performance Marketing", model: "abab6.5s-chat", scope: "PPC campaigns Talabat, analyze, provide insights to Atlas" },
  };
  return configs[agentId] || null;
}

// Route message to appropriate agent and get response
export async function routeToAgent(
  message: string,
  agentId: string,
  knowledgeBase: string
): Promise<string> {
  const agentConfig = getAgentConfig(agentId);
  if (!agentConfig) {
    return "I don't recognize that agent. Try @athena, @nexus, @atlas, @forge, @neo, @zeus, @faith, or @alexis.";
  }

  try {
    // Call our server-side API route
    const apiResponse = await fetch("/api/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agentId,
        message,
        knowledgeBase,
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(errorData.error || `API error: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    return data.response;
  } catch (error: any) {
    console.error("Agent response error:", error);
    return `⚠️ Unable to connect to AI service.\n\nError: ${error.message}\n\nPlease ensure MINIMAX_API_KEY is set in Vercel environment variables.`;
  }
}
