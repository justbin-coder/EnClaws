// src/terminal/links.ts
import { BRAND } from "../branding/brand.config.js";
import { formatTerminalLink } from "../utils.js";

// QINGCLAWS-CUSTOM: brand — empty until docs site is set up; callers get plain-text fallback
export const DOCS_ROOT = BRAND.links.docs; // type: "" (intentionally empty)

export function formatDocsLink(
  path: string,
  label?: string,
  opts?: { fallback?: string; force?: boolean },
): string {
  const trimmed = path.trim();
  // When DOCS_ROOT is empty, fall back to the path itself or the provided fallback
  if (!DOCS_ROOT) {
    return opts?.fallback ?? label ?? trimmed;
  }
  const url = trimmed.startsWith("http")
    ? trimmed
    : `${DOCS_ROOT}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
  return formatTerminalLink(label ?? url, url, {
    fallback: opts?.fallback ?? url,
    force: opts?.force,
  });
}

export function formatDocsRootLink(label?: string): string {
  if (!DOCS_ROOT) {
    return label ?? DOCS_ROOT;
  }
  return formatTerminalLink(label ?? DOCS_ROOT, DOCS_ROOT, {
    fallback: DOCS_ROOT,
  });
}
