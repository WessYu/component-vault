import { v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import type { Id } from "./_generated/dataModel";
import { internalMutation, mutation } from "./_generated/server";
import { assertServerSecret } from "./security";

const resultValidator = v.object({
  allowed: v.boolean(),
  remaining: v.number(),
  resetAt: v.number(),
});

const cleanupRateLimit = makeFunctionReference<
  "mutation",
  { bucketId: Id<"apiRateLimits">; expiresAt: number },
  null
>("rateLimits:cleanup");

export const consume = mutation({
  args: {
    serverSecret: v.string(),
    key: v.string(),
    limit: v.number(),
    windowMs: v.number(),
  },
  returns: resultValidator,
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const limit = Math.min(10_000, Math.max(1, Math.floor(args.limit)));
    const windowMs = Math.min(24 * 60 * 60 * 1000, Math.max(1_000, Math.floor(args.windowMs)));
    const now = Date.now();
    const current = await ctx.db
      .query("apiRateLimits")
      .withIndex("by_key", (query) => query.eq("key", args.key))
      .unique();

    if (current && current.expiresAt > now) {
      if (current.count >= limit) {
        return { allowed: false, remaining: 0, resetAt: current.expiresAt };
      }
      const count = current.count + 1;
      await ctx.db.patch(current._id, { count });
      return { allowed: true, remaining: Math.max(0, limit - count), resetAt: current.expiresAt };
    }

    const expiresAt = now + windowMs;
    const bucketId = current?._id ?? await ctx.db.insert("apiRateLimits", {
      key: args.key,
      windowStartedAt: now,
      count: 1,
      expiresAt,
    });

    if (current) {
      await ctx.db.patch(current._id, { windowStartedAt: now, count: 1, expiresAt });
    }

    await ctx.scheduler.runAt(expiresAt + 60_000, cleanupRateLimit, { bucketId, expiresAt });
    return { allowed: true, remaining: limit - 1, resetAt: expiresAt };
  },
});

export const cleanup = internalMutation({
  args: { bucketId: v.id("apiRateLimits"), expiresAt: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const bucket = await ctx.db.get(args.bucketId);
    if (bucket && bucket.expiresAt === args.expiresAt && bucket.expiresAt <= Date.now()) {
      await ctx.db.delete(bucket._id);
    }
    return null;
  },
});
