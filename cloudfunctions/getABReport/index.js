/**
 * 灵魂星图 - getABReport 云函数
 *
 * 从 events 集合聚合指定实验的曝光/转化数据，输出各组指标。
 *
 * event:
 *   {
 *     experimentId: string,   // 必填
 *     metric?: string,        // 指标事件（如 'pay_success'）；未传则统计 ab_conversion
 *     startTime?: number,     // 起始时间戳
 *     endTime?: number,       // 结束时间戳
 *   }
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const { experimentId } = event || {}
  if (!experimentId) return { success: false, errMsg: 'experimentId 必填' }

  const metric = event.metric || 'ab_conversion'
  const endTime = Number(event.endTime) || Date.now()
  const startTime = Number(event.startTime) || (endTime - 7 * 24 * 60 * 60 * 1000)

  try {
    const exposures = await db.collection('events')
      .where({
        event: 'ab_exposure',
        'params.experimentId': experimentId,
        timestamp: _.gte(startTime).and(_.lte(endTime)),
      })
      .limit(1000)
      .get()

    const conversions = await db.collection('events')
      .where({
        event: metric,
        'params.experimentId': experimentId,
        timestamp: _.gte(startTime).and(_.lte(endTime)),
      })
      .limit(1000)
      .get()

    const expoMap = {}
    const convMap = {}

    ;(exposures.data || []).forEach((e) => {
      const v = e.params && e.params.variant
      if (!v) return
      if (!expoMap[v]) expoMap[v] = new Set()
      expoMap[v].add(e.userId || e._openid || Math.random().toString())
    })

    ;(conversions.data || []).forEach((e) => {
      const v = e.params && e.params.variant
      if (!v) return
      if (!convMap[v]) convMap[v] = new Set()
      convMap[v].add(e.userId || e._openid || Math.random().toString())
    })

    const variantSet = new Set([...Object.keys(expoMap), ...Object.keys(convMap)])
    const variants = Array.from(variantSet).map((v) => {
      const expo = (expoMap[v] || new Set()).size
      const conv = (convMap[v] || new Set()).size
      const cvr = expo ? Math.round((conv / expo) * 10000) / 10000 : 0
      return { variant: v, exposures: expo, conversions: conv, cvr }
    })

    return {
      success: true,
      data: {
        experimentId,
        metric,
        range: { startTime, endTime },
        variants,
      },
    }
  } catch (err) {
    console.error('[getABReport] error:', err)
    return { success: false, errMsg: (err && err.message) || 'getABReport error' }
  }
}
