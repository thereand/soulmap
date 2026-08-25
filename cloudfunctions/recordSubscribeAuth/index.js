/**
 * 灵魂星图 - recordSubscribeAuth 云函数
 *
 * 客户端调用 wx.requestSubscribeMessage 后，将用户授权结果落库到 subscribe_authorizations 集合，
 * 供 timedTask 云函数在推送前校验 remainingQuota。
 *
 * 输入 event:
 *   {
 *     grants: {
 *       [templateId]: 'accept' | 'reject' | 'ban' | 'filter'
 *     }
 *   }
 *
 * 集合结构 subscribe_authorizations:
 *   { _openid, templateId, templateType, remainingQuota, updatedAt }
 *
 * templateType 反查（与 sendMessage 的 DEFAULT_TEMPLATE 保持一致）：
 *   6aJZEBQsamKOnGVxOW6hOwIR8Bqdp1k941yjm_bp-0o  → 'reportExpire'
 *   uzpI4UGFf8eaGWSjwtiS8qGdTWz_VMPUtO8YM_RNhew  → 'friendDynamic'
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

const TEMPLATE_TYPE_MAP = {
  '6aJZEBQsamKOnGVxOW6hOwIR8Bqdp1k941yjm_bp-0o': 'reportExpire',
  'uzpI4UGFf8eaGWSjwtiS8qGdTWz_VMPUtO8YM_RNhew': 'friendDynamic',
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  if (!openid) return { success: false, errMsg: '未获取到用户身份' }

  const grants = (event && event.grants) || {}
  const entries = Object.keys(grants)
  if (entries.length === 0) return { success: true, data: { recorded: 0 } }

  let recorded = 0
  const results = []
  const now = Date.now()

  for (const templateId of entries) {
    const state = grants[templateId]
    const accepted = state === 'accept'
    // 一次性订阅：每次 accept 额度 +1
    // 如果用户拒绝了，不做任何操作（保留已有额度）
    if (!accepted) {
      results.push({ templateId, state, skipped: true })
      continue
    }

    const templateType = TEMPLATE_TYPE_MAP[templateId] || 'unknown'

    try {
      // 查找是否已有记录
      const existRes = await db.collection('subscribe_authorizations')
        .where({ _openid: openid, templateId })
        .limit(1)
        .get()

      if (existRes.data && existRes.data.length > 0) {
        // 已有记录 → 额度 +1
        const doc = existRes.data[0]
        await db.collection('subscribe_authorizations').doc(doc._id).update({
          data: {
            remainingQuota: _.inc(1),
            updatedAt: now,
          },
        })
      } else {
        // 新建记录
        await db.collection('subscribe_authorizations').add({
          data: {
            _openid: openid,
            templateId,
            templateType,
            remainingQuota: 1,
            createdAt: now,
            updatedAt: now,
          },
        })
      }
      recorded++
      results.push({ templateId, templateType, state, success: true })
    } catch (err) {
      console.error('[recordSubscribeAuth] 写入失败:', templateId, err && err.message)
      results.push({ templateId, state, success: false, error: err && err.message })
    }
  }

  return {
    success: true,
    data: { recorded, results },
  }
}
