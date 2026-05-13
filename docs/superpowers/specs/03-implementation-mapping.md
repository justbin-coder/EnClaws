# 03 · 实现映射矩阵（Implementation Mapping Matrix）

**版本**：v4.0　**日期**：2026-05-12　**类型**：连接产品底座 ↔ 客户业务的桥梁文档

> **作用**：
> 1. 给出每条客户业务需求的实现路径：用哪些**底座能力** + 写哪些**定制 Skill**
> 2. 反向验证底座设计的完备性
> 3. 作为 Epic 拆分与 superpowers 开发流程的直接输入

---

## 1. 映射方法论

### 1.1 三层视图

```
客户业务需求（02 文档 §3）
        ↓ 映射
[底座能力] + [定制 Skill] + [实施复杂度]
        ↓ 聚合
Epic（应用层）
        ↓ 输入
superpowers:writing-plans → superpowers:subagent-driven-development
```

### 1.2 底座能力编号引用规则

引用 01 文档的编号体系：
- `K1`-`K14` = KEEP（EnClaws 已有直接用）
- `H1`-`H5` = HARDEN（已有需硬化）
- `X1`-`X4` = EXTEND（已有需扩展）
- `N1`-`N5` = NEW（从零写）

### 1.3 定制 Skill 命名规范

`{domain}-{action}` kebab-case，部署在 `~/.{brand}/tenants/{tid}/skills/{skillName}/`

---

## 2. 完整映射表

> 每条业务需求 → 底座能力依赖 + 定制 Skill 清单 + 复杂度 + Epic 归属

| 业务需求 | 底座能力依赖 | 定制 Skill（应用层） | 复杂度 | Epic |
|---------|------------|--------------------|--------|------|
| **F1** 统计云取数 | K7 cron + K3 skill 系统 + H2 审计（PE3） | `tongji-cloud-fetch` | 低 | AE1 |
| **F2** 网页数据抓取 | K3 skill 系统 + K8 sandbox + X4 流水线（PE4） | `playwright-runner` + `web-crawler-gov` | 中 | AE1 |
| **F3** 凭证 OCR + 对账 | K3 skill 系统 + K8 sandbox | `ocr-voucher` + `voucher-reconcile` | 中 | AE1 |
| **G1** 大规模账页存取 | K1 + K3 + K9 plugin（外接 DuckDB/Polars） | `account-page-engine`（含 DuckDB 配置） | 中 | AE2 |
| **G2** 多维汇总 + 标准化报表 | K3 + G1 输出 | `summary-aggregator` + `yearbook-generator` | 低-中 | AE2 |
| **G3** 多类型图表生成 | K3 | `chart-generator` | 低 | AE2 |
| **H1** 业务规则审核 | K3 + X4 流水线 + G1 数据源 | `rule-engine` + `rule-library`（规则配置） | 中 | AE3 |
| **H2** 个人台账与异常识别 | K3 + X1 业务记忆命名空间 + K12 LanceDB | `account-baseline` + `anomaly-detector` | 中-高 | AE3 |
| **H3** 外部部门交叉验证 | K3 + N4 内网网关（部门 API 走内网）+ H2 审计 | `external-api-bridge` + `data-reconcile` | 中 | AE3 |
| **H4** (P2) 异常规则自学习 | K3 + X1 业务记忆 + K11 RBAC（规则确认审批流） | `rule-self-learner` + `rule-approval-workflow` | 高 | AE3-P2 |
| **I1** 多维度评估 | K3 + G1/H1 数据源 + G3 图表 | `quality-assessor` + `credibility-scorer` + `structure-analyzer` | 中 | AE4 |
| **J1** 实时监测异常分析 | K3 + K7 cron + K1 Agent + K2 多 Agent 路由 | `trend-monitor` + `anomaly-report-writer` | 中 | AE4 |
| **J2** 专项分析报告 | K3 + I1/H 输出 + K1 Agent | `special-analysis-templates`（含收入/消费/补贴 3 套） | 中 | AE4 |
| **K1** 调查员现场问答 | N2 RAG pipeline + N3 ASR + N5 知识源连接器 + K1 Agent | `field-qa-persona`（业务话术配置）+ 客户知识源导入配置 | 低-中 | AE5 |

---

## 3. 定制 Skill 总清单（Layer 3 资产）

> 这一组 Skill 构成"**统计调查领域包**"，是本次客户的核心交付物。
> 复制到下个统计调查客户：直接复用；复制到其他垂域：重写这一层。

### 3.1 应用 Skill 全清单（共 19 个，P1 18 + P2 1）

| # | Skill 名称 | 职责 | 输入 | 输出 | 依赖底座 | 优先级 |
|---|---|---|---|---|---|---|
| 1 | `tongji-cloud-fetch` | 统计云 API 取数 | endpoint + 凭证 + 时间窗 | 原始数据 + 取数记录 | K7 cron | P1 |
| 2 | `playwright-runner` | 网页自动化执行器（通用） | URL + 选择器 + 登录态 | HTML/截图/文本 | K8 sandbox | P1 |
| 3 | `web-crawler-gov` | 政府政策网站定向爬虫 | 网站列表 + 抓取规则 | 结构化政策内容 | playwright-runner, K7 cron | P1 |
| 4 | `ocr-voucher` | 养殖场凭证 OCR | 凭证图片 | 结构化字段（金额/日期/单位/物品） | K3 skill, K8 sandbox | P1 |
| 5 | `voucher-reconcile` | 凭证-上报数据对账 | OCR 结果 + 上报数据 | 差异清单 | ocr-voucher | P1 |
| 6 | `account-page-engine` | 千万级账页数据处理引擎 | 账页数据 | 聚合/索引/物化视图 | K3 + 外接 DuckDB | P1 |
| 7 | `summary-aggregator` | 多维数据汇总 | 维度 + 时间 + 指标 | 汇总表 | account-page-engine | P1 |
| 8 | `yearbook-generator` | 统计年鉴生成 | 模板 + 数据 | 标准化年鉴文档 | summary-aggregator | P1 |
| 9 | `chart-generator` | 多类型图表生成 | 数据 + 图表类型 | PNG/SVG/嵌入文档 | K3 | P1 |
| 10 | `rule-engine` | 业务规则执行器 | 数据集 + 规则库 | 异常清单 + 证据 | K3 + X4 | P1 |
| 11 | `rule-library` | 业务规则配置（YAML） | — | 规则 schema | rule-engine | P1 |
| 12 | `account-baseline` | 个人收入基线建模 | 历史 12+ 个月数据 | 基线模型（per-user） | K12 LanceDB | P1 |
| 13 | `anomaly-detector` | 异常识别（基于基线） | 实时数据 + 基线 | 异常清单 | account-baseline | P1 |
| 14 | `external-api-bridge` | 外部部门 API 对接（社保/医保/惠农） | 部门 ID + 查询参数 | 部门数据 | N4 内网网关 | P1 |
| 15 | `data-reconcile` | 数据交叉对账 | 本地数据 + 外部数据 | 差异/漏记清单 | external-api-bridge | P1 |
| 16 | `quality-assessor` | 记账质量评估 | 数据集 + 指标体系 | 户/县/市评分 + 报告 | account-page-engine | P1 |
| 17 | `credibility-scorer` | 数据可信度评分 | 数据集 | 可信度评分 + 标记 | quality-assessor | P1 |
| 18 | `structure-analyzer` | 结构匹配分析 | 数据集 + 地理信息 | 结构匹配报告 | summary-aggregator | P1 |
| 19 | `trend-monitor` | 实时趋势监测 | 数据流 + 阈值 | 异常告警 | K7 cron | P1 |
| 20 | `anomaly-report-writer` | 异常分析报告撰写 | 异常 + 政策知识 | Word/PDF 报告 | N2 RAG | P1 |
| 21 | `special-analysis-templates` | 专项分析模板组（3 套） | 数据 + 专项类型 | 报告初稿 | quality-assessor, summary-aggregator | P1 |
| 22 | `field-qa-persona` | 调查员现场问答话术 | 问题 + 场景 | 答案 + 话术 + 引用 | N2 RAG + N3 ASR + K1 Agent | P1 |
| 23 | `rule-self-learner` | 异常规则自学习（P2） | 历史审核 + 新数据 | 规则草案 | X1 业务记忆 + rule-engine | **P2** |

### 3.2 配套配置资源（非 Skill，但属于交付物）

- **业务规则库**（YAML/JSON）：~50-100 条审核规则
- **报告模板库**（Word/Markdown）：年鉴/月报/专项分析等 ~10 个模板
- **价格区间库**（数据）：商品价格区间数据（由 web-crawler-gov 持续维护）
- **政策知识库**（导入 RAG）：住户调查制度、惠民补贴政策、收支编码规则、记账规范
- **Obsidian Vault**（如客户提供）

---

## 4. 底座完备性反向验证

> 检查：业务需求引用的底座能力，是否都在 01 文档中定义？是否有"映不到底座"的需求？

### 4.1 底座能力 → 被引用次数

| 底座能力 | 被业务需求引用 | 是否必须实现 |
|---|---|---|
| K1 Agent 体系 | F1/F2/F3 ... 全部 | ✅ 已有 |
| K2 多 Agent 隔离 | J1 trend monitor 独立 Agent | ✅ 已有 |
| K3 Skill 系统 | **全部 14 条业务需求** | ✅ 已有 |
| K7 Cron | F1, J1, web-crawler-gov, trend-monitor | ✅ 已有 |
| K8 Sandbox | F2, F3（playwright + OCR） | ✅ 已有 |
| K12 LanceDB | H2, K1 | ✅ 已有 |
| H1 多租户对齐 | 全部（数据隔离基础） | ⚠️ 需 PE3 完成 |
| H2 审计补全 | F1, H3 等所有写操作 | ⚠️ 需 PE3 完成 |
| H3 ARM/麒麟 | 全部（部署前提） | ⚠️ 需 PE2 完成 |
| X1 业务命名空间 | H2, H4 | ⚠️ 需 PE6 完成 |
| X4 预定义流水线 | F2, H1, 月度审核工作流 | ⚠️ 需 PE4 完成 |
| N1 Skill Meta-Creator | 自助 Skill 创建场景（5.3） | ⚠️ 需 PE5 完成 |
| N2 RAG pipeline | K1 现场问答, J1 报告 | ⚠️ 需 PE7 完成 |
| N3 ASR | K1 语音输入 | ⚠️ 需 PE7 完成 |
| N4 LLM 内网网关 | 全部（合规前提） | ⚠️ 需 PE4 完成 |
| N5 知识源连接器 | K1 知识库导入 | ⚠️ 需 PE7 完成 |

### 4.2 风险条目

| 风险 | 详情 | 应对 |
|---|---|---|
| 业务 H4（异常规则自学习）依赖 X1 业务命名空间 | P2 需求依赖 P1 底座能力 X1 | X1 必须在底座一期完成 |
| 业务 G1（千万级账页）超出 EnClaws 默认存储能力 | EnClaws 内置 SQLite，不适合千万级账页 | `account-page-engine` skill 外接 DuckDB/Polars，作为 plugin 形态接入 |
| 业务 K1 需要 ASR（N3）+ RAG（N2）+ 知识源（N5）三者协同 | 三个 NEW 项必须都完成才能交付 K1 | PE5 单 Epic 内一次性完成 |

### 4.3 底座没有但业务需要的能力（**反推到底座 NEW 列表**）

✅ 验证完成：所有业务需求引用的能力都已在 01 文档中列出，**无缺失项**。

---

## 5. Epic 拆分建议

### 5.1 底座 Epic（PE1-PE7）

> **v4.1 调整**：品牌化前置为 PE1，编号即执行顺序。原因见 01 文档 §11。

| Epic | 名称 | 内容（01 文档引用） | 估算 |
|---|---|---|---|
| **PE1** | 品牌化 | B1 + B2 + B3 | 5-10d |
| **PE2** | ARM / 麒麟兼容 | H3 + H4 + H5 + NFR-DEPLOY | 10-20d |
| **PE3** | 多租户加固 | H1 + H2 + X3 | 8-15d |
| **PE4** | 预定义流水线 + LLM 网关 | X4 + N4 | 5-10d |
| **PE5** | Skill Meta-Creator | N1 | 2-6d |
| **PE6** | 多层记忆 + 业务命名空间 | X1 + X2 | 10-20d |
| **PE7** | RAG + 语音 + 知识源 | N2 + N3 + N5 | 15-30d |

底座阶段总计：**57-115 人天（3-6 人月）**

### 5.2 应用 Epic（AE1-AE5）

| Epic | 名称 | 包含业务需求 | 定制 Skill | 估算 |
|---|---|---|---|---|
| **AE1** | 数据接入 skill 组 | F1, F2, F3 | tongji-cloud-fetch, playwright-runner, web-crawler-gov, ocr-voucher, voucher-reconcile | 8-15d |
| **AE2** | 数据分析 skill 组 | G1, G2, G3 | account-page-engine, summary-aggregator, yearbook-generator, chart-generator | 12-20d |
| **AE3** | 数据核验 skill 组 | H1, H2, H3 | rule-engine, rule-library, account-baseline, anomaly-detector, external-api-bridge, data-reconcile | 15-25d |
| **AE3-P2** | 规则自学习（二期） | H4 | rule-self-learner, rule-approval-workflow | 10-20d |
| **AE4** | 评估 + 撰写 skill 组 | I1, J1, J2 | quality-assessor, credibility-scorer, structure-analyzer, trend-monitor, anomaly-report-writer, special-analysis-templates | 12-22d |
| **AE5** | 知识问答 skill 组 | K1 | field-qa-persona + 知识源导入配置 | 3-5d |

应用阶段总计：**50-87 人天（2.5-4 人月）**

### 5.3 总工作量预估

| 阶段 | 估算 | 备注 |
|---|---|---|
| 第一阶段：产品底座 | 57-115 人天 | PE1-PE7 |
| 第二阶段：客户业务 | 50-87 人天 | AE1-AE5（不含 P2） |
| AE3-P2 二期 | 10-20 人天 | 二期增强 |
| **总计** | **117-222 人天（6-11 人月）** | 不含集成测试 + PoC |

---

## 6. 推荐实施顺序（两阶段开发）

### 第一阶段：产品底座研发（**先决条件**）

```
PE1 品牌化 (5-10d) ← 先做，后续产出天然带新品牌
        ↓
PE2 ARM/麒麟兼容 (10-20d) ← 部署前提
        ↓
PE3 多租户加固 (8-15d) ← 数据隔离基础
        ↓
PE4 预定义流水线 + LLM 网关 (5-10d) ← 业务基础能力
        ↓
PE5 Skill Meta-Creator (2-6d) ← 客户演示高价值
        ↓
PE6 多层记忆 + 命名空间 (10-20d)
        ↓
PE7 RAG + 语音 + 知识源 (15-30d)
```

**第一阶段完成后，底座产品独立可演示** —— 不依赖任何客户业务。

### 第二阶段：客户业务实施

```
AE1 数据接入 (8-15d) ← 数据先进来
        ↓
AE2 数据分析 (12-20d) ← 数据要能查
        ↓
AE3 数据核验 (15-25d) ← 核心价值
        ↓
AE4 评估+撰写 (12-22d) ← 输出价值
        ↓
AE5 知识问答 (3-5d) ← 调查员价值
        ↓
AE3-P2 规则自学习 (10-20d) ← 二期，按客户验收节奏
```

---

## 7. 衔接 Vibe Coding 开发流程

### 7.1 每个 Epic 的执行模板

```
1. 准备阶段
   · 读 01/02/03 三份需求文档对应章节
   · 读 EnClaws 调研产物（oss-adapter/20260512_EnClaws/）
   · 读 EnClaws 自身文档（EnClaws/docs/concepts/, automation/ 等）

2. Plan 阶段
   · superpowers:writing-plans（输入：本 Epic 对应的 spec 草稿）
   · 生成 implementation plan

3. Execute 阶段
   · superpowers:subagent-driven-development（执行 plan）
   · 每个 task 通过 subagent 实现 + 测试

4. Verify 阶段
   · superpowers:condition-based-waiting（异步任务等待）
   · superpowers:debugging（如有问题）

5. Sign-off
   · 在 03 文档对应行打 ✅
   · 进入下一个 Epic
```

### 7.2 跨 Epic 协作

- 底座 Epic（PE）由**产品研发团队**负责
- 应用 Epic（AE）由**实施交付团队**负责
- 复制到下个客户：**只重做应用 Epic**，底座 Epic 直接复用

---

**本文档结束**。映射矩阵 = 产品底座（01）× 客户业务（02），是 Epic Spec / Vibe Coding 的直接输入。
