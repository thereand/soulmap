/**
 * 灵魂星图 - 16种星灵人格类型定义
 * 每种人格对应 MBTI 的一个类型，使用原创 IP 名称和设定
 */

export interface PersonalityTypeData {
  /** MBTI 类型代码 */
  code: string
  /** 星灵名称 */
  name: string
  /** 一句话描述 */
  title: string
  /** 3个核心标签 */
  tags: string[]
  /** 属性元素（火/水/风/土/光/暗） */
  element: string
  /** 代表色 HEX */
  color: string
  /** 对应星座区域 */
  constellation: string
  /** 稀有度 SSR | SR | R */
  rarity: string
  /** 星灵插画路径（本地 static 目录，也可替换为云存储 URL） */
  avatar?: string
  /** 最契合的类型代码（2-3 个） */
  compatibleTypes: string[]
  /** 最冲突的类型代码（1-2 个） */
  conflictTypes: string[]
}

export const personalityTypes: Record<string, PersonalityTypeData> = {
  INTJ: {
    code: 'INTJ',
    name: '星渊策士',
    title: '在星河深处编织未来蓝图的远见者',
    tags: ['战略家', '远见者', '独行者'],
    element: '暗',
    color: '#2C1654',
    constellation: '深渊星域',
    rarity: 'SSR',
    avatar: '/static/images/spirits/INTJ.jpg',
    compatibleTypes: ['ENFP', 'ENTP'],
    conflictTypes: ['ESFJ', 'ESTP'],
  },
  INTP: {
    code: 'INTP',
    name: '幻梦织者',
    title: '用无限好奇解构宇宙规则的灵魂',
    tags: ['思想家', '探索者', '逻辑师'],
    element: '风',
    color: '#7B9ACC',
    constellation: '幻梦星云',
    rarity: 'SR',
    avatar: '/static/images/spirits/INTP.jpg',
    compatibleTypes: ['ENTJ', 'ENFJ'],
    conflictTypes: ['ESFJ', 'ESTJ'],
  },
  ENTJ: {
    code: 'ENTJ',
    name: '天命统帅',
    title: '以钢铁意志率领星舰穿越星海',
    tags: ['领袖', '征服者', '开拓者'],
    element: '火',
    color: '#C41E3A',
    constellation: '统帅星环',
    rarity: 'SSR',
    avatar: '/static/images/spirits/ENTJ.jpg',
    compatibleTypes: ['INTP', 'INFP'],
    conflictTypes: ['ISFP', 'ISTP'],
  },
  ENTP: {
    code: 'ENTP',
    name: '混沌智者',
    title: '在混沌中发现规律的灵魂火花',
    tags: ['辩者', '创新者', '冒险家'],
    element: '风',
    color: '#FF6B2B',
    constellation: '混沌风暴',
    rarity: 'SR',
    avatar: '/static/images/spirits/ENTP.jpg',
    compatibleTypes: ['INTJ', 'INFJ'],
    conflictTypes: ['ISFJ', 'ISTJ'],
  },
  INFJ: {
    code: 'INFJ',
    name: '灵光预言者',
    title: '在寂静中倾听宇宙低语的灵魂',
    tags: ['洞察者', '理想者', '守护者'],
    element: '光',
    color: '#8B5CF6',
    constellation: '预言圣殿',
    rarity: 'SSR',
    avatar: '/static/images/spirits/INFJ.jpg',
    compatibleTypes: ['ENFP', 'ENTP'],
    conflictTypes: ['ESTP', 'ESFP'],
  },
  INFP: {
    code: 'INFP',
    name: '星尘诗人',
    title: '将星尘化作诗篇的温柔灵魂',
    tags: ['梦想家', '治愈者', '浪漫者'],
    element: '水',
    color: '#A78BFA',
    constellation: '诗星海',
    rarity: 'SR',
    avatar: '/static/images/spirits/INFP.jpg',
    compatibleTypes: ['ENFJ', 'ENTJ'],
    conflictTypes: ['ESTJ', 'ESFJ'],
  },
  ENFJ: {
    code: 'ENFJ',
    name: '曙光引路人',
    title: '以光芒照亮他人前行之路',
    tags: ['导师', '感召者', '奉献者'],
    element: '光',
    color: '#F59E0B',
    constellation: '曙光之门',
    rarity: 'SR',
    avatar: '/static/images/spirits/ENFJ.jpg',
    compatibleTypes: ['INFP', 'ISFP'],
    conflictTypes: ['ISTP', 'ESTP'],
  },
  ENFP: {
    code: 'ENFP',
    name: '极光漫游者',
    title: '像极光般绚烂又无法捉摸的存在',
    tags: ['热情者', '创意者', '自由灵'],
    element: '火',
    color: '#EC4899',
    constellation: '极光长廊',
    rarity: 'SR',
    avatar: '/static/images/spirits/ENFP.jpg',
    compatibleTypes: ['INTJ', 'INFJ'],
    conflictTypes: ['ISTJ', 'ESTJ'],
  },
  ISTJ: {
    code: 'ISTJ',
    name: '磐石守卫者',
    title: '如磐石般坚定守护秩序的灵魂',
    tags: ['守序者', '可靠者', '执行者'],
    element: '土',
    color: '#57534E',
    constellation: '磐石要塞',
    rarity: 'R',
    avatar: '/static/images/spirits/ISTJ.jpg',
    compatibleTypes: ['ESFP', 'ESTP'],
    conflictTypes: ['ENFP', 'ENTP'],
  },
  ISFJ: {
    code: 'ISFJ',
    name: '暖阳织梦人',
    title: '以温暖编织安宁的港湾守护者',
    tags: ['守护者', '温暖者', '奉献者'],
    element: '土',
    color: '#D97706',
    constellation: '暖阳庭院',
    rarity: 'R',
    avatar: '/static/images/spirits/ISFJ.jpg',
    compatibleTypes: ['ESFP', 'ESTP'],
    conflictTypes: ['ENTP', 'ENFP'],
  },
  ESTJ: {
    code: 'ESTJ',
    name: '铁律执行官',
    title: '以铁律和行动力推动世界运转',
    tags: ['管理者', '实干者', '组织者'],
    element: '火',
    color: '#DC2626',
    constellation: '铁律殿堂',
    rarity: 'R',
    avatar: '/static/images/spirits/ESTJ.jpg',
    compatibleTypes: ['ISFP', 'ISTP'],
    conflictTypes: ['INFP', 'INTP'],
  },
  ESFJ: {
    code: 'ESFJ',
    name: '星光庇护者',
    title: '散发温暖星光庇护周围一切的灵魂',
    tags: ['关怀者', '和谐者', '社交者'],
    element: '光',
    color: '#F472B6',
    constellation: '庇护光环',
    rarity: 'R',
    avatar: '/static/images/spirits/ESFJ.jpg',
    compatibleTypes: ['ISFP', 'ISTP'],
    conflictTypes: ['INTJ', 'INTP'],
  },
  ISTP: {
    code: 'ISTP',
    name: '寂影工匠',
    title: '在沉默中以精湛技艺雕刻世界',
    tags: ['技艺者', '冷静者', '实用者'],
    element: '土',
    color: '#6B7280',
    constellation: '寂影工坊',
    rarity: 'R',
    avatar: '/static/images/spirits/ISTP.jpg',
    compatibleTypes: ['ESTJ', 'ESFJ'],
    conflictTypes: ['ENFJ', 'ENTJ'],
  },
  ISFP: {
    code: 'ISFP',
    name: '林间吟游者',
    title: '在自然和美中找到灵魂归宿',
    tags: ['艺术者', '感性者', '自由者'],
    element: '水',
    color: '#34D399',
    constellation: '吟游森林',
    rarity: 'SR',
    avatar: '/static/images/spirits/ISFP.jpg',
    compatibleTypes: ['ENFJ', 'ESFJ'],
    conflictTypes: ['ENTJ', 'ESTJ'],
  },
  ESTP: {
    code: 'ESTP',
    name: '烈焰游侠',
    title: '以烈焰般的行动力征服每个当下',
    tags: ['行动者', '冒险者', '务实者'],
    element: '火',
    color: '#EF4444',
    constellation: '烈焰竞技场',
    rarity: 'R',
    avatar: '/static/images/spirits/ESTP.jpg',
    compatibleTypes: ['ISTJ', 'ISFJ'],
    conflictTypes: ['INFJ', 'INFP'],
  },
  ESFP: {
    code: 'ESFP',
    name: '星辰舞者',
    title: '用生命的热烈舞动点亮星辰',
    tags: ['表演者', '享乐者', '活力者'],
    element: '火',
    color: '#FBBF24',
    constellation: '星辰舞台',
    rarity: 'R',
    avatar: '/static/images/spirits/ESFP.jpg',
    compatibleTypes: ['ISTJ', 'ISFJ'],
    conflictTypes: ['INTJ', 'INFJ'],
  },
}
