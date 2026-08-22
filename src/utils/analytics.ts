/**
 * 灵魂星图 - 埋点工具（增强版）
 *
 * 支持：
 *  - 单次事件上报（本地+云端双通道）
 *  - 会话与用户级标识
 *  - 本地批量缓存 + 定时上报
 *  - 网络失败重试与丢弃保护
 *  - 微信小程序 wx.reportAnalytics / wx.reportEvent 兼容
 *  - H5 / 小程序端事件字段一致
 */

import { callCloud } from '@/services/cloud'

/** 事件类型枚举 —— 与 Phase2 埋点表保持一致 */
export enum AnalyticsEvent {
  APP_LAUNCH = 'app_launch',
  PAGE_VIEW = 'page_view',
  TEST_START = 'test_start',
  QUESTION_ANSWER = 'question_answer',
  CHAPTER_COMPLETE = 'chapter_complete',
  TEST_COMPLETE = 'test_complete',
  RESULT_VIEW = 'result_view',
  PAYWALL_VIEW = 'paywall_view',
  PAY_CLICK = 'pay_click',
  PAY_SUCCESS = 'pay_success',
  PAY_FAIL = 'pay_fail',
  SHARE_CLICK = 'share_click',
  SHARE_SUCCESS = 'share_success',
  INVITE_SEND = 'invite_send',
  INVITE_COMPLETE = 'invite_complete',
  COMPARE_START = 'compare_start',
  COMPARE_PAY = 'compare_pay',
  AB_EXPOSURE = 'ab_exposure',
  AB_CONVERSION = 'ab_conversion',
  /** 兼容旧代码 */
  START_TEST = 'test_start',
  COMPLETE_TEST = 'test_complete',
  VIEW_RESULT = 'result_view',
  VIEW_REPORT = 'result_view',
  SHARE = 'share_click',
  CLICK_PAY = 'pay_click',
  LOGIN = 'login',
}

/** 单条事件结构 */
export interface TrackEvent {
  event: string
  params?: Record<string, any>
  timestamp: number
  sessionId: string
  userId: string
  page?: string
  platform: 'mp-weixin' | 'h5' | 'unknown'
}

/** 本地缓存键 */
const STORAGE_SESSION_KEY = 'SOULMAP_ANALYTICS_SESSION'
const STORAGE_QUEUE_KEY = 'SOULMAP_ANALYTICS_QUEUE'
const STORAGE_USER_KEY = 'SOULMAP_ANALYTICS_USER'

/** 批量上报阈值 */
const FLUSH_INTERVAL_MS = 15_000
const MAX_QUEUE_SIZE = 60
const MAX_KEEP_ON_FAIL = 200

/** 内部状态 */
let sessionId = ''
let userId = ''
let queue: TrackEvent[] = []
let flushTimer: ReturnType<typeof setInterval> | null = null
let inited = false

/** 获取平台标识 */
function getPlatform(): TrackEvent['platform'] {
  // #ifdef MP-WEIXIN
  return 'mp-weixin'
  // #endif
  // #ifdef H5
  return 'h5'
  // #endif
  // eslint-disable-next-line no-unreachable
  return 'unknown'
}

/** 生成随机 ID */
function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/** 获取当前页面路径 */
function getCurrentPage(): string {
  try {
    const pages = getCurrentPages?.() || []
    const cur = pages[pages.length - 1] as any
    return cur?.route || cur?.$page?.fullPath || ''
  } catch {
    return ''
  }
}

/** 初始化 analytics 会话（App onLaunch 或首屏调用） */
export function initAnalytics(existingUserId?: string): void {
  if (inited) return
  inited = true

  // 会话 ID：每次冷启动新建
  sessionId = genId('sess')
  try {
    uni.setStorageSync(STORAGE_SESSION_KEY, sessionId)
  } catch {}

  // 用户 ID：优先使用传入值，否则读取历史；仍无则生成匿名 ID
  if (existingUserId) {
    userId = existingUserId
    try { uni.setStorageSync(STORAGE_USER_KEY, userId) } catch {}
  } else {
    try {
      const stored = uni.getStorageSync(STORAGE_USER_KEY)
      userId = stored || genId('anon')
      if (!stored) uni.setStorageSync(STORAGE_USER_KEY, userId)
    } catch {
      userId = genId('anon')
    }
  }

  // 恢复未上报队列
  try {
    const raw = uni.getStorageSync(STORAGE_QUEUE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw as string)
      if (Array.isArray(parsed)) queue = parsed.slice(-MAX_KEEP_ON_FAIL)
    }
  } catch {}

  startFlushTimer()

  // 冷启动事件
  track(AnalyticsEvent.APP_LAUNCH, { platform: getPlatform() })
}

/** 启动定时批量上报 */
function startFlushTimer(): void {
  if (flushTimer) return
  flushTimer = setInterval(() => {
    void flush()
  }, FLUSH_INTERVAL_MS)
}

/** 设置或更新登录用户 ID（登录成功后调用） */
export function setUser(newUserId: string): void {
  if (!newUserId) return
  userId = newUserId
  try { uni.setStorageSync(STORAGE_USER_KEY, userId) } catch {}
}

/** 获取当前用户 ID */
export function getUserId(): string {
  return userId
}

/** 获取当前会话 ID */
export function getSessionId(): string {
  return sessionId
}

/**
 * 上报单个事件（进入队列，异步批量上报）
 */
export function track(
  event: AnalyticsEvent | string,
  params: Record<string, any> = {},
): void {
  if (!inited) initAnalytics()

  const item: TrackEvent = {
    event,
    params,
    timestamp: Date.now(),
    sessionId,
    userId,
    page: getCurrentPage(),
    platform: getPlatform(),
  }

  queue.push(item)

  // 开发环境日志
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event, params)
  }

  // 微信官方统计
  try {
    // #ifdef MP-WEIXIN
    if (typeof wx !== 'undefined') {
      if (wx.reportEvent) {
        try { wx.reportEvent(event, params) } catch {}
      }
      if (wx.reportAnalytics) {
        try { wx.reportAnalytics(event, { ...params, ts: item.timestamp }) } catch {}
      }
    }
    // #endif
  } catch (e) {
    // 忽略微信统计失败
  }

  // 关键事件立即上报，其他事件缓存
  const isCritical = event === AnalyticsEvent.PAY_SUCCESS
    || event === AnalyticsEvent.PAY_FAIL
    || event === AnalyticsEvent.TEST_COMPLETE
  if (isCritical || queue.length >= MAX_QUEUE_SIZE) {
    void flush()
  } else {
    persistQueue()
  }
}

/** 上报页面浏览 */
export function trackPageView(page: string, extra: Record<string, any> = {}): void {
  track(AnalyticsEvent.PAGE_VIEW, { page, ...extra })
}

/** 获取当前会话内已缓存事件（调试用） */
export function getSessionEvents(): TrackEvent[] {
  return [...queue]
}

/** 持久化队列到本地存储 */
function persistQueue(): void {
  try {
    const toSave = queue.slice(-MAX_KEEP_ON_FAIL)
    uni.setStorageSync(STORAGE_QUEUE_KEY, JSON.stringify(toSave))
  } catch (e) {
    // 忽略持久化异常
  }
}

/**
 * 强制上报当前缓存队列
 * 页面切出、支付前、分享前应主动调用
 */
export async function flush(): Promise<void> {
  if (queue.length === 0) return
  const batch = queue.splice(0, queue.length)
  persistQueue()

  try {
    const res = await callCloud('trackEvents' as any, { events: batch })
    if (!res || !res.success) {
      // 失败：放回队列（限量），下次重试
      queue = [...batch.slice(-MAX_KEEP_ON_FAIL), ...queue].slice(-MAX_KEEP_ON_FAIL)
      persistQueue()
    }
  } catch (e) {
    queue = [...batch.slice(-MAX_KEEP_ON_FAIL), ...queue].slice(-MAX_KEEP_ON_FAIL)
    persistQueue()
  }
}

/** 兼容旧接口 */
export function batchTrack(events: Array<{ event: string; params?: Record<string, any> }>): void {
  if (!events?.length) return
  events.forEach((e) => track(e.event, e.params || {}))
}

/** ============ A/B 测试专用捷径 ============ */

export function trackABExposure(experimentId: string, variant: string): void {
  track(AnalyticsEvent.AB_EXPOSURE, { experimentId, variant })
}

export function trackABConversion(experimentId: string, metric: string, extra: Record<string, any> = {}): void {
  track(AnalyticsEvent.AB_CONVERSION, { experimentId, metric, ...extra })
}
