/**
 * 灵魂星图 - 星灵图鉴收集管理
 *
 * 封装图鉴卡片的解锁、持久化与查询逻辑。
 * 使用 localStorage 持久化解锁进度。
 */
import { ref, computed } from 'vue'
import { atlasCards } from '@/data/atlas'

/** localStorage 存储键 */
const STORAGE_KEY = 'SOULMAP_ATLAS_UNLOCKED'

export function useAtlas() {
  /* ===== 响应式状态 ===== */

  /** 已解锁卡片 ID 列表 */
  const unlockedCards = ref<string[]>([])

  /* ===== 计算属性 ===== */

  /** 图鉴总卡片数 */
  const totalCards = computed(() => atlasCards.length)

  /** 已解锁卡片数 */
  const unlockedCount = computed(() => unlockedCards.value.length)

  /** 收集完成率（百分比，四舍五入取整） */
  const completionRate = computed(() =>
    Math.round((unlockedCount.value / totalCards.value) * 100),
  )

  /* ===== 方法 ===== */

  /**
   * 解锁单张卡片
   *
   * @param cardId 卡片 ID
   * @returns true 表示本次为新解锁，false 表示已拥有
   */
  function unlockCard(cardId: string): boolean {
    if (unlockedCards.value.includes(cardId)) {
      return false
    }
    unlockedCards.value.push(cardId)
    saveUnlocked()
    return true
  }

  /**
   * 根据测试结果批量解锁
   *
   * 流程：
   * 1. 尝试解锁对应的 MBTI 类型卡（mbti_${type}）
   * 2. 尝试解锁对应的组合卡：
   *    - quad → combo_quad
   *    - triple → combo_triple
   *    - dual → combo_dual
   *    - single → 无对应组合卡
   * 3. 返回本次新解锁的卡片 ID 列表
   *
   * @param mbtiType  MBTI 类型代码（如 'INTJ'）
   * @param comboId   星灵组合 ID（如 'quad', 'dual_flame_abyss', 'single_flame' 等）
   * @returns 本次新解锁的卡片 ID 数组
   */
  function unlockFromResult(mbtiType: string, comboId: string): string[] {
    const newlyUnlocked: string[] = []

    // 1. MBTI 类型卡
    const mbtiCardId = `mbti_${mbtiType}`
    if (unlockCard(mbtiCardId)) {
      newlyUnlocked.push(mbtiCardId)
    }

    // 2. 组合卡：根据 comboId 判断组合类型
    let comboCardId: string | null = null
    if (comboId === 'quad') {
      comboCardId = 'combo_quad'
    } else if (comboId.startsWith('triple_')) {
      comboCardId = 'combo_triple'
    } else if (comboId.startsWith('dual_')) {
      comboCardId = 'combo_dual'
    }
    // single 组合无对应组合卡

    if (comboCardId && unlockCard(comboCardId)) {
      newlyUnlocked.push(comboCardId)
    }

    return newlyUnlocked
  }

  /**
   * 检查某张卡片是否已解锁
   */
  function isUnlocked(cardId: string): boolean {
    return unlockedCards.value.includes(cardId)
  }

  /**
   * 从 localStorage 加载解锁记录
   */
  function loadUnlocked(): void {
    try {
      const raw = uni.getStorageSync(STORAGE_KEY)
      if (raw && Array.isArray(raw)) {
        unlockedCards.value = raw as string[]
      } else if (typeof raw === 'string' && raw) {
        // 兼容 JSON 字符串存储
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          unlockedCards.value = parsed
        }
      }
    } catch {
      console.warn('[useAtlas] 读取图鉴数据失败，已重置')
      unlockedCards.value = []
    }
  }

  /**
   * 将解锁记录持久化到 localStorage
   */
  function saveUnlocked(): void {
    try {
      uni.setStorageSync(STORAGE_KEY, JSON.stringify(unlockedCards.value))
    } catch {
      console.warn('[useAtlas] 保存图鉴数据失败')
    }
  }

  /**
   * 清空所有解锁记录（调试/重置用）
   */
  function resetAtlas(): void {
    unlockedCards.value = []
    try {
      uni.removeStorageSync(STORAGE_KEY)
    } catch {
      console.warn('[useAtlas] 清除图鉴数据失败')
    }
  }

  return {
    // 响应式状态
    unlockedCards,
    // 计算属性
    totalCards,
    unlockedCount,
    completionRate,
    // 方法
    unlockCard,
    unlockFromResult,
    isUnlocked,
    loadUnlocked,
    saveUnlocked,
    resetAtlas,
  }
}
