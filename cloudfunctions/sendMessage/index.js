/**
 * 灵魂星图 - sendMessage 云函数
 * 通过 cloud.openapi 发送订阅消息，用于支付挽回与好友动态提醒
 *
 * event.type 支持：
 *   - 'reportExpire': 报告即将过期提醒（映射到小程序后台的「报告完成通知」模板）
 *       字段顺序：项目名称(thing1) → 完成时间(time2) → 备注(thing3)
 *   - 'friendDynamic': 好友完成测试对比提醒（映射到「好友申请通知」模板）
 *       字段顺序：申请人(thing1) → 申请时间(time2) → 备注(thing3)
 *
 * event.data:
 *   {
 *     toOpenid: string,       // 目标用户 openid
 *     templateId: string,     // 订阅消息模板 ID（可选，缺省用 DEFAULT_TEMPLATE）
 *     type: 'reportExpire' | 'friendDynamic',
 *     payload: { ... }        // 模板字段填充数据
 *   }
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

/**
 * 订阅消息模板 ID —— 已在 mp.weixin.qq.com 「基础功能 → 订阅消息 → 我的模板」中配置
 * 报告完成通知：项目名称/完成时间/备注 (对应 reportExpire 场景)
 * 好友申请通知：申请人/申请时间/备注 (对应 friendDynamic 场景)
 */
const DEFAULT_TEMPLATE = {
  reportExpire: '6aJZEBQsamKOnGVxOW6hOwIR8Bqdp1k941yjm_bp-0o',
  friendDynamic: 'uzpI4UGFf8eaGWSjwtiS8qGdTWz_VMPUtO8YM_RNhew',
}

/** 格式化时间为微信订阅消息 time 字段可接受的格式（yyyy-MM-dd HH:mm） */
function formatWxTime(ts) {
  const d = ts ? new Date(ts) : new Date()
  if (isNaN(d.getTime())) return ''
  const pad = (n) => (n < 10 ? '0' + n : String(n))
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 截断到 ≤N 字（thing/character_string 字段限制 20 字） */
function truncate(s, n) {
  const str = String(s == null ? '' : s)
  return str.length > n ? str.slice(0, n) : str
}

function buildTemplateData(type, payload) {
  const p = payload || {}
  if (type === 'reportExpire') {
    // 项目名称 → 完成时间 → 备注
    return {
      thing1: { value: truncate(p.reportName || '你的灵魂星灵解读报告', 20) },
      time2: { value: p.completedAtText || formatWxTime(p.completedAt) || formatWxTime() },
      thing3: { value: truncate(p.offerText || '点击查看限时特惠 ¥6.9', 20) },
    }
  }
  if (type === 'friendDynamic') {
    // 申请人 → 申请时间 → 备注
    return {
      thing1: { value: truncate(p.friendMsg || p.friendName || '你的好友', 20) },
      time2: { value: p.actionAtText || formatWxTime(p.actionAt) || formatWxTime() },
      thing3: { value: truncate(p.action || '来看看你们的灵魂契合度', 20) },
    }
  }
  return {}
}

exports.main = async (event) => {
  const { toOpenid, type, templateId, payload, page } = event || {}
  if (!toOpenid || !type) {
    return { success: false, errMsg: 'toOpenid / type 不能为空' }
  }

  const tplId = templateId || DEFAULT_TEMPLATE[type]
  if (!tplId || tplId.indexOf('REPLACE_WITH_REAL_TEMPLATE_ID') === 0) {
    return {
      success: false,
      errMsg: '模板 ID 未配置，请在小程序后台申请订阅消息模板并替换 sendMessage 云函数中的常量',
    }
  }

  const data = buildTemplateData(type, payload)
  const targetPage = page || (type === 'friendDynamic'
    ? 'pagesReport/compare/index'
    : 'pagesTest/result/index?showOffer=true')

  try {
    const res = await cloud.openapi.subscribeMessage.send({
      touser: toOpenid,
      templateId: tplId,
      page: targetPage,
      data,
      miniprogramState: 'formal',
      lang: 'zh_CN',
    })
    return { success: true, data: res }
  } catch (err) {
    console.error('[sendMessage] 发送失败:', err)
    return {
      success: false,
      errMsg: (err && err.errMsg) || (err && err.message) || '发送订阅消息失败',
      errCode: err && err.errCode,
    }
  }
}
