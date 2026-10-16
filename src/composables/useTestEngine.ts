/**
 * 人格星图 - 测试流程引擎组合式函数
 *
 * 管理完整的 36 题答题流程，包括：
 * - 题目加载与导航
 * - 章节推进与过场动画标志
 * - 严格校验的断点续答与会话检查点
 * - 测试完成判断与结果计算
 */
import { ref, computed } from 'vue'
import type { TestQuestion, Chapter } from '@/types/test'
import { soulmapMainQuestions } from '@/data/questions/soulmap-main'
import { soulmapTrialQuestions } from '@/data/questions/soulmap-trial'
import { soulmapSupplementQuestions } from '@/data/questions/soulmap-supplement'
import { chapters as chapterData } from '@/data/chapters'
import { useScoring, type AnswerRecord } from './useScoring'
import { useGuideScoring } from './useGuideScoring'
import type { GuideId } from '@/types/guide'
import { guideReactions } from '@/data/guide-reactions'
import { guideOverlays } from '@/data/guide-overlays'
import { guideDialogues } from '@/data/guide-dialogues'
import { assembleJourneyStory } from '@/data/journey-narratives'
import { getStrongestGuideReaction } from '@/utils/scoring'

/** 本地存储键名（不操作结果或历史存储） */
const STORAGE_KEY = 'SOULMAP_TEST_PROGRESS'
const CLOCK_TOLERANCE = 5 * 60 * 1000
let activeTestId = ''
let sessionSequence = 0

type DialogueIdentity = { chapterId: string; guideId: GuideId }
type DialogueChoice = DialogueIdentity & { optionIndex: number }

interface SavedProgress {
  version: 2
  completed: boolean
  testId: string
  resultId: string
  completedAt: string
  currentQuestionIndex: number
  answers: AnswerRecord[]
  startTime: number
  lastActiveTime: number
  mode: 'normal' | 'timed'
  isTimedMode: boolean
  activeDialogue: DialogueIdentity | null
  dialogueChoices: DialogueChoice[]
}

export interface SavedProgressInspection {
  status: 'none' | 'unfinished' | 'completed' | 'invalid'
  answeredCount: number
  totalQuestions: number
  version?: 1 | 2
  testId?: string
  resultId?: string
  completedAt?: string
  firstUnansweredIndex?: number
  startTime?: number
  lastActiveTime?: number
  isTimedMode?: boolean
  activeDialogue?: DialogueIdentity | null
}

interface ValidatedProgress {
  data: SavedProgress
  legacy: boolean
  firstUnansweredIndex: number
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function newSessionId(): string {
  return `test_${Date.now()}_${++sessionSequence}_${Math.random().toString(36).slice(2)}`
}

/** 同一运行时撤销旧实例；存储指纹同时保护旧档迁移及首次写入重试。 */
function storageToken(raw: unknown): string | undefined {
  if (raw === '' || raw === null || raw === undefined) return undefined
  return typeof raw === 'string' ? raw : JSON.stringify(raw)
}

export function useTestEngine() {
  /* ===== 题目与章节数据（只读） ===== */

  /** 全部 36 道题目（主线 25 + 试炼 6 + 补充 5） */
  const allQuestions = [
    ...soulmapMainQuestions,
    ...soulmapTrialQuestions,
    ...soulmapSupplementQuestions,
  ]

  /** 按章节顺序排列的题目列表 */
  const orderedQuestions = computed<TestQuestion[]>(() => {
    const chapterOrder = chapterData.map((c) => c.id)
    return [...allQuestions].sort((a, b) => {
      const aChIdx = chapterOrder.indexOf(a.chapterId)
      const bChIdx = chapterOrder.indexOf(b.chapterId)
      if (aChIdx !== bChIdx) return aChIdx - bChIdx
      return a.order - b.order
    })
  })

  const questions = ref<TestQuestion[]>(orderedQuestions.value)

  /** 全部章节配置 */
  const chaptersList = ref<Chapter[]>(chapterData)

  /* ===== 响应式状态 ===== */

  /** 当前题目全局索引（0 ~ 35） */
  const currentQuestionIndex = ref(0)

  /** 保持旧 API：chID 后缀数字，而非章节配置 order。 */
  const currentChapter = ref(1)
  const currentChapterOrder = computed(() =>
    chaptersList.value.find((c) => c.id === `ch${currentChapter.value}`)?.order ?? 0,
  )
  const transitionFromChapterId = ref<string | null>(null)

  /** 已答题记录 */
  const answers = ref<AnswerRecord[]>([])

  /** 是否正在播放章节过场动画 */
  const isChapterTransition = ref(false)

  /** 仅在完成检查点持久化后发布完成，避免同步 watcher 先清档。 */
  const isCompleted = ref(false)
  const testId = ref('')
  const resultId = ref('')
  const completedAt = ref('')
  let completionRecorded = false
  let completionPersisted = false
  let completionMetadata: { completedAt: string; resultId: string } | null = null
  let sessionWritable = false
  let sessionRetired = false
  let pendingStorageClaim = false
  let expectedStorageToken: string | undefined

  /** 是否为限时模式 */
  const isTimedMode = ref(false)

  /** 测试开始时间戳 */
  const startTime = ref(0)

  /** 最近一次操作时间戳 */
  const lastActiveTime = ref(0)

  /** 计分引擎实例 */
  const scoring = useScoring()

  /** 向导评分引擎实例 */
  const guideScoring = useGuideScoring()

  /** 当前题目的即时反应文本 */
  const currentReaction = ref<string>('')

  /** 当前章节的主导向导 */
  const currentDominantGuide = computed(() => guideScoring.dominantGuide.value)

  /** 向导对话互动状态 */
  const activeDialogue = ref<typeof guideDialogues[0] | null>(null)
  const isDialogueActive = ref(false)

  /** 人格共鸣动画状态 */
  const resonanceGuide = ref<GuideId | null>(null)
  const showResonance = ref(false)

  /** 每章向导亲和度快照（用于共鸣检测） */
  const chapterGuideSnapshots = ref<Record<string, Record<GuideId, number>>>({})

  /** 对话选择记录（用于旅程故事及重放实时 bonus） */
  const dialogueChoices = ref<DialogueChoice[]>([])

  /** 向导小剧场彩蛋状态 */
  const miniTheaterGuide = ref<GuideId | null>(null)
  const showMiniTheater = ref(false)
  const consecutiveGuideCount = ref(0)
  const lastConsecutiveGuide = ref<GuideId | null>(null)

  /* ===== 计算属性 ===== */

  /** 当前题目对象 */
  const currentQuestion = computed<TestQuestion | null>(() => {
    const idx = currentQuestionIndex.value
    if (idx < 0 || idx >= questions.value.length) return null
    return questions.value[idx] ?? null
  })

  /** 总题数 */
  const totalQuestions = computed(() => questions.value.length)

  /** 所有进度和完成判断共用实际题库的唯一合法答案覆盖。 */
  const validAnswers = computed(() => validateAnswers(answers.value) ?? [])

  /** 全局答题进度百分比（0 ~ 100） */
  const progress = computed(() => {
    const total = totalQuestions.value
    return total ? Math.round((validAnswers.value.length / total) * 100) : 0
  })

  /** 当前章节真实已答比例，不将当前题/章节编号充当已答。 */
  const chapterProgress = computed(() => {
    const chapterQuestions = questions.value.filter((q) => q.chapterId === `ch${currentChapter.value}`)
    const answeredIds = new Set(validAnswers.value.map((a) => a.questionId))
    return chapterQuestions.length
      ? Math.round(chapterQuestions.filter((q) => answeredIds.has(q.id)).length / chapterQuestions.length * 100)
      : 0
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
  const remainingQuestions = computed(() => totalQuestions.value - validAnswers.value.length)

  /** 当前题目是否已回答 */
  const isCurrentAnswered = computed(() => {
    const q = currentQuestion.value
    return !!q && validAnswers.value.some((a) => a.questionId === q.id)
  })

  /* ===== 校验与会话工具 ===== */

  /** 不接受数字字符串、重复记录、未知题目或越界选项。 */
  function validateAnswers(value: unknown): AnswerRecord[] | null {
    const list = questions.value
    const questionMap = new Map(list.map((q) => [q.id, q]))
    if (list.length !== 36 || questionMap.size !== 36 ||
      !Array.from({ length: 36 }, (_, i) => `q${i + 1}`).every((id) => questionMap.has(id)) ||
      !Array.isArray(value)) return null

    const byId = new Map<string, AnswerRecord>()
    for (const answer of value) {
      if (!isObject(answer) || typeof answer.questionId !== 'string') return null
      const q = questionMap.get(answer.questionId)
      if (!q || byId.has(q.id) || !Number.isInteger(answer.optionIndex) ||
        (answer.optionIndex as number) < 0 || (answer.optionIndex as number) >= q.options.length) return null
      byId.set(q.id, { questionId: q.id, optionIndex: answer.optionIndex as number })
    }
    return list.flatMap((q) => {
      const answer = byId.get(q.id)
      return answer ? [answer] : []
    })
  }

  function firstUnanswered(records: AnswerRecord[]): number {
    const ids = new Set(records.map((a) => a.questionId))
    return questions.value.findIndex((q) => !ids.has(q.id))
  }

  function validTime(value: unknown): value is number {
    return typeof value === 'number' && Number.isSafeInteger(value) &&
      value >= 946684800000 && value <= Date.now() + CLOCK_TOLERANCE
  }

  function validId(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0 && value.length <= 256
  }

  function dialogueTrigger(chapterId: string): string | undefined {
    return chapterId === 'ch3' ? 'q13' : chapterId === 'ch4' ? 'q18' : undefined
  }

  function validateDialogues(value: unknown, pending: unknown, records: AnswerRecord[]) {
    if (!Array.isArray(value)) return null
    const answeredIds = new Set(records.map((a) => a.questionId))
    const choices: DialogueChoice[] = []
    for (const choice of value) {
      if (!isObject(choice)) return null
      const dialogue = guideDialogues.find((d) => d.chapterId === choice.chapterId && d.guideId === choice.guideId)
      if (!dialogue || !answeredIds.has(dialogueTrigger(dialogue.chapterId) ?? '') ||
        !Number.isInteger(choice.optionIndex) || (choice.optionIndex as number) < 0 ||
        (choice.optionIndex as number) >= dialogue.options.length) return null
      const previous = choices.find((c) => c.chapterId === dialogue.chapterId)
      if (previous) {
        // 完全一致的旧重复选择只重放一次；冲突选择拒绝恢复。
        if (previous.guideId !== choice.guideId || previous.optionIndex !== choice.optionIndex) return null
        continue
      }
      choices.push({ chapterId: dialogue.chapterId, guideId: dialogue.guideId, optionIndex: choice.optionIndex as number })
    }

    let active: DialogueIdentity | null = null
    if (pending !== null) {
      if (!isObject(pending)) return null
      const dialogue = guideDialogues.find((d) => d.chapterId === pending.chapterId && d.guideId === pending.guideId)
      if (!dialogue || !answeredIds.has(dialogueTrigger(dialogue.chapterId) ?? '') ||
        choices.some((c) => c.chapterId === dialogue.chapterId)) return null
      active = { chapterId: dialogue.chapterId, guideId: dialogue.guideId }
    }
    return { choices, active }
  }

  /** 同一校验用于 inspect / load / save；坏 JSON 和坏对象都不删除。 */
  function validateProgress(raw: unknown): ValidatedProgress | 'none' | null {
    if (raw === '' || raw === null || raw === undefined) return 'none'
    try {
      const value: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (!isObject(value)) return null
      const legacy = value.version === undefined || value.version === 1
      if (!legacy && value.version !== 2) return null
      const records = validateAnswers(value.answers)
      const index = value.currentQuestionIndex
      if (!records || !Number.isInteger(index) || (index as number) < 0 ||
        (index as number) >= questions.value.length) return null
      const first = firstUnanswered(records)
      const completed = first === -1
      const start = legacy && value.startTime === undefined ? Date.now() : value.startTime
      const last = legacy && value.lastActiveTime === undefined ? start : value.lastActiveTime
      if (!validTime(start) || !validTime(last) || last < start) return null
      const timed = legacy && value.isTimedMode === undefined ? false : value.isTimedMode
      if (typeof timed !== 'boolean') return null
      if (!legacy && (typeof value.completed !== 'boolean' || value.completed !== completed ||
        !validId(value.testId) || !validId(value.resultId) ||
        value.mode !== (timed ? 'timed' : 'normal'))) return null

      let completion = ''
      if (!legacy) {
        if (completed) {
          if (typeof value.completedAt !== 'string') return null
          const timestamp = Date.parse(value.completedAt)
          if (!validTime(timestamp) || timestamp < start || timestamp > last ||
            new Date(timestamp).toISOString() !== value.completedAt) return null
          completion = value.completedAt
        } else if (value.completedAt !== '') return null
      }
      const dialogues = validateDialogues(
        legacy ? value.dialogueChoices ?? [] : value.dialogueChoices,
        legacy ? value.activeDialogue ?? null : value.activeDialogue,
        records,
      )
      if (!dialogues || (completed && dialogues.active)) return null
      return {
        legacy,
        firstUnansweredIndex: first,
        data: {
          version: 2, completed,
          testId: legacy ? '' : value.testId as string,
          resultId: legacy ? '' : value.resultId as string,
          completedAt: completion,
          currentQuestionIndex: index as number,
          answers: records,
          startTime: start,
          lastActiveTime: last,
          isTimedMode: timed,
          mode: timed ? 'timed' : 'normal',
          activeDialogue: dialogues.active,
          dialogueChoices: dialogues.choices,
        },
      }
    } catch {
      return null
    }
  }

  function rebuildGuideScores(): void {
    guideScoring.rebuildFromAnswers(answers.value, questions.value)
    for (const choice of dialogueChoices.value) {
      const bonus = guideDialogues.find((d) => d.chapterId === choice.chapterId && d.guideId === choice.guideId)
        ?.options[choice.optionIndex]?.guideBonus
      if (!bonus) continue
      const scores = guideScoring.rawGuideScores.value
      for (const guide of ['flame', 'abyss', 'forest', 'star'] as GuideId[]) {
        scores[guide] += bonus[guide] ?? 0
      }
    }
  }

  function resetState(): void {
    sessionWritable = false
    pendingStorageClaim = false
    expectedStorageToken = undefined
    completionRecorded = false
    completionPersisted = false
    completionMetadata = null
    currentQuestionIndex.value = 0
    currentChapter.value = Number(questions.value[0]?.chapterId.slice(2) ?? 1)
    transitionFromChapterId.value = null
    answers.value = []
    isChapterTransition.value = false
    isCompleted.value = false
    testId.value = ''
    resultId.value = ''
    completedAt.value = ''
    isTimedMode.value = false
    startTime.value = 0
    lastActiveTime.value = 0
    currentReaction.value = ''
    activeDialogue.value = null
    isDialogueActive.value = false
    resonanceGuide.value = null
    showResonance.value = false
    chapterGuideSnapshots.value = {}
    dialogueChoices.value = []
    miniTheaterGuide.value = null
    showMiniTheater.value = false
    consecutiveGuideCount.value = 0
    lastConsecutiveGuide.value = null
    scoring.resetScoring()
    guideScoring.resetGuideScoring()
  }

  /* ===== 核心方法 ===== */

  /** 显式开始新 session 可替换旧档；初始空答案也是有效 unfinished 检查点。 */
  function startTest(): boolean {
    const timed = isTimedMode.value
    resetState()
    sessionRetired = false
    testId.value = newSessionId()
    resultId.value = `result_${testId.value}`
    activeTestId = testId.value
    isTimedMode.value = timed
    startTime.value = Date.now()
    lastActiveTime.value = startTime.value
    try {
      expectedStorageToken = storageToken(uni.getStorageSync(STORAGE_KEY))
      pendingStorageClaim = true
      sessionWritable = true
      // 删除失败时仍可按刚读取的指纹安全替换，不误覆盖另一个新 session。
      try {
        uni.removeStorageSync(STORAGE_KEY)
        expectedStorageToken = undefined
      } catch (e) {
        console.error('[useTestEngine] 清除旧进度失败:', e)
      }
      return saveProgress()
    } catch (e) {
      console.error('[useTestEngine] 开始测试读取进度失败:', e)
      return false
    }
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
    if (!q || sessionRetired || !sessionWritable || completionRecorded || isCompleted.value ||
      isDialogueActive.value || isChapterTransition.value || !Number.isInteger(optionIndex) ||
      optionIndex < 0 || optionIndex >= q.options.length) return

    const existingIdx = answers.value.findIndex((a) => a.questionId === q.id)
    const records = answers.value.map((a) => ({ ...a }))
    const record: AnswerRecord = { questionId: q.id, optionIndex }
    if (existingIdx >= 0) records[existingIdx] = record
    else records.push(record)
    const validated = validateAnswers(records)
    if (!validated) return
    answers.value = validated

    // 替换答案也只重建一次，既有对话 bonus 不重复累计。
    rebuildGuideScores()
    const triggeredGuide = getStrongestGuideReaction(q, optionIndex)
    guideScoring.lastTriggeredGuide.value = triggeredGuide
    if (triggeredGuide) {
      const reaction = guideReactions.find(
        (r) => r.questionId === q.id && r.guideId === triggeredGuide,
      )
      currentReaction.value = reaction?.text ?? ''

      // 连续同一向导检测（小剧场彩蛋）
      if (triggeredGuide === lastConsecutiveGuide.value) {
        consecutiveGuideCount.value++
        if (consecutiveGuideCount.value >= 3) {
          miniTheaterGuide.value = triggeredGuide
          showMiniTheater.value = true
          consecutiveGuideCount.value = 0
          lastConsecutiveGuide.value = null
        }
      } else {
        consecutiveGuideCount.value = 1
        lastConsecutiveGuide.value = triggeredGuide
      }
    } else {
      currentReaction.value = ''
      consecutiveGuideCount.value = 0
      lastConsecutiveGuide.value = null
    }

    lastActiveTime.value = Date.now()

    // 自动前进到下一题
    advanceToNext()
  }

  /**
   * 前进到下一题（内部方法）
   * 处理章节过渡逻辑
   */
  function advanceToNext(skipDialogue = false, currentQ = currentQuestion.value): void {
    const records = validateAnswers(answers.value)
    if (!records) return
    const nextIndex = firstUnanswered(records)

    // 完成依据完整覆盖而不是 cursor；save 成功后才会发布 isCompleted。
    if (nextIndex === -1) {
      saveProgress()
      return
    }

    if (!skipDialogue && currentQ && (currentQ.id === 'q13' || currentQ.id === 'q18') &&
      !dialogueChoices.value.some((c) => c.chapterId === currentQ.chapterId)) {
      const dialogue = findDialogueForCurrentChapter(currentQ.chapterId)
      if (dialogue) {
        activeDialogue.value = dialogue
        isDialogueActive.value = true
        // 呈现对话立即保存，退出后能恢复相同向导而非重新随机/判定。
        saveProgress()
        return
      }
    }

    const nextQ = questions.value[nextIndex]
    if (currentQ && nextQ && currentQ.chapterId !== nextQ.chapterId) {
      checkSoulResonance(currentQ.chapterId)
      transitionFromChapterId.value = currentQ.chapterId
      currentChapter.value = Number(nextQ.chapterId.slice(2))
      isChapterTransition.value = true
    }
    currentQuestionIndex.value = nextIndex
    saveProgress()
  }

  /**
   * 查找当前章节的向导对话（根据主导向导）
   */
  function findDialogueForCurrentChapter(chapterId: string) {
    const guide = guideScoring.dominantGuide.value
    return guideDialogues.find(
      (d) => d.chapterId === chapterId && d.guideId === guide,
    ) ?? null
  }

  /**
   * 处理对话选择
   * UI 层在用户选择对话选项后调用
   */
  function handleDialogueSelect(optionIndex: number): void {
    const dialogue = activeDialogue.value
    if (!dialogue || !isDialogueActive.value || sessionRetired || !sessionWritable ||
      completionRecorded || isCompleted.value || !Number.isInteger(optionIndex) ||
      optionIndex < 0 || optionIndex >= dialogue.options.length) return

    const choices = [...dialogueChoices.value, {
      chapterId: dialogue.chapterId, guideId: dialogue.guideId, optionIndex,
    }]
    const validated = validateDialogues(choices, null, answers.value)
    if (!validated) return
    dialogueChoices.value = validated.choices
    rebuildGuideScores()
    activeDialogue.value = null
    isDialogueActive.value = false
    lastActiveTime.value = Math.max(Date.now(), startTime.value, lastActiveTime.value)

    // 恢复时 cursor 已是首个未答，绝不能再 +1 而跳掉 q14/q19。
    const trigger = questions.value.find((q) => q.id === dialogueTrigger(dialogue.chapterId)) ?? null
    advanceToNext(true, trigger)
  }

  /**
   * 人格共鸣检测
   * 章节结束时，检查该章节内向导亲和度增量是否达到阈值
   */
  function checkSoulResonance(chapterId: string): void {
    const current = guideScoring.rawGuideScores.value
    const snapshot = chapterGuideSnapshots.value[chapterId]

    if (!snapshot) {
      // 首次记录此章节的快照
      chapterGuideSnapshots.value[chapterId] = { ...current }
      return
    }

    // 检查哪个向导在本章获得了足够的亲和度（阈值 5+）
    const guideKeys: GuideId[] = ['flame', 'abyss', 'forest', 'star']
    for (const key of guideKeys) {
      const delta = current[key] - snapshot[key]
      if (delta >= 5) {
        resonanceGuide.value = key
        showResonance.value = true
        break // 只显示最强的一个
      }
    }

    // 更新快照
    chapterGuideSnapshots.value[chapterId] = { ...current }
  }

  /**
   * 确认人格共鸣动画已完成
   */
  function confirmResonance(): void {
    showResonance.value = false
    resonanceGuide.value = null
  }

  /**
   * 确认向导小剧场彩蛋已完成
   */
  function confirmMiniTheater(): void {
    showMiniTheater.value = false
    miniTheaterGuide.value = null
  }

  /**
   * 确认章节过场动画已完成
   * UI 层在过场动画结束后调用此方法
   */
  function confirmChapterTransition(): void {
    isChapterTransition.value = false
    transitionFromChapterId.value = null
    saveProgress()
  }

  /** 跳到合法题目索引；恢复始终忽略此回看 cursor。 */
  function goToQuestion(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= questions.value.length ||
      isCompleted.value || completionRecorded || sessionRetired || isDialogueActive.value) return
    const targetQ = questions.value[index]
    currentChapter.value = Number(targetQ.chapterId.slice(2))
    currentQuestionIndex.value = index
    isChapterTransition.value = false
    transitionFromChapterId.value = null
    saveProgress()
  }

  function ownsStorage(raw: unknown): boolean {
    if (!testId.value || activeTestId !== testId.value) return false
    const parsed = validateProgress(raw)
    if (parsed && parsed !== 'none' && !parsed.legacy && parsed.data.testId === testId.value) return true
    return pendingStorageClaim && storageToken(raw) === expectedStorageToken
  }

  /** 返回写入是否成功；完成检查点绝不降级成 unfinished。 */
  function saveProgress(): boolean {
    if (sessionRetired || !sessionWritable || !testId.value || activeTestId !== testId.value) return false
    try {
      const records = validateAnswers(answers.value)
      if (!records || !Number.isInteger(currentQuestionIndex.value) ||
        currentQuestionIndex.value < 0 || currentQuestionIndex.value >= questions.value.length ||
        !validTime(startTime.value) || !validTime(lastActiveTime.value) ||
        lastActiveTime.value < startTime.value || !validId(testId.value) ||
        (!completionMetadata && !validId(resultId.value)) || typeof isTimedMode.value !== 'boolean') return false
      const completed = firstUnanswered(records) === -1
      if ((completionRecorded || isCompleted.value) && !completed) return false
      const pending = activeDialogue.value
      const dialogues = validateDialogues(dialogueChoices.value, pending, records)
      if (!dialogues || (completed && dialogues.active)) return false
      const raw = uni.getStorageSync(STORAGE_KEY)
      if (!ownsStorage(raw)) return false
      const stored = validateProgress(raw)
      if (stored && stored !== 'none' && !stored.legacy && stored.data.completed) {
        // 同一 session 的另一个旧实例也不能更改已完成答案或完成时间。
        if (!completed || JSON.stringify(stored.data.answers) !== JSON.stringify(records) ||
          JSON.stringify(stored.data.dialogueChoices) !== JSON.stringify(dialogues.choices) ||
          stored.data.startTime !== startTime.value) return false
        completionMetadata = { completedAt: stored.data.completedAt, resultId: stored.data.resultId }
        completionRecorded = true
      }

      lastActiveTime.value = Math.max(Date.now(), startTime.value, lastActiveTime.value)
      if (completed && !completionRecorded) {
        completionMetadata = { completedAt: new Date(lastActiveTime.value).toISOString(), resultId: resultId.value }
        completionRecorded = true
      }
      if (completed && completionMetadata) {
        completedAt.value = completionMetadata.completedAt
        resultId.value = completionMetadata.resultId
      }
      const data: SavedProgress = {
        version: 2, completed,
        testId: testId.value,
        resultId: resultId.value,
        completedAt: completedAt.value,
        currentQuestionIndex: currentQuestionIndex.value,
        answers: records,
        startTime: startTime.value,
        lastActiveTime: lastActiveTime.value,
        mode: isTimedMode.value ? 'timed' : 'normal',
        isTimedMode: isTimedMode.value,
        activeDialogue: pending ? { chapterId: pending.chapterId, guideId: pending.guideId } : null,
        dialogueChoices: dialogueChoices.value,
      }
      const validated = validateProgress(data)
      if (!validated || validated === 'none') return false
      uni.setStorageSync(STORAGE_KEY, JSON.stringify(validated.data))
      pendingStorageClaim = false
      expectedStorageToken = undefined
      // 必须是最后一步：同步 watcher 此时可以安全持久化结果/ack。
      if (completed) {
        completionPersisted = true
        isCompleted.value = true
      }
      return true
    } catch (e) {
      // 不清档、不发布尚未持久化的完成；保留内存答案及旧检查点以便重试。
      console.error('[useTestEngine] 保存进度失败:', e)
      return false
    }
  }

  /** 无副作用的存档检查；completed 旧档仍可供页面辨识，但不生成新历史。 */
  function inspectSavedProgress(): SavedProgressInspection {
    const base = { answeredCount: 0, totalQuestions: totalQuestions.value }
    try {
      const parsed = validateProgress(uni.getStorageSync(STORAGE_KEY))
      if (parsed === 'none') return { ...base, status: 'none' }
      if (!parsed) return { ...base, status: 'invalid' }
      const { data, legacy, firstUnansweredIndex } = parsed
      return {
        status: data.completed ? 'completed' : 'unfinished',
        answeredCount: data.answers.length,
        totalQuestions: totalQuestions.value,
        version: legacy ? 1 : 2,
        firstUnansweredIndex,
        startTime: data.startTime,
        lastActiveTime: data.lastActiveTime,
        isTimedMode: data.isTimedMode,
        activeDialogue: data.activeDialogue,
        ...(legacy ? {} : { testId: data.testId, resultId: data.resultId, completedAt: data.completedAt }),
      }
    } catch {
      return { ...base, status: 'invalid' }
    }
  }

  /** unfinished 从第一漏题恢复；v2 completed 恢复为待保存结果状态。 */
  function loadProgress(): boolean {
    if (sessionRetired) return false
    try {
      const raw = uni.getStorageSync(STORAGE_KEY)
      const parsed = validateProgress(raw)
      if (!parsed || parsed === 'none' || (parsed.legacy && parsed.data.completed)) return false
      const { data, legacy, firstUnansweredIndex } = parsed
      resetState()
      testId.value = legacy ? newSessionId() : data.testId
      resultId.value = legacy ? `result_${testId.value}` : data.resultId
      activeTestId = testId.value
      sessionWritable = true
      pendingStorageClaim = legacy
      expectedStorageToken = legacy ? storageToken(raw) : undefined
      answers.value = data.answers
      startTime.value = data.startTime
      lastActiveTime.value = data.lastActiveTime
      isTimedMode.value = data.isTimedMode
      completedAt.value = data.completedAt
      completionRecorded = data.completed
      completionPersisted = data.completed
      completionMetadata = data.completed ? { completedAt: data.completedAt, resultId: data.resultId } : null
      dialogueChoices.value = data.dialogueChoices
      activeDialogue.value = data.activeDialogue
        ? guideDialogues.find((d) => d.chapterId === data.activeDialogue?.chapterId && d.guideId === data.activeDialogue?.guideId) ?? null
        : null
      isDialogueActive.value = activeDialogue.value !== null
      currentQuestionIndex.value = data.completed ? questions.value.length - 1 : firstUnansweredIndex
      currentChapter.value = Number(currentQuestion.value?.chapterId.slice(2) ?? 1)
      rebuildGuideScores()
      // 不保存/重播上一次过渡或共鸣动画；旧 unfinished 按存储指纹迁移。
      if (legacy) saveProgress()
      isCompleted.value = data.completed
      return true
    } catch (e) {
      console.error('[useTestEngine] 恢复进度失败:', e)
      return false
    }
  }

  function hasSavedProgress(): boolean {
    return inspectSavedProgress().status === 'unfinished'
  }

  /** 清档同时撤销本实例写入，只能删除仍属于自己的 session。 */
  function clearSavedProgress(): boolean {
    sessionWritable = false
    sessionRetired = true
    try {
      const raw = uni.getStorageSync(STORAGE_KEY)
      if (raw === '' || raw === null || raw === undefined) return true
      if (!ownsStorage(raw)) return false
      uni.removeStorageSync(STORAGE_KEY)
      return true
    } catch (e) {
      console.error('[useTestEngine] 清除进度失败:', e)
      return false
    }
  }

  /** 页面成功持久化结果后调用；失败时不要调用，以保留 completed 恢复凭据。 */
  function acknowledgeCompletion(): boolean {
    const records = validateAnswers(answers.value)
    if (!completionPersisted || !records || firstUnanswered(records) !== -1) return false
    return clearSavedProgress()
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
    const records = validateAnswers(answers.value)
    const completion = completionMetadata
    if (!isCompleted.value || !completionPersisted || !completion || !records || firstUnanswered(records) !== -1) {
      throw new Error('[useTestEngine] 测试尚未完整完成，不能生成结果')
    }
    scoring.computeResult(records, questions.value)

    // 最终 MBTI/向导算法不变；结果计算后恢复含对话 bonus 的实时评分。
    const guideResult = guideScoring.computeGuideResult(records, questions.value)
    rebuildGuideScores()

    const journeyStory = generateJourneyStory(guideResult)

    return {
      testId: testId.value,
      resultId: completion.resultId,
      completedAt: completion.completedAt,
      type: scoring.resultType.value,
      scores: scoring.scores.value,
      rawScores: scoring.rawScores.value,
      percentages: scoring.percentages.value,
      personalityData: scoring.getPersonalityData(),
      freeReport: scoring.getFreeReport(),
      duration: Math.max(0, Math.round((Date.parse(completion.completedAt) - startTime.value) / 1000)),
      totalQuestions: totalQuestions.value,
      answeredCount: records.length,
      // 向导系统结果
      guideResult,
      // 旅程故事
      journeyStory,
    }
  }

  /**
   * 生成旅程故事
   * 根据用户在旅途中的关键选择拼接叙事化解读
   */
  function generateJourneyStory(guideResult: ReturnType<typeof guideScoring.computeGuideResult>): string {
    // 开场：基于第一章的主导向导
    const ch1Guide = getChapterDominantGuide('ch1') ?? guideResult.dominantGuide

    // 中段：基于第三章的前两位向导组合
    const topTwo = guideResult.topTwo
    const midpointKey = [topTwo[0], topTwo[1]].sort().join('_')

    // 高潮：基于第四章的前两位向导组合
    const climaxKey = midpointKey // 复用相同逻辑

    // 结尾：基于最终组合 ID
    const endingComboId = guideResult.combination.id

    return assembleJourneyStory(ch1Guide, midpointKey, climaxKey, endingComboId)
  }

  /**
   * 获取某章节内的主导向问（基于该章节回答的亲和度增量）
   */
  function getChapterDominantGuide(chapterId: string): GuideId | null {
    const chapterQIds = chapterData.find(c => c.id === chapterId)?.questionIds ?? []
    const chapterAnswers = answers.value.filter(a => chapterQIds.includes(a.questionId))

    if (chapterAnswers.length === 0) return null

    const scores = { flame: 0, abyss: 0, forest: 0, star: 0 }
    for (const answer of chapterAnswers) {
      const question = questions.value.find(q => q.id === answer.questionId)
      if (!question) continue
      const option = question.options[answer.optionIndex]
      if (!option?.guides) continue
      if (option.guides.flame) scores.flame += option.guides.flame
      if (option.guides.abyss) scores.abyss += option.guides.abyss
      if (option.guides.forest) scores.forest += option.guides.forest
      if (option.guides.star) scores.star += option.guides.star
    }

    const entries = Object.entries(scores) as [GuideId, number][]
    entries.sort((a, b) => b[1] - a[1])
    return entries[0][1] > 0 ? entries[0][0] : null
  }

  /**
   * 获取当前章节的向导叙事叠加层文本
   * 根据当前主导向导返回对应的叠加叙事
   */
  function getChapterOverlay(chapterId: string): string {
    const guide = guideScoring.dominantGuide.value
    const overlay = guideOverlays.find(
      (o) => o.chapterId === chapterId && o.guideId === guide,
    )
    return overlay?.text ?? ''
  }

  /** 重置所有状态；旧实例不删除另一个已经开始的新 session。 */
  function resetTest(): void {
    if (testId.value) {
      clearSavedProgress()
    } else if (!sessionRetired) {
      // 尚未绑定 session 的显式 reset 也允许用户确认清除旧档。
      try {
        uni.removeStorageSync(STORAGE_KEY)
        activeTestId = ''
      } catch (e) {
        console.error('[useTestEngine] 重置进度失败:', e)
      }
    }
    resetState()
    sessionRetired = true
  }

  return {
    // 数据
    questions,
    chaptersList,
    // 响应式状态
    currentQuestionIndex,
    currentChapter,
    currentChapterOrder,
    transitionFromChapterId,
    answers,
    isChapterTransition,
    isCompleted,
    testId,
    resultId,
    completedAt,
    isTimedMode,
    startTime,
    lastActiveTime,
    currentReaction,
    // Phase 2 状态
    activeDialogue,
    isDialogueActive,
    dialogueChoices,
    resonanceGuide,
    showResonance,
    // Phase 3 状态
    miniTheaterGuide,
    showMiniTheater,
    // 计算属性
    currentQuestion,
    totalQuestions,
    progress,
    chapterProgress,
    currentChapterName,
    questionNumberInChapter,
    remainingQuestions,
    isCurrentAnswered,
    currentDominantGuide,
    // 方法
    startTest,
    selectOption,
    confirmChapterTransition,
    goToQuestion,
    saveProgress,
    loadProgress,
    inspectSavedProgress,
    hasSavedProgress,
    clearSavedProgress,
    acknowledgeCompletion,
    getResult,
    resetTest,
    getChapterOverlay,
    // Phase 2 方法
    handleDialogueSelect,
    confirmResonance,
    // Phase 3 方法
    confirmMiniTheater,
    // 计分引擎（可直接访问）
    scoring,
    guideScoring,
  }
}
