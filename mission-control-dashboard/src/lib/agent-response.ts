// Agent Response System
// Handles routing messages to correct agents and generating responses

import { callMiniMax, buildAgentContext, getTeamContext, AGENT_MODELS } from "./minimax-client";

// Detect which agent is mentioned in message
export function detectAgentMention(message: string): string | null {
  const mentionMatch = message.match(/@(athena|nexus|atlas|forge|neo|zeus|faith|alexis)/i);
  return mentionMatch ? mentionMatch[1].toLowerCase() : null;
}

// Get agent config by ID
export function getAgentConfig(agentId: string) {
  const configs: Record<string, { name: string; role: string; model: string; scope: string }> = {
    athena: { 
      name: "Athena", 
      role: "CEO Agent", 
      model: "MiniMax_M2.5",
      scope: "Daily summary briefs to Anush, coordinates all agents, strategic decisions"
    },
    nexus: { 
      name: "Nexus", 
      role: "Trade Marketing Manager", 
      model: "Qwen_32B",
      scope: "Targets vs actual sales, on app marketing budgets, promotions (≤20% of sales)"
    },
    atlas: { 
      name: "Atlas", 
      role: "Ecommerce KAM", 
      model: "Qwen_32B",
      scope: "Customer insights, ads performance, stock movement, sales by brand"
    },
    forge: { 
      name: "Forge", 
      role: "Supply Chain Manager", 
      model: "Qwen_32B",
      scope: "SKU volume forecasting by brand, stock movement → Nexus for targets"
    },
    neo: { 
      name: "Neo", 
      role: "IT Manager", 
      model: "Qwen_32B",
      scope: "Build tools and skills for team, automations, code"
    },
    zeus: { 
      name: "Zeus", 
      role: "Marketing Manager", 
      model: "Qwen_32B",
      scope: "Digital marketing, brand marketing, client acquisition, LinkedIn/X/Instagram/TikTok"
    },
    faith: { 
      name: "Faith", 
      role: "Ecommerce Coordinator", 
      model: "Qwen_32B",
      scope: "Master SKU List, daily stock reports, Customer Performance data → Atlas"
    },
    alexis: { 
      name: "Alexis", 
      role: "Performance Marketing", 
      model: "Qwen_32B",
      scope: "PPC campaigns Talabat, analyze, provide insights to Atlas"
    },
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
    // Build context with team communication enabled
    const teamContext = getTeamContext();
    const messages = buildAgentContext(agentId, message, knowledgeBase, teamContext);
    
    // Get the right model for this agent
    const model = AGENT_MODELS[agentId as keyof typeof AGENT_MODELS] || "MiniMax_M2.5";
    
    // Call MiniMax API
    const response = await callMiniMax(messages, model);
    return response;
  } catch (error) {
    console.error("Agent response error:", error);
    
    // Fallback to mock if API fails
    return generateMockResponse(agentId, message);
  }
}

// Mock response fallback (for testing or if API fails)
function generateMockResponse(agentId: string, message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (agentId === "athena") {
    if (lowerMessage.includes("summary") || lowerMessage.includes("brief")) {
      return `📊 Athena here - Daily Summary

🤖 Team Status:
• Nexus: ACTIVE - Sales monitoring
• Atlas: ACTIVE - Stock & customer insights
• Forge: ACTIVE - Forecasting
• Neo: IDLE - Awaiting tool requests
• Zeus: IDLE - Awaiting marketing tasks
• Faith: IDLE - Awaiting SKU data
• Alexis: IDLE - Awaiting ad data

📈 Today's Metrics:
• Stock alerts: Checking...
• LPOs: Awaiting invoice details
• Brand Performance: Updated

Need me to escalate anything to you?`;
    }
    return `🎯 Athena here.

I coordinate the AI operations team. 

Team:
• @nexus - Sales & budgets
• @atlas - Customers & stock  
• @forge - Forecasting
• @neo - Tools & automation
• @zeus - Marketing
• @faith - SKU data
• @alexis - PPC ads

What do you need?`;
  }
  
  if (agentId === "nexus") {
    return `📊 Nexus here.

I handle sales targets vs actual, marketing budgets (≤20% of sales).

Want me to pull the latest numbers?`;
  }
  
  if (agentId === "atlas") {
    return `📦 Atlas here.

I manage customer insights, ads performance, and stock movement.

I coordinate @faith (SKU) and @alexis (PPC).

What do you need?`;
  }
  
  if (agentId === "forge") {
    return `🔮 Forge here.

I forecast SKU volumes using stock movement data.

My forecasts go to @nexus for sales targets.

Need a forecast?`;
  }
  
  if (agentId === "neo") {
    return `🛠️ Neo here.

I build tools and skills for the team.

What do you need built?`;
  }
  
  if (agentId === "zeus") {
    return `📢 Zeus here.

I handle digital marketing, brand marketing, and client acquisition.

Ready to grow our brand!`;
  }
  
  if (agentId === "faith") {
    return `📋 Faith here.

I maintain the Master SKU List and stock reports.

I report to @atlas.

What do you need?`;
  }
  
  if (agentId === "alexis") {
    return `📈 Alexis here.

I manage PPC campaigns on Talabat.

I report to @atlas with insights.

What campaign data do you need?`;
  }
  
  return `${agentId} received your message: "${message}"`;
}
