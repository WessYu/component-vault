import { z } from "zod";

const email = z.string().trim().toLowerCase().pipe(z.email().max(254));
const password = z.string().min(10).max(128);
const identifier = z.string().trim().min(1).max(160);

export const loginRequestSchema = z.object({
  email,
  password: z.string().min(1).max(128),
  remember: z.boolean().optional().default(true),
}).strict();

export const registerRequestSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email,
  password,
}).strict();

export const passwordResetRequestSchema = z.object({ email }).strict();
export const passwordResetConfirmSchema = z.object({ token: z.string().trim().min(32).max(256), password }).strict();

export const workspacePreferencesSchema = z.object({
  gridSize: z.number().finite().min(2).max(32),
  defaultViewport: z.enum(["Desktop", "Tablet", "Mobile"]),
  autosaveDebounce: z.number().finite().min(200).max(5000),
  previewTheme: z.enum(["Light", "Dark"]),
  componentReviewRequests: z.boolean(),
  tokenDriftAlerts: z.boolean(),
  weeklyUsageDigest: z.boolean(),
}).strict();

const componentFields = {
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().min(1).max(80).optional(),
  framework: z.enum(["React", "HTML"]).optional(),
  language: z.enum(["tsx", "jsx", "html"]).optional(),
  code: z.string().max(500_000).optional(),
  styles: z.string().max(500_000).optional(),
  usageCode: z.string().max(200_000).optional(),
  notes: z.string().max(20_000).optional(),
  version: z.string().trim().max(40).optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(identifier).max(50).optional(),
  collectionIds: z.array(identifier).max(100).optional(),
  previewHtml: z.string().max(500_000).optional(),
  tokens: z.array(z.unknown()).max(500).optional(),
  usage: z.array(z.unknown()).max(500).optional(),
  props: z.record(z.string(), z.unknown()).optional(),
};

export const createComponentSchema = z.object(componentFields).strict();
export const patchComponentSchema = z.object(componentFields).partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one component field is required." },
);

const collectionFields = {
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  componentIds: z.array(identifier).max(500).optional(),
};

export const createCollectionSchema = z.object(collectionFields).strict();
export const patchCollectionSchema = z.object(collectionFields).partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one collection field is required." },
);
