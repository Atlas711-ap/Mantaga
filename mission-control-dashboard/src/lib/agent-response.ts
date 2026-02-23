// Agent Response System
// Handles routing messages to correct agents and generating responses

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
      model: "MiniMax-M2.5",
      scope: "Daily summary briefs to Anush, coordinates all agents, strategic decisions"
    },
    nexus: { 
      name: "Nexus", 
      role: "Trade Marketing Manager", 
      model: "qwen2.5-coder:32b",
      scope: "Targets vs actual sales, on app marketing budgets, promotions (≤20% of sales)"
    },
    atlas: { 
      name: "Atlas", 
      role: "Ecommerce KAM", 
      model: "qwen2.5-coder:32b",
      scope: "Customer insights, ads performance, stock movement, sales by brand"
    },
    forge: { 
      name: "Forge", 
      role: "Supply Chain Manager", 
      model: "qwen2.5-coder:32b",
      scope: "SKU volume forecasting by brand, stock movement → Nexus for targets"
    },
    neo: { 
      name: "Neo", 
      role: "IT Manager", 
      model: "qwen2.5-coder:32b",
      scope: "Build tools and skills for team, automations, code"
    },
    zeus: { 
      name: "Zeus", 
      role: "Marketing Manager", 
      model: "qwen2.5-coder:32b",
      scope: "Digital marketing, brand marketing, client acquisition, LinkedIn/X/Instagram/TikTok"
    },
    faith: { 
      name: "Faith", 
      role: "Ecommerce Coordinator", 
      model: "qwen2.5-coder:32b",
      scope: "Master SKU List, daily stock reports, Customer Performance data → Atlas"
    },
    alexis: { 
      name: "Alexis", 
      role: "Performance Marketing", 
      model: "qwen2.5-coder:32b",
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

  // Build context prompt
  const contextPrompt = buildAgentPrompt(agentId, message, knowledgeBase);

  try {
    // For now, return mock responses
    // In production, this will call MiniMax API
    const response = generateMockResponse(agentId, message);
    return response;
  } catch (error) {
    console.error("Agent response error:", error);
    return `⚠️ Error contacting ${agentConfig.name}. Please try again.`;
  }
}

// Build the prompt for the agent
function buildAgentPrompt(agentId: string, userMessage: string, knowledgeBase: string): string {
  const agentPrompts: Record<string, string> = {
    athena: `You are Athena, CEO Agent of Mantaga's AI operations.

Scope: Daily summary briefs to Anush, coordinates all agents, strategic decisions

Knowledge Base:
${knowledgeBase}

The user says: "${userMessage}"

Respond as Athena would - strategic, concise, data-driven. You coordinate the team and report to Anush.`,
    
    nexus: `You are Nexus, Trade Marketing Manager for Mantaga.

Scope: Targets vs actual sales, on app marketing budgets, promotions (≤20% of sales)

Knowledge Base:
${knowledgeBase}

The user says: "${userMessage}"

Respond as Nexus would - specific numbers, methodical, focused on sales targets and budgets.`,
    
    atlas: `You are Atlas, Ecommerce KAM for Mantaga.

Scope: Customer insights, ads performance, stock movement, sales by brand

Knowledge Base:
${knowledgeBase}

The user says: "${userMessage}"

Respond as Atlas would - detail-oriented, focused on customer performance and brand insights.`,
    
    forge: `You are Forge, Supply Chain Manager for Mantaga.

Scope: SKU volume forecasting by brand, stock movement analysis → Nexus for sales targets

Knowledge Base:
${knowledgeBase}

The user says: "${userMessage}"

Respond as Forge would - analytical, focused on forecasting and supply chain data.`,
    
    neo: `You are Neo, IT Manager for Mantaga.

Scope: Build tools and skills for team, automations, code

Knowledge Base:
${knowledgeBase}

The user says: "${userMessage}"

Respond as Neo would - practical, solution-oriented, focused on building tools and automating tasks.`,
    
    zeus: `You are Zeus, Marketing Manager for Mantaga.

Scope: Digital marketing, brand marketing, client acquisition, LinkedIn/X/Instagram/TikTok

Knowledge Base:
${knowledgeBase}

The user says: "${userMessage}"

Respond as Zeus would - creative, strategic, focused on marketing and brand growth.`,
    
    faith: `You are Faith, Ecommerce Coordinator for Mantaga (reports to Atlas).

Scope: Master SKU List, daily stock reports, Customer Performance data

Knowledge Base:
${knowledgeBase}

The user says: "${userMessage}"

Respond as Faith would - detailed, methodical, focused on SKU data quality and stock reporting.`,
    
    alexis: `You are Alexis, Performance Marketing for Mantaga (reports to Atlas).

Scope: PPC campaigns Talabat, analyze, provide insights to Atlas

Knowledge Base:
${knowledgeBase}

The user says: "${userMessage}"

Respond as Alexis would - data-driven, focused on PPC performance and ROAS optimization.`,
  };

  return agentPrompts[agentId] || userMessage;
}

// Mock response for now (will be replaced with actual AI calls)
function generateMockResponse(agentId: string, message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for inter-agent mentions
  const mentionsNexus = lowerMessage.includes("@nexus") || lowerMessage.includes("nexus");
  const mentionsAtlas = lowerMessage.includes("@atlas") || lowerMessage.includes("atlas");
  const mentionsForge = lowerMessage.includes("@forge") || lowerMessage.includes("forge");
  const mentionsNeo = lowerMessage.includes("@neo") || lowerMessage.includes("neo");
  const mentionsZeus = lowerMessage.includes("@zeus") || lowerMessage.includes("zeus");
  const mentionsFaith = lowerMessage.includes("@faith") || lowerMessage.includes("faith");
  const mentionsAlexis = lowerMessage.includes("@alexis") || lowerMessage.includes("alexis");
  
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
    if (mentionsNexus) {
      return `📊 Forwarding to Nexus...

@nexus The user wants to discuss sales targets or marketing budgets. Please provide the latest figures.`;
    }
    if (mentionsAtlas) {
      return `📦 Forwarding to Atlas...

@atlas The user wants customer or stock insights. Please share the latest data.`;
    }
    return `🎯 Athena here.

I coordinate the AI operations team. I can help you with:
• Daily summaries
• Team coordination
• Strategic decisions
• Escalations

Or talk to specific agents:
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
    if (lowerMessage.includes("target") || lowerMessage.includes("sales") || lowerMessage.includes("budget")) {
      return `📊 Nexus here - Trade Marketing

Current Status:
• Sales targets: Need to pull from Brand Performance
• On app marketing: Monitoring spend
• Promotions: Budget tracking active

⚠️ Reminder: Never exceed 20% of sales on (on app marketing + promotions)

Want me to pull the latest numbers?`;
    }
    if (lowerMessage.includes("brand") || lowerMessage.includes("performance")) {
      return `📈 Nexus here.

I track sales performance. Let me check Brand Performance data...

@faith Can you pull the latest sales figures for me?`;
    }
    return `📊 Nexus here.

I handle:
• Sales targets vs actual
• Marketing budgets
• Promotion spend

My rule: Never exceed 20% on marketing + promotions.

What data do you need?`;
  }
  
  if (agentId === "atlas") {
    if (lowerMessage.includes("stock") || lowerMessage.includes("oos")) {
      return `📦 Atlas here - Ecommerce

Current Status:
• Stock movement: Monitoring
• Customer sales: Tracking by brand
• Ads performance: Need Alexis to analyze

@faith Can you check for any OOS alerts in today's stock report?`;
    }
    if (lowerMessage.includes("customer") || lowerMessage.includes("brand")) {
      return `📊 Atlas here.

I track:
• Customer insights by brand
• Stock movement
• Ads performance (via Alexis)

@faith What's the latest customer sales breakdown?`;
    }
    if (mentionsAlexis) {
      return `📈 Forwarding to Alexis...

@alexis The user wants PPC performance data. Please analyze and report back.`;
    }
    return `📦 Atlas here.

I manage customer insights, ads performance, and stock movement. I coordinate Faith and Alexis.

@faith - SKU data & stock reports
@alexis - PPC campaigns

What do you need?`;
  }
  
  if (agentId === "forge") {
    if (lowerMessage.includes("forecast") || lowerMessage.includes("volume")) {
      return `🔮 Forge here - Supply Chain

I forecast SKU volumes based on stock movement data from Atlas.

Current Status:
• Analyzing recent stock trends
• Building volume predictions

@atlas Can you share the latest stock movement data for forecasting?`;
    }
    if (lowerMessage.includes("nexus")) {
      return `🔮 Forwarding to Nexus...

@nexus My forecast is ready. Use this to build your sales targets for next month.`;
    }
    return `🔮 Forge here.

I forecast SKU volumes by brand using stock movement data.

My forecasts go to @nexus for sales targets and marketing budget planning.

Need a forecast?`;
  }
  
  if (agentId === "neo") {
    if (lowerMessage.includes("tool") || lowerMessage.includes("build") || lowerMessage.includes("autom")) {
      return `🛠️ Neo here - IT Manager

I build tools and skills for the team.

Current capabilities:
• LPO processing
• Stock analysis
• Brand Performance sync

What tool do you need? Describe the task and I'll build it.`;
    }
    if (lowerMessage.includes("skill")) {
      return `🎯 Neo here.

I can build skills that help the team:
• Data processing automations
• Reporting tools
• Dashboard enhancements
• API integrations

What do you need automated?`;
    }
    return `🛠️ Neo here.

I'm the IT Manager - I build tools and skills for the team.

I help simplify tasks and create automations.

What do you need built?`;
  }
  
  if (agentId === "zeus") {
    if (lowerMessage.includes("brand") || lowerMessage.includes("marketing") || lowerMessage.includes("client")) {
      return `📢 Zeus here - Marketing

I handle:
• Digital marketing strategies
• Brand marketing
• Client acquisition
• LinkedIn, X, Instagram, TikTok

Currently: Building our brand presence strategy.

What aspect do you want to focus on?`;
    }
    return `📢 Zeus here.

I'm focused on:
• Digital marketing
• Brand marketing
• Client acquisition
• Social platforms (LinkedIn, X, Instagram, TikTok)

Ready to grow our brand! What do you need?`;
  }
  
  if (agentId === "faith") {
    if (lowerMessage.includes("sku") || lowerMessage.includes("master")) {
      return `📋 Faith here - Ecommerce Coordinator

I maintain the Master SKU List.

Current Status:
• Checking for missing fields
• Validating product data

Need me to run a SKU validation?`;
    }
    if (lowerMessage.includes("stock") || lowerMessage.includes("report")) {
      return `📦 Faith here.

Reading daily stock reports and preparing Customer Performance data.

@atlas Here's the latest stock summary:
• Total SKUs tracked
• OOS alerts
• Movement trends

Want me to populate the Customer Performance tab?`;
    }
    return `📋 Faith here.

I report to @atlas. I handle:
• Master SKU List
• Daily stock reports
• Customer Performance data

What do you need?`;
  }
  
  if (agentId === "alexis") {
    if (lowerMessage.includes("ppc") || lowerMessage.includes("talabat") || lowerMessage.includes("ads") || lowerMessage.includes("roas")) {
      return `📈 Alexis here - Performance Marketing

Analyzing PPC campaigns on Talabat.

Current Status:
• Campaign performance: Checking ROAS
• Keyword optimization: In progress

@atlas Here's my latest ad insight:
• Top performing SKUs
• ROAS by category
• Recommendations for budget allocation

Need more details?`;
    }
    return `📈 Alexis here.

I manage PPC campaigns on Talabat and analyze performance.

I report to @atlas with insights for planning.

What campaign data do you need?`;
  }
  
  return `${agentId} received your message: "${message}"

I can help you coordinate with the team. Try @athena for summary, or mention specific agents directly.`;
}
