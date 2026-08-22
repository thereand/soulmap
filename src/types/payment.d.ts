/**
 * 灵魂星图 - 支付相关类型定义
 */

/** 支付产品 */
interface PaymentProduct {
  /** 产品唯一标识 */
  id: string
  /** 产品名称（如"解锁完整报告"） */
  name: string
  /** 产品描述 */
  description: string
  /** 价格（单位：分） */
  price: number
  /** 原价（单位：分，用于划线价展示） */
  originalPrice?: number
  /** 产品类型 */
  type: 'report' | 'membership' | 'bundle'
  /** 产品图标 */
  icon: string
  /** 包含的功能权益 */
  features: string[]
  /** 限时优惠到期时间戳（可选） */
  promotionEnd?: number
  /** 是否为推荐产品 */
  recommended?: boolean
}

/** 订单 */
interface Order {
  /** 订单唯一标识 */
  orderId: string
  /** 用户 ID */
  userId: string
  /** 购买的产品 ID */
  productId: string
  /** 产品名称（冗余存储，方便展示） */
  productName: string
  /** 订单金额（单位：分） */
  amount: number
  /** 支付状态 */
  status: PaymentStatus
  /** 支付方式 */
  payMethod: 'wechat' | 'alipay' | 'free'
  /** 微信支付交易号（支付成功后） */
  transactionId?: string
  /** 创建时间戳 */
  createdAt: number
  /** 支付完成时间戳 */
  paidAt?: number
  /** 订单过期时间戳（30分钟未支付自动关闭） */
  expireAt: number
  /** 关联的测试结果 ID（报告解锁场景） */
  resultId?: string
}

/** 支付状态 */
type PaymentStatus =
  | 'pending'     /* 待支付 */
  | 'paying'      /* 支付中 */
  | 'paid'        /* 已支付 */
  | 'failed'      /* 支付失败 */
  | 'cancelled'   /* 已取消 */
  | 'refunded'    /* 已退款 */
  | 'expired'     /* 已过期 */

/** 支付结果回调参数 */
interface PaymentCallback {
  /** 是否支付成功 */
  success: boolean
  /** 订单 ID */
  orderId: string
  /** 错误信息（失败时） */
  errMsg?: string
}

export {
  PaymentProduct,
  Order,
  PaymentStatus,
  PaymentCallback,
}
