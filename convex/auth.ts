import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertServerSecret, resolveUserBySession } from "./security";
import {
  credentialUserValidator,
  preferencesValidator,
  publicUserValidator,
} from "./validators";

type WorkspacePreferences = {
  gridSize: number;
  defaultViewport: "Desktop" | "Tablet" | "Mobile";
  autosaveDebounce: number;
  previewTheme: "Light" | "Dark";
  componentReviewRequests: boolean;
  tokenDriftAlerts: boolean;
  weeklyUsageDigest: boolean;
};

type VaultRole = "admin" | "user";

const defaultPreferences: WorkspacePreferences = {
  gridSize: 8,
  defaultViewport: "Desktop",
  autosaveDebounce: 900,
  previewTheme: "Light",
  componentReviewRequests: true,
  tokenDriftAlerts: true,
  weeklyUsageDigest: false,
};

type PublicUserInput = {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
  role?: VaultRole;
  favoriteComponentIds?: string[];
  workspacePreferences?: WorkspacePreferences;
};

function publicUser(user: PublicUserInput) {
  return {
    id: user.userId,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    role: user.role ?? "user",
    favoriteComponentIds: user.favoriteComponentIds ?? [],
    workspacePreferences: user.workspacePreferences ?? defaultPreferences,
  };
}

function credentialUser(user: PublicUserInput & { passwordHash: string }) {
  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    createdAt: user.createdAt,
    ...(user.role ? { role: user.role } : {}),
    ...(user.favoriteComponentIds ? { favoriteComponentIds: user.favoriteComponentIds } : {}),
    ...(user.workspacePreferences ? { workspacePreferences: user.workspacePreferences } : {}),
  };
}

export const getUserByEmail = query({
  args: { serverSecret: v.string(), email: v.string() },
  returns: v.union(credentialUserValidator, v.null()),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).unique();
    return user ? credentialUser(user) : null;
  },
});

export const getUserBySession = query({
  args: { serverSecret: v.string(), sessionId: v.optional(v.string()) },
  returns: v.union(publicUserValidator, v.null()),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await resolveUserBySession(ctx, args.sessionId);
    return user ? publicUser(user) : null;
  },
});

export const getFavoritesBySession = query({
  args: { serverSecret: v.string(), sessionId: v.optional(v.string()) },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await resolveUserBySession(ctx, args.sessionId);
    return (user?.favoriteComponentIds ?? []) as string[];
  },
});

export const getWorkspacePreferencesBySession = query({
  args: { serverSecret: v.string(), sessionId: v.optional(v.string()) },
  returns: v.union(preferencesValidator, v.null()),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await resolveUserBySession(ctx, args.sessionId);
    if (!user) return null;
    return (user.workspacePreferences ?? defaultPreferences) as WorkspacePreferences;
  },
});

export const updateWorkspacePreferencesBySession = mutation({
  args: { serverSecret: v.string(), sessionId: v.string(), preferences: preferencesValidator },
  returns: v.union(preferencesValidator, v.null()),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await resolveUserBySession(ctx, args.sessionId);
    if (!user) return null;
    const preferences: WorkspacePreferences = {
      ...args.preferences,
      gridSize: Math.min(32, Math.max(2, Math.round(args.preferences.gridSize))),
      autosaveDebounce: Math.min(5000, Math.max(200, Math.round(args.preferences.autosaveDebounce))),
    };
    await ctx.db.patch(user._id, { workspacePreferences: preferences });
    return preferences;
  },
});

export const toggleFavoriteBySession = mutation({
  args: { serverSecret: v.string(), sessionId: v.string(), componentId: v.string() },
  returns: v.union(v.array(v.string()), v.null()),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await resolveUserBySession(ctx, args.sessionId);
    if (!user) return null;
    const component = await ctx.db
      .query("components")
      .withIndex("by_component_id", (q) => q.eq("componentId", args.componentId))
      .unique();
    const canRead = component && (
      user.role === "admin"
      || component.userId === user.userId
      || component.userId === "demo-user"
      || component.isPublic
    );
    if (!canRead) return null;
    const current: string[] = (user.favoriteComponentIds ?? []) as string[];
    const favoriteComponentIds = current.includes(args.componentId)
      ? current.filter((id: string) => id !== args.componentId)
      : [...current, args.componentId];
    await ctx.db.patch(user._id, { favoriteComponentIds });
    return favoriteComponentIds;
  },
});

export const ensureDemoUser = mutation({
  args: { serverSecret: v.string(), userId: v.string(), name: v.string(), email: v.string(), passwordHash: v.string(), createdAt: v.string() },
  returns: publicUserValidator,
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const existing = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).unique();
    if (existing) return publicUser(existing);
    const user = {
      userId: args.userId,
      name: args.name,
      email: args.email,
      passwordHash: args.passwordHash,
      createdAt: args.createdAt,
      role: "user" as VaultRole,
      favoriteComponentIds: [] as string[],
      workspacePreferences: defaultPreferences,
    };
    await ctx.db.insert("users", user);
    return publicUser(user);
  },
});

export const createUser = mutation({
  args: { serverSecret: v.string(), userId: v.string(), name: v.string(), email: v.string(), passwordHash: v.string(), createdAt: v.string() },
  returns: publicUserValidator,
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const existing = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).unique();
    if (existing) throw new Error("Email already registered.");
    const user = {
      userId: args.userId,
      name: args.name,
      email: args.email,
      passwordHash: args.passwordHash,
      createdAt: args.createdAt,
      role: "user" as VaultRole,
      favoriteComponentIds: [] as string[],
      workspacePreferences: defaultPreferences,
    };
    await ctx.db.insert("users", user);
    return publicUser(user);
  },
});

export const createSession = mutation({
  args: { serverSecret: v.string(), sessionId: v.string(), userId: v.string(), createdAt: v.string(), expiresAt: v.string() },
  returns: v.object({ userId: v.string(), createdAt: v.string(), expiresAt: v.string() }),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await ctx.db.query("users").withIndex("by_user_id", (q) => q.eq("userId", args.userId)).unique();
    if (!user) throw new Error("AUTHENTICATION_REQUIRED");
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("asc")
      .take(100);
    const now = Date.now();
    const activeSessions = [];
    for (const session of sessions) {
      if (!/^[a-f0-9]{64}$/.test(session.sessionId) || new Date(session.expiresAt).getTime() <= now) {
        await ctx.db.delete(session._id);
      }
      else activeSessions.push(session);
    }
    for (const session of activeSessions.slice(0, Math.max(0, activeSessions.length - 9))) {
      await ctx.db.delete(session._id);
    }
    const session = {
      sessionId: args.sessionId,
      userId: args.userId,
      createdAt: args.createdAt,
      expiresAt: args.expiresAt,
    };
    await ctx.db.insert("sessions", session);
    return { userId: session.userId, createdAt: session.createdAt, expiresAt: session.expiresAt };
  },
});

export const destroySession = mutation({
  args: { serverSecret: v.string(), sessionId: v.string() },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const session = await ctx.db.query("sessions").withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId)).unique();
    if (session) await ctx.db.delete(session._id);
    return { ok: true };
  },
});

export const createPasswordReset = mutation({
  args: { serverSecret: v.string(), resetId: v.string(), email: v.string(), tokenHash: v.string(), createdAt: v.string(), expiresAt: v.string() },
  returns: v.union(v.object({ ok: v.boolean() }), v.null()),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await ctx.db.query("users").withIndex("by_email", (q) => q.eq("email", args.email)).unique();
    if (!user) return null;
    const resets = await ctx.db.query("passwordResets").withIndex("by_user_id", (q) => q.eq("userId", user.userId)).take(50);
    const now = Date.now();
    for (const reset of resets) if (reset.usedAt || new Date(reset.expiresAt).getTime() <= now) await ctx.db.delete(reset._id);
    await ctx.db.insert("passwordResets", { resetId: args.resetId, userId: user.userId, tokenHash: args.tokenHash, createdAt: args.createdAt, expiresAt: args.expiresAt });
    return { ok: true };
  },
});

export const resetPassword = mutation({
  args: { serverSecret: v.string(), tokenHash: v.string(), passwordHash: v.string(), usedAt: v.string() },
  returns: publicUserValidator,
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const reset = await ctx.db.query("passwordResets").withIndex("by_token_hash", (q) => q.eq("tokenHash", args.tokenHash)).unique();
    if (!reset || reset.usedAt || new Date(reset.expiresAt).getTime() <= Date.now()) throw new Error("Password reset link is invalid or expired.");
    const user = await ctx.db.query("users").withIndex("by_user_id", (q) => q.eq("userId", reset.userId)).unique();
    if (!user) throw new Error("User not found.");
    await ctx.db.patch(user._id, { passwordHash: args.passwordHash });
    await ctx.db.patch(reset._id, { usedAt: args.usedAt });
    const sessions = await ctx.db.query("sessions").withIndex("by_user_id", (q) => q.eq("userId", user.userId)).take(100);
    for (const session of sessions) await ctx.db.delete(session._id);
    return publicUser(user);
  },
});
