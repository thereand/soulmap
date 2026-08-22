/**
 * 灵魂星图 - 契合度算法
 *
 * 融合三个维度：
 *  1. 维度距离分：同/异倾向的加权得分
 *  2. 类型匹配表：使用 personalityTypes 中的 compatibleTypes / conflictTypes 修正
 *  3. 互补维度加成：如 E+I、T+F 互补加分
 *
 * 输入：
 *  - typeA / typeB：MBTI 代码
 *  - scoresA / scoresB（可选）：DimensionScores，用于更精细的距离计算；缺省则从代码推导
 *
 * 输出：CompatibilityResult
 */

import { personalityTypes } from '@/data/results/types'

export interface CompatibilityDimensions {
  EI: number
  SN: number
  TF: number
  JP: number
}

export interface CompatibilityResult {
  /** 0~100 整体契合度 */
  overallScore: number
  /** 关系标签 */
  relationLabel: string
  /** 一句话概述 */
  summary: string
  /** 四维度和谐度（0~100） */
  dimensionHarmony: CompatibilityDimensions
  /** 是否互补（值越大越互补） */
  complementarityBonus: number
  /** 匹配表加成 */
  matchTableBonus: number
}

/** MBTI 代码转维度得分（每个字符 20/80） */
export function codeToScores(code: string): CompatibilityDimensions {
  const [c0, c1, c2, c3] = code.toUpperCase().split('')
  return {
    EI: c0 === 'E' ? 80 : 20,
    SN: c1 === 'S' ? 80 : 20,
    TF: c2 === 'T' ? 80 : 20,
    JP: c3 === 'J' ? 80 : 20,
  }
}

/** 关系标签映射 */
export function relationLabelOf(score: number): string {
  if (score >= 80) return '天作之合'
  if (score >= 60) return '灵魂知己'
  if (score >= 40) return '欢喜冤家'
  return '平行宇宙'
}

/** 一句话概述模板 */
function summaryOf(score: number, labelA: string, labelB: string): string {
  if (score >= 80) return `${labelA} 与 ${labelB} 的相遇像星轨恰到好处的交叠，彼此点亮。`
  if (score >= 60) return `${labelA} 与 ${labelB} 心有灵犀，能理解彼此没说出口的部分。`
  if (score >= 40) return `${labelA} 与 ${labelB} 常在小事上碰撞，却也因此磨出彼此的光。`
  return `${labelA} 与 ${labelB} 像两条独立星轨，需要更多耐心才能听懂对方的语言。`
}

/**
 * 计算契合度
 */
export function calculateCompatibility(
  typeA: string,
  typeB: string,
  scoresA?: CompatibilityDimensions,
  scoresB?: CompatibilityDimensions,
): CompatibilityResult {
  const tA = (typeA || 'INFP').toUpperCase()
  const tB = (typeB || 'INFP').toUpperCase()

  const sA = scoresA || codeToScores(tA)
  const sB = scoresB || codeToScores(tB)

  // 1. 维度和谐度（100 - |sa - sb| 的加权归一化）
  const harmony: CompatibilityDimensions = {
    EI: 100 - Math.abs(sA.EI - sB.EI),
    SN: 100 - Math.abs(sA.SN - sB.SN),
    TF: 100 - Math.abs(sA.TF - sB.TF),
    JP: 100 - Math.abs(sA.JP - sB.JP),
  }

  // 维度基础分：SN/JP 更相似 = 更契合（认知/生活方式），EI/TF 差异过大反而略扣分但适度互补加分
  // 采用加权平均：SN 权重 0.3，JP 权重 0.2，EI 权重 0.2，TF 权重 0.3
  const baseScore =
    harmony.EI * 0.2 + harmony.SN * 0.3 + harmony.TF * 0.3 + harmony.JP * 0.2

  // 2. 互补维度加分：E-I 和 T-F 互补时加分
  let complementarityBonus = 0
  if (tA[0] !== tB[0]) complementarityBonus += 4  // E-I 互补
  if (tA[2] !== tB[2]) complementarityBonus += 4  // T-F 互补
  // S-N 互补分较少，反而降低
  if (tA[1] !== tB[1]) complementarityBonus -= 2

  // 3. 匹配表修正
  let matchTableBonus = 0
  const dataA = personalityTypes[tA]
  const dataB = personalityTypes[tB]
  if (dataA?.compatibleTypes?.includes(tB)) matchTableBonus += 10
  if (dataA?.conflictTypes?.includes(tB)) matchTableBonus -= 12
  if (dataB?.compatibleTypes?.includes(tA)) matchTableBonus += 6
  if (dataB?.conflictTypes?.includes(tA)) matchTableBonus -= 8

  // 相同类型：极佳同频（+5）
  if (tA === tB) matchTableBonus += 5

  let finalScore = baseScore + complementarityBonus + matchTableBonus
  finalScore = Math.max(20, Math.min(98, Math.round(finalScore)))

  const nameA = dataA?.name || tA
  const nameB = dataB?.name || tB

  return {
    overallScore: finalScore,
    relationLabel: relationLabelOf(finalScore),
    summary: summaryOf(finalScore, nameA, nameB),
    dimensionHarmony: harmony,
    complementarityBonus,
    matchTableBonus,
  }
}

/**
 * 生成规范化的配对 key（用于查表 pairKey，如 'INTJ_ENFP'）
 * 保证对称，即 A_B 与 B_A 得到同一 key
 */
export function pairKey(typeA: string, typeB: string): string {
  const [a, b] = [typeA.toUpperCase(), typeB.toUpperCase()].sort()
  return `${a}_${b}`
}
