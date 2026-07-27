import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { anyApi } from "convex/server";
import { demoCollections, demoComponents } from "@/services/demo-data";
import type { Collection, VaultComponent } from "@/types/vault";

export type VaultUser = {
  id: string;
  userId?: string;
  name: string;
  email: string;
  passwordHash?: string;
  createdAt: string;
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
  await ensureVaultSeed();
  const payload = (await fetchQuery(api.vault.list, {}, convexOptions())) as {
    components: VaultComponent[];
    collections: Collection[];
  };

  return {
    users: [],
    sessions: [],
    components: payload.components,
    collections: payload.collections,
  };
}

export async function listVaultComponents() {
  await ensureVaultSeed();
  return (await fetchQuery(api.vault.listComponents, {}, convexOptions())) as VaultComponent[];
}

export async function getVaultComponent(id: string) {
  await ensureVaultSeed();
  return (await fetchQuery(api.vault.getComponent, { id }, convexOptions())) as VaultComponent | null;
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

export async function deleteVaultComponent(id: string) {
  await ensureVaultSeed();
  return (await fetchMutation(api.vault.deleteComponent, { id }, convexOptions())) as { deleted: boolean };
}

export async function listVaultCollections() {
  await ensureVaultSeed();
  return (await fetchQuery(api.vault.listCollections, {}, convexOptions())) as Collection[];
}

export async function getVaultCollection(id: string) {
  await ensureVaultSeed();
  return (await fetchQuery(api.vault.getCollection, { id }, convexOptions())) as Collection | null;
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
  await ensureVaultSeed();
  const user = (await fetchQuery(api.auth.getUserByEmail, { email }, convexOptions())) as VaultUser | null;
  return user ? { ...user, id: user.id || user.userId || demoUserId } : null;
}

export async function createLocalUser({ name, email, password }: { name: string; email: string; password: string }) {
  await ensureVaultSeed();
  const normalizedEmail = email.trim().toLowerCase();
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
}

export async function createLocalSession(userId: string) {
  await ensureVaultSeed();
  const now = Date.now();
  const session = (await fetchMutation(
    api.auth.createSession,
    {
      sessionId: randomUUID(),
      userId,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + sessionMs).toISOString(),
    },
    convexOptions(),
  )) as VaultSession;

  return { ...session, id: session.id || session.sessionId || "" };
}

export async function destroyLocalSession(sessionId: string) {
  await fetchMutation(api.auth.destroySession, { sessionId }, convexOptions());
}

export async function getUserBySession(sessionId?: string) {
  await ensureVaultSeed();
  const user = (await fetchQuery(api.auth.getUserBySession, { sessionId }, convexOptions())) as VaultUser | null;
  return user ? { ...user, id: user.id || user.userId || demoUserId } : null;
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
