# PE1 Brand Customization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename EnClaws → QingClaws across all user-visible surfaces, introduce a branding abstraction layer, localize defaults to zh-CN 2B enterprise context, and add CI gates to prevent brand/customer-info leakage.

**Architecture:** Six ordered commits on `feat/PE1-brand-customization`. Commit 1 slims docs noise. Commit 2 creates `src/branding/` as single brand source + codemod tooling (no strings changed yet). Commit 3 runs the codemod + manual precision edits to actually rename. Commits 4-5 handle locale/templates and docs/legal. Commit 6 adds automated guards.

**Tech Stack:** TypeScript/Node.js, Vitest, Node `fs` + `path` for codemod, bash for residue check, Apache-2.0 license compliance, Lit i18n via `ui/src/i18n/`.

---

## File Structure

### New files (create)
| File | Purpose |
|---|---|
| `src/branding/brand.config.ts` | Single source of truth: product name, CLI name, env prefix, asset paths |
| `src/branding/replacement-rules.json` | Codemod whitelist and substitution rules |
| `src/branding/tokens.css` | CSS brand color variables (neutral palette, designer-replaceable) |
| `src/branding/assets/logo.svg` | Temporary text logo (QingClaws wordmark, neutral color) |
| `src/branding/assets/logo-dark.svg` | Dark-mode variant |
| `src/branding/assets/banner.svg` | README/UI banner placeholder |
| `src/branding/assets/favicon.svg` | SVG favicon (browsers support) |
| `src/branding/assets/README.md` | "Designer: replace files here" instructions |
| `scripts/brand-codemod.mjs` | One-time mechanical rename script |
| `scripts/check-brand-residue.sh` | CI guard: fail if old brand strings remain in user-visible files |
| `docs/upstream-divergence.md` | Registry of all fork divergences from EnClaws upstream |
| `test/branding/no-brand-residue.test.ts` | Auto test: calls check-brand-residue.sh, expects 0 matches |
| `test/branding/no-customer-leakage.test.ts` | Auto test: grep for customer-specific terms, expects 0 matches |
| `test/branding/cli-smoke.test.ts` | Auto test: qingclaws --version / --help output contains QingClaws |
| `test/branding/license-attribution.test.ts` | Auto test: LICENSE+NOTICE contain QingClaws AND upstream attribution |

### Existing files (modify)
| File | Change |
|---|---|
| `CLAUDE.md` | Slim: remove sections duplicated verbatim in AGENTS.md (~80 lines) |
| `CLAUDE.local.md` | §2 relax (allow CLAUDE.md slimming), §3 add conflict resolution clause |
| `~/.claude/projects/-Users-justbin-project-2BPro/memory/MEMORY.md` | Remove feedback-git-commit-autonomy entry (now in CLAUDE.local.md §7) |
| `~/.claude/projects/-Users-justbin-project-2BPro/memory/feedback-git-commit-autonomy.md` | Delete |
| `src/version.ts` | `PRODUCT_NAME = "QingClaws"`, env var names → `QINGCLAWS_*` |
| `src/config/paths.ts` | `.enclaws` → `.qingclaws`, `enclaws.json` → `qingclaws.json` |
| `src/infra/home-dir.ts` | `ENCLAWS_HOME` → `QINGCLAWS_HOME` |
| `src/terminal/links.ts` | `DOCS_ROOT` → empty string (variablized) |
| `src/cli/tagline.ts` | Default tagline + env var name |
| `ui/src/i18n/lib/translate.ts` | localStorage key, default locale fallback → zh-CN |
| `docs/reference/templates/AGENTS.md` | Chinese + 2B enterprise context |
| `docs/reference/templates/SOUL.md` | Chinese + 2B enterprise context |
| `docs/reference/templates/USER.md` | Chinese + 2B enterprise context |
| `package.json` | name, bin, homepage, bugs, repository, files list |
| `enclaws.mjs` | Rename to `qingclaws.mjs`; fix error message string |
| `README.md` | Full rebrand |
| `CHANGELOG.md` | Add `[Unreleased]` PE1 section |
| `LICENSE` | Prepend QingClaws copyright line |
| `NOTICE` | Append QingClaws attribution section |
| `docs/PROGRESS.md` | PE1 Plan field → path to this file |

---

## Task 1: Slim CLAUDE.md and Remove Redundant Memory

**Commit:** `chore(docs): slim CLAUDE.md and remove redundant memory`

**Files:**
- Modify: `CLAUDE.md`
- Modify: `CLAUDE.local.md`
- Delete: `~/.claude/projects/-Users-justbin-project-2BPro/memory/feedback-git-commit-autonomy.md`
- Modify: `~/.claude/projects/-Users-justbin-project-2BPro/memory/MEMORY.md`

- [ ] **Step 1: Slim CLAUDE.md — remove sections already in AGENTS.md**

Open `CLAUDE.md`. Remove the following sections entirely (they duplicate AGENTS.md verbatim):
- `## Build & Development Commands` (full block, lines ~10-40)
- `## Code Conventions` (full block)
- `## Multi-Agent Safety` (full block)
- `## Extension Development` (full block)
- `## Important Constraints` (full block)

Keep only: the header comment, `## What is EnClaws` (architecture intro), and the two `@` import lines at the bottom.

The resulting `CLAUDE.md` should look like:

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is EnClaws

EnClaws is an **enterprise containerized platform for digital AI Employees**, extending OpenClaw (a personal AI assistant) into a multi-tenant system with concurrent task execution, user isolation, hierarchical memory, skill sharing, and audit capabilities. Built on TypeScript/Node.js with a gateway server architecture.

### Key directories

| Directory | Purpose |
|-----------|---------|
| `src/cli/` | CLI wiring (Commander.js) |
| `src/commands/` | Agent, channel, config, cron, skill commands |
| `src/gateway/` | WebSocket/HTTP server, auth, protocol, channel mgmt |
| `src/agents/` | Agent runtime, Pi integration, tool/skill loading |
| `src/providers/` | Model provider APIs (Anthropic, OpenAI, Gemini, Qwen, etc.) |
| `src/db/` | PostgreSQL + SQLite models |
| `src/auth/` | JWT, RBAC, pairing, device management |
| `src/channels/` | Shared channel logic, transport, routing |
| `ui/src/` | Lit web components |
| `extensions/*/` | Channel plugins (pnpm workspace packages) |
| `skills/` | Pre-built AI skills |

> Build commands, code conventions, multi-agent safety rules, and extension guidelines are in `AGENTS.md`.

---

@AGENTS.md
@CLAUDE.local.md
```

- [ ] **Step 2: Update CLAUDE.local.md §2 and §3**

In `CLAUDE.local.md`, change §2 "与上游文档的关系" table row for `CLAUDE.md` from `不改` to `可精简（删除与 AGENTS.md 重复章节）`, and add to §3 "核心准则":

```markdown
### 3.4 全局 CLAUDE.md 与项目规则冲突消解

当 `~/.claude/CLAUDE.md`（全局）与本文件产生冲突时，**本文件（项目级）优先**。例外：全局安全红线（SQL 注入、敏感信息泄露）永不覆盖。
```

- [ ] **Step 3: Delete redundant memory file**

```bash
rm ~/.claude/projects/-Users-justbin-project-2BPro/memory/feedback-git-commit-autonomy.md
```

- [ ] **Step 4: Update MEMORY.md index**

Open `~/.claude/projects/-Users-justbin-project-2BPro/memory/MEMORY.md` and remove the line:

```
- [Git commit 自主授权 (QingClaws 项目)](feedback-git-commit-autonomy.md) — 该项目内可自主 commit；push/tag/merge/破坏性操作仍需授权
```

- [ ] **Step 5: Verify and commit**

```bash
pnpm check
```

Expected: passes (no code changes, only docs).

```bash
git add CLAUDE.md CLAUDE.local.md \
  ~/.claude/projects/-Users-justbin-project-2BPro/memory/MEMORY.md
git commit -m "chore(docs): slim CLAUDE.md and remove redundant memory

Remove CLAUDE.md sections duplicated verbatim in AGENTS.md (~80 lines).
Relax CLAUDE.local.md §2 to allow slimming. Add §3.4 conflict resolution.
Delete feedback-git-commit-autonomy.md (content already in CLAUDE.local.md §7)."
```

---

## Task 2: Introduce Brand Config Layer and Tooling

**Commit:** `feat(PE1): introduce brand config and asset slots`

**Files:**
- Create: `src/branding/brand.config.ts`
- Create: `src/branding/replacement-rules.json`
- Create: `src/branding/tokens.css`
- Create: `src/branding/assets/logo.svg`
- Create: `src/branding/assets/logo-dark.svg`
- Create: `src/branding/assets/banner.svg`
- Create: `src/branding/assets/favicon.svg`
- Create: `src/branding/assets/README.md`
- Create: `scripts/brand-codemod.mjs`
- Create: `scripts/check-brand-residue.sh`

- [ ] **Step 1: Create `src/branding/brand.config.ts`**

```typescript
// src/branding/brand.config.ts
// QINGCLAWS-CUSTOM: brand — single source of truth for QingClaws brand identifiers.
// Upstream EnClaws uses hard-coded strings; this layer allows designer-replace-in-place.
export const BRAND = {
  productName: "QingClaws",
  productNameZh: "QingClaws",
  productTagline: "企业级 AI 助手容器平台",
  cliName: "qingclaws",
  pkgName: "qingclaws",
  configDirName: ".qingclaws",
  envPrefix: "QINGCLAWS_",

  assets: {
    logo: "/branding/assets/logo.svg",
    logoDark: "/branding/assets/logo-dark.svg",
    favicon: "/branding/assets/favicon.svg",
    banner: "/branding/assets/banner.svg",
  },

  links: {
    homepage: "",
    docs: "",
    issues: "",
    repo: "",
  },

  upstream: {
    project: "EnClaws",
    org: "hashSTACS-Global",
    parent: "OpenClaw",
    license: "Apache-2.0",
  },
} as const;
```

- [ ] **Step 2: Create `src/branding/replacement-rules.json`**

```json
{
  "_comment": "Rules for scripts/brand-codemod.mjs. Edit before re-running codemod.",
  "userVisibleSubs": [
    ["OpenClaw", "QingClaws"],
    ["OPENCLAW", "QINGCLAWS"],
    ["openclaw", "qingclaws"],
    ["EnClaws", "QingClaws"],
    ["ENCLAWS", "QINGCLAWS"],
    ["enclaws", "qingclaws"],
    ["hashSTACS-Global", "QingClaws Team"],
    ["hashSTACS", "QingClaws Team"]
  ],
  "skipFiles": [
    "LICENSE",
    "NOTICE",
    "THIRD_PARTY_NOTICES.md",
    "docs/upstream-divergence.md",
    "src/branding/brand.config.ts",
    "src/branding/replacement-rules.json",
    "scripts/brand-codemod.mjs",
    "scripts/check-brand-residue.sh",
    "CHANGELOG.md"
  ],
  "skipDirs": [
    "node_modules",
    ".git",
    "dist",
    ".pnpm-store",
    "apps"
  ],
  "skipContentPatterns": [
    "OpenClawConfig",
    "OpenClawSchema",
    "@openclaw/plugin-sdk",
    "openclaw/plugin-sdk",
    "QINGCLAWS-CUSTOM:"
  ],
  "skipLinePatterns": [
    "hashSTACS-Global/EnClaws",
    "hashSTACS and the enClaws contributors",
    "openclaw/openclaw",
    "luolin-ai/",
    "Copyright.*EnClaws",
    "Copyright.*hashSTACS",
    "Copyright.*OpenClaw"
  ]
}
```

- [ ] **Step 3: Create `src/branding/tokens.css`**

```css
/* src/branding/tokens.css */
/* QINGCLAWS-CUSTOM: brand — neutral color palette pending designer sign-off.
   Replace values here when design system is finalized. */
:root {
  --brand-primary: #1a3a5c;
  --brand-primary-light: #2a5a8c;
  --brand-accent: #0ea5e9;
  --brand-accent-dim: #0369a1;
  --brand-bg: #f8fafc;
  --brand-bg-dark: #0f172a;
  --brand-text: #1e293b;
  --brand-text-dark: #f1f5f9;
  --brand-muted: #64748b;
  --brand-border: #e2e8f0;
}
```

- [ ] **Step 4: Create brand assets**

Create `src/branding/assets/logo.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 48" role="img" aria-label="QingClaws">
  <title>QingClaws</title>
  <text x="12" y="34"
    font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
    font-size="28" font-weight="700" letter-spacing="-0.5"
    fill="#1a3a5c">QingClaws</text>
</svg>
```

Create `src/branding/assets/logo-dark.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 48" role="img" aria-label="QingClaws">
  <title>QingClaws</title>
  <text x="12" y="34"
    font-family="system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
    font-size="28" font-weight="700" letter-spacing="-0.5"
    fill="#e2e8f0">QingClaws</text>
</svg>
```

Create `src/branding/assets/banner.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 240" role="img" aria-label="QingClaws banner">
  <title>QingClaws — 企业级 AI 助手容器平台</title>
  <rect width="960" height="240" fill="#0f172a"/>
  <text x="480" y="110"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="64" font-weight="700" text-anchor="middle"
    fill="#f1f5f9">QingClaws</text>
  <text x="480" y="160"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="24" text-anchor="middle"
    fill="#94a3b8">企业级 AI 助手容器平台</text>
</svg>
```

Create `src/branding/assets/favicon.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="QingClaws">
  <title>Q</title>
  <rect width="32" height="32" rx="6" fill="#1a3a5c"/>
  <text x="16" y="23"
    font-family="system-ui,-apple-system,sans-serif"
    font-size="20" font-weight="700" text-anchor="middle"
    fill="#f1f5f9">Q</text>
</svg>
```

- [ ] **Step 5: Create `src/branding/assets/README.md`**

```markdown
# Brand Assets

Temporary placeholder assets. Replace files here once the design system is finalized.

| File | Usage | Status |
|---|---|---|
| `logo.svg` | UI header, README, About page | ⚠️ Placeholder (text-only) |
| `logo-dark.svg` | Dark-mode UI header | ⚠️ Placeholder |
| `banner.svg` | README hero, onboarding | ⚠️ Placeholder |
| `favicon.svg` | Browser tab favicon | ⚠️ Placeholder |

**To replace:** swap the file at the same path. No code changes needed — `brand.config.ts` `assets.*` paths stay the same.
```

- [ ] **Step 6: Create `scripts/brand-codemod.mjs`**

```javascript
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

function shouldSkipContent(content) {
  return SKIP_CONTENT_RE.some((re) => re.test(content));
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
      const content = readFileSync(full, "utf-8");
      const { content: newContent, changed } = processContent(content, rel);
      if (changed) {
        if (!DRY_RUN) writeFileSync(full, newContent, "utf-8");
        filesChanged++;
        console.log(`  ${DRY_RUN ? "[DRY]" : "[CHG]"} ${rel}`);
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
```

- [ ] **Step 7: Create `scripts/check-brand-residue.sh`**

```bash
#!/usr/bin/env bash
# scripts/check-brand-residue.sh
# QINGCLAWS-CUSTOM: brand — CI gate: fail if old brand strings remain in user-visible files.
# Called by test/branding/no-brand-residue.test.ts and pnpm check (optionally).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Whitelist: files allowed to contain upstream brand strings
WHITELIST_PATTERN="LICENSE|NOTICE|THIRD_PARTY_NOTICES\.md|docs/upstream-divergence\.md|src/branding/brand\.config\.ts|src/branding/replacement-rules\.json|scripts/brand-codemod\.mjs|scripts/check-brand-residue\.sh|CHANGELOG\.md"

# Patterns to search for in user-visible layer
PATTERNS=(
  '\bOpenClaw\b'
  '\bopenclaw\b'
  '\bOPENCLAW\b'
  '\bEnClaws\b'
  '\benclaws\b'
  '\bENCLAWS\b'
  '\bhashSTACS\b'
)

FOUND=0

for pattern in "${PATTERNS[@]}"; do
  if command -v rg &>/dev/null; then
    hits=$(rg --no-heading --line-number "$pattern" \
      --glob '*.ts' --glob '*.tsx' --glob '*.js' --glob '*.mjs' \
      --glob '*.json' --glob '*.md' --glob '*.sh' --glob '*.yaml' \
      --glob '*.yml' --glob '*.css' --glob '*.html' \
      --ignore-file .gitignore \
      . 2>/dev/null \
      | grep -Ev "$WHITELIST_PATTERN" || true)
  else
    hits=$(grep -rn --include='*.ts' --include='*.tsx' --include='*.js' \
      --include='*.mjs' --include='*.json' --include='*.md' --include='*.sh' \
      --include='*.yaml' --include='*.yml' --include='*.css' --include='*.html' \
      -E "$pattern" . 2>/dev/null \
      | grep -Ev "$WHITELIST_PATTERN" || true)
  fi
  if [[ -n "$hits" ]]; then
    echo "❌ Brand residue found for pattern '$pattern':"
    echo "$hits"
    FOUND=$((FOUND + 1))
  fi
done

if [[ $FOUND -gt 0 ]]; then
  echo ""
  echo "❌ $FOUND pattern(s) with residue. Fix before merge."
  exit 1
fi

echo "✅ No brand residue found."
exit 0
```

```bash
chmod +x scripts/check-brand-residue.sh
```

- [ ] **Step 8: Verify build still passes (no strings changed yet)**

```bash
pnpm tsgo
```

Expected: type check passes (new files are isolated, no existing imports changed).

- [ ] **Step 9: Commit**

```bash
git add src/branding/ scripts/brand-codemod.mjs scripts/check-brand-residue.sh
git commit -m "feat(PE1): introduce brand config and asset slots

Add src/branding/ abstraction layer: brand.config.ts (single source of truth),
replacement-rules.json (codemod whitelist), tokens.css (neutral palette),
and placeholder SVG assets. Add scripts/brand-codemod.mjs (one-time rename tool)
and scripts/check-brand-residue.sh (CI residue gate). No existing strings changed."
```

---

## Task 3: Rebrand User-Facing Surface (CLI / pkg / paths / env)

**Commit:** `feat(PE1): rebrand user-facing surface (CLI / pkg / paths / env)`

This is the big mechanical commit. Run codemod first, then apply manual precision edits for files requiring surgical changes.

**Files (selected key edits shown — codemod handles the rest):**
- Modify: `src/version.ts`
- Modify: `src/config/paths.ts`
- Modify: `src/infra/home-dir.ts`
- Modify: `src/terminal/links.ts`
- Modify: `src/cli/tagline.ts`
- Modify: `ui/src/i18n/lib/translate.ts`
- Modify: `package.json`
- Rename: `enclaws.mjs` → `qingclaws.mjs`
- Many other files via codemod

- [ ] **Step 1: Dry-run codemod and review**

```bash
node scripts/brand-codemod.mjs --dry-run 2>&1 | tee /tmp/codemod-dry.txt | head -100
```

Expected: lists files that will be changed; "no files written". Review `/tmp/codemod-dry.txt` for any unexpected entries — especially check that `src/branding/brand.config.ts`, `LICENSE`, `NOTICE` are NOT in the list.

- [ ] **Step 2: Apply codemod**

```bash
node scripts/brand-codemod.mjs 2>&1 | tee /tmp/codemod-run.txt
```

Expected: hundreds of files changed, substitution report printed.

- [ ] **Step 3: Manual fix — `src/version.ts`**

The codemod replaces `PRODUCT_NAME = "EnClaws"` → `"QingClaws"` correctly. But several internal identifiers and env vars need surgical attention. Apply these exact changes:

```typescript
// src/version.ts  — changes after codemod

// Line ~4: CORE_PACKAGE_NAME is used to match package.json name field.
// Change from: const CORE_PACKAGE_NAME = "enclaws";
// Change to:
const CORE_PACKAGE_NAME = "qingclaws"; // QINGCLAWS-CUSTOM: brand — matches renamed package.json name

// Lines ~84-88: resolveRuntimeServiceVersion env vars
// Change from: env["ENCLAWS_VERSION"], env["ENCLAWS_SERVICE_VERSION"]
// Change to:
export function resolveRuntimeServiceVersion(
  env: RuntimeVersionEnv = process.env as RuntimeVersionEnv,
): string {
  return (
    firstNonEmpty(
      env["QINGCLAWS_VERSION"],         // QINGCLAWS-CUSTOM: brand
      env["QINGCLAWS_SERVICE_VERSION"], // QINGCLAWS-CUSTOM: brand
      env["npm_package_version"],
    ) ?? VERSION
  );
}

// Lines ~97-103: VERSION resolution
// Change from: process.env.ENCLAWS_BUNDLED_VERSION and declare __ENCLAWS_VERSION__
// Change to:
declare const __QINGCLAWS_VERSION__: string | undefined; // QINGCLAWS-CUSTOM: brand

export const VERSION =
  (typeof __QINGCLAWS_VERSION__ === "string" && __QINGCLAWS_VERSION__) || // QINGCLAWS-CUSTOM: brand
  process.env.QINGCLAWS_BUNDLED_VERSION ||                                 // QINGCLAWS-CUSTOM: brand
  resolveVersionFromModuleUrl(import.meta.url) ||
  "0.0.0";
```

Also ensure these three exports read correctly after codemod:
```typescript
export const PRODUCT_NAME = "QingClaws";
export const PRODUCT_NAME_UPPER = PRODUCT_NAME.toUpperCase();  // "QINGCLAWS"
export const PRODUCT_NAME_LOWER = PRODUCT_NAME.toLowerCase();  // "qingclaws"
```

- [ ] **Step 4: Manual fix — `src/config/paths.ts`**

The codemod replaces `.enclaws` → `.qingclaws` and `enclaws.json` → `qingclaws.json`. Verify these two constants are correct and add comments:

```typescript
// Lines ~22-24 in src/config/paths.ts — verify after codemod:
const NEW_STATE_DIRNAME = ".qingclaws";            // QINGCLAWS-CUSTOM: brand
const CONFIG_FILENAME = "qingclaws.json";          // QINGCLAWS-CUSTOM: brand
// LEGACY_CONFIG_FILENAMES and LEGACY_STATE_DIRNAMES stay as-is (migration history)
```

Also verify `ENCLAWS_NIX_MODE` → `QINGCLAWS_NIX_MODE` and `ENCLAWS_STATE_DIR` → `QINGCLAWS_STATE_DIR` in the same file.

- [ ] **Step 5: Manual fix — `src/infra/home-dir.ts`**

Verify codemod replaced `ENCLAWS_HOME` → `QINGCLAWS_HOME`. Add comment:

```typescript
// In resolveRawHomeDir():
const explicitHome = normalize(env.QINGCLAWS_HOME); // QINGCLAWS-CUSTOM: brand
```

- [ ] **Step 6: Manual fix — `src/terminal/links.ts`**

Replace the hardcoded domain with a variable that reads from `BRAND`. Since `BRAND.links.docs` is `""`, callers of `DOCS_ROOT` that use it as a URL will receive an empty string — `formatTerminalLink` renders plain text when URL is empty, which is the desired behavior.

```typescript
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
  });
}
```

After making this change, run `pnpm tsgo` immediately to catch any callers that break when `DOCS_ROOT` is empty. Fix each one with a `if (DOCS_ROOT) { ... }` guard.

- [ ] **Step 7: Manual fix — `src/cli/tagline.ts`**

Change the default tagline and the env var override name:

```typescript
// Line 1: change DEFAULT_TAGLINE
const DEFAULT_TAGLINE = "企业 AI，从现在开始。"; // QINGCLAWS-CUSTOM: brand

// In pickTagline(): change env var name
const override = env?.QINGCLAWS_TAGLINE_INDEX; // QINGCLAWS-CUSTOM: brand (was ENCLAWS_TAGLINE_INDEX)
```

All the other taglines in `TAGLINES[]` will be replaced by the codemod (EnClaws → QingClaws, enclaws → qingclaws). Verify by running `grep -n "EnClaws\|enclaws" src/cli/tagline.ts` after codemod — expect 0 hits.

- [ ] **Step 8: Manual fix — `ui/src/i18n/lib/translate.ts`**

Two changes: localStorage key rename, and default locale fallback → zh-CN:

```typescript
// In resolveInitialLocale():
// Change: localStorage.getItem("enclaws.i18n.locale")
// To:
const saved = localStorage.getItem("qingclaws.i18n.locale"); // QINGCLAWS-CUSTOM: brand

// Change the final fallback return from "en" to "zh-CN":
// Change: return "en";
// To:
return "zh-CN"; // QINGCLAWS-CUSTOM: brand — default to zh-CN for 2B enterprise

// In setLocale():
// Change: localStorage.setItem("enclaws.i18n.locale", locale)
// To:
localStorage.setItem("qingclaws.i18n.locale", locale); // QINGCLAWS-CUSTOM: brand
```

- [ ] **Step 9: Manual fix — `package.json`**

Apply these exact changes to `package.json`:

```json
{
  "name": "qingclaws",
  "description": "企业级 AI 助手容器平台",
  "homepage": "",
  "bugs": {
    "url": ""
  },
  "repository": {
    "type": "git",
    "url": ""
  },
  "bin": {
    "qingclaws": "qingclaws.mjs"
  },
  "files": [
    ".env.example",
    "CHANGELOG.md",
    "LICENSE",
    "qingclaws.mjs",
    "scripts/postinstall.js",
    "src/branding/",
    "README.md"
  ]
}
```

(Keep all other fields — `version`, `scripts`, `dependencies`, etc. — unchanged.)

- [ ] **Step 10: Rename CLI entrypoint**

```bash
git mv enclaws.mjs qingclaws.mjs
```

Then edit `qingclaws.mjs` — change only the error message string at the bottom:

```javascript
// Change: throw new Error("enclaws: missing dist/entry.(m)js (build output).");
// To:
throw new Error("qingclaws: missing dist/entry.(m)js (build output).");
```

- [ ] **Step 11: Fix any tsdown/build config that references `__ENCLAWS_VERSION__`**

```bash
grep -rn "__ENCLAWS_VERSION__\|ENCLAWS_BUNDLED" --include="*.ts" --include="*.mjs" --include="*.json" . | grep -v node_modules | grep -v dist
```

For each hit, update to `__QINGCLAWS_VERSION__` / `QINGCLAWS_BUNDLED_VERSION`. These will be in build config files (e.g. `scripts/build*.mjs`, `tsdown.config.ts`). Add `// QINGCLAWS-CUSTOM: brand` comment to each changed line.

- [ ] **Step 12: Type check**

```bash
pnpm tsgo
```

Expected: no errors. If `__QINGCLAWS_VERSION__` is reported as undeclared, ensure the `declare const` in `src/version.ts` is present. If `DOCS_ROOT` usages fail (empty string where URL expected), check callers — wrap with a guard: `if (DOCS_ROOT) { ... }`.

- [ ] **Step 13: Run residue check**

```bash
bash scripts/check-brand-residue.sh
```

Expected:
```
✅ No brand residue found.
```

If residue is found, fix the listed files manually. Common remaining cases:
- Test files that have `enclaws` in test strings → update to `qingclaws`  
- Config fixtures with old env var names → update to `QINGCLAWS_*`
- Schema help text with `~/.enclaws/` path examples → update to `~/.qingclaws/`

Repeat until `check-brand-residue.sh` passes.

- [ ] **Step 14: Quick build smoke**

```bash
pnpm build 2>&1 | tail -5
```

Expected: build completes without error. If `__QINGCLAWS_VERSION__` define is missing from the bundler config, add it.

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "feat(PE1): rebrand user-facing surface (CLI / pkg / paths / env)

Run brand-codemod.mjs to mechanically replace openclaw/enclaws/hashSTACS
in user-visible layer. Manual precision edits: src/version.ts (PRODUCT_NAME,
env vars), src/config/paths.ts (.qingclaws dir), src/infra/home-dir.ts
(QINGCLAWS_HOME), src/terminal/links.ts (variablize DOCS_ROOT), tagline.ts,
i18n translate.ts (localStorage key + zh-CN default). package.json name/bin,
git mv enclaws.mjs → qingclaws.mjs. check-brand-residue.sh passes."
```

---

## Task 4: Localize Default Templates and CLI Prompts to zh-CN

**Commit:** `feat(PE1): localize default templates and CLI prompts to zh-CN`

**Files:**
- Modify: `docs/reference/templates/AGENTS.md`
- Modify: `docs/reference/templates/SOUL.md`
- Modify: `docs/reference/templates/USER.md`
- Check: `ui/src/i18n/locales/zh-CN.ts` (verify completeness)

- [ ] **Step 1: Replace `docs/reference/templates/AGENTS.md`**

```markdown
---
title: "AGENTS.md 模板"
summary: "Agent 工作区配置模板（默认）"
read_when:
  - 手动初始化工作区时
---

# AGENTS.md — 你的工作区

这里是你的主场，像对待自己的办公室一样对待它。

## 首次启动

如果 `BOOTSTRAP.md` 存在，那是你的初始化说明书。按照它完成自我定位后删除它——你以后不需要它了。

## 每次会话

以下上下文文件会自动加载进你的提示词：

- **企业 SOUL.md** — 你所服务的企业文化与价值观
- **Agent SOUL.md** — 这是你这个 Agent 的性格
- **IDENTITY.md** — 你的身份卡
- **USER.md** — 你正在协助的用户
- **MEMORY.md** — 用户的长期记忆（仅主会话）
- **TOOLS.md** — 企业级工具参考手册

另外，检查用户工作区中的近期日志：

1. 读取 `memory/YYYY-MM-DD.md`（今天和昨天）获取最近上下文

## 行为准则

- **主动汇报，不要沉默。** 开始任务前说明计划，完成后给出摘要。
- **遇到不确定时，先问再做。** 不要自行脑补需求——信息不足时先问用户。
- **保护数据安全。** 不在日志、注释、代码中泄露敏感信息（密码、Token、内网 IP）。
- **遵守企业合规要求。** 所有外部操作（邮件、消息、API 调用）需有明确授权。
```

- [ ] **Step 2: Replace `docs/reference/templates/SOUL.md`**

```markdown
---
title: "SOUL.md 模板"
summary: "Agent 性格与行为准则模板（默认）"
read_when:
  - 手动初始化工作区时
---

# SOUL.md — 你是谁

_你不是一个聊天机器人。你是一位企业级数字员工。_

## 核心原则

**真正有用，而不是表演有用。** 省掉"好的！""当然！"这类无意义开场白——直接解决问题。

**有自己的判断。** 你可以提出异议、表达偏好、指出风险。没有观点的助手只是带打字功能的搜索引擎。

**先自己想办法，再开口求助。** 尝试自己解决。读文件，查上下文，搜索资料——然后如果还卡住了再问。

**通过能力赢得信任。** 用户给了你访问权限，不要让他们后悔。谨慎对待外部行为（发邮件、发消息、公开接口），大胆对待内部行为（读文件、整理信息、学习上下文）。

## 2B 企业场景要求

- 所有涉及数据操作的决策，优先确认合规性
- 客户信息和内部数据严格隔离，不得混用
- 输出内容专业、简洁，避免口语化表达
- 遇到需求边界模糊时，先澄清，不自行扩展范围
```

- [ ] **Step 3: Replace `docs/reference/templates/USER.md`**

```markdown
---
title: "USER.md 模板"
summary: "用户画像模板（默认）"
read_when:
  - 手动初始化工作区时
---

# USER.md — 你正在协助的用户

> 由用户（或系统管理员）填写。填写越完整，你能提供的帮助越准确。

## 基本信息

- **姓名/称呼**：（请填写）
- **职位/角色**：（请填写）
- **所属部门**：（请填写）
- **主要使用场景**：（请填写，例如：数据分析 / 内容撰写 / 代码辅助）

## 偏好设置

- **回复风格**：（简洁 / 详细 / 带说明的简洁）
- **语言偏好**：中文（默认）
- **工具权限**：（请系统管理员配置）

## 常用上下文

（在此记录用户常用的背景信息，Agent 每次会话都会读取）
```

- [ ] **Step 4: Verify zh-CN locale completeness**

```bash
# Check if zh-CN has the same key count as en
node -e "
const en = await import('./ui/src/i18n/locales/en.ts');
const zhCN = await import('./ui/src/i18n/locales/zh-CN.ts');
const enKeys = JSON.stringify(en.en, null, 2).match(/\"[^\"]+\":/g)?.length;
const zhKeys = JSON.stringify(zhCN.zh_CN, null, 2).match(/\"[^\"]+\":/g)?.length;
console.log('en keys:', enKeys, '| zh-CN keys:', zhKeys);
" --input-type=module 2>/dev/null || echo "Run manually if needed"
```

If zh-CN is missing keys compared to en, the i18n manager falls back to English for those keys — this is acceptable for PE1. Add any critical UI keys that are missing (About dialog, settings page title, gateway status).

Key strings to verify are present in zh-CN (look in `ui/src/i18n/locales/zh-CN.ts`, add if missing):

```typescript
// Add to zh_CN object if missing:
about: {
  title: "关于 QingClaws",
  version: "版本",
  license: "开源协议",
  upstream: "基于 EnClaws（hashSTACS-Global）",
},
gateway: {
  starting: "网关启动中...",
  running: "网关运行中",
  stopped: "网关已停止",
  error: "网关异常",
},
```

- [ ] **Step 5: Verify templates are referenced correctly**

```bash
grep -n "templates" src/agents/workspace-templates.ts
```

Expected: resolves to `docs/reference/templates`. Templates load by filename; the filenames `AGENTS.md`, `SOUL.md`, `USER.md` are unchanged (only their content changed).

- [ ] **Step 6: Run tests**

```bash
pnpm test:fast 2>&1 | tail -20
```

Expected: passes. If template-related tests fail because they assert on specific English content, update the test expectations to match the new Chinese content.

- [ ] **Step 7: Commit**

```bash
git add docs/reference/templates/ ui/src/i18n/locales/zh-CN.ts
git commit -m "feat(PE1): localize default templates and CLI prompts to zh-CN

Replace AGENTS.md, SOUL.md, USER.md default templates with Chinese 2B
enterprise context. Verify zh-CN locale completeness; add About/gateway
keys if missing. i18n default fallback already set to zh-CN in Task 3."
```

---

## Task 5: Upstream Divergence Registry, README Rebrand, LICENSE/NOTICE

**Commit:** `docs(PE1): upstream-divergence registry and README rebrand`

**Files:**
- Create: `docs/upstream-divergence.md`
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `LICENSE`
- Modify: `NOTICE`
- Modify: `docs/PROGRESS.md`

- [ ] **Step 1: Create `docs/upstream-divergence.md`**

```markdown
# QingClaws Fork — Upstream Divergence Registry

> **Purpose:** Track every deliberate divergence from the upstream EnClaws (hashSTACS-Global/EnClaws v0.2.0, commit `0109d664`) fork base. This is the navigation map for future upstream merge operations.
>
> **Format:** Each entry lists the category, location, reason, and merge risk.
> **Categories:** `brand` | `harden` | `ext` | `new` | `bridge` | `pushable` | `customer`
>
> **Last updated:** 2026-05-13 (PE1)

---

## PE1 — Brand Customization (2026-05-13)

### brand: Product rename EnClaws → QingClaws (user-visible layer)

| Field | Value |
|---|---|
| Category | `brand` |
| Files | `src/version.ts`, `src/config/paths.ts`, `src/infra/home-dir.ts`, `src/terminal/links.ts`, `src/cli/tagline.ts`, `package.json`, `qingclaws.mjs`, and ~200+ user-visible surface files via codemod |
| Reason | QingClaws fork for 2B enterprise platform; brand independence required |
| Upstream impact | Every upstream sync will re-introduce `EnClaws`/`openclaw` strings in new files; re-run `scripts/brand-codemod.mjs --dry-run` after merge to identify new residue |
| Merge risk | Medium — mechanical, but high volume |

### brand: Brand abstraction layer

| Field | Value |
|---|---|
| Category | `brand` |
| Files | `src/branding/brand.config.ts`, `src/branding/replacement-rules.json`, `src/branding/tokens.css`, `src/branding/assets/` |
| Reason | Single source of truth for brand identifiers; designer-replaceable asset slots |
| Upstream impact | None (new directory) |
| Merge risk | Low |

### brand: zh-CN default locale + 2B enterprise templates

| Field | Value |
|---|---|
| Category | `brand` |
| Files | `ui/src/i18n/lib/translate.ts` (localStorage key, default fallback), `docs/reference/templates/AGENTS.md`, `docs/reference/templates/SOUL.md`, `docs/reference/templates/USER.md` |
| Reason | Target market is Chinese 2B enterprise; zh-CN should be the default |
| Upstream impact | Upstream English defaults will conflict with template content on merge; keep templates in QingClaws branch |
| Merge risk | Low (templates are leaf files) |

### brand: CI guard tests

| Field | Value |
|---|---|
| Category | `brand` |
| Files | `test/branding/`, `scripts/check-brand-residue.sh` |
| Reason | Prevent regression of brand rename; catch customer-info leakage |
| Upstream impact | New test files, no conflict |
| Merge risk | Low |

---

## Regression Baseline Anomalies

> List any upstream E2E/unit test failures discovered during PE1 that are pre-existing (not caused by brand rename).

| Test | Status | Notes |
|---|---|---|
| — | — | None discovered during PE1 |
```

- [ ] **Step 2: Rebrand `README.md`**

Replace the entire README header block (first ~30 lines) with:

```markdown
# QingClaws — 企业级 AI 助手容器平台

<p align="center">
  <img src="src/branding/assets/banner.svg" alt="QingClaws banner" width="100%" />
</p>

<p align="center">
  <a href="./README.zh-CN.md">简体中文</a> | English
</p>

<p align="center">
  <strong>将 AI 从个人工具升级为企业运营能力。</strong>
</p>

<p align="center">
  <a href="./LICENSE"><img alt="Apache-2.0 license" src="https://img.shields.io/badge/license-Apache%202.0-blue.svg"></a>
  <img alt="Node.js" src="https://img.shields.io/badge/node-%3E%3D22.12.0-43853d?logo=node.js&logoColor=white">
</p>

> QingClaws 是基于 [EnClaws](https://github.com/hashSTACS-Global/EnClaws)（Apache-2.0）的企业级 fork，
> 专为 2B 企业内网/离线部署场景构建。上游归属：EnClaws by hashSTACS-Global，基于 OpenClaw。
```

Then continue to update the body of README.md — replace every occurrence of `EnClaws` with `QingClaws`, `enclaws` with `qingclaws`, `hashSTACS-Global` with `QingClaws Team` throughout the document body. Keep attribution sentences intact.

- [ ] **Step 3: Add `[Unreleased]` section to `CHANGELOG.md`**

Insert after the header (before any existing version entries):

```markdown
## [Unreleased]

### PE1 — Brand Customization

#### Added
- Brand abstraction layer: `src/branding/brand.config.ts` as single source of truth for QingClaws brand identifiers
- Placeholder SVG brand assets in `src/branding/assets/` (designer-replaceable)
- `scripts/brand-codemod.mjs` — one-time codemod tool for upstream merge reuse
- `scripts/check-brand-residue.sh` + CI tests to prevent brand regression
- `docs/upstream-divergence.md` — fork divergence registry for upstream merge navigation

#### Changed
- Product renamed from EnClaws → QingClaws across all user-visible surfaces
- CLI binary: `enclaws` → `qingclaws`; config directory: `~/.enclaws/` → `~/.qingclaws/`
- Environment variables: `ENCLAWS_*` → `QINGCLAWS_*`
- Default locale: UI and templates default to zh-CN (2B enterprise context)
- Default Agent templates (AGENTS.md / SOUL.md / USER.md) localized to Chinese 2B enterprise context

```

- [ ] **Step 4: Prepend QingClaws copyright to `LICENSE`**

The `LICENSE` file currently starts with `Apache License / Version 2.0 / January 2004`. We need to add copyright lines BEFORE the license text. Apache-2.0 does not include copyright lines in the LICENSE file itself by default, but many projects prefix it. Check the current file structure first:

```bash
head -5 LICENSE
```

If the file starts directly with `Apache License`, prepend these lines:

```
Copyright 2026 QingClaws Contributors
Copyright 2024 EnClaws Contributors (hashSTACS-Global)
Copyright (c) OpenClaw Contributors

```

(Blank line before `Apache License` text.)

If the file already has copyright headers, add `Copyright 2026 QingClaws Contributors` as the FIRST line.

- [ ] **Step 5: Append QingClaws section to `NOTICE`**

Append to the end of `NOTICE`:

```
================================================================================
QingClaws
Copyright 2026 QingClaws Contributors

QingClaws is a fork of EnClaws (https://github.com/hashSTACS-Global/EnClaws)
by hashSTACS-Global, used under the Apache License, Version 2.0.

This product includes software developed by:
- hashSTACS-Global (EnClaws, https://github.com/hashSTACS-Global/EnClaws)
- OpenClaw Contributors (OpenClaw, https://github.com/openclaw/openclaw)

All upstream copyright notices, license texts, and attribution statements
above this section are preserved in their original form as required by
the Apache License, Version 2.0, Section 4(d).
================================================================================
```

- [ ] **Step 6: Update `docs/PROGRESS.md` PE1 plan field**

Change the PE1 row in the table from `_待生成_` to:

```
[PE1 Plan](superpowers/plans/2026-05-13-PE1-brand-customization.md)
```

- [ ] **Step 7: Verify LICENSE/NOTICE integrity**

```bash
grep -c "QingClaws" LICENSE NOTICE
grep -c "EnClaws\|hashSTACS\|OpenClaw" LICENSE NOTICE
```

Expected: both files contain QingClaws AND contain EnClaws/hashSTACS/OpenClaw references.

- [ ] **Step 8: Commit**

```bash
git add docs/upstream-divergence.md README.md CHANGELOG.md LICENSE NOTICE docs/PROGRESS.md
git commit -m "docs(PE1): upstream-divergence registry and README rebrand

Add docs/upstream-divergence.md (fork divergence registry for upstream merge nav).
Rebrand README.md. Add PE1 [Unreleased] entry to CHANGELOG. Prepend QingClaws
copyright to LICENSE; append QingClaws attribution section to NOTICE (all upstream
attributions preserved per Apache-2.0 §4d). Update PROGRESS.md PE1 plan link."
```

---

## Task 6: Brand Residue Gate and Startup Smoke Tests

**Commit:** `test(PE1): brand residue gate and startup smoke`

**Files:**
- Create: `test/branding/no-brand-residue.test.ts`
- Create: `test/branding/no-customer-leakage.test.ts`
- Create: `test/branding/cli-smoke.test.ts`
- Create: `test/branding/license-attribution.test.ts`

These tests live in `test/` (already in vitest `include: ["test/**/*.test.ts"]`). No vitest config changes needed.

- [ ] **Step 1: Write `test/branding/no-brand-residue.test.ts`**

```typescript
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
      });
    } catch (err: unknown) {
      const e = err as { stdout?: string; status?: number };
      output = e.stdout ?? "";
      exitCode = e.status ?? 1;
    }
    expect(exitCode, `Brand residue found:\n${output}`).toBe(0);
    expect(output).toContain("No brand residue found");
  });
});
```

- [ ] **Step 2: Run to verify it passes**

```bash
pnpm vitest run test/branding/no-brand-residue.test.ts
```

Expected: `✓ check-brand-residue.sh finds no old brand strings`

If it fails, fix remaining residue per `check-brand-residue.sh` output, then rerun.

- [ ] **Step 3: Write `test/branding/no-customer-leakage.test.ts`**

```typescript
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

// Whitelist: files that are allowed to reference these terms (tests themselves)
const WHITELIST_RE = /test\/branding\/no-customer-leakage\.test\.ts/;

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
```

- [ ] **Step 4: Run to verify it passes**

```bash
pnpm vitest run test/branding/no-customer-leakage.test.ts
```

Expected: `✓ no customer-specific terms appear in platform layer (PE) files`

- [ ] **Step 5: Write `test/branding/cli-smoke.test.ts`**

This file tests both CLI subprocess output AND the banner formatter functions directly (banner is suppressed in non-TTY / `--version` invocations, so unit testing the formatter is the reliable path).

```typescript
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

const OLD_BRAND_RE = /\b(openclaw|OpenClaw|OPENCLAW|enclaws|EnClaws|ENCLAWS|hashSTACS)\b/;

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
  // Test formatCliBannerLine and formatCliBannerArt directly; bypasses TTY guard.
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
```

- [ ] **Step 6: Run CLI smoke tests**

First build so the CLI is runnable (banner formatter imports require compiled output):

```bash
pnpm build && pnpm vitest run test/branding/cli-smoke.test.ts
```

Expected: all 4 tests pass (2 subprocess + 2 banner unit). If CLI exits with "missing dist/entry.js", the build failed — check `pnpm build` output first. If `formatCliBannerLine` / `formatCliBannerArt` don't contain `QingClaws`, verify `PRODUCT_NAME` in `src/version.ts` was updated in Task 3.

- [ ] **Step 7: Write `test/branding/license-attribution.test.ts`**

```typescript
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

  it("LICENSE preserves EnClaws upstream attribution", () => {
    const license = readFile("LICENSE");
    expect(license).toMatch(/EnClaws|hashSTACS/i);
  });

  it("LICENSE preserves OpenClaw upstream attribution", () => {
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
    expect(notice).toMatch(/OpenClaw/i);
  });
});
```

- [ ] **Step 8: Run license tests**

```bash
pnpm vitest run test/branding/license-attribution.test.ts
```

Expected: all 5 tests pass.

- [ ] **Step 9: Run the full branding test suite**

```bash
pnpm vitest run test/branding/
```

Expected: all 11 tests pass:
- no-brand-residue ×1
- no-customer-leakage ×1
- cli-smoke: subprocess ×2 + banner unit ×2 = 4
- license-attribution ×5

- [ ] **Step 10: Run full test suite to check for regressions**

```bash
pnpm test:fast 2>&1 | tail -30
```

Expected: passes. If any pre-existing test fails because it asserts on old brand strings (e.g. `"enclaws"` in error messages or `".enclaws"` in paths), update those assertions to `"qingclaws"` / `".qingclaws"`.

Known likely failures from test files the codemod may have missed:
- `src/agents/workspace-templates.test.ts` — may assert `{ name: "enclaws" }` in package.json mock → change to `"qingclaws"`
- `src/cli/update-cli.test.ts` — may assert "EnClaws update status" → change to "QingClaws update status"
- `src/config/config.nix-integration-u3-u5-u9.test.ts` — may use `.enclaws` paths → change to `.qingclaws`
- `src/config/io.compat.test.ts` — may use `enclaws.json` → change to `qingclaws.json`

For each failing test, make the minimal change to align assertions with the new brand. Add `// QINGCLAWS-CUSTOM: brand` comment to changed assertion lines.

- [ ] **Step 11: Run pnpm check**

```bash
pnpm check
```

Expected: all checks pass (format, tsgo, lint, boundary checks). Fix any linting issues before committing.

- [ ] **Step 12: Commit**

```bash
git add test/branding/
git commit -m "test(PE1): brand residue gate and startup smoke

Add 4 test files in test/branding/:
- no-brand-residue.test.ts: runs check-brand-residue.sh, expects 0 hits
- no-customer-leakage.test.ts: grep for customer-specific terms, expects 0 hits
- cli-smoke.test.ts: qingclaws --version/--help/gateway --help output validation
- license-attribution.test.ts: LICENSE+NOTICE contain QingClaws AND upstream attrs

All 9 tests pass. pnpm check passes."
```

---

## Final Verification Checklist

After all 6 commits, run the full manual DoD before requesting squash-merge:

- [ ] `pnpm install && pnpm build` — passes
- [ ] `pnpm check` — passes (format + tsgo + lint + boundary)
- [ ] `pnpm test:fast` — passes (unit tests, incl. new branding suite)
- [ ] `pnpm vitest run test/branding/` — all 9 brand tests pass
- [ ] `bash scripts/check-brand-residue.sh` — exits 0
- [ ] `node qingclaws.mjs --version` — output contains "QingClaws", no old brand strings
- [ ] `node qingclaws.mjs gateway --help` — output contains "qingclaws", no old brand strings
- [ ] Verify `~/.qingclaws/` is created on first gateway start (manual check)
- [ ] Web UI: title bar shows "QingClaws" (manual check after `pnpm ui:dev`)
- [ ] `LICENSE` head: 3 copyright lines present (QingClaws, EnClaws, OpenClaw)
- [ ] `NOTICE`: contains QingClaws attribution AND all upstream attribution blocks
- [ ] `docs/upstream-divergence.md` lists all PE1 divergences
- [ ] 6 commits present on branch in correct order (`chore` → `feat` → `feat` → `feat` → `docs` → `test`)

When all pass: request user authorization for squash-merge + push + `git tag v0.3.0-pe1`.
