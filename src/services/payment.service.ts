/**
 * 灵魂星图 - 支付服务抽象层
 * 封装订单创建、查询、支付参数获取等业务逻辑
 */
import { callCloud } from './cloud'
import type { CloudResult } from './cloud'

/** 创建订单参数 */
export interface CreateOrderParams {
  /** 测试结果 ID */
  resultId: string
  /** 产品类型 */
  productType: 'basic' | 'advanced' | 'comparison'
}

/** 创建订单返回 */
export interface OrderResponse {
  orderId: string
  amount: number
  productName: string
  status: string
  expireAt: number
  payParams: {
    timeStamp?: string
    nonceStr?: string
    package?: string
    signType?: string
    paySign?: string
    /** 开发模式标记 */
    devMode?: boolean
    [key: string]: any
  } | null
}

/** 订单状态查询返回 */
export interface OrderStatus {
  orderId: string
  status: string
  amount: number
  productName: string
  paidAt?: number
  transactionId?: string
}

/** 支付参数 */
export interface PaymentParams {
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

/** 产品定价（单位：分） */
export const PRODUCT_PRICES: Record<string, number> = {
  basic: 990,
  advanced: 1990,
  comparison: 1990,
}

/** 产品名称 */
export const PRODUCT_NAMES: Record<string, string> = {
  basic: '基础版完整报告',
  advanced: '深度版完整报告',
  comparison: '双人对比报告',
}

/** 格式化价格（分 → 元） */
export function formatPrice(cents: number): string {
  return `¥${(cents / 100).toFixed(2)}`
}

export const paymentService = {
  /**
   * 创建订单
   */
  async createOrder(params: CreateOrderParams): Promise<CloudResult<OrderResponse>> {
    return callCloud<OrderResponse>('createOrder', {
      resultId: params.resultId,
      productType: params.productType,
    })
  },

  /**
   * 查询订单状态
   * 通过 getReport 云函数间接验证订单状态
   */
  async queryOrder(orderId: string): Promise<CloudResult<OrderStatus>> {
    // 使用 getReport 的查询能力来验证订单状态
    return callCloud<OrderStatus>('getReport', {
      orderId,
      action: 'queryOrder',
    })
  },

  /**
   * 获取支付参数（用于调起支付）
   * 在 createOrder 返回的 payParams 中已经包含
   */
  async getPaymentParams(orderId: string): Promise<CloudResult<PaymentParams>> {
    return callCloud<PaymentParams>('createOrder', {
      action: 'getPayParams',
      orderId,
    })
  },

  /**
   * 检查某个结果是否已付费
   */
  async checkPaid(resultId: string, productType: string): Promise<boolean> {
    const res = await callCloud<any>('getReport', {
      resultId,
      type: productType,
    })
    // 如果成功返回说明已付费
    return res.success === true
  },
}
