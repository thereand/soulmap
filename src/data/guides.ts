/**
 * 灵魂星图 — 四大星灵向导定义 & 15 种组合
 */
import type { GuideDefinition, GuideCombination, GuideId, GuideAffinityScores } from '@/types/guide'

/* ═══════════════════════════════════════════
 * 四大星灵向导
 * ═══════════════════════════════════════════ */

export const guideDefinitions: GuideDefinition[] = [
  {
    id: 'flame',
    name: '烈焰之灵',
    emoji: '🔥',
    color: '#ff6b35',
    colorLight: '#fff0e8',
    trait: '热情 · 勇敢 · 行动力',
    description: '烈焰之灵将点燃你内心的火焰，帮助你发现隐藏在热情背后的真正力量。',
    speakStyle: '直接、激昂、短句、感叹号',
    philosophy: '命运由我锻造',
  },
  {
    id: 'abyss',
    name: '深渊之灵',
    emoji: '💧',
    color: '#7c5ce0',
    colorLight: '#f0ecff',
    trait: '深邃 · 智慧 · 洞察力',
    description: '深渊之灵将带你潜入意识的深海，探索那些被遗忘的记忆与深层智慧。',
    speakStyle: '冷静、哲思、隐喻、反问',
    philosophy: '真相藏在深处',
  },
  {
    id: 'forest',
    name: '森林之灵',
    emoji: '🌿',
    color: '#4caf50',
    colorLight: '#e8f5e9',
    trait: '治愈 · 成长 · 生命力',
    description: '森林之灵将引领你走进内心的绿洲，在自然的韵律中找到生命的答案。',
    speakStyle: '温柔、共情、比喻、关怀',
    philosophy: '万物皆有联系',
  },
  {
    id: 'star',
    name: '星光之灵',
    emoji: '⚡',
    color: '#ffd700',
    colorLight: '#fffde8',
    trait: '闪耀 · 灵感 · 创造力',
    description: '星光之灵将为你点亮灵感之星，让你在星光中发现独一无二的创造力。',
    speakStyle: '跳跃、好奇、联想、幽默',
    philosophy: '规则就是用来打破的',
  },
]

/** 按 ID 快速查找向导定义 */
export const guideMap: Record<GuideId, GuideDefinition> = Object.fromEntries(
  guideDefinitions.map((g) => [g.id, g]),
) as Record<GuideId, GuideDefinition>

/* ═══════════════════════════════════════════
 * 15 种星灵组合
 * ═══════════════════════════════════════════ */

export const guideCombinations: GuideCombination[] = [
  // ── 单一共鸣（4 种）──
  {
    id: 'single_flame',
    name: '纯焰之心',
    guides: ['flame'],
    type: 'single',
    coreTraits: ['纯粹的行动者', '直觉与勇气是你的一切', '永不停歇的开拓者'],
    description: '你的灵魂深处燃烧着一团永不熄灭的火焰。没有犹豫，没有退缩——当你决定了一件事，整个世界都会为你的决心让路。你是最纯粹的行动者，用勇气和热情书写属于自己的传奇。',
    mbtiNote: '常见于 ESTP、ENTJ、ESFP 类型',
  },
  {
    id: 'single_abyss',
    name: '深渊独行者',
    guides: ['abyss'],
    type: 'single',
    coreTraits: ['孤独的思想家', '在深处找到光', '沉默中的力量'],
    description: '你的灵魂沉入了最深的海底，在那里你找到了别人看不到的宝藏——知识、洞察、和对真相的执着。你不需要人群的喧嚣来证明自己，因为你的内心世界比任何人都辽阔。',
    mbtiNote: '常见于 INTJ、INTP、ISTJ 类型',
  },
  {
    id: 'single_forest',
    name: '自然之子',
    guides: ['forest'],
    type: 'single',
    coreTraits: ['天生的共情者', '与世界同呼吸', '温柔的守护力量'],
    description: '你的灵魂像一棵深深扎根大地的古树，枝叶伸向天空，根系连接着每一个生命。你天生就能感受到他人的喜怒哀乐，并用你温暖的存在治愈着周围的世界。',
    mbtiNote: '常见于 ISFJ、ENFJ、INFJ 类型',
  },
  {
    id: 'single_star',
    name: '星尘旅人',
    guides: ['star'],
    type: 'single',
    coreTraits: ['不被定义的自由灵魂', '永远好奇', '灵感如星河'],
    description: '你的灵魂像一颗划过天际的流星——不被任何轨道束缚，永远追随内心的闪光。你的想象力是你最大的武器，每一天的你都是一个全新的自己，永远在路上。',
    mbtiNote: '常见于 ENFP、ENTP、INFP 类型',
  },

  // ── 双重共鸣（6 种）──
  {
    id: 'dual_flame_abyss',
    name: '熔岩与深海',
    guides: ['flame', 'abyss'],
    type: 'dual',
    coreTraits: ['外热内冷', '表面果断内心深邃', '行动与思辨的平衡'],
    description: '你的灵魂同时拥有火焰的热力和深水的沉静。在外人看来你果断而充满行动力，但只有你自己知道，每一个决定的背后都经过了深层的思考。这种"知行合一"的特质让你成为天生的领导者。',
    mbtiNote: '行动力与审慎的完美平衡',
  },
  {
    id: 'dual_flame_forest',
    name: '野火春风',
    guides: ['flame', 'forest'],
    type: 'dual',
    coreTraits: ['热情且温暖', '强烈的保护欲', '冲劲与温柔并存'],
    description: '你的灵魂像一团温暖的篝火——既有照亮黑暗的勇气，也有温暖旅人的温柔。你会为了守护在乎的人而毫不犹豫地冲向前方，这份热血与柔情的结合是你最迷人的地方。',
    mbtiNote: '冲劲与温柔的交织',
  },
  {
    id: 'dual_flame_star',
    name: '流星风暴',
    guides: ['flame', 'star'],
    type: 'dual',
    coreTraits: ['最强的能量组合', '永不停歇', '灵感驱动的行动者'],
    description: '你的灵魂像一场壮观的流星雨——每一颗流星都带着火焰和灵感划过天际。你是那种会突然半夜想到一个绝妙点子、然后第二天就真的去做的人。你的存在本身就是一场精彩的冒险。',
    mbtiNote: '专注与发散的华丽碰撞',
  },
  {
    id: 'dual_abyss_forest',
    name: '深林清泉',
    guides: ['abyss', 'forest'],
    type: 'dual',
    coreTraits: ['安静而有深度', '用思考守护温柔', '内在的宁静力量'],
    description: '你的灵魂像一片幽深的森林，清泉在林间静静流淌。你用深沉的思考来理解世界，用温柔的共情来连接他人。你不急于表达，但当你开口时，每一句话都直抵人心。',
    mbtiNote: '理智与情感的和谐融合',
  },
  {
    id: 'dual_abyss_star',
    name: '极光深渊',
    guides: ['abyss', 'star'],
    type: 'dual',
    coreTraits: ['理性深处的天马行空', '逻辑与直觉的舞蹈', '思想先锋'],
    description: '你的灵魂是一片深邃的海洋，水面上映照着变幻的极光。你拥有罕见的"深度+广度"组合——既能在一个问题上深入到底，又能跳出框架看到全新的可能。你是思想的探险家。',
    mbtiNote: '逻辑与直觉的舞蹈',
  },
  {
    id: 'dual_forest_star',
    name: '梦境花园',
    guides: ['forest', 'star'],
    type: 'dual',
    coreTraits: ['创造力与共情力', '理想主义的建设者', '用灵感治愈世界'],
    description: '你的灵魂是一座永远盛放的花园——每一朵花都是一个灵感，每一片叶子都承载着一份关怀。你用创造力来表达你对世界的爱，你的作品和想法总是能让人们看到更美好的一面。',
    mbtiNote: '理想与现实的诗意桥梁',
  },

  // ── 三重共鸣（4 种）──
  {
    id: 'triple_flame_abyss_forest',
    name: '大地之柱',
    guides: ['flame', 'abyss', 'forest'],
    type: 'triple',
    coreTraits: ['兼具行动、深度和温暖', '全能守护者', '三重力量平衡'],
    description: '你的灵魂像一座矗立的大山——有烈焰之灵的坚定行动力，有深渊之灵的深层智慧，还有森林之灵的温暖关怀。你是一个罕见的全方位灵魂，能从多个维度理解和回应这个世界。',
    mbtiNote: '三种力量的完美平衡',
  },
  {
    id: 'triple_flame_abyss_star',
    name: '风暴之眼',
    guides: ['flame', 'abyss', 'star'],
    type: 'triple',
    coreTraits: ['混乱中保持冷静', '主动制造变革', '战略型创新者'],
    description: '你的灵魂像一场风暴的中心——外界狂风暴雨，你的内心却异常平静和清醒。你有着在混乱中做出精确判断的天赋，同时又不断用新的想法和勇气去改变现状。你是变革的催化剂。',
    mbtiNote: '冷静与激情的独特共存',
  },
  {
    id: 'triple_flame_forest_star',
    name: '太阳花',
    guides: ['flame', 'forest', 'star'],
    type: 'triple',
    coreTraits: ['充满能量的感染型人格', '照亮周围的人', '温暖而有创造力'],
    description: '你的灵魂像一朵向日葵——永远面向光明，并把温暖传递给每一个人。你的热情、关怀和创造力让你成为天然的"能量源"，人们在你身边总会感到振奋和充满希望。',
    mbtiNote: '能量与温暖的三重奏',
  },
  {
    id: 'triple_abyss_forest_star',
    name: '月光棱镜',
    guides: ['abyss', 'forest', 'star'],
    type: 'triple',
    coreTraits: ['深层理解与创造力', '折射世界的多面性', '安静的灵感者'],
    description: '你的灵魂像一面月光下的棱镜——看似安静，内在却折射出七彩的光芒。你用深层的理解力去感知世界，用同理心去连接他人，用创造力去表达那些无法用言语描述的感悟。',
    mbtiNote: '深度与广度的内在统一',
  },

  // ── 四星齐辉（1 种）──
  {
    id: 'quad',
    name: '万象星灵',
    guides: ['flame', 'abyss', 'forest', 'star'],
    type: 'quad',
    coreTraits: ['极其罕见的全方位灵魂', '四元素和谐统一', '无限可能性'],
    description: '极其罕见。你的灵魂像一颗同时燃烧着四种元素的恒星——拥有战士的勇气、思想家的深度、治愈者的温柔和艺术家的灵感。这四种力量在你体内和谐共存，让你能够理解和连接几乎任何类型的人。你是一面完整的镜子，映照着灵魂星图的全部光彩。',
    mbtiNote: '全国仅约 3-5% 的人拥有此组合',
  },
]

/** 按 ID 快速查找组合 */
export const combinationMap: Record<string, GuideCombination> = Object.fromEntries(
  guideCombinations.map((c) => [c.id, c]),
)

/* ═══════════════════════════════════════════
 * 组合判定算法
 * ═══════════════════════════════════════════ */

/**
 * 根据向导亲和度得分判定星灵组合
 *
 * 判定规则：
 * - 单一共鸣：最高分 > 第二名的 2 倍
 * - 双重共鸣：前两名差距 < 30%（以最高分为基准），第三名 < 50%
 * - 三重共鸣：前三名差距都在 40% 内
 * - 四星齐辉：四名亲和度差距都在 25% 内
 */
export function determineGuideCombination(
  scores: GuideAffinityScores,
): GuideCombination {
  // 按得分降序排列向导
  const sorted = (Object.entries(scores) as [GuideId, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([id, score]) => ({ id, score }))

  const max = sorted[0].score
  // 避免除以 0
  const base = Math.max(max, 1)

  const ratios = sorted.map((s) => s.score / base)

  // 四星齐辉：四名差距在 25% 内
  if (ratios[3] >= 0.75) {
    return combinationMap['quad']
  }

  // 三重共鸣：前三名差距在 40% 内，第四名明显低
  if (ratios[2] >= 0.6 && ratios[3] < 0.5) {
    const key = `triple_${sorted.slice(0, 3).map((s) => s.id).sort().join('_')}`
    return combinationMap[key] ?? combinationMap['triple_flame_abyss_forest']
  }

  // 双重共鸣：前两名差距 < 30%
  if (ratios[1] >= 0.7 && ratios[2] < 0.5) {
    const key = `dual_${sorted.slice(0, 2).map((s) => s.id).sort().join('_')}`
    return combinationMap[key] ?? combinationMap['dual_flame_abyss']
  }

  // 单一共鸣：最高分远超第二名
  const key = `single_${sorted[0].id}`
  return combinationMap[key] ?? combinationMap['single_flame']
}

/**
 * 计算当前章节的主导向导（亲和度最高者）
 */
export function getDominantGuide(scores: GuideAffinityScores): GuideId {
  const entries = Object.entries(scores) as [GuideId, number][]
  entries.sort((a, b) => b[1] - a[1])
  return entries[0][0]
}

/**
 * 获取亲和度排名前两位的向导
 */
export function getTopTwoGuides(scores: GuideAffinityScores): [GuideId, GuideId] {
  const entries = Object.entries(scores) as [GuideId, number][]
  entries.sort((a, b) => b[1] - a[1])
  return [entries[0][0], entries[1][0]]
}
