import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "qingclaws",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "qingclaws", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "qingclaws", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "qingclaws", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "qingclaws", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "qingclaws", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "qingclaws", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it.each([
    ["--dev first", ["node", "qingclaws", "--dev", "--profile", "work", "status"]],
    ["--profile first", ["node", "qingclaws", "--profile", "work", "--dev", "status"]],
  ])("rejects combining --dev with --profile (%s)", (_name, argv) => {
    const res = parseCliProfileArgs(argv);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join(path.resolve("/home/peter"), ".qingclaws-dev");
    expect(env.QINGCLAWS_PROFILE).toBe("dev");
    expect(env.QINGCLAWS_STATE_DIR).toBe(expectedStateDir);
    expect(env.QINGCLAWS_CONFIG_PATH).toBe(path.join(expectedStateDir, "qingclaws.json"));
    expect(env.QINGCLAWS_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      QINGCLAWS_STATE_DIR: "/custom",
      QINGCLAWS_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.QINGCLAWS_STATE_DIR).toBe("/custom");
    expect(env.QINGCLAWS_GATEWAY_PORT).toBe("19099");
    expect(env.QINGCLAWS_CONFIG_PATH).toBe(path.join("/custom", "qingclaws.json"));
  });

  it("uses QINGCLAWS_HOME when deriving profile state dir", () => {
    const env: Record<string, string | undefined> = {
      QINGCLAWS_HOME: "/srv/qingclaws-home",
      HOME: "/home/other",
    };
    applyCliProfileEnv({
      profile: "work",
      env,
      homedir: () => "/home/fallback",
    });

    const resolvedHome = path.resolve("/srv/qingclaws-home");
    expect(env.QINGCLAWS_STATE_DIR).toBe(path.join(resolvedHome, ".qingclaws-work"));
    expect(env.QINGCLAWS_CONFIG_PATH).toBe(
      path.join(resolvedHome, ".qingclaws-work", "qingclaws.json"),
    );
  });
});

describe("formatCliCommand", () => {
  it.each([
    {
      name: "no profile is set",
      cmd: "qingclaws doctor --fix",
      env: {},
      expected: "qingclaws doctor --fix",
    },
    {
      name: "profile is default",
      cmd: "qingclaws doctor --fix",
      env: { QINGCLAWS_PROFILE: "default" },
      expected: "qingclaws doctor --fix",
    },
    {
      name: "profile is Default (case-insensitive)",
      cmd: "qingclaws doctor --fix",
      env: { QINGCLAWS_PROFILE: "Default" },
      expected: "qingclaws doctor --fix",
    },
    {
      name: "profile is invalid",
      cmd: "qingclaws doctor --fix",
      env: { QINGCLAWS_PROFILE: "bad profile" },
      expected: "qingclaws doctor --fix",
    },
    {
      name: "--profile is already present",
      cmd: "qingclaws --profile work doctor --fix",
      env: { QINGCLAWS_PROFILE: "work" },
      expected: "qingclaws --profile work doctor --fix",
    },
    {
      name: "--dev is already present",
      cmd: "qingclaws --dev doctor",
      env: { QINGCLAWS_PROFILE: "dev" },
      expected: "qingclaws --dev doctor",
    },
  ])("returns command unchanged when $name", ({ cmd, env, expected }) => {
    expect(formatCliCommand(cmd, env)).toBe(expected);
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("qingclaws doctor --fix", { QINGCLAWS_PROFILE: "work" })).toBe(
      "qingclaws --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("qingclaws doctor --fix", { QINGCLAWS_PROFILE: "  jbqingclaws  " })).toBe(
      "qingclaws --profile jbqingclaws doctor --fix",
    );
  });

  it("handles command with no args after qingclaws", () => {
    expect(formatCliCommand("qingclaws", { QINGCLAWS_PROFILE: "test" })).toBe(
      "qingclaws --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm qingclaws doctor", { QINGCLAWS_PROFILE: "work" })).toBe(
      "pnpm qingclaws --profile work doctor",
    );
  });
});
