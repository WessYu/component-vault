import { rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
rmSync(resolve(packageRoot, "lib"), { recursive: true, force: true });
writeFileSync(resolve(packageRoot, "bin/component-vault.mjs"), "#!/usr/bin/env node\n\nawait import(\"../../../tools/component-vault-guard/cli-v4.mjs\");\n");
console.log("Restored Component Vault semantic CLI development wrapper.");
void repoRoot;
