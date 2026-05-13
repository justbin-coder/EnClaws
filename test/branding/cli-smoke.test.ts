// test/branding/cli-smoke.test.ts
import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");
const CLI = path.join(REPO_ROOT, "qingclaws.mjs");

function runCli(args: string[]): { stdout: string; stderr: string; status: number } {
  const result = spawnSync(process.execPath, [CLI, ...args], {
    cwd: REPO_ROOT,
    encoding: "utf-8",
    timeout: 15_000,
    env: {
      ...process.env,
      NO_COLOR: "1",
      FORCE_COLOR: "0",
      QINGCLAWS_SKIP_UPDATE_CHECK: "1",
    },
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    status: result.status ?? 1,
  };
}

const OLD_BRAND_RE = /\b(QingClaws Team|hashSTACS|enclaws|EnClaws|ENCLAWS)\b/;

describe("CLI subprocess — brand correctness", () => {
  it("--help output contains qingclaws and no old brand strings", () => {
    const { stdout, stderr } = runCli(["--help"]);
    const combined = stdout + stderr;
    expect(combined.toLowerCase()).toContain("qingclaws");
    expect(combined).not.toMatch(OLD_BRAND_RE);
  });

  it("gateway --help output contains qingclaws and no old brand strings", () => {
    const { stdout, stderr } = runCli(["gateway", "--help"]);
    const combined = stdout + stderr;
    expect(combined.toLowerCase()).toContain("qingclaws");
    expect(combined).not.toMatch(OLD_BRAND_RE);
  });
});

describe("banner formatter — brand correctness (unit)", () => {
  it("formatCliBannerLine contains QingClaws and not old brand names", async () => {
    const { formatCliBannerLine } = await import("../../src/cli/banner.js");
    const line = formatCliBannerLine("0.0.0-test", { richTty: false });
    expect(line).toContain("QingClaws");
    expect(line).not.toMatch(OLD_BRAND_RE);
  });

  it("formatCliBannerArt contains QINGCLAWS and not old brand names", async () => {
    const { formatCliBannerArt } = await import("../../src/cli/banner.js");
    const art = formatCliBannerArt({ richTty: false });
    expect(art).toContain("QINGCLAWS");
    expect(art).not.toMatch(OLD_BRAND_RE);
  });
});
