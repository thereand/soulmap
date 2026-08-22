/**
 * 灵魂星图 - shareToken 云函数
 * 生成分享 token 或解析分享 token 获取结果信息
 *
 * action:
 *   'generate' - 为指定 resultId 生成分享 token
 *   'resolve'  - 根据分享 token 解析对应的测试结果摘要
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

/**
 * 生成随机分享 token（16位字母数字）
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
  const { action } = event

  // ========== 解析分享 token（无需登录） ==========
  if (action === 'resolve') {
    const { token } = event
    if (!token) {
      return { success: false, errMsg: '缺少 token 参数' }
    }

    try {
      const res = await db.collection('test_results')
        .where({ shareToken: token })
        .limit(1)
        .get()

      if (!res.data || res.data.length === 0) {
        return { success: false, errMsg: '分享链接无效或已过期' }
      }

      const result = res.data[0]

      // 只返回公开的摘要信息（不暴露敏感数据）
      return {
        success: true,
        data: {
          resultId: result.resultId,
          personalityType: result.personalityType,
          dimensionScores: result.dimensionScores,
          completedAt: result.completedAt,
          duration: result.duration,
        }
      }
    } catch (err) {
      console.error('[shareToken] 解析 token 失败:', err)
      return { success: false, errMsg: '解析分享链接失败' }
    }
  }

  // ========== 生成分享 token（需要登录） ==========
  if (action === 'generate') {
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    if (!openid) {
      return { success: false, errMsg: '未获取到用户身份' }
    }

    const { resultId } = event
    if (!resultId) {
      return { success: false, errMsg: '缺少 resultId 参数' }
    }

    try {
      // 验证结果归属
      const resultRes = await db.collection('test_results')
        .where({ resultId, _openid: openid })
        .limit(1)
        .get()

      if (!resultRes.data || resultRes.data.length === 0) {
        return { success: false, errMsg: '测试结果不存在或无权操作' }
      }

      const result = resultRes.data[0]

      // 如果已有 token，直接返回
      if (result.shareToken) {
        return {
          success: true,
          data: { shareToken: result.shareToken }
        }
      }

      // 生成新 token 并更新
      const shareToken = generateShareToken()

      await db.collection('test_results').doc(result._id).update({
        data: { shareToken, shareTokenCreatedAt: Date.now() }
      })

      return {
        success: true,
        data: { shareToken }
      }
    } catch (err) {
      console.error('[shareToken] 生成 token 失败:', err)
      return { success: false, errMsg: '生成分享链接失败' }
    }
  }

  return { success: false, errMsg: `不支持的操作: ${action}，请使用 generate 或 resolve` }
}
