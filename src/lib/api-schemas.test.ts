import assert from "node:assert/strict";
import test from "node:test";
import {
  createComponentSchema,
  loginRequestSchema,
  patchCollectionSchema,
  patchComponentSchema,
  registerRequestSchema,
} from "./api-schemas.ts";

test("authentication schemas normalize email and reject unknown fields", () => {
  const login = loginRequestSchema.parse({ email: "  WESS@EXAMPLE.COM ", password: "secret" });
  assert.equal(login.email, "wess@example.com");
  assert.equal(login.remember, true);

  assert.throws(() => registerRequestSchema.parse({
    name: "Wess",
    email: "wess@example.com",
    password: "short",
    role: "admin",
  }));
});

test("component schemas enforce slugs, limits and non-empty patches", () => {
  assert.deepEqual(createComponentSchema.parse({ name: "Primary Button", slug: "primary-button" }), {
    name: "Primary Button",
    slug: "primary-button",
  });
  assert.throws(() => createComponentSchema.parse({ name: "Button", slug: "Invalid Slug" }));
  assert.throws(() => patchComponentSchema.parse({}));
  assert.throws(() => patchCollectionSchema.parse({}));
});
