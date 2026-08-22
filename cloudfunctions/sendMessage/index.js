/**
 * 灵魂星图 - sendMessage 云函数
 * 通过 cloud.openapi 发送订阅消息，用于支付挽回与好友动态提醒
 *
 * event.type 支持：
 *   - 'reportExpire': 报告即将过期提醒
 *   - 'friendDynamic': 好友完成测试对比提醒
 *
 * event.data:
 *   {
 *     toOpenid: string,       // 目标用户 openid
 *     templateId: string,     // 订阅消息模板 ID（在小程序后台申请）
 *     type: 'reportExpire' | 'friendDynamic',
 *     payload: { ... }        // 模板字段填充数据
 *   }
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const DEFAULT_TEMPLATE = {
  reportExpire: 'REPLACE_WITH_REAL_TEMPLATE_ID_1',
  friendDynamic: 'REPLACE_WITH_REAL_TEMPLATE_ID_2',
}

function buildTemplateData(type, payload) {
  const p = payload || {}
  if (type === 'reportExpire') {
    return {
      thing1: { value: (p.reportName || '你的灵魂星灵解读报告').slice(0, 20) },
      time2: { value: p.expireText || '24 小时后过期' },
      thing3: { value: (p.offerText || '点击查看限时特惠 ¥6.9').slice(0, 20) },
    }
  }
  if (type === 'friendDynamic') {
    return {
      thing1: { value: (p.friendMsg || '你的好友刚完成了灵魂测试').slice(0, 20) },
      thing3: { value: (p.action || '来看看你们的灵魂契合度').slice(0, 20) },
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

  try {
    const res = await cloud.openapi.subscribeMessage.send({
      touser: toOpenid,
      templateId: tplId,
      page: page || 'pages/index/index',
      data: buildTemplateData(type, payload),
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
