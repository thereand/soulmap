# 灵魂星图 - Phase 2 上线部署与审核清单

> 本文件汇总 Phase 2 完成后小程序审核提交 + H5 部署 + 云函数部署所需的全部材料与操作步骤。

---

## 一、代码提交前自检

### 1. 编译验证（已通过 ✅）
```bash
cd f:\工作项目\性格测试app\soulmap
npm run build:h5           # 产物: dist/build/h5
npm run build:mp-weixin    # 产物: dist/build/mp-weixin
```

### 2. 关键页面确认
- 首页 `pages/index/index` 已加入免责声明 + 隐私协议入口
- 结果页 `pagesTest/result/index` 已接入限时优惠 + 邀请横幅 + 对比入口 + 埋点
- 对比页 `pagesReport/compare/index` 已实现契合度对比
- 邀请页 `pagesUser/invite/index` 已实现
- 协议页 `pagesUser/legal/index` 覆盖隐私协议与用户协议

### 3. 类目与关键词
- 服务类目：**工具 → 信息查询**（避免"心理咨询"类目）
- 全站已避免使用 "MBTI"、"心理测试" 等敏感词，用"趣味人格探索"、"星灵"等替代
- 首页文案：`趣味人格探索，帮你更了解自己`

---

## 二、云函数部署清单

| 云函数 | 用途 | 状态 | 备注 |
|-------|------|------|------|
| `login` | 用户登录 | 已存在 | 需重新部署（如未部署） |
| `submitResult` | 提交测试结果 | 已存在 | 需重新部署 |
| `getReport` | 获取报告 | 已存在 | 需重新部署 |
| `shareToken` | 分享短链 | 已存在 | 需重新部署 |
| `trackEvents` | 埋点批量上报 | 新增 | **必部署** |
| `invite` | 邀请裂变 | 新增 | **必部署** |
| `compare` | 好友对比配对 | 新增 | **必部署** |
| `sendMessage` | 订阅消息发送 | 新增 | 需先申请模板 ID 再部署 |
| `timedTask` | 定时任务（挽回） | 新增 | 需配置定时触发器 |
| `getABReport` | A/B 数据聚合 | 新增 | 可选，管理员查数据用 |
| `createOrder` | 创建订单 | 已存在 | 需商户号后再部署 |
| `payCallback` | 支付回调 | 已存在 | 需商户号后再部署 |

### 部署方式（微信开发者工具）
1. 打开微信开发者工具，导入本项目
2. 展开 `cloudfunctions/` 目录
3. 右键需要部署的云函数目录 → **"上传并部署：云端安装依赖（不上传 node_modules）"**
4. 依次部署上表标注为"必部署"和"已存在"的云函数

### 数据库集合（云开发控制台创建）
| 集合 | 权限 | 用途 |
|------|------|------|
| `users` | 仅创建者可读写 | 用户资料 & 已解锁奖励 |
| `test_results` | 仅创建者可读写 | 测试结果 |
| `orders` | 仅管理端 | 订单（后续支付用） |
| `events` | 仅创建者可读写 | 埋点事件（建议 30 天 TTL） |
| `invitations` | 仅管理端 | 邀请关系 |
| `invite_codes` | 仅管理端 | 邀请码反查表 |
| `comparisons` | 仅创建者可读写 | 好友对比记录 |
| `subscribe_authorizations` | 仅管理端 | 订阅消息授权额度 |
| `message_logs` | 仅管理端 | 订阅消息发送日志 |

### 定时触发器
在 `timedTask` 云函数详情页 → **"触发器"** → 新增：
```
cron: 0 0 20 * * * *
说明: 每天 20:00 检查 24-48h 未付费用户
```

---

## 三、小程序审核准备

### 1. 后台配置（mp.weixin.qq.com）

**设置 → 基本设置：**
- 小程序名称：`灵魂星图`
- 简介：`一款融合荣格心理学与故事叙述的趣味人格探索小程序，帮你更了解自己。`
- 服务类目：`工具 → 信息查询`
- 服务范围：全网

**设置 → 隐私协议：**
- 上传 `docs/隐私协议.md` 内容（或直接使用应用内 `pagesUser/legal/index?type=privacy` 展示的内容）
- 说明采集：openid、答题选项、设备型号、用户主动授权的头像/昵称

**订阅消息模板申请（模块三挽回消息用）：**
在小程序后台 → "订阅消息" → "我的模板" → 新增：
1. 模板一：`报告保存提醒`
   - 字段：thing1（报告名）、time2（过期时间）、thing3（引导）
   - 拿到模板 ID 后填入 `cloudfunctions/sendMessage/index.js` 的 `DEFAULT_TEMPLATE.reportExpire`
2. 模板二：`好友动态提醒`
   - 字段：thing1（好友消息）、thing3（行动引导）
   - 填入 `DEFAULT_TEMPLATE.friendDynamic`

**开发管理 → 开发设置：**
- request 合法域名：无（全部走云开发）
- 上传后需勾选"不校验合法域名"选项？→ 生产环境请配置正式域名或保留云开发通道

### 2. 提审版本描述模板

```
版本号：1.0.0
更新说明：
1. 灵魂星图首次发布：25道沉浸式故事题目 + 16 种星灵人格。
2. 支持结果分享、好友契合度对比、邀请解锁等社交功能。
3. 内容为趣味人格探索，结果仅供娱乐参考。
```

### 3. 审核测试建议
- 在开发者工具中用真机预览完整走一遍：首页 → 测试 → 结果 → 分享 → 邀请 → 对比
- 检查所有 CTA 都可正常触发（限时优惠、邀请、对比）
- 确认所有页面底部或引导处的免责声明可见
- 应用内不出现任何"MBTI""心理测试""心理诊断""医疗"等词

### 4. 常见审核不通过原因
| 问题 | 解决 |
|------|------|
| 类目不符 | 选"工具-信息查询"，不要选医疗/心理相关 |
| 未标注仅供娱乐 | 首页 + 结果页均已加免责声明 ✅ |
| 隐私协议缺失 | 已在首页 footer + `pagesUser/legal/index` 提供 ✅ |
| 心理暗示过强 | 全站文案已经使用"星灵""探索"等中性词汇 |
| 未成年人保护 | 用户协议里已声明面向 14 岁以上 |

---

## 四、H5 部署到 Vercel

### 1. 首次部署
```bash
# 前置：将代码推送到 GitHub / Gitee
git init && git add -A && git commit -m "chore: phase2 release"
git remote add origin git@github.com:YOUR/soulmap.git
git push -u origin main
```

在 https://vercel.com 登录：
1. **Add New → Project** → 导入 GitHub 仓库
2. Framework Preset: `Other`
3. Build Command: `npm run build:h5`（vercel.json 已配置，一般会自动识别）
4. Output Directory: `dist/build/h5`
5. Environment Variables: 暂无必填
6. **Deploy**
7. 部署完成后拿到默认域名，例如 `soulmap.vercel.app`

### 2. 自定义域名（可选）
- 需要备案（ICP 备案）
- Vercel → Settings → Domains → Add 输入你的域名
- 按提示配置 CNAME

### 3. H5 端云函数访问说明
当前 `src/services/cloud.ts` 中 H5 端云函数走 HTTP 触发器，`BASE_URL` 目前为空。

上线前请在云开发控制台为需要 H5 访问的云函数创建 **HTTP 访问服务**（新版云开发已在控制台开放），然后：

```ts
// src/services/cloud.ts
const BASE_URL = 'https://你的云开发http域名'
```

或采用云函数 HTTP 服务网关方案。

---

## 五、微信开发者工具 CLI 上传预览版

已知：CLI 路径为 `E:\wechat_devlop\微信web开发者工具\cli.bat`

前置：
1. 打开微信开发者工具 → 右上角 **设置 → 安全** → 勾选 **"服务端口"**
2. 首次使用需要授权 CLI 登录

上传预览版（生成小程序码，供手机扫码测试）：
```bash
cd f:\工作项目\性格测试app\soulmap
E:\wechat_devlop\微信web开发者工具\cli.bat preview \
  --project f:\工作项目\性格测试app\soulmap \
  --qr-format image \
  --qr-output preview-qr.png
```

正式上传体验版：
```bash
E:\wechat_devlop\微信web开发者工具\cli.bat upload \
  --project f:\工作项目\性格测试app\soulmap \
  --version 1.0.0 \
  --desc "Phase2 增长版：限时优惠+分享裂变+好友对比"
```

上传成功后：
1. 登录小程序后台 → **版本管理** → 找到刚上传的开发版
2. 点击"提交审核"，填写测试账号（可留空）

---

## 六、验收自查

| 项目 | 是否通过 |
|-----|---------|
| ✅ P2-1 埋点：20+ 事件覆盖，批量上报 | ✅ |
| ✅ P2-2 限时优惠：3 档倒计时 + 组件 + 云函数 | ✅ |
| ✅ P2-3 分享裂变：邀请码、进度、奖励、云函数 | ✅ |
| ✅ P2-4 A/B 测试：稳定分流 + 5 个实验 + 聚合 | ✅ |
| ✅ P2-5 好友对比：算法 + 报告 + 页面 + 云函数 | ✅ |
| ✅ 合规：免责声明 + 隐私协议 + 关键词替换 | ✅ |
| ✅ H5 build 通过 | ✅ |
| ✅ 小程序 build 通过（分包正确） | ✅ |

## 七、待人工完成事项

1. 打开微信开发者工具，勾选"服务端口"以支持 CLI
2. 上传全部新增/修改的云函数
3. 在云开发控制台创建新增数据库集合
4. 申请两个订阅消息模板并填入 `sendMessage/index.js`
5. 为 `timedTask` 配置定时触发器
6. 在小程序后台提交审核
7. GitHub push + Vercel 部署 H5
