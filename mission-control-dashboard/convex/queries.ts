import { query } from "./_generated/server";
import { v } from "convex/values";

// ============ MASTER_SKU ============

export const getMasterSku = query({
  handler: async (ctx) => {
    return await ctx.db.query("master_sku").collect();
  },
});

export const getMasterSkuByBarcode = query({
  args: { barcode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("master_sku")
      .withIndex("by_barcode", (q) => q.eq("barcode", args.barcode))
      .collect();
  },
});

export const getMasterSkuByBrand = query({
  args: { brand: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("master_sku")
      .withIndex("by_brand", (q) => q.eq("brand", args.brand))
      .collect();
  },
});

// ============ DAILY_STOCK_SNAPSHOT ============

export const getDailyStockSnapshotByDate = query({
  args: { report_date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("daily_stock_snapshot")
      .withIndex("by_date", (q) => q.eq("report_date", args.report_date))
      .collect();
  },
});

export const getLatestDailyStockSnapshot = query({
  handler: async (ctx) => {
    const all = await ctx.db
      .query("daily_stock_snapshot")
      .collect();
    if (all.length === 0) return [];
    
    // Get the latest date by comparing report_date strings
    const dates = [...new Set(all.map(item => item.report_date))];
    const latestDate = dates.sort().reverse()[0];
    
    // Return all records for the latest date
    return all.filter(item => item.report_date === latestDate);
  },
});

// Get ALL stock data across all dates (for cumulative SKU tracking)
export const getAllDailyStockSnapshot = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("daily_stock_snapshot")
      .collect();
  },
});

export const getDailyStockSnapshotByBarcodeWarehouse = query({
  args: { barcode: v.string(), warehouse_name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("daily_stock_snapshot")
      .withIndex("by_barcode_warehouse_date", (q) => 
        q.eq("barcode", args.barcode).eq("warehouse_name", args.warehouse_name))
      .collect();
  },
});

// ============ SELL_OUT_LOG ============

export const getSellOutLogByBarcode = query({
  args: { barcode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sell_out_log")
      .withIndex("by_barcode", (q) => q.eq("barcode", args.barcode))
      .collect();
  },
});

export const getSellOutLogByDate = query({
  args: { log_date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sell_out_log")
      .withIndex("by_date", (q) => q.eq("log_date", args.log_date))
      .collect();
  },
});

// ============ REPLENISHMENT_LOG ============

export const getReplenishmentLogByBarcode = query({
  args: { barcode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("replenishment_log")
      .withIndex("by_barcode", (q) => q.eq("barcode", args.barcode))
      .collect();
  },
});

export const getRecentReplenishmentLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("replenishment_log")
      .withIndex("by_date")
      .order("desc")
      .take(limit);
  },
});

// ============ LPO_TABLE ============

export const getLpoTable = query({
  handler: async (ctx) => {
    return await ctx.db.query("lpo_table").collect();
  },
});

export const getLpoTableByPoNumber = query({
  args: { po_number: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lpo_table")
      .withIndex("by_po_number", (q) => q.eq("po_number", args.po_number))
      .collect();
  },
});

// ============ LPO_LINE_ITEMS ============

export const getLpoLineItemsByPoNumber = query({
  args: { po_number: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lpo_line_items")
      .withIndex("by_po_number", (q) => q.eq("po_number", args.po_number))
      .collect();
  },
});

// ============ INVOICE_TABLE ============

export const getInvoiceTable = query({
  handler: async (ctx) => {
    return await ctx.db.query("invoice_table").collect();
  },
});

export const getInvoiceTableByPoNumber = query({
  args: { po_number: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invoice_table")
      .withIndex("by_po_number", (q) => q.eq("po_number", args.po_number))
      .collect();
  },
});

// ============ INVOICE_LINE_ITEMS ============

export const getInvoiceLineItemsByInvoiceNumber = query({
  args: { invoice_number: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invoice_line_items")
      .withIndex("by_invoice_number", (q) => q.eq("invoice_number", args.invoice_number))
      .collect();
  },
});

// ============ BRAND_PERFORMANCE ============

export const getBrandPerformance = query({
  handler: async (ctx) => {
    return await ctx.db.query("brand_performance").collect();
  },
});

export const getBrandPerformanceByYearMonth = query({
  args: { year: v.number(), month: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("brand_performance")
      .withIndex("by_year_month", (q) => 
        q.eq("year", args.year).eq("month", args.month))
      .collect();
  },
});

// ============ AGENT_EVENT_LOG ============

export const getAgentEventLog = query({
  handler: async (ctx) => {
    return await ctx.db.query("agent_event_log").collect();
  },
});

export const getAgentEventLogByAgent = query({
  args: { agent: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agent_event_log")
      .withIndex("by_agent", (q) => q.eq("agent", args.agent))
      .collect();
  },
});

export const getRecentAgentEvents = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("agent_event_log")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

// ============ MESSAGES ============

export const getMessages = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_timestamp")
      .order("asc")
      .collect();
  },
});

// ============ CALENDAR_EVENTS ============

export const getCalendarEvents = query({
  handler: async (ctx) => {
    return await ctx.db.query("calendar_events").collect();
  },
});

export const getCalendarEventsByDate = query({
  args: { event_date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("calendar_events")
      .withIndex("by_date", (q) => q.eq("event_date", args.event_date))
      .collect();
  },
});
