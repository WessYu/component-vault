import test from "node:test";
import assert from "node:assert/strict";
import { extractComponentApi } from "./component-api.mjs";

test("extracts a component public API from TypeScript props", () => {
  const api = extractComponentApi("src/components/ui/text.tsx");
  const text = api.find((component) => component.name === "Text");

  assert.ok(text, "Text component should be discoverable");
  assert.ok(Array.isArray(text.props), "Text should expose a props array");
  assert.ok(text.props.some((prop) => prop.name === "children"), "children should be part of the public API");
  assert.equal(text.composition.children, true);
});
