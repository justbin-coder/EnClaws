// test/branding/license-attribution.test.ts
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");

function readFile(name: string): string {
  return readFileSync(path.join(REPO_ROOT, name), "utf-8");
}

describe("license attribution completeness", () => {
  it("LICENSE contains QingClaws copyright", () => {
    const license = readFile("LICENSE");
    expect(license).toMatch(/Copyright.*QingClaws/i);
  });

  it("LICENSE preserves upstream EnClaws attribution", () => {
    const license = readFile("LICENSE");
    expect(license).toMatch(/EnClaws|hashSTACS/i);
  });

  it("LICENSE preserves OpenClaw attribution", () => {
    const license = readFile("LICENSE");
    expect(license).toMatch(/OpenClaw/i);
  });

  it("NOTICE contains QingClaws attribution section", () => {
    const notice = readFile("NOTICE");
    expect(notice).toMatch(/QingClaws/i);
  });

  it("NOTICE preserves all upstream attribution blocks", () => {
    const notice = readFile("NOTICE");
    expect(notice).toMatch(/EnClaws/i);
    expect(notice).toMatch(/hashSTACS/i);
  });
});
