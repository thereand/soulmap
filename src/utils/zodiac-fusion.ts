/**
 * 灵魂星图 — 星座×MBTI 融合解读工具
 *
 * 根据用户的星座与 MBTI 类型，生成个性化的融合解读，
 * 包括共鸣/反差/互补模式判断、解读文本、星座加成特质和隐藏面。
 */
import { zodiacMap, calculateZodiacMatch } from '@/data/zodiac'
import { zodiacInterpretations } from '@/data/zodiac-interpretations'
import type { ZodiacInterpretationMode } from '@/types/guide'
import type { MBTIType } from '@/types/test'

// ─────────────────────────────────────────────────────
// 隐藏面文本（每个星座一条，与用户类型形成反差提示）
// ─────────────────────────────────────────────────────
const hiddenSideMap: Record<string, string> = {
  aries: '也许偶尔尝试一些即兴的冒险，会让你发现新的自己',
  taurus: '你的内在可能比外表看起来更加灵活和随性',
  gemini: '你内心深处有一个渴望安定和深度的声音，不妨听听它',
  cancer: '偶尔放下对别人的照顾，把温柔留给自己，你会发现更强大的自己',
  leo: '你心里住着一个不需要观众的演员——独处时的你，反而最真实',
  virgo: '有时候允许自己"差不多就好"，反而能释放出意想不到的创造力',
  libra: '试着在不需要任何人赞同的情况下做出一个决定，那种自由感会让你惊喜',
  scorpio: '允许自己偶尔展示脆弱，你会发现真实比神秘更有力量',
  sagittarius: '在某个安静的角落停下来，你会发现内心深处有一片比远方更辽阔的风景',
  capricorn: '你心里有一个被你压抑了很久的浪漫主义者，偶尔让它出来透透气',
  aquarius: '在你超前的思维背后，有一份对传统的隐秘眷恋，那不是软弱，而是根',
  pisces: '你比自己以为的更坚强——把那份温柔的坚定用在自己身上，会发生奇妙的变化',
}

// ─────────────────────────────────────────────────────
// 星座加成特质映射：元素 × MBTI 首字母维度
// ─────────────────────────────────────────────────────
const boostMap: Record<string, Record<string, string[]>> = {
  fire: {
    E: ['领导力加成', '感染力'],
    I: ['内在热情', '隐藏的行动力'],
    N: ['战略眼光', '灵感爆发力'],
    S: ['实干型勇气', '即时行动力'],
    T: ['决断力加成', '理性中的冲劲'],
    F: ['热血共情力', '仗义之心'],
    J: ['有纪律的冲劲', '目标导向行动力'],
    P: ['即兴爆发力', '灵活应变力'],
  },
  water: {
    F: ['共情力加成', '直觉敏锐'],
    T: ['冷静中的温柔', '隐藏的感性面'],
    E: ['情感表达力', '温暖的感染力'],
    I: ['深度感知力', '内在智慧'],
    N: ['灵性直觉', '想象力加成'],
    S: ['细腻的观察力', '情感记忆'],
    J: ['有边界感的温柔', '深层的责任心'],
    P: ['流动的情感', '随性的浪漫'],
  },
  earth: {
    S: ['执行力加成', '稳重可靠'],
    N: ['踏实的想象力', '接地气的创造力'],
    E: ['务实的社交力', '可靠的领导气质'],
    I: ['深度专注力', '沉稳的内在力量'],
    T: ['理性规划力', '冷静的判断力'],
    F: ['温暖的责任感', '踏实的关怀力'],
    J: ['超强执行力', '系统化行动力'],
    P: ['灵活的务实主义', '随遇而安的稳重'],
  },
  air: {
    N: ['思维敏捷加成', '灵感不断'],
    S: ['清晰的表达力', '理性中的灵活'],
    E: ['社交智慧', '思想传播力'],
    I: ['独立思考力', '深度思辨'],
    T: ['逻辑清晰度', '客观分析力'],
    F: ['理性中的温度', '共情的洞察力'],
    J: ['有条理的创新', '结构化的思维'],
    P: ['天马行空的灵感', '跨界的联想力'],
  },
}

// ─────────────────────────────────────────────────────
// 模式名称映射
// ─────────────────────────────────────────────────────
const modeNameMap: Record<ZodiacInterpretationMode, string> = {
  resonance: '共鸣',
  contrast: '反差',
  complementary: '互补',
}

// ─────────────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────────────

/**
 * 根据维度倾向判断用户的 MBTI 字母与星座倾向的对齐数量。
 * dimensionTendency 的值为正代表第一个字母倾向，负代表第二个字母倾向，0 为中性。
 * 例如 EI=2 代表强烈倾向 E，TF=-1 代表轻微倾向 F。
 */
function countDimensionAlignments(zodiacId: string, mbtiType: string): number {
  const zodiac = zodiacMap[zodiacId]
  if (!zodiac) return 0

  const { dimensionTendency } = zodiac
  const dimensions = [
    { key: 'EI', userLetter: mbtiType[0] },
    { key: 'SN', userLetter: mbtiType[1] },
    { key: 'TF', userLetter: mbtiType[2] },
    { key: 'JP', userLetter: mbtiType[3] },
  ] as const

  let aligned = 0
  for (const dim of dimensions) {
    const tendency = dimensionTendency[dim.key as keyof typeof dimensionTendency]
    if (tendency === 0) continue // 中性维度不计入
    // tendency > 0 → 倾向第一个字母（E/S/T/J）
    // tendency < 0 → 倾向第二个字母（I/N/F/P）
    const zodiacLetter = tendency > 0 ? dim.key[0] : dim.key[1]
    if (dim.userLetter === zodiacLetter) {
      aligned++
    }
  }
  return aligned
}

/**
 * Determine interpretation mode based on zodiac and MBTI type.
 */
export function determineZodiacMode(
  zodiacId: string,
  mbtiType: string,
): ZodiacInterpretationMode {
  const zodiac = zodiacMap[zodiacId]
  if (!zodiac) return 'complementary'

  // 若 MBTI 类型在星座常见类型列表中 → 共鸣
  if (zodiac.commonTypes.includes(mbtiType.toUpperCase())) {
    return 'resonance'
  }

  const aligned = countDimensionAlignments(zodiacId, mbtiType)

  if (aligned >= 3) return 'resonance'
  if (aligned <= 1) return 'contrast'
  return 'complementary'
}

/**
 * Get zodiac-boosted traits (2-3 keywords the zodiac adds to the MBTI).
 */
export function getZodiacBoosts(zodiacId: string, mbtiType: string): string[] {
  const zodiac = zodiacMap[zodiacId]
  if (!zodiac) return []

  const element = zodiac.element
  const elementBoosts = boostMap[element]
  if (!elementBoosts) return []

  const traits: string[] = []
  const seen = new Set<string>()

  // 根据 EI 维度（首字母）取主特质
  const eiLetter = mbtiType[0]
  if (elementBoosts[eiLetter]) {
    elementBoosts[eiLetter].forEach((t) => {
      if (!seen.has(t)) {
        seen.add(t)
        traits.push(t)
      }
    })
  }

  // 根据 TF 维度补充一条（若存在）
  const tfLetter = mbtiType[2]
  if (elementBoosts[tfLetter]) {
    for (const t of elementBoosts[tfLetter]) {
      if (!seen.has(t) && traits.length < 3) {
        seen.add(t)
        traits.push(t)
      }
    }
  }

  // 兜底：保证至少 2 条
  if (traits.length < 2) {
    for (const letters of Object.values(elementBoosts)) {
      for (const t of letters) {
        if (!seen.has(t) && traits.length < 2) {
          seen.add(t)
          traits.push(t)
        }
      }
    }
  }

  return traits.slice(0, 3)
}

/**
 * Get the user's hidden zodiac side.
 */
export function getZodiacHiddenSide(zodiacId: string, _mbtiType: string): string {
  return hiddenSideMap[zodiacId] ?? '你的星座背后，还有一面等待被发现的自己'
}

/**
 * Get the fusion interpretation text and full result object.
 */
export function getZodiacInterpretation(
  zodiacId: string,
  mbtiType: string,
): {
  mode: ZodiacInterpretationMode
  modeName: string
  text: string
  matchScore: number
  zodiacBoosts: string[]
  hiddenSide: string
} {
  const mode = determineZodiacMode(zodiacId, mbtiType)
  const modeName = modeNameMap[mode]

  // 获取解读文本数组，按 MBTI 类型哈希选一条
  const texts = zodiacInterpretations[zodiacId]?.[mode] ?? []
  const textIndex = texts.length > 0
    ? mbtiType.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0) % texts.length
    : 0
  const text = texts[textIndex] ?? `你的${zodiacId}星座与${mbtiType}型人格形成了独特的共鸣模式，这让你的灵魂图谱别具一格。`

  // 匹配度分数：根据模式给予合理范围
  const baseScores: Record<ZodiacInterpretationMode, [number, number]> = {
    resonance: [0.75, 0.99],
    complementary: [0.55, 0.74],
    contrast: [0.30, 0.54],
  }
  const [min, max] = baseScores[mode]
  const seed = mbtiType.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0)
  const matchScore = Math.round((min + (seed % 100) / 100 * (max - min)) * 100) / 100

  const zodiacBoosts = getZodiacBoosts(zodiacId, mbtiType)
  const hiddenSide = getZodiacHiddenSide(zodiacId, mbtiType)

  return {
    mode,
    modeName,
    text,
    matchScore,
    zodiacBoosts,
    hiddenSide,
  }
}
