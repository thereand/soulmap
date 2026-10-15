/**
 * 灵魂星图 - 全局特性开关
 *
 * 集中管理需要按条件启用的业务能力。改动一处即可全局生效。
 *
 * 当前策略：
 *   - PAID_ENABLED = false
 *     因暂未申请企业营业执照，无法开通微信支付。
 *     关闭所有付费入口，所有报告 / 对比详情默认对全部用户免费开放。
 *     等商户号就位后，把 PAID_ENABLED 改成 true 即可恢复付费流程（云函数无需改）。
 */

/** 是否启用付费能力（全局总开关） */
export const PAID_ENABLED = false

/** 是否显示限时优惠倒计时（依赖付费能力） */
export const TIMED_OFFER_ENABLED = PAID_ENABLED

/** 是否显示付费墙（依赖付费能力） */
export const PAYWALL_ENABLED = PAID_ENABLED

/** 是否显示追加售卖 upsell（依赖付费能力） */
export const UPSELL_ENABLED = PAID_ENABLED

/** 是否启用对比报告的付费解锁（依赖付费能力） */
export const COMPARE_PAID_ENABLED = PAID_ENABLED

/**
 * 调试辅助：运行时打印一次，方便真机调试确认开关状态
 * 仅在开发模式输出，生产构建会被 tree-shake
 */
if (import.meta.env.DEV) {
  console.log('[Features] PAID_ENABLED =', PAID_ENABLED)
}
