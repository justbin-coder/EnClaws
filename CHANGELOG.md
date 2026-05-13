# Changelog

Notable changes to this project will be documented in this file.
The format generally follows Keep a Changelog, and versions should follow Semantic Versioning where practical.

## [Unreleased]

### PE1 — Brand Customization

#### Added
- Brand abstraction layer: `src/branding/brand.config.ts` as single source of truth for QingClaws brand identifiers
- Placeholder SVG brand assets in `src/branding/assets/` (designer-replaceable)
- `scripts/brand-codemod.mjs` — one-time codemod tool for upstream merge reuse
- `scripts/check-brand-residue.sh` + CI tests to prevent brand regression
- `docs/upstream-divergence.md` — fork divergence registry for upstream merge navigation

#### Changed
- Product renamed from QingClaws → QingClaws across all user-visible surfaces
- CLI binary: `qingclaws` → `qingclaws`; config directory: `~/.qingclaws/` → `~/.qingclaws/`
- Environment variables: `QINGCLAWS_*` → `QINGCLAWS_*`
- Default locale: UI and templates default to zh-CN (2B enterprise context)
- Default Agent templates (AGENTS.md / SOUL.md / USER.md) localized to Chinese 2B enterprise context

### Added
- `NOTICE`
- `TRADEMARKS.md`
- `THIRD_PARTY_NOTICES.md`
- `CODE_OF_CONDUCT.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `SUPPORT.md`
- `GOVERNANCE.md`
- GitHub Issue and Pull Request templates
- Upstream license copies under `LICENSES/third-party/`
- `CLAUDE.local.md` — QingClaws fork 项目级补充规范
- `docs/PROGRESS.md` — PE / AE Epic 状态看板
- `docs/superpowers/specs/` — 移入 V4 需求文档（01 / 02 / 03）
- `docs/superpowers/plans/` — `superpowers:writing-plans` 输出目录

### Changed
- `CLAUDE.md` — 末尾追加 `@AGENTS.md` + `@CLAUDE.local.md` 两行显式 import

### Development
- 启动 **PE1 品牌化** Epic（分支 `feat/PE1-brand-customization`，2026-05-13）
- 采用 PE1-PE7 / AE1-AE5 Epic 编号体系（编号 = 执行顺序，详见 `docs/superpowers/specs/`）
