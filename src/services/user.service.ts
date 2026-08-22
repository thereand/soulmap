/**
 * 灵魂星图 - 用户服务抽象层
 * 封装登录、用户信息获取、资料更新等业务逻辑
 * 注意：登录核心逻辑在 cloudfunctions/login 中实现，本层仅做前端封装
 */
import { callCloud } from './cloud'
import type { CloudResult } from './cloud'

/** 用户信息 */
export interface UserInfo {
  id: string
  openId: string
  nickname: string
  avatarUrl: string
  latestType?: string
  membership?: {
    type: 'free' | 'premium' | 'lifetime'
    expireAt: number
    isActive: boolean
  }
}

/** 用户详细资料 */
export interface UserProfile {
  id: string
  nickname: string
  avatarUrl: string
  phone?: string
  tags: string[]
  latestType?: string
  membership: {
    type: 'free' | 'premium' | 'lifetime'
    expireAt: number
    isActive: boolean
  }
  createdAt: number
  lastLoginAt: number
}

/** H5 端匿名 ID 存储 key */
const ANONYMOUS_ID_KEY = 'soulmap_anonymous_id'

/**
 * 获取或创建 H5 端匿名 ID
 */
function getOrCreateAnonymousId(): string {
  try {
    const existing = uni.getStorageSync(ANONYMOUS_ID_KEY)
    if (existing) return existing

    const id = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    uni.setStorageSync(ANONYMOUS_ID_KEY, id)
    return id
  } catch {
    return `anon_${Date.now()}`
  }
}

export const userService = {
  /**
   * 登录
   * 小程序端：调用 login 云函数（云函数通过 wxContext.OPENID 自动获取用户身份）
   * H5 端：使用匿名 ID 模拟
   */
  async login(): Promise<CloudResult<UserInfo>> {
    // #ifdef MP-WEIXIN
    // 小程序端直接调用 login 云函数，云函数内部通过 wxContext 获取 OPENID
    return callCloud<UserInfo>('login', {})
    // #endif

    // #ifdef H5
    // H5 端无微信云开发环境，使用匿名 ID
    const anonymousId = getOrCreateAnonymousId()
    return {
      success: true,
      data: {
        id: anonymousId,
        openId: anonymousId,
        nickname: '星旅者',
        avatarUrl: '',
      },
    }
    // #endif

    // 兜底（条件编译后不会执行到此处）
    // eslint-disable-next-line no-unreachable
    return { success: false, data: null as any, errMsg: '不支持的平台' }
  },

  /**
   * 获取用户资料
   */
  async getProfile(): Promise<CloudResult<UserProfile>> {
    // #ifdef MP-WEIXIN
    return callCloud<UserProfile>('login', { action: 'getProfile' })
    // #endif

    // #ifdef H5
    // H5 端返回默认资料
    const anonymousId = getOrCreateAnonymousId()
    return {
      success: true,
      data: {
        id: anonymousId,
        nickname: '星旅者',
        avatarUrl: '',
        phone: '',
        tags: [],
        membership: { type: 'free' as const, expireAt: 0, isActive: false },
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      },
    }
    // #endif

    // eslint-disable-next-line no-unreachable
    return { success: false, data: null as any, errMsg: '不支持的平台' }
  },

  /**
   * 更新用户资料
   */
  async updateProfile(data: Partial<UserProfile>): Promise<CloudResult<void>> {
    // #ifdef MP-WEIXIN
    return callCloud<void>('login', {
      action: 'updateProfile',
      ...data,
    })
    // #endif

    // #ifdef H5
    // H5 端本地缓存
    try {
      const cached = JSON.parse(uni.getStorageSync('soulmap_user_profile') || '{}')
      uni.setStorageSync('soulmap_user_profile', JSON.stringify({ ...cached, ...data }))
      return { success: true, data: null as any }
    } catch {
      return { success: false, data: null as any, errMsg: '本地存储失败' }
    }
    // #endif

    // eslint-disable-next-line no-unreachable
    return { success: false, data: null as any, errMsg: '不支持的平台' }
  },
}
