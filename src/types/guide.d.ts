/**
 * 人格星图 — 星灵向导系统类型定义
 *
 * 包含向导亲和度、星座、星灵组合等类型。
 * 与 test.d.ts 中的 MBTI 类型系统平行，构成双轨评分体系。
 */

/** 四位星灵向导 ID */
type GuideId = 'flame' | 'abyss' | 'forest' | 'star'

/** 选项的向导亲和度权重 */
interface GuideAffinityWeights {
  flame?: number
  abyss?: number
  forest?: number
  star?: number
}

/** 向导亲和度累计得分（带符号，越高越强） */
interface GuideAffinityScores {
  flame: number
  abyss: number
  forest: number
  star: number
}

/** 向导基础定义 */
interface GuideDefinition {
  id: GuideId
  name: string
  emoji: string
  color: string
  colorLight: string
  trait: string
  description: string
  /** 向导说话风格关键词 */
  speakStyle: string
  /** 核心哲学 */
  philosophy: string
}

/** 星灵组合类型标签 */
type ComboType = 'single' | 'dual' | 'triple' | 'quad'

/** 星灵组合定义（共 15 种） */
interface GuideCombination {
  /** 组合唯一 ID */
  id: string
  /** 组合名称（如「双星共鸣」「万象星灵」） */
  name: string
  /** 组合包含的向导 ID（按亲和度排序） */
  guides: GuideId[]
  /** 组合类型 */
  type: ComboType
  /** 核心特质描述 */
  coreTraits: string[]
  /** 详细解读（~200 字） */
  description: string
  /** 与 MBTI 的交叉说明 */
  mbtiNote: string
}

/** 星座元素 */
type ZodiacElement = 'fire' | 'earth' | 'air' | 'water'

/** 星座定义 */
interface ZodiacSign {
  id: string
  name: string
  symbol: string
  dateRange: string
  element: ZodiacElement
  elementName: string
  /** 核心性格关键词 */
  coreTraits: string[]
  strengths: string[]
  weaknesses: string[]
  /** 性格简述（~50 字） */
  description: string
  /** 该星座常见的 MBTI 类型 */
  commonTypes: string[]
  /** 星座的 MBTI 维度倾向（-2~+2） */
  dimensionTendency: {
    EI: number
    SN: number
    TF: number
    JP: number
  }
}

/** 向导叙事叠加层（每章每向导一段） */
interface GuideOverlayData {
  chapterId: string
  guideId: GuideId
  /** 叠加叙事文本（~100-200 字） */
  text: string
  /** 叠加叙事出现的时机（在章节第几题之后，0 = 章节开头） */
  afterQuestion: number
}

/** 向导即时反应（每题每向导一条） */
interface GuideReactionData {
  questionId: string
  guideId: GuideId
  /** 反应文本（~15-30 字） */
  text: string
}

/** 向导对话互动选项 */
interface GuideDialogueOption {
  text: string
  /** 选择后增加的向导亲和度 */
  guideBonus: GuideAffinityWeights
}

/** 向导对话互动（章节关键节点触发） */
interface GuideDialogueData {
  chapterId: string
  guideId: GuideId
  /** 向导发起对话的台词 */
  prompt: string
  /** 用户可选的回应 */
  options: GuideDialogueOption[]
}

/** 星座融合解读模式 */
type ZodiacInterpretationMode = 'resonance' | 'contrast' | 'complementary'

export type {
  GuideId,
  GuideAffinityWeights,
  GuideAffinityScores,
  GuideDefinition,
  ComboType,
  GuideCombination,
  ZodiacElement,
  ZodiacSign,
  GuideOverlayData,
  GuideReactionData,
  GuideDialogueOption,
  GuideDialogueData,
  ZodiacInterpretationMode,
}
