/**
 * 灵魂星图 - 测试服务抽象层
 * 封装测试结果提交、报告获取等业务逻辑
 */
import { callCloud } from './cloud'
import type { CloudResult } from './cloud'

/** 提交的测试结果 */
export interface SubmitTestParams {
  /** 会话 ID */
  sessionId: string
  /** 答案记录 { questionId: optionId | optionId[] } */
  answers: Record<string, string | string[]>
  /** 客户端计算的维度分数（用于对比校验） */
  dimensionScores?: { EI: number; SN: number; TF: number; JP: number }
  /** 答题开始时间戳 */
  startTime?: number
  /** 答题时长（秒） */
  duration?: number
  /** 完整题目数据（开发阶段兜底传入） */
  questions?: any[]
}

/** 提交结果返回 */
export interface SubmitResultResponse {
  resultId: string
  personalityType: string
  dimensionScores: { EI: number; SN: number; TF: number; JP: number }
  confidence: { EI: number; SN: number; TF: number; JP: number }
  shareToken: string
  completedAt: number
  duration: number
  reportUnlocked: boolean
}

/** 报告数据 */
export interface ReportData {
  resultId: string
  personalityType: string
  dimensionScores: { EI: number; SN: number; TF: number; JP: number }
  confidence: { EI: number; SN: number; TF: number; JP: number }
  completedAt: number
  duration: number
  reportType: string
  unlocked: boolean
  secondResult?: {
    resultId: string
    personalityType: string
    dimensionScores: { EI: number; SN: number; TF: number; JP: number }
    confidence: { EI: number; SN: number; TF: number; JP: number }
  }
  needPay?: boolean
  price?: number
  productType?: string
}

/**
 * 将 { questionId: optionId } 格式的 answers 转为 { questionId, optionIndex }[] 格式
 * 供云函数使用
 */
function normalizeAnswers(
  answers: Record<string, string | string[]>,
  questions?: any[]
): Array<{ questionId: string; optionIndex: number }> {
  const result: Array<{ questionId: string; optionIndex: number }> = []

  for (const [questionId, optionId] of Object.entries(answers)) {
    // 单选
    const selectedId = Array.isArray(optionId) ? optionId[0] : optionId

    // 如果传入了 questions，找到对应 option 的 index
    if (questions && questions.length > 0) {
      const question = questions.find((q: any) => q.id === questionId)
      if (question) {
        const idx = question.options.findIndex((o: any) => o.id === selectedId)
        if (idx >= 0) {
          result.push({ questionId, optionIndex: idx })
          continue
        }
      }
    }

    // 兜底：假设 optionId 本身就是 index
    result.push({ questionId, optionIndex: parseInt(selectedId, 10) || 0 })
  }

  return result
}

export const testService = {
  /**
   * 提交测试结果
   */
  async submitResult(params: SubmitTestParams): Promise<CloudResult<SubmitResultResponse>> {
    const normalizedAnswers = normalizeAnswers(params.answers, params.questions)

    return callCloud<SubmitResultResponse>('submitResult', {
      sessionId: params.sessionId,
      answers: normalizedAnswers,
      dimensionScores: params.dimensionScores,
      startTime: params.startTime,
      duration: params.duration,
      questions: params.questions,
    })
  },

  /**
   * 获取报告
   */
  async getReport(
    resultId: string,
    type: 'free' | 'basic' | 'advanced' | 'comparison' = 'free',
    secondResultId?: string
  ): Promise<CloudResult<ReportData>> {
    const data: Record<string, any> = { resultId, type }
    if (secondResultId) {
      data.secondResultId = secondResultId
    }
    return callCloud<ReportData>('getReport', data)
  },

  /**
   * 生成分享 token
   */
  async generateShareToken(resultId: string): Promise<CloudResult<{ shareToken: string }>> {
    return callCloud<{ shareToken: string }>('shareToken', {
      action: 'generate',
      resultId,
    })
  },

  /**
   * 解析分享 token
   */
  async resolveShareToken(token: string): Promise<CloudResult<{
    resultId: string
    personalityType: string
    dimensionScores: { EI: number; SN: number; TF: number; JP: number }
    completedAt: number
    duration: number
  }>> {
    return callCloud('shareToken', {
      action: 'resolve',
      token,
    })
  },
}
