# 灵魂星图 — Phase 2 增长引擎开发方案

> **阶段定位**：MVP 验证通过后的增长期（第 3-4 周）
> **核心目标**：提升付费转化率 + 社交裂变系数 + 用户留存
> **前置条件**：Phase 1 已上线，基础数据验证达标（完成率>70%，分享率>20%）

---

## 目录

1. [模块一：分享裂变机制](#模块一分享裂变机制)
2. [模块二：好友对比/契合度功能](#模块二好友对比契合度功能)
3. [模块三：限时优惠 + 支付挽回](#模块三限时优惠--支付挽回)
4. [模块四：数据埋点 + 转化漏斗分析](#模块四数据埋点--转化漏斗分析)
5. [模块五：A/B 测试框架](#模块五ab-测试框架)
6. [模块六：完整版 60 题测试上线](#模块六完整版-60-题测试上线)
7. [小程序审核 + H5部署方案](#小程序审核--h5-部署方案)
8. [开发排期与优先级](#开发排期与优先级)
9. [关键指标与验收标准](#关键指标与验收标准)

---

## 模块一：分享裂变机制

### 1.1 功能概述

通过"邀请好友完成测试→解锁付费内容"的机制，将社交传播转化为免费获客和付费转化双引擎。

### 1.2 裂变规则设计

| 行为 | 奖励 | 限制 |
|------|------|------|
| 邀请 1 人完成测试 | 解锁"社交风格"维度解析 | 每日邀请上限 10 人 |
| 邀请 3 人完成测试 | 解锁完整免费报告（等同 ¥9.9） | 每月上限 3 次 |
| 邀请 5 人完成测试 | 获得 1 次"灵魂契合度"对比机会 | 单次活动周期内 |
| 被邀请者完成测试 | 双方各获 1 枚"星辰碎片"（积分） | — |

### 1.3 技术实现方案

**核心链路：**
```
用户A分享 → 携带邀请码(inviteCode) → 好友B点击 →
B完成测试 → 云函数验证 → A的邀请计数+1 → 触发奖励判定 → 解锁对应内容
```

**需要开发的文件：**

| 文件 | 功能 |
|------|------|
| `src/composables/useInvite.ts` | 邀请逻辑（生成码、查询进度、领取奖励） |
| `src/pagesUser/invite/index.vue` | 邀请进度页（显示已邀请人数、奖励状态） |
| `cloudfunctions/invite/index.js` | 邀请云函数（记录关系、验证完成、发放奖励） |
| `src/components/shared/InviteBanner.vue` | 邀请引导横幅（嵌入结果页） |

**数据库集合（新增）：**
```javascript
// invitations 集合
{
  _id: ObjectId,
  inviterOpenid: String,     // 邀请者
  inviteeOpenid: String,     // 被邀请者
  inviteCode: String,        // 邀请码
  inviteeCompleted: Boolean, // 被邀请者是否完成测试
  rewardClaimed: Boolean,    // 奖励是否已领取
  createdAt: Date
}
```

**邀请码方案：**
- 小程序：通过页面路径参数 `?inviteCode=abc123`
- H5：通过 URL 参数 `https://your-domain.com/#/?invite=abc123`
- 邀请码 = 用户 openid 的短哈希（6位），保证唯一

### 1.4 UI 交互流程

```
[结果页底部]
┌──────────────────────────────────┐
│ 🎁 邀请好友，免费解锁深度解读      │
│                                    │
│ 已邀请 1/3 人  ●●○                 │
│ 再邀请 2 位好友即可免费解锁         │
│                                    │
│ [立即邀请好友] ← 金色按钮           │
└──────────────────────────────────┘
```

---

## 模块二：好友对比/契合度功能

### 2.1 功能概述

让两位用户对比彼此的性格测试结果，生成"灵魂契合度报告"——这是最强的社交裂变点，也是付费转化的高价值产品（¥19.9/对）。

### 2.2 产品逻辑

**免费内容（触发分享）：**
- 双方类型匹配结果（如"你们是天作之合 / 欢喜冤家 / 灵魂知己"）
- 契合度百分比（0-100%）
- 一句话关系概述

**付费内容（¥19.9）：**
- 详细维度对比分析
- 相处建议
- 潜在冲突与解决方式
- 共同成长路径

### 2.3 技术实现方案

**核心链路：**
```
用户A完成测试 → 选择"对比好友" → 生成对比邀请链接 →
好友B点击 → B完成测试(或已完成) → 匹配双方结果 →
展示免费契合度概览 → 付费解锁详细报告
```

**需要开发的文件：**

| 文件 | 功能 |
|------|------|
| `src/pagesReport/compare/index.vue` | 对比结果页（已有占位，需实现） |
| `src/composables/useCompare.ts` | 对比逻辑（计算契合度、生成报告） |
| `src/utils/compatibility.ts` | 契合度算法（基于维度距离+类型匹配表） |
| `src/data/results/compatibility-reports.ts` | 各类型组合的对比报告模板 |
| `cloudfunctions/compare/index.js` | 对比云函数（创建配对、查询结果） |

**契合度算法设计：**
```typescript
// src/utils/compatibility.ts
export function calculateCompatibility(typeA: string, typeB: string): CompatibilityResult {
  // 1. 基础分 = 维度距离计算（共同维度越多分越高）
  // 2. 加成分 = 互补维度加分（如 E+I、T+F 互补加分）
  // 3. 修正分 = 类型匹配表（compatibleTypes/conflictTypes）
  // 最终分数映射到 0-100%
  // 关系标签：>80% 天作之合 / 60-80% 灵魂知己 / 40-60% 欢喜冤家 / <40% 平行宇宙
}
```

**数据库集合（新增）：**
```javascript
// comparisons 集合
{
  _id: ObjectId,
  userA: { openid, resultType, scores },
  userB: { openid, resultType, scores },
  compatibility: Number,        // 0-100
  relationLabel: String,        // 关系标签
  isPaid: Boolean,
  compareCode: String,          // 对比短码
  createdAt: Date
}
```

### 2.4 对比报告内容结构

```typescript
export interface CompatibilityReport {
  pairKey: string              // 如 "INTJ_ENFP"
  overallScore: number         // 0-100
  relationLabel: string        // "天作之合" 等
  summary: string              // 一句话概述
  dimensionComparison: {       // 四维度详细对比
    EI: { description: string, harmony: number }
    SN: { description: string, harmony: number }
    TF: { description: string, harmony: number }
    JP: { description: string, harmony: number }
  }
  strengths: string[]          // 关系优势
  challenges: string[]         // 潜在挑战
  growthAdvice: string         // 共同成长建议
}
```

> **内容生产提示**：16×16 = 256 种组合，但对称（A对B = B对A），实际 136 种。
> 建议先覆盖高频组合（INFJ-ENFP、INTJ-ENTP 等热门CP），用大模型批量生成。

---

## 模块三：限时优惠 + 支付挽回

### 3.1 限时优惠机制

**触发时机与规则：**

| 场景 | 优惠内容 | 有效期 | 实现方式 |
|------|---------|--------|---------|
| 测试完成后首次查看报告 | ¥9.9→¥6.9（首单7折） | 30分钟 | 客户端倒计时 |
| 24小时后未付费 | 推送模板消息"报告即将过期" | 再延24小时 | 云函数定时触发 |
| 48小时后仍未付费 | 最终特惠 ¥5.9 | 最后12小时 | 模板消息+页面弹窗 |
| 好友已解锁同类报告 | "你的好友已解锁，你也来看看" | 不限时 | 社交推送 |

### 3.2 支付挽回（模板消息）

**微信模板消息方案：**

```javascript
// 消息类型 1：报告保存提醒
{
  template_id: "xxx",
  data: {
    thing1: { value: "你的灵魂星灵解读报告" },
    time2: { value: "24小时后过期" },
    thing3: { value: "点击查看限时特惠 ¥6.9" }
  },
  page: "/pagesTest/result/index?showOffer=true"
}

// 消息类型 2：好友动态提醒
{
  template_id: "yyy",
  data: {
    thing1: { value: "你的好友刚刚完成了灵魂测试" },
    thing3: { value: "来看看你们的灵魂契合度" }
  },
  page: "/pagesReport/compare/index?code=xxx"
}
```

**技术实现：**

| 文件 | 功能 |
|------|------|
| `src/composables/useCountdown.ts` | 限时优惠倒计时逻辑 |
| `src/components/payment/TimedOffer.vue` | 限时优惠组件（倒计时+价格动态切换） |
| `cloudfunctions/sendMessage/index.js` | 模板消息发送云函数 |
| `cloudfunctions/timedTask/index.js` | 定时任务（24h/48h检查未付费用户） |

### 3.3 触发用户订阅消息权限

```
[测试完成时弹窗]
┌──────────────────────────────┐
│ 是否允许接收测试结果通知？     │
│                                │
│ 开启后我们会在以下情况通知你：  │
│ · 报告即将过期时提醒你保存     │
│ · 好友完成测试时通知你对比     │
│                                │
│ [允许]          [暂不]         │
└──────────────────────────────┘
```

> 小程序订阅消息需要用户主动授权，建议在**测试完成的高情绪点**弹出授权请求。

---

## 模块四：数据埋点 + 转化漏斗分析

### 4.1 关键埋点事件

| 事件名 | 触发时机 | 关键参数 |
|--------|---------|---------|
| `app_launch` | 应用打开 | source(来源)、inviteCode |
| `test_start` | 点击开始测试 | testMode、guide |
| `question_answer` | 每答一题 | questionId、optionIndex、duration |
| `chapter_complete` | 完成一个章节 | chapterId、timeSpent |
| `test_complete` | 完成全部测试 | resultType、totalTime |
| `result_view` | 查看结果页 | resultType |
| `paywall_view` | 看到付费墙 | resultType、offerPrice |
| `pay_click` | 点击付费按钮 | productType、price |
| `pay_success` | 支付成功 | orderId、amount |
| `pay_fail` | 支付失败 | errorCode |
| `share_click` | 点击分享 | shareType(poster/friend/moments) |
| `share_success` | 分享成功 | shareType |
| `invite_send` | 发出邀请 | inviteCode |
| `invite_complete` | 被邀请者完成 | inviterCode |
| `compare_start` | 开始对比 | — |
| `compare_pay` | 对比报告付费 | amount |

### 4.2 转化漏斗定义

**核心漏斗（每日监控）：**
```
访问首页 → 开始测试 → 完成测试 → 查看付费墙 → 点击付费 → 支付成功
  100%       85%        70%         65%          15%        8%
```

**分享漏斗：**
```
完成测试 → 点击分享 → 实际分享成功 → 好友点击 → 好友完成测试
  100%       40%          30%          50%         70%
```

### 4.3 技术实现

**增强已有的 `src/utils/analytics.ts`：**

```typescript
// 新增功能
export interface TrackEvent {
  event: string
  params?: Record<string, any>
  timestamp: number
  sessionId: string
  userId: string
  page: string
}

// 本地批量缓存 + 定时上报（降低云函数调用次数）
export function initAnalytics(): void
export function track(event: string, params?: Record<string, any>): void
export function flush(): void  // 强制上报当前缓存
export function getSessionEvents(): TrackEvent[]  // 获取当前会话事件
```

**数据存储方案：**
- **小程序端**：微信自带数据分析（免费，自动采集页面访问）
- **自建补充**：云数据库 `events` 集合（关键业务事件），设置 30 天 TTL 控制存储成本
- **看板工具**：初期用微信小程序后台"数据分析"，中期可对接腾讯云图等可视化工具

### 4.4 简易数据看板

开发一个管理员查看的页面（可选，也可用云开发控制台直接查 MongoDB）：

| 指标 | 计算方式 | 更新频率 |
|------|---------|---------|
| DAU | 当日独立 openid 数 | 实时 |
| 测试完成率 | test_complete / test_start | 每小时 |
| 付费转化率 | pay_success / paywall_view | 每小时 |
| ARPU | 总收入 / DAU | 每日 |
| K值 | invite_complete / test_complete | 每日 |
| 分享率 | share_success / test_complete | 每日 |

---

## 模块五：A/B 测试框架

### 5.1 需要 A/B 测试的变量

| 变量 | A组（对照） | B组（实验） | 影响指标 |
|------|-----------|-----------|---------|
| 报告定价 | ¥9.9 | ¥6.9 | 付费转化率×ARPU |
| 限时优惠时长 | 30分钟 | 24小时 | 付费转化率 |
| 付费墙文案 | "解锁完整解读" | "你的星灵想告诉你..." | 点击率 |
| 结果页分享引导 | 底部按钮 | 全屏弹窗(延迟3s) | 分享率 |
| 免费内容量 | 3个标签+概述 | 2个维度详细分析 | 付费转化率 |
| 裂变门槛 | 邀请3人解锁 | 邀请1人解锁 | K值×留存 |

### 5.2 技术实现方案

**轻量级 A/B 框架（客户端分流）：**

```typescript
// src/composables/useABTest.ts

export interface ABExperiment {
  id: string
  name: string
  variants: string[]   // ['A', 'B'] 或 ['A', 'B', 'C']
  weights?: number[]   // 流量分配权重，默认均分
}

export function useABTest() {
  // 基于 openid 哈希分组（确保同一用户始终看到同一版本）
  function getVariant(experimentId: string): string
  
  // 记录曝光
  function trackExposure(experimentId: string, variant: string): void
  
  // 记录转化
  function trackConversion(experimentId: string, metric: string): void
  
  return { getVariant, trackExposure, trackConversion }
}
```

**分流逻辑：**
```typescript
// 基于用户ID的确定性分流（不依赖服务端）
function hashToGroup(userId: string, experimentId: string, groupCount: number): number {
  const hash = simpleHash(userId + experimentId)
  return hash % groupCount
}
```

**实验配置文件（可通过云存储热更新）：**
```typescript
// src/config/experiments.ts
export const activeExperiments: ABExperiment[] = [
  {
    id: 'price_test_v1',
    name: '报告定价测试',
    variants: ['9.9', '6.9'],
    weights: [50, 50]
  },
  {
    id: 'paywall_copy_v1',
    name: '付费墙文案测试',
    variants: ['default', 'emotional'],
    weights: [50, 50]
  }
]
```

**结果分析**：云函数 `getABReport` 从 events 集合聚合计算各组转化率，需跑满 **7 天 + 每组 500+ 样本** 后再做决策。

---

## 模块六：完整版 60 题测试上线

### 6.1 概述

在 25 题快速版验证通过后，上线 60 题完整版作为"专业深度版"，既能提升结果准确度，也是引导用户升级 VIP 的理由。

### 6.2 题目扩展方案

**从 25 题扩展到 60 题的策略：**

| 维度 | 25题版(每维度) | 60题版(每维度) | 新增题数 |
|------|--------------|--------------|---------|
| EI (外向/内向) | 7题 | 15题 | +8题 |
| SN (实感/直觉) | 6题 | 15题 | +9题 |
| TF (思考/情感) | 6题 | 15题 | +9题 |
| JP (判断/知觉) | 6题 | 15题 | +9题 |
| **合计** | 25题 | 60题 | +35题 |

**章节结构（10 章）：**

| 章节 | 主题 | 题数 | 场景 |
|------|------|------|------|
| 1. 觉醒 | 初识自我 | 6题 | 迷雾中苏醒（复用25题版） |
| 2. 探索 | 面对世界 | 6题 | 奇幻世界（复用25题版） |
| 3. 抉择 | 价值冲突 | 6题 | 两难困境（复用25题版） |
| 4. 蜕变 | 压力应对 | 6题 | 危机挑战（复用25题版） |
| 5. 归宿 | 生活方式 | 6题 | 理想世界（复用25题版+1题） |
| 6. 暗流 | 深层恐惧 | 6题 | 面对内心阴影 |
| 7. 连接 | 人际关系 | 6题 | 各种关系场景 |
| 8. 追寻 | 人生意义 | 6题 | 终极目标追问 |
| 9. 极境 | 极端情境 | 6题 | 高压决策场景 |
| 10. 星归 | 最终答案 | 6题 | 收束与终章 |

### 6.3 需要开发的文件

| 文件 | 功能 |
|------|------|
| `src/data/questions/soulmap-full.ts` | 60题完整版题库 |
| `src/pagesTest/intro/index.vue` (修改) | 新增"选择测试版本"入口 |
| `src/composables/useTestEngine.ts` (修改) | 支持加载不同版本题库 |

### 6.4 完整版题目生成提示词

```
你是一位融合荣格心理学和文学创作的性格测试题目设计师。
我正在为"灵魂星图"应用扩展题库，需要为完整版新增 35 道沉浸式剧情题目。

# 已有信息
- 25题快速版已有（第1-5章，每章5题），现在需要新增第6-10章，每章6题 + 第5章追加1题
- 四个维度：EI(外向/内向)、SN(实感/直觉)、TF(思考/情感)、JP(判断/知觉)
- 计分：每个选项对4个维度打 -2 到 +2 的分

# 新增章节要求

## 第六章：暗流（深层恐惧与阴影面）— 主测 TF + EI
场景设定：你进入自己的内心深处，面对那些平时不愿正视的部分。
- 6道题，每题一个触及内心恐惧或弱点的场景
- 选项揭示面对恐惧时的不同应对模式

## 第七章：连接（人际关系模式）— 主测 EI + TF
场景设定：你回到人群中，在各种关系场景中做出选择。
- 6道题，涵盖友情、亲情、团队、陌生人等不同关系
- 选项体现不同的人际互动风格

## 第八章：追寻（人生意义与目标）— 主测 SN + JP
场景设定：你站在生命的十字路口，追问"什么对我最重要"。
- 6道题，涉及事业、价值观、遗产、影响力等话题
- 选项反映不同的人生优先级

## 第九章：极境（高压与极端情境）— 主测全维度
场景设定：你面临各种极端场景的决策压力。
- 6道题，限时直觉题（设置 isTimedQuestion: true, timeLimit: 8）
- 时间压力下的选择更能反映真实倾向

## 第十章：星归（收束终章）— 主测 JP + SN
场景设定：旅程接近尾声，你开始构建属于自己的星图。
- 6道题，总结性的生活态度和未来展望
- 最后一题是对整个旅程的回顾性选择

# 输出格式
请按以下 TypeScript 格式输出每道题（与已有题目格式一致）：
{
  id: 'q26',  // 从 q26 开始编号
  chapterId: 6,  // 章节号
  scene: {
    narrative: '(100-200字故事化场景描述)',
    background: 'chapter6_bg',
  },
  options: [
    { text: '(角色行为选项)', scores: { EI: 0, SN: 0, TF: 2, JP: 0 } },
    { text: '(角色行为选项)', scores: { EI: 0, SN: 0, TF: -2, JP: 0 } },
  ],
  isTimedQuestion: false,  // 第九章设为 true
  timeLimit: undefined,    // 第九章设为 8
}

请逐章输出，每章 6 题。
```

### 6.5 版本切换与付费策略

| 版本 | 题数 | 时长 | 定位 | 价格 |
|------|------|------|------|------|
| 快速版 | 25题 | 5-8分钟 | 免费引流 | 免费测 + ¥9.9报告 |
| 完整版 | 60题 | 15-20分钟 | 专业深度 | VIP专享 或 单次¥4.9 |

---

## 小程序审核 + H5 部署方案

### 7.1 小程序审核策略

**类目选择：** "工具 > 信息查询"（避免"心理咨询"类目）

**审核注意事项：**
- 应用名称/描述中不出现"MBTI""心理测试""性格测试"等敏感词
- 使用"趣味人格探索""星灵匹配"等表述
- 隐私协议必须完整配置（小程序后台 → 设置 → 隐私协议）
- 首页需有"仅供娱乐参考"的免责声明

**审核材料准备：**
- 测试账号/密码（如需要）
- 功能介绍截图（覆盖主要页面）
- 类目资质说明（工具类无需额外资质）

### 7.2 H5 部署方案

**推荐部署方式（按优先级）：**

| 方案 | 平台 | 费用 | 是否需要备案 | 推荐度 |
|------|------|------|------------|--------|
| A | 微信云开发-静态网站托管 | 免费(5GB内) | 需要 | ⭐⭐⭐ |
| B | Vercel | 免费 | 不需要(.vercel.app域名) | ⭐⭐⭐⭐⭐ |
| C | Netlify | 免费 | 不需要 | ⭐⭐⭐⭐ |
| D | GitHub Pages | 免费 | 不需要 | ⭐⭐⭐ |
| E | 腾讯云COS+CDN | 低成本 | 需要 | ⭐⭐⭐ |

**推荐：先用 Vercel 免费部署（无需备案、自动HTTPS、全球CDN），域名格式 `soulmap.vercel.app`**

**Vercel 部署步骤：**
1. 将代码推送到 GitHub
2. 登录 Vercel.com → Import Project → 选择仓库
3. 配置构建命令：`npm run build:h5`
4. 配置输出目录：`dist/build/h5`
5. 点击 Deploy → 自动获得 HTTPS 链接
6. （可选）绑定自定义域名

**自定义域名（需备案）：**
- 如果后续要用自己的域名（如 soulmap.cn），则需要域名 ICP 备案
- 备案周期约 5-20 个工作日
- 建议先用 Vercel 子域名跑起来，同时并行提交备案

---

## 开发排期与优先级

### 8.1 开发顺序（按 ROI 排序）

| 优先级 | 模块 | 预估工时 | 影响指标 | 理由 |
|--------|------|---------|---------|------|
| P2-1 | 数据埋点 + 漏斗分析 | 2天 | 所有决策基础 | 没有数据就是盲人摸象 |
| P2-2 | 限时优惠 + 支付挽回 | 2天 | 付费转化率 +50%↑ | 最直接的收入提升 |
| P2-3 | 分享裂变机制 | 3天 | K值 +30%↑ | 免费获客引擎 |
| P2-4 | A/B 测试框架 | 1.5天 | 长期优化基础 | 让每次改动都有数据支撑 |
| P2-5 | 好友对比/契合度 | 4天 | K值+收入双升 | 高价值付费产品+强社交传播 |
| P2-6 | 完整版 60 题 | 3天 | 留存+VIP转化 | 为 Phase 3 VIP 做铺垫 |
| — | H5 部署 | 0.5天 | 触达面 | 简单但重要 |
| — | 小程序审核 | 0.5天 | 正式上线 | 流程性工作 |

**总计：约 16.5 个工作日（2人协作约 10 天）**

### 8.2 依赖关系

```
                ┌→ 限时优惠(P2-2)
数据埋点(P2-1) ─┼→ A/B测试(P2-4)
                └→ 所有后续模块的效果度量

分享裂变(P2-3) ──→ 好友对比(P2-5)（复用邀请链路）

60题完整版(P2-6) → 独立，不阻塞其他模块
```

---

## 关键指标与验收标准

### 9.1 Phase 2 完成后目标指标

| 指标 | Phase 1 基线 | Phase 2 目标 | 提升幅度 |
|------|------------|------------|---------|
| 付费转化率 | 5% | 8-10% | +60-100% |
| K值(病毒系数) | 0.8 | 1.2-1.5 | +50-88% |
| ARPU(每用户收入) | ¥0.50 | ¥1.20 | +140% |
| 次日留存 | 10% | 18% | +80% |
| 分享率 | 25% | 40% | +60% |
| 7日留存 | 3% | 8% | +167% |

### 9.2 各模块验收标准

| 模块 | 验收标准 |
|------|---------|
| 裂变机制 | 邀请链路完整跑通；奖励正确发放；30%用户触发邀请 |
| 好友对比 | 对比结果准确；付费解锁流程通畅；日均产生 50+ 对比 |
| 限时优惠 | 倒计时准确；价格动态切换正确；模板消息成功送达率>90% |
| 数据埋点 | 所有关键事件正确采集；漏斗数据实时可查 |
| A/B测试 | 分流均匀（±5%以内）；实验互不干扰；结果可量化 |
| 60题版 | 答题流程无中断；章节过渡正确；计分结果准确 |

### 9.3 决策树：Phase 2 完成后的走向

```
Phase 2 数据验证
     │
     ├── K值 > 1.2 且 付费率 > 8%
     │   → 全力投入 Phase 3（VIP+新测试+AI）
     │   → 开始内容创作者合作分销
     │
     ├── K值 > 1 但 付费率 < 5%
     │   → 优先优化付费转化（文案/定价/时机）
     │   → A/B 测试更多付费点方案
     │
     ├── K值 < 1 但 付费率 > 8%
     │   → 优先优化传播（分享卡片设计/裂变机制）
     │   → 投放小红书/抖音试水
     │
     └── K值 < 0.8 且 付费率 < 3%
         → 复盘产品：可能需要重新设计结果文案/视觉
         → 考虑 pivot 方向
```

---

## 附：新增文件清单汇总

| 文件 | 模块 | 功能 |
|------|------|------|
| `src/composables/useInvite.ts` | 裂变 | 邀请逻辑 |
| `src/composables/useCompare.ts` | 对比 | 契合度计算与对比流程 |
| `src/composables/useCountdown.ts` | 优惠 | 限时倒计时 |
| `src/composables/useABTest.ts` | AB测试 | 客户端分流框架 |
| `src/utils/compatibility.ts` | 对比 | 契合度算法 |
| `src/utils/analytics.ts` (增强) | 埋点 | 事件追踪+批量上报 |
| `src/config/experiments.ts` | AB测试 | 实验配置 |
| `src/data/questions/soulmap-full.ts` | 60题 | 完整版题库 |
| `src/data/results/compatibility-reports.ts` | 对比 | 配对报告模板 |
| `src/pagesUser/invite/index.vue` | 裂变 | 邀请进度页面 |
| `src/pagesReport/compare/index.vue` (实现) | 对比 | 对比结果页 |
| `src/components/shared/InviteBanner.vue` | 裂变 | 邀请引导横幅 |
| `src/components/payment/TimedOffer.vue` | 优惠 | 限时优惠组件 |
| `cloudfunctions/invite/index.js` | 裂变 | 邀请验证云函数 |
| `cloudfunctions/compare/index.js` | 对比 | 配对云函数 |
| `cloudfunctions/sendMessage/index.js` | 挽回 | 模板消息发送 |
| `cloudfunctions/timedTask/index.js` | 挽回 | 定时检查任务 |
| `cloudfunctions/getABReport/index.js` | AB测试 | 实验数据聚合 |
