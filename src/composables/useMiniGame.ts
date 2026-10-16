/**
 * useMiniGame — 轻量穿插小游戏系统
 *
 * 在章节过渡时随机触发小游戏，完成后发放奖励（向导亲和度 bonus 等）。
 * 支持 4 种游戏类型：
 *   - energy-collect  能量收集（ch3→ch4）
 *   - soul-puzzle     人格碎片拼图（ch3→ch4）
 *   - guide-pick      向导选择（ch4→ch5）
 *   - star-sequence   星图点亮（ch4→ch5）
 */
import { ref, computed, readonly } from 'vue'

/* ===== 类型定义 ===== */

export type MiniGameId = 'energy-collect' | 'soul-puzzle' | 'guide-pick' | 'star-sequence'

export interface MiniGameReward {
  /** 各向导亲和度加成 */
  guideBonus?: Record<string, number>
  /** 人格碎片额外收集数 */
  fragmentBonus?: number
  /** 选中的向导 ID（仅 guide-pick 使用） */
  chosenGuide?: string
  /** 奖励描述文案 */
  description: string
}

export interface MiniGameState {
  /** 当前激活的游戏 ID，null 表示无游戏进行 */
  gameId: MiniGameId | null
  /** 0-100 游戏进度 */
  progress: number
  /** 是否正在显示游戏 */
  active: boolean
  /** 上次获得的奖励 */
  lastReward: MiniGameReward | null
  /** 已完成的游戏列表（防重复） */
  completed: MiniGameId[]
}

/* ===== 游戏池配置 ===== */

const CHAPTER_GAME_POOL: Record<string, MiniGameId[]> = {
  ch3: ['energy-collect', 'soul-puzzle'],
  ch4: ['star-sequence', 'guide-pick'],
}

/* ===== 全局单例状态 ===== */

const state = ref<MiniGameState>({
  gameId: null,
  progress: 0,
  active: false,
  lastReward: null,
  completed: [],
})

/** 外部可注入的奖励回调（由 useTestEngine 或 play 页面注册） */
let rewardApplier: ((reward: MiniGameReward) => void) | null = null

export function useMiniGame() {
  /* ----- 读取 ----- */
  const active = computed(() => state.value.active)
  const gameId = computed(() => state.value.gameId)
  const progress = computed(() => state.value.progress)
  const lastReward = computed(() => state.value.lastReward)
  const completed = computed(() => state.value.completed)

  /* ----- 触发 ----- */

  /**
   * 根据章节 ID 从游戏池随机选取一个未玩过的游戏并激活。
   * @returns 被选中的 gameId，若无可触发则返回 null
   */
  function triggerMiniGame(chapterId: string): MiniGameId | null {
    const pool = CHAPTER_GAME_POOL[chapterId]
    if (!pool) return null

    // 排除已玩过的
    const available = pool.filter(id => !state.value.completed.includes(id))
    if (available.length === 0) return null

    const chosen = available[Math.floor(Math.random() * available.length)]
    state.value.gameId = chosen
    state.value.progress = 0
    state.value.active = true
    state.value.lastReward = null
    return chosen
  }

  /* ----- 进度更新 ----- */

  function updateProgress(value: number): void {
    state.value.progress = Math.min(100, Math.max(0, value))
  }

  /* ----- 完成游戏 ----- */

  /**
   * 游戏完成时调用，记录奖励并通知外部。
   * 自动关闭游戏 overlay、标记已完成。
   */
  function completeGame(reward: MiniGameReward): void {
    const currentId = state.value.gameId
    state.value.lastReward = reward

    // 标记完成
    if (currentId && !state.value.completed.includes(currentId)) {
      state.value.completed.push(currentId)
    }

    // 通知外部应用奖励
    if (rewardApplier) {
      rewardApplier(reward)
    }

    // 关闭游戏
    state.value.progress = 100
    state.value.active = false
    state.value.gameId = null
  }

  /* ----- 取消/跳过 ----- */

  function cancelGame(): void {
    state.value.active = false
    state.value.gameId = null
    state.value.progress = 0
  }

  /* ----- 注册奖励回调 ----- */

  function onRewardApply(fn: (reward: MiniGameReward) => void): void {
    rewardApplier = fn
  }

  return {
    // 响应式状态
    active: readonly(active),
    gameId: readonly(gameId),
    progress: readonly(progress),
    lastReward: readonly(lastReward),
    completed: readonly(completed),

    // 方法
    triggerMiniGame,
    updateProgress,
    completeGame,
    cancelGame,
    onRewardApply,
  }
}
