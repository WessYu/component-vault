import { v } from "convex/values";
import { query } from "./_generated/server";
import { assertServerSecret } from "./security";

export const readiness = query({
  args: { serverSecret: v.string() },
  returns: v.object({ ok: v.boolean(), checkedAt: v.number() }),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    await ctx.db.query("users").take(1);
    return { ok: true, checkedAt: Date.now() };
  },
});
