# PE1 品牌化设计文档（Brand Customization Design）

**Epic**：PE1（产品底座 Epic，执行顺序首位）
**分支**：`feat/PE1-brand-customization`（基线 `baseline/v0.2.0`）
**目标 tag**：`v0.3.0-pe1`
**估算**：5-7 人天
**日期**：2026-05-13

---

## 1. 上下文

QingClaws 是基于 QingClaws v0.2.0（QingClaws Team 对 QingClaws 的二次品牌化产物）的 fork，目标是公司独立品牌的 2B 企业级 Agent 平台底座。spec §11 把品牌化前置为 PE1，理由：先做品牌化，后续 PE2-PE7 的产出（CLI 提示 / log / 文档 / 默认模板）天然带 QingClaws 品牌，避免回头改。

仓库现状扫描：
- `qingclaws / QingClaws / QINGCLAWS` 在 src/ui/docs/extensions/skills/scripts 共 ~16,335 hits
- `qingclaws / QingClaws` 在 src/ui/docs/scripts 共 ~4,555 hits（extensions/skills 未被 QingClaws Team 覆盖）
- `QingClaws Team / QingClaws Team` 出现在 9 文件（README / NOTICE / scripts / package.json）
- `ui/src/i18n/locales/{en,zh-CN,zh-TW,de,pt-BR}.ts` — i18n 机制已就绪
- 无 `src/branding/` 抽象层 — 需新建

**关联文档**：[01 产品底座需求 §6](./01-platform-requirements.md) + [03 实现映射 §5.1](./03-implementation-mapping.md) + [PROGRESS](../../../docs/PROGRESS.md) + `CLAUDE.local.md` §6 / §7

## 2. 决策摘要

| # | 决策 | 选择 |
|---|---|---|
| D1 | 品牌名 | **QingClaws** 统一用于产品名 / npm 包名 / CLI / 配置目录 / 环境变量前缀 |
| D2 | 视觉资产策略 | "品牌资产插槽化" + 一套**临时可用**资产（文字 Logo + 中性色板，可对外演示；设计师定稿后只换文件） |
| D3 | 重命名彻底度 | **双层**：用户可见层 100% 替换；源码内部层（import / 类名 / 私有变量 / 测试名）保留 `openclaw` 标识 + `// QINGCLAWS-CUSTOM: brand` 注释 + 登记 `docs/upstream-divergence.md` |
| D4 | 待替换字符串 | `qingclaws/QingClaws/QINGCLAWS` 全替换；`qingclaws/QingClaws` 替换（仅"上游归属语句"段保留）；`QingClaws Team / QingClaws Team` UI/banner/CLI 替换（LICENSE/NOTICE 保留并追加 QingClaws 归属）；`qingclaws.ai` 域名变量化 + 默认占位空 |
| D5 | 迁移兼容 | **不保留 qingclaws 别名、不写迁移工具**；本机 `~/.qingclaws/` / `~/.qingclaws/` 直接重建为 `~/.qingclaws/`（fork 早期 + 客户尚未部署） |
| D6 | B3 默认模板范围 | 仅中文化 + 2B 企业语境；**不动 `skills/` 60+ 现有清单**；默认 AGENTS.md / SOUL.md / USER.md 模板内容用中文 + 通用企业措辞 |
| D7 | npm 发布姿态 | **不发布到公网 npm**（客户内网 / 离线部署，PE2 离线安装包机制覆盖分发） |
| D8 | 客户特定信息隔离 | 底座（PE）严格 0 出现客户特定内容（统计/调查员/账页/农业/畜牧/居民收支/国家统计局 等关键词）；所有客户业务信息归属 Layer 3 应用层（AE1-AE5） |

## 3. 总体架构

### 3.1 双层重命名的精确定义

| 用户可见层（全量替换为 QingClaws） | 源码内部层（保留 qingclaws 标识 + 注释标记） |
|---|---|
| `package.json` name / bin / scripts | 内部 `import` 路径中的 `"qingclaws"` npm 包内部模块名 |
| CLI 可执行名（`qingclaws.mjs` → `qingclaws.mjs`） | 类名 / 函数名 / 内部变量 |
| 配置目录（`~/.qingclaws/` / `~/.qingclaws/`）→ `~/.qingclaws/` | 测试 `describe/it` 块的旧名（避免 git mv 历史断裂） |
| 环境变量 `OPENCLAW_*` / `ENCLAWS_*` → `QINGCLAWS_*` | 私有 npm scope（如 `@openclaw/plugin-sdk` 内部命名） |
| 启动 banner / CLI 欢迎信息 / 错误提示 | 上游同步的目录命名（`extensions/*` 子包名） |
| README / 用户面文档 / CHANGELOG headline | commit message 历史 / 上游分支命名约定 |
| UI 标题栏 / 启动页 / About / 设置页 |  |
| HTTP API endpoint 路径中带品牌段的部分 |  |
| Logo / favicon / banner 图片资产 |  |
| Docker 镜像 tag / launchd label / GitHub workflow 用户面名称 |  |

### 3.2 品牌抽象层（新建）

```
src/branding/
├── brand.config.ts          # 单一权威品牌配置（产品名/CLI/资产路径/链接/版权年）
├── replacement-rules.json   # codemod 白名单与替换规则
├── assets/
│   ├── logo.svg             # 文字版临时 Logo（QingClaws 字样 + 中性色）
│   ├── logo-dark.svg        # 深色模式变体
│   ├── favicon.ico
│   ├── banner.png           # README banner
│   └── README.md            # 设计师定稿后直接替换这些文件即可
└── tokens.css               # 色板 CSS variables（中性色板，等设计师定稿后改值）
```

### 3.3 上游分歧登记机制

- 新建 `docs/upstream-divergence.md`，按 spec §9 格式分类登记本期所有改动（brand / harden / ext / new / bridge / pushable / customer）
- 所有源码内部层的修改点加 `// QINGCLAWS-CUSTOM: brand <一行原因>` 注释
- 这两件事是日后合并 QingClaws / QingClaws 上游的"导航图"

## 4. 核心组件与数据流

### 4.1 `brand.config.ts` Schema

```ts
// src/branding/brand.config.ts
export const BRAND = {
  productName: "QingClaws",          // 用户面产品名（中英文统一）
  productNameZh: "QingClaws",        // 中文界面下的展示名（暂同英文，预留扩展位）
  productTagline: "企业级 AI 助手容器平台",
  cliName: "qingclaws",              // bin 名 + CLI 命令名
  pkgName: "qingclaws",              // npm 包名（扁平结构，不发布公网）
  configDirName: ".qingclaws",       // ~/.qingclaws/
  envPrefix: "QINGCLAWS_",           // QINGCLAWS_HOME / QINGCLAWS_GATEWAY_PORT ...

  assets: {
    logo: "/branding/assets/logo.svg",
    logoDark: "/branding/assets/logo-dark.svg",
    favicon: "/branding/assets/favicon.ico",
    banner: "/branding/assets/banner.png",
  },

  links: {
    homepage: "",        // 留空，UI 见空不渲染
    docs: "",
    issues: "",
    repo: "",
  },

  upstream: {
    project: "QingClaws",
    org: "QingClaws Team",
    parent: "QingClaws",
    license: "Apache-2.0",
  },
} as const;
```

### 4.2 注入路径（按位置分流）

| 位置 | 注入方式 | 例子 |
|---|---|---|
| 编译期固定字符串（`package.json` / 构建配置 / Docker tag） | codemod 物理写入 | `package.json` `name` 字段；`qingclaws.mjs` → `qingclaws.mjs` |
| 运行时 TS/JS 字符串 | `import { BRAND }` | ``console.log(`Welcome to ${BRAND.productName}`)`` |
| UI 文本 | i18n locale 文件 + `BRAND` 模板插值 | ``welcome: `欢迎使用 ${BRAND.productNameZh}` `` |
| 文档 Markdown 静态文本 | codemod 物理写入 | README / CHANGELOG / 用户面文档 |
| Logo / favicon / banner | 文件层替换 + `BRAND.assets.*` 引用 | UI / README banner / Docker `--label` |

### 4.3 Codemod 工具（`scripts/brand-codemod.mjs`）

一次性替换工具，PE1 完成后归档保留以备上游合并冲突复用。

核心逻辑：

```
1. 加载 src/branding/replacement-rules.json（用户面 vs 源码内部分类规则）
2. 遍历仓库（排除：node_modules / dist / .git / LICENSE / NOTICE / 
   THIRD_PARTY_NOTICES.md / docs/upstream-divergence.md / 上游归属语句白名单）
3. 对用户面层做正则替换：
   - qingclaws / QingClaws / QINGCLAWS → qingclaws / QingClaws / QINGCLAWS
   - qingclaws / QingClaws → qingclaws / QingClaws
   - QingClaws Team / QingClaws Team → QingClaws Team（仅 UI/banner/CLI；NOTICE/LICENSE 保留并追加）
4. 对源码内部层的边界处加 `// QINGCLAWS-CUSTOM: brand` 注释
5. 打印替换报告：每类字符串改了几处、跳过几处（白名单原因）
6. 支持 --dry-run（仅报告不改）和 --section=<name>（按区域分批）
```

### 4.4 残留检测脚本（`scripts/check-brand-residue.sh`，CI 守门）

```bash
# 在用户可见层文件 rg 是否还有 qingclaws / qingclaws / QingClaws Team 字样
# 白名单：LICENSE / NOTICE / THIRD_PARTY_NOTICES.md / 
#         docs/upstream-divergence.md / src/branding/brand.config.ts (upstream 字段)
# 不通过则 PR 失败
```

### 4.5 i18n 默认 locale 切换

- `ui/src/i18n/index.ts`：默认 locale 从 `en` 改为 `zh-CN`；保留 `en` locale 完整可用
- `ui/src/i18n/locales/zh-CN.ts`：补全 2B 企业语境中文文案（welcome / error / button / menu / about）
- CLI 优先按 `LANG` 环境变量探测，默认 `zh-CN`
- 默认 AGENTS.md / SOUL.md / USER.md 模板**不走 i18n**（这是 Agent prompt 模板，启动时拷贝到 `~/.qingclaws/agents/<id>/`，是 Agent 自有内容，直接 hardcode 中文）

## 5. 6 个 Commit 实施清单

| # | Commit | 涉及范围 | 工作量 |
|---|---|---|---:|
| 1 | `chore(docs): slim CLAUDE.md and remove redundant memory` | MD 瘦身（`QingClaws/CLAUDE.md` 删与 AGENTS.md 重复章节 ~80 行；`CLAUDE.local.md` §2 放宽 + §3 加冲突消解；删冗余 memory + 更新 MEMORY.md 索引） | 0.5d |
| 2 | `feat(PE1): introduce brand config and asset slots` | 落地 `src/branding/`（brand.config.ts / assets/ / tokens.css / replacement-rules.json）+ `scripts/brand-codemod.mjs` + `scripts/check-brand-residue.sh`；**不修改任何现有字符串** | 0.5d |
| 3 | `feat(PE1): rebrand user-facing surface (CLI / pkg / paths / env)` | 运行 codemod 做机械替换 + 手工核校：`package.json` name/bin/scripts、`bin: qingclaws.mjs → qingclaws.mjs`（git mv）、CLI 欢迎/启动 banner/错误信息、环境变量、UI 标题栏/About/启动页、Docker/launchd/GHA 用户面 label、HTTP API 路径 | 2-3d |
| 4 | `feat(PE1): localize default templates and CLI prompts to zh-CN` | `ui/src/i18n/index.ts` 默认 locale 切 zh-CN；补全 `zh-CN.ts` 企业语境文案；默认 AGENTS.md / SOUL.md / USER.md 中文 + 通用 2B 措辞；CLI banner / `--help` / 错误提示中文优先 | 1d |
| 5 | `docs(PE1): upstream-divergence registry and README rebrand` | 新增 `docs/upstream-divergence.md`；rebrand `README.md` / `README.zh-CN.md`；`CHANGELOG.md` 追加 `[Unreleased]`；`LICENSE` / `NOTICE` 追加 QingClaws 归属（**保留上游所有归属**）；`THIRD_PARTY_NOTICES.md` 不动；`CONTRIBUTING.md` / `CODE_OF_CONDUCT.md` rebrand 产品名引用 | 0.5d |
| 6 | `test(PE1): brand residue gate and startup smoke` | 5 个自动化测试（见 §7.A）；接入 `pnpm check` / `pnpm test` 及 PR gate | 0.5-1d |

**LICENSE 头部预期格式**：

```
Copyright 2026 QingClaws Contributors
Copyright 2024 EnClaws Contributors (hashSTACS-Global)
Copyright (earlier) OpenClaw Contributors

Licensed under the Apache License, Version 2.0 ...
```

**NOTICE 预期格式**：保留全部上游 attribution 段不删一字，**追加** QingClaws attribution 段（说明 QingClaws 基于 QingClaws fork、Apache-2.0 协议、版权所有者）。

## 6. 风险与控制

| 风险 | 应对 |
|---|---|
| codemod 误伤源码内部层 | `replacement-rules.json` 用白名单分类；先 `--dry-run` + 人工抽样核校；ui / extensions / skills 单独处理（频度差异大） |
| extensions / skills 子目录 package.json 中的 `openclaw/plugin-sdk` 依赖不能改 | codemod 排除规则加 `extensions/*/package.json` 和 `skills/*/SKILL.md` 的依赖字段 |
| Docker 镜像 tag 改后老镜像 ID 不可达 | PE1 不改已发布镜像 tag，只改新构建脚本里的 tag 默认值 |
| i18n 默认切到 zh-CN 后英文用户体验降级 | 保留 `en` locale 完整可用；CLI 优先按 `LANG` 探测；UI 提供语言切换 |
| 6 个 commit 中第 3 步 codemod 局部失败 | 每个 commit 独立可 revert；codemod 失败局部重跑而非全量重置 |
| 残留客户特定信息（违反 D8） | `no-customer-leakage.test.ts` 自动 grep 关键词清单作为 PR gate |
| 上游 E2E 测试基线异常 | 允许失败但需登记到 `docs/upstream-divergence.md` "回归基线异常" 段；若新发现失败需评估是否品牌化误伤 |

## 7. 验收标准（DoD）

### 7.A 自动化测试

| 测试 | 实现 | 通过条件 |
|---|---|---|
| `tests/branding/no-brand-residue.test.ts` | 跑 `check-brand-residue.sh` 扫用户面文件 | 残留 = 0 |
| `tests/branding/no-customer-leakage.test.ts` | `rg "统计\|调查员\|账页\|农业\|畜牧\|居民收支\|国家统计局\|统计局"` 扫底座所有用户面文件 | 命中 = 0 |
| `tests/branding/cli-smoke.test.ts` | `qingclaws --version` / `--help` / `gateway --help` 三条命令 | 输出含 `QingClaws`，不含 `qingclaws/qingclaws/QingClaws Team` |
| `tests/branding/startup-banner.snapshot.ts` | 启动 gateway 抓 stdout banner、UI About、UI 启动页标题 | 对照 snapshot 一致；含 QingClaws |
| `tests/branding/license-attribution.test.ts` | 解析 `LICENSE` / `NOTICE` 头部 | 含 QingClaws 归属 **且** 含 QingClaws / QingClaws Team / QingClaws 上游归属 |

接入 `pnpm check` / `pnpm test` 与 `.github/workflows/` PR gate。

### 7.B 手工验收 Checklist

```
□ pnpm install + pnpm build 通过
□ pnpm check 通过（含 brand-residue + customer-leakage + cli-smoke）
□ pnpm test 通过（含品牌测试 + 原有回归基线）
□ qingclaws --version 输出 "QingClaws vx.y.z"
□ qingclaws gateway 启动，banner 显示 QingClaws，写入 ~/.qingclaws/
□ Web UI 启动，标题栏 / About / 启动页 显示 QingClaws
□ 默认 locale 为 zh-CN（中文界面），文案为通用 2B 企业语境（无客户特定词汇）
□ 默认 AGENTS.md / SOUL.md / USER.md 模板内容人工读一遍：中文 + 通用 2B 企业措辞
□ Logo / favicon / banner 显示临时品牌资产
□ docs/upstream-divergence.md 完整列出本期所有改动点
□ LICENSE 头部 Copyright 三行齐全（QingClaws + EnClaws + OpenClaw 归属）
□ NOTICE 含 QingClaws 段 + 上游 attribution 段
□ THIRD_PARTY_NOTICES.md 未删条
□ 6 个 commit 顺序无误，Conventional Commits 格式（chore/feat/feat/feat/docs/test）
```

### 7.C 回归基线

- 回归 1：Gateway 启动 + 一条假消息往返（最小 e2e）
- 回归 2：`pnpm test:fast` 单元测试 100% 通过
- 回归 3：`pnpm test:e2e` 核心 E2E case，失败需登记到 `docs/upstream-divergence.md` "回归基线异常" 段

### 7.D PR 合入 main 前最后把关

- 手工启动 gateway + UI demo（截图存档），确认：
  - 启动 banner 是 QingClaws
  - About 弹窗无 QingClaws / QingClaws Team / QingClaws / 客户特定词汇
  - `~/.qingclaws/` 目录创建成功
- 通过后按 CLAUDE.local.md §7 用户授权 squash-merge 到 main + 用户授权 push + tag `v0.3.0-pe1`

## 8. 范围外（Out of Scope）

明示**不**在 PE1 范围内的工作，避免 scope creep：

- ❌ Logo 创意设计（设计师工作，PE1 仅提供插槽 + 临时文字 Logo）
- ❌ 自建 docs.qingclaws.* 站点（PE1 链接留空，等品牌定稿后单独 Epic）
- ❌ ARM / 麒麟兼容（PE2 范围）
- ❌ 多租户 H1/H2 加固（PE3 范围）
- ❌ LLM 内网网关 N4（PE4 范围）
- ❌ 客户业务 Skill（AE1-AE5 范围）
- ❌ 上游 QingClaws v0.3+ 版本 merge（属上游跟进策略，非 PE1）
- ❌ npm 公网发布与 organization 注册（D7：不发布公网）
- ❌ 已发布 Docker 镜像 tag 重命名（避免 ID 不可达）
- ❌ launchd helper 完整 lifecycle 重建（仅改 label，bin 替换交由 commit 3）

## 9. 后续衔接

PE1 设计文档（本文）→ 经用户复核 → 调用 `superpowers:writing-plans` 产出 `docs/superpowers/plans/2026-05-13-PE1-brand-customization.md` 实施计划 → `superpowers:subagent-driven-development` 执行 6 个 commit → PR 合入 main + tag `v0.3.0-pe1`。

PE1 完成后立即进入 PE2（ARM / 麒麟兼容），整个工程产出从那刻起天然带 QingClaws 品牌。
