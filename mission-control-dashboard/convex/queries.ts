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

export const getBrandPerformanceWithFilters = query({
  args: {
    year: v.optional(v.number()),
    month: v.optional(v.number()),
    brand: v.optional(v.string()),
    customer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db.query("brand_performance").collect();
    
    if (args.year) {
      results = results.filter(r => r.year === args.year);
    }
    if (args.month) {
      results = results.filter(r => r.month === args.month);
    }
    if (args.brand) {
      results = results.filter(r => r.brand && r.brand === args.brand);
    }
    if (args.customer) {
      results = results.filter(r => r.customer && r.customer === args.customer);
    }
    
    return results;
  },
});

export const getBrandPerformanceMTD = query({
  handler: async (ctx) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const results = await ctx.db
      .query("brand_performance")
      .withIndex("by_year_month", (q) => 
        q.eq("year", year).eq("month", month))
      .collect();
    
    // Aggregate metrics
    const metrics = results.reduce((acc, r) => ({
      total_po_value: acc.total_po_value + (r.lpo_value_incl_vat || 0),
      total_sales: acc.total_sales + (r.invoiced_value_incl_vat || 0),
      total_gap: acc.total_gap + (r.gap_value || 0),
      total_commission: acc.total_commission + (r.commission_aed || 0),
      count: acc.count + 1,
    }), { total_po_value: 0, total_sales: 0, total_gap: 0, total_commission: 0, count: 0 });
    
    // Calculate weighted average service level
    const totalOrdered = results.reduce((sum, r) => sum + (r.lpo_value_incl_vat || 0), 0);
    const totalInvoiced = results.reduce((sum, r) => sum + (r.invoiced_value_incl_vat || 0), 0);
    const serviceLevel = totalOrdered > 0 ? (totalInvoiced / totalOrdered) * 100 : 0;
    
    return {
      year,
      month,
      ...metrics,
      service_level_pct: Math.round(serviceLevel * 100) / 100,
    };
  },
});

export const getBrandPerformanceYTD = query({
  handler: async (ctx) => {
    const now = new Date();
    const year = now.getFullYear();
    
    const all = await ctx.db.query("brand_performance").collect();
    const results = all.filter(r => r.year === year);
    
    // Aggregate metrics
    const metrics = results.reduce((acc, r) => ({
      total_po_value: acc.total_po_value + (r.lpo_value_incl_vat || 0),
      total_sales: acc.total_sales + (r.invoiced_value_incl_vat || 0),
      total_gap: acc.total_gap + (r.gap_value || 0),
      total_commission: acc.total_commission + (r.commission_aed || 0),
      count: acc.count + 1,
    }), { total_po_value: 0, total_sales: 0, total_gap: 0, total_commission: 0, count: 0 });
    
    // Calculate weighted average service level
    const totalOrdered = results.reduce((sum, r) => sum + (r.lpo_value_incl_vat || 0), 0);
    const totalInvoiced = results.reduce((sum, r) => sum + (r.invoiced_value_incl_vat || 0), 0);
    const serviceLevel = totalOrdered > 0 ? (totalInvoiced / totalOrdered) * 100 : 0;
    
    return {
      year,
      ...metrics,
      service_level_pct: Math.round(serviceLevel * 100) / 100,
    };
  },
});

// Get unique brands from LPO
export const getUniqueBrands = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("lpo_line_items").collect();
    const brands = [...new Set(all.map(r => r.brand).filter(Boolean))];
    return brands.sort();
  },
});

// Get unique customers from LPO
export const getUniqueCustomers = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("lpo_table").collect();
    const customers = [...new Set(all.map(r => r.customer).filter(Boolean))];
    return customers.sort();
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
      .withIndex("by_date", q.eq("event_date", args.event_date))
      .collect();
  },
});

// ============ KNOWLEDGE_BASE ============

export const getKnowledgeBase = query({
  handler: async (ctx) => {
    return await ctx.db.query("knowledge_base").collect();
  },
});

export const getKnowledgeBaseByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("knowledge_base")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
  },
});
