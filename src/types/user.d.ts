/**
 * 灵魂星图 - 用户相关类型定义
 */

import type { MBTIType, TestResult } from './test'

/** 用户信息 */
interface User {
  /** 用户唯一标识（openId 或自增 ID） */
  id: string
  /** 微信 openId */
  openId: string
  /** 微信昵称 */
  nickname: string
  /** 头像 URL */
  avatarUrl: string
  /** 手机号（可选，微信授权后获取） */
  phone?: string
  /** 会员信息 */
  membership: Membership
  /** 创建时间戳 */
  createdAt: number
  /** 最近登录时间戳 */
  lastLoginAt: number
  /** 最近一次测试结果的人格类型（快速展示用） */
  latestType?: MBTIType
  /** 用户设置的标签 */
  tags: string[]
  /** 是否已授权微信用户信息 */
  authorized: boolean
}

/** 会员状态 */
interface Membership {
  /** 会员类型 */
  type: 'free' | 'premium' | 'lifetime'
  /** 会员到期时间戳（free 类型为 0） */
  expireAt: number
  /** 是否处于有效会员状态 */
  isActive: boolean
  /** 会员开通渠道 */
  source?: 'wechat' | 'alipay' | 'invite' | 'gift'
  /** 自动续费状态 */
  autoRenew?: boolean
}

/** 测试历史记录 */
interface TestHistory {
  /** 记录唯一标识 */
  id: string
  /** 用户 ID */
  userId: string
  /** 关联的测试结果 */
  result: TestResult
  /** 人格类型 */
  personalityType: MBTIType
  /** 完成时间戳 */
  completedAt: number
  /** 测试版本号（用于数据兼容） */
  testVersion: string
  /** 用户对该结果的备注 */
  note?: string
  /** 是否已收藏 */
  favorited: boolean
}

export {
  User,
  Membership,
  TestHistory,
}
