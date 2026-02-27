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
    amazon_ptt: v.optional(v.number()),
    talabat_ptt: v.optional(v.number()),
    noon_ptt: v.optional(v.number()),
    careem_ptt: v.optional(v.number()),
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
    amazon_ptt: v.optional(v.number()),
    talabat_ptt: v.optional(v.number()),
    noon_ptt: v.optional(v.number()),
    careem_ptt: v.optional(v.number()),
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
      amazon_ptt: v.optional(v.number()),
      talabat_ptt: v.optional(v.number()),
      noon_ptt: v.optional(v.number()),
      careem_ptt: v.optional(v.number()),
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
        if (!existing.amazon_ptt && sku.amazon_ptt) updates.amazon_ptt = sku.amazon_ptt;
        if (!existing.talabat_ptt && sku.talabat_ptt) updates.talabat_ptt = sku.talabat_ptt;
        if (!existing.noon_ptt && sku.noon_ptt) updates.noon_ptt = sku.noon_ptt;
        if (!existing.careem_ptt && sku.careem_ptt) updates.careem_ptt = sku.careem_ptt;
        if (!existing.mantaga_commission_pct && sku.mantaga_commission_pct) updates.mantaga_commission_pct = sku.mantaga_commission_pct;
        
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

export const upsertDailyStockSnapshot = mutation({
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
    // Check if record exists for this barcode + warehouse + date combination
    const existing = await ctx.db
      .query("daily_stock_snapshot")
      .withIndex("by_barcode_warehouse_date", (q) =>
        q.eq("barcode", args.barcode)
         .eq("warehouse_name", args.warehouse_name)
         .eq("report_date", args.report_date)
      )
      .first();
    
    if (existing) {
      // Update existing record with new stock values
      await ctx.db.patch(existing._id, {
        stock_on_hand: args.stock_on_hand,
        putaway_reserved_qty: args.putaway_reserved_qty,
        effective_stock: args.effective_stock,
        product_name: args.product_name,
      });
      return { action: "updated", id: existing._id };
    } else {
      // Insert new record
      const id = await ctx.db.insert("daily_stock_snapshot", args);
      return { action: "inserted", id };
    }
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
    customer: v.string(),
    brand: v.optional(v.string()),
    client: v.optional(v.string()),
    total_excl_vat: v.number(),
    total_vat: v.number(),
    total_incl_vat: v.number(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if LPO already exists
    const existing = await ctx.db
      .query("lpo_table")
      .withIndex("by_po_number", (q) => q.eq("po_number", args.po_number))
      .first();
    
    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, args);
      return { action: "updated", id: existing._id };
    }
    
    // Insert new
    const id = await ctx.db.insert("lpo_table", args);
    return { action: "inserted", id };
  },
});

// ============ LPO_LINE_ITEMS ============

export const insertLpoLineItems = mutation({
  args: {
    po_number: v.string(),
    barcode: v.string(),
    product_name: v.string(),
    brand: v.optional(v.string()),
    client: v.optional(v.string()),
    quantity_ordered: v.number(),
    quantity_delivered: v.optional(v.number()),
    unit_cost: v.number(),
    amount_excl_vat: v.number(),
    vat_pct: v.number(),
    vat_amount: v.number(),
    amount_incl_vat: v.number(),
    invoice_number: v.optional(v.string()),
    invoice_date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Try to match barcode to master_sku for brand/client
    let brand = args.brand;
    let client = args.client;
    
    // Strip leading zeros from barcode for matching
    const normalizedBarcode = args.barcode.replace(/^0+/, '');
    
    if (!brand || !client) {
      // Try exact match first
      let sku = await ctx.db
        .query("master_sku")
        .withIndex("by_barcode", (q) => q.eq("barcode", args.barcode))
        .first();
      
      // If no exact match, try normalized
      if (!sku) {
        sku = await ctx.db
          .query("master_sku")
          .withIndex("by_barcode", (q) => q.eq("barcode", normalizedBarcode))
          .first();
      }
      
      // Try with leading zero added
      if (!sku) {
        sku = await ctx.db
          .query("master_sku")
          .withIndex("by_barcode", (q) => q.eq("barcode", "0" + normalizedBarcode))
          .first();
      }
      
      if (sku) {
        brand = brand || sku.brand;
        client = client || sku.client;
      }
    }
    
    // Check if line item already exists
    const existing = await ctx.db
      .query("lpo_line_items")
      .withIndex("by_po_number", (q) => q.eq("po_number", args.po_number))
      .filter((q) => q.eq(q.field("barcode"), args.barcode))
      .first();
    
    const itemData = { ...args, brand, client };
    
    if (existing) {
      await ctx.db.patch(existing._id, itemData);
      return { action: "updated", id: existing._id };
    }
    
    const id = await ctx.db.insert("lpo_line_items", itemData);
    return { action: "inserted", id };
  },
});

// Update LPO line item with delivery info
export const updateLpoLineItemDelivery = mutation({
  args: {
    id: v.id("lpo_line_items"),
    quantity_delivered: v.number(),
    invoice_number: v.optional(v.string()),
    invoice_date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      quantity_delivered: args.quantity_delivered,
      invoice_number: args.invoice_number,
      invoice_date: args.invoice_date,
    });
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
    customer: v.string(),
    brand: v.optional(v.string()),
    client: v.optional(v.string()),
    invoice_number: v.string(),
    invoice_date: v.string(),
    barcode: v.string(),
    product_name: v.string(),
    quantity_ordered: v.number(),
    quantity_delivered: v.number(),
    unit_cost: v.number(),
    lpo_value_excl_vat: v.number(),
    lpo_value_incl_vat: v.number(),
    invoiced_value_excl_vat: v.number(),
    invoiced_value_incl_vat: v.number(),
    vat_amount_invoiced: v.optional(v.number()),
    total_incl_vat_invoiced: v.optional(v.number()),
    gap_value: v.number(),
    service_level_pct: v.number(),
    commission_pct: v.optional(v.number()),
    commission_aed: v.number(),
    match_status: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already exists for this PO and barcode
    const existing = await ctx.db
      .query("brand_performance")
      .filter((q) => q.and(
        q.eq(q.field("po_number"), args.po_number),
        q.eq(q.field("barcode"), args.barcode)
      ))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return { action: "updated", id: existing._id };
    }
    
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

// ============ INVOICE WITH LPO MATCHING ============

export const processInvoiceWithLpoMatch = mutation({
  args: {
    invoice_number: v.string(),
    invoice_date: v.string(),
    po_number: v.string(),
    customer: v.string(),
    subtotal: v.number(),
    vat_amount: v.number(),
    grand_total: v.number(),
    line_items: v.array(v.object({
      barcode: v.string(),
      product_name: v.string(),
      quantity_invoiced: v.number(),
      unit_rate: v.number(),
      taxable_amount: v.number(),
      vat_amount: v.number(),
      expiry_date: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Insert invoice header
    await ctx.db.insert("invoice_table", {
      invoice_number: args.invoice_number,
      invoice_date: args.invoice_date,
      po_number: args.po_number,
      customer: args.customer,
      subtotal: args.subtotal,
      vat_amount: args.vat_amount,
      grand_total: args.grand_total,
    });

    // Get LPO line items for comparison
    const lpoLineItems = await ctx.db
      .query("lpo_line_items")
      .withIndex("by_po_number", (q) => q.eq("po_number", args.po_number))
      .collect();

    // Create a map of LPO line items by barcode
    const lpoMap: Record<string, typeof lpoLineItems[0]> = {};
    lpoLineItems.forEach(item => {
      lpoMap[item.barcode] = item;
    });

    let totalOrderedQty = 0;
    let totalInvoicedQty = 0;

    // Insert invoice line items with quantity comparison
    for (const item of args.line_items) {
      await ctx.db.insert("invoice_line_items", {
        invoice_number: args.invoice_number,
        po_number: args.po_number,
        barcode: item.barcode,
        product_name: item.product_name,
        quantity_invoiced: item.quantity_invoiced,
        unit_rate: item.unit_rate,
        taxable_amount: item.taxable_amount,
        vat_amount: item.vat_amount,
        expiry_date: item.expiry_date,
      });

      totalInvoicedQty += item.quantity_invoiced;

      // Get ordered quantity from LPO
      const lpoItem = lpoMap[item.barcode];
      if (lpoItem) {
        totalOrderedQty += lpoItem.quantity_ordered;
      }
    }

    // Calculate service level
    const serviceLevelPct = totalOrderedQty > 0 
      ? (totalInvoicedQty / totalOrderedQty) * 100 
      : 100;

    const gapQty = totalOrderedQty - totalInvoicedQty;
    const gapValue = gapQty * (args.subtotal / (totalInvoicedQty || 1));
    const matchStatus = Math.abs(gapQty) <= 2 ? "MATCHED" : "DISCREPANCY";

    // Calculate commission (5% of invoiced value)
    const commissionAed = args.subtotal * 0.05;

    // Get LPO header for values
    const lpoHeader = await ctx.db
      .query("lpo_table")
      .withIndex("by_po_number", (q) => q.eq("po_number", args.po_number))
      .first();

    // Get brand/client from line items
    const firstLineItem = lpoLineItems[0];
    const brand = firstLineItem?.brand;
    const client = firstLineItem?.client;

    const lpoValueExclVat = lpoHeader?.total_excl_vat || args.subtotal;
    const lpoValueInclVat = lpoHeader?.total_incl_vat || args.grand_total;

    // Insert brand performance record (at SKU level - create one record per line item)
    const now = new Date();
    const invoiceLineItems = await ctx.db
      .query("invoice_line_items")
      .filter((q) => q.eq(q.field("invoice_number"), args.invoice_number))
      .collect();
    
    for (const lineItem of invoiceLineItems) {
      await ctx.db.insert("brand_performance", {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        po_number: args.po_number,
        po_date: lpoHeader?.order_date || args.invoice_date,
        customer: args.customer,
        brand: lpoHeader?.brand,
        client: lpoHeader?.client,
        invoice_number: args.invoice_number,
        invoice_date: args.invoice_date,
        barcode: lineItem.barcode,
        product_name: lineItem.product_name,
        quantity_ordered: 0, // Not available from invoice
        quantity_delivered: lineItem.quantity_invoiced,
        unit_cost: lineItem.unit_rate,
        lpo_value_excl_vat: lpoValueExclVat / (invoiceLineItems.length || 1),
        lpo_value_incl_vat: lpoValueInclVat / (invoiceLineItems.length || 1),
        invoiced_value_excl_vat: lineItem.taxable_amount,
        invoiced_value_incl_vat: lineItem.taxable_amount + lineItem.vat_amount,
        vat_amount_invoiced: lineItem.vat_amount,
        total_incl_vat_invoiced: lineItem.taxable_amount + lineItem.vat_amount,
        gap_value: 0,
        service_level_pct: 100, // Assume full for invoice-based
        commission_pct: 0,
        commission_aed: 0,
        match_status: "MATCHED",
      });
    }

    return {
      invoice_number: args.invoice_number,
      po_number: args.po_number,
      total_ordered: totalOrderedQty,
      total_invoiced: totalInvoicedQty,
      gap_qty: gapQty,
      service_level_pct: serviceLevelPct,
      match_status: matchStatus,
      commission_aed: commissionAed,
    };
  },
});

// ============ KNOWLEDGE_BASE ============

export const updateKnowledgeBase = mutation({
  args: {
    key: v.string(),
    value: v.string(),
    updated_by: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("knowledge_base")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updated_by: args.updated_by,
        updated_at: new Date().toISOString(),
      });
      return { action: "updated", id: existing._id };
    }
    
    const id = await ctx.db.insert("knowledge_base", {
      key: args.key,
      value: args.value,
      updated_by: args.updated_by,
      updated_at: new Date().toISOString(),
    });
    return { action: "inserted", id };
  },
});

// ============ USER MANAGEMENT ============

export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existing) {
      throw new Error("User already exists");
    }
    
    const id = await ctx.db.insert("users", {
      ...args,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return id;
  },
});

export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      name: args.name,
      email: args.email,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  },
});

export const updateUserPassword = mutation({
  args: {
    userId: v.id("users"),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      passwordHash: args.passwordHash,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  },
});

export const getUserByEmail = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return user;
  },
});

// ============ LPO UPDATES ============

export const updateLpo = mutation({
  args: {
    lpoId: v.any(), // Accept string or Id
    customer: v.optional(v.string()),
    status: v.optional(v.string()),
    delivery_date: v.optional(v.string()),
    notes: v.optional(v.string()),
    commission_pct: v.optional(v.number()),
    commission_amount: v.optional(v.number()),
    invoice_number: v.optional(v.string()),
    invoice_date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {};
    if (args.customer !== undefined) updateData.customer = args.customer;
    if (args.status !== undefined) updateData.status = args.status;
    if (args.delivery_date !== undefined) updateData.delivery_date = args.delivery_date;
    if (args.notes !== undefined) updateData.notes = args.notes;
    if (args.commission_pct !== undefined) updateData.commission_pct = args.commission_pct;
    if (args.commission_amount !== undefined) updateData.commission_amount = args.commission_amount;
    if (args.invoice_number !== undefined) updateData.invoice_number = args.invoice_number;
    if (args.invoice_date !== undefined) updateData.invoice_date = args.invoice_date;
    
    // Handle both string and Id types
    const lpoId = typeof args.lpoId === 'string' ? args.lpoId as any : args.lpoId;
    await ctx.db.patch(lpoId, updateData);
    return { success: true };
  },
});

export const updateLpoLineItem = mutation({
  args: {
    lineItemId: v.any(), // Accept string or Id
    quantity_delivered: v.optional(v.number()),
    amount_invoiced: v.optional(v.number()),
    vat_amount_invoiced: v.optional(v.number()),
    total_incl_vat_invoiced: v.optional(v.number()),
    invoice_number: v.optional(v.string()),
    invoice_date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {};
    if (args.quantity_delivered !== undefined) updateData.quantity_delivered = args.quantity_delivered;
    if (args.amount_invoiced !== undefined) updateData.amount_invoiced = args.amount_invoiced;
    if (args.vat_amount_invoiced !== undefined) updateData.vat_amount_invoiced = args.vat_amount_invoiced;
    if (args.total_incl_vat_invoiced !== undefined) updateData.total_incl_vat_invoiced = args.total_incl_vat_invoiced;
    if (args.invoice_number !== undefined) updateData.invoice_number = args.invoice_number;
    if (args.invoice_date !== undefined) updateData.invoice_date = args.invoice_date;
    
    // Handle both string and Id types
    const lineItemId = typeof args.lineItemId === 'string' ? args.lineItemId as any : args.lineItemId;
    await ctx.db.patch(lineItemId, updateData);
    return { success: true };
  },
});

// ============ BRAND_PERFORMANCE SYNC ============

export const syncBrandPerformance = mutation({
  args: {
    po_number: v.string(),
    invoice_number: v.string(),
    invoice_date: v.string(),
    lineItems: v.array(v.object({
      barcode: v.string(),
      product_name: v.string(),
      quantity_ordered: v.number(),
      quantity_delivered: v.number(),
      unit_cost: v.number(),
      amount_incl_vat: v.number(),
      amount_invoiced: v.number(),
      vat_amount_invoiced: v.number(),
      total_incl_vat_invoiced: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const { po_number, invoice_number, invoice_date, lineItems } = args;
    
    // Get LPO header info
    const lpo = await ctx.db
      .query("lpo_table")
      .withIndex("by_po_number", (q) => q.eq("po_number", po_number))
      .first();
    
    if (!lpo) {
      throw new Error(`LPO ${po_number} not found`);
    }
    
    // Use DELIVERY DATE for year and month (not order date)
    const deliveryDateStr = lpo.delivery_date || lpo.order_date;
    const deliveryDate = new Date(deliveryDateStr);
    const year = deliveryDate.getFullYear();
    const month = deliveryDate.getMonth() + 1;
    const commissionPct = lpo.commission_pct || 0;
    
    // Delete existing records for this PO
    const existing = await ctx.db
      .query("brand_performance")
      .filter((q) => q.eq(q.field("po_number"), po_number))
      .collect();
    
    for (const record of existing) {
      await ctx.db.delete(record._id);
    }
    
    // Insert new records for each line item
    for (const item of lineItems) {
      const serviceLevelPct = item.quantity_ordered > 0 
        ? (item.quantity_delivered / item.quantity_ordered) * 100 
        : 0;
      const gapValue = item.quantity_ordered - item.quantity_delivered;
      const commissionAed = item.total_incl_vat_invoiced 
        ? item.total_incl_vat_invoiced * (commissionPct / 100) 
        : 0;
      
      await ctx.db.insert("brand_performance", {
        year,
        month,
        po_number,
        po_date: lpo.order_date,
        customer: lpo.customer,
        brand: lpo.brand,
        client: lpo.client,
        invoice_number,
        invoice_date,
        barcode: item.barcode,
        product_name: item.product_name,
        quantity_ordered: item.quantity_ordered,
        quantity_delivered: item.quantity_delivered,
        unit_cost: item.unit_cost,
        lpo_value_excl_vat: item.amount_incl_vat / 1.05,
        lpo_value_incl_vat: item.amount_incl_vat,
        invoiced_value_excl_vat: item.amount_invoiced,
        invoiced_value_incl_vat: item.total_incl_vat_invoiced || 0,
        vat_amount_invoiced: item.vat_amount_invoiced,
        total_incl_vat_invoiced: item.total_incl_vat_invoiced,
        gap_value: gapValue,
        service_level_pct: serviceLevelPct,
        commission_pct: commissionPct,
        commission_aed: commissionAed,
        match_status: Math.abs(gapValue) <= 2 ? "MATCHED" : "DISCREPANCY",
      });
    }
    
    return { success: true, count: lineItems.length };
  },
});

// ============ TASKS ============

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    assigned_to: v.optional(v.string()),
    created_by: v.string(),
    due_date: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: "pending",
      priority: args.priority,
      assigned_to: args.assigned_to,
      created_by: args.created_by,
      created_at: now,
      updated_at: now,
      due_date: args.due_date,
      tags: args.tags,
    });
  },
});

export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(v.literal("pending"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled")),
    assigned_to: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const updateData: any = {
      status: args.status,
      updated_at: now,
    };
    if (args.assigned_to) {
      updateData.assigned_to = args.assigned_to;
    }
    if (args.status === "completed") {
      updateData.completed_at = now;
    }
    await ctx.db.patch(args.taskId, updateData);
  },
});

export const assignTask = mutation({
  args: {
    taskId: v.id("tasks"),
    assigned_to: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      assigned_to: args.assigned_to,
      status: "in_progress",
      updated_at: new Date().toISOString(),
    });
  },
});
