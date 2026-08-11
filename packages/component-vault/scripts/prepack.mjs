import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const libDir = resolve(packageRoot, "lib");
const binPath = resolve(packageRoot, "bin/component-vault.mjs");

mkdirSync(libDir, { recursive: true });

for (const file of ["cli.mjs", "cli-v2.mjs", "cli-v4.mjs", "semantic.mjs"]) {
  const source = resolve(repoRoot, `tools/component-vault-guard/${file}`);
  const destination = resolve(libDir, file);
  writeFileSync(destination, readFileSync(source, "utf8"));
}

writeFileSync(binPath, "#!/usr/bin/env node\n\nawait import(\"../lib/cli-v4.mjs\");\n");
console.log("Bundled Component Vault Guard core for npm packaging.");
