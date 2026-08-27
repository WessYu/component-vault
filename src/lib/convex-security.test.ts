import assert from "node:assert/strict";
import test from "node:test";
import { assertServerSecret, canManageResource } from "../../convex/security.ts";

test("backend requests require the configured 32-character server secret", () => {
  const previous = process.env.COMPONENT_VAULT_SERVER_SECRET;
  process.env.COMPONENT_VAULT_SERVER_SECRET = "a".repeat(32);
  try {
    assert.doesNotThrow(() => assertServerSecret("a".repeat(32)));
    assert.throws(() => assertServerSecret("wrong"));
  } finally {
    if (previous === undefined) delete process.env.COMPONENT_VAULT_SERVER_SECRET;
    else process.env.COMPONENT_VAULT_SERVER_SECRET = previous;
  }
});

test("resource authorization allows only owners and admins", () => {
  assert.equal(canManageResource({ userId: "owner", role: "user" }, "owner"), true);
  assert.equal(canManageResource({ userId: "other", role: "user" }, "owner"), false);
  assert.equal(canManageResource({ userId: "admin", role: "admin" }, "owner"), true);
});
