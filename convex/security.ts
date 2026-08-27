import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

type DatabaseContext = QueryCtx | MutationCtx;

export function assertServerSecret(serverSecret: string) {
  const expected = process.env.COMPONENT_VAULT_SERVER_SECRET;
  if (!expected || serverSecret.length < 32 || serverSecret !== expected) {
    throw new ConvexError("UNAUTHORIZED_BACKEND_REQUEST");
  }
}

export async function resolveUserBySession(ctx: DatabaseContext, sessionId?: string) {
  if (!sessionId) return null;

  const session = await ctx.db
    .query("sessions")
    .withIndex("by_session_id", (query) => query.eq("sessionId", sessionId))
    .unique();

  if (!session || Date.parse(session.expiresAt) <= Date.now()) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_user_id", (query) => query.eq("userId", session.userId))
    .unique();
}

export async function requireUserBySession(ctx: DatabaseContext, sessionId: string) {
  const user = await resolveUserBySession(ctx, sessionId);
  if (!user) throw new ConvexError("AUTHENTICATION_REQUIRED");
  return user;
}

export function canManageResource(user: { userId: string; role?: "admin" | "user" }, ownerId?: string) {
  return user.role === "admin" || ownerId === user.userId;
}
