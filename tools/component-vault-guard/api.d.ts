export interface ScanConfig {
  version: 1;
  scan?: {
    include?: string[];
    exclude?: string[];
    extensions?: string[];
  };
  duplicates?: {
    enabled?: boolean;
    minOccurrences?: number;
    minTokens?: number;
  };
  rules?: Record<string, unknown>;
  components?: Record<string, Record<string, unknown>>;
  semantics?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface Finding {
  rule: string;
  code?: string;
  title: string;
  severity: string;
  file: string;
  line: number;
  column: number;
  message: string;
  suggestion?: string;
  [key: string]: unknown;
}

export interface ProjectOptions {
  root?: string;
  config?: ScanConfig;
  configPath?: string;
}

export declare function defineConfig<T extends ScanConfig>(config: T): T & ScanConfig;
export declare function scanProject(options?: ProjectOptions & { semantic?: boolean }): {
  engine: "typescript-ast";
  root: string;
  files: string[];
  findings: Finding[];
  summary: { total: number; filesScanned: number; byRule: Record<string, number> };
};
export declare function analyzeProject(options?: ProjectOptions): Record<string, unknown>;
export declare function fixProject(options?: ProjectOptions & { dryRun?: boolean; logger?: (message: string) => void }): {
  dryRun: boolean;
  changedFiles: number;
  edits: number;
  configured: Record<string, unknown>;
  semantic: Record<string, unknown>;
};
