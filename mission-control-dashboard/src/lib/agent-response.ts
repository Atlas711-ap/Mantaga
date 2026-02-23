// Agent Response System
// Routes messages to OpenClaw sub-agents

// Detect which agent is mentioned in message
export function detectAgentMention(message: string): string | null {
  const mentionMatch = message.match(/@(athena|nexus|atlas|forge|neo|zeus|faith|alexis)/i);
  return mentionMatch ? mentionMatch[1].toLowerCase() : null;
}

// Get agent config
export function getAgentConfig(agentId: string) {
  const configs: Record<string, { name: string; role: string; model: string }> = {
    athena: { name: "Athena", role: "CEO Agent", model: "MiniMax-M2.5" },
    nexus: { name: "Nexus", role: "Trade Marketing Manager", model: "MiniMax-M2.5" },
    atlas: { name: "Atlas", role: "Ecommerce KAM", model: "MiniMax-M2.5" },
    forge: { name: "Forge", role: "Supply Chain Manager", model: "Qwen 32B" },
    neo: { name: "Neo", role: "IT Manager", model: "Qwen 32B" },
    zeus: { name: "Zeus", role: "Marketing Manager", model: "Qwen 32B" },
    faith: { name: "Faith", role: "Ecommerce Coordinator", model: "Qwen 32B" },
    alexis: { name: "Alexis", role: "Performance Marketing", model: "Qwen 32B" },
  };
  return configs[agentId] || null;
}

// Route message to appropriate OpenClaw agent
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
    // Call our OpenClaw API
    const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/openclaw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        agentId,
        message,
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
    return `⚠️ Unable to connect to ${agentConfig.name}.\n\nError: ${error.message}\n\nMake sure OpenClaw is running.`;
  }
}
