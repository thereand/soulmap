/**
 * 灵魂星图 - 核心测试相关类型定义
 */

/** MBTI 四维度得分 */
interface DimensionScores {
  /** E(外倾) vs I(内倾) 得分，0~100，>50 偏 E */
  EI: number
  /** S(感觉) vs N(直觉) 得分，0~100，>50 偏 S */
  SN: number
  /** T(思维) vs F(情感) 得分，0~100，>50 偏 T */
  TF: number
  /** J(判断) vs P(知觉) 得分，0~100，>50 偏 J */
  JP: number
}

/** 题目选项 */
interface TestOption {
  /** 选项唯一标识 */
  id: string
  /** 选项文本内容 */
  text: string
  /** 该选项对各维度的影响权重 */
  weights: {
    EI?: number
    SN?: number
    TF?: number
    JP?: number
  }
  /** 是否为反向计分选项 */
  reverse?: boolean
}

/** 测试题目 */
interface TestQuestion {
  /** 题目唯一标识 */
  id: string
  /** 题目文本 */
  text: string
  /** 所属章节 ID */
  chapterId: string
  /** 题目排序序号 */
  order: number
  /** 选项列表 */
  options: TestOption[]
  /** 题目配图资源路径（可选） */
  image?: string
  /** 题目类型：单选/多选/滑动条 */
  type: 'single' | 'multiple' | 'slider'
  /** 预估答题时间（秒） */
  estimatedTime?: number
}

/** 测试章节 */
interface Chapter {
  /** 章节唯一标识 */
  id: string
  /** 章节名称 */
  name: string
  /** 章节描述 */
  description: string
  /** 章节图标 */
  icon: string
  /** 该章节包含的题目 ID 列表 */
  questionIds: string[]
  /** 章节排序序号 */
  order: number
  /** 章节主题色（十六进制） */
  themeColor?: string
}

/** 16种 MBTI 人格类型标识 */
type MBTIType =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP'

/** 人格类型详情 */
interface PersonalityType {
  /** MBTI 类型代码 */
  code: MBTIType
  /** 类型中文名称 */
  name: string
  /** 类型英文别名（如 "The Architect"） */
  alias: string
  /** 类型简介 */
  summary: string
  /** 详细描述（富文本） */
  description: string
  /** 核心特质标签 */
  traits: string[]
  /** 优势 */
  strengths: string[]
  /** 劣势 */
  weaknesses: string[]
  /** 适合的职业方向 */
  careers: string[]
  /** 与其他类型的兼容性评分（code → 0~100） */
  compatibility: Record<MBTIType, number>
  /** 代表人物 */
  famousPeople: string[]
  /** 类型配图路径 */
  image: string
  /** 类型主题色 */
  themeColor: string
}

/** 测试会话状态（答题过程中） */
interface TestSession {
  /** 会话唯一标识 */
  sessionId: string
  /** 当前所在章节索引 */
  currentChapterIndex: number
  /** 当前题目在章节内的索引 */
  currentQuestionIndex: number
  /** 已答题目记录（questionId → selectedOptionId） */
  answers: Record<string, string | string[]>
  /** 答题开始时间戳 */
  startTime: number
  /** 最近一次操作时间戳 */
  lastActiveTime: number
  /** 是否已提交 */
  submitted: boolean
  /** 各维度累计得分 */
  dimensionScores: DimensionScores
}

/** 测试结果 */
interface TestResult {
  /** 结果唯一标识 */
  resultId: string
  /** 关联的会话 ID */
  sessionId: string
  /** 用户 ID */
  userId: string
  /** 判定的人格类型 */
  personalityType: MBTIType
  /** 四维度详细得分 */
  dimensionScores: DimensionScores
  /** 各维度置信度（0~1） */
  confidence: {
    EI: number
    SN: number
    TF: number
    JP: number
  }
  /** 测试完成时间戳 */
  completedAt: number
  /** 总答题时长（秒） */
  duration: number
  /** 是否已解锁完整报告 */
  reportUnlocked: boolean
  /** 分享令牌（用于生成分享链接） */
  shareToken?: string
}

export {
  DimensionScores,
  TestOption,
  TestQuestion,
  Chapter,
  MBTIType,
  PersonalityType,
  TestSession,
  TestResult,
}
