import type { Chapter } from '@/types/test'

/**
 * 灵魂星图 — 章节配置
 */
export const chapters: Chapter[] = [
  {
    id: 'ch1',
    name: '第一章：觉醒',
    description: '你从一片神秘的银白迷雾中醒来，四周弥漫着未知的气息。星象仪缓缓转动，古老的符文开始发光——灵魂之旅从这里开始。在这个章节中，你将面对未知的环境，做出最初的选择，认识最真实的自己。',
    icon: 'awakening',
    order: 1,
    questionIds: ['q1', 'q2', 'q3', 'q4', 'q5'],
    themeColor: '#7B68EE',
  },
  {
    id: 'ch2',
    name: '第二章：探索',
    description: '穿过迷雾之门，你来到一座由琥珀构成的浮空城市。会唱歌的花朵、装满梦境的药水、空白的魔法书籍……这个奇幻世界充满了等待被发现的秘密。你将以自己的方式理解这一切，寻找属于你的答案。',
    icon: 'exploration',
    order: 2,
    questionIds: ['q6', 'q7', 'q8', 'q9', 'q10'],
    themeColor: '#00CED1',
  },
  {
    id: 'ch3',
    name: '第三章：抉择',
    description: '黑暗的森林、燃烧的村庄、审判之塔的天平——你被推入了一个又一个两难困境。正义与悲悯、理性与感性、自我与他人……每一个选择都在定义你的灵魂。在这里，没有标准答案，只有你内心深处的声音。',
    icon: 'crossroads',
    order: 3,
    questionIds: ['q11', 'q12', 'q13', 'q14', 'q15'],
    themeColor: '#FF6B6B',
  },
  {
    id: 'ch4',
    name: '第四章：蜕变',
    description: '暗潮倾泻而下，大地在震颤。灵魂武装在你手中成形，记忆之镜映出过去与未来。在最深的压力下，你展现出最真实的自己。试炼之桥的光块在脚下浮动——是稳步前行，还是纵身飞跃？',
    icon: 'metamorphosis',
    order: 4,
    questionIds: ['q16', 'q17', 'q18', 'q19', 'q20'],
    themeColor: '#FFA726',
  },
  {
    id: 'ch5',
    name: '第五章：归宿',
    description: '灵魂圣殿的大门为你敞开，一片无垠的空白世界等待你的塑造。大地、流水、风——选择你的元素；守序者、梦想家、旅行者——召唤你的居民。在这里，你将构建属于自己的理想世界，找到灵魂最终的归宿。',
    icon: 'sanctuary',
    order: 5,
    questionIds: ['q21', 'q22', 'q23', 'q24', 'q25'],
    themeColor: '#AB47BC',
  },
]

/** 章节辅助信息（非类型定义部分，用于UI展示） */
export const chapterMeta: Record<string, {
  subtitle: string
  fragmentName: string
  fragmentIcon: string
  background: string
}> = {
  ch1: {
    subtitle: '自我认知',
    fragmentName: '觉醒之碎片',
    fragmentIcon: 'fragment_awakening',
    background: 'chapter1_bg',
  },
  ch2: {
    subtitle: '面对世界',
    fragmentName: '探索之碎片',
    fragmentIcon: 'fragment_exploration',
    background: 'chapter2_bg',
  },
  ch3: {
    subtitle: '价值冲突',
    fragmentName: '抉择之碎片',
    fragmentIcon: 'fragment_crossroads',
    background: 'chapter3_bg',
  },
  ch4: {
    subtitle: '压力应对',
    fragmentName: '蜕变之碎片',
    fragmentIcon: 'fragment_metamorphosis',
    background: 'chapter4_bg',
  },
  ch5: {
    subtitle: '生活方式',
    fragmentName: '归宿之碎片',
    fragmentIcon: 'fragment_sanctuary',
    background: 'chapter5_bg',
  },
}
