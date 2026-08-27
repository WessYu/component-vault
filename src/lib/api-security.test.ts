import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import {
  apiError,
  apiJson,
  ApiError,
  assertTrustedOrigin,
  parseJson,
} from "./api-security.ts";

test("parseJson accepts a valid bounded JSON request", async () => {
  const request = new Request("https://component-vault.test/api", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "Button" }),
  });

  const result = await parseJson(request, z.object({ name: z.string().min(1) }).strict(), 1024);
  assert.deepEqual(result, { name: "Button" });
});

test("parseJson rejects unsupported content types and oversized bodies", async () => {
  await assert.rejects(
    () => parseJson(new Request("https://component-vault.test/api", { method: "POST", body: "{}" }), z.object({})),
    (error) => error instanceof ApiError && error.status === 415,
  );

  await assert.rejects(
    () => parseJson(new Request("https://component-vault.test/api", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ value: "x".repeat(128) }),
    }), z.object({ value: z.string() }), 32),
    (error) => error instanceof ApiError && error.status === 413,
  );
});

test("assertTrustedOrigin blocks cross-origin mutations", () => {
  assert.throws(
    () => assertTrustedOrigin(new Request("https://component-vault.test/api", { headers: { origin: "https://attacker.test" } })),
    (error) => error instanceof ApiError && error.status === 403,
  );
});

test("assertTrustedOrigin rejects browser-declared cross-site requests without an Origin header", () => {
  assert.throws(
    () => assertTrustedOrigin(new Request("https://component-vault.test/api", { headers: { "sec-fetch-site": "cross-site" } })),
    (error) => error instanceof ApiError && error.status === 403,
  );
});

test("apiError emits a bounded public error and Retry-After header", async () => {
  const response = apiError(new ApiError(429, "RATE_LIMITED", "Too many requests.", { retryAfterSeconds: 45 }));
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "45");
  assert.deepEqual(await response.json(), {
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests.",
      details: { retryAfterSeconds: 45 },
    },
  });
});

test("apiJson disables caching and adds response hardening headers", () => {
  const response = apiJson({ ok: true });
  assert.equal(response.headers.get("cache-control"), "no-store, max-age=0");
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.match(response.headers.get("x-request-id") ?? "", /^[0-9a-f-]{36}$/i);
});
