/**
 * 灵魂星图 - 订阅消息授权组合式函数
 *
 * 封装 wx.requestSubscribeMessage 逻辑：
 *  - 弹窗请求授权（reportExpire + friendDynamic 两个模板）
 *  - 授权后调用 recordSubscribeAuth 云函数记录额度
 *  - 本地记录用户已弹过窗（避免重复打扰）
 *
 * H5 环境无订阅消息能力，静默 no-op。
 */
import { callCloud } from '@/services/cloud'
import { track, AnalyticsEvent } from '@/utils/analytics'

/** 已在小程序后台配置好的模板 ID，与 sendMessage 云函数常量保持一致 */
export const TEMPLATE_IDS = {
  reportExpire: '6aJZEBQsamKOnGVxOW6hOwIR8Bqdp1k941yjm_bp-0o',
  friendDynamic: 'uzpI4UGFf8eaGWSjwtiS8qGdTWz_VMPUtO8YM_RNhew',
} as const

const STORAGE_ASKED_KEY = 'SOULMAP_SUB_ASKED_AT'
const ASK_COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24 小时冷却

export function useSubscribe() {
  /**
   * 是否近期已经弹过授权（避免同一用户短时间被多次打扰）
   */
  function recentlyAsked(): boolean {
    try {
      const raw = uni.getStorageSync(STORAGE_ASKED_KEY)
      if (!raw) return false
      const ts = Number(raw)
      return !isNaN(ts) && Date.now() - ts < ASK_COOLDOWN_MS
    } catch { return false }
  }

  function markAsked(): void {
    try { uni.setStorageSync(STORAGE_ASKED_KEY, String(Date.now())) } catch {}
  }

  /**
   * 请求订阅两个默认模板
   * @param opts.templateIds  自定义要请求的模板 ID 列表；不传默认两个都请求
   * @param opts.force        忽略冷却，强制弹窗
   */
  async function requestSubscribe(opts: {
    templateIds?: string[]
    force?: boolean
  } = {}): Promise<{ granted: number; total: number }> {
    const tmplIds = opts.templateIds && opts.templateIds.length
      ? opts.templateIds
      : [TEMPLATE_IDS.reportExpire, TEMPLATE_IDS.friendDynamic]

    // #ifdef H5
    // H5 无订阅消息能力
    return { granted: 0, total: tmplIds.length }
    // #endif

    // #ifdef MP-WEIXIN
    if (!opts.force && recentlyAsked()) {
      return { granted: 0, total: tmplIds.length }
    }

    return new Promise((resolve) => {
      try {
        wx.requestSubscribeMessage({
          tmplIds,
          success: (res: any) => {
            markAsked()
            const grants: Record<string, string> = {}
            let granted = 0
            tmplIds.forEach((id) => {
              const state = res?.[id] || 'reject'
              grants[id] = state
              if (state === 'accept') granted++
            })
            track(AnalyticsEvent.PAGE_VIEW, {
              action: 'subscribe_result',
              granted,
              total: tmplIds.length,
              detail: grants,
            })
            // 上报到云端记录额度
            if (granted > 0) {
              callCloud('recordSubscribeAuth', { grants }).catch(() => null)
            }
            resolve({ granted, total: tmplIds.length })
          },
          fail: (err: any) => {
            console.warn('[useSubscribe] requestSubscribeMessage 失败:', err)
            markAsked()
            resolve({ granted: 0, total: tmplIds.length })
          },
        })
      } catch (e) {
        console.warn('[useSubscribe] 环境不支持:', e)
        resolve({ granted: 0, total: tmplIds.length })
      }
    })
    // #endif

    // eslint-disable-next-line no-unreachable
    return { granted: 0, total: tmplIds.length }
  }

  /**
   * 只请求"报告过期"模板（用户点击"完成后提醒我"时使用）
   */
  function requestReportExpireOnly(): Promise<{ granted: number; total: number }> {
    return requestSubscribe({
      templateIds: [TEMPLATE_IDS.reportExpire],
      force: true,
    })
  }

  /**
   * 只请求"好友动态"模板（用户点击对比邀请时使用）
   */
  function requestFriendDynamicOnly(): Promise<{ granted: number; total: number }> {
    return requestSubscribe({
      templateIds: [TEMPLATE_IDS.friendDynamic],
      force: true,
    })
  }

  return {
    TEMPLATE_IDS,
    recentlyAsked,
    requestSubscribe,
    requestReportExpireOnly,
    requestFriendDynamicOnly,
  }
}
