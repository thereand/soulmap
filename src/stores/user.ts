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
   * 小程序端通过 wx.cloud.callFunction('login') 静默登录，云端基于 OPENID 创建/复用用户记录
   */
  async function login() {
    if (logging.value) return
    logging.value = true

    try {
      // #ifdef MP-WEIXIN
      const loginRes: any = await new Promise((resolve) => {
        wx.cloud.callFunction({
          name: 'login',
          data: { action: 'login' },
          success: (r: any) => resolve(r.result),
          fail: (e: any) => resolve({ success: false, errMsg: e.errMsg || '云函数调用失败' }),
        })
      })

      if (loginRes?.success && loginRes.data) {
        const u = loginRes.data
        setUser({
          id: u.id,
          openId: u.openId,
          nickname: u.nickname || '星旅者',
          avatarUrl: u.avatarUrl || '',
          latestType: u.latestType,
          membership: u.membership || { type: 'free', expireAt: 0, isActive: false },
        } as User)
        console.log('[UserStore] 登录成功:', u.openId)
      } else {
        console.warn('[UserStore] 云端登录返回失败:', loginRes)
        // 保持本地状态（isLoggedIn 不动），不阻断用户主流程
      }
      // #endif

      // #ifdef H5
      // H5 端：暂未接入后端登录，保持未登录态
      console.log('[UserStore] H5 端登录暂未实现')
      // #endif
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
