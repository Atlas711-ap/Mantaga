import { mutation, query } from "./_generated/server";

export const seedData = mutation({
  handler: async (ctx) => {
    // Seed messages
    await ctx.db.insert("messages", {
      sender: "System",
      sender_type: "system",
      content: "System initialized — all agents online",
      timestamp: new Date().toISOString(),
      is_system_message: true,
    });

    // Seed calendar events
    await ctx.db.insert("calendar_events", {
      title: "Daily CSV Processing",
      event_date: new Date().toISOString().split("T")[0],
      notes: "Automated daily stock report processing",
      created_by: "Nexus",
    });
  },
});

export const getMessages = query({
  handler: async (ctx) => {
    return await ctx.db.query("messages").order("desc").take(100);
  },
});

export const getCalendarEvents = query({
  handler: async (ctx) => {
    return await ctx.db.query("calendar_events").collect();
  },
});
