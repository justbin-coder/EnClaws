// test/branding/no-brand-residue.test.ts
import { execSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");

describe("brand residue gate", () => {
  it("check-brand-residue.sh finds no old brand strings in user-visible files", () => {
    let output = "";
    let exitCode = 0;
    try {
      output = execSync("bash scripts/check-brand-residue.sh", {
        cwd: REPO_ROOT,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
        timeout: 30_000,
      });
    } catch (err: unknown) {
      const e = err as { stdout?: string; stderr?: string; status?: number };
      output = (e.stdout ?? "") + (e.stderr ?? "");
      exitCode = e.status ?? 1;
    }
    expect(exitCode, `Brand residue found:\n${output}`).toBe(0);
    expect(output).toContain("No brand residue found");
  });
});
