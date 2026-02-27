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

export const getLpoLineItemsTable = query({
  handler: async (ctx) => {
    return await ctx.db.query("lpo_line_items").collect();
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
    // Get all LPO line items
    const lineItems = await ctx.db.query("lpo_line_items").collect();
    // Get all LPO headers
    const lpoHeaders = await ctx.db.query("lpo_table").collect();
    
    // Create a map of po_number -> lpo_header
    const lpoMap = new Map();
    for (const lpo of lpoHeaders) {
      lpoMap.set(lpo.po_number, lpo);
    }
    
    // Merge data from lpo_table + lpo_line_items
    const results = [];
    for (const item of lineItems) {
      const lpo = lpoMap.get(item.po_number);
      if (!lpo) continue;
      
      // Parse order_date to get year and month
      // Use invoice_date for year and month (when the sale actually happened)
      const invoiceDate = item.invoice_date ? new Date(item.invoice_date) : new Date();
      const year = invoiceDate.getFullYear();
      const month = invoiceDate.getMonth() + 1;
      
      const qtyOrdered = item.quantity_ordered || 0;
      const qtyDelivered = item.quantity_delivered || 0;
      const gapValue = qtyOrdered - qtyDelivered;
      const serviceLevelPct = qtyOrdered > 0 ? (qtyDelivered / qtyOrdered) * 100 : 0;
      
      const commissionPct = lpo.commission_pct || 0;
      const totalInclVatInvoiced = item.total_incl_vat_invoiced || 0;
      const commissionAed = totalInclVatInvoiced * (commissionPct / 100);
      
      results.push({
        _id: item._id,
        year,
        month,
        po_number: item.po_number,
        po_date: lpo.order_date || "",
        customer: lpo.customer || "",
        brand: item.brand || "",
        client: item.client || "",
        invoice_number: item.invoice_number || "",
        invoice_date: item.invoice_date || "",
        barcode: item.barcode,
        product_name: item.product_name,
        quantity_ordered: qtyOrdered,
        quantity_delivered: qtyDelivered,
        unit_cost: item.unit_cost || 0,
        lpo_value_excl_vat: item.amount_excl_vat || 0,
        lpo_value_incl_vat: item.amount_incl_vat || 0,
        invoiced_value_excl_vat: item.amount_invoiced || 0,
        invoiced_value_incl_vat: item.amount_invoiced ? item.amount_invoiced * 1.05 : 0,
        vat_amount_invoiced: item.vat_amount_invoiced || 0,
        total_incl_vat_invoiced: totalInclVatInvoiced,
        gap_value: gapValue,
        service_level_pct: Math.round(serviceLevelPct * 100) / 100,
        commission_pct: commissionPct,
        commission_aed: Math.round(commissionAed * 100) / 100,
        match_status: Math.abs(gapValue) <= 2 ? "MATCHED" : "DISCREPANCY",
      });
    }
    
    return results;
  },
});

export const getBrandPerformanceByYearMonth = query({
  args: { year: v.number(), month: v.number() },
  handler: async (ctx, args) => {
    // Get all LPO line items
    const lineItems = await ctx.db.query("lpo_line_items").collect();
    // Get all LPO headers
    const lpoHeaders = await ctx.db.query("lpo_table").collect();
    
    // Create a map of po_number -> lpo_header
    const lpoMap = new Map();
    for (const lpo of lpoHeaders) {
      lpoMap.set(lpo.po_number, lpo);
    }
    
    // Merge and filter by year/month
    const results = [];
    for (const item of lineItems) {
      const lpo = lpoMap.get(item.po_number);
      if (!lpo) continue;
      
      // Parse order_date to get year and month
      const invoiceDate = item.invoice_date ? new Date(item.invoice_date) : new Date();
      const itemYear = invoiceDate.getFullYear();
      const itemMonth = invoiceDate.getMonth() + 1;
      
      // Filter by requested year/month
      if (itemYear !== args.year || itemMonth !== args.month) continue;
      
      const qtyOrdered = item.quantity_ordered || 0;
      const qtyDelivered = item.quantity_delivered || 0;
      const gapValue = qtyOrdered - qtyDelivered;
      const serviceLevelPct = qtyOrdered > 0 ? (qtyDelivered / qtyOrdered) * 100 : 0;
      
      const commissionPct = lpo.commission_pct || 0;
      const totalInclVatInvoiced = item.total_incl_vat_invoiced || 0;
      const commissionAed = totalInclVatInvoiced * (commissionPct / 100);
      
      results.push({
        _id: item._id,
        year: itemYear,
        month: itemMonth,
        po_number: item.po_number,
        po_date: lpo.order_date || "",
        customer: lpo.customer || "",
        brand: item.brand || "",
        client: item.client || "",
        invoice_number: item.invoice_number || "",
        invoice_date: item.invoice_date || "",
        barcode: item.barcode,
        product_name: item.product_name,
        quantity_ordered: qtyOrdered,
        quantity_delivered: qtyDelivered,
        unit_cost: item.unit_cost || 0,
        lpo_value_excl_vat: item.amount_excl_vat || 0,
        lpo_value_incl_vat: item.amount_incl_vat || 0,
        invoiced_value_excl_vat: item.amount_invoiced || 0,
        invoiced_value_incl_vat: item.amount_invoiced ? item.amount_invoiced * 1.05 : 0,
        vat_amount_invoiced: item.vat_amount_invoiced || 0,
        total_incl_vat_invoiced: totalInclVatInvoiced,
        gap_value: gapValue,
        service_level_pct: Math.round(serviceLevelPct * 100) / 100,
        commission_pct: commissionPct,
        commission_aed: Math.round(commissionAed * 100) / 100,
        match_status: Math.abs(gapValue) <= 2 ? "MATCHED" : "DISCREPANCY",
      });
    }
    
    return results;
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
    // Get all LPO line items
    const lineItems = await ctx.db.query("lpo_line_items").collect();
    // Get all LPO headers
    const lpoHeaders = await ctx.db.query("lpo_table").collect();
    
    // Create a map of po_number -> lpo_header
    const lpoMap = new Map();
    for (const lpo of lpoHeaders) {
      lpoMap.set(lpo.po_number, lpo);
    }
    
    // Merge and filter
    const results = [];
    for (const item of lineItems) {
      const lpo = lpoMap.get(item.po_number);
      if (!lpo) continue;
      
      // Parse order_date to get year and month
      const invoiceDate = item.invoice_date ? new Date(item.invoice_date) : new Date();
      const itemYear = invoiceDate.getFullYear();
      const itemMonth = invoiceDate.getMonth() + 1;
      
      // Apply filters
      if (args.year && itemYear !== args.year) continue;
      if (args.month && itemMonth !== args.month) continue;
      if (args.brand && item.brand !== args.brand) continue;
      if (args.customer && lpo.customer !== args.customer) continue;
      
      const qtyOrdered = item.quantity_ordered || 0;
      const qtyDelivered = item.quantity_delivered || 0;
      const gapValue = qtyOrdered - qtyDelivered;
      const serviceLevelPct = qtyOrdered > 0 ? (qtyDelivered / qtyOrdered) * 100 : 0;
      
      const commissionPct = lpo.commission_pct || 0;
      const totalInclVatInvoiced = item.total_incl_vat_invoiced || 0;
      const commissionAed = totalInclVatInvoiced * (commissionPct / 100);
      
      results.push({
        _id: item._id,
        year: itemYear,
        month: itemMonth,
        po_number: item.po_number,
        po_date: lpo.order_date || "",
        customer: lpo.customer || "",
        brand: item.brand || "",
        client: item.client || "",
        invoice_number: item.invoice_number || "",
        invoice_date: item.invoice_date || "",
        barcode: item.barcode,
        product_name: item.product_name,
        quantity_ordered: qtyOrdered,
        quantity_delivered: qtyDelivered,
        unit_cost: item.unit_cost || 0,
        lpo_value_excl_vat: item.amount_excl_vat || 0,
        lpo_value_incl_vat: item.amount_incl_vat || 0,
        invoiced_value_excl_vat: item.amount_invoiced || 0,
        invoiced_value_incl_vat: item.amount_invoiced ? item.amount_invoiced * 1.05 : 0,
        vat_amount_invoiced: item.vat_amount_invoiced || 0,
        total_incl_vat_invoiced: totalInclVatInvoiced,
        gap_value: gapValue,
        service_level_pct: Math.round(serviceLevelPct * 100) / 100,
        commission_pct: commissionPct,
        commission_aed: Math.round(commissionAed * 100) / 100,
        match_status: Math.abs(gapValue) <= 2 ? "MATCHED" : "DISCREPANCY",
      });
    }
    
    return results;
  },
});

export const getBrandPerformanceMTD = query({
  handler: async (ctx) => {
    const now = new Date();
    const targetYear = now.getFullYear();
    const targetMonth = now.getMonth() + 1;
    
    // Get all LPO line items
    const lineItems = await ctx.db.query("lpo_line_items").collect();
    // Get all LPO headers
    const lpoHeaders = await ctx.db.query("lpo_table").collect();
    
    // Create a map of po_number -> lpo_header
    const lpoMap = new Map();
    for (const lpo of lpoHeaders) {
      lpoMap.set(lpo.po_number, lpo);
    }
    
    // Filter for current month
    const results = [];
    for (const item of lineItems) {
      const lpo = lpoMap.get(item.po_number);
      if (!lpo) continue;
      
      const invoiceDate = item.invoice_date ? new Date(item.invoice_date) : new Date();
      const itemYear = invoiceDate.getFullYear();
      const itemMonth = invoiceDate.getMonth() + 1;
      
      if (itemYear === targetYear && itemMonth === targetMonth) {
        results.push({
          lpo_value_incl_vat: item.amount_incl_vat || 0,
          invoiced_value_incl_vat: item.total_incl_vat_invoiced || 0,
          gap_value: (item.quantity_ordered || 0) - (item.quantity_delivered || 0),
          commission_pct: lpo.commission_pct || 0,
          total_incl_vat_invoiced: item.total_incl_vat_invoiced || 0,
        });
      }
    }
    
    // Aggregate metrics
    const metrics = results.reduce((acc, r) => ({
      total_po_value: acc.total_po_value + r.lpo_value_incl_vat,
      total_sales: acc.total_sales + r.invoiced_value_incl_vat,
      total_gap: acc.total_gap + r.gap_value,
      total_commission: acc.total_commission + (r.total_incl_vat_invoiced * r.commission_pct / 100),
      count: acc.count + 1,
    }), { total_po_value: 0, total_sales: 0, total_gap: 0, total_commission: 0, count: 0 });
    
    // Calculate weighted average service level
    const serviceLevel = metrics.total_po_value > 0 ? (metrics.total_sales / metrics.total_po_value) * 100 : 0;
    
    return {
      year: targetYear,
      month: targetMonth,
      ...metrics,
      service_level_pct: Math.round(serviceLevel * 100) / 100,
    };
  },
});

export const getBrandPerformanceYTD = query({
  handler: async (ctx) => {
    const now = new Date();
    const targetYear = now.getFullYear();
    
    // Get all LPO line items
    const lineItems = await ctx.db.query("lpo_line_items").collect();
    // Get all LPO headers
    const lpoHeaders = await ctx.db.query("lpo_table").collect();
    
    // Create a map of po_number -> lpo_header
    const lpoMap = new Map();
    for (const lpo of lpoHeaders) {
      lpoMap.set(lpo.po_number, lpo);
    }
    
    // Filter for current year
    const results = [];
    for (const item of lineItems) {
      const lpo = lpoMap.get(item.po_number);
      if (!lpo) continue;
      
      const orderDate = lpo.order_date ? new Date(lpo.order_date) : new Date();
      const itemYear = orderDate.getFullYear();
      
      if (itemYear === targetYear) {
        results.push({
          lpo_value_incl_vat: item.amount_incl_vat || 0,
          invoiced_value_incl_vat: item.total_incl_vat_invoiced || 0,
          gap_value: (item.quantity_ordered || 0) - (item.quantity_delivered || 0),
          commission_pct: lpo.commission_pct || 0,
          total_incl_vat_invoiced: item.total_incl_vat_invoiced || 0,
        });
      }
    }
    
    // Aggregate metrics
    const metrics = results.reduce((acc, r) => ({
      total_po_value: acc.total_po_value + r.lpo_value_incl_vat,
      total_sales: acc.total_sales + r.invoiced_value_incl_vat,
      total_gap: acc.total_gap + r.gap_value,
      total_commission: acc.total_commission + (r.total_incl_vat_invoiced * r.commission_pct / 100),
      count: acc.count + 1,
    }), { total_po_value: 0, total_sales: 0, total_gap: 0, total_commission: 0, count: 0 });
    
    // Calculate weighted average service level
    const serviceLevel = metrics.total_po_value > 0 ? (metrics.total_sales / metrics.total_po_value) * 100 : 0;
    
    return {
      year: targetYear,
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
      .withIndex("by_date", (q) => q.eq("event_date", args.event_date))
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

// ============ USERS ============

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// ============ LPO QUERIES ============

export const getLpoById = query({
  args: { lpoId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.lpoId as any);
  },
});

// ============ TASK QUERIES ============

export const getAllTasks = query({
  handler: async (ctx) => {
    return await ctx.db.query("tasks").order("desc").collect();
  },
});

export const getTasksByStatus = query({
  args: { status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled")) },
  handler: async (ctx, args) => {
    return await ctx.db.query("tasks")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  },
});

export const getTasksByAgent = query({
  args: { agent: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("tasks")
      .withIndex("by_assigned", (q) => q.eq("assigned_to", args.agent))
      .order("desc")
      .collect();
  },
});

export const getPendingTasks = query({
  handler: async (ctx) => {
    return await ctx.db.query("tasks")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();
  },
});
