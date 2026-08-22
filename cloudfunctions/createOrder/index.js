/**
 * 灵魂星图 - createOrder 云函数
 * 接收 resultId 和 productType，创建订单记录，调用微信支付统一下单，返回支付参数
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

/** 产品定价（单位：分） */
const PRODUCT_PRICES = {
  basic: 990,       // ¥9.9
  advanced: 1990,   // ¥19.9
  comparison: 1990, // ¥19.9
}

/** 产品名称 */
const PRODUCT_NAMES = {
  basic: '基础版完整报告',
  advanced: '深度版完整报告',
  comparison: '双人对比报告',
}

/**
 * 生成唯一订单号
 * 格式：SOUL + 年月日时分秒 + 6位随机数
 */
function generateOrderId() {
  const now = new Date()
  const pad = (n, len = 2) => String(n).padStart(len, '0')
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  const rand = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  return `SOUL${date}${time}${rand}`
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  if (!openid) {
    return { success: false, errMsg: '未获取到用户身份' }
  }

  const { resultId, productType } = event

  if (!resultId || !productType) {
    return { success: false, errMsg: '参数不完整，需要 resultId 和 productType' }
  }

  if (!PRODUCT_PRICES[productType]) {
    return { success: false, errMsg: `不支持的产品类型: ${productType}` }
  }

  try {
    // 验证测试结果存在
    const resultRes = await db.collection('test_results')
      .where({ resultId, _openid: openid })
      .limit(1)
      .get()

    if (!resultRes.data || resultRes.data.length === 0) {
      return { success: false, errMsg: '测试结果不存在或无权访问' }
    }

    const testResult = resultRes.data[0]

    // 检查是否已有有效订单（防重复下单）
    const existOrderRes = await db.collection('orders')
      .where({
        userId: openid,
        resultId,
        productId: productType,
        status: db.command.in(['pending', 'paying']),
      })
      .limit(1)
      .get()

    if (existOrderRes.data && existOrderRes.data.length > 0) {
      const existOrder = existOrderRes.data[0]
      // 如果订单未过期，返回现有订单
      if (existOrder.expireAt > Date.now()) {
        return {
          success: true,
          data: {
            orderId: existOrder.orderId,
            amount: existOrder.amount,
            status: existOrder.status,
            expireAt: existOrder.expireAt,
          }
        }
      }
      // 已过期则标记为 expired
      await db.collection('orders').doc(existOrder._id).update({
        data: { status: 'expired', updatedAt: Date.now() }
      })
    }

    // 检查是否已付费（避免重复购买）
    const paidOrderRes = await db.collection('orders')
      .where({
        userId: openid,
        resultId,
        productId: productType,
        status: 'paid',
      })
      .limit(1)
      .get()

    if (paidOrderRes.data && paidOrderRes.data.length > 0) {
      return { success: false, errMsg: '该报告已购买，无需重复支付' }
    }

    const amount = PRODUCT_PRICES[productType]
    const orderId = generateOrderId()
    const now = Date.now()
    const expireAt = now + 30 * 60 * 1000 // 30分钟有效期

    // 创建订单记录
    const orderData = {
      orderId,
      _openid: openid,
      userId: openid,
      productId: productType,
      productName: PRODUCT_NAMES[productType],
      amount,
      status: 'pending',
      payMethod: 'wechat',
      resultId,
      createdAt: now,
      expireAt,
      updatedAt: now,
    }

    await db.collection('orders').add({ data: orderData })

    // 调用微信支付统一下单
    let payParams = null
    try {
      const payRes = await cloud.cloudPay.unifiedOrder({
        body: `灵魂星图 - ${PRODUCT_NAMES[productType]}`,
        outTradeNo: orderId,
        spbillCreateIp: '127.0.0.1',
        subMchId: '', // TODO: 填入子商户号
        totalFee: amount,
        envId: cloud.DYNAMIC_CURRENT_ENV,
        functionName: 'payCallback', // 支付回调云函数
        nonceStr: generateNonceStr(),
        tradeType: 'JSAPI',
      })

      if (payRes && payRes.payment) {
        payParams = payRes.payment
        // 更新订单状态为 paying
        await db.collection('orders').where({ orderId }).update({
          data: { status: 'paying', updatedAt: Date.now() }
        })
      }
    } catch (payErr) {
      console.error('[createOrder] 统一下单失败:', payErr)
      // 开发阶段：即使下单失败也返回订单信息（方便调试）
      payParams = {
        orderId,
        amount,
        // 开发模式标记
        devMode: true,
      }
    }

    return {
      success: true,
      data: {
        orderId,
        amount,
        productName: PRODUCT_NAMES[productType],
        status: 'pending',
        expireAt,
        payParams,
      }
    }
  } catch (err) {
    console.error('[createOrder] 创建订单失败:', err)
    return { success: false, errMsg: '创建订单失败，请重试' }
  }
}

/**
 * 生成随机字符串（32位）
 */
function generateNonceStr() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let str = ''
  for (let i = 0; i < 32; i++) {
    str += chars[Math.floor(Math.random() * chars.length)]
  }
  return str
}
