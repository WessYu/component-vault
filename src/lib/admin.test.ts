import assert from "node:assert/strict";
import test from "node:test";
import { isVaultAdmin, resolveVaultRole } from "./admin.ts";

test("administrator access depends on the persisted role, not an email match", () => {
  process.env.VAULT_ADMIN_EMAIL = "owner@example.com";
  try {
    assert.equal(resolveVaultRole({ email: "owner@example.com", role: "user" }), "user");
    assert.equal(isVaultAdmin({ email: "owner@example.com", role: "admin" }), true);
  } finally {
    delete process.env.VAULT_ADMIN_EMAIL;
  }
});
