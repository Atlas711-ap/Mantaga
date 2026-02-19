import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    assignee: v.string(),
    status: v.string(),
    priority: v.string(),
    deadline: v.string(),
    type: v.string(),
    createdAt: v.string(),
  }),

  pipeline_items: defineTable({
    name: v.string(),
    current_stage: v.string(),
    agent: v.string(),
    time_in_stage: v.string(),
    blockers: v.string(),
    metadata: v.any(),
    createdAt: v.string(),
  }),

  calendar_events: defineTable({
    title: v.string(),
    date: v.string(),
    time: v.string(),
    agent: v.string(),
    type: v.string(),
    recurring: v.boolean(),
    description: v.string(),
  }),

  memory_entries: defineTable({
    content: v.string(),
    brand: v.string(),
    platform: v.string(),
    agent: v.string(),
    topic: v.string(),
    createdAt: v.string(),
  }),

  agents: defineTable({
    name: v.string(),
    role: v.string(),
    status: v.string(),
    current_task: v.string(),
    avatar: v.string(),
    description: v.string(),
  }),

  messages: defineTable({
    content: v.string(),
    agent: v.string(),
    mentions: v.array(v.string()),
    threadId: v.optional(v.string()),
    createdAt: v.string(),
  }),
});
