/**
 * 灵魂星图 - getReport 云函数
 * 验证用户已付费，返回对应类型的完整报告数据
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

/** 产品定价 */
const PRODUCT_PRICES = {
  basic: 990,
  advanced: 1990,
  comparison: 1990,
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { success: false, errMsg: '未获取到用户身份' }
  }

  const { resultId, type, secondResultId } = event

  if (!resultId) {
    return { success: false, errMsg: '缺少 resultId 参数' }
  }

  const reportType = type || 'basic'

  if (!PRODUCT_PRICES[reportType] && reportType !== 'free') {
    return { success: false, errMsg: `不支持的报告类型: ${reportType}` }
  }

  try {
    // 获取测试结果
    const resultRes = await db.collection('test_results')
      .where({ resultId, _openid: openid })
      .limit(1)
      .get()

    if (!resultRes.data || resultRes.data.length === 0) {
      return { success: false, errMsg: '测试结果不存在或无权访问' }
    }

    const testResult = resultRes.data[0]

    // 免费报告直接返回基础信息
    if (reportType === 'free') {
      return {
        success: true,
        data: {
          resultId: testResult.resultId,
          personalityType: testResult.personalityType,
          dimensionScores: testResult.dimensionScores,
          confidence: testResult.confidence,
          completedAt: testResult.completedAt,
          duration: testResult.duration,
          reportType: 'free',
        }
      }
    }

    // 付费报告：验证是否已付费
    const paidOrderRes = await db.collection('orders')
      .where({
        userId: openid,
        resultId,
        productId: reportType,
        status: 'paid',
      })
      .limit(1)
      .get()

    const hasPaid = paidOrderRes.data && paidOrderRes.data.length > 0

    // 也检查 test_results 中的 reportUnlocked 标记
    const isUnlocked = testResult.reportUnlocked === true

    if (!hasPaid && !isUnlocked) {
      return {
        success: false,
        errMsg: '该报告尚未购买',
        errCode: 'UNPAID',
        data: {
          needPay: true,
          price: PRODUCT_PRICES[reportType],
          productType: reportType,
        }
      }
    }

    // 构建报告数据
    const reportData = {
      resultId: testResult.resultId,
      personalityType: testResult.personalityType,
      dimensionScores: testResult.dimensionScores,
      confidence: testResult.confidence,
      completedAt: testResult.completedAt,
      duration: testResult.duration,
      reportType,
      unlocked: true,
    }

    // comparison 类型需要第二个人的结果
    if (reportType === 'comparison' && secondResultId) {
      const secondRes = await db.collection('test_results')
        .where({ resultId: secondResultId })
        .limit(1)
        .get()

      if (secondRes.data && secondRes.data.length > 0) {
        const secondResult = secondRes.data[0]
        reportData.secondResult = {
          resultId: secondResult.resultId,
          personalityType: secondResult.personalityType,
          dimensionScores: secondResult.dimensionScores,
          confidence: secondResult.confidence,
        }
      }
    }

    return {
      success: true,
      data: reportData,
    }
  } catch (err) {
    console.error('[getReport] 获取报告失败:', err)
    return { success: false, errMsg: '获取报告失败，请重试' }
  }
}
