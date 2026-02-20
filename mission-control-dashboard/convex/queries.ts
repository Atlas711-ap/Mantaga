import { query } from "./_generated/server";

export const getMasterSku = query({
  handler: async (ctx) => {
    return await ctx.db.query("master_sku").collect();
  },
});
