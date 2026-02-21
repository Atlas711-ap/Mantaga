// Agent Response System
// Handles routing messages to correct agents and generating responses

// Detect which agent is mentioned in message
export function detectAgentMention(message: string): string | null {
  const mentionMatch = message.match(/@(athena|nexus|atlas|forge)/i);
  return mentionMatch ? mentionMatch[1].toLowerCase() : null;
}

// Get agent config by ID
export function getAgentConfig(agentId: string) {
  const configs: Record<string, { name: string; role: string; model: string }> = {
    athena: { name: "Athena", role: "CEO", model: "MiniMax-M2.5" },
    nexus: { name: "Nexus", role: "Operations", model: "qwen2.5-coder:32b" },
    atlas: { name: "Atlas", role: "SKU Manager", model: "qwen2.5-coder:32b" },
    forge: { name: "Forge", role: "Developer", model: "qwen2.5-coder:32b" },
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
    return "I don't recognize that agent. Try @athena, @nexus, @atlas, or @forge.";
  }

  // Build context prompt
  const contextPrompt = buildAgentPrompt(agentId, message, knowledgeBase);

  try {
    // Spawn a sub-agent session for this request
    const response = await new Promise<string>((resolve) => {
      // For now, we'll use the main session with a targeted prompt
      // In Phase 2, this will spawn persistent agent sessions
      resolve(generateMockResponse(agentId, message));
    });

    return response;
  } catch (error) {
    console.error("Agent response error:", error);
    return `⚠️ Error contacting ${agentConfig.name}. Please try again.`;
  }
}

// Build the prompt for the agent
function buildAgentPrompt(agentId: string, userMessage: string, knowledgeBase: string): string {
  const agentPrompts: Record<string, string> = {
    athena: `You are Athena, CEO of Mantaga's AI operations.

Knowledge Base:
${knowledgeBase}

The user says: "${userMessage}"

Respond as Athena would - strategic, concise, and data-driven.`,
    
    nexus: `You are Nexus, Operations Manager for Mantaga.

Knowledge Base:
${knowledgeBase}

The user says: "${userMessage}"

Respond as Nexus would - specific numbers, methodical, precise.`,
    
    atlas: `You are Atlas, SKU Manager for Mantaga.

Knowledge Base:
${knowledgeBase}

The user says: "${userMessage}"

Respond as Atlas would - detail-oriented, focused on data quality.`,
    
    forge: `You are Forge, Developer for Mantaga.

Knowledge Base:
${knowledgeBase}

The user says: "${userMessage}"

Respond as Forge would - practical, solution-oriented, code-focused.`,
  };

  return agentPrompts[agentId] || userMessage;
}

// Mock response for now (will be replaced with actual AI calls)
function generateMockResponse(agentId: string, message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (agentId === "nexus") {
    if (lowerMessage.includes("stock")) {
      return `📊 Stock Status (Nexus reporting):

• 3PL Buffer: 2,450 units
• Darkstores: 49 locations
• With Stock: 42
• OOS: 7 locations ⚠️
• Low Stock: 12 alerts

Knowledge base updated with latest figures.`;
    }
    if (lowerMessage.includes("lpo") || lowerMessage.includes("po")) {
      return `📄 LPO Status (Nexus reporting):

• Active POs: 0
• Pending Processing: 0
• Awaiting Invoice Match: 0

Upload an LPO file to begin processing.`;
    }
    return `Nexus here. Processing your request. 

Current operations:
• Stock monitoring: ACTIVE
• LPO processing: STANDBY
• Data sync: NOMINAL

What specific data do you need?`;
  }
  
  if (agentId === "atlas") {
    if (lowerMessage.includes("sku")) {
      return `📋 SKU Status (Atlas reporting):

• Total SKUs: Loading from database...
• Missing Fields: Need to query
• Duplicates: Need to check

Would you like me to run a full validation?`;
    }
    return `Atlas here. Ready to validate SKU data.

Upload a Master SKU list and I'll:
• Check all required fields
• Flag missing data in red
• Identify duplicates`;
  }
  
  if (agentId === "forge") {
    return `🔧 Forge here.

I can help with:
• Building new tools
• Modifying existing features
• Creating automations

What do you need built?`;
  }
  
  if (agentId === "athena") {
    return `📊 Athena here.

Daily Brief (auto-generated):
• System: OPERATIONAL
• Stock: 7 OOS ⚠️
• LPOs: Awaiting upload
• Team: STANDBY

Full brief available on Telegram at 1 AM daily.`;
  }
  
  return `${agentId} received your message: "${message}"`;
}
