/**
 * 人格星图 - 支付逻辑组合式函数
 * 管理支付流程：创建订单 → 调起支付 → 处理结果 → 更新状态
 */
import { ref } from 'vue'
import { paymentService, PRODUCT_PRICES, PRODUCT_NAMES, formatPrice } from '@/services/payment.service'
import { callCloud } from '@/services/cloud'
import type { OrderResponse } from '@/services/payment.service'

/** 支付产品选项 */
export interface PaymentProductOption {
  type: 'basic' | 'advanced' | 'comparison'
  name: string
  price: number
  priceLabel: string
}

/** 可用产品列表 */
export const PAYMENT_PRODUCTS: PaymentProductOption[] = [
  {
    type: 'basic',
    name: PRODUCT_NAMES.basic,
    price: PRODUCT_PRICES.basic,
    priceLabel: formatPrice(PRODUCT_PRICES.basic),
  },
  {
    type: 'advanced',
    name: PRODUCT_NAMES.advanced,
    price: PRODUCT_PRICES.advanced,
    priceLabel: formatPrice(PRODUCT_PRICES.advanced),
  },
  {
    type: 'comparison',
    name: PRODUCT_NAMES.comparison,
    price: PRODUCT_PRICES.comparison,
    priceLabel: formatPrice(PRODUCT_PRICES.comparison),
  },
]

export function usePayment() {
  /** 是否正在处理支付 */
  const isLoading = ref(false)

  /** 是否已付费（当前结果） */
  const isPaid = ref(false)

  /** 当前订单 */
  const currentOrder = ref<OrderResponse | null>(null)

  /** 支付错误信息 */
  const payError = ref<string>('')

  /** 已付费的产品类型 */
  const paidProductType = ref<string>('')

  /** 是否为 iOS 平台（小程序端用于虚拟支付限制） */
  const isIOS = ref(false)

  /** 初始化平台检测（在 MP-WEIXIN 端调用 wx.getSystemInfoSync 一次） */
  function detectPlatform() {
    // #ifdef MP-WEIXIN
    try {
      /* @ts-ignore */
      const info = wx.getSystemInfoSync()
      isIOS.value = /ios/i.test(info?.platform || '')
    } catch {
      isIOS.value = false
    }
    // #endif
  }
  detectPlatform()

  /**
   * 创建订单并发起支付
   *
   * @param resultId - 测试结果 ID
   * @param productType - 产品类型
   * @returns 是否支付成功
   */
  async function payForReport(
    resultId: string,
    productType: 'basic' | 'advanced' | 'comparison'
  ): Promise<boolean> {
    if (isLoading.value) return false

    // iOS 小程序虚拟支付限制（微信硬性要求）
    if (isIOS.value) {
      payError.value = '因平台政策，iOS 端暂不支持应用内购买，请使用安卓设备或 H5 端'
      uni.showToast({ title: payError.value, icon: 'none', duration: 2800 })
      return false
    }

    isLoading.value = true
    payError.value = ''

    try {
      // Step 1: 创建订单
      const orderRes = await paymentService.createOrder({ resultId, productType })

      if (!orderRes.success || !orderRes.data) {
        payError.value = orderRes.errMsg || '创建订单失败'
        return false
      }

      currentOrder.value = orderRes.data
      const { payParams, orderId } = orderRes.data

      // Step 2: 调起支付
      // #ifdef MP-WEIXIN
      if (payParams && !payParams.devMode) {
        // 微信小程序端：使用 wx.requestPayment 调起微信支付
        const paySuccess = await wxRequestPayment(payParams)
        if (paySuccess) {
          handlePaySuccess(orderId)
          return true
        }
        return false
      }
      // #endif

      // #ifdef H5
      // H5 端：引导用户跳转支付或显示二维码
      // 开发阶段直接模拟支付成功
      if (payParams?.devMode) {
        console.log('[Payment] H5 开发模式：模拟支付成功')
        handlePaySuccess(orderId)
        return true
      }

      // 生产环境：跳转支付页面
      console.log('[Payment] H5 端跳转支付')
      // TODO: 实现 H5 支付跳转逻辑
      payError.value = 'H5 端支付暂未开放，请在小程序端完成支付'
      return false
      // #endif

      // 兜底
      payError.value = '当前平台暂不支持支付'
      return false
    } catch (e: any) {
      handlePayFail(e)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 使用已有的订单直接发起支付（跳过 createOrder 步骤）
   * 适用于：compare.createPayOrder 等外部已经创建好订单并返回 payParams 的场景
   *
   * @param order - 云函数返回的 order 数据，至少包含 { orderId, payParams }
   * @returns 是否支付成功
   */
  async function payWithOrder(order: OrderResponse): Promise<boolean> {
    if (isLoading.value) return false
    if (isIOS.value) {
      payError.value = '因平台政策，iOS 端暂不支持应用内购买，请使用安卓设备或 H5 端'
      uni.showToast({ title: payError.value, icon: 'none', duration: 2800 })
      return false
    }
    isLoading.value = true
    payError.value = ''
    currentOrder.value = order

    try {
      const { payParams, orderId } = order

      // #ifdef MP-WEIXIN
      if (payParams && !payParams.devMode) {
        const ok = await wxRequestPayment(payParams)
        if (ok) {
          handlePaySuccess(orderId)
          return true
        }
        return false
      }
      // #endif

      // #ifdef H5
      if (payParams?.devMode) {
        console.log('[Payment] H5 开发模式：模拟支付成功')
        handlePaySuccess(orderId)
        return true
      }
      payError.value = 'H5 端支付暂未开放，请在小程序端完成支付'
      return false
      // #endif

      // 开发模式兜底：模拟成功
      if (payParams?.devMode) {
        console.log('[Payment] devMode 模拟支付成功')
        handlePaySuccess(orderId)
        return true
      }

      payError.value = '当前平台暂不支持支付'
      return false
    } catch (e: any) {
      handlePayFail(e)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 检查是否已付费
   */
  async function checkPaymentStatus(resultId: string, productType?: string): Promise<boolean> {
    try {
      // 检查 basic 类型
      const types = productType ? [productType] : ['basic', 'advanced', 'comparison']

      for (const type of types) {
        const paid = await paymentService.checkPaid(resultId, type)
        if (paid) {
          isPaid.value = true
          paidProductType.value = type
          return true
        }
      }

      isPaid.value = false
      paidProductType.value = ''
      return false
    } catch {
      return false
    }
  }

  /**
   * 支付成功处理（含云端回查：防止 payCallback 延迟导致的掉单）
   */
  async function handlePaySuccess(orderId: string) {
    isPaid.value = true
    payError.value = ''

    if (currentOrder.value) {
      currentOrder.value.status = 'paid'
      paidProductType.value = currentOrder.value.productName || ''
    }

    // 本地缓存支付状态（兜底，便于弱网/刷新场景快速恢复）
    try {
      const paidResults = JSON.parse(uni.getStorageSync('soulmap_paid_results') || '{}')
      if (currentOrder.value) {
        paidResults[currentOrder.value.orderId] = {
          orderId,
          paidAt: Date.now(),
          productType: currentOrder.value.productName,
          productId: currentOrder.value.productId || '',
          resultId: currentOrder.value.resultId || '',
        }
        uni.setStorageSync('soulmap_paid_results', JSON.stringify(paidResults))
      }
    } catch {
      // 缓存失败不影响主流程
    }

    // 云端回查：最多重试 3 次，间隔 1.5s，等待 payCallback 落库
    // 仅作为防掉单双保险，不影响 UI 主流程
    void verifyOrderAsync(orderId)

    uni.showToast({ title: '支付成功', icon: 'success' })
    console.log('[Payment] 支付成功:', orderId)
  }

  /** 异步回查订单状态，最多 3 次 */
  async function verifyOrderAsync(orderId: string) {
    const MAX = 3
    const DELAY = 1500
    for (let i = 0; i < MAX; i++) {
      await new Promise((r) => setTimeout(r, DELAY))
      try {
        const res = await callCloud<{ status: string }>('createOrder', {
          action: 'verifyOrder',
          orderId,
        })
        if (res.success && res.data?.status === 'paid') {
          console.log('[Payment] 云端确认订单已 paid:', orderId)
          return
        }
      } catch (e) {
        console.warn('[Payment] verifyOrder 失败:', e)
      }
    }
    console.warn('[Payment] 云端回查未确认 paid，可能需要人工核对:', orderId)
  }

  /**
   * 支付失败处理
   */
  function handlePayFail(error: any) {
    const errMsg = error?.errMsg || error?.message || '支付失败'
    payError.value = errMsg

    if (currentOrder.value) {
      currentOrder.value.status = 'failed'
    }

    console.error('[Payment] 支付失败:', errMsg, error)
  }

  /**
   * 重置支付状态
   */
  function resetPayment() {
    isLoading.value = false
    isPaid.value = false
    currentOrder.value = null
    payError.value = ''
    paidProductType.value = ''
  }

  return {
    isLoading,
    isPaid,
    isIOS,
    currentOrder,
    payError,
    paidProductType,
    payForReport,
    payWithOrder,
    checkPaymentStatus,
    resetPayment,
    /** 产品定价常量 */
    PRODUCT_PRICES,
    PRODUCT_NAMES,
    formatPrice,
  }
}

/* ===== 内部工具函数 ===== */

/**
 * 微信小程序端调起微信支付
 */
// #ifdef MP-WEIXIN
/* @ts-ignore - wx 由微信 SDK 注入，条件编译时可用 */
function wxRequestPayment(payParams: any): Promise<boolean> {
  return new Promise((resolve) => {
    /* @ts-ignore */
    wx.requestPayment({
      timeStamp: payParams.timeStamp,
      nonceStr: payParams.nonceStr,
      package: payParams.package,
      signType: payParams.signType,
      paySign: payParams.paySign,
      success() {
        resolve(true)
      },
      fail(err: any) {
        console.warn('[Payment] 微信支付取消或失败:', err)
        resolve(false)
      },
    })
  })
}
// #endif
