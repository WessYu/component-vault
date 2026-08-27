import { v } from "convex/values";

export const roleValidator = v.union(v.literal("admin"), v.literal("user"));

export const preferencesValidator = v.object({
  gridSize: v.number(),
  defaultViewport: v.union(v.literal("Desktop"), v.literal("Tablet"), v.literal("Mobile")),
  autosaveDebounce: v.number(),
  previewTheme: v.union(v.literal("Light"), v.literal("Dark")),
  componentReviewRequests: v.boolean(),
  tokenDriftAlerts: v.boolean(),
  weeklyUsageDigest: v.boolean(),
});

export const credentialUserValidator = v.object({
  userId: v.string(),
  name: v.string(),
  email: v.string(),
  passwordHash: v.string(),
  createdAt: v.string(),
  role: v.optional(roleValidator),
  favoriteComponentIds: v.optional(v.array(v.string())),
  workspacePreferences: v.optional(preferencesValidator),
});

export const publicUserValidator = v.object({
  id: v.string(),
  name: v.string(),
  email: v.string(),
  createdAt: v.string(),
  role: roleValidator,
  favoriteComponentIds: v.array(v.string()),
  workspacePreferences: preferencesValidator,
});

export const designTokenValidator = v.object({
  id: v.string(),
  type: v.union(
    v.literal("color"),
    v.literal("spacing"),
    v.literal("radius"),
    v.literal("shadow"),
    v.literal("typography"),
    v.literal("border"),
  ),
  name: v.string(),
  value: v.string(),
});

export const componentUsageValidator = v.object({
  id: v.string(),
  projectName: v.string(),
  location: v.string(),
  url: v.string(),
  count: v.number(),
});

export const componentPropsValidator = v.object({
  variant: v.union(
    v.literal("Primary"),
    v.literal("Secondary"),
    v.literal("Ghost"),
    v.literal("Danger"),
    v.literal("Success"),
    v.literal("Reference"),
  ),
  size: v.union(v.literal("Small"), v.literal("Medium"), v.literal("Large")),
  state: v.union(
    v.literal("Default"),
    v.literal("Hover"),
    v.literal("Focus"),
    v.literal("Active"),
    v.literal("Disabled"),
    v.literal("Loading"),
    v.literal("Error"),
  ),
  iconLeft: v.boolean(),
  iconRight: v.boolean(),
  fullWidth: v.boolean(),
  disabled: v.boolean(),
  loading: v.boolean(),
});

export const categoryValidator = v.union(
  v.literal("Buttons"),
  v.literal("Cards"),
  v.literal("Forms"),
  v.literal("Navigation"),
  v.literal("Data Display"),
  v.literal("Feedback"),
  v.literal("Surfaces"),
  v.literal("Charts"),
  v.literal("Utilities"),
  v.literal("Motion Experiences"),
);

export const componentInputValidator = v.object({
  id: v.string(),
  userId: v.string(),
  name: v.string(),
  slug: v.string(),
  description: v.string(),
  category: categoryValidator,
  framework: v.union(v.literal("React"), v.literal("HTML")),
  language: v.union(v.literal("tsx"), v.literal("jsx"), v.literal("html")),
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
});

export const publicComponentValidator = componentInputValidator;

export const collectionInputValidator = v.object({
  id: v.string(),
  name: v.string(),
  description: v.string(),
  componentIds: v.array(v.string()),
  updatedAt: v.string(),
});

export const publicCollectionValidator = collectionInputValidator;
