import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { anyApi } from "convex/server";
import { demoCollections, demoComponents } from "@/services/demo-data";
import type { Collection, VaultComponent } from "@/types/vault";

export type WorkspacePreferences = {
  gridSize: number;
  defaultViewport: "Desktop" | "Tablet" | "Mobile";
  autosaveDebounce: number;
  previewTheme: "Light" | "Dark";
  componentReviewRequests: boolean;
  tokenDriftAlerts: boolean;
  weeklyUsageDigest: boolean;
};

export const defaultWorkspacePreferences: WorkspacePreferences = {
  gridSize: 8,
  defaultViewport: "Desktop",
  autosaveDebounce: 900,
  previewTheme: "Light",
  componentReviewRequests: true,
  tokenDriftAlerts: true,
  weeklyUsageDigest: false,
};

export type VaultUser = {
  id: string;
  userId?: string;
  name: string;
  email: string;
  passwordHash?: string;
  createdAt: string;
  favoriteComponentIds?: string[];
  workspacePreferences?: WorkspacePreferences;
};

export type VaultSession = {
  id: string;
  sessionId?: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};

export type VaultDatabase = {
  users: VaultUser[];
  sessions: VaultSession[];
  components: VaultComponent[];
  collections: Collection[];
};

const api = anyApi;
const demoUserId = "demo-user";
const sessionMs = 1000 * 60 * 60 * 24 * 14;
const passwordResetMs = 1000 * 60 * 30;
let seeded = false;
const fallbackUsers = new Map<string, VaultUser>();
const fallbackSessions = new Map<string, VaultSession>();
const fallbackSessionPrefix = "fallback.";

export function getConvexUrl() {
  return process.env.NEXT_PUBLIC_CONVEX_URL || "https://quixotic-hamster-78.convex.cloud";
}

function convexOptions() {
  return { url: getConvexUrl() };
}

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function fallbackDemoUser() {
  return {
    id: demoUserId,
    name: "Demo Operator",
    email: "demo@componentvault.dev",
    passwordHash: hashPassword("vault-demo", "component-vault-demo-salt"),
    createdAt: new Date("2026-07-27T12:00:00.000Z").toISOString(),
  } satisfies VaultUser;
}

function canUseLocalFallback() {
  return process.env.NODE_ENV !== "production";
}

function ensureFallbackDemoUser() {
  const demo = fallbackDemoUser();
  if (!fallbackUsers.has(demo.email)) fallbackUsers.set(demo.email, demo);
  return demo;
}

function fallbackUserById(userId: string) {
  ensureFallbackDemoUser();
  return Array.from(fallbackUsers.values()).find((user) => user.id === userId || user.userId === userId) ?? null;
}

function signFallbackSession(userId: string, email: string, expiresAt: string) {
  return createHash("sha256").update(`${userId}:${email}:${expiresAt}:component-vault-local-fallback`).digest("hex");
}

function createFallbackSessionId(user: VaultUser, expiresAt: string) {
  const payload = {
    userId: user.id || user.userId || demoUserId,
    name: user.name,
    email: user.email,
    expiresAt,
    signature: signFallbackSession(user.id || user.userId || demoUserId, user.email, expiresAt),
  };
  return `${fallbackSessionPrefix}${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;
}

function readFallbackSessionUser(sessionId: string) {
  if (!canUseLocalFallback()) return null;
  if (!sessionId.startsWith(fallbackSessionPrefix)) return null;
  try {
    const payload = JSON.parse(Buffer.from(sessionId.slice(fallbackSessionPrefix.length), "base64url").toString("utf8")) as {
      userId?: string;
      name?: string;
      email?: string;
      expiresAt?: string;
      signature?: string;
    };
    if (!payload.userId || !payload.name || !payload.email || !payload.expiresAt || !payload.signature) return null;
    if (new Date(payload.expiresAt).getTime() <= Date.now()) return null;
    if (payload.signature !== signFallbackSession(payload.userId, payload.email, payload.expiresAt)) return null;
    return {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      createdAt: new Date("2026-07-27T12:00:00.000Z").toISOString(),
      passwordHash: payload.email === "demo@componentvault.dev" ? fallbackDemoUser().passwordHash : undefined,
    } satisfies VaultUser;
  } catch {
    return null;
  }
}

function mergeSeedComponents(components: VaultComponent[]) {
  const componentIds = new Set(components.map((component) => component.id));
  return [...components, ...demoComponents.filter((component) => !componentIds.has(component.id))];
}

function mergeSeedCollections(collections: Collection[]) {
  const byId = new Map(collections.map((collection) => [collection.id, collection]));
  for (const collection of demoCollections) {
    const current = byId.get(collection.id);
    if (!current) {
      byId.set(collection.id, collection);
      continue;
    }
    byId.set(collection.id, {
      ...current,
      componentIds: Array.from(new Set([...current.componentIds, ...collection.componentIds])),
    });
  }
  return Array.from(byId.values());
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

export function publicUser(user: VaultUser) {
  return {
    id: user.id || user.userId || demoUserId,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    favoriteComponentIds: user.favoriteComponentIds ?? [],
    workspacePreferences: user.workspacePreferences ?? defaultWorkspacePreferences,
  };
}

export async function ensureVaultSeed() {
  if (seeded) return;

  await fetchMutation(
    api.auth.ensureDemoUser,
    {
      userId: demoUserId,
      name: "Demo Operator",
      email: "demo@componentvault.dev",
      passwordHash: hashPassword("vault-demo"),
      createdAt: new Date("2026-07-27T12:00:00.000Z").toISOString(),
    },
    convexOptions(),
  );
  await fetchMutation(
    api.vault.seed,
    {
      components: demoComponents,
      collections: demoCollections,
    },
    convexOptions(),
  );

  seeded = true;
}

export async function readVaultDb(): Promise<VaultDatabase> {
  try {
    await ensureVaultSeed();
    const payload = (await fetchQuery(api.vault.list, {}, convexOptions())) as {
      components: VaultComponent[];
      collections: Collection[];
    };

    return {
      users: [],
      sessions: [],
      components: mergeSeedComponents(payload.components),
      collections: mergeSeedCollections(payload.collections),
    };
  } catch {
    return {
      users: [],
      sessions: [],
      components: demoComponents,
      collections: demoCollections,
    };
  }
}

export async function listVaultComponents() {
  try {
    await ensureVaultSeed();
    const components = (await fetchQuery(api.vault.listComponents, {}, convexOptions())) as VaultComponent[];
    return mergeSeedComponents(components);
  } catch {
    return demoComponents;
  }
}

export async function getVaultComponent(id: string) {
  try {
    await ensureVaultSeed();
    const component = (await fetchQuery(api.vault.getComponent, { id }, convexOptions())) as VaultComponent | null;
    return component ?? demoComponents.find((item) => item.id === id || item.slug === id) ?? null;
  } catch {
    return demoComponents.find((item) => item.id === id || item.slug === id) ?? null;
  }
}

export async function createVaultComponent(component: VaultComponent) {
  await ensureVaultSeed();
  return (await fetchMutation(api.vault.createComponent, { component }, convexOptions())) as VaultComponent;
}

export async function updateVaultComponent(id: string, patch: Partial<VaultComponent>) {
  await ensureVaultSeed();
  return (await fetchMutation(api.vault.updateComponent, { id, patch }, convexOptions())) as VaultComponent | null;
}

export async function toggleVaultFavorite(id: string) {
  await ensureVaultSeed();
  return (await fetchMutation(api.vault.toggleFavorite, { id }, convexOptions())) as VaultComponent | null;
}

export async function getFavoriteComponentIds(sessionId?: string) {
  try {
    await ensureVaultSeed();
    return (await fetchQuery(api.auth.getFavoritesBySession, { sessionId }, convexOptions())) as string[];
  } catch {
    return [];
  }
}

export async function toggleUserFavorite(sessionId: string, componentId: string) {
  await ensureVaultSeed();
  return (await fetchMutation(api.auth.toggleFavoriteBySession, { sessionId, componentId }, convexOptions())) as string[] | null;
}

export async function getWorkspacePreferences(sessionId?: string) {
  await ensureVaultSeed();
  return (await fetchQuery(api.auth.getWorkspacePreferencesBySession, { sessionId }, convexOptions())) as WorkspacePreferences | null;
}

export async function updateWorkspacePreferences(sessionId: string, preferences: WorkspacePreferences) {
  await ensureVaultSeed();
  return (await fetchMutation(api.auth.updateWorkspacePreferencesBySession, { sessionId, preferences }, convexOptions())) as WorkspacePreferences | null;
}

export async function deleteVaultComponent(id: string) {
  await ensureVaultSeed();
  return (await fetchMutation(api.vault.deleteComponent, { id }, convexOptions())) as { deleted: boolean };
}

export async function listVaultCollections() {
  try {
    await ensureVaultSeed();
    const collections = (await fetchQuery(api.vault.listCollections, {}, convexOptions())) as Collection[];
    return mergeSeedCollections(collections);
  } catch {
    return demoCollections;
  }
}

export async function getVaultCollection(id: string) {
  try {
    await ensureVaultSeed();
    const collection = (await fetchQuery(api.vault.getCollection, { id }, convexOptions())) as Collection | null;
    return collection ?? demoCollections.find((item) => item.id === id) ?? null;
  } catch {
    return demoCollections.find((item) => item.id === id) ?? null;
  }
}

export async function createVaultCollection(collection: Collection) {
  await ensureVaultSeed();
  return (await fetchMutation(api.vault.createCollection, { collection }, convexOptions())) as Collection;
}

export async function updateVaultCollection(id: string, patch: Partial<Collection>) {
  await ensureVaultSeed();
  return (await fetchMutation(api.vault.updateCollection, { id, patch }, convexOptions())) as Collection | null;
}

export async function deleteVaultCollection(id: string) {
  await ensureVaultSeed();
  return (await fetchMutation(api.vault.deleteCollection, { id }, convexOptions())) as { deleted: boolean };
}

export async function getUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    await ensureVaultSeed();
    const user = (await fetchQuery(api.auth.getUserByEmail, { email: normalizedEmail }, convexOptions())) as VaultUser | null;
    return user ? { ...user, id: user.id || user.userId || demoUserId } : null;
  } catch {
    if (!canUseLocalFallback()) return null;
    ensureFallbackDemoUser();
    return fallbackUsers.get(normalizedEmail) ?? null;
  }
}

export async function createLocalUser({ name, email, password }: { name: string; email: string; password: string }) {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    await ensureVaultSeed();
    const user = (await fetchMutation(
      api.auth.createUser,
      {
        userId: randomUUID(),
        name,
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        createdAt: new Date().toISOString(),
      },
      convexOptions(),
    )) as VaultUser;

    return { ...user, id: user.id || user.userId || demoUserId };
  } catch {
    if (!canUseLocalFallback()) throw new Error("Unable to register user.");
    ensureFallbackDemoUser();
    if (fallbackUsers.has(normalizedEmail)) throw new Error("Email already registered.");
    const user: VaultUser = {
      id: randomUUID(),
      name,
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    fallbackUsers.set(normalizedEmail, user);
    return user;
  }
}

export async function createLocalSession(userId: string) {
  const now = Date.now();
  const sessionInput = {
    sessionId: randomUUID(),
    userId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + sessionMs).toISOString(),
  };

  try {
    await ensureVaultSeed();
    const session = (await fetchMutation(api.auth.createSession, sessionInput, convexOptions())) as VaultSession;
    return { ...session, id: session.id || session.sessionId || "" };
  } catch {
    if (!canUseLocalFallback()) throw new Error("Unable to create session.");
    const user = fallbackUserById(userId) ?? ensureFallbackDemoUser();
    const sessionId = createFallbackSessionId(user, sessionInput.expiresAt);
    const session: VaultSession = { id: sessionId, sessionId, userId: user.id, createdAt: sessionInput.createdAt, expiresAt: sessionInput.expiresAt };
    fallbackSessions.set(session.id, session);
    return session;
  }
}

export async function destroyLocalSession(sessionId: string) {
  fallbackSessions.delete(sessionId);
  try {
    await fetchMutation(api.auth.destroySession, { sessionId }, convexOptions());
  } catch {
    return;
  }
}

export async function getUserBySession(sessionId?: string) {
  if (!sessionId) return null;
  const fallbackUser = readFallbackSessionUser(sessionId);
  if (fallbackUser) return fallbackUser;
  try {
    await ensureVaultSeed();
    const user = (await fetchQuery(api.auth.getUserBySession, { sessionId }, convexOptions())) as VaultUser | null;
    return user ? { ...user, id: user.id || user.userId || demoUserId } : null;
  } catch {
    const session = fallbackSessions.get(sessionId);
    if (!session || new Date(session.expiresAt).getTime() <= Date.now()) return null;
    return fallbackUserById(session.userId);
  }
}

export async function createPasswordReset(email: string) {
  await ensureVaultSeed();
  const token = randomBytes(32).toString("hex");
  const now = Date.now();
  const result = await fetchMutation(
    api.auth.createPasswordReset,
    {
      resetId: randomUUID(),
      email: email.trim().toLowerCase(),
      tokenHash: hashToken(token),
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + passwordResetMs).toISOString(),
    },
    convexOptions(),
  );

  return result ? token : null;
}

export async function resetLocalPassword({ token, password }: { token: string; password: string }) {
  await ensureVaultSeed();
  return (await fetchMutation(
    api.auth.resetPassword,
    {
      tokenHash: hashToken(token),
      passwordHash: hashPassword(password),
      usedAt: new Date().toISOString(),
    },
    convexOptions(),
  )) as VaultUser;
}



