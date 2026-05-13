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
| Upstream impact | Every upstream sync will re-introduce `EnClaws`/`enclaws` strings in new files; re-run `scripts/brand-codemod.mjs --dry-run` after merge to identify new residue |
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
| `src/security/audit.test.ts` — "warns when sandbox browser containers have missing or stale hash labels" | Pre-existing | Unrelated to brand rename; exists in upstream baseline |
