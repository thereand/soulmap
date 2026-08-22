/**
 * 灵魂星图 - A/B 测试组合式函数
 *
 * 客户端分流：基于用户 ID 的稳定哈希，保证同一用户始终看到同一版本。
 * 曝光与转化事件通过埋点写入 events 集合，服务端 getABReport 聚合。
 */
import { activeExperiments, getExperiment, type ABExperiment } from '@/config/experiments'
import { getUserId, trackABExposure, trackABConversion } from '@/utils/analytics'

const STORAGE_EXPOSED = 'SOULMAP_AB_EXPOSED'

/** 缓存已上报曝光的实验，避免重复上报 */
function getExposedSet(): Set<string> {
  try {
    const raw = uni.getStorageSync(STORAGE_EXPOSED)
    if (!raw) return new Set()
    const arr = JSON.parse(raw as string)
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function saveExposedSet(set: Set<string>): void {
  try {
    uni.setStorageSync(STORAGE_EXPOSED, JSON.stringify(Array.from(set)))
  } catch {}
}

/** 简单确定性哈希：将字符串转为无符号 32 位整数 */
function simpleHash(s: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h = (h ^ s.charCodeAt(i)) >>> 0
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0
  }
  return h >>> 0
}

/**
 * 根据用户 ID + 实验 ID 与权重，稳定选择一个变体
 */
function pickVariant(userId: string, exp: ABExperiment): string {
  const buckets = exp.variants
  const weights = exp.weights && exp.weights.length === buckets.length
    ? exp.weights
    : buckets.map(() => Math.floor(100 / buckets.length))
  const total = weights.reduce((s, w) => s + w, 0) || 1

  const hash = simpleHash(`${userId}::${exp.id}`)
  const point = hash % total
  let acc = 0
  for (let i = 0; i < buckets.length; i++) {
    acc += weights[i]
    if (point < acc) return buckets[i]
  }
  return buckets[buckets.length - 1]
}

export function useABTest() {
  /**
   * 获取当前用户在指定实验中的变体
   * 会自动做一次曝光埋点（同一会话内每个实验只上报一次）
   */
  function getVariant(experimentId: string): string {
    const exp = getExperiment(experimentId)
    if (!exp || !exp.enabled) {
      // 未启用则返回第一个变体，视作对照组
      return exp?.variants?.[0] || 'control'
    }
    const userId = getUserId() || 'anon'
    const variant = pickVariant(userId, exp)

    const key = `${experimentId}::${variant}`
    const exposed = getExposedSet()
    if (!exposed.has(key)) {
      exposed.add(key)
      saveExposedSet(exposed)
      trackABExposure(experimentId, variant)
    }
    return variant
  }

  /** 静默取值，不触发曝光埋点（用于服务端判定逻辑等） */
  function peekVariant(experimentId: string): string {
    const exp = getExperiment(experimentId)
    if (!exp || !exp.enabled) return exp?.variants?.[0] || 'control'
    return pickVariant(getUserId() || 'anon', exp)
  }

  /** 上报一次曝光（一般由 getVariant 自动处理，业务侧手动调用备用） */
  function trackExposure(experimentId: string, variant: string): void {
    trackABExposure(experimentId, variant)
  }

  /** 上报一次转化 */
  function trackConversion(experimentId: string, metric: string, extra: Record<string, any> = {}): void {
    trackABConversion(experimentId, metric, extra)
  }

  return {
    getVariant,
    peekVariant,
    trackExposure,
    trackConversion,
    experiments: activeExperiments,
  }
}
