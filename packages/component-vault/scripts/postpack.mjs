import { rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
rmSync(resolve(packageRoot, "lib"), { recursive: true, force: true });
writeFileSync(resolve(packageRoot, "bin/component-vault.mjs"), "#!/usr/bin/env node\n\nawait import(\"../../../tools/component-vault-guard/cli.mjs\");\n");
console.log("Restored Component Vault CLI development wrapper.");
