#!/usr/bin/env node
// scripts/brand-codemod.mjs
// QINGCLAWS-CUSTOM: brand — one-time PE1 rename codemod. Archive after PE1 (do not delete;
// needed when merging upstream EnClaws changes that re-introduce old brand strings).
//
// Usage:
//   node scripts/brand-codemod.mjs --dry-run        # preview only
//   node scripts/brand-codemod.mjs                  # apply changes
//   node scripts/brand-codemod.mjs --section=src    # only files under src/

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname, normalize } from "node:path";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const SECTION = args.find((a) => a.startsWith("--section="))?.split("=")[1];

const RULES = JSON.parse(
  readFileSync(new URL("../src/branding/replacement-rules.json", import.meta.url), "utf-8"),
);

const SKIP_FILES = new Set(RULES.skipFiles.map((f) => normalize(f)));
const SKIP_DIRS = new Set(RULES.skipDirs);

const TEXT_EXTS = new Set([
  ".ts", ".tsx", ".js", ".mjs", ".cjs",
  ".json", ".md", ".sh", ".yaml", ".yml",
  ".env.example", ".toml", ".css", ".html", ".svg", ".txt",
]);

const SKIP_CONTENT_RE = RULES.skipContentPatterns.map((p) => new RegExp(p));
const SKIP_LINE_RE = RULES.skipLinePatterns.map((p) => new RegExp(p));

/** @type {Map<string, number>} */
const stats = new Map();
for (const [from] of RULES.userVisibleSubs) {
  stats.set(from, 0);
}
let filesChanged = 0;
let filesSkipped = 0;

function shouldSkipFile(relPath) {
  const norm = normalize(relPath);
  if (SKIP_FILES.has(norm)) return true;
  const parts = norm.split(/[/\\]/);
  return parts.some((part) => SKIP_DIRS.has(part));
}

function processContent(content, relPath) {
  const lines = content.split("\n");
  let changed = false;
  const result = lines.map((line) => {
    // Skip lines that are upstream attribution context
    if (SKIP_LINE_RE.some((re) => re.test(line))) return line;
    // Skip lines with skip-content markers
    if (SKIP_CONTENT_RE.some((re) => re.test(line))) return line;

    let newLine = line;
    for (const [from, to] of RULES.userVisibleSubs) {
      if (newLine.includes(from)) {
        newLine = newLine.split(from).join(to);
        stats.set(from, (stats.get(from) ?? 0) + 1);
      }
    }
    if (newLine !== line) changed = true;
    return newLine;
  });
  return { content: result.join("\n"), changed };
}

function walkDir(dir) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const rel = relative(".", full);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue;
      if (SECTION && !rel.startsWith(SECTION) && !`${SECTION}/`.startsWith(rel)) continue;
      walkDir(full);
    } else {
      if (SECTION && !rel.startsWith(SECTION)) continue;
      const ext = extname(entry).toLowerCase();
      if (!TEXT_EXTS.has(ext) && !entry.startsWith(".env")) continue;
      if (shouldSkipFile(rel)) {
        filesSkipped++;
        continue;
      }
      let content;
      try {
        content = readFileSync(full, "utf-8");
      } catch {
        console.warn(`  [SKIP] ${rel} (unreadable)`);
        filesSkipped++;
        continue;
      }
      const { content: newContent, changed } = processContent(content, rel);
      if (changed) {
        try {
          if (!DRY_RUN) writeFileSync(full, newContent, "utf-8");
          filesChanged++;
          console.log(`  ${DRY_RUN ? "[DRY]" : "[CHG]"} ${rel}`);
        } catch {
          console.warn(`  [ERR] ${rel} (write failed)`);
        }
      }
    }
  }
}

console.log(`\n🦞 QingClaws brand-codemod ${DRY_RUN ? "(DRY RUN)" : "(APPLYING)"}\n`);
walkDir(".");

console.log("\n── Substitution report ──");
for (const [from, count] of stats) {
  if (count > 0) console.log(`  "${from}" replaced ${count}x`);
}
console.log(`\nFiles changed: ${filesChanged}  |  Files skipped (whitelist): ${filesSkipped}`);
if (DRY_RUN) {
  console.log("\n⚠️  DRY RUN — no files written. Remove --dry-run to apply.\n");
}
