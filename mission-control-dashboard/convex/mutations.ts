import { mutation } from "./_generated/server";
import { v } from "convex/values";

// ============ MASTER_SKU ============

export const insertMasterSku = mutation({
  args: {
    client: v.string(),
    brand: v.string(),
    barcode: v.string(),
    sku_name: v.string(),
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    case_pack: v.optional(v.number()),
    shelf_life: v.optional(v.string()),
    nutrition_info: v.optional(v.string()),
    ingredients_info: v.optional(v.string()),
    amazon_asin: v.optional(v.string()),
    talabat_sku: v.optional(v.string()),
    noon_zsku: v.optional(v.string()),
    careem_code: v.optional(v.string()),
    client_sellin_price: v.optional(v.number()),
    mantaga_commission_pct: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("master_sku", args);
  },
});

export const updateMasterSkuById = mutation({
  args: {
    id: v.id("master_sku"),
    client: v.optional(v.string()),
    brand: v.optional(v.string()),
    barcode: v.optional(v.string()),
    sku_name: v.optional(v.string()),
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    case_pack: v.optional(v.number()),
    shelf_life: v.optional(v.string()),
    nutrition_info: v.optional(v.string()),
    ingredients_info: v.optional(v.string()),
    amazon_asin: v.optional(v.string()),
    talabat_sku: v.optional(v.string()),
    noon_zsku: v.optional(v.string()),
    careem_code: v.optional(v.string()),
    client_sellin_price: v.optional(v.number()),
    mantaga_commission_pct: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const bulkUpsertMasterSku = mutation({
  args: {
    skus: v.array(v.object({
      client: v.string(),
      brand: v.string(),
      barcode: v.string(),
      sku_name: v.string(),
      category: v.optional(v.string()),
      subcategory: v.optional(v.string()),
      case_pack: v.optional(v.number()),
      shelf_life: v.optional(v.string()),
      nutrition_info: v.optional(v.string()),
      ingredients_info: v.optional(v.string()),
      amazon_asin: v.optional(v.string()),
      talabat_sku: v.optional(v.string()),
      noon_zsku: v.optional(v.string()),
      careem_code: v.optional(v.string()),
      client_sellin_price: v.optional(v.number()),
      mantaga_commission_pct: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    let inserted = 0;
    let updated = 0;
    
    for (const sku of args.skus) {
      const existing = await ctx.db
        .query("master_sku")
        .withIndex("by_barcode", (q) => q.eq("barcode", sku.barcode))
        .first();
      
      if (existing) {
        // Update only empty fields
        const updates: Record<string, any> = {};
        if (!existing.client && sku.client) updates.client = sku.client;
        if (!existing.brand && sku.brand) updates.brand = sku.brand;
        if (!existing.sku_name && sku.sku_name) updates.sku_name = sku.sku_name;
        if (!existing.category && sku.category) updates.category = sku.category;
        if (!existing.subcategory && sku.subcategory) updates.subcategory = sku.subcategory;
        if (!existing.case_pack && sku.case_pack) updates.case_pack = sku.case_pack;
        if (!existing.shelf_life && sku.shelf_life) updates.shelf_life = sku.shelf_life;
        if (!existing.nutrition_info && sku.nutrition_info) updates.nutrition_info = sku.nutrition_info;
        if (!existing.ingredients_info && sku.ingredients_info) updates.ingredients_info = sku.ingredients_info;
        if (!existing.amazon_asin && sku.amazon_asin) updates.amazon_asin = sku.amazon_asin;
        if (!existing.talabat_sku && sku.talabat_sku) updates.talabat_sku = sku.talabat_sku;
        if (!existing.noon_zsku && sku.noon_zsku) updates.noon_zsku = sku.noon_zsku;
        if (!existing.careem_code && sku.careem_code) updates.careem_code = sku.careem_code;
        if (!existing.client_sellin_price && sku.client_sellin_price) updates.client_sellin_price = sku.client_sellin_price;
        
        if (Object.keys(updates).length > 0) {
          await ctx.db.patch(existing._id, updates);
          updated++;
        }
      } else {
        await ctx.db.insert("master_sku", sku);
        inserted++;
      }
    }
    
    return { inserted, updated };
  },
});

// ============ DAILY_STOCK_SNAPSHOT ============

export const insertDailyStockSnapshot = mutation({
  args: {
    report_date: v.string(),
    sku_id: v.string(),
    barcode: v.string(),
    product_name: v.string(),
    warehouse_name: v.string(),
    warehouse_type: v.string(),
    stock_on_hand: v.number(),
    putaway_reserved_qty: v.number(),
    effective_stock: v.number(),
  },
  handler: async (ctx, args) => {
    // Check for duplicate by barcode + warehouse + date
    const existing = await ctx.db
      .query("daily_stock_snapshot")
      .withIndex("by_barcode_warehouse_date", (q) =>
        q.eq("barcode", args.barcode)
         .eq("warehouse_name", args.warehouse_name)
         .eq("report_date", args.report_date)
      )
      .first();
    
    if (existing) {
      throw new Error("DUPLICATE_ENTRY");
    }
    
    return await ctx.db.insert("daily_stock_snapshot", args);
  },
});

// ============ SELL_OUT_LOG ============

export const insertSellOutLog = mutation({
  args: {
    log_date: v.string(),
    barcode: v.string(),
    product_name: v.string(),
    warehouse_name: v.string(),
    estimated_units_sold: v.number(),
    calculation_method: v.string(),
    prev_stock: v.number(),
    current_stock: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sell_out_log", args);
  },
});

// ============ REPLENISHMENT_LOG ============

export const insertReplenishmentLog = mutation({
  args: {
    replenishment_date: v.string(),
    barcode: v.string(),
    product_name: v.string(),
    warehouse_name: v.string(),
    prev_stock: v.number(),
    new_stock: v.number(),
    estimated_replenishment_qty: v.number(),
    days_since_last_replenishment: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("replenishment_log", args);
  },
});

// ============ LPO_TABLE ============

export const insertLpoTable = mutation({
  args: {
    po_number: v.string(),
    order_date: v.string(),
    delivery_date: v.string(),
    supplier: v.string(),
    delivery_location: v.string(),
    total_excl_vat: v.number(),
    total_vat: v.number(),
    total_incl_vat: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("lpo_table", args);
  },
});

// ============ LPO_LINE_ITEMS ============

export const insertLpoLineItems = mutation({
  args: {
    po_number: v.string(),
    barcode: v.string(),
    product_name: v.string(),
    quantity_ordered: v.number(),
    unit_cost: v.number(),
    amount_excl_vat: v.number(),
    vat_pct: v.number(),
    vat_amount: v.number(),
    amount_incl_vat: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("lpo_line_items", args);
  },
});

// ============ INVOICE_TABLE ============

export const insertInvoiceTable = mutation({
  args: {
    invoice_number: v.string(),
    invoice_date: v.string(),
    po_number: v.string(),
    customer: v.string(),
    subtotal: v.number(),
    vat_amount: v.number(),
    grand_total: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("invoice_table", args);
  },
});

// ============ INVOICE_LINE_ITEMS ============

export const insertInvoiceLineItems = mutation({
  args: {
    invoice_number: v.string(),
    po_number: v.string(),
    barcode: v.string(),
    product_name: v.string(),
    expiry_date: v.optional(v.string()),
    unit_rate: v.number(),
    quantity_invoiced: v.number(),
    taxable_amount: v.number(),
    vat_amount: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("invoice_line_items", args);
  },
});

// ============ BRAND_PERFORMANCE ============

export const insertBrandPerformance = mutation({
  args: {
    year: v.number(),
    month: v.number(),
    po_number: v.string(),
    po_date: v.string(),
    invoice_number: v.string(),
    invoice_date: v.string(),
    lpo_value_excl_vat: v.number(),
    lpo_value_incl_vat: v.number(),
    invoiced_value_excl_vat: v.number(),
    invoiced_value_incl_vat: v.number(),
    gap_value: v.number(),
    service_level_pct: v.number(),
    commission_aed: v.number(),
    match_status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("brand_performance", args);
  },
});

// ============ AGENT_EVENT_LOG ============

export const insertAgentEventLog = mutation({
  args: {
    agent: v.string(),
    event_type: v.string(),
    description: v.string(),
    timestamp: v.string(),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agent_event_log", args);
  },
});

// ============ MESSAGES ============

export const insertMessage = mutation({
  args: {
    sender: v.string(),
    sender_type: v.string(),
    content: v.string(),
    timestamp: v.string(),
    mention: v.optional(v.string()),
    is_system_message: v.boolean(),
    attachment_name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", args);
  },
});

// ============ CALENDAR_EVENTS ============

export const insertCalendarEvent = mutation({
  args: {
    title: v.string(),
    event_date: v.string(),
    notes: v.optional(v.string()),
    created_by: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("calendar_events", args);
  },
});

export const deleteCalendarEvent = mutation({
  args: { id: v.id("calendar_events") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
