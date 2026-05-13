// test/branding/no-customer-leakage.test.ts
import { execSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");

// Customer-specific terms that must NEVER appear in the platform layer (PE).
// All such content belongs in AE1-AE5 application layer.
const CUSTOMER_PATTERNS = [
  "统计局",
  "国家统计局",
  "调查员",
  "账页",
  "农业调查",
  "畜牧",
  "居民收支",
  "统计调查",
];

// Whitelist: files that are allowed to reference customer-specific terms.
// docs/superpowers/specs/ are design/requirements docs with legitimate business context.
// docs/PROGRESS.md is the project status tracker (planning doc, not platform code).
// CLAUDE.local.md is the fork project config describing the first customer.
// test/branding/ whitelists the test file itself.
const WHITELIST_RE =
  /test\/branding\/no-customer-leakage\.test\.ts|docs\/superpowers\/|docs\/PROGRESS\.md|CLAUDE\.local\.md/;

describe("customer-info leakage gate", () => {
  it("no customer-specific terms appear in platform layer (PE) files", () => {
    const hits: string[] = [];

    for (const pattern of CUSTOMER_PATTERNS) {
      try {
        const result = execSync(
          `grep -rn --include="*.ts" --include="*.tsx" --include="*.js" ` +
            `--include="*.mjs" --include="*.md" --include="*.json" ` +
            `-e "${pattern}" .`,
          {
            cwd: REPO_ROOT,
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "pipe"],
          },
        );
        const lines = result.split("\n").filter(Boolean);
        for (const line of lines) {
          if (!WHITELIST_RE.test(line) && !line.includes("node_modules")) {
            hits.push(line);
          }
        }
      } catch {
        // grep exits 1 when no matches — that's the success case
      }
    }

    expect(
      hits,
      `Customer-specific terms found in platform layer:\n${hits.join("\n")}`,
    ).toHaveLength(0);
  });
});
