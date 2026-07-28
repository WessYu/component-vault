import { v } from "convex/values";
import { mutationGeneric as mutation, queryGeneric as query } from "convex/server";

const componentPatch = v.object({
  name: v.optional(v.string()),
  slug: v.optional(v.string()),
  description: v.optional(v.string()),
  category: v.optional(v.string()),
  framework: v.optional(v.string()),
  language: v.optional(v.string()),
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
  tokens: v.optional(v.array(v.any())),
  usage: v.optional(v.array(v.any())),
  props: v.optional(v.any()),
});

const collectionPatch = v.object({
  name: v.optional(v.string()),
  description: v.optional(v.string()),
  componentIds: v.optional(v.array(v.string())),
  updatedAt: v.optional(v.string()),
});

type ConvexDocument = {
  _id?: unknown;
  _creationTime?: unknown;
  [key: string]: unknown;
};

type ComponentDocument = ConvexDocument & {
  componentId: string;
  isFavorite: boolean;
};

type CollectionDocument = ConvexDocument & {
  collectionId: string;
  componentIds: string[];
};

function withoutSystemFields<T extends ConvexDocument>(document: T) {
  const clone = { ...document };
  delete clone._id;
  delete clone._creationTime;
  return clone;
}

function publicComponent(component: ComponentDocument) {
  const { componentId, ...rest } = withoutSystemFields(component);
  return {
    ...rest,
    id: componentId,
  };
}

function publicCollection(collection: CollectionDocument) {
  const { collectionId, ...rest } = withoutSystemFields(collection);
  return {
    ...rest,
    id: collectionId,
  };
}

function componentInsert(component: Record<string, unknown>) {
  const { id, ...rest } = component;
  if (typeof id !== "string") throw new Error("Component id is required.");
  return {
    ...rest,
    componentId: id,
  };
}

function collectionInsert(collection: Record<string, unknown>) {
  const { id, ...rest } = collection;
  if (typeof id !== "string") throw new Error("Collection id is required.");
  return {
    ...rest,
    collectionId: id,
  };
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const [components, collections] = await Promise.all([ctx.db.query("components").collect(), ctx.db.query("collections").collect()]);
    return {
      components: components.map(publicComponent),
      collections: collections.map(publicCollection),
    };
  },
});

export const listComponents = query({
  args: {},
  handler: async (ctx) => {
    const components = await ctx.db.query("components").collect();
    return components.map(publicComponent);
  },
});

export const getComponent = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const byId = await ctx.db.query("components").withIndex("by_component_id", (q) => q.eq("componentId", args.id)).unique();
    const component = byId ?? (await ctx.db.query("components").withIndex("by_slug", (q) => q.eq("slug", args.id)).unique());
    return component ? publicComponent(component) : null;
  },
});

export const listCollections = query({
  args: {},
  handler: async (ctx) => {
    const collections = await ctx.db.query("collections").collect();
    return collections.map(publicCollection);
  },
});

export const getCollection = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const collection = await ctx.db.query("collections").withIndex("by_collection_id", (q) => q.eq("collectionId", args.id)).unique();
    return collection ? publicCollection(collection) : null;
  },
});

export const seed = mutation({
  args: {
    components: v.array(v.any()),
    collections: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const [existingComponents, existingCollections] = await Promise.all([
      ctx.db.query("components").collect(),
      ctx.db.query("collections").collect(),
    ]);
    const componentIds = new Set(existingComponents.map((component) => component.componentId));
    const collectionIds = new Set(existingCollections.map((collection) => collection.collectionId));

    for (const component of args.components) {
      if (typeof component.id === "string" && !componentIds.has(component.id)) {
        await ctx.db.insert("components", componentInsert(component));
      }
    }

    for (const collection of args.collections) {
      if (typeof collection.id === "string" && !collectionIds.has(collection.id)) {
        await ctx.db.insert("collections", collectionInsert(collection));
      }
    }

    return { ok: true };
  },
});

export const createComponent = mutation({
  args: { component: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.insert("components", componentInsert(args.component));
    return args.component;
  },
});

export const updateComponent = mutation({
  args: { id: v.string(), patch: componentPatch },
  handler: async (ctx, args) => {
    const byId = await ctx.db.query("components").withIndex("by_component_id", (q) => q.eq("componentId", args.id)).unique();
    const component = byId ?? (await ctx.db.query("components").withIndex("by_slug", (q) => q.eq("slug", args.id)).unique());
    if (!component) return null;

    await ctx.db.patch(component._id, args.patch);
    const updated = await ctx.db.get(component._id);
    return updated ? publicComponent(updated) : null;
  },
});

export const toggleFavorite = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const byId = await ctx.db.query("components").withIndex("by_component_id", (q) => q.eq("componentId", args.id)).unique();
    const component = byId ?? (await ctx.db.query("components").withIndex("by_slug", (q) => q.eq("slug", args.id)).unique());
    if (!component) return null;

    await ctx.db.patch(component._id, {
      isFavorite: !component.isFavorite,
      updatedAt: new Date().toISOString(),
    });
    const updated = await ctx.db.get(component._id);
    return updated ? publicComponent(updated) : null;
  },
});

export const deleteComponent = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const byId = await ctx.db.query("components").withIndex("by_component_id", (q) => q.eq("componentId", args.id)).unique();
    const component = byId ?? (await ctx.db.query("components").withIndex("by_slug", (q) => q.eq("slug", args.id)).unique());
    if (!component) return { deleted: false };

    await ctx.db.delete(component._id);
    const collections = await ctx.db.query("collections").collect();
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
  args: { collection: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.insert("collections", collectionInsert(args.collection));
    return args.collection;
  },
});

export const updateCollection = mutation({
  args: { id: v.string(), patch: collectionPatch },
  handler: async (ctx, args) => {
    const collection = await ctx.db.query("collections").withIndex("by_collection_id", (q) => q.eq("collectionId", args.id)).unique();
    if (!collection) return null;

    await ctx.db.patch(collection._id, args.patch);
    const updated = await ctx.db.get(collection._id);
    return updated ? publicCollection(updated) : null;
  },
});

export const deleteCollection = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const collection = await ctx.db.query("collections").withIndex("by_collection_id", (q) => q.eq("collectionId", args.id)).unique();
    if (!collection) return { deleted: false };
    await ctx.db.delete(collection._id);
    return { deleted: true };
  },
});
