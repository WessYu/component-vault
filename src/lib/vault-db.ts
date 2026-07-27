import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { demoCollections, demoComponents } from "@/services/demo-data";
import type { Collection, VaultComponent } from "@/types/vault";

export type VaultUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type VaultSession = {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};

export type VaultPasswordReset = {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
};

export type VaultDatabase = {
  users: VaultUser[];
  sessions: VaultSession[];
  passwordResets: VaultPasswordReset[];
  components: VaultComponent[];
  collections: Collection[];
};

const dbDir = path.join(process.cwd(), ".data");
const dbPath = path.join(dbDir, "vault-db.json");
const demoUserId = "demo-user";
const sessionMs = 1000 * 60 * 60 * 24 * 14;
const passwordResetMs = 1000 * 60 * 30;

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

function seededDatabase(): VaultDatabase {
  return {
    users: [
      {
        id: demoUserId,
        name: "Demo Operator",
        email: "demo@componentvault.dev",
        passwordHash: hashPassword("vault-demo"),
        createdAt: new Date("2026-07-27T12:00:00.000Z").toISOString(),
      },
    ],
    sessions: [],
    passwordResets: [],
    components: demoComponents,
    collections: demoCollections,
  };
}

export async function readVaultDb(): Promise<VaultDatabase> {
  if (!existsSync(dbPath)) {
    const seeded = seededDatabase();
    await writeVaultDb(seeded);
    return seeded;
  }

  const raw = await readFile(dbPath, "utf8");
  const parsed = JSON.parse(raw) as Partial<VaultDatabase>;
  return {
    users: parsed.users?.length ? parsed.users : seededDatabase().users,
    sessions: parsed.sessions ?? [],
    passwordResets: parsed.passwordResets ?? [],
    components: parsed.components?.length ? parsed.components : demoComponents,
    collections: parsed.collections?.length ? parsed.collections : demoCollections,
  };
}

export async function writeVaultDb(database: VaultDatabase) {
  await mkdir(dbDir, { recursive: true });
  await writeFile(dbPath, JSON.stringify(database, null, 2), "utf8");
}

export async function createLocalUser({ name, email, password }: { name: string; email: string; password: string }) {
  const database = await readVaultDb();
  const normalizedEmail = email.trim().toLowerCase();
  if (database.users.some((user) => user.email === normalizedEmail)) {
    throw new Error("Email already registered.");
  }

  const user: VaultUser = {
    id: randomUUID(),
    name,
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  database.users.push(user);
  await writeVaultDb(database);
  return user;
}

export async function createLocalSession(userId: string) {
  const database = await readVaultDb();
  const now = Date.now();
  const session: VaultSession = {
    id: randomUUID(),
    userId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + sessionMs).toISOString(),
  };
  database.sessions = database.sessions.filter((item) => new Date(item.expiresAt).getTime() > now);
  database.sessions.push(session);
  await writeVaultDb(database);
  return session;
}

export async function createPasswordReset(email: string) {
  const database = await readVaultDb();
  const normalizedEmail = email.trim().toLowerCase();
  const user = database.users.find((item) => item.email === normalizedEmail);
  const now = Date.now();
  database.passwordResets = (database.passwordResets ?? []).filter((item) => !item.usedAt && new Date(item.expiresAt).getTime() > now);

  if (!user) {
    await writeVaultDb(database);
    return null;
  }

  const token = randomBytes(32).toString("hex");
  database.passwordResets.push({
    id: randomUUID(),
    userId: user.id,
    tokenHash: hashToken(token),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + passwordResetMs).toISOString(),
  });
  await writeVaultDb(database);
  return token;
}

export async function resetLocalPassword({ token, password }: { token: string; password: string }) {
  const database = await readVaultDb();
  const tokenHash = hashToken(token);
  const now = Date.now();
  const reset = database.passwordResets.find((item) => item.tokenHash === tokenHash && !item.usedAt && new Date(item.expiresAt).getTime() > now);

  if (!reset) {
    throw new Error("Password reset link is invalid or expired.");
  }

  const user = database.users.find((item) => item.id === reset.userId);
  if (!user) {
    throw new Error("User not found.");
  }

  user.passwordHash = hashPassword(password);
  reset.usedAt = new Date(now).toISOString();
  database.sessions = database.sessions.filter((session) => session.userId !== user.id);
  await writeVaultDb(database);
  return user;
}

export async function destroyLocalSession(sessionId: string) {
  const database = await readVaultDb();
  database.sessions = database.sessions.filter((session) => session.id !== sessionId);
  await writeVaultDb(database);
}

export async function getUserBySession(sessionId?: string) {
  if (!sessionId) return null;
  const database = await readVaultDb();
  const now = Date.now();
  const session = database.sessions.find((item) => item.id === sessionId && new Date(item.expiresAt).getTime() > now);
  if (!session) return null;
  return database.users.find((user) => user.id === session.userId) ?? null;
}

export async function mutateVaultDb<T>(mutator: (database: VaultDatabase) => T | Promise<T>) {
  const database = await readVaultDb();
  const result = await mutator(database);
  await writeVaultDb(database);
  return result;
}

export function publicUser(user: VaultUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}
