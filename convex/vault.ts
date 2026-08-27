import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { assertServerSecret, canManageResource, requireUserBySession, resolveUserBySession } from "./security";
import {
  categoryValidator,
  collectionInputValidator,
  componentInputValidator,
  componentPropsValidator,
  componentUsageValidator,
  designTokenValidator,
  publicCollectionValidator,
  publicComponentValidator,
} from "./validators";

const componentPatch = v.object({
  name: v.optional(v.string()),
  slug: v.optional(v.string()),
  description: v.optional(v.string()),
  category: v.optional(categoryValidator),
  framework: v.optional(v.union(v.literal("React"), v.literal("HTML"))),
  language: v.optional(v.union(v.literal("tsx"), v.literal("jsx"), v.literal("html"))),
  code: v.optional(v.string()),
  styles: v.optional(v.string()),
  usageCode: v.optional(v.string()),
  notes: v.optional(v.string()),
  version: v.optional(v.string()),
  isFavorite: v.optional(v.boolean()),
  isPublic: v.optional(v.boolean()),
  tags: v.optional(v.array(v.string())),
  collectionIds: v.optional(v.array(v.string())),
  updatedAt: v.optional(v.string()),
  previewHtml: v.optional(v.string()),
  tokens: v.optional(v.array(designTokenValidator)),
  usage: v.optional(v.array(componentUsageValidator)),
  props: v.optional(componentPropsValidator),
});

const collectionPatch = v.object({
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  componentIds: v.optional(v.array(v.string())),
  updatedAt: v.optional(v.string()),
});

type ComponentInsert = Omit<Doc<"components">, "_id" | "_creationTime">;
type CollectionInsert = Omit<Doc<"collections">, "_id" | "_creationTime">;

const categories = [
  "Buttons",
  "Cards",
  "Forms",
  "Navigation",
  "Data Display",
  "Feedback",
  "Surfaces",
  "Charts",
  "Utilities",
  "Motion Experiences",
] as const;

function normalizedCategory(value: string): typeof categories[number] {
  return categories.includes(value as typeof categories[number])
    ? value as typeof categories[number]
    : "Utilities";
}

function normalizedFramework(value: string): "React" | "HTML" {
  return value === "HTML" ? "HTML" : "React";
}

function normalizedLanguage(value: string): "tsx" | "jsx" | "html" {
  return value === "jsx" || value === "html" ? value : "tsx";
}

function publicComponent(component: Doc<"components">) {
  return {
    id: component.componentId,
    userId: component.userId,
    name: component.name,
    slug: component.slug,
    description: component.description,
    category: normalizedCategory(component.category),
    framework: normalizedFramework(component.framework),
    language: normalizedLanguage(component.language),
    code: component.code,
    styles: component.styles,
    usageCode: component.usageCode,
    notes: component.notes,
    version: component.version,
    isFavorite: component.isFavorite,
    isPublic: component.isPublic,
    tags: component.tags,
    collectionIds: component.collectionIds,
    updatedAt: component.updatedAt,
    previewHtml: component.previewHtml,
    tokens: component.tokens,
    usage: component.usage,
    props: component.props,
  };
}

function publicCollection(collection: Doc<"collections">) {
  return {
    id: collection.collectionId,
    name: collection.name,
    description: collection.description,
    componentIds: collection.componentIds,
    updatedAt: collection.updatedAt,
  };
}

function componentInsert(component: Record<string, unknown>) {
  const { id, ...rest } = component;
  if (typeof id !== "string") throw new Error("Component id is required.");
  return {
    ...rest,
    componentId: id,
  } as ComponentInsert;
}

function collectionInsert(collection: Record<string, unknown>, userId: string) {
  const { id, ...rest } = collection;
  if (typeof id !== "string") throw new Error("Collection id is required.");
  return {
    ...rest,
    collectionId: id,
    userId,
  } as CollectionInsert;
}

function canReadComponent(component: { userId: string; isPublic: boolean }, user?: Doc<"users"> | null) {
  return user?.role === "admin" || component.userId === "demo-user" || component.isPublic || component.userId === user?.userId;
}

function canReadCollection(collection: { userId?: string }, user?: Doc<"users"> | null) {
  return user?.role === "admin" || !collection.userId || collection.userId === "demo-user" || collection.userId === user?.userId;
}

function mergeById<T>(groups: T[][], id: (item: T) => string) {
  const merged = new Map<string, T>();
  for (const group of groups) for (const item of group) merged.set(id(item), item);
  return Array.from(merged.values());
}

async function accessibleComponents(ctx: Parameters<typeof resolveUserBySession>[0], user?: Doc<"users"> | null) {
  if (user?.role === "admin") return await ctx.db.query("components").take(1000);
  const groups = await Promise.all([
    ctx.db.query("components").withIndex("by_is_public", (q) => q.eq("isPublic", true)).take(1000),
    ctx.db.query("components").withIndex("by_user_id", (q) => q.eq("userId", "demo-user")).take(1000),
    user
      ? ctx.db.query("components").withIndex("by_user_id", (q) => q.eq("userId", user.userId)).take(1000)
      : Promise.resolve([]),
  ]);
  return mergeById(groups, (component) => component.componentId);
}

async function accessibleCollections(ctx: Parameters<typeof resolveUserBySession>[0], user?: Doc<"users"> | null) {
  if (user?.role === "admin") return await ctx.db.query("collections").take(500);
  const groups = await Promise.all([
    ctx.db.query("collections").withIndex("by_user_id", (q) => q.eq("userId", undefined)).take(500),
    ctx.db.query("collections").withIndex("by_user_id", (q) => q.eq("userId", "demo-user")).take(500),
    user
      ? ctx.db.query("collections").withIndex("by_user_id", (q) => q.eq("userId", user.userId)).take(500)
      : Promise.resolve([]),
  ]);
  return mergeById(groups, (collection) => collection.collectionId);
}

export const list = query({
  args: { serverSecret: v.string(), sessionId: v.optional(v.string()) },
  returns: v.object({
    components: v.array(publicComponentValidator),
    collections: v.array(publicCollectionValidator),
  }),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await resolveUserBySession(ctx, args.sessionId);
    const [components, collections] = await Promise.all([
      accessibleComponents(ctx, user),
      accessibleCollections(ctx, user),
    ]);
    return {
      components: components.map(publicComponent),
      collections: collections.map(publicCollection),
    };
  },
});

export const listComponents = query({
  args: { serverSecret: v.string(), sessionId: v.optional(v.string()) },
  returns: v.array(publicComponentValidator),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await resolveUserBySession(ctx, args.sessionId);
    const components = await accessibleComponents(ctx, user);
    return components.map(publicComponent);
  },
});

export const getComponent = query({
  args: { serverSecret: v.string(), sessionId: v.optional(v.string()), id: v.string() },
  returns: v.union(publicComponentValidator, v.null()),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await resolveUserBySession(ctx, args.sessionId);
    const byId = await ctx.db.query("components").withIndex("by_component_id", (q) => q.eq("componentId", args.id)).unique();
    const bySlug = byId ? [] : await ctx.db.query("components").withIndex("by_slug", (q) => q.eq("slug", args.id)).take(20);
    const component = byId ?? bySlug.find((candidate) => canReadComponent(candidate, user));
    return component && canReadComponent(component, user) ? publicComponent(component) : null;
  },
});

export const listCollections = query({
  args: { serverSecret: v.string(), sessionId: v.optional(v.string()) },
  returns: v.array(publicCollectionValidator),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await resolveUserBySession(ctx, args.sessionId);
    const collections = await accessibleCollections(ctx, user);
    return collections.map(publicCollection);
  },
});

export const getCollection = query({
  args: { serverSecret: v.string(), sessionId: v.optional(v.string()), id: v.string() },
  returns: v.union(publicCollectionValidator, v.null()),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await resolveUserBySession(ctx, args.sessionId);
    const collection = await ctx.db.query("collections").withIndex("by_collection_id", (q) => q.eq("collectionId", args.id)).unique();
    return collection && canReadCollection(collection, user) ? publicCollection(collection) : null;
  },
});

export const seed = mutation({
  args: {
    serverSecret: v.string(),
    components: v.array(componentInputValidator),
    collections: v.array(collectionInputValidator),
  },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const [existingComponents, existingCollections] = await Promise.all([
      ctx.db.query("components").take(1000),
      ctx.db.query("collections").take(500),
    ]);
    const componentIds = new Set(existingComponents.map((component) => component.componentId));
    const collectionIds = new Set(existingCollections.map((collection) => collection.collectionId));

    for (const collection of existingCollections) {
      if (!collection.userId) await ctx.db.patch(collection._id, { userId: "demo-user" });
    }

    for (const component of args.components) {
      if (typeof component.id === "string" && !componentIds.has(component.id)) {
        await ctx.db.insert("components", componentInsert(component));
      }
    }

    for (const collection of args.collections) {
      if (typeof collection.id === "string" && !collectionIds.has(collection.id)) {
        await ctx.db.insert("collections", collectionInsert(collection, "demo-user"));
      }
    }

    return { ok: true };
  },
});

export const createComponent = mutation({
  args: { serverSecret: v.string(), sessionId: v.string(), component: componentInputValidator },
  returns: publicComponentValidator,
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await requireUserBySession(ctx, args.sessionId);
    const existingId = await ctx.db.query("components").withIndex("by_component_id", (q) => q.eq("componentId", args.component.id)).unique();
    const existingSlug = await ctx.db.query("components").withIndex("by_user_id_and_slug", (q) => q.eq("userId", user.userId).eq("slug", args.component.slug)).unique();
    if (existingId || existingSlug) throw new ConvexError("RESOURCE_CONFLICT");
    const component = componentInsert({ ...args.component, userId: user.userId });
    const componentId = await ctx.db.insert("components", component);
    const created = await ctx.db.get(componentId);
    if (!created) throw new Error("Component creation failed.");
    return publicComponent(created);
  },
});

export const updateComponent = mutation({
  args: { serverSecret: v.string(), sessionId: v.string(), id: v.string(), patch: componentPatch },
  returns: v.union(publicComponentValidator, v.null()),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await requireUserBySession(ctx, args.sessionId);
    const byId = await ctx.db.query("components").withIndex("by_component_id", (q) => q.eq("componentId", args.id)).unique();
    const bySlug = byId ? [] : await ctx.db.query("components").withIndex("by_slug", (q) => q.eq("slug", args.id)).take(20);
    const component = byId ?? bySlug.find((candidate) => canManageResource(user, candidate.userId));
    if (!component) return null;
    if (!canManageResource(user, component.userId)) return null;

    if (args.patch.slug && args.patch.slug !== component.slug) {
      const existingSlug = await ctx.db.query("components").withIndex("by_user_id_and_slug", (q) => q.eq("userId", component.userId).eq("slug", args.patch.slug!)).unique();
      if (existingSlug) throw new ConvexError("RESOURCE_CONFLICT");
    }

    await ctx.db.patch(component._id, args.patch);
    const updated = await ctx.db.get(component._id);
    return updated ? publicComponent(updated) : null;
  },
});

export const deleteComponent = mutation({
  args: { serverSecret: v.string(), sessionId: v.string(), id: v.string() },
  returns: v.object({ deleted: v.boolean() }),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await requireUserBySession(ctx, args.sessionId);
    const byId = await ctx.db.query("components").withIndex("by_component_id", (q) => q.eq("componentId", args.id)).unique();
    const bySlug = byId ? [] : await ctx.db.query("components").withIndex("by_slug", (q) => q.eq("slug", args.id)).take(20);
    const component = byId ?? bySlug.find((candidate) => canManageResource(user, candidate.userId));
    if (!component) return { deleted: false };
    if (!canManageResource(user, component.userId)) return { deleted: false };

    await ctx.db.delete(component._id);
    const collections = await ctx.db.query("collections").withIndex("by_user_id", (q) => q.eq("userId", component.userId)).take(500);
    for (const collection of collections) {
      if (collection.componentIds.includes(component.componentId)) {
        await ctx.db.patch(collection._id, {
          componentIds: collection.componentIds.filter((item: string) => item !== component.componentId),
        });
      }
    }

    return { deleted: true };
  },
});

export const createCollection = mutation({
  args: { serverSecret: v.string(), sessionId: v.string(), collection: collectionInputValidator },
  returns: publicCollectionValidator,
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await requireUserBySession(ctx, args.sessionId);
    const existing = await ctx.db.query("collections").withIndex("by_collection_id", (q) => q.eq("collectionId", args.collection.id)).unique();
    if (existing) throw new ConvexError("RESOURCE_CONFLICT");
    const collection = collectionInsert(args.collection, user.userId);
    const collectionId = await ctx.db.insert("collections", collection);
    const created = await ctx.db.get(collectionId);
    if (!created) throw new Error("Collection creation failed.");
    return publicCollection(created);
  },
});

export const updateCollection = mutation({
  args: { serverSecret: v.string(), sessionId: v.string(), id: v.string(), patch: collectionPatch },
  returns: v.union(publicCollectionValidator, v.null()),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await requireUserBySession(ctx, args.sessionId);
    const collection = await ctx.db.query("collections").withIndex("by_collection_id", (q) => q.eq("collectionId", args.id)).unique();
    if (!collection) return null;
    if (!canManageResource(user, collection.userId)) return null;

    await ctx.db.patch(collection._id, args.patch);
    const updated = await ctx.db.get(collection._id);
    return updated ? publicCollection(updated) : null;
  },
});

export const deleteCollection = mutation({
  args: { serverSecret: v.string(), sessionId: v.string(), id: v.string() },
  returns: v.object({ deleted: v.boolean() }),
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await requireUserBySession(ctx, args.sessionId);
    const collection = await ctx.db.query("collections").withIndex("by_collection_id", (q) => q.eq("collectionId", args.id)).unique();
    if (!collection) return { deleted: false };
    if (!canManageResource(user, collection.userId)) return { deleted: false };
    await ctx.db.delete(collection._id);
    return { deleted: true };
  },
});
