/**
 * 灵魂星图 - trackEvents 云函数
 * 接收客户端批量上报的埋点事件，写入 events 集合
 *
 * 输入：{ events: TrackEvent[] }
 * 输出：{ success: true, data: { received: number } }
 *
 * events 集合建议配置：
 *  - 建议在云开发控制台为 events 集合添加索引 (event + timestamp)
 *  - 建议开启 TTL：以 timestamp 为过期字段，30 天后自动过期
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

const MAX_BATCH = 100

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID || ''

  const rawEvents = Array.isArray(event.events) ? event.events : []
  if (rawEvents.length === 0) {
    return { success: true, data: { received: 0 } }
  }

  const batch = rawEvents.slice(0, MAX_BATCH).map((e) => ({
    event: String(e.event || '').slice(0, 64),
    params: e.params || {},
    timestamp: Number(e.timestamp) || Date.now(),
    sessionId: String(e.sessionId || '').slice(0, 64),
    userId: String(e.userId || '').slice(0, 64),
    page: String(e.page || '').slice(0, 128),
    platform: String(e.platform || 'unknown'),
    _openid: openid,
    createdAt: Date.now(),
  }))

  try {
    // 云开发不支持 insertMany，串行批量写入（限制 100 内一般 500ms 内完成）
    const collection = db.collection('events')
    const results = await Promise.all(
      batch.map((doc) =>
        collection.add({ data: doc }).catch((err) => ({ error: err && err.message })),
      ),
    )
    const okCount = results.filter((r) => r && !r.error).length

    return {
      success: true,
      data: {
        received: okCount,
        failed: batch.length - okCount,
      },
    }
  } catch (err) {
    console.error('[trackEvents] 写入失败:', err)
    return { success: false, errMsg: err && err.message ? err.message : 'trackEvents error' }
  }
}
