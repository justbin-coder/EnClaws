import { createRequire } from "node:module";

declare const __QINGCLAWS_VERSION__: string | undefined; // QINGCLAWS-CUSTOM: brand
const CORE_PACKAGE_NAME = "qingclaws"; // QINGCLAWS-CUSTOM: brand — matches renamed package.json name

const PACKAGE_JSON_CANDIDATES = [
  "../package.json",
  "../../package.json",
  "../../../package.json",
  "./package.json",
] as const;

const BUILD_INFO_CANDIDATES = [
  "../build-info.json",
  "../../build-info.json",
  "./build-info.json",
] as const;

function readVersionFromJsonCandidates(
  moduleUrl: string,
  candidates: readonly string[],
  opts: { requirePackageName?: boolean } = {},
): string | null {
  try {
    const require = createRequire(moduleUrl);
    for (const candidate of candidates) {
      try {
        const parsed = require(candidate) as { name?: string; version?: string };
        const version = parsed.version?.trim();
        if (!version) {
          continue;
        }
        if (opts.requirePackageName && parsed.name !== CORE_PACKAGE_NAME) {
          continue;
        }
        return version;
      } catch {
        // ignore missing or unreadable candidate
      }
    }
    return null;
  } catch {
    return null;
  }
}

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return undefined;
}

export function readVersionFromPackageJsonForModuleUrl(moduleUrl: string): string | null {
  return readVersionFromJsonCandidates(moduleUrl, PACKAGE_JSON_CANDIDATES, {
    requirePackageName: true,
  });
}

export function readVersionFromBuildInfoForModuleUrl(moduleUrl: string): string | null {
  return readVersionFromJsonCandidates(moduleUrl, BUILD_INFO_CANDIDATES);
}

export function resolveVersionFromModuleUrl(moduleUrl: string): string | null {
  return (
    readVersionFromPackageJsonForModuleUrl(moduleUrl) ||
    readVersionFromBuildInfoForModuleUrl(moduleUrl)
  );
}

export type RuntimeVersionEnv = {
  [key: string]: string | undefined;
};

export function resolveRuntimeServiceVersion(
  env: RuntimeVersionEnv = process.env as RuntimeVersionEnv,
): string {
  return (
    firstNonEmpty(
      env["QINGCLAWS_VERSION"], // QINGCLAWS-CUSTOM: brand
      env["QINGCLAWS_SERVICE_VERSION"], // QINGCLAWS-CUSTOM: brand
      env["npm_package_version"],
    ) ?? VERSION
  );
}

// Product display name — single source of truth for branding.
export const PRODUCT_NAME = "QingClaws";
export const PRODUCT_NAME_UPPER = PRODUCT_NAME.toUpperCase();
export const PRODUCT_NAME_LOWER = PRODUCT_NAME.toLowerCase();

// Single source of truth for the current QingClaws version.
// - Embedded/bundled builds: injected define or env var.
// - Dev/npm builds: package.json.
export const VERSION =
  (typeof __QINGCLAWS_VERSION__ === "string" && __QINGCLAWS_VERSION__) || // QINGCLAWS-CUSTOM: brand
  process.env.QINGCLAWS_BUNDLED_VERSION || // QINGCLAWS-CUSTOM: brand
  resolveVersionFromModuleUrl(import.meta.url) ||
  "0.0.0";
