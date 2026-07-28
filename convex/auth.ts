import { v } from "convex/values";
import { mutationGeneric as mutation, queryGeneric as query } from "convex/server";

const preferencesValidator = v.object({
  gridSize: v.number(),
  defaultViewport: v.union(v.literal("Desktop"), v.literal("Tablet"), v.literal("Mobile")),
  autosaveDebounce: v.number(),
  previewTheme: v.union(v.literal("Light"), v.literal("Dark")),
  componentReviewRequests: v.boolean(),
  tokenDriftAlerts: v.boolean(),
  weeklyUsageDigest: v.boolean(),
});

const defaultPreferences = {
  gridSize: 8,
  defaultViewport: "Desktop" as const,
  autosaveDebounce: 900,
  previewTheme: "Light" as const,
  componentReviewRequests: true,
  tokenDriftAlerts: true,
  weeklyUsageDigest: false,
};

type PublicUserInput = {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
  favoriteComponentIds?: string[];
  workspacePreferences?: typeof defaultPreferences;
};

function publicUser(user: PublicUserInput) {
  return {
    id: user.userId,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    favoriteComponentIds: user.favoriteComponentIds ?? [],
    workspacePreferences: user.workspacePreferences ?? defaultPreferences,
  };
}

async function resolveUserBySession(ctx: any, sessionId?: string) {
  if (!sessionId) return null;
  const session = await ctx.db.query("sessions").withIndex("by_session_id", (q: any) => q.eq("sessionId", sessionId)).unique();
  if (!session || new Date(session.expiresAt).getTime() <= Date.now()) return null;
  return await ctx.db.query("users").withIndex("by_user_id", (q: any) => q.eq("userId", session.userId)).unique();
}

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).unique();
  },
});

export const getUserBySession = query({
  args: { sessionId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await resolveUserBySession(ctx, args.sessionId);
    return user ? publicUser(user) : null;
  },
});

export const getFavoritesBySession = query({
  args: { sessionId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await resolveUserBySession(ctx, args.sessionId);
    return (user?.favoriteComponentIds ?? []) as string[];
  },
});

export const getWorkspacePreferencesBySession = query({
  args: { sessionId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await resolveUserBySession(ctx, args.sessionId);
    if (!user) return null;
    return user.workspacePreferences ?? defaultPreferences;
  },
});

export const updateWorkspacePreferencesBySession = mutation({
  args: { sessionId: v.string(), preferences: preferencesValidator },
  handler: async (ctx, args) => {
    const user = await resolveUserBySession(ctx, args.sessionId);
    if (!user) return null;

    const preferences = {
      ...args.preferences,
      gridSize: Math.min(32, Math.max(2, Math.round(args.preferences.gridSize))),
      autosaveDebounce: Math.min(5000, Math.max(200, Math.round(args.preferences.autosaveDebounce))),
    };
    await ctx.db.patch(user._id, { workspacePreferences: preferences });
    return preferences;
  },
});

export const toggleFavoriteBySession = mutation({
  args: { sessionId: v.string(), componentId: v.string() },
  handler: async (ctx, args) => {
    const user = await resolveUserBySession(ctx, args.sessionId);
    if (!user) return null;

    const current: string[] = (user.favoriteComponentIds ?? []) as string[];
    const favoriteComponentIds = current.includes(args.componentId)
      ? current.filter((id: string) => id !== args.componentId)
      : [...current, args.componentId];

    await ctx.db.patch(user._id, { favoriteComponentIds });
    return favoriteComponentIds;
  },
});

export const ensureDemoUser = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).unique();
    if (existing) return publicUser(existing);
    const user = { ...args, favoriteComponentIds: [] as string[], workspacePreferences: defaultPreferences };
    await ctx.db.insert("users", user);
    return publicUser(user);
  },
});

export const createUser = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).unique();
    if (existing) throw new Error("Email already registered.");
    const user = { ...args, favoriteComponentIds: [] as string[], workspacePreferences: defaultPreferences };
    await ctx.db.insert("users", user);
    return publicUser(user);
  },
});

export const createSession = mutation({
  args: {
    sessionId: v.string(),
    userId: v.string(),
    createdAt: v.string(),
    expiresAt: v.string(),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db.query("sessions").withIndex("by_user_id", (q) => q.eq("userId", args.userId)).collect();
    const now = Date.now();
    for (const session of sessions) {
      if (new Date(session.expiresAt).getTime() <= now) await ctx.db.delete(session._id);
    }
    await ctx.db.insert("sessions", args);
    return args;
  },
});

export const destroySession = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db.query("sessions").withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId)).unique();
    if (session) await ctx.db.delete(session._id);
    return { ok: true };
  },
});

export const createPasswordReset = mutation({
  args: {
    resetId: v.string(),
    email: v.string(),
    tokenHash: v.string(),
    createdAt: v.string(),
    expiresAt: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).unique();
    const resets = await ctx.db.query("passwordResets").collect();
    const now = Date.now();
    for (const reset of resets) {
      if (reset.usedAt || new Date(reset.expiresAt).getTime() <= now) await ctx.db.delete(reset._id);
    }
    if (!user) return null;
    await ctx.db.insert("passwordResets", {
      resetId: args.resetId,
      userId: user.userId,
      tokenHash: args.tokenHash,
      createdAt: args.createdAt,
      expiresAt: args.expiresAt,
    });
    return { ok: true };
  },
});

export const resetPassword = mutation({
  args: {
    tokenHash: v.string(),
    passwordHash: v.string(),
    usedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const reset = await ctx.db.query("passwordResets").withIndex("by_token_hash", (q) => q.eq("tokenHash", args.tokenHash)).unique();
    if (!reset || reset.usedAt || new Date(reset.expiresAt).getTime() <= Date.now()) throw new Error("Password reset link is invalid or expired.");
    const user = await ctx.db.query("users").withIndex("by_user_id", (q) => q.eq("userId", reset.userId)).unique();
    if (!user) throw new Error("User not found.");

    await ctx.db.patch(user._id, { passwordHash: args.passwordHash });
    await ctx.db.patch(reset._id, { usedAt: args.usedAt });

    const sessions = await ctx.db.query("sessions").withIndex("by_user_id", (q) => q.eq("userId", user.userId)).collect();
    for (const session of sessions) await ctx.db.delete(session._id);

    return publicUser(user);
  },
});
