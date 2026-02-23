import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  master_sku: defineTable({
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
    // PTT = Price to Trade (platform-specific sell prices)
    amazon_ptt: v.optional(v.number()),
    talabat_ptt: v.optional(v.number()),
    noon_ptt: v.optional(v.number()),
    careem_ptt: v.optional(v.number()),
    mantaga_commission_pct: v.optional(v.number()),
  }).index("by_barcode", ["barcode"]).index("by_brand", ["brand"]),

  daily_stock_snapshot: defineTable({
    report_date: v.string(),
    sku_id: v.string(),
    barcode: v.string(),
    product_name: v.string(),
    warehouse_name: v.string(),
    warehouse_type: v.string(),
    stock_on_hand: v.number(),
    putaway_reserved_qty: v.number(),
    effective_stock: v.number(),
  }).index("by_date", ["report_date"])
    .index("by_barcode_warehouse_date", ["barcode", "warehouse_name", "report_date"]),

  sell_out_log: defineTable({
    log_date: v.string(),
    barcode: v.string(),
    product_name: v.string(),
    warehouse_name: v.string(),
    estimated_units_sold: v.number(),
    calculation_method: v.string(),
    prev_stock: v.number(),
    current_stock: v.number(),
  }).index("by_date", ["log_date"]).index("by_barcode", ["barcode"]),

  replenishment_log: defineTable({
    replenishment_date: v.string(),
    barcode: v.string(),
    product_name: v.string(),
    warehouse_name: v.string(),
    prev_stock: v.number(),
    new_stock: v.number(),
    estimated_replenishment_qty: v.number(),
    days_since_last_replenishment: v.optional(v.number()),
  }).index("by_date", ["replenishment_date"]).index("by_barcode", ["barcode"]),

  lpo_table: defineTable({
    po_number: v.string(),
    order_date: v.string(),
    delivery_date: v.string(),
    supplier: v.string(),
    delivery_location: v.string(),
    customer: v.string(), // Talabat, Noon, Amazon, etc.
    brand: v.optional(v.string()),
    client: v.optional(v.string()),
    total_excl_vat: v.number(),
    total_vat: v.number(),
    total_incl_vat: v.number(),
    status: v.optional(v.string()), // pending, partial, complete
  }).index("by_po_number", ["po_number"]).index("by_brand", ["brand"]).index("by_customer", ["customer"]),

  lpo_line_items: defineTable({
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
    amount_invoiced: v.optional(v.number()), // qty_delivered * unit_cost (excl VAT)
    vat_amount_invoiced: v.optional(v.number()), // VAT 5% on invoiced amount
    total_incl_vat_invoiced: v.optional(v.number()), // amount_invoiced + VAT
    invoice_number: v.optional(v.string()),
    invoice_date: v.optional(v.string()),
  }).index("by_po_number", ["po_number"]).index("by_barcode", ["barcode"]),

  invoice_table: defineTable({
    invoice_number: v.string(),
    invoice_date: v.string(),
    po_number: v.string(),
    customer: v.string(),
    subtotal: v.number(),
    vat_amount: v.number(),
    grand_total: v.number(),
  }).index("by_invoice_number", ["invoice_number"])
    .index("by_po_number", ["po_number"]),

  invoice_line_items: defineTable({
    invoice_number: v.string(),
    po_number: v.string(),
    barcode: v.string(),
    product_name: v.string(),
    expiry_date: v.optional(v.string()),
    unit_rate: v.number(),
    quantity_invoiced: v.number(),
    taxable_amount: v.number(),
    vat_amount: v.number(),
  }).index("by_invoice_number", ["invoice_number"]),

  brand_performance: defineTable({
    year: v.number(),
    month: v.number(),
    po_number: v.string(),
    po_date: v.string(),
    customer: v.string(),
    brand: v.optional(v.string()),
    client: v.optional(v.string()),
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
  }).index("by_year_month", ["year", "month"]).index("by_brand", ["brand"]).index("by_customer", ["customer"]),

  agent_event_log: defineTable({
    agent: v.string(),
    event_type: v.string(),
    description: v.string(),
    timestamp: v.string(),
    metadata: v.optional(v.string()),
  }).index("by_agent", ["agent"]).index("by_timestamp", ["timestamp"]),

  messages: defineTable({
    sender: v.string(),
    sender_type: v.string(),
    content: v.string(),
    timestamp: v.string(),
    mention: v.optional(v.string()),
    is_system_message: v.boolean(),
    attachment_name: v.optional(v.string()),
  }).index("by_timestamp", ["timestamp"]),

  calendar_events: defineTable({
    title: v.string(),
    event_date: v.string(),
    notes: v.optional(v.string()),
    created_by: v.string(),
  }).index("by_date", ["event_date"]),

  knowledge_base: defineTable({
    key: v.string(),
    value: v.string(),
    updated_by: v.string(),
    updated_at: v.string(),
  }).index("by_key", ["key"]),

  // User management for auth
  users: defineTable({
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_email", ["email"]),
});
