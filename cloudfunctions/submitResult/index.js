/**
 * 灵魂星图 - submitResult 云函数
 * 接收客户端提交的答案，服务端重新计算验证（防作弊），存入数据库，返回 resultId
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

/**
 * MBTI 四维度计分
 * @param {Array<{questionId: string, optionIndex: number}>} answers
 * @param {Array} questions
 * @returns {{EI: number, SN: number, TF: number, JP: number}}
 */
function calculateScores(answers, questions) {
  const scores = { EI: 0, SN: 0, TF: 0, JP: 0 }
  for (const answer of answers) {
    const question = questions.find(q => q.id === answer.questionId)
    if (!question) continue
    const option = question.options[answer.optionIndex]
    if (!option) continue
    const w = option.weights || {}
    if (w.EI !== undefined) scores.EI += w.EI
    if (w.SN !== undefined) scores.SN += w.SN
    if (w.TF !== undefined) scores.TF += w.TF
    if (w.JP !== undefined) scores.JP += w.JP
  }
  return scores
}

/**
 * 根据原始得分判定 MBTI 类型
 */
function determineType(scores) {
  const ei = scores.EI > 0 ? 'E' : 'I'
  const sn = scores.SN > 0 ? 'S' : 'N'
  const tf = scores.TF > 0 ? 'T' : 'F'
  const jp = scores.JP > 0 ? 'J' : 'P'
  return `${ei}${sn}${tf}${jp}`
}

/**
 * 计算各维度百分比（0-100）
 */
function toDimensionScores(rawScores, questions) {
  const maxScores = { EI: 0, SN: 0, TF: 0, JP: 0 }
  for (const question of questions) {
    for (const key of ['EI', 'SN', 'TF', 'JP']) {
      let maxW = 0
      for (const option of question.options) {
        const w = (option.weights || {})[key]
        if (w !== undefined && Math.abs(w) > maxW) maxW = Math.abs(w)
      }
      maxScores[key] += maxW
    }
  }
  const map = (raw, max) => {
    if (max === 0) return 50
    return Math.max(0, Math.min(100, Math.round(50 + (raw / max) * 50)))
  }
  return {
    EI: map(rawScores.EI, maxScores.EI),
    SN: map(rawScores.SN, maxScores.SN),
    TF: map(rawScores.TF, maxScores.TF),
    JP: map(rawScores.JP, maxScores.JP),
  }
}

/**
 * 计算各维度置信度（0-1）
 */
function calculateConfidence(rawScores, questions) {
  const maxScores = { EI: 0, SN: 0, TF: 0, JP: 0 }
  for (const question of questions) {
    for (const key of ['EI', 'SN', 'TF', 'JP']) {
      let maxW = 0
      for (const option of question.options) {
        const w = (option.weights || {})[key]
        if (w !== undefined && Math.abs(w) > maxW) maxW = Math.abs(w)
      }
      maxScores[key] += maxW
    }
  }
  const calc = (raw, max) => {
    if (max === 0) return 0.5
    return Math.min(1, Math.round((Math.abs(raw) / max) * 100) / 100)
  }
  return {
    EI: calc(rawScores.EI, maxScores.EI),
    SN: calc(rawScores.SN, maxScores.SN),
    TF: calc(rawScores.TF, maxScores.TF),
    JP: calc(rawScores.JP, maxScores.JP),
  }
}

/**
 * 生成随机分享 token（16位）
 */
function generateShareToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 16; i++) {
    token += chars[Math.floor(Math.random() * chars.length)]
  }
  return token
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { success: false, errMsg: '未获取到用户身份' }
  }

  const { sessionId, answers, dimensionScores: clientScores, questions: clientQuestions } = event

  if (!sessionId || !answers || !Array.isArray(answers)) {
    return { success: false, errMsg: '参数不完整' }
  }

  try {
    // 从数据库获取题目数据（防止客户端篡改）
    const questionsRes = await db.collection('questions').limit(100).get()
    let questions = questionsRes.data

    // 如果数据库没有题目数据，使用客户端传入的（兼容开发阶段）
    if (!questions || questions.length === 0) {
      if (clientQuestions && clientQuestions.length > 0) {
        questions = clientQuestions
      } else {
        return { success: false, errMsg: '题目数据缺失' }
      }
    }

    // 服务端重新计算分数
    const rawScores = calculateScores(answers, questions)
    const personalityType = determineType(rawScores)
    const dimensionScores = toDimensionScores(rawScores, questions)
    const confidence = calculateConfidence(rawScores, questions)

    // 计算答题时长
    const duration = event.duration || Math.round((Date.now() - (event.startTime || Date.now())) / 1000)

    // 生成分享 token
    const shareToken = generateShareToken()

    const resultId = `result_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const record = {
      resultId,
      _openid: openid,
      userId: openid,
      sessionId,
      personalityType,
      dimensionScores,
      confidence,
      answers,
      duration,
      completedAt: Date.now(),
      reportUnlocked: false,
      shareToken,
      createdAt: Date.now(),
    }

    await db.collection('test_results').add({ data: record })

    // 更新用户的 latestType
    await db.collection('users').where({ _openid: openid }).update({
      data: {
        latestType: personalityType,
        lastLoginAt: Date.now(),
      }
    }).catch(() => {
      // 用户不存在时忽略
    })

    return {
      success: true,
      data: {
        resultId,
        personalityType,
        dimensionScores,
        confidence,
        shareToken,
        completedAt: record.completedAt,
        duration,
        reportUnlocked: false,
      }
    }
  } catch (err) {
    console.error('[submitResult] 提交失败:', err)
    return { success: false, errMsg: '提交失败，请重试' }
  }
}
