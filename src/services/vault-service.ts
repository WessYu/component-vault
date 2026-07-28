import type { Collection, VaultComponent } from "@/types/vault";

type VaultPayload = {
  components: VaultComponent[];
  collections: Collection[];
};

type SessionUser = {
  id: string;
  name: string;
  email: string;
  favoriteComponentIds?: string[];
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
  if (!response.ok) {
    throw new Error(payload.error || payload.message || `Request failed with ${response.status}`);
  }
  return payload as T;
}

export async function getVaultData() {
  return requestJson<VaultPayload>("/api/vault", { cache: "no-store" });
}

export async function getComponents() {
  const payload = await requestJson<{ components: VaultComponent[] }>("/api/vault/components", { cache: "no-store" });
  return payload.components;
}

export async function getCollections() {
  const payload = await requestJson<{ collections: Collection[] }>("/api/vault/collections", { cache: "no-store" });
  return payload.collections;
}

export async function getComponentById(id: string) {
  const payload = await requestJson<{ component: VaultComponent }>(`/api/vault/components/${id}`, { cache: "no-store" });
  return payload.component;
}

export async function createComponent(input: Partial<VaultComponent>) {
  const payload = await requestJson<{ component: VaultComponent }>("/api/vault/components", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return payload.component;
}

export async function updateComponent(id: string, input: Partial<VaultComponent>) {
  const payload = await requestJson<{ component: VaultComponent }>(`/api/vault/components/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return payload.component;
}

export async function deleteComponent(id: string) {
  const payload = await requestJson<{ component: VaultComponent }>(`/api/vault/components/${id}`, {
    method: "DELETE",
  });
  return payload.component;
}

export async function toggleComponentFavorite(id: string) {
  const payload = await requestJson<{ component: VaultComponent }>(`/api/vault/components/${id}/favorite`, {
    method: "POST",
  });
  return payload.component;
}

export async function createCollection(input: Partial<Collection>) {
  const payload = await requestJson<{ collection: Collection }>("/api/vault/collections", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return payload.collection;
}

export async function updateCollection(id: string, input: Partial<Collection>) {
  const payload = await requestJson<{ collection: Collection }>(`/api/vault/collections/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return payload.collection;
}

export async function deleteCollection(id: string) {
  const payload = await requestJson<{ collection: Collection }>(`/api/vault/collections/${id}`, {
    method: "DELETE",
  });
  return payload.collection;
}

export async function localLogin(input: { email: string; password: string }) {
  return requestJson<{ user: SessionUser }>("/api/auth/local/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function localRegister(input: { name: string; email: string; password: string }) {
  return requestJson<{ user: SessionUser }>("/api/auth/local/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getLocalSession() {
  return requestJson<{ user: SessionUser | null }>("/api/auth/local/session", { cache: "no-store" });
}

export async function localLogout() {
  return requestJson<{ ok: true }>("/api/auth/local/logout", { method: "POST" });
}

export async function requestLocalPasswordReset(email: string) {
  return requestJson<{ message: string; resetUrl: string | null }>("/api/auth/local/password-reset/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function confirmLocalPasswordReset(input: { token: string; password: string }) {
  return requestJson<{ ok: true }>("/api/auth/local/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
