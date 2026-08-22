/**
 * 灵魂星图 - 认证逻辑组合式函数
 * 管理用户登录、身份认证、匿名 ID 等
 */
import { ref } from 'vue'
import { userService } from '@/services/user.service'
import type { UserInfo, UserProfile } from '@/services/user.service'

/** 匿名用户 ID 存储 key */
const ANONYMOUS_ID_KEY = 'soulmap_anonymous_id'

export function useAuth() {
  /** 是否已登录 */
  const isLoggedIn = ref(false)

  /** 当前用户信息 */
  const userInfo = ref<UserInfo | null>(null)

  /** 用户详细资料 */
  const userProfile = ref<UserProfile | null>(null)

  /** 是否正在登录中 */
  const isLogging = ref(false)

  /** 登录错误信息 */
  const loginError = ref('')

  /**
   * 微信静默登录（小程序端）
   * 调用 login 云函数 → 获取用户身份 → 设置登录状态
   * 失败时自动降级为本地匿名模式，确保应用可用
   */
  async function wxLogin(): Promise<boolean> {
    if (isLogging.value) return false

    isLogging.value = true
    loginError.value = ''

    try {
      const res = await userService.login()

      if (res.success && res.data) {
        userInfo.value = res.data
        isLoggedIn.value = true

        // 缓存登录状态
        try {
          uni.setStorageSync('soulmap_user_info', JSON.stringify(res.data))
          uni.setStorageSync('soulmap_logged_in', 'true')
        } catch {
          // 缓存失败不影响主流程
        }

        console.log('[Auth] 登录成功:', res.data.id)
        return true
      }

      // 云函数调用失败：降级为本地匿名模式
      console.warn('[Auth] 云函数登录失败，降级为匿名模式:', res.errMsg)
      return fallbackToAnonymous(res.errMsg || '登录失败')
    } catch (e: any) {
      // 异常情况同样降级
      console.error('[Auth] 登录异常，降级为匿名模式:', e)
      return fallbackToAnonymous(e?.message || '登录异常')
    } finally {
      isLogging.value = false
    }
  }

  /**
   * 降级为本地匿名模式
   * 生成匿名 ID 作为临时用户身份，保证应用功能可用
   */
  function fallbackToAnonymous(reason: string): boolean {
    loginError.value = reason

    const anonId = getAnonymousId()
    userInfo.value = {
      id: anonId,
      openId: anonId,
      nickname: '星旅者',
      avatarUrl: '',
    }
    isLoggedIn.value = true

    console.log('[Auth] 已使用匿名模式, id:', anonId)
    return true
  }

  /**
   * 获取用户详细资料
   */
  async function getUserProfile(): Promise<UserProfile | null> {
    try {
      const res = await userService.getProfile()

      if (res.success && res.data) {
        userProfile.value = res.data
        return res.data
      }

      console.warn('[Auth] 获取用户资料失败:', res.errMsg)
      return null
    } catch (e: any) {
      console.error('[Auth] 获取用户资料异常:', e)
      return null
    }
  }

  /**
   * 获取 H5 端匿名 ID
   * 如果已存在则复用，否则创建新的
   */
  function getAnonymousId(): string {
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

  /**
   * 尝试从本地缓存恢复登录状态
   */
  function restoreLoginState(): boolean {
    try {
      const loggedIn = uni.getStorageSync('soulmap_logged_in')
      const cachedInfo = uni.getStorageSync('soulmap_user_info')

      if (loggedIn === 'true' && cachedInfo) {
        userInfo.value = JSON.parse(cachedInfo)
        isLoggedIn.value = true
        return true
      }
    } catch {
      // 缓存读取失败
    }

    // H5 端始终使用匿名 ID
    // #ifdef H5
    const anonId = getAnonymousId()
    userInfo.value = {
      id: anonId,
      openId: anonId,
      nickname: '星旅者',
      avatarUrl: '',
    }
    isLoggedIn.value = true
    return true
    // #endif

    return false
  }

  /**
   * 登出
   */
  function logout() {
    userInfo.value = null
    userProfile.value = null
    isLoggedIn.value = false

    try {
      uni.removeStorageSync('soulmap_user_info')
      uni.removeStorageSync('soulmap_logged_in')
    } catch {
      // 忽略
    }

    console.log('[Auth] 已登出')
  }

  /**
   * 确保已登录（未登录则自动登录）
   */
  async function ensureLoggedIn(): Promise<boolean> {
    if (isLoggedIn.value && userInfo.value) return true

    // 先尝试恢复缓存
    if (restoreLoginState()) return true

    // 执行登录
    return wxLogin()
  }

  return {
    isLoggedIn,
    userInfo,
    userProfile,
    isLogging,
    loginError,
    wxLogin,
    getUserProfile,
    getAnonymousId,
    restoreLoginState,
    logout,
    ensureLoggedIn,
  }
}
