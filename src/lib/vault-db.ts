import { createHash, randomBytes, randomUUID, scrypt, scryptSync, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { anyApi } from "convex/server";
import { demoCollections, demoComponents } from "@/services/demo-data";
import type { Collection, VaultComponent } from "@/types/vault";
import { ApiError } from "@/lib/api-security";

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
  role?: "admin" | "user";
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
const dummyPasswordHash = hashPasswordSync("component-vault-invalid-password", "component-vault-login-dummy");
let seedPromise: Promise<void> | null = null;
const fallbackUsers = new Map<string, VaultUser>();
const fallbackSessions = new Map<string, VaultSession>();
const fallbackSessionPrefix = "fallback.";

export function getConvexUrl() {
  return process.env.NEXT_PUBLIC_CONVEX_URL;
}

function convexOptions() {
  const url = getConvexUrl();
  if (!url) throw new Error("Convex is not configured.");
  return { url };
}

function serverSecret() {
  const value = process.env.COMPONENT_VAULT_SERVER_SECRET;
  if (!value || value.length < 32) throw new Error("The backend server secret is not configured.");
  return value;
}

function databaseSessionId(sessionId: string): string;
function databaseSessionId(sessionId?: string): string | undefined;
function databaseSessionId(sessionId?: string) {
  if (!sessionId || sessionId.startsWith(fallbackSessionPrefix)) return sessionId;
  return hashToken(sessionId);
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = await scryptAsync(password, salt, 64) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

function hashPasswordSync(password: string, salt = randomBytes(16).toString("hex")) {
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
    passwordHash: hashPasswordSync("vault-demo", "component-vault-demo-salt"),
    createdAt: new Date("2026-07-27T12:00:00.000Z").toISOString(),
  } satisfies VaultUser;
}

function canUseLocalFallback() {
  return process.env.NODE_ENV !== "production" && process.env.ENABLE_LOCAL_BACKEND_FALLBACK === "true";
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

export async function verifyPassword(password: string, storedHash?: string) {
  const validStoredHash = storedHash && /^[a-f0-9]+:[a-f0-9]{128}$/i.test(storedHash)
    ? storedHash
    : dummyPasswordHash;
  const [salt, hash] = validStoredHash.split(":");
  const candidate = await scryptAsync(password, salt, 64) as Buffer;
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
    role: user.role ?? "user",
    favoriteComponentIds: user.favoriteComponentIds ?? [],
    workspacePreferences: user.workspacePreferences ?? defaultWorkspacePreferences,
  };
}

export async function ensureVaultSeed() {
  if (!seedPromise) {
    seedPromise = (async () => {
      await fetchMutation(
        api.auth.ensureDemoUser,
        {
          userId: demoUserId,
          serverSecret: serverSecret(),
          name: "Demo Operator",
          email: "demo@componentvault.dev",
          passwordHash: await hashPassword("vault-demo"),
          createdAt: new Date("2026-07-27T12:00:00.000Z").toISOString(),
        },
        convexOptions(),
      );
      await fetchMutation(
        api.vault.seed,
        {
          components: demoComponents,
          collections: demoCollections,
          serverSecret: serverSecret(),
        },
        convexOptions(),
      );
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  await seedPromise;
}

export async function readVaultDb(sessionId?: string): Promise<VaultDatabase> {
  try {
    await ensureVaultSeed();
    const payload = (await fetchQuery(api.vault.list, { serverSecret: serverSecret(), sessionId: databaseSessionId(sessionId) }, convexOptions())) as {
      components: VaultComponent[];
      collections: Collection[];
    };

    return {
      users: [],
      sessions: [],
      components: payload.components,
      collections: payload.collections,
    };
  } catch (error) {
    if (!canUseLocalFallback()) throw error;
    return {
      users: [],
      sessions: [],
      components: demoComponents,
      collections: demoCollections,
    };
  }
}

export async function listVaultComponents(sessionId?: string) {
  try {
    await ensureVaultSeed();
    const components = (await fetchQuery(api.vault.listComponents, { serverSecret: serverSecret(), sessionId: databaseSessionId(sessionId) }, convexOptions())) as VaultComponent[];
    return components;
  } catch (error) {
    if (!canUseLocalFallback()) throw error;
    return demoComponents;
  }
}

export async function getVaultComponent(id: string, sessionId?: string) {
  try {
    await ensureVaultSeed();
    const component = (await fetchQuery(api.vault.getComponent, { serverSecret: serverSecret(), sessionId: databaseSessionId(sessionId), id }, convexOptions())) as VaultComponent | null;
    return component;
  } catch (error) {
    if (!canUseLocalFallback()) throw error;
    return demoComponents.find((item) => item.id === id || item.slug === id) ?? null;
  }
}

export async function createVaultComponent(sessionId: string, component: VaultComponent) {
  await ensureVaultSeed();
  return (await fetchMutation(api.vault.createComponent, { serverSecret: serverSecret(), sessionId: databaseSessionId(sessionId), component }, convexOptions())) as VaultComponent;
}

export async function updateVaultComponent(sessionId: string, id: string, patch: Partial<VaultComponent>) {
  await ensureVaultSeed();
  return (await fetchMutation(api.vault.updateComponent, { serverSecret: serverSecret(), sessionId: databaseSessionId(sessionId), id, patch }, convexOptions())) as VaultComponent | null;
}

export async function getFavoriteComponentIds(sessionId?: string) {
  try {
    await ensureVaultSeed();
    return (await fetchQuery(api.auth.getFavoritesBySession, { serverSecret: serverSecret(), sessionId: databaseSessionId(sessionId) }, convexOptions())) as string[];
  } catch (error) {
    if (!canUseLocalFallback()) throw error;
    return [];
  }
}

export async function toggleUserFavorite(sessionId: string, componentId: string) {
  await ensureVaultSeed();
  return (await fetchMutation(api.auth.toggleFavoriteBySession, { serverSecret: serverSecret(), sessionId: databaseSessionId(sessionId), componentId }, convexOptions())) as string[] | null;
}

export async function getWorkspacePreferences(sessionId?: string) {
  await ensureVaultSeed();
  return (await fetchQuery(api.auth.getWorkspacePreferencesBySession, { serverSecret: serverSecret(), sessionId: databaseSessionId(sessionId) }, convexOptions())) as WorkspacePreferences | null;
}

export async function updateWorkspacePreferences(sessionId: string, preferences: WorkspacePreferences) {
  await ensureVaultSeed();
  return (await fetchMutation(api.auth.updateWorkspacePreferencesBySession, { serverSecret: serverSecret(), sessionId: databaseSessionId(sessionId), preferences }, convexOptions())) as WorkspacePreferences | null;
}

export async function deleteVaultComponent(sessionId: string, id: string) {
  await ensureVaultSeed();
  return (await fetchMutation(api.vault.deleteComponent, { serverSecret: serverSecret(), sessionId: databaseSessionId(sessionId), id }, convexOptions())) as { deleted: boolean };
}

export async function listVaultCollections(sessionId?: string) {
  try {
    await ensureVaultSeed();
    const collections = (await fetchQuery(api.vault.listCollections, { serverSecret: serverSecret(), sessionId: databaseSessionId(sessionId) }, convexOptions())) as Collection[];
    return collections;
  } catch (error) {
    if (!canUseLocalFallback()) throw error;
    return demoCollections;
  }
}

export async function getVaultCollection(id: string, sessionId?: string) {
  try {
    await ensureVaultSeed();
    const collection = (await fetchQuery(api.vault.getCollection, { serverSecret: serverSecret(), sessionId: databaseSessionId(sessionId), id }, convexOptions())) as Collection | null;
    return collection;
  } catch (error) {
    if (!canUseLocalFallback()) throw error;
    return demoCollections.find((item) => item.id === id) ?? null;
  }
}

export async function createVaultCollection(sessionId: string, collection: Collection) {
  await ensureVaultSeed();
  return (await fetchMutation(api.vault.createCollection, { serverSecret: serverSecret(), sessionId: databaseSessionId(sessionId), collection }, convexOptions())) as Collection;
}

export async function updateVaultCollection(sessionId: string, id: string, patch: Partial<Collection>) {
  await ensureVaultSeed();
  return (await fetchMutation(api.vault.updateCollection, { serverSecret: serverSecret(), sessionId: databaseSessionId(sessionId), id, patch }, convexOptions())) as Collection | null;
}

export async function deleteVaultCollection(sessionId: string, id: string) {
  await ensureVaultSeed();
  return (await fetchMutation(api.vault.deleteCollection, { serverSecret: serverSecret(), sessionId: databaseSessionId(sessionId), id }, convexOptions())) as { deleted: boolean };
}

export async function getUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  try {
    await ensureVaultSeed();
    const user = (await fetchQuery(api.auth.getUserByEmail, { serverSecret: serverSecret(), email: normalizedEmail }, convexOptions())) as VaultUser | null;
    return user ? { ...user, id: user.id || user.userId || demoUserId } : null;
  } catch (error) {
    if (!canUseLocalFallback()) throw error;
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
        serverSecret: serverSecret(),
        name,
        email: normalizedEmail,
        passwordHash: await hashPassword(password),
        createdAt: new Date().toISOString(),
      },
      convexOptions(),
    )) as VaultUser;

    return { ...user, id: user.id || user.userId || demoUserId };
  } catch (error) {
    if (!canUseLocalFallback()) throw error;
    ensureFallbackDemoUser();
    if (fallbackUsers.has(normalizedEmail)) throw new Error("Email already registered.");
    const user: VaultUser = {
      id: randomUUID(),
      name,
      email: normalizedEmail,
      passwordHash: hashPasswordSync(password),
      createdAt: new Date().toISOString(),
    };
    fallbackUsers.set(normalizedEmail, user);
    return user;
  }
}

export async function createLocalSession(userId: string) {
  const now = Date.now();
  const sessionInput = {
    sessionId: randomBytes(32).toString("base64url"),
    userId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + sessionMs).toISOString(),
  };

  try {
    await ensureVaultSeed();
    const session = (await fetchMutation(api.auth.createSession, { ...sessionInput, serverSecret: serverSecret(), sessionId: hashToken(sessionInput.sessionId) }, convexOptions())) as VaultSession;
    return { ...session, sessionId: sessionInput.sessionId, id: sessionInput.sessionId };
  } catch (error) {
    if (!canUseLocalFallback()) throw error;
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
    await fetchMutation(api.auth.destroySession, { serverSecret: serverSecret(), sessionId: databaseSessionId(sessionId) }, convexOptions());
  } catch (error) {
    if (!canUseLocalFallback()) throw error;
  }
}

export async function getUserBySession(sessionId?: string) {
  if (!sessionId) return null;
  const fallbackUser = readFallbackSessionUser(sessionId);
  if (fallbackUser) return fallbackUser;
  try {
    await ensureVaultSeed();
    const user = (await fetchQuery(api.auth.getUserBySession, { serverSecret: serverSecret(), sessionId: databaseSessionId(sessionId) }, convexOptions())) as VaultUser | null;
    return user ? { ...user, id: user.id || user.userId || demoUserId } : null;
  } catch (error) {
    if (!canUseLocalFallback()) throw error;
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
      serverSecret: serverSecret(),
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
      serverSecret: serverSecret(),
      passwordHash: await hashPassword(password),
      usedAt: new Date().toISOString(),
    },
    convexOptions(),
  )) as VaultUser;
}

export async function consumeApiRateLimit(key: string, limit: number, windowMs: number) {
  const hashedKey = hashToken(key.trim().toLowerCase());
  const result = await fetchMutation(
    api.rateLimits.consume,
    { serverSecret: serverSecret(), key: hashedKey, limit, windowMs },
    convexOptions(),
  ) as { allowed: boolean; remaining: number; resetAt: number };

  if (!result.allowed) {
    throw new ApiError(429, "RATE_LIMITED", "Too many requests. Try again later.", {
      retryAfterSeconds: Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000)),
    });
  }

  return result;
}

export async function checkBackendReadiness() {
  return await fetchQuery(
    api.health.readiness,
    { serverSecret: serverSecret() },
    convexOptions(),
  ) as { ok: boolean; checkedAt: number };
}
