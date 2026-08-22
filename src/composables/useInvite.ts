/**
 * 灵魂星图 - 分享裂变组合式函数
 *
 * 提供：
 *  - 生成 / 读取当前用户的邀请码（openid 短哈希）
 *  - 查询邀请进度（已邀请人数、可解锁奖励）
 *  - 领取邀请奖励（云函数）
 *  - 记录被邀请关系（新用户进入时携带的 inviteCode）
 *  - 拉起小程序 / H5 分享，携带邀请码
 */
import { ref, computed } from 'vue'
import { callCloud } from '@/services/cloud'
import { track, AnalyticsEvent } from '@/utils/analytics'

/** 奖励门槛（与方案 1.2 保持一致） */
export const REWARD_TIERS = [
  { count: 1, key: 'social_style', label: '解锁「社交风格」维度解析' },
  { count: 3, key: 'full_free_report', label: '解锁完整免费报告（¥9.9）' },
  { count: 5, key: 'compare_ticket', label: '获得 1 次「灵魂契合度」对比' },
] as const

const STORAGE_INVITE_CODE = 'SOULMAP_INVITE_CODE_MINE'
const STORAGE_ENTRY_INVITE = 'SOULMAP_INVITE_CODE_FROM_ENTRY'
const STORAGE_UNLOCKED = 'SOULMAP_INVITE_UNLOCKED'

export interface InviteProgress {
  invited: number
  claimedRewards: string[]
  inviteCode: string
}

export function useInvite() {
  /** 当前用户的邀请码 */
  const myInviteCode = ref<string>('')

  /** 已邀请（且已完成测试）的人数 */
  const invitedCount = ref<number>(0)

  /** 已领取的奖励 key 列表 */
  const claimedRewards = ref<string[]>([])

  /** 从入口链接读取到的、邀请我的邀请码 */
  const entryInviteCode = ref<string>('')

  /* ===== 计算属性 ===== */

  /** 已本地解锁的奖励（可能包含 claim 之外的本地缓存） */
  const localUnlocked = computed<string[]>(() => {
    try {
      const raw = uni.getStorageSync(STORAGE_UNLOCKED)
      if (!raw) return []
      const arr = JSON.parse(raw as string)
      return Array.isArray(arr) ? arr : []
    } catch { return [] }
  })

  /** 下一档奖励目标 */
  const nextTier = computed(() => {
    return REWARD_TIERS.find((t) => invitedCount.value < t.count) || null
  })

  /** 是否已达到某档 */
  function hasReached(count: number): boolean {
    return invitedCount.value >= count
  }

  /** 是否已领取某奖励 */
  function hasClaimed(key: string): boolean {
    return claimedRewards.value.includes(key) || localUnlocked.value.includes(key)
  }

  /* ===== 邀请码生成 ===== */

  /** 简单短哈希 -> 6 位 base36 字符 */
  function shortHash(input: string): string {
    if (!input) return Math.random().toString(36).slice(2, 8).toLowerCase()
    let h = 0
    for (let i = 0; i < input.length; i++) {
      h = (h * 31 + input.charCodeAt(i)) >>> 0
    }
    // 混入固定盐值，避免和其他系统冲撞
    h = (h ^ 0x9e3779b9) >>> 0
    return h.toString(36).padStart(6, '0').slice(-6)
  }

  /**
   * 生成邀请码（本地）
   * openid 未知时回退到匿名 ID
   */
  function generateLocalInviteCode(openid?: string): string {
    // 优先取本地缓存
    try {
      const cached = uni.getStorageSync(STORAGE_INVITE_CODE)
      if (cached) {
        myInviteCode.value = cached
        return cached
      }
    } catch {}

    const seed = openid || uni.getStorageSync('SOULMAP_ANALYTICS_USER') || `anon_${Date.now()}`
    const code = shortHash(String(seed))
    myInviteCode.value = code
    try { uni.setStorageSync(STORAGE_INVITE_CODE, code) } catch {}
    return code
  }

  /* ===== 云端交互 ===== */

  /** 从云端拉取邀请进度 */
  async function loadProgress(): Promise<InviteProgress | null> {
    const res = await callCloud<InviteProgress>('invite', { action: 'getProgress' })
    if (res.success && res.data) {
      invitedCount.value = res.data.invited || 0
      claimedRewards.value = res.data.claimedRewards || []
      if (res.data.inviteCode) {
        myInviteCode.value = res.data.inviteCode
        try { uni.setStorageSync(STORAGE_INVITE_CODE, res.data.inviteCode) } catch {}
      }
      return res.data
    }
    return null
  }

  /** 领取指定奖励 */
  async function claimReward(rewardKey: string): Promise<boolean> {
    const res = await callCloud('invite', { action: 'claimReward', rewardKey })
    if (res.success) {
      if (!claimedRewards.value.includes(rewardKey)) {
        claimedRewards.value.push(rewardKey)
      }
      // 本地也记一份，便于离线体验
      try {
        const arr = new Set(localUnlocked.value)
        arr.add(rewardKey)
        uni.setStorageSync(STORAGE_UNLOCKED, JSON.stringify(Array.from(arr)))
      } catch {}
      track(AnalyticsEvent.INVITE_COMPLETE, { rewardKey })
      return true
    }
    return false
  }

  /** 记录一次邀请曝光（分享出去点击了按钮） */
  function trackInviteSend(): void {
    track(AnalyticsEvent.INVITE_SEND, { inviteCode: myInviteCode.value })
  }

  /**
   * 用户被邀请进入应用时调用，向后端登记关系
   * inviteCode 一般来源于页面 query 的 inviteCode 或 invite 字段
   */
  async function registerAsInvitee(inviteCode: string): Promise<boolean> {
    if (!inviteCode) return false
    // 本地缓存入口码，避免重复上报
    try {
      const cached = uni.getStorageSync(STORAGE_ENTRY_INVITE)
      if (cached === inviteCode) {
        entryInviteCode.value = inviteCode
        return true
      }
    } catch {}

    entryInviteCode.value = inviteCode
    try { uni.setStorageSync(STORAGE_ENTRY_INVITE, inviteCode) } catch {}

    const res = await callCloud('invite', { action: 'bindInvitee', inviteCode })
    return !!res.success
  }

  /**
   * 通知后端：被邀请人已完成测试
   * 后端负责给邀请人 invited+1 并判定奖励条件
   */
  async function markInviteeCompleted(): Promise<boolean> {
    let inviteCode = entryInviteCode.value
    if (!inviteCode) {
      try { inviteCode = (uni.getStorageSync(STORAGE_ENTRY_INVITE) as string) || '' } catch {}
    }
    if (!inviteCode) return false

    const res = await callCloud('invite', { action: 'inviteeCompleted', inviteCode })
    return !!res.success
  }

  /** 构造分享标题与路径 */
  function buildSharePayload(personalityName: string) {
    const code = myInviteCode.value || generateLocalInviteCode()
    return {
      title: `我的灵魂星灵是「${personalityName}」，来测测你的！`,
      path: `/pages/index/index?inviteCode=${code}`,
      /** H5 链接 */
      h5Link: `https://soulmap.app/#/?invite=${code}`,
      inviteCode: code,
    }
  }

  return {
    // 响应式
    myInviteCode,
    invitedCount,
    claimedRewards,
    entryInviteCode,
    nextTier,
    // 方法
    generateLocalInviteCode,
    hasReached,
    hasClaimed,
    loadProgress,
    claimReward,
    trackInviteSend,
    registerAsInvitee,
    markInviteeCompleted,
    buildSharePayload,
  }
}
