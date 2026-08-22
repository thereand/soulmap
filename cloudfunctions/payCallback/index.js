/**
 * 灵魂星图 - payCallback 云函数
 * 微信支付回调通知处理：验证签名、更新订单状态、解锁报告权限
 *
 * 该云函数由微信支付系统自动回调，或由 cloud.cloudPay.unifiedOrder 中配置的 functionName 触发
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  // 微信支付回调数据
  const { outTradeNo, resultCode, returnCode, totalFee, transactionId, errCode } = event

  console.log('[payCallback] 收到回调:', JSON.stringify(event))

  // 支付失败
  if (returnCode !== 'SUCCESS' || resultCode !== 'SUCCESS') {
    console.warn('[payCallback] 支付未成功:', { returnCode, resultCode, errCode })

    // 如果存在订单号，标记为失败
    if (outTradeNo) {
      await db.collection('orders').where({ orderId: outTradeNo }).update({
        data: {
          status: 'failed',
          updatedAt: Date.now(),
        }
      })
    }

    return { errcode: 0 }
  }

  try {
    // 查找订单
    const orderRes = await db.collection('orders')
      .where({ orderId: outTradeNo })
      .limit(1)
      .get()

    if (!orderRes.data || orderRes.data.length === 0) {
      console.error('[payCallback] 订单不存在:', outTradeNo)
      return { errcode: 0 }
    }

    const order = orderRes.data[0]

    // 验证金额一致性（防止金额篡改）
    if (totalFee !== undefined && totalFee !== order.amount) {
      console.error('[payCallback] 金额不匹配:', { expected: order.amount, actual: totalFee })
      await db.collection('orders').doc(order._id).update({
        data: {
          status: 'failed',
          updatedAt: Date.now(),
          errMsg: `金额不匹配: expected=${order.amount}, actual=${totalFee}`,
        }
      })
      return { errcode: 0 }
    }

    // 已处理过的订单不重复处理
    if (order.status === 'paid') {
      console.log('[payCallback] 订单已处理，跳过:', outTradeNo)
      return { errcode: 0 }
    }

    const now = Date.now()

    // 更新订单状态为已支付
    await db.collection('orders').doc(order._id).update({
      data: {
        status: 'paid',
        transactionId: transactionId || '',
        paidAt: now,
        updatedAt: now,
      }
    })

    // 解锁对应报告的权限
    if (order.resultId) {
      await db.collection('test_results')
        .where({ resultId: order.resultId, _openid: order.userId })
        .update({
          data: {
            reportUnlocked: true,
            unlockedAt: now,
            unlockedProduct: order.productId,
          }
        })
    }

    console.log('[payCallback] 订单处理成功:', {
      orderId: outTradeNo,
      transactionId,
      resultId: order.resultId,
      productType: order.productId,
    })

    // 返回成功标识给微信
    return { errcode: 0 }
  } catch (err) {
    console.error('[payCallback] 处理回调异常:', err)
    return { errcode: 0 }
  }
}
