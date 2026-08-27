import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  componentPropsValidator,
  componentUsageValidator,
  designTokenValidator,
  preferencesValidator,
  roleValidator,
} from "./validators";

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    createdAt: v.string(),
    role: v.optional(roleValidator),
    favoriteComponentIds: v.optional(v.array(v.string())),
    workspacePreferences: v.optional(preferencesValidator),
  })
    .index("by_user_id", ["userId"])
    .index("by_email", ["email"]),
  sessions: defineTable({
    sessionId: v.string(),
    userId: v.string(),
    createdAt: v.string(),
    expiresAt: v.string(),
  })
    .index("by_session_id", ["sessionId"])
    .index("by_user_id", ["userId"]),
  passwordResets: defineTable({
    resetId: v.string(),
    userId: v.string(),
    tokenHash: v.string(),
    createdAt: v.string(),
    expiresAt: v.string(),
    usedAt: v.optional(v.string()),
  })
    .index("by_token_hash", ["tokenHash"])
    .index("by_user_id", ["userId"]),
  apiRateLimits: defineTable({
    key: v.string(),
    windowStartedAt: v.number(),
    count: v.number(),
    expiresAt: v.number(),
  }).index("by_key", ["key"]),
  components: defineTable({
    componentId: v.string(),
    userId: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    // Kept wide during migration; all new writes and public returns are normalized.
    category: v.string(),
    framework: v.string(),
    language: v.string(),
    code: v.string(),
    styles: v.string(),
    usageCode: v.string(),
    notes: v.string(),
    version: v.string(),
    isFavorite: v.boolean(),
    isPublic: v.boolean(),
    tags: v.array(v.string()),
    collectionIds: v.array(v.string()),
    updatedAt: v.string(),
    previewHtml: v.string(),
    tokens: v.array(designTokenValidator),
    usage: v.array(componentUsageValidator),
    props: componentPropsValidator,
  })
    .index("by_component_id", ["componentId"])
    .index("by_slug", ["slug"])
    .index("by_user_id", ["userId"])
    .index("by_user_id_and_slug", ["userId", "slug"])
    .index("by_is_public", ["isPublic"]),
  collections: defineTable({
    collectionId: v.string(),
    userId: v.optional(v.string()),
    name: v.string(),
    description: v.string(),
    componentIds: v.array(v.string()),
    updatedAt: v.string(),
  })
    .index("by_collection_id", ["collectionId"])
    .index("by_user_id", ["userId"]),
});
