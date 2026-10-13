/**
 * 灵魂星图 — 向导亲和度评分组合式函数
 *
 * 封装向导系统的评分逻辑，与 useScoring（MBTI 评分）平行运行。
 * 提供响应式的向导亲和度追踪、主导向导判定和最终组合计算。
 */
import { ref, computed } from 'vue'
import type { TestQuestion } from '@/types/test'
import type { GuideAffinityScores, GuideId, GuideCombination } from '@/types/guide'
import {
  calculateGuideAffinity,
  getStrongestGuideReaction,
  normalizeGuideScores,
  type AnswerRecord,
} from '@/utils/scoring'
import {
  determineGuideCombination,
  getDominantGuide,
  getTopTwoGuides,
  guideMap,
} from '@/data/guides'
import { zodiacGuideBonus } from '@/data/zodiac'

export function useGuideScoring() {
  /* ===== 响应式状态 ===== */

  /** 向导亲和度原始累计分 */
  const rawGuideScores = ref<GuideAffinityScores>({
    flame: 0,
    abyss: 0,
    forest: 0,
    star: 0,
  })

  /** 上一次答题触发的最强向导（用于浮动文字显示） */
  const lastTriggeredGuide = ref<GuideId | null>(null)

  /* ===== 计算属性 ===== */

  /** 当前主导向导（亲和度最高） */
  const dominantGuide = computed<GuideId>(() => {
    return getDominantGuide(rawGuideScores.value)
  })

  /** 当前主导向导的定义对象 */
  const dominantGuideDef = computed(() => {
    return guideMap[dominantGuide.value] ?? null
  })

  /** 当前排名前两位的向导 */
  const topTwoGuides = computed<[GuideId, GuideId]>(() => {
    return getTopTwoGuides(rawGuideScores.value)
  })

  /** 归一化后的向导得分（0-100，用于雷达图） */
  const normalizedScores = computed<GuideAffinityScores | null>(() => {
    // 需要题目数据才能计算，外部调用时需传入
    return null
  })

  /* ===== 核心方法 ===== */

  /**
   * 根据全部答案计算向导亲和度
   * 在测试完成时调用，也可在每题回答后增量调用
   *
   * @param answers   - 全部答题记录
   * @param questions - 完整题目数据
   * @param zodiacElement - 用户选择的星座元素（可选，提供初始加成）
   */
  function computeGuideResult(
    answers: AnswerRecord[],
    questions: TestQuestion[],
    zodiacElement?: string,
  ): {
    rawScores: GuideAffinityScores
    normalized: GuideAffinityScores
    combination: GuideCombination
    dominantGuide: GuideId
    topTwo: [GuideId, GuideId]
  } {
    // 计算原始亲和度得分
    const raw = calculateGuideAffinity(answers, questions)

    // 如果有星座元素，加上初始加成
    if (zodiacElement && zodiacGuideBonus[zodiacElement]) {
      const bonus = zodiacGuideBonus[zodiacElement]
      raw.flame += bonus.flame
      raw.abyss += bonus.abyss
      raw.forest += bonus.forest
      raw.star += bonus.star
    }

    rawGuideScores.value = raw

    // 归一化
    const normalized = normalizeGuideScores(raw, questions)

    // 判定组合
    const combination = determineGuideCombination(raw)

    // 主导向导
    const dominant = getDominantGuide(raw)
    const topTwo = getTopTwoGuides(raw)

    return {
      rawScores: raw,
      normalized,
      combination,
      dominantGuide: dominant,
      topTwo,
    }
  }

  /**
   * 增量更新：记录一次选项的向导亲和度
   * 在用户每次选择选项时调用
   *
   * @param question    - 当前题目
   * @param optionIndex - 选择的选项索引
   * @returns 触发的最强向导 ID（用于显示即时反应），如无则返回 null
   */
  function recordAnswer(
    question: TestQuestion,
    optionIndex: number,
  ): GuideId | null {
    const option = question.options[optionIndex]
    if (!option?.guides) {
      lastTriggeredGuide.value = null
      return null
    }

    // 累加到原始分
    const g = option.guides
    if (g.flame) rawGuideScores.value.flame += g.flame
    if (g.abyss) rawGuideScores.value.abyss += g.abyss
    if (g.forest) rawGuideScores.value.forest += g.forest
    if (g.star) rawGuideScores.value.star += g.star

    // 计算最强反应的向导
    const triggered = getStrongestGuideReaction(question, optionIndex)
    lastTriggeredGuide.value = triggered

    return triggered
  }

  /**
   * 重置向导评分状态
   */
  function resetGuideScoring(): void {
    rawGuideScores.value = { flame: 0, abyss: 0, forest: 0, star: 0 }
    lastTriggeredGuide.value = null
  }

  /**
   * 从已保存的答案重建向导评分
   * 用于断点续答时恢复向导亲和度
   *
   * @param answers   - 已保存的答案
   * @param questions - 完整题目数据
   */
  function rebuildFromAnswers(
    answers: AnswerRecord[],
    questions: TestQuestion[],
  ): void {
    rawGuideScores.value = calculateGuideAffinity(answers, questions)
  }

  return {
    // 状态
    rawGuideScores,
    lastTriggeredGuide,
    // 计算属性
    dominantGuide,
    dominantGuideDef,
    topTwoGuides,
    // 方法
    computeGuideResult,
    recordAnswer,
    resetGuideScoring,
    rebuildFromAnswers,
  }
}
