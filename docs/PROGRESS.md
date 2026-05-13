# 开发进度看板（PROGRESS）

> **作用**：PE / AE Epic 的实时状态总览。每个 Epic 启动/完成时更新对应行。
> **不写实现细节** —— 细节在 `docs/plans/PE{N}-*.md` / `docs/plans/AE{N}-*.md`。
> **状态字典**：`未启动` / `开发中` / `评审中` / `已完成` / `阻塞`。

---

## 一、产品底座 Epic（PE1-PE7）

> 来源：`reDocs/v4/01-platform-requirements.md` §11
> **编号 = 执行顺序**（v4.1 调整）

| Epic | 名称 | 状态 | 分支 | Plan | PR | 关联 tag | 备注 |
|---|---|---|---|---|---|---|---|
| **PE1** | 品牌化（B1+B2+B3） | 🟡 开发中 | `feat/PE1-brand-customization` | [PE1 Plan](superpowers/plans/2026-05-13-PE1-brand-customization.md) | — | _待打 v0.3.0-pe1_ | 启动日期 2026-05-13 |
| **PE2** | ARM/麒麟兼容（H3+H4+H5） | ⚪ 未启动 | — | — | — | — | 阻塞所有部署相关验收 |
| **PE3** | 多租户加固（H1+H2+X3） | ⚪ 未启动 | — | — | — | — | 数据隔离基础 |
| **PE4** | 预定义流水线 + LLM 网关（X4+N4） | ⚪ 未启动 | — | — | — | — | 业务需求基础能力 |
| **PE5** | Skill Meta-Creator（N1） | ⚪ 未启动 | — | — | — | — | 客户高演示价值 |
| **PE6** | 多层记忆 + 业务命名空间（X1+X2） | ⚪ 未启动 | — | — | — | — | — |
| **PE7** | RAG + 语音 + 知识源（N2+N3+N5） | ⚪ 未启动 | — | — | — | — | 含 ASR 国产化适配 |

**里程碑**：PE1-PE7 全部完成 → 打 tag `v1.0.0-platform`（底座可对外发布）

---

## 二、客户业务 Epic（AE1-AE5）

> 来源：`reDocs/v4/03-implementation-mapping.md` §5.2
> **依赖**：必须在 PE1-PE7 完成后启动（个别 AE 可在对应 PE 完成后提前启动，见备注）

| Epic | 名称 | 状态 | 分支 | Plan | PR | 关联 tag | 依赖 PE | 备注 |
|---|---|---|---|---|---|---|---|---|
| **AE1** | 数据接入 skill 组（F1+F2+F3） | ⚪ 未启动 | — | — | — | — | PE3, PE4 | tongji-cloud-fetch / playwright / OCR |
| **AE2** | 数据分析 skill 组（G1+G2+G3） | ⚪ 未启动 | — | — | — | — | PE3 | 千万级账页 / 年鉴 / 图表 |
| **AE3** | 数据核验 skill 组（H1+H2+H3） | ⚪ 未启动 | — | — | — | — | PE3, PE6 | 规则引擎 / 异常识别 / 跨部门对账 |
| **AE3-P2** | 规则自学习（H4） | ⚪ 未启动 | — | — | — | — | AE3 | 二期，按客户验收节奏 |
| **AE4** | 评估 + 撰写 skill 组（I1+J1+J2） | ⚪ 未启动 | — | — | — | — | AE2, AE3 | 评估 / 监测 / 专项分析 |
| **AE5** | 知识问答 skill 组（K1） | ⚪ 未启动 | — | — | — | — | PE7 | 调查员现场问答 |

**里程碑**：AE1-AE5 全部完成 → 打 tag `v1.x.0-customer-statbureau`（客户可交付）

---

## 三、进度统计

> 每周更新一次。

| 阶段 | 总数 | 已完成 | 开发中 | 阻塞 | 完成度 |
|---|---|---|---|---|---|
| 底座（PE） | 7 | 0 | 1 | 0 | 0% |
| 客户业务（AE） | 6（含 P2） | 0 | 0 | 0 | 0% |

---

## 四、阻塞与风险登记

> 任何 `阻塞` 状态的 Epic 必须在此处登记原因 + 应对。

| Epic | 阻塞原因 | 应对 | 登记日期 | 解除日期 |
|---|---|---|---|---|
| — | — | — | — | — |

---

## 五、关联文档索引

- 需求源：`docs/superpowers/specs/01-platform-requirements.md` / `02-business-requirements.md` / `03-implementation-mapping.md`
- 项目级补充规范：`CLAUDE.local.md`
- Plan 文档目录：`docs/superpowers/plans/`
- 变更日志：`CHANGELOG.md`
