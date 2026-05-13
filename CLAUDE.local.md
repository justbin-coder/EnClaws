# QingClaws Fork · 项目级补充规范

> 本文件由 `CLAUDE.md` 通过 `@CLAUDE.local.md` 引入，承载 **QingClaws fork 特有**的项目纪律。
> 与上游 `CLAUDE.md`（系统介绍）和 `AGENTS.md`（repo 规则）共存，**仅追加**，不覆盖。

---

## 1. 项目定位

- 本仓库是 **QingClaws v0.2.0 fork**（commit `0109d664`），目标是公司独立品牌的 2B 企业级 Agent 平台底座
- 首批客户：国家统计局统计调查；后续可复制到其他 2B 垂域
- 协议：Apache-2.0（上游 QingClaws by QingClaws Team）

## 2. 与上游文档的关系

| 文件 | 内容 | 修改原则 |
|---|---|---|
| `CLAUDE.md` | 上游 QingClaws 架构与 build 说明 | 可精简（删除与 AGENTS.md 重复章节） |
| `AGENTS.md` | 上游 QingClaws repo 规则 / GitHub 礼仪 | **不改** |
| `CLAUDE.local.md` | QingClaws fork 特有规则（本文件） | 可改 |

## 3. 核心准则

### 3.1 YAGNI
不引入未来才可能用到的抽象 / 配置 / 兼容层。一次只解决眼前需求。

### 3.2 不重复发明 QingClaws 已有机制
以下能力 QingClaws **已具备**，需要时**先读对应文档**，不要重写：

| 能力 | 入口 |
|---|---|
| 多 Agent 隔离 | `docs/concepts/multi-agent.md` + `qingclaws agents add` CLI |
| Cron 调度 | `src/cron/` + `docs/automation/cron-jobs.md` |
| Docker Sandbox | `docs/cli/sandbox.md` + `src/sandbox-*` |
| Skill 系统（热加载） | `src/agents/skills/refresh.ts` |
| Plugin SDK | `src/extensionAPI.ts` |
| LanceDB 向量记忆 | `extensions/memory-lancedb/` |
| Provider Failover | `docs/concepts/model-failover.md` |
| A2A 通信 | `docs/concepts/sessions.md` |
| Webhooks / Hooks | `docs/automation/webhook.md` + `docs/automation/hooks.md` |

### 3.3 改动 QingClaws 原文件打注释
任何修改上游原文件的位置，加一行：

```
// QINGCLAWS: <one-line reason>
```

纯用于代码考古，无 type 分类负担。

### 3.4 全局 CLAUDE.md 与项目规则冲突消解

当 `~/.claude/CLAUDE.md`（全局）与本文件产生冲突时，**本文件（项目级）优先**。例外：全局安全红线（SQL 注入、敏感信息泄露）永不覆盖。

## 4. PE / AE Epic 编号 + 分支命名

需求源：`docs/superpowers/specs/` 下的 V4 三份文档（01 / 02 / 03）。

- 产品底座 Epic：**PE1 - PE7**（详见 specs/01 §11、specs/03 §5.1，编号 = 执行顺序）
- 应用层 Epic：**AE1 - AE5**（详见 specs/03 §5.2）
- 分支命名：`feat/PE{N}-{kebab-name}` / `feat/AE{N}-{kebab-name}`
- Tag：`v0.2.0-fork-base` / `v1.0.0-platform` / `v1.x.0-customer-{name}`
- 合并策略：**squash-merge 到 main**

## 5. 文档落盘约定

| 类型 | 位置 | 维护时机 |
|---|---|---|
| **Specs**（需求） | `docs/superpowers/specs/` | 需求变更时 |
| **Plans**（实施计划） | `docs/superpowers/plans/YYYY-MM-DD-PE{N}-*.md` | `superpowers:writing-plans` 产出 |
| **PROGRESS**（状态看板） | `docs/PROGRESS.md` | Epic 启动 / 完成时更新对应行 |
| **CHANGELOG** | `CHANGELOG.md` | Epic 合并到 main 时追加 `[Unreleased]` 段 |

格式约定：
- CHANGELOG 遵循 [Keep a Changelog](https://keepachangelog.com/)（已在 `CHANGELOG.md` 头部声明）
- Commit message 遵循 Conventional Commits：`feat(PE1): ...` / `fix(PE2): ...` / `docs(PE1): ...`

## 6. Apache-2.0 合规

- 不修改 `LICENSE` / `NOTICE` / `TRADEMARKS.md` 中关于 QingClaws 上游归属的内容
- 新增第三方依赖：登记到 `THIRD_PARTY_NOTICES.md`
- 上游 security advisory：ad-hoc 评估（不立硬流程，按需处理）

## 7. Git 操作授权策略

> 本项目（QingClaws fork）放宽全局 `~/.claude/CLAUDE.md` 中的"提交前必须确认"规则，按下表执行。

| 自主执行（无需事先确认） | 必须用户授权 |
|---|---|
| `git add` + `git commit`（完成一个逻辑工作单元时） | `git push`（对外可见） |
| 本地新建分支（`git checkout -b ...`） | `git tag`（里程碑标识） |
| commit message 用 Conventional Commits（`feat(PE1): ...`） | 合并到 main（`merge` / `squash-merge`） |
| 修复 commit 错误（用 `git commit --amend` 仅在未 push 前） | `git reset --hard` / `branch -D` 等破坏性 |

**永远禁止**（不论自主还是授权）：
- `--no-verify` 跳过 git hook
- 修改 git config / 跳过 GPG 签名
- force-push 到 main / master

## 8. 红线（绝对禁止）

- ❌ SQL 字符串拼接（必须参数化查询）
- ❌ 日志 / 注释 / 代码中出现客户敏感信息（凭证 / 内网 IP / 人员姓名）
- ❌ 重复发明 QingClaws 已有机制（见 §3.2）
- ❌ 改动 LICENSE / NOTICE / TRADEMARKS.md 中 QingClaws 上游归属内容（见 §6）
