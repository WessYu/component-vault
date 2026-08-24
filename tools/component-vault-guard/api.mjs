import { resolve } from "node:path";
import { applySemanticFixes } from "./autofix.mjs";
import { applyConfiguredFixes } from "./fix.mjs";
import { collectFiles, loadConfig as loadGuardConfig, normalizeConfig as normalizeGuardConfig, scan } from "./cli-v2.mjs";
import { analyze, normalizeConfig as normalizeSemanticConfig, semanticScan } from "./semantic.mjs";

function defineConfig(config) {
  return normalizeSemanticConfig(normalizeGuardConfig(config));
}

function projectConfig(root, config, configPath) {
  return config ? defineConfig(config) : defineConfig(loadGuardConfig(root, configPath));
}

function summarize(findings, filesScanned) {
  const byRule = {};
  for (const finding of findings) byRule[finding.rule] = (byRule[finding.rule] ?? 0) + 1;
  return { total: findings.length, filesScanned, byRule };
}

function scanProject(options = {}) {
  const root = resolve(options.root ?? process.cwd());
  const configPath = options.configPath ?? "component-vault.yaml";
  const config = projectConfig(root, options.config, configPath);
  const findings = scan(root, config);
  const semantic = options.semantic === false ? { findings: [], files: [] } : semanticScan(root, config);
  const semanticFindings = semantic.findings.map((finding) => ({ ...finding, rule: finding.code }));
  const combined = [...findings, ...semanticFindings];
  const files = [...new Set([...collectFiles(root, config), ...semantic.files])].sort();
  return {
    engine: "typescript-ast",
    root,
    files,
    findings: combined,
    summary: summarize(combined, files.length),
  };
}

function analyzeProject(options = {}) {
  const root = resolve(options.root ?? process.cwd());
  const config = projectConfig(root, options.config, options.configPath ?? "component-vault.yaml");
  return analyze(root, config);
}

function fixProject(options = {}) {
  const root = resolve(options.root ?? process.cwd());
  const config = projectConfig(root, options.config, options.configPath ?? "component-vault.yaml");
  const dryRun = options.dryRun !== false;
  const configured = applyConfiguredFixes(root, config, { dryRun, logger: options.logger });
  const semantic = applySemanticFixes(root, config, { dryRun, logger: options.logger });
  return {
    dryRun,
    changedFiles: new Set([...configured.changes, ...semantic.changes].map((item) => item.file)).size,
    edits: configured.replacements + semantic.replacements + semantic.importsAdded,
    configured,
    semantic,
  };
}

export { analyzeProject, defineConfig, fixProject, scanProject };
