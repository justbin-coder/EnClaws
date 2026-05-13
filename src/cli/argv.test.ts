import { describe, expect, it } from "vitest";
import {
  buildParseArgv,
  getFlagValue,
  getCommandPath,
  getPrimaryCommand,
  getPositiveIntFlagValue,
  getVerboseFlag,
  hasHelpOrVersion,
  hasFlag,
  isRootHelpInvocation,
  isRootVersionInvocation,
  shouldMigrateState,
  shouldMigrateStateFromPath,
} from "./argv.js";

describe("argv helpers", () => {
  it.each([
    {
      name: "help flag",
      argv: ["node", "qingclaws", "--help"],
      expected: true,
    },
    {
      name: "version flag",
      argv: ["node", "qingclaws", "-V"],
      expected: true,
    },
    {
      name: "normal command",
      argv: ["node", "qingclaws", "status"],
      expected: false,
    },
    {
      name: "root -v alias",
      argv: ["node", "qingclaws", "-v"],
      expected: true,
    },
    {
      name: "root -v alias with profile",
      argv: ["node", "qingclaws", "--profile", "work", "-v"],
      expected: true,
    },
    {
      name: "root -v alias with log-level",
      argv: ["node", "qingclaws", "--log-level", "debug", "-v"],
      expected: true,
    },
    {
      name: "subcommand -v should not be treated as version",
      argv: ["node", "qingclaws", "acp", "-v"],
      expected: false,
    },
    {
      name: "root -v alias with equals profile",
      argv: ["node", "qingclaws", "--profile=work", "-v"],
      expected: true,
    },
    {
      name: "subcommand path after global root flags should not be treated as version",
      argv: ["node", "qingclaws", "--dev", "skills", "list", "-v"],
      expected: false,
    },
  ])("detects help/version flags: $name", ({ argv, expected }) => {
    expect(hasHelpOrVersion(argv)).toBe(expected);
  });

  it.each([
    {
      name: "root --version",
      argv: ["node", "qingclaws", "--version"],
      expected: true,
    },
    {
      name: "root -V",
      argv: ["node", "qingclaws", "-V"],
      expected: true,
    },
    {
      name: "root -v alias with profile",
      argv: ["node", "qingclaws", "--profile", "work", "-v"],
      expected: true,
    },
    {
      name: "subcommand version flag",
      argv: ["node", "qingclaws", "status", "--version"],
      expected: false,
    },
    {
      name: "unknown root flag with version",
      argv: ["node", "qingclaws", "--unknown", "--version"],
      expected: false,
    },
  ])("detects root-only version invocations: $name", ({ argv, expected }) => {
    expect(isRootVersionInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "root --help",
      argv: ["node", "qingclaws", "--help"],
      expected: true,
    },
    {
      name: "root -h",
      argv: ["node", "qingclaws", "-h"],
      expected: true,
    },
    {
      name: "root --help with profile",
      argv: ["node", "qingclaws", "--profile", "work", "--help"],
      expected: true,
    },
    {
      name: "subcommand --help",
      argv: ["node", "qingclaws", "status", "--help"],
      expected: false,
    },
    {
      name: "help before subcommand token",
      argv: ["node", "qingclaws", "--help", "status"],
      expected: false,
    },
    {
      name: "help after -- terminator",
      argv: ["node", "qingclaws", "nodes", "run", "--", "git", "--help"],
      expected: false,
    },
    {
      name: "unknown root flag before help",
      argv: ["node", "qingclaws", "--unknown", "--help"],
      expected: false,
    },
    {
      name: "unknown root flag after help",
      argv: ["node", "qingclaws", "--help", "--unknown"],
      expected: false,
    },
  ])("detects root-only help invocations: $name", ({ argv, expected }) => {
    expect(isRootHelpInvocation(argv)).toBe(expected);
  });

  it.each([
    {
      name: "single command with trailing flag",
      argv: ["node", "qingclaws", "status", "--json"],
      expected: ["status"],
    },
    {
      name: "two-part command",
      argv: ["node", "qingclaws", "agents", "list"],
      expected: ["agents", "list"],
    },
    {
      name: "terminator cuts parsing",
      argv: ["node", "qingclaws", "status", "--", "ignored"],
      expected: ["status"],
    },
  ])("extracts command path: $name", ({ argv, expected }) => {
    expect(getCommandPath(argv, 2)).toEqual(expected);
  });

  it.each([
    {
      name: "returns first command token",
      argv: ["node", "qingclaws", "agents", "list"],
      expected: "agents",
    },
    {
      name: "returns null when no command exists",
      argv: ["node", "qingclaws"],
      expected: null,
    },
  ])("returns primary command: $name", ({ argv, expected }) => {
    expect(getPrimaryCommand(argv)).toBe(expected);
  });

  it.each([
    {
      name: "detects flag before terminator",
      argv: ["node", "qingclaws", "status", "--json"],
      flag: "--json",
      expected: true,
    },
    {
      name: "ignores flag after terminator",
      argv: ["node", "qingclaws", "--", "--json"],
      flag: "--json",
      expected: false,
    },
  ])("parses boolean flags: $name", ({ argv, flag, expected }) => {
    expect(hasFlag(argv, flag)).toBe(expected);
  });

  it.each([
    {
      name: "value in next token",
      argv: ["node", "qingclaws", "status", "--timeout", "5000"],
      expected: "5000",
    },
    {
      name: "value in equals form",
      argv: ["node", "qingclaws", "status", "--timeout=2500"],
      expected: "2500",
    },
    {
      name: "missing value",
      argv: ["node", "qingclaws", "status", "--timeout"],
      expected: null,
    },
    {
      name: "next token is another flag",
      argv: ["node", "qingclaws", "status", "--timeout", "--json"],
      expected: null,
    },
    {
      name: "flag appears after terminator",
      argv: ["node", "qingclaws", "--", "--timeout=99"],
      expected: undefined,
    },
  ])("extracts flag values: $name", ({ argv, expected }) => {
    expect(getFlagValue(argv, "--timeout")).toBe(expected);
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "qingclaws", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "qingclaws", "status", "--debug"])).toBe(false);
    expect(getVerboseFlag(["node", "qingclaws", "status", "--debug"], { includeDebug: true })).toBe(
      true,
    );
  });

  it.each([
    {
      name: "missing flag",
      argv: ["node", "qingclaws", "status"],
      expected: undefined,
    },
    {
      name: "missing value",
      argv: ["node", "qingclaws", "status", "--timeout"],
      expected: null,
    },
    {
      name: "valid positive integer",
      argv: ["node", "qingclaws", "status", "--timeout", "5000"],
      expected: 5000,
    },
    {
      name: "invalid integer",
      argv: ["node", "qingclaws", "status", "--timeout", "nope"],
      expected: undefined,
    },
  ])("parses positive integer flag values: $name", ({ argv, expected }) => {
    expect(getPositiveIntFlagValue(argv, "--timeout")).toBe(expected);
  });

  it("builds parse argv from raw args", () => {
    const cases = [
      {
        rawArgs: ["node", "qingclaws", "status"],
        expected: ["node", "qingclaws", "status"],
      },
      {
        rawArgs: ["node-22", "qingclaws", "status"],
        expected: ["node-22", "qingclaws", "status"],
      },
      {
        rawArgs: ["node-22.2.0.exe", "qingclaws", "status"],
        expected: ["node-22.2.0.exe", "qingclaws", "status"],
      },
      {
        rawArgs: ["node-22.2", "qingclaws", "status"],
        expected: ["node-22.2", "qingclaws", "status"],
      },
      {
        rawArgs: ["node-22.2.exe", "qingclaws", "status"],
        expected: ["node-22.2.exe", "qingclaws", "status"],
      },
      {
        rawArgs: ["/usr/bin/node-22.2.0", "qingclaws", "status"],
        expected: ["/usr/bin/node-22.2.0", "qingclaws", "status"],
      },
      {
        rawArgs: ["node24", "qingclaws", "status"],
        expected: ["node24", "qingclaws", "status"],
      },
      {
        rawArgs: ["/usr/bin/node24", "qingclaws", "status"],
        expected: ["/usr/bin/node24", "qingclaws", "status"],
      },
      {
        rawArgs: ["node24.exe", "qingclaws", "status"],
        expected: ["node24.exe", "qingclaws", "status"],
      },
      {
        rawArgs: ["nodejs", "qingclaws", "status"],
        expected: ["nodejs", "qingclaws", "status"],
      },
      {
        rawArgs: ["node-dev", "qingclaws", "status"],
        expected: ["node", "qingclaws", "node-dev", "qingclaws", "status"],
      },
      {
        rawArgs: ["qingclaws", "status"],
        expected: ["node", "qingclaws", "status"],
      },
      {
        rawArgs: ["bun", "src/entry.ts", "status"],
        expected: ["bun", "src/entry.ts", "status"],
      },
    ] as const;

    for (const testCase of cases) {
      const parsed = buildParseArgv({
        programName: "qingclaws",
        rawArgs: [...testCase.rawArgs],
      });
      expect(parsed).toEqual([...testCase.expected]);
    }
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "qingclaws",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "qingclaws", "status"]);
  });

  it("decides when to migrate state", () => {
    const nonMutatingArgv = [
      ["node", "qingclaws", "status"],
      ["node", "qingclaws", "health"],
      ["node", "qingclaws", "sessions"],
      ["node", "qingclaws", "config", "get", "update"],
      ["node", "qingclaws", "config", "unset", "update"],
      ["node", "qingclaws", "models", "list"],
      ["node", "qingclaws", "models", "status"],
      ["node", "qingclaws", "memory", "status"],
      ["node", "qingclaws", "agent", "--message", "hi"],
    ] as const;
    const mutatingArgv = [
      ["node", "qingclaws", "agents", "list"],
      ["node", "qingclaws", "message", "send"],
    ] as const;

    for (const argv of nonMutatingArgv) {
      expect(shouldMigrateState([...argv])).toBe(false);
    }
    for (const argv of mutatingArgv) {
      expect(shouldMigrateState([...argv])).toBe(true);
    }
  });

  it.each([
    { path: ["status"], expected: false },
    { path: ["config", "get"], expected: false },
    { path: ["models", "status"], expected: false },
    { path: ["agents", "list"], expected: true },
  ])("reuses command path for migrate state decisions: $path", ({ path, expected }) => {
    expect(shouldMigrateStateFromPath(path)).toBe(expected);
  });
});
