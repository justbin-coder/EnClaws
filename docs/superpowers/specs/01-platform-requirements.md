# 01 · 产品底座需求文档（Platform Requirements）

**版本**：v4.0　**日期**：2026-05-12　**类型**：产品研发需求　**第一阶段（基础阶段）**

> **目标产品**：基于 EnClaws v0.2.0 fork 改造的、公司独立品牌的**企业级 Agent 平台底座**。
> 复用：所有 2B 垂域客户（统计调查只是首个垂域）。

---

## 1. 产品定位与策略

### 1.1 定位

| 项 | 内容 |
|---|---|
| 产品形态 | 公司独立品牌的企业级 Agent 平台 |
| 技术基础 | **EnClaws v0.2.0** (commit `0109d664`, fork → 自维护) |
| OSS 协议 | Apache-2.0（保留 LICENSE / NOTICE / THIRD_PARTY_NOTICES） |
| 上游品牌 | EnClaws by hashSTACS-Global（社区版）→ 我方 fork 后做品牌化 |
| 部署形态 | 客户内网 / 信创环境 / 服务器端 |
| 客户端形态 | Web 浏览器 + 桌面 App（待选 Tauri/Electron） |

### 1.2 长期资产视图

```
Layer 3: 客户领域包（Skill 组）        ← 每客户独立交付
Layer 2: 行业 IP（业务记忆/规则演进）   ← 我方核心 IP
Layer 1: 产品底座（本文档范围）         ← 一次研发，多次复用
Layer 0: EnClaws 上游 fork              ← 跟进上游 + 安全 patch
```

### 1.3 OSS 协议合规

- 保留 `LICENSE`（Apache-2.0）、`NOTICE`、`THIRD_PARTY_NOTICES.md`
- README 标注"基于 EnClaws 改造"（SaaS 形态下不强制，私有化部署必须）
- 不混用商业不兼容 license 的依赖
- 上游修复关键安全 patch 必须回流到 fork

---

## 2. EnClaws 能力继承清单（KEEP — 直接复用，不动）

> 这些是 EnClaws 已实现且满足企业需求的能力。研发**不需要重写**，但需要做品牌化和文档化。

| ID | 能力 | EnClaws 源码/文档证据 |
|----|------|---------------------|
| **K1** | Agent 体系（AGENTS.md/SOUL.md/USER.md + ReAct loop） | `docs/concepts/agent.md`, `agent-loop.md`, `agent-workspace.md` |
| **K2** | **多 Agent 原生隔离**（每 Agent 独立 workspace / agentDir / sessions） | `docs/concepts/multi-agent.md` + `openclaw agents add` CLI |
| **K3** | Skill 系统（per-agent + shared 双层；chokidar 热加载；snapshot） | `src/agents/skills/refresh.ts:62,176,210` |
| **K4** | A2A 通信（sessions_send-tool 工具） | `docs/concepts/sessions.md` + `src/agents/sessions_send-tool*` |
| **K5** | Multi-Channel AI Gateway（WhatsApp/Discord/iMessage/Web 等） | `src/channels/`, `src/gateway/` |
| **K6** | ACP（Assistant Control Plane）并发执行 | `docs/cli/acp.md`, `src/acp/` |
| **K7** | **Cron 调度器**（Gateway 级，持久化 + isolated agent 模式 + webhook 投递） | `src/cron/` (50+ 测试) + `docs/automation/cron-jobs.md` |
| **K8** | **Docker Sandbox**（Agent 隔离执行） | `docs/cli/sandbox.md`, `src/sandbox-*` |
| **K9** | Plugin / Extension SDK（extensions/{name}/） | `src/extensionAPI.ts` |
| **K10** | Provider Failover（多 LLM provider 自动降级） | `docs/concepts/model-failover.md`, `model-providers.md` |
| **K11** | RBAC + JWT 基础（API 鉴权） | `src/auth/` |
| **K12** | LanceDB 向量记忆（plugin 形态） | `extensions/memory-lancedb/index.ts:541,569` |
| **K13** | Linux 部署支持（基础） + Raspberry Pi 文档（ARM 起点） | `docs/platforms/linux.md`, `raspberry-pi.md` |
| **K14** | Webhooks / Hooks 自动化机制 | `docs/automation/webhook.md`, `hooks.md` |

---

## 3. 加固项（HARDEN — 已有但需硬化）

> EnClaws 有，但不满足企业生产标准 / 客户合规要求。

### H1. 多租户数据模型对齐
**问题**：DB 表实际命名 `users` / `audit_logs`，文档声称是 `tenant_users` / `tenant_audit_logs`（调研发现）。
**改造**：统一命名 + 添加 tenant_id 显式列 + migration 脚本 + 回滚方案。
**验收**：所有租户相关表带 tenant_id；跨租户查询零泄漏；migration 单元测试覆盖。

### H2. 审计日志覆盖度补全
**问题**：EnClaws 基础审计存在，但 Skill 增删改 / 数据访问 / 规则变更 / 角色变更等关键操作未必全覆盖。
**改造**：审计事件枚举 + 全链路埋点 + 不可篡改的 append-only 存储 + 查询 API。
**验收**：审计事件清单经合规评审通过；关键操作 100% 覆盖；日志可导出。

### H3. ARM aarch64 多架构构建 + 麒麟 V10 兼容
**问题**：EnClaws 有 Linux/Raspberry Pi 文档但未确认麒麟 V10 ARM aarch64 完整兼容。
**改造**：buildx 多架构 Docker 镜像；麒麟 V10 ARM 实机 PoC；依赖库（如 onnxruntime、node-canvas）国产替代或重新构建。
**验收**：在客户飞腾 D2000/8 麒麟 V10 工作站上完整启动 + 跑通核心流程。

### H4. 离线安装包
**问题**：EnClaws 默认在线安装（npm/Docker pull），客户内网无外网。
**改造**：完整离线安装包（包含全部依赖 + 模型 + Docker images）+ npm/pip 私服方案 + 安装脚本。
**验收**：纯离线环境完成全栈部署。

### H5. Docker Sandbox 在麒麟环境的兼容性
**问题**：K8 Docker Sandbox 是 amd64 优先，麒麟 V10 ARM 上需确认行为。
**改造**：sandbox 镜像 ARM 适配 + 资源配额配置 + 测试套件。
**验收**：在麒麟环境创建/销毁 sandbox 100% 通过。

---

## 4. 扩展项（EXTEND — 已有但能力不足）

### X1. Agent 多层记忆体系
**基础**：EnClaws 有 LanceDB 向量记忆（K12），但缺乏分层结构。
**扩展**：三层记忆 — 短期（会话级）/ 长期（跨会话事实偏好）/ 业务沉淀（跨 Agent 共享，用于规则/经验累积）。
**约束**：保留 EnClaws 原 plugin 形态，作为现有 memory-lancedb 的能力扩展。
**验收**：三层记忆 API 分明；可独立检索；业务沉淀层支持显式 promotion。

### X2. 向量记忆业务命名空间隔离
**基础**：LanceDB plugin 默认 workspace 级隔离。
**扩展**：增加业务命名空间（如"统计调查规则"/"政策知识"等），同 tenant 内多 namespace 共存。
**约束**：与多租户隔离（H1）正交。
**验收**：跨 namespace 检索可控；可显式列出 tenant 内所有 namespace。

### X3. 多角色细化（4 角色：调查员/审核员/分析师/管理员）
**基础**：K11 有基础 RBAC + JWT。
**扩展**：4 角色 + 细粒度权限矩阵（Skill 调用、数据查询、规则变更、用户管理）。
**约束**：可扩展为 N 角色（不绑死统计调查）。
**验收**：4 角色登录后看到/可操作的功能区分明确。

### X4. 预定义流水线模板（基于现有 cron + A2A）
**基础**：K7 cron 可定时触发 Agent；K4 A2A 可 Agent 间消息。
**问题**：A2A 是按需对话式（LLM 自主判断要不要继续），缺**预定义固定步骤流水线**（企业生产需求）。
**扩展**：流水线 skill 模板（一种特殊 skill 类型，内含固定步骤定义 + 失败重试 + 中间产物保留），由 cron 或事件触发。
**实现方式**：作为 L1-Skill 扩展（一个新 skill 类型），不改 EnClaws core。
**验收**：可定义"取数→分析→核验→撰写→预警"5 步流水线；每步可观测；失败重试可配置；中间产物可查。

---

## 5. 新建项（NEW — EnClaws 完全没有，需从零写）

### N1. Skill Meta-Creator ⭐ 核心产品差异化
**目标**：用户用自然语言描述目标 → meta-agent 多轮交互式提问澄清 → 自动生成新 Skill（含 Python 脚本/SKILL.md/配套配置）→ 注册到工坊。
**实现层级**：L1-Skill（基于 EnClaws Skill 系统的特殊 skill），零侵入 core。
**关键约束**：
- 生成的代码必须经过沙箱化（复用 K8 Docker Sandbox + H5）
- 创建过程必须审计（联动 H2）
- 单 tenant 内 skill 配额限制（防滥用）
**验收**：用户描述 → 多轮对话 → 产出可执行 skill → 工坊出现 → 立即可被其他 Agent 调用。
**工作量预估**：2-6 人天（基础版）

### N2. RAG Pipeline 工程化
**目标**：完整 RAG 链路 — 文档解析（PDF/Word/Markdown/Obsidian）→ 切分 → 向量化 → 索引（用 K12 LanceDB）→ 检索 → LLM 答复 + **引用展示**。
**问题**：EnClaws 有向量库（K12）但没有完整 RAG 流程框架，缺：文档解析、切分策略、检索后处理、引用 metadata 维护。
**实现层级**：L2-Plugin（扩展现有 memory-lancedb 或新建 plugin）。
**验收**：知识入库 5min 内可被检索；问答附带引用源；语义检索 + BM25 混合策略。

### N3. ASR 语音输入（ARM 兼容）
**目标**：调查员现场可用语音提问。
**约束**：必须 ARM 兼容；优先国产方案（paddleocr、funASR 等）；离线运行。
**实现层级**：L2-Plugin（独立服务，HTTP 调用）。
**验收**：在麒麟桌面 V10 ARM 上完整运行；端到端识别延迟 ≤ 1.5s；中文识别率 ≥ 95%。

### N4. LLM 内网网关强制路由
**目标**：所有 LLM 推理走客户内网网关 / 服务；运行时拒绝外网 LLM endpoint；管理员可显式授权外网。
**问题**：EnClaws 有 provider 抽象，但默认允许任意 endpoint。
**实现层级**：L3-Patch（配置中心 + 启动期校验 + 运行时拦截）。
**验收**：配置错误的外网 endpoint 启动失败；运行时网络隔离测试通过；管理员授权流程可审计。

### N5. 知识源连接器
**目标**：把外部知识源（Obsidian Vault、本地文件夹、Web 抓取内容）批量导入到 RAG（联动 N2）。
**实现层级**：L2-Plugin。
**验收**：导入器可视化 UI；增量同步；冲突处理（重复入库去重）。

---

## 6. 品牌化项（BRAND）

### B1. 视觉品牌化
- 产品名（待定，e.g. "ClawsHub" / "AgentCore" / 客户共创）
- Logo / 主色 / UI 视觉系统
- 默认 banner / 文档配图

### B2. 包名 / 路径 / API 命名
- npm 包名（`enclaws` → 自有命名空间下）
- 默认配置路径（`~/.openclaw/` → `~/.{brand}/`）
- CLI 命令（`openclaw` → `{brand}` 命令）
- API endpoint 命名（去除 openclaw 痕迹）

### B3. 默认模板品牌化
- 默认 Agent persona / SOUL.md 模板
- 默认 Skill 示例（脱去统计调查色彩，做通用模板）
- 默认 prompt（中文 + 企业语境）
- 文档 / changelog / contributing 改写

---

## 7. 非功能需求（NFR）

> 底座层面的横切关注点。具体业务 NFR 见客户业务需求文档。

| 类别 | ID | 需求 | 验收 |
|---|---|---|---|
| **性能** | NFR-PERF-01 | 单 Agent 启动 ≤ 5s | 实测 |
| | NFR-PERF-02 | Skill 热加载 ≤ 5s 可见 | E2E |
| | NFR-PERF-03 | 单消息端到端响应 ≤ 3s（不含 LLM 推理） | UI P95 |
| **可用性** | NFR-AVAIL-01 | 服务可用性 ≥ 99% | 上线 30 天 |
| | NFR-AVAIL-02 | 单 Agent 失败不影响其他 Agent | 故障演练 |
| | NFR-AVAIL-03 | Cron 任务持久化（重启不丢） | 重启测试（K7 已支持） |
| **安全** | NFR-SEC-01 | 多租户零数据泄漏 | 安全测试 |
| | NFR-SEC-02 | 审计日志不可篡改 | 安全测试 |
| | NFR-SEC-03 | Skill 默认沙箱化（基于 K8） | 安全测试 |
| | NFR-SEC-04 | 敏感字段加密/脱敏 | 安全测试 |
| | NFR-SEC-05 | LLM 走内网网关强制（N4） | 网络审计 |
| **部署** | NFR-DEPLOY-01 | 服务器端在麒麟 V10 ARM aarch64 完整运行 | PoC（依赖 H3） |
| | NFR-DEPLOY-02 | 客户端在麒麟桌面 V10 SP1 ARM 运行 | PoC |
| | NFR-DEPLOY-03 | 完整离线安装包（H4） | 测试 |
| | NFR-DEPLOY-04 | 升级回滚机制 | 测试 |
| **易用性** | NFR-UX-01 | 非技术用户 30min 内会用基本功能 | 用户测试 |
| | NFR-UX-02 | 错误信息中文友好 | UI 审查 |
| | NFR-UX-03 | 全中文界面 + 中文输入输出 | UI 审查 |
| **可观测** | NFR-OBS-01 | Agent / Skill / Cron 任务全链路日志 | 运维评审 |
| | NFR-OBS-02 | 多租户资源使用统计（token / 调度次数等） | 接入 K6 ACP |

---

## 8. 客户运行环境约束（必读）

| 约束 | 内容 | 影响 |
|---|---|---|
| C-ARCH-1 | 必须支持 ARM aarch64（鲲鹏 Kirin 9000C / 飞腾 D2000） | H3 + H5 + N3 |
| C-ARCH-2 | 终端 RAM 仅 8GB | 终端只能跑 UI |
| C-OS-1 | 银河麒麟 V10（桌面 SP1 + 服务器 juniper） | H3 兼容性 |
| C-NET-1 | 客户内网 / 离线 | H4 离线安装 + N4 内网网关 |
| C-LLM-1 | LLM 部署位置待客户确认（详见客户业务需求文档 §6 Q3） | N4 影响 |
| C-COMP-1 | 国家统计局专用版合规 | H1 + H2 + NFR-SEC 全部 |

---

## 9. OSS 上游跟进策略

| 策略 | 内容 |
|---|---|
| Fork 维护 | 独立 fork 仓库（自己命名空间）+ 锁定 v0.2.0 |
| 安全 patch | 上游 security advisory 24h 内评估，必要立即回流 fork |
| 版本升级 | 上游 minor 版本评估一次；major 版本（v1.x）专项评估窗口 |
| 改动管理 | 我方改动用 `// QINGCLAWS-CUSTOM: <type> <reason>` 注释标记，type ∈ {brand, harden, ext, new, bridge, pushable, customer}；改动点同步登记到 `docs/upstream-divergence.md` |
| 上游回馈 | 通用价值改动（如 ARM 多架构）评估上游 PR 回馈（增加社区影响力） |

---

## 10. 工作量预估（粗略）

| 类别 | 项数 | 估算 |
|---|---|---|
| KEEP | 14 | 0 人天（直接用） |
| HARDEN | 5 | 12-25 人天 |
| EXTEND | 4 | 15-30 人天 |
| NEW | 5 | 25-50 人天 |
| BRAND | 3 | 5-10 人天 |
| **底座总计** | 31 项 | **57-115 人天 ≈ 3-6 人月** |

> 注：不含客户业务层（见 02 客户业务需求文档），不含集成测试。

---

## 11. Epic 拆分建议（详见 03 实现映射矩阵）

> **编号 = 执行顺序**（v4.1 调整：品牌化前置）。理由：先做品牌化，后续所有 Epic 的产出（CLI 提示 / log / 文档 / 默认模板）天然带新品牌，避免回头改。

| Epic | 名称 | 包含 | 估算 |
|---|---|---|---|
| **PE1** | 品牌化 | B1 + B2 + B3 | 5-10d |
| **PE2** | ARM/麒麟兼容 | H3 + H4 + H5 + NFR-DEPLOY-01/02/03 | 10-20d |
| **PE3** | 多租户加固 | H1 + H2 + X3 | 8-15d |
| **PE4** | 预定义流水线 + LLM 网关 | X4 + N4 | 5-10d |
| **PE5** | Skill Meta-Creator | N1 | 2-6d |
| **PE6** | 多层记忆 + 业务命名空间 | X1 + X2 | 10-20d |
| **PE7** | RAG + 语音 + 知识源 | N2 + N3 + N5 | 15-30d |

> Epic 实施顺序：**PE1 → PE2 → PE3 → PE4 → PE5 → PE6 → PE7**（编号即顺序）

---

**本文档结束**。配套阅读：[02 客户业务需求](02-business-requirements.md) + [03 实现映射矩阵](03-implementation-mapping.md)。
