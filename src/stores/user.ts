/**
 * 灵魂星图 - 用户状态 Store
 * 管理用户登录、会员信息、测试历史等
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Membership, TestHistory } from '@/types/user'
import type { MBTIType } from '@/types/test'

export const useUserStore = defineStore('user', () => {
  /* ===== State ===== */

  /** 是否已登录 */
  const isLoggedIn = ref(false)

  /** 当前用户信息 */
  const user = ref<User | null>(null)

  /** 测试历史记录列表 */
  const historyList = ref<TestHistory[]>([])

  /** 是否正在登录中 */
  const logging = ref(false)

  /* ===== Getters ===== */

  /** 当前用户昵称 */
  const nickname = computed(() => user.value?.nickname ?? '未登录')

  /** 当前用户头像 */
  const avatarUrl = computed(() => user.value?.avatarUrl ?? '')

  /** 会员状态 */
  const membership = computed<Membership>(() =>
    user.value?.membership ?? {
      type: 'free',
      expireAt: 0,
      isActive: false,
    }
  )

  /** 是否为高级会员 */
  const isPremium = computed(() => {
    const m = membership.value
    if (m.type === 'lifetime') return true
    if (m.type === 'premium' && m.expireAt > Date.now()) return true
    return false
  })

  /** 最近一次测试的人格类型 */
  const latestType = computed<MBTIType | undefined>(
    () => user.value?.latestType
  )

  /* ===== Actions ===== */

  /**
   * 微信登录
   * 获取 code 后调用云函数换取 openId 和用户信息
   */
  async function login() {
    if (logging.value) return
    logging.value = true

    try {
      // #ifdef MP-WEIXIN
      const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
        uni.login({
          provider: 'weixin',
          success: resolve,
          fail: reject,
        })
      })

      // TODO: 调用云函数 login 获取 openId
      console.log('[UserStore] 微信登录 code:', loginRes.code)
      // const result = await callCloud('login', { code: loginRes.code })
      // setUser(result.user)
      // #endif

      // #ifdef H5
      // H5 端模拟登录
      console.log('[UserStore] H5 端登录')
      // #endif

      isLoggedIn.value = true
    } catch (e) {
      console.error('[UserStore] 登录失败:', e)
      isLoggedIn.value = false
    } finally {
      logging.value = false
    }
  }

  /**
   * 设置用户信息
   */
  function setUser(userData: User) {
    user.value = userData
    isLoggedIn.value = true
  }

  /**
   * 登出
   */
  function logout() {
    user.value = null
    isLoggedIn.value = false
    historyList.value = []
  }

  /**
   * 加载测试历史
   */
  async function loadHistory() {
    // TODO: 从云端或本地缓存加载历史记录
    console.log('[UserStore] 加载测试历史')
  }

  /**
   * 添加一条测试历史
   */
  function addHistory(record: TestHistory) {
    historyList.value.unshift(record)
  }

  return {
    // state
    isLoggedIn,
    user,
    historyList,
    logging,
    // getters
    nickname,
    avatarUrl,
    membership,
    isPremium,
    latestType,
    // actions
    login,
    setUser,
    logout,
    loadHistory,
    addHistory,
  }
})
