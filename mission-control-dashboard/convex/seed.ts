import { internalMutation, internalQuery } from "./_generated/server";

export const seedData = internalMutation({
  handler: async (ctx) => {
    // Clear existing data
    const existingTasks = await ctx.db.query("tasks").collect();
    for (const task of existingTasks) {
      await ctx.db.delete(task._id);
    }

    const existingPipeline = await ctx.db.query("pipeline_items").collect();
    for (const item of existingPipeline) {
      await ctx.db.delete(item._id);
    }

    const existingEvents = await ctx.db.query("calendar_events").collect();
    for (const event of existingEvents) {
      await ctx.db.delete(event._id);
    }

    const existingMemory = await ctx.db.query("memory_entries").collect();
    for (const entry of existingMemory) {
      await ctx.db.delete(entry._id);
    }

    const existingAgents = await ctx.db.query("agents").collect();
    for (const agent of existingAgents) {
      await ctx.db.delete(agent._id);
    }

    // Seed Agents
    await ctx.db.insert("agents", {
      name: "Athena",
      role: "CEO / Strategic Manager",
      status: "working",
      current_task: "Synthesizing daily insights from Talabat data",
      avatar: "👑",
      description: "Synthesizes insights, makes strategic decisions, communicates with human",
    });

    await ctx.db.insert("agents", {
      name: "Nexus",
      role: "Operations Manager",
      status: "working",
      current_task: "Processing Talabat SOH CSV for Mudhish brand",
      avatar: "⚡",
      description: "CSV processing, inventory tracking, velocity analysis, forecasting",
    });

    await ctx.db.insert("agents", {
      name: "Atlas",
      role: "Compliance & Quality",
      status: "checking",
      current_task: "Validating SKU compliance for 9 Mudhish products",
      avatar: "🛡️",
      description: "SKU validation, content compliance, data quality checks",
    });

    await ctx.db.insert("agents", {
      name: "Forge",
      role: "Infrastructure Developer",
      status: "building",
      current_task: "Building velocity calculator script",
      avatar: "🔨",
      description: "Builds tools, scripts, automations for other agents",
    });

    // Seed Tasks
    await ctx.db.insert("tasks", {
      title: "Process Talabat Daily SOH Report",
      description: "Download and process daily stock-on-hand CSV from Talabat for all Mudhish SKUs",
      assignee: "Nexus",
      status: "in_progress",
      priority: "high",
      deadline: "2026-02-19",
      type: "CSV Processing",
      createdAt: "2026-02-18",
    });

    await ctx.db.insert("tasks", {
      title: "Velocity Analysis - Mudhish SKUs",
      description: "Calculate 7-day moving average velocity for 9 SKUs across 49 darkstores",
      assignee: "Nexus",
      status: "recurring",
      priority: "high",
      deadline: "2026-02-19",
      type: "Inventory Analysis",
      createdAt: "2026-02-17",
    });

    await ctx.db.insert("tasks", {
      title: "OOS Risk Assessment",
      description: "Identify SKUs at risk of stockout based on velocity and current inventory",
      assignee: "Nexus",
      status: "backlog",
      priority: "medium",
      deadline: "2026-02-20",
      type: "Inventory Analysis",
      createdAt: "2026-02-18",
    });

    await ctx.db.insert("tasks", {
      title: "SKU Content Compliance Check",
      description: "Verify all Mudhish product listings comply with Talabat content guidelines",
      assignee: "Atlas",
      status: "review",
      priority: "medium",
      deadline: "2026-02-19",
      type: "Compliance Checks",
      createdAt: "2026-02-17",
    });

    await ctx.db.insert("tasks", {
      title: "Weekly Client Report - Mudhish",
      description: "Generate weekly performance report for Mudhish brand stakeholders",
      assignee: "Athena",
      status: "done",
      priority: "high",
      deadline: "2026-02-18",
      type: "Client Reports",
      createdAt: "2026-02-15",
    });

    // Seed Pipeline Items
    await ctx.db.insert("pipeline_items", {
      name: "Process Talabat SOH CSV for Mudhish brand",
      current_stage: "Processing",
      agent: "Nexus",
      time_in_stage: "15 minutes",
      blockers: "",
      metadata: { sku_count: 9, darkstores: 49 },
      createdAt: "2026-02-19",
    });

    await ctx.db.insert("pipeline_items", {
      name: "Velocity analysis for 9 SKUs across 49 darkstores",
      current_stage: "Analysis",
      agent: "Nexus",
      time_in_stage: "45 minutes",
      blockers: "",
      metadata: { completed_stores: 32, remaining: 17 },
      createdAt: "2026-02-19",
    });

    await ctx.db.insert("pipeline_items", {
      name: "OOS risk report for Mudhish client",
      current_stage: "Quality Check",
      agent: "Atlas",
      time_in_stage: "10 minutes",
      blockers: "",
      metadata: { at_risk_skus: 2, critical: 0 },
      createdAt: "2026-02-19",
    });

    // Seed Calendar Events
    const today = "2026-02-19";
    const tomorrow = "2026-02-20";

    await ctx.db.insert("calendar_events", {
      title: "Daily CSV Processing",
      date: today,
      time: "06:00",
      agent: "Nexus",
      type: "csv",
      recurring: true,
      description: "Process Talabat daily SOH report",
    });

    await ctx.db.insert("calendar_events", {
      title: "Compliance Checks",
      date: today,
      time: "07:30",
      agent: "Atlas",
      type: "compliance",
      recurring: true,
      description: "Daily compliance validation",
    });

    await ctx.db.insert("calendar_events", {
      title: "Velocity Reports",
      date: today,
      time: "08:00",
      agent: "Nexus",
      type: "analysis",
      recurring: true,
      description: "Generate daily velocity reports",
    });

    await ctx.db.insert("calendar_events", {
      title: "Daily Briefing",
      date: today,
      time: "09:00",
      agent: "Athena",
      type: "meeting",
      recurring: true,
      description: "Daily operations briefing",
    });

    await ctx.db.insert("calendar_events", {
      title: "Weekly Client Briefing - Mudhish",
      date: "2026-02-23",
      time: "10:00",
      agent: "Athena",
      type: "meeting",
      recurring: false,
      description: "Weekly performance review with Mudhish team",
    });

    // Seed Memory Entries
    await ctx.db.insert("memory_entries", {
      content: "Mudhish brand strategy: Focus on 9 core SKUs (chips/snacks). Priority is maintaining availability across all 49 Talabat darkstores. Velocity trends show increased demand on weekends.",
      brand: "Mudhish",
      platform: "Talabat",
      agent: "Athena",
      topic: "strategy",
      createdAt: "2026-02-15",
    });

    await ctx.db.insert("memory_entries", {
      content: "Talabat API credentials: Connected. Daily SOH CSV available at 05:00 GST. Darkstore list includes all 49 locations in UAE. Format: SKU, warehouse, quantity.",
      brand: "Mudhish",
      platform: "Talabat",
      agent: "Nexus",
      topic: "platform",
      createdAt: "2026-02-14",
    });

    await ctx.db.insert("memory_entries", {
      content: "Compliance rules: All food items must have expiry date > 30 days. Packaging must include Arabic translations. Max 5 product images. Nutritional info required for all snacks.",
      brand: "Mudhish",
      platform: "Talabat",
      agent: "Atlas",
      topic: "compliance",
      createdAt: "2026-02-14",
    });

    await ctx.db.insert("memory_entries", {
      content: "Velocity calculation: 7-day moving average. Formula: sum(last 7 days sales) / 7. Update daily at 08:00. SKUs with velocity > 50 units/day require priority restocking.",
      brand: "Mudhish",
      platform: "Talabat",
      agent: "Nexus",
      topic: "analysis",
      createdAt: "2026-02-16",
    });

    await ctx.db.insert("memory_entries", {
      content: "OOS threshold: If current stock < (velocity * 3 days), flag as at-risk. Critical if < (velocity * 1 day). Immediate alert to Athena for critical items.",
      brand: "Mudhish",
      platform: "Talabat",
      agent: "Nexus",
      topic: "operations",
      createdAt: "2026-02-16",
    });

    await ctx.db.insert("memory_entries", {
      content: "Future expansion: Planning to add 3 more brands (Roast, TeaTime, QuickBites) in Q2 2026. Will scale to 4 platforms (Talabat, Noon, Careem, Amazon). Team structure supports up to 40 brands.",
      brand: "All",
      platform: "All",
      agent: "Athena",
      topic: "expansion",
      createdAt: "2026-02-10",
    });

    // Seed Messages
    await ctx.db.insert("messages", {
      content: "Morning team! Starting daily CSV processing now. Should have SOH data by 6:15 AM.",
      agent: "Nexus",
      mentions: [],
      createdAt: "2026-02-19 06:00",
    });

    await ctx.db.insert("messages", {
      content: "@Atlas please run compliance check on the new SKU batch when you get a chance. 5 new items need verification.",
      agent: "Nexus",
      mentions: ["Atlas"],
      createdAt: "2026-02-19 06:30",
    });

    await ctx.db.insert("messages", {
      content: "On it! Starting now. Will flag any issues for your review.",
      agent: "Atlas",
      mentions: [],
      createdAt: "2026-02-19 06:35",
    });

    await ctx.db.insert("messages", {
      content: "Velocity analysis update: 3 SKUs showing increased demand this week. @Athena should we adjust reorder thresholds?",
      agent: "Nexus",
      mentions: ["Athena"],
      createdAt: "2026-02-19 08:15",
    });

    await ctx.db.insert("messages", {
      content: "Good catch @Nexus. Yes, bump threshold to 1.5x for those 3 SKUs. Let's be proactive this week.",
      agent: "Athena",
      mentions: ["Nexus"],
      createdAt: "2026-02-19 08:22",
    });

    await ctx.db.insert("messages", {
      content: "I've built a new script for OOS risk calculations. Running first test now. Will share results shortly.",
      agent: "Forge",
      mentions: [],
      createdAt: "2026-02-19 09:00",
    });

    await ctx.db.insert("messages", {
      content: "Compliance check complete. All 5 new SKUs pass. Ready for listing on Talabat.",
      agent: "Atlas",
      mentions: [],
      createdAt: "2026-02-19 07:45",
    });

    await ctx.db.insert("messages", {
      content: "Weekly briefing scheduled for 10 AM Sunday with Mudhish team. Please have your sections ready by Saturday EOD.",
      agent: "Athena",
      mentions: [],
      createdAt: "2026-02-19 09:30",
    });
  },
});

export const getTasks = internalQuery({
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const getPipelineItems = internalQuery({
  handler: async (ctx) => {
    return await ctx.db.query("pipeline_items").collect();
  },
});

export const getCalendarEvents = internalQuery({
  handler: async (ctx) => {
    return await ctx.db.query("calendar_events").collect();
  },
});

export const getMemoryEntries = internalQuery({
  handler: async (ctx) => {
    return await ctx.db.query("memory_entries").collect();
  },
});

export const getAgents = internalQuery({
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

export const getMessages = internalQuery({
  handler: async (ctx) => {
    const messages = await ctx.db.query("messages").order("desc").take(100);
    return messages.reverse();
  },
});
