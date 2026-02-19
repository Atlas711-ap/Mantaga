import { mutation, query } from "./_generated/server";

export const getMasterSku = query({
  handler: async (ctx) => {
    return await ctx.db.query("master_sku").collect();
  },
});

export const addMasterSku = mutation({
  args: {
    client: "string",
    brand: "string",
    barcode: "string",
    sku_name: "string",
    category: "optional(string)",
    subcategory: "optional(string)",
    case_pack: "optional(number)",
    shelf_life: "optional(string)",
    nutrition_info: "optional(string)",
    ingredients_info: "optional(string)",
    amazon_asin: "optional(string)",
    talabat_sku: "optional(string)",
    noon_zsku: "optional(string)",
    careem_code: "optional(string)",
    client_sellin_price: "optional(number)",
    mantaga_commission_pct: "optional(number)",
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("master_sku")
      .filter((q) => q.eq(q.field("barcode"), args.barcode))
      .first();
    
    if (existing) {
      throw new Error("BARCODE_EXISTS");
    }
    
    return await ctx.db.insert("master_sku", args);
  },
});

export const updateMasterSku = mutation({
  args: {
    barcode: "string",
    client: "string",
    brand: "string",
    sku_name: "string",
    category: "optional(string)",
    subcategory: "optional(string)",
    case_pack: "optional(number)",
    shelf_life: "optional(string)",
    nutrition_info: "optional(string)",
    ingredients_info: "optional(string)",
    amazon_asin: "optional(string)",
    talabat_sku: "optional(string)",
    noon_zsku: "optional(string)",
    careem_code: "optional(string)",
    client_sellin_price: "optional(number)",
    mantaga_commission_pct: "optional(number)",
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("master_sku")
      .filter((q) => q.eq(q.field("barcode"), args.barcode))
      .first();
    
    if (!existing) {
      throw new Error("NOT_FOUND");
    }
    
    await ctx.db.patch(existing._id, args);
  },
});

export const bulkUpsertSku = mutation({
  args: {
    skus: "array",
  },
  handler: async (ctx, args) => {
    let newCount = 0;
    let updateCount = 0;
    
    for (const sku of args.skus) {
      const existing = await ctx.db.query("master_sku")
        .filter((q) => q.eq(q.field("barcode"), sku.barcode))
        .first();
      
      if (existing) {
        // Update - only fill empty fields
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
        
        // Commission applies to all client SKUs
        if (sku.mantaga_commission_pct) {
          const allClientSkus = await ctx.db.query("master_sku")
            .filter((q) => q.eq(q.field("client"), existing.client))
            .collect();
          for (const clientSku of allClientSkus) {
            await ctx.db.patch(clientSku._id, { mantaga_commission_pct: sku.mantaga_commission_pct });
          }
        }
        
        if (Object.keys(updates).length > 0) {
          await ctx.db.patch(existing._id, updates);
          updateCount++;
        }
      } else {
        await ctx.db.insert("master_sku", sku);
        newCount++;
      }
    }
    
    return { newCount, updateCount };
  },
});

export const seedData = mutation({
  handler: async (ctx) => {
    // Clear existing
    const existing = await ctx.db.query("master_sku").collect();
    for (const doc of existing) {
      await ctx.db.delete(doc._id);
    }
    
    // Seed sample data
    await ctx.db.insert("master_sku", {
      client: "Quadrant International",
      brand: "Mudhish",
      barcode: "SKU-001",
      sku_name: "Mudhish Classic Chips",
      category: "Snacks",
      subcategory: "Chips",
      case_pack: 24,
      shelf_life: "6 months",
      nutrition_info: "Yes",
      ingredients_info: "Yes",
      talabat_sku: "TAL-001",
      noon_zsku: "NOON-001",
      careem_code: "CRM-001",
      client_sellin_price: 12.50,
      mantaga_commission_pct: 15,
    });
    
    await ctx.db.insert("master_sku", {
      client: "Quadrant International",
      brand: "Mudhish",
      barcode: "SKU-002",
      sku_name: "Mudhish Spicy Chips",
      category: "Snacks",
      subcategory: "Chips",
      case_pack: 24,
      shelf_life: "6 months",
      nutrition_info: "No",
      ingredients_info: "No",
      talabat_sku: "TAL-002",
      client_sellin_price: 12.50,
      mantaga_commission_pct: 15,
    });
    
    await ctx.db.insert("master_sku", {
      client: "Quadrant International",
      brand: "Mudhish",
      barcode: "SKU-003",
      sku_name: "Mudhish Onion Rings",
      case_pack: 24,
      shelf_life: "6 months",
      talabat_sku: "TAL-003",
      client_sellin_price: 14.00,
      mantaga_commission_pct: 15,
    });
  },
});
