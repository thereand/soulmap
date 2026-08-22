/**
 * 灵魂星图 - timedTask 云函数
 *
 * 建议：在云开发控制台为该云函数添加定时触发器
 *   cron 表达式：0 0 20 * * * *   （每天 20:00 触发）
 *
 * 逻辑：
 *  1. 从 test_results 中查询 24h 前完成但仍未付费的用户
 *  2. 检查 subscribeAuthorizations 集合确认用户是否授权 reportExpire 订阅
 *  3. 调用 sendMessage 云函数发送提醒
 *  4. 记录 message_logs，避免重复推送
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

exports.main = async (event) => {
  const now = Date.now()
  const dryRun = event && event.dryRun === true

  // 目标群体：24-48h 完成但未付费的用户
  const startTime = now - 48 * HOUR
  const endTime = now - 24 * HOUR

  const stats = { scanned: 0, sent: 0, failed: 0, skipped: 0 }

  try {
    const list = await db.collection('test_results')
      .where({
        completedAt: _.gte(startTime).and(_.lte(endTime)),
        reportUnlocked: _.neq(true),
      })
      .limit(200)
      .get()

    for (const r of list.data || []) {
      stats.scanned++
      const openid = r._openid || r.userId
      if (!openid) { stats.skipped++; continue }

      // 检查是否已发送过
      const logExist = await db.collection('message_logs')
        .where({ toOpenid: openid, type: 'reportExpire', sentAt: _.gte(now - DAY) })
        .limit(1)
        .get()
      if (logExist.data && logExist.data.length > 0) { stats.skipped++; continue }

      // 检查用户订阅授权
      const auth = await db.collection('subscribe_authorizations')
        .where({ _openid: openid, templateType: 'reportExpire', remainingQuota: _.gt(0) })
        .limit(1)
        .get()
      if (!auth.data || auth.data.length === 0) { stats.skipped++; continue }

      if (dryRun) { stats.sent++; continue }

      // 调用 sendMessage 云函数
      try {
        const sendRes = await cloud.callFunction({
          name: 'sendMessage',
          data: {
            toOpenid: openid,
            type: 'reportExpire',
            page: `pagesTest/result/index?showOffer=true`,
            payload: {
              reportName: '你的灵魂星灵解读报告',
              completedAt: r.completedAt || (now - 24 * HOUR),
              offerText: '点击查看最终特惠 ¥5.9',
            },
          },
        })
        const ok = sendRes && sendRes.result && sendRes.result.success
        if (ok) {
          stats.sent++
          await db.collection('message_logs').add({
            data: {
              toOpenid: openid,
              type: 'reportExpire',
              sentAt: now,
              success: true,
            },
          })
          // 扣减订阅额度
          await db.collection('subscribe_authorizations')
            .where({ _openid: openid, templateType: 'reportExpire' })
            .update({ data: { remainingQuota: _.inc(-1) } })
        } else {
          stats.failed++
        }
      } catch (err) {
        stats.failed++
        console.error('[timedTask] 发送失败:', openid, err && err.message)
      }
    }

    return { success: true, data: stats }
  } catch (err) {
    console.error('[timedTask] 执行失败:', err)
    return { success: false, errMsg: (err && err.message) || 'timedTask error', data: stats }
  }
}
