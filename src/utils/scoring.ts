/**
 * 灵魂星图 - 计分算法模块
 *
 * 纯函数实现，无副作用，方便单元测试。
 *
 * 计分规则：
 * 1. 遍历所有答案，将选项的维度权重累加到对应维度
 * 2. 权重为正 → 偏向维度首字母（E / S / T / J）
 *    权重为负 → 偏向维度尾字母（I / N / F / P）
 * 3. 累加后 score > 0 → 取首字母，score ≤ 0 → 取尾字母
 * 4. 百分比 = |score| / maxPossibleScore * 100（上限 100%）
 */

import type { DimensionScores, TestQuestion, MBTIType } from '@/types/test'

/* ─────────────────────── 类型定义 ─────────────────────── */

/** 原始累加得分（带符号，0 为中点） */
export interface RawDimensionScores {
  /** E-I 原始分，正 = E，负 = I */
  EI: number
  /** S-N 原始分，正 = S，负 = N */
  SN: number
  /** T-F 原始分，正 = T，负 = F */
  TF: number
  /** J-P 原始分，正 = J，负 = P */
  JP: number
}

/** 单条答题记录 */
interface AnswerRecord {
  questionId: string
  optionIndex: number
}

/** 维度标识 */
type DimensionKey = 'EI' | 'SN' | 'TF' | 'JP'

const DIMENSION_KEYS: DimensionKey[] = ['EI', 'SN', 'TF', 'JP']

/* ─────────────────────── 核心算法 ─────────────────────── */

/**
 * 计算单题得分累加
 *
 * 遍历所有答案，找到对应题目和选项，将其权重累加到各维度。
 *
 * @param answers  - 用户答题记录数组
 * @param questions - 完整题目数据
 * @returns 四维度原始累加得分
 *
 * @example
 * // 假设有 1 道题，选项 A 权重 EI: +2，用户选了 A
 * // calculateScores([{ questionId: 'q1', optionIndex: 0 }], [q1]) → { EI: 2, SN: 0, TF: 0, JP: 0 }
 */
export function calculateScores(
  answers: AnswerRecord[],
  questions: TestQuestion[],
): RawDimensionScores {
  const scores: RawDimensionScores = { EI: 0, SN: 0, TF: 0, JP: 0 }

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId)
    if (!question) continue

    const option = question.options[answer.optionIndex]
    if (!option) continue

    const weights = option.weights
    if (weights.EI !== undefined) scores.EI += weights.EI
    if (weights.SN !== undefined) scores.SN += weights.SN
    if (weights.TF !== undefined) scores.TF += weights.TF
    if (weights.JP !== undefined) scores.JP += weights.JP
  }

  return scores
}

/**
 * 根据原始得分判定人格类型代码
 *
 * @param scores - 四维度原始累加得分
 * @returns MBTI 类型代码（如 'INTJ'）
 *
 * @example
 * // EI: 5 (E), SN: -3 (N), TF: 8 (T), JP: -2 (P) → 'ENTP'
 * // EI: -4 (I), SN: -6 (N), TF: 2 (T), JP: 7 (J) → 'INTJ'
 */
export function determineType(scores: RawDimensionScores): MBTIType {
  const ei = scores.EI > 0 ? 'E' : 'I'
  const sn = scores.SN > 0 ? 'S' : 'N'
  const tf = scores.TF > 0 ? 'T' : 'F'
  const jp = scores.JP > 0 ? 'J' : 'P'

  return `${ei}${sn}${tf}${jp}` as MBTIType
}

/**
 * 计算各维度百分比（用于雷达图展示）
 *
 * maxPossibleScore 通过遍历所有题目、取每道题各维度最大 |权重| 求和得到。
 * percentage = min(|rawScore| / maxPossibleScore * 100, 100)
 *
 * @param scores    - 四维度原始累加得分
 * @param questions - 完整题目数据（用于计算 maxPossibleScore）
 * @returns 各维度百分比（0-100）
 *
 * @example
 * // 如果 EI 维度 maxPossible = 20，实际 |EI| = 12 → 百分比 = 60%
 */
export function calculatePercentages(
  scores: RawDimensionScores,
  questions: TestQuestion[],
): Record<DimensionKey, number> {
  const maxScores = getMaxPossibleScores(questions)

  const result = {} as Record<DimensionKey, number>
  for (const key of DIMENSION_KEYS) {
    const max = maxScores[key]
    if (max === 0) {
      result[key] = 50 // 无有效题目时默认中间值
    } else {
      result[key] = Math.min(Math.round((Math.abs(scores[key]) / max) * 100), 100)
    }
  }

  return result
}

/**
 * 将原始有符号得分转换为 0-100 的 DimensionScores
 * （兼容 TestResult / TestSession 中使用的 DimensionScores 类型）
 *
 * 转换公式：mapped = 50 + (raw / maxPossible) * 50，限制在 [0, 100]
 *
 * @param scores    - 原始累加得分
 * @param questions - 完整题目数据
 * @returns 0-100 范围的 DimensionScores（>50 = 首字母）
 */
export function toDimensionScores(
  scores: RawDimensionScores,
  questions: TestQuestion[],
): DimensionScores {
  const maxScores = getMaxPossibleScores(questions)

  const map = (raw: number, max: number): number => {
    if (max === 0) return 50
    const mapped = 50 + (raw / max) * 50
    return Math.max(0, Math.min(100, Math.round(mapped)))
  }

  return {
    EI: map(scores.EI, maxScores.EI),
    SN: map(scores.SN, maxScores.SN),
    TF: map(scores.TF, maxScores.TF),
    JP: map(scores.JP, maxScores.JP),
  }
}

/**
 * 获取维度描述文本
 *
 * @param dimension - 维度标识 ('EI' | 'SN' | 'TF' | 'JP')
 * @param value     - 原始累加得分（有符号）
 * @returns 描述文本
 *
 * @example
 * // getDimensionLabel('EI', 5) → '外向 (E)'
 * // getDimensionLabel('EI', -3) → '内向 (I)'
 * // getDimensionLabel('EI', 0) → '均衡 (E/I)'
 */
export function getDimensionLabel(dimension: string, value: number): string {
  const labels: Record<string, { positive: string; negative: string; neutral: string }> = {
    EI: { positive: '外向 (E)', negative: '内向 (I)', neutral: '均衡 (E/I)' },
    SN: { positive: '感觉 (S)', negative: '直觉 (N)', neutral: '均衡 (S/N)' },
    TF: { positive: '思维 (T)', negative: '情感 (F)', neutral: '均衡 (T/F)' },
    JP: { positive: '判断 (J)', negative: '知觉 (P)', neutral: '均衡 (J/P)' },
  }

  const label = labels[dimension]
  if (!label) return dimension

  if (value > 0) return label.positive
  if (value < 0) return label.negative
  return label.neutral
}

/**
 * 计算各维度倾向强度描述
 *
 * @param percentage - 百分比值（0-100）
 * @returns 强度描述文本
 */
export function getStrengthLabel(percentage: number): string {
  if (percentage >= 80) return '非常显著'
  if (percentage >= 60) return '较为明显'
  if (percentage >= 40) return '中等倾向'
  if (percentage >= 20) return '轻微偏好'
  return '接近均衡'
}

/* ─────────────────────── 内部工具函数 ─────────────────────── */

/**
 * 计算各维度的最大可能得分
 * 遍历所有题目，取每道题每个维度中 |weight| 最大的选项值，求和
 */
function getMaxPossibleScores(
  questions: TestQuestion[],
): Record<DimensionKey, number> {
  const max: Record<DimensionKey, number> = { EI: 0, SN: 0, TF: 0, JP: 0 }

  for (const question of questions) {
    for (const key of DIMENSION_KEYS) {
      let maxWeight = 0
      for (const option of question.options) {
        const w = option.weights[key]
        if (w !== undefined && Math.abs(w) > maxWeight) {
          maxWeight = Math.abs(w)
        }
      }
      max[key] += maxWeight
    }
  }

  return max
}

/* ─────────────────────── 单元测试用例说明 ─────────────────────── */

/**
 * === 测试用例参考 ===
 *
 * describe('calculateScores', () => {
 *   it('空答案返回全零', () => {
 *     expect(calculateScores([], [])).toEqual({ EI: 0, SN: 0, TF: 0, JP: 0 })
 *   })
 *
 *   it('正确累加单题得分', () => {
 *     const q: TestQuestion = {
 *       id: 'q1', text: '测试题', chapterId: 'c1', order: 1, type: 'single',
 *       options: [
 *         { id: 'a', text: 'A', weights: { EI: 2, SN: -1 } },
 *         { id: 'b', text: 'B', weights: { EI: -2, SN: 1 } },
 *       ],
 *     }
 *     expect(calculateScores([{ questionId: 'q1', optionIndex: 0 }], [q]))
 *       .toEqual({ EI: 2, SN: -1, TF: 0, JP: 0 })
 *   })
 *
 *   it('多题多答案正确累加', () => {
 *     // q1 选 A(EI:+2), q2 选 B(TF:-3) → EI:2, TF:-3
 *   })
 *
 *   it('忽略不存在的 questionId', () => {
 *     expect(calculateScores([{ questionId: 'missing', optionIndex: 0 }], []))
 *       .toEqual({ EI: 0, SN: 0, TF: 0, JP: 0 })
 *   })
 * })
 *
 * describe('determineType', () => {
 *   it('全正 → ESTJ', () => {
 *     expect(determineType({ EI: 1, SN: 1, TF: 1, JP: 1 })).toBe('ESTJ')
 *   })
 *
 *   it('全负 → INFP', () => {
 *     expect(determineType({ EI: -1, SN: -1, TF: -1, JP: -1 })).toBe('INFP')
 *   })
 *
 *   it('零分取尾字母 → INFP', () => {
 *     expect(determineType({ EI: 0, SN: 0, TF: 0, JP: 0 })).toBe('INFP')
 *   })
 *
 *   it('混合得分 → ENTP', () => {
 *     expect(determineType({ EI: 5, SN: -3, TF: 2, JP: -1 })).toBe('ENTP')
 *   })
 * })
 *
 * describe('calculatePercentages', () => {
 *   it('maxPossible=20, |score|=12 → 60%', () => {
 *     // 构造对应 questions 数据验证
 *   })
 *
 *   it('百分比不超过 100%', () => {
 *     // |score| 大于 maxPossible 时应截断为 100
 *   })
 *
 *   it('maxPossible=0 时返回 50', () => {
 *     expect(calculatePercentages({ EI: 0, SN: 0, TF: 0, JP: 0 }, []).EI).toBe(50)
 *   })
 * })
 *
 * describe('toDimensionScores', () => {
 *   it('raw=0 时映射到 50', () => {
 *     // 所有维度 raw=0 → { EI:50, SN:50, TF:50, JP:50 }
 *   })
 *
 *   it('raw=maxPositive 时映射到 100', () => {
 *     // EI raw=20, max=20 → EI: 100
 *   })
 *
 *   it('raw=maxNegative 时映射到 0', () => {
 *     // EI raw=-20, max=20 → EI: 0
 *   })
 * })
 *
 * describe('getDimensionLabel', () => {
 *   it('正值返回首字母描述', () => {
 *     expect(getDimensionLabel('EI', 5)).toBe('外向 (E)')
 *   })
 *
 *   it('负值返回尾字母描述', () => {
 *     expect(getDimensionLabel('TF', -3)).toBe('情感 (F)')
 *   })
 *
 *   it('零值返回均衡描述', () => {
 *     expect(getDimensionLabel('JP', 0)).toBe('均衡 (J/P)')
 *   })
 * })
 */
