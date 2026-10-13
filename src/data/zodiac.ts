/**
 * 灵魂星图 — 十二星座数据
 *
 * 包含 12 星座的完整性格特质、MBTI 关联和维度倾向。
 * 用于测试前的星座选择 & 结果页的星座融合解读。
 */
import type { ZodiacSign } from '@/types/guide'

export const zodiacSigns: ZodiacSign[] = [
  {
    id: 'aries',
    name: '白羊座',
    symbol: '♈',
    dateRange: '3月21日 - 4月19日',
    element: 'fire',
    elementName: '火象',
    coreTraits: ['热情', '勇敢', '冲动', '直率', '冒险'],
    strengths: ['行动力强', '果断', '领导力'],
    weaknesses: ['缺乏耐心', '容易冲动', '过于自我'],
    description: '十二星座的开拓者，充满活力与冒险精神。热情直率，喜欢接受挑战并迅速采取行动。',
    commonTypes: ['ESTP', 'ENTJ', 'ENTP'],
    dimensionTendency: { EI: 2, SN: 1, TF: 0, JP: -1 },
  },
  {
    id: 'taurus',
    name: '金牛座',
    symbol: '♉',
    dateRange: '4月20日 - 5月20日',
    element: 'earth',
    elementName: '土象',
    coreTraits: ['务实', '稳重', '可靠', '耐心', '执拗'],
    strengths: ['耐心踏实', '忠诚可靠', '理财能力'],
    weaknesses: ['固执己见', '过于保守', '抗拒变化'],
    description: '追求稳定与安全感，是十二星座中最务实的星座。善于理财，对待亲友十分可靠。',
    commonTypes: ['ISFJ', 'ISTJ', 'ISFP'],
    dimensionTendency: { EI: -1, SN: 2, TF: -1, JP: 2 },
  },
  {
    id: 'gemini',
    name: '双子座',
    symbol: '♊',
    dateRange: '5月21日 - 6月21日',
    element: 'air',
    elementName: '风象',
    coreTraits: ['机智', '灵活', '好奇', '善变', '沟通力强'],
    strengths: ['思维敏捷', '适应力强', '善于沟通'],
    weaknesses: ['多疑善变', '注意力分散', '缺乏深度'],
    description: '具备极强的适应力与智慧，思维活跃且热爱新鲜事物。擅长社交，能言善辩。',
    commonTypes: ['ENTP', 'ESFP', 'ENFP'],
    dimensionTendency: { EI: 1, SN: -1, TF: 0, JP: -2 },
  },
  {
    id: 'cancer',
    name: '巨蟹座',
    symbol: '♋',
    dateRange: '6月22日 - 7月22日',
    element: 'water',
    elementName: '水象',
    coreTraits: ['感性', '细腻', '顾家', '关怀', '敏感'],
    strengths: ['情感丰富', '关注细节', '关爱家人'],
    weaknesses: ['过于敏感', '情绪化', '容易多疑'],
    description: '极具家庭观念与共情能力，心思细腻且关爱亲友。是十二星座中最具母性光辉的星座。',
    commonTypes: ['INFJ', 'ISFJ', 'ENFJ'],
    dimensionTendency: { EI: -1, SN: 1, TF: -2, JP: 1 },
  },
  {
    id: 'leo',
    name: '狮子座',
    symbol: '♌',
    dateRange: '7月23日 - 8月22日',
    element: 'fire',
    elementName: '火象',
    coreTraits: ['自信', '霸气', '热情', '慷慨', '领导力'],
    strengths: ['充满自信', '创造力强', '热情洋溢'],
    weaknesses: ['过于自信', '爱面子', '自我中心'],
    description: '天生具备领导才能与创造力，充满热情并渴望成为瞩目焦点。慷慨大方，喜欢帮助他人。',
    commonTypes: ['ENTJ', 'ESFP', 'ENFJ'],
    dimensionTendency: { EI: 2, SN: 0, TF: 1, JP: 1 },
  },
  {
    id: 'virgo',
    name: '处女座',
    symbol: '♍',
    dateRange: '8月23日 - 9月22日',
    element: 'earth',
    elementName: '土象',
    coreTraits: ['严谨', '细致', '完美主义', '分析力', '挑剔'],
    strengths: ['追求完美', '注重细节', '认真严谨'],
    weaknesses: ['过于挑剔', '过度批判', '过于刻板'],
    description: '做事严谨且注重规则，追求极致完美并具备批判性思维。是十二星座中最有条理的星座。',
    commonTypes: ['ISTJ', 'ESTJ', 'INTJ'],
    dimensionTendency: { EI: -1, SN: 2, TF: 2, JP: 2 },
  },
  {
    id: 'libra',
    name: '天秤座',
    symbol: '♎',
    dateRange: '9月23日 - 10月23日',
    element: 'air',
    elementName: '风象',
    coreTraits: ['平和', '优雅', '公正', '外交', '犹豫'],
    strengths: ['善于交际', '追求公平', '道德标准高'],
    weaknesses: ['犹豫不决', '失去自我', '过于圆滑'],
    description: '为人理智平和，极具道德标准且擅长协调矛盾。追求美好和谐的生活。',
    commonTypes: ['ESFJ', 'ENFJ', 'INFJ'],
    dimensionTendency: { EI: 1, SN: 0, TF: -2, JP: 0 },
  },
  {
    id: 'scorpio',
    name: '天蝎座',
    symbol: '♏',
    dateRange: '10月24日 - 11月22日',
    element: 'water',
    elementName: '水象',
    coreTraits: ['神秘', '深沉', '洞察力', '决断', '执着'],
    strengths: ['性格深沉', '洞察力强', '决断果敢'],
    weaknesses: ['过于执着', '控制欲强', '不易信任'],
    description: '性格深沉且具备敏锐的洞察力，面对困境时决断果敢。是十二星座中最具神秘感的星座。',
    commonTypes: ['INTJ', 'INFJ', 'ENTJ'],
    dimensionTendency: { EI: -2, SN: 1, TF: 1, JP: 1 },
  },
  {
    id: 'sagittarius',
    name: '射手座',
    symbol: '♐',
    dateRange: '11月23日 - 12月21日',
    element: 'fire',
    elementName: '火象',
    coreTraits: ['自由', '乐观', '冒险', '奔放', '哲学'],
    strengths: ['热爱自由', '充满活力', '乐观向上'],
    weaknesses: ['过于冒险', '缺乏责任感', '粗心大意'],
    description: '天性乐观且向往无拘无束，充满冒险精神与活力。是十二星座中最具探索精神的星座。',
    commonTypes: ['ENFP', 'ENTP', 'ENFJ'],
    dimensionTendency: { EI: 2, SN: -2, TF: 0, JP: -2 },
  },
  {
    id: 'capricorn',
    name: '摩羯座',
    symbol: '♑',
    dateRange: '12月22日 - 1月19日',
    element: 'earth',
    elementName: '土象',
    coreTraits: ['坚韧', '自律', '责任感', '务实', '沉稳'],
    strengths: ['毅力强', '责任感强', '自律性高'],
    weaknesses: ['过于严肃', '过于保守', '显得冷漠'],
    description: '具备极强的毅力与稳重特质，是十二星座中最具责任感的星座。脚踏实地，追求事业成功。',
    commonTypes: ['ISTJ', 'INTJ', 'ESTJ'],
    dimensionTendency: { EI: -2, SN: 1, TF: 1, JP: 2 },
  },
  {
    id: 'aquarius',
    name: '水瓶座',
    symbol: '♒',
    dateRange: '1月20日 - 2月18日',
    element: 'air',
    elementName: '风象',
    coreTraits: ['独立', '创新', '理性', '叛逆', '独特'],
    strengths: ['独立思考', '创新能力强', '理性客观'],
    weaknesses: ['过于疏离', '叛逆心理', '不易合作'],
    description: '最具创新精神的星座，独立思考且思维前卫。追求自由与平等，理性分析问题。',
    commonTypes: ['INTP', 'ENTP', 'INTJ'],
    dimensionTendency: { EI: -1, SN: -2, TF: 2, JP: -1 },
  },
  {
    id: 'pisces',
    name: '双鱼座',
    symbol: '♓',
    dateRange: '2月19日 - 3月20日',
    element: 'water',
    elementName: '水象',
    coreTraits: ['浪漫', '敏感', '理想主义', '同情心', '直觉'],
    strengths: ['富有同情心', '直觉强', '善解人意'],
    weaknesses: ['过于敏感', '逃避现实', '过于依赖'],
    description: '最具浪漫情怀的星座，富有同情心和想象力。善解人意，直觉敏锐，内心世界丰富。',
    commonTypes: ['INFP', 'ENFP', 'INFJ'],
    dimensionTendency: { EI: -1, SN: -1, TF: -2, JP: -1 },
  },
]

/** 按 ID 快速查找星座 */
export const zodiacMap: Record<string, ZodiacSign> = Object.fromEntries(
  zodiacSigns.map((z) => [z.id, z]),
)

/** 星座元素与向导的初始亲和度加成 */
export const zodiacGuideBonus: Record<string, { flame: number; abyss: number; forest: number; star: number }> = {
  fire:  { flame: 2, abyss: 0, forest: 0, star: 0 },
  earth: { flame: 1, abyss: 1, forest: 0, star: 0 },
  air:   { flame: 0, abyss: 0, forest: 0, star: 2 },
  water: { flame: 0, abyss: 1, forest: 1, star: 0 },
}

/**
 * 计算星座与 MBTI 类型的匹配度（0-1）
 * 用于结果页的「星座契合度」展示
 */
export function calculateZodiacMatch(
  zodiacId: string,
  mbtiType: string,
): number {
  const zodiac = zodiacMap[zodiacId]
  if (!zodiac) return 0.5

  // 如果 MBTI 类型在星座常见类型中，基础分较高
  const isCommon = zodiac.commonTypes.includes(mbtiType)
  let baseScore = isCommon ? 0.8 : 0.5

  // 根据维度倾向与 MBTI 字母的吻合度微调
  const letters = mbtiType.split('')
  const tendencies = [
    { letter: letters[0], dimension: zodiac.dimensionTendency.EI, positive: 'E' },
    { letter: letters[1], dimension: zodiac.dimensionTendency.SN, positive: 'S' },
    { letter: letters[2], dimension: zodiac.dimensionTendency.TF, positive: 'T' },
    { letter: letters[3], dimension: zodiac.dimensionTendency.JP, positive: 'J' },
  ]

  let matchCount = 0
  for (const t of tendencies) {
    const zodiacPrefersPositive = t.dimension > 0
    const zodiacPrefersNegative = t.dimension < 0
    const userIsPositive = t.letter === t.positive

    if ((zodiacPrefersPositive && userIsPositive) || (zodiacPrefersNegative && !userIsPositive)) {
      matchCount++
    }
  }

  // 每吻合一个维度 +0.05，最高 +0.2
  baseScore += matchCount * 0.05

  // 限制在 0.3 ~ 0.99 范围
  return Math.min(0.99, Math.max(0.3, baseScore))
}
