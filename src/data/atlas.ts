/**
 * 人格星图 - 星灵图鉴卡片定义
 *
 * 共 19 张卡片：
 *  - 16 张 MBTI 类型卡（稀有度与 PersonalityTypeData 一致）
 *  - 3 张特殊组合卡（万象星灵 / 任意三重 / 任意双重）
 */
import type { GuideId } from '@/types/guide'
import type { MBTIType } from '@/types/test'

/* ===== 图鉴卡片定义 ===== */

export interface AtlasCard {
  /** 卡片唯一标识 */
  id: string
  /** 星灵名称 */
  name: string
  /** 卡片类型：mbti 类型卡 | guide_combo 组合卡 */
  type: 'mbti' | 'guide_combo'
  /** MBTI 类型代码（仅 mbti 卡） */
  mbtiType?: MBTIType
  /** 星灵组合 ID（仅 guide_combo 卡） */
  comboId?: string
  /** 涉及的星灵向导 ID */
  guides: GuideId[]
  /** 稀有度 */
  rarity: 'R' | 'SR' | 'SSR'
  /** 卡片风味描述（1 行） */
  description: string
  /** 解锁条件描述 */
  unlockCondition: string
}

/* ===== 16 张 MBTI 类型卡 ===== */

const mbtiCards: AtlasCard[] = [
  /* ── SSR（3 张）── */
  {
    id: 'mbti_INTJ',
    name: '星渊策士',
    type: 'mbti',
    mbtiType: 'INTJ',
    guides: ['abyss', 'star'],
    rarity: 'SSR',
    description: '在星河深处编织未来蓝图的远见者',
    unlockCondition: '测试结果为 INTJ 时解锁',
  },
  {
    id: 'mbti_ENTJ',
    name: '天命统帅',
    type: 'mbti',
    mbtiType: 'ENTJ',
    guides: ['flame', 'abyss'],
    rarity: 'SSR',
    description: '以钢铁意志率领星舰穿越星海的征服者',
    unlockCondition: '测试结果为 ENTJ 时解锁',
  },
  {
    id: 'mbti_INFJ',
    name: '灵光预见者',
    type: 'mbti',
    mbtiType: 'INFJ',
    guides: ['abyss', 'forest'],
    rarity: 'SSR',
    description: '在寂静中倾听宇宙低语的洞察者',
    unlockCondition: '测试结果为 INFJ 时解锁',
  },

  /* ── SR（6 张）── */
  {
    id: 'mbti_INTP',
    name: '幻梦织者',
    type: 'mbti',
    mbtiType: 'INTP',
    guides: ['abyss', 'star'],
    rarity: 'SR',
    description: '用无限好奇解构宇宙规则的人格',
    unlockCondition: '测试结果为 INTP 时解锁',
  },
  {
    id: 'mbti_ENTP',
    name: '混沌智者',
    type: 'mbti',
    mbtiType: 'ENTP',
    guides: ['flame', 'star'],
    rarity: 'SR',
    description: '在混沌中发现规律的人格火花',
    unlockCondition: '测试结果为 ENTP 时解锁',
  },
  {
    id: 'mbti_INFP',
    name: '星尘诗人',
    type: 'mbti',
    mbtiType: 'INFP',
    guides: ['forest', 'star'],
    rarity: 'SR',
    description: '将星尘化作诗篇的温柔人格',
    unlockCondition: '测试结果为 INFP 时解锁',
  },
  {
    id: 'mbti_ENFJ',
    name: '曙光引路人',
    type: 'mbti',
    mbtiType: 'ENFJ',
    guides: ['flame', 'forest'],
    rarity: 'SR',
    description: '以光芒照亮他人前行之路的导师',
    unlockCondition: '测试结果为 ENFJ 时解锁',
  },
  {
    id: 'mbti_ENFP',
    name: '极光漫游者',
    type: 'mbti',
    mbtiType: 'ENFP',
    guides: ['flame', 'star'],
    rarity: 'SR',
    description: '像极光般绚烂又无法捉摸的存在',
    unlockCondition: '测试结果为 ENFP 时解锁',
  },
  {
    id: 'mbti_ISFP',
    name: '林间吟游者',
    type: 'mbti',
    mbtiType: 'ISFP',
    guides: ['forest', 'star'],
    rarity: 'SR',
    description: '在自然和美中找到人格归宿',
    unlockCondition: '测试结果为 ISFP 时解锁',
  },

  /* ── R（7 张）── */
  {
    id: 'mbti_ISTJ',
    name: '磐石守卫者',
    type: 'mbti',
    mbtiType: 'ISTJ',
    guides: ['abyss'],
    rarity: 'R',
    description: '如磐石般坚定守护秩序的人格',
    unlockCondition: '测试结果为 ISTJ 时解锁',
  },
  {
    id: 'mbti_ISFJ',
    name: '暖阳织梦人',
    type: 'mbti',
    mbtiType: 'ISFJ',
    guides: ['forest'],
    rarity: 'R',
    description: '以温暖编织安宁的港湾守护者',
    unlockCondition: '测试结果为 ISFJ 时解锁',
  },
  {
    id: 'mbti_ESTJ',
    name: '铁律执行官',
    type: 'mbti',
    mbtiType: 'ESTJ',
    guides: ['flame'],
    rarity: 'R',
    description: '以铁律和行动力推动世界运转',
    unlockCondition: '测试结果为 ESTJ 时解锁',
  },
  {
    id: 'mbti_ESFJ',
    name: '星光庇护者',
    type: 'mbti',
    mbtiType: 'ESFJ',
    guides: ['flame', 'forest'],
    rarity: 'R',
    description: '散发温暖星光庇护周围一切的人格',
    unlockCondition: '测试结果为 ESFJ 时解锁',
  },
  {
    id: 'mbti_ISTP',
    name: '寂影工匠',
    type: 'mbti',
    mbtiType: 'ISTP',
    guides: ['abyss'],
    rarity: 'R',
    description: '在沉默中以精湛技艺雕刻世界',
    unlockCondition: '测试结果为 ISTP 时解锁',
  },
  {
    id: 'mbti_ESTP',
    name: '烈焰游侠',
    type: 'mbti',
    mbtiType: 'ESTP',
    guides: ['flame'],
    rarity: 'R',
    description: '以烈焰般的行动力征服每个当下',
    unlockCondition: '测试结果为 ESTP 时解锁',
  },
  {
    id: 'mbti_ESFP',
    name: '星辰舞者',
    type: 'mbti',
    mbtiType: 'ESFP',
    guides: ['flame', 'star'],
    rarity: 'R',
    description: '用生命的热烈舞动点亮星辰',
    unlockCondition: '测试结果为 ESFP 时解锁',
  },
]

/* ===== 3 张组合卡 ===== */

const comboCards: AtlasCard[] = [
  {
    id: 'combo_quad',
    name: '万象星灵',
    type: 'guide_combo',
    comboId: 'quad',
    guides: ['flame', 'abyss', 'forest', 'star'],
    rarity: 'SSR',
    description: '四元素和谐统一的极致人格形态',
    unlockCondition: '获得四星齐辉组合时解锁',
  },
  {
    id: 'combo_triple',
    name: '任意三重',
    type: 'guide_combo',
    guides: ['flame', 'abyss', 'forest'],
    rarity: 'SR',
    description: '三种星灵力量交汇的深层共鸣',
    unlockCondition: '获得任意三重共鸣组合时解锁',
  },
  {
    id: 'combo_dual',
    name: '任意双重',
    type: 'guide_combo',
    guides: ['flame', 'abyss'],
    rarity: 'R',
    description: '两种星灵力量碰撞的二元共鸣',
    unlockCondition: '获得任意双重共鸣组合时解锁',
  },
]

/* ===== 导出 ===== */

/** 全部图鉴卡片（16 MBTI + 3 组合 = 19 张） */
export const atlasCards: AtlasCard[] = [...mbtiCards, ...comboCards]

/** 按 ID 快速查找图鉴卡片 */
export const atlasCardMap: Record<string, AtlasCard> = Object.fromEntries(
  atlasCards.map((c) => [c.id, c]),
)
