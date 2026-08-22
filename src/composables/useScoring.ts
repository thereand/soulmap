/**
 * 灵魂星图 - 计分组合式函数
 *
 * 将 scoring.ts 中的纯函数封装为响应式接口，
 * 方便在 Vue 组件中直接使用。
 */
import { ref, computed } from 'vue'
import type { TestQuestion, MBTIType, DimensionScores } from '@/types/test'
import {
  calculateScores,
  determineType,
  calculatePercentages,
  toDimensionScores,
  type RawDimensionScores,
} from '@/utils/scoring'
import { personalityTypes, type PersonalityTypeData } from '@/data/results/types'
import { freeReports, type FreeReport } from '@/data/results/free-reports'

/** 答题记录（与 scoring.ts 的 AnswerRecord 保持一致） */
export interface AnswerRecord {
  questionId: string
  optionIndex: number
}

/** 维度键类型 */
type DimensionKey = 'EI' | 'SN' | 'TF' | 'JP'

export function useScoring() {
  /* ===== 响应式状态 ===== */

  /** 原始累加得分（有符号，用于判定方向） */
  const rawScores = ref<RawDimensionScores>({ EI: 0, SN: 0, TF: 0, JP: 0 })

  /** 映射后的 0-100 维度得分（>50 = 首字母） */
  const scores = ref<DimensionScores>({ EI: 50, SN: 50, TF: 50, JP: 50 })

  /** 判定的人格类型代码（如 'INTJ'） */
  const resultType = ref<MBTIType | ''>('')

  /** 各维度倾向百分比（0-100，用于雷达图） */
  const percentages = ref<Record<DimensionKey, number>>({
    EI: 0,
    SN: 0,
    TF: 0,
    JP: 0,
  })

  /* ===== 计算属性 ===== */

  /** 是否已完成计分 */
  const hasResult = computed(() => resultType.value !== '')

  /** 当前人格类型详情数据（来自 personalityTypes） */
  const personalityData = computed<PersonalityTypeData | null>(() => {
    if (!resultType.value) return null
    return personalityTypes[resultType.value] ?? null
  })

  /** 当前人格的免费报告 */
  const freeReport = computed<FreeReport | null>(() => {
    if (!resultType.value) return null
    return freeReports[resultType.value] ?? null
  })

  /* ===== 方法 ===== */

  /**
   * 根据答案和题目数据计算最终结果
   *
   * 完整流程：原始累加 → 判定类型 → 计算百分比 → 映射维度得分
   *
   * @param answers  - 用户答题记录数组
   * @param questions - 完整题目数据
   */
  function computeResult(answers: AnswerRecord[], questions: TestQuestion[]): void {
    // 1. 计算原始累加得分
    rawScores.value = calculateScores(answers, questions)

    // 2. 判定人格类型
    resultType.value = determineType(rawScores.value)

    // 3. 计算各维度百分比
    percentages.value = calculatePercentages(rawScores.value, questions)

    // 4. 映射为 0-100 的 DimensionScores
    scores.value = toDimensionScores(rawScores.value, questions)
  }

  /**
   * 获取当前人格类型详情
   * @returns PersonalityTypeData 或 null（未计分时）
   */
  function getPersonalityData(): PersonalityTypeData | null {
    return personalityData.value
  }

  /**
   * 获取当前人格的免费报告
   * @returns FreeReport 或 null（未计分时）
   */
  function getFreeReport(): FreeReport | null {
    return freeReport.value
  }

  /**
   * 重置计分状态
   */
  function resetScoring(): void {
    rawScores.value = { EI: 0, SN: 0, TF: 0, JP: 0 }
    scores.value = { EI: 50, SN: 50, TF: 50, JP: 50 }
    resultType.value = ''
    percentages.value = { EI: 0, SN: 0, TF: 0, JP: 0 }
  }

  return {
    // 响应式状态
    rawScores,
    scores,
    resultType,
    percentages,
    // 计算属性
    hasResult,
    personalityData,
    freeReport,
    // 方法
    computeResult,
    getPersonalityData,
    getFreeReport,
    resetScoring,
  }
}
