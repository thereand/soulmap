/**
 * 灵魂星图 - 限时优惠倒计时组合式函数
 *
 * 用于结果页付费墙的倒计时逻辑，实现：
 *  - 首次进入结果页时启动 30 分钟倒计时（多档可配置）
 *  - 跨页面/刷新持久化（结束时间锚点存 localStorage）
 *  - 到期后自动切换至下一档优惠或原价
 *  - 支持挂起/恢复（tab 切换等）
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'

/** 优惠档位定义 */
export interface OfferTier {
  /** 档位 ID */
  id: string
  /** 档位价格 */
  price: number
  /** 原价，用于对比展示 */
  originalPrice: number
  /** 距离测试完成的持续时长（毫秒）— 如首档 30 分钟 = 30*60*1000 */
  durationMs: number
  /** 档位文案 */
  label?: string
}

/** 默认三档优惠 */
export const DEFAULT_OFFER_TIERS: OfferTier[] = [
  { id: 'first_30min', price: 6.9, originalPrice: 19.9, durationMs: 30 * 60 * 1000, label: '首单专享' },
  { id: 'day2', price: 8.9, originalPrice: 19.9, durationMs: 24 * 60 * 60 * 1000, label: '限时特惠' },
  { id: 'final', price: 5.9, originalPrice: 19.9, durationMs: 48 * 60 * 60 * 1000, label: '最终特惠' },
]

/** 本地存储键 */
const STORAGE_KEY = 'SOULMAP_OFFER_ANCHOR'

/** 锚点数据结构 */
interface OfferAnchor {
  /** 首次触发倒计时的时间戳（毫秒） */
  startedAt: number
  /** 结果类型或订单 ID，作为不同场景的区分（可选） */
  scope?: string
}

/**
 * 使用限时优惠倒计时
 *
 * @param scope - 作用域标识（如结果类型代码），不同 scope 独立计时；默认 'default'
 * @param tiers - 优惠档位列表（默认三档）
 */
export function useCountdown(scope = 'default', tiers: OfferTier[] = DEFAULT_OFFER_TIERS) {
  /** 当前时间戳（响应式，每秒 tick） */
  const now = ref(Date.now())

  /** 首次触发倒计时的时间戳 */
  const startedAt = ref(0)

  let timer: ReturnType<typeof setInterval> | null = null

  /** 距离最初触发的已过时长（毫秒） */
  const elapsed = computed(() => {
    if (!startedAt.value) return 0
    return Math.max(0, now.value - startedAt.value)
  })

  /** 当前档位（elapsed 时间决定） */
  const currentTier = computed<OfferTier>(() => {
    const el = elapsed.value
    // 从最后一档往前找：elapsed >= 该档的开始时间，则处于该档
    // 档位递推：档 i 开始于 tiers[i-1].durationMs（首档开始于 0）
    let idx = 0
    for (let i = 0; i < tiers.length; i++) {
      if (el >= (i === 0 ? 0 : tiers[i - 1].durationMs)) idx = i
    }
    return tiers[idx] || tiers[0]
  })

  /** 当前档位剩余时间（毫秒） */
  const remainingMs = computed(() => {
    const tier = currentTier.value
    return Math.max(0, tier.durationMs - elapsed.value)
  })

  /** 剩余时间是否 > 0 */
  const isActive = computed(() => remainingMs.value > 0)

  /** 是否处于最后一档 */
  const isFinalTier = computed(() => currentTier.value.id === tiers[tiers.length - 1].id)

  /** 已完全过期（最后一档也到期） */
  const isExpired = computed(() => isFinalTier.value && remainingMs.value <= 0)

  /** 格式化剩余时间（mm:ss 或 hh:mm:ss） */
  const remainingText = computed(() => {
    const totalSec = Math.ceil(remainingMs.value / 1000)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    const pad = (n: number) => (n < 10 ? '0' + n : String(n))
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`
    return `${pad(m)}:${pad(s)}`
  })

  /**
   * 启动倒计时
   * 如果已经启动过（存储中有锚点），则不重新计时
   */
  function start(): void {
    const anchor = readAnchor()
    if (anchor && anchor.scope === scope) {
      startedAt.value = anchor.startedAt
    } else {
      startedAt.value = Date.now()
      writeAnchor({ startedAt: startedAt.value, scope })
    }
    resumeTick()
  }

  /** 强制重启倒计时（用于新一次测试完成） */
  function restart(): void {
    startedAt.value = Date.now()
    writeAnchor({ startedAt: startedAt.value, scope })
    resumeTick()
  }

  /** 清除倒计时状态 */
  function clear(): void {
    startedAt.value = 0
    clearAnchor()
    stopTick()
  }

  /** 恢复 tick */
  function resumeTick(): void {
    if (timer) return
    now.value = Date.now()
    timer = setInterval(() => {
      now.value = Date.now()
      if (isExpired.value) stopTick()
    }, 1000)
  }

  /** 停止 tick */
  function stopTick(): void {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  /* ===== 本地存储辅助 ===== */

  function readAnchor(): OfferAnchor | null {
    try {
      const raw = uni.getStorageSync(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw as string)
    } catch { return null }
  }

  function writeAnchor(a: OfferAnchor): void {
    try {
      uni.setStorageSync(STORAGE_KEY, JSON.stringify(a))
    } catch {}
  }

  function clearAnchor(): void {
    try { uni.removeStorageSync(STORAGE_KEY) } catch {}
  }

  /* ===== 生命周期 ===== */

  onMounted(() => {
    // 组件挂载时，如果已存在锚点则自动 resume
    const anchor = readAnchor()
    if (anchor && anchor.scope === scope) {
      startedAt.value = anchor.startedAt
      resumeTick()
    }
  })

  onUnmounted(() => {
    stopTick()
  })

  return {
    // 响应式
    startedAt,
    elapsed,
    currentTier,
    remainingMs,
    remainingText,
    isActive,
    isFinalTier,
    isExpired,
    // 方法
    start,
    restart,
    clear,
  }
}
