/**
 * 灵魂星图 - 测试流程引擎组合式函数
 *
 * 管理完整的 25 题答题流程，包括：
 * - 题目加载与导航
 * - 章节推进与过场动画标志
 * - 答案记录与断点续答
 * - 测试完成判断与结果计算
 */
import { ref, computed } from 'vue'
import type { TestQuestion, Chapter } from '@/types/test'
import { soulmapMainQuestions } from '@/data/questions/soulmap-main'
import { chapters as chapterData } from '@/data/chapters'
import { useScoring, type AnswerRecord } from './useScoring'

/** 本地存储键名 */
const STORAGE_KEY = 'SOULMAP_TEST_PROGRESS'

/** 断点续答数据结构 */
interface SavedProgress {
  currentQuestionIndex: number
  answers: AnswerRecord[]
  startTime: number
  lastActiveTime: number
  isTimedMode: boolean
}

export function useTestEngine() {
  /* ===== 题目与章节数据（只读） ===== */

  /** 全部 25 道题目 */
  const questions = ref<TestQuestion[]>(soulmapMainQuestions)

  /** 全部章节配置 */
  const chaptersList = ref<Chapter[]>(chapterData)

  /* ===== 响应式状态 ===== */

  /** 当前题目全局索引（0 ~ 24） */
  const currentQuestionIndex = ref(0)

  /** 当前章节编号（1 ~ 5，对应 ch1 ~ ch5） */
  const currentChapter = ref(1)

  /** 已答题记录 */
  const answers = ref<AnswerRecord[]>([])

  /** 是否正在播放章节过场动画 */
  const isChapterTransition = ref(false)

  /** 测试是否已全部完成 */
  const isCompleted = ref(false)

  /** 是否为限时模式 */
  const isTimedMode = ref(false)

  /** 测试开始时间戳 */
  const startTime = ref(0)

  /** 最近一次操作时间戳 */
  const lastActiveTime = ref(0)

  /** 计分引擎实例 */
  const scoring = useScoring()

  /* ===== 计算属性 ===== */

  /** 当前题目对象 */
  const currentQuestion = computed<TestQuestion | null>(() => {
    const idx = currentQuestionIndex.value
    if (idx < 0 || idx >= questions.value.length) return null
    return questions.value[idx] ?? null
  })

  /** 总题数 */
  const totalQuestions = computed(() => questions.value.length)

  /** 全局答题进度百分比（0 ~ 100） */
  const progress = computed(() => {
    const total = totalQuestions.value
    if (total === 0) return 0
    return Math.round((answers.value.length / total) * 100)
  })

  /**
   * 当前章节内进度百分比（0 ~ 100）
   * 基于当前章节已回答的题目数 / 章节总题数
   */
  const chapterProgress = computed(() => {
    const chapterId = `ch${currentChapter.value}`
    const chapter = chaptersList.value.find((c) => c.id === chapterId)
    if (!chapter) return 0

    const chapterQuestionIds = chapter.questionIds
    const answeredInChapter = answers.value.filter((a) =>
      chapterQuestionIds.includes(a.questionId),
    ).length

    return Math.round((answeredInChapter / chapterQuestionIds.length) * 100)
  })

  /** 当前章节名称（如 "第一章：觉醒"） */
  const currentChapterName = computed(() => {
    const chapterId = `ch${currentChapter.value}`
    return chaptersList.value.find((c) => c.id === chapterId)?.name ?? ''
  })

  /** 当前题目在章节内的序号（1-based） */
  const questionNumberInChapter = computed(() => {
    const q = currentQuestion.value
    if (!q) return 0
    return q.order
  })

  /** 剩余未答题数 */
  const remainingQuestions = computed(() => {
    return totalQuestions.value - answers.value.length
  })

  /** 当前题目是否已回答 */
  const isCurrentAnswered = computed(() => {
    const q = currentQuestion.value
    if (!q) return false
    return answers.value.some((a) => a.questionId === q.id)
  })

  /* ===== 核心方法 ===== */

  /**
   * 开始新测试
   * 重置所有状态，记录开始时间
   */
  function startTest(): void {
    currentQuestionIndex.value = 0
    currentChapter.value = 1
    answers.value = []
    isChapterTransition.value = false
    isCompleted.value = false
    startTime.value = Date.now()
    lastActiveTime.value = Date.now()
    scoring.resetScoring()
    clearSavedProgress()
  }

  /**
   * 选择选项并记录答案
   *
   * 选择后自动前进到下一题；如果跨越章节边界，
   * 则触发章节过场动画标志（isChapterTransition = true），
   * 由 UI 层监听该标志并在动画结束后调用 confirmChapterTransition()。
   *
   * @param optionIndex - 选项在 options 数组中的索引（0-based）
   */
  function selectOption(optionIndex: number): void {
    const q = currentQuestion.value
    if (!q) return

    // 如果该题已有答案，先替换
    const existingIdx = answers.value.findIndex((a) => a.questionId === q.id)
    const record: AnswerRecord = { questionId: q.id, optionIndex }

    if (existingIdx >= 0) {
      answers.value[existingIdx] = record
    } else {
      answers.value.push(record)
    }

    lastActiveTime.value = Date.now()

    // 自动前进到下一题
    advanceToNext()
  }

  /**
   * 前进到下一题（内部方法）
   * 处理章节过渡逻辑
   */
  function advanceToNext(): void {
    const nextIndex = currentQuestionIndex.value + 1

    // 已到最后一题之后 → 测试完成
    if (nextIndex >= questions.value.length) {
      isCompleted.value = true
      saveProgress()
      return
    }

    const currentQ = questions.value[currentQuestionIndex.value]
    const nextQ = questions.value[nextIndex]

    // 检查是否跨越章节边界
    if (currentQ && nextQ && currentQ.chapterId !== nextQ.chapterId) {
      // 从 chapterId 解析新章节编号，如 'ch3' → 3
      const newChapterNum = parseInt(nextQ.chapterId.replace('ch', ''), 10)
      currentChapter.value = newChapterNum
      isChapterTransition.value = true
    }

    currentQuestionIndex.value = nextIndex
    saveProgress()
  }

  /**
   * 确认章节过场动画已完成
   * UI 层在过场动画结束后调用此方法
   */
  function confirmChapterTransition(): void {
    isChapterTransition.value = false
  }

  /**
   * 跳到指定题目索引（用于回看已答题目）
   * 仅允许跳到已回答的题目或当前题目的前一题
   *
   * @param index - 目标题目索引（0-based）
   */
  function goToQuestion(index: number): void {
    if (index < 0 || index >= questions.value.length) return
    if (isCompleted.value) return

    const targetQ = questions.value[index]

    // 更新章节编号
    const chapterNum = parseInt(targetQ.chapterId.replace('ch', ''), 10)
    currentChapter.value = chapterNum
    currentQuestionIndex.value = index
  }

  /**
   * 保存答题进度到本地存储（断点续答）
   * 使用 uni.setStorageSync
   */
  function saveProgress(): void {
    const data: SavedProgress = {
      currentQuestionIndex: currentQuestionIndex.value,
      answers: answers.value,
      startTime: startTime.value,
      lastActiveTime: Date.now(),
      isTimedMode: isTimedMode.value,
    }

    try {
      uni.setStorageSync(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('[useTestEngine] 保存进度失败:', e)
    }
  }

  /**
   * 从本地存储恢复答题进度（断点续答）
   * @returns 是否成功恢复了进度
   */
  function loadProgress(): boolean {
    try {
      const raw = uni.getStorageSync(STORAGE_KEY)
      if (!raw) return false

      const data: SavedProgress = JSON.parse(raw as string)

      // 基本数据校验
      if (
        !data.answers ||
        !Array.isArray(data.answers) ||
        data.answers.length === 0 ||
        data.currentQuestionIndex < 0 ||
        data.currentQuestionIndex >= questions.value.length
      ) {
        return false
      }

      // 恢复状态
      currentQuestionIndex.value = data.currentQuestionIndex
      answers.value = data.answers
      startTime.value = data.startTime || Date.now()
      lastActiveTime.value = data.lastActiveTime || Date.now()
      isTimedMode.value = data.isTimedMode ?? false
      isCompleted.value = false
      isChapterTransition.value = false

      // 从当前题目恢复章节编号
      const currentQ = questions.value[currentQuestionIndex.value]
      if (currentQ) {
        currentChapter.value = parseInt(currentQ.chapterId.replace('ch', ''), 10)
      }

      return true
    } catch (e) {
      console.error('[useTestEngine] 恢复进度失败:', e)
      return false
    }
  }

  /**
   * 检查是否存在可恢复的进度
   * @returns 是否存在有效存档
   */
  function hasSavedProgress(): boolean {
    try {
      const raw = uni.getStorageSync(STORAGE_KEY)
      if (!raw) return false
      const data = JSON.parse(raw as string)
      return !!(data && Array.isArray(data.answers) && data.answers.length > 0)
    } catch {
      return false
    }
  }

  /**
   * 清除本地存储的进度
   */
  function clearSavedProgress(): void {
    try {
      uni.removeStorageSync(STORAGE_KEY)
    } catch (e) {
      console.error('[useTestEngine] 清除进度失败:', e)
    }
  }

  /**
   * 计算最终测试结果
   *
   * 将全部答案传给计分引擎，得到人格类型、维度得分、百分比等。
   * 需在测试完成后（isCompleted === true）调用。
   *
   * @returns 计分结果对象
   */
  function getResult() {
    scoring.computeResult(answers.value, questions.value)

    return {
      type: scoring.resultType.value,
      scores: scoring.scores.value,
      rawScores: scoring.rawScores.value,
      percentages: scoring.percentages.value,
      personalityData: scoring.getPersonalityData(),
      freeReport: scoring.getFreeReport(),
      duration: Math.round((Date.now() - startTime.value) / 1000),
      totalQuestions: totalQuestions.value,
      answeredCount: answers.value.length,
    }
  }

  /**
   * 重置测试（清除所有状态和存储）
   */
  function resetTest(): void {
    currentQuestionIndex.value = 0
    currentChapter.value = 1
    answers.value = []
    isChapterTransition.value = false
    isCompleted.value = false
    isTimedMode.value = false
    startTime.value = 0
    lastActiveTime.value = 0
    scoring.resetScoring()
    clearSavedProgress()
  }

  return {
    // 数据
    questions,
    chaptersList,
    // 响应式状态
    currentQuestionIndex,
    currentChapter,
    answers,
    isChapterTransition,
    isCompleted,
    isTimedMode,
    startTime,
    lastActiveTime,
    // 计算属性
    currentQuestion,
    totalQuestions,
    progress,
    chapterProgress,
    currentChapterName,
    questionNumberInChapter,
    remainingQuestions,
    isCurrentAnswered,
    // 方法
    startTest,
    selectOption,
    confirmChapterTransition,
    goToQuestion,
    saveProgress,
    loadProgress,
    hasSavedProgress,
    clearSavedProgress,
    getResult,
    resetTest,
    // 计分引擎（可直接访问）
    scoring,
  }
}
