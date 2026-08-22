/**
 * 灵魂星图 - 配对报告模板
 *
 * 由于 16×16 = 256 组合（对称去重后 136 组），此文件提供：
 *  - 少量高频热门 CP 的手写报告
 *  - fallback 报告：基于契合度分数区间与维度差异自动组装
 *
 * 通过 getCompatibilityReport(pairKey) 统一取用。
 */

import { pairKey, type CompatibilityResult } from '@/utils/compatibility'

export interface DimensionInsight {
  description: string
  harmony: number
}

export interface CompatibilityReport {
  pairKey: string
  overallScore: number
  relationLabel: string
  summary: string
  dimensionComparison: {
    EI: DimensionInsight
    SN: DimensionInsight
    TF: DimensionInsight
    JP: DimensionInsight
  }
  strengths: string[]
  challenges: string[]
  growthAdvice: string
}

/** 高频组合手写报告（可持续扩充） */
export const featuredReports: Record<string, Partial<CompatibilityReport>> = {
  [pairKey('INTJ', 'ENFP')]: {
    summary: '一个在深夜勾勒宏图，一个在白日播撒星火——你们互为彼此缺失的一半。',
    strengths: [
      'ENFP 的热情能打破 INTJ 的孤岛，让蓝图落地',
      'INTJ 的深度能给 ENFP 的天马行空一个稳定的坐标',
      '两人都热爱可能性，讨论未来时几乎不会冷场',
    ],
    challenges: [
      'INTJ 需要独处充电，ENFP 需要陪伴释放',
      'ENFP 的即兴决策可能让 INTJ 感到失控',
    ],
    growthAdvice: '给彼此留出独立空间的同时，用共同项目（旅行/创作）作为纽带。',
  },
  [pairKey('INFJ', 'ENFP')]: {
    summary: '你们是灵魂彼此认领的旅人，一个善于倾听，一个善于点燃。',
    strengths: [
      '两人都拥有深度共情能力，能读懂对方未说出口的情绪',
      'ENFP 拉着 INFJ 走出内心迷宫',
      'INFJ 让 ENFP 感到被真正理解',
    ],
    challenges: [
      'INFJ 的完美主义 vs ENFP 的松弛感',
      '两人都容易情绪化，需要冷静期',
    ],
    growthAdvice: '把彼此的情绪当成信号灯而不是判决书，先呼吸再回应。',
  },
  [pairKey('INTP', 'ENTP')]: {
    summary: '两个头脑风暴机器共舞的火花——理论和玩笑齐飞。',
    strengths: [
      '思想上高度同频，能连续辩论几小时不累',
      '共同追求"有趣胜过正确"的表达方式',
      '在创造性工作上互为最好的搭档',
    ],
    challenges: [
      '双方都不擅长处理情绪冲突',
      '容易陷入无穷讨论而缺乏收尾',
    ],
    growthAdvice: '每周留一次"结论会"，把讨论沉淀为可执行动作。',
  },
  [pairKey('INFP', 'ENFJ')]: {
    summary: '一个用沉默守护理想，一个用行动照亮他人——你们像月光与灯塔。',
    strengths: [
      'ENFJ 的引导能帮 INFP 把梦落到实处',
      'INFP 的柔软能安抚 ENFJ 过度的责任感',
      '两人都相信人性温度，价值观高度契合',
    ],
    challenges: [
      'INFP 需要退回自我，ENFJ 需要被回应',
      '双方都容易把"为你好"变成压力',
    ],
    growthAdvice: '定期沟通节奏与边界，把"照顾"改为"询问"。',
  },
  [pairKey('ISFJ', 'ESTP')]: {
    summary: '一个偏爱稳妥，一个追逐冒险——你们的组合是热汤配辣椒。',
    strengths: [
      'ESTP 帮 ISFJ 打破舒适圈',
      'ISFJ 为 ESTP 提供情绪港湾',
      '一动一静能互相拉回中间地带',
    ],
    challenges: [
      '风险偏好差距大，涉及大事决策易起争执',
      'ESTP 的直白可能刺伤 ISFJ 的敏感',
    ],
    growthAdvice: '重大决策前做一次"角色互换"练习，再各自表态。',
  },
  [pairKey('ISTJ', 'ENFP')]: {
    summary: '一个守时守序，一个跳跃如风——却在彼此身上看见自己缺失的部分。',
    strengths: [
      'ISTJ 为 ENFP 的想象提供可靠地基',
      'ENFP 让 ISTJ 的生活多一抹色彩',
      '在长期关系中彼此校准',
    ],
    challenges: [
      'ENFP 觉得 ISTJ 过于死板',
      'ISTJ 觉得 ENFP 缺乏计划',
    ],
    growthAdvice: '尊重彼此的操作系统，允许对方"用自己的方式做事"。',
  },
  [pairKey('ENTJ', 'INFP')]: {
    summary: '一个铁腕规划宇宙，一个用直觉倾听星星——理性与浪漫的深度碰撞。',
    strengths: [
      'ENTJ 帮 INFP 把想法商业化',
      'INFP 让 ENTJ 记得初心和温度',
      '两人都追求意义感',
    ],
    challenges: [
      'ENTJ 的直接与 INFP 的敏感需要缓冲',
      '决策风格截然相反',
    ],
    growthAdvice: '把冲突当成"两个视角"的补丁而不是对抗。',
  },
  [pairKey('ISTP', 'ESFJ')]: {
    summary: '一个手艺人般冷静观察，一个像温暖的太阳照顾所有人。',
    strengths: [
      'ESFJ 让 ISTP 走进人群',
      'ISTP 让 ESFJ 学会独处',
      '在生活琐事上互补',
    ],
    challenges: [
      'ESFJ 需要频繁交流，ISTP 需要距离',
      '情感表达节奏差异大',
    ],
    growthAdvice: '每天一件小事的仪式感 + 每周一天的独立空间。',
  },
  [pairKey('ESFP', 'INFJ')]: {
    summary: '一个是舞台中央的火花，一个是幕后深沉的引路人。',
    strengths: [
      'ESFP 帮 INFJ 感受当下',
      'INFJ 给 ESFP 提供深度锚点',
      '共同创造出既轻盈又深邃的关系',
    ],
    challenges: [
      'INFJ 的沉思有时被 ESFP 视作距离感',
      'ESFP 的即兴让 INFJ 焦虑',
    ],
    growthAdvice: '轮流选择"节奏"：一次跟着舞步，一次跟着沉思。',
  },
  [pairKey('ENTP', 'INFJ')]: {
    summary: '辩手与预言家的组合，一场持续了一辈子的思想恋爱。',
    strengths: [
      'ENTP 的思辨激活 INFJ 的深层理解',
      'INFJ 的洞察力让 ENTP 停下来听自己内心',
      '共同追求真理与创新',
    ],
    challenges: [
      'ENTP 的挑衅可能触碰 INFJ 的敏感底线',
      '两人都容易过度思考',
    ],
    growthAdvice: '设立"温柔时段"，非辩论、只倾听。',
  },
}

/**
 * 生成 fallback 报告：基于契合度结果自动组装
 */
export function buildFallbackReport(
  typeA: string,
  typeB: string,
  compatibility: CompatibilityResult,
): CompatibilityReport {
  const key = pairKey(typeA, typeB)
  const featured = featuredReports[key] || {}

  const h = compatibility.dimensionHarmony
  const dimensionComparison = {
    EI: {
      description: h.EI >= 60 ? '你们在能量方向上默契十足' : '一个偏向对外释放，一个偏向对内充电',
      harmony: Math.round(h.EI),
    },
    SN: {
      description: h.SN >= 60 ? '你们看世界的滤镜相似，容易共鸣' : '一个关注现实细节，一个耽于宏大想象',
      harmony: Math.round(h.SN),
    },
    TF: {
      description: h.TF >= 60 ? '你们做决策时看重相似的东西' : '一个凭逻辑判断，一个凭情感权衡',
      harmony: Math.round(h.TF),
    },
    JP: {
      description: h.JP >= 60 ? '你们的生活节奏彼此适配' : '一个追求计划感，一个偏爱开放式',
      harmony: Math.round(h.JP),
    },
  }

  const score = compatibility.overallScore

  const strengths = featured.strengths || [
    '不同的世界观让你们互相打开视野',
    score >= 60 ? '共同的价值观形成默契的支撑' : '差异让彼此各自成长',
    '互相补足对方缺失的部分',
  ]

  const challenges = featured.challenges || [
    score < 60 ? '在决策方式上容易产生分歧' : '细节磨合需要耐心',
    '沟通节奏偶尔不同步',
  ]

  const growthAdvice =
    featured.growthAdvice ||
    (score >= 70
      ? '继续保持坦诚沟通，把差异当作对方送的礼物。'
      : '把冲突拆成"我们要解决什么"和"我们各自的需要"两层再谈。')

  return {
    pairKey: key,
    overallScore: score,
    relationLabel: compatibility.relationLabel,
    summary: featured.summary || compatibility.summary,
    dimensionComparison,
    strengths,
    challenges,
    growthAdvice,
  }
}
