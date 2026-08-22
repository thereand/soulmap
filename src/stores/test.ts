/**
 * 灵魂星图 - 测试状态 Store（Pinia）
 *
 * 管理全局测试会话状态，与 useTestEngine 组合式函数配合使用：
 * - Store 负责全局持久化状态（会话、模式、结果）
 * - useTestEngine 负责答题流程引擎（题目导航、章节推进、断点续答）
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  TestSession,
  TestQuestion,
  Chapter,
  DimensionScores,
  TestResult,
  MBTIType,
} from '@/types/test'
import { soulmapMainQuestions } from '@/data/questions/soulmap-main'
import { chapters as chapterData } from '@/data/chapters'
import {
  calculateScores,
  determineType,
  toDimensionScores,
  calculatePercentages,
} from '@/utils/scoring'

/** 测试模式 */
export type TestMode = 'adventure' | 'quick'

/** 本地存储键名 */
const STORE_CONFIG_KEY = 'SOULMAP_STORE_CONFIG'

/** 持久化配置数据结构 */
interface StoreConfig {
  testMode: TestMode
  selectedGuide: string | null
}

export const useTestStore = defineStore('test', () => {
  /* ===== State ===== */

  /** 当前测试会话 */
  const session = ref<TestSession | null>(null)

  /** 所有题目数据 */
  const questions = ref<TestQuestion[]>([])

  /** 所有章节数据 */
  const chapters = ref<Chapter[]>([])

  /** 是否正在加载题目 */
  const loadingQuestions = ref(false)

  /** 测试结果（提交后） */
  const result = ref<TestResult | null>(null)

  /** 选择的灵魂向导 ID */
  const selectedGuide = ref<string | null>(null)

  /** 当前测试唯一标识 */
  const currentTestId = ref<string | null>(null)

  /** 测试模式：冒险模式（完整动画）/ 极速模式（跳过动画） */
  const testMode = ref<TestMode>('adventure')

  /* ===== Getters ===== */

  /** 当前章节 */
  const currentChapter = computed<Chapter | null>(() => {
    if (!session.value) return null
    return chapters.value[session.value.currentChapterIndex] ?? null
  })

  /** 当前题目 */
  const currentQuestion = computed<TestQuestion | null>(() => {
    if (!session.value || !currentChapter.value) return null
    const qIds = currentChapter.value.questionIds
    const qId = qIds[session.value.currentQuestionIndex]
    return questions.value.find((q) => q.id === qId) ?? null
  })

  /** 答题总进度（0~1） */
  const progress = computed<number>(() => {
    if (!session.value || questions.value.length === 0) return 0
    return Object.keys(session.value.answers).length / questions.value.length
  })

  /** 是否正在测试中（会话存在且未提交） */
  const isActive = computed(() => session.value !== null && !session.value.submitted)

  /** 是否为冒险模式 */
  const isAdventureMode = computed(() => testMode.value === 'adventure')

  /** 是否为极速模式 */
  const isQuickMode = computed(() => testMode.value === 'quick')

  /* ===== Actions ===== */

  /**
   * 加载题目和章节数据
   */
  function loadQuestionData(): void {
    questions.value = soulmapMainQuestions
    chapters.value = chapterData
  }

  /**
   * 初始化测试会话
   * 加载题目数据并创建新的 session
   */
  async function startTest(): Promise<void> {
    loadingQuestions.value = true

    try {
      // 加载本地题目数据
      loadQuestionData()

      // 生成唯一测试 ID
      const testId = `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      currentTestId.value = testId

      // 创建新会话
      session.value = {
        sessionId: testId,
        currentChapterIndex: 0,
        currentQuestionIndex: 0,
        answers: {},
        startTime: Date.now(),
        lastActiveTime: Date.now(),
        submitted: false,
        dimensionScores: { EI: 50, SN: 50, TF: 50, JP: 50 },
      }

      console.log('[TestStore] 测试会话已创建:', testId)
    } catch (e) {
      console.error('[TestStore] 初始化测试失败:', e)
    } finally {
      loadingQuestions.value = false
    }
  }

  /**
   * 提交当前题目的答案
   * @param questionId - 题目 ID
   * @param optionId   - 选中的选项 ID 或选项 ID 数组（多选）
   */
  function submitAnswer(questionId: string, optionId: string | string[]): void {
    if (!session.value) return

    session.value.answers[questionId] = optionId
    session.value.lastActiveTime = Date.now()

    // 实时更新维度得分
    updateDimensionScores()
  }

  /**
   * 前进到下一题
   * 如果当前章节答完，自动跳转下一章节
   */
  function nextQuestion(): void {
    if (!session.value || !currentChapter.value) return

    const chapterLen = currentChapter.value.questionIds.length
    if (session.value.currentQuestionIndex < chapterLen - 1) {
      // 当前章节还有下一题
      session.value.currentQuestionIndex++
    } else if (session.value.currentChapterIndex < chapters.value.length - 1) {
      // 进入下一章节
      session.value.currentChapterIndex++
      session.value.currentQuestionIndex = 0
    }

    if (session.value) {
      session.value.lastActiveTime = Date.now()
    }
  }

  /**
   * 返回上一题
   */
  function prevQuestion(): void {
    if (!session.value) return

    if (session.value.currentQuestionIndex > 0) {
      session.value.currentQuestionIndex--
    } else if (session.value.currentChapterIndex > 0) {
      // 返回上一章节的最后一题
      session.value.currentChapterIndex--
      const prevChapter = chapters.value[session.value.currentChapterIndex]
      session.value.currentQuestionIndex = prevChapter.questionIds.length - 1
    }

    if (session.value) {
      session.value.lastActiveTime = Date.now()
    }
  }

  /**
   * 提交测试，计算最终结果
   */
  async function submitTest(): Promise<TestResult | null> {
    if (!session.value) return null

    session.value.submitted = true

    try {
      // 使用本地计分算法计算结果
      const answerRecords = Object.entries(session.value.answers).map(
        ([questionId, optionId]) => ({
          questionId,
          optionIndex: typeof optionId === 'string' ? parseInt(optionId, 10) : 0,
        }),
      )

      const rawScores = calculateScores(answerRecords, questions.value)
      const mbtiType = determineType(rawScores)
      const dimScores = toDimensionScores(rawScores, questions.value)
      const confidenceRaw = calculatePercentages(rawScores, questions.value)

      // 置信度 = 百分比 / 100
      const confidence = {
        EI: confidenceRaw.EI / 100,
        SN: confidenceRaw.SN / 100,
        TF: confidenceRaw.TF / 100,
        JP: confidenceRaw.JP / 100,
      }

      const duration = Math.round(
        (Date.now() - (session.value.startTime || Date.now())) / 1000,
      )

      const testResult: TestResult = {
        resultId: `result_${Date.now()}`,
        sessionId: session.value.sessionId,
        userId: '', // 后续从 userStore 获取
        personalityType: mbtiType,
        dimensionScores: dimScores,
        confidence,
        completedAt: Date.now(),
        duration,
        reportUnlocked: false,
      }

      result.value = testResult

      // 更新 session 中的维度得分
      session.value.dimensionScores = dimScores

      console.log('[TestStore] 测试已提交，结果类型:', mbtiType)
      return testResult
    } catch (e) {
      console.error('[TestStore] 提交失败:', e)
      session.value.submitted = false
      return null
    }
  }

  /**
   * 设置最终结果（由答题页在测试完成时调用）
   * 同时持久化一份到本地存储 SOULMAP_TEST_RESULT，用于刷新恢复
   */
  function setResult(res: TestResult): void {
    result.value = res
    try {
      uni.setStorageSync('SOULMAP_TEST_RESULT', JSON.stringify(res))
    } catch (e) {
      console.error('[TestStore] 保存结果失败:', e)
    }
  }

  /**
   * 从本地存储恢复结果（结果页首次加载或 H5 刷新时使用）
   * 兼容两种历史数据结构：
   *  1) TestResult 标准结构 { personalityType, dimensionScores, confidence, ... }
   *  2) useTestEngine.getResult() 返回的旧结构 { type, scores, percentages, ... }
   */
  function hydrateResultFromStorage(): boolean {
    if (result.value) return true
    try {
      const raw = uni.getStorageSync('SOULMAP_TEST_RESULT')
      if (!raw) return false
      const data = JSON.parse(raw as string)

      // 已经是标准 TestResult
      if (data && data.personalityType && data.confidence) {
        result.value = data as TestResult
        return true
      }

      // 兼容 engine.getResult() 的旧结构
      if (data && data.type) {
        const pct = data.percentages || { EI: 50, SN: 50, TF: 50, JP: 50 }
        const dims = data.scores || { EI: 50, SN: 50, TF: 50, JP: 50 }
        result.value = {
          resultId: `result_${Date.now()}`,
          sessionId: '',
          userId: '',
          personalityType: data.type,
          dimensionScores: dims,
          confidence: {
            EI: (pct.EI ?? 50) / 100,
            SN: (pct.SN ?? 50) / 100,
            TF: (pct.TF ?? 50) / 100,
            JP: (pct.JP ?? 50) / 100,
          },
          completedAt: Date.now(),
          duration: data.duration ?? 0,
          reportUnlocked: false,
        }
        return true
      }
      return false
    } catch (e) {
      console.error('[TestStore] 从本地存储恢复结果失败:', e)
      return false
    }
  }

  /**
   * 设置测试模式
   */
  function setTestMode(mode: TestMode): void {
    testMode.value = mode
    saveConfig()
  }

  /**
   * 设置灵魂向导
   */
  function setSelectedGuide(guideId: string | null): void {
    selectedGuide.value = guideId
    saveConfig()
  }

  /**
   * 重置测试状态
   */
  function resetTest(): void {
    session.value = null
    result.value = null
    questions.value = []
    chapters.value = []
    currentTestId.value = null
  }

  /* ===== 持久化方法 ===== */

  /**
   * 保存配置到本地存储
   */
  function saveConfig(): void {
    const config: StoreConfig = {
      testMode: testMode.value,
      selectedGuide: selectedGuide.value,
    }
    try {
      uni.setStorageSync(STORE_CONFIG_KEY, JSON.stringify(config))
    } catch (e) {
      console.error('[TestStore] 保存配置失败:', e)
    }
  }

  /**
   * 从本地存储恢复配置
   */
  function loadConfig(): void {
    try {
      const raw = uni.getStorageSync(STORE_CONFIG_KEY)
      if (!raw) return
      const config: StoreConfig = JSON.parse(raw as string)
      if (config.testMode) testMode.value = config.testMode
      if (config.selectedGuide !== undefined) selectedGuide.value = config.selectedGuide
    } catch (e) {
      console.error('[TestStore] 恢复配置失败:', e)
    }
  }

  /* ===== 内部方法 ===== */

  /**
   * 实时更新 session 中的维度得分（每次答题后调用）
   */
  function updateDimensionScores(): void {
    if (!session.value || questions.value.length === 0) return

    const answerRecords = Object.entries(session.value.answers).map(
      ([questionId, optionId]) => ({
        questionId,
        optionIndex: typeof optionId === 'string' ? parseInt(optionId, 10) : 0,
      }),
    )

    const rawScores = calculateScores(answerRecords, questions.value)
    session.value.dimensionScores = toDimensionScores(rawScores, questions.value)
  }

  // 初始化时自动加载配置
  loadConfig()

  return {
    // state
    session,
    questions,
    chapters,
    loadingQuestions,
    result,
    selectedGuide,
    currentTestId,
    testMode,
    // getters
    currentChapter,
    currentQuestion,
    progress,
    isActive,
    isAdventureMode,
    isQuickMode,
    // actions
    loadQuestionData,
    startTest,
    submitAnswer,
    nextQuestion,
    prevQuestion,
    submitTest,
    setResult,
    hydrateResultFromStorage,
    setTestMode,
    setSelectedGuide,
    resetTest,
    // 持久化
    saveConfig,
    loadConfig,
  }
})
