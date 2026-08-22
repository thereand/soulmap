/**
 * 灵魂星图 - 好友对比 / 契合度组合式函数
 *
 * 支持：
 *  - 创建对比邀请（生成 compareCode）
 *  - 通过 compareCode 加入对比
 *  - 查询对比结果
 *  - 计算契合度报告（本地 fallback + 云端持久化）
 */
import { ref } from 'vue'
import { callCloud } from '@/services/cloud'
import { calculateCompatibility, pairKey, codeToScores } from '@/utils/compatibility'
import { buildFallbackReport, type CompatibilityReport } from '@/data/results/compatibility-reports'
import { track, AnalyticsEvent } from '@/utils/analytics'
import type { MBTIType, DimensionScores } from '@/types/test'

export interface ComparePartner {
  openid?: string
  personalityType: MBTIType | string
  scores?: DimensionScores
  nickname?: string
}

export interface CompareRecord {
  compareCode: string
  userA: ComparePartner
  userB?: ComparePartner | null
  compatibility?: number
  relationLabel?: string
  isPaid?: boolean
  createdAt: number
}

export function useCompare() {
  /** 当前对比记录 */
  const record = ref<CompareRecord | null>(null)

  /** 生成的报告（本地 fallback，若云端返回则以云端为准） */
  const report = ref<CompatibilityReport | null>(null)

  /** 加载状态 */
  const loading = ref(false)

  /** 错误信息 */
  const errorMsg = ref('')

  /**
   * 发起对比：用户 A（当前用户）创建配对邀请
   * @returns compareCode 供 A 生成分享链接
   */
  async function createCompareInvite(userA: ComparePartner): Promise<string | null> {
    loading.value = true
    errorMsg.value = ''
    try {
      const res = await callCloud<{ compareCode: string }>('compare', {
        action: 'create',
        userA,
      })
      if (res.success && res.data?.compareCode) {
        record.value = {
          compareCode: res.data.compareCode,
          userA,
          createdAt: Date.now(),
        }
        track(AnalyticsEvent.COMPARE_START, { compareCode: res.data.compareCode })
        return res.data.compareCode
      }
      errorMsg.value = res.errMsg || '创建对比失败'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 加入对比：用户 B 携带 compareCode 完成测试后调用
   * 云端会撮合双方并存 comparison 记录
   */
  async function joinCompare(compareCode: string, userB: ComparePartner): Promise<CompareRecord | null> {
    loading.value = true
    errorMsg.value = ''
    try {
      const res = await callCloud<CompareRecord>('compare', {
        action: 'join',
        compareCode,
        userB,
      })
      if (res.success && res.data) {
        record.value = res.data
        computeLocalReport()
        return res.data
      }
      errorMsg.value = res.errMsg || '加入对比失败'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 拉取对比记录
   */
  async function loadCompare(compareCode: string): Promise<CompareRecord | null> {
    loading.value = true
    errorMsg.value = ''
    try {
      const res = await callCloud<CompareRecord>('compare', {
        action: 'get',
        compareCode,
      })
      if (res.success && res.data) {
        record.value = res.data
        computeLocalReport()
        return res.data
      }
      errorMsg.value = res.errMsg || '对比不存在'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * 支付解锁对比详细报告
   */
  async function unlockPaidReport(compareCode: string): Promise<boolean> {
    const res = await callCloud('compare', {
      action: 'markPaid',
      compareCode,
    })
    if (res.success) {
      if (record.value) record.value.isPaid = true
      track(AnalyticsEvent.COMPARE_PAY, { compareCode, amount: 19.9 })
      return true
    }
    return false
  }

  /**
   * 完全离线的契合度计算（当云端未连通时用）
   */
  function computeOffline(typeA: string, typeB: string, scoresA?: DimensionScores, scoresB?: DimensionScores): CompatibilityReport {
    const compat = calculateCompatibility(
      typeA,
      typeB,
      scoresA || codeToScores(typeA),
      scoresB || codeToScores(typeB),
    )
    const rpt = buildFallbackReport(typeA, typeB, compat)
    report.value = rpt
    record.value = record.value || {
      compareCode: `offline_${pairKey(typeA, typeB)}`,
      userA: { personalityType: typeA, scores: scoresA },
      userB: { personalityType: typeB, scores: scoresB },
      compatibility: compat.overallScore,
      relationLabel: compat.relationLabel,
      isPaid: false,
      createdAt: Date.now(),
    }
    return rpt
  }

  /**
   * 从当前 record 推导本地报告（如果双方都已完成）
   */
  function computeLocalReport(): CompatibilityReport | null {
    const r = record.value
    if (!r || !r.userA || !r.userB) return null
    const compat = calculateCompatibility(
      r.userA.personalityType,
      r.userB.personalityType,
      r.userA.scores || codeToScores(r.userA.personalityType),
      r.userB.scores || codeToScores(r.userB.personalityType),
    )
    const rpt = buildFallbackReport(r.userA.personalityType, r.userB.personalityType, compat)
    // 若云端已给了 compatibility 数字则以云端为准
    if (typeof r.compatibility === 'number') {
      rpt.overallScore = r.compatibility
      rpt.relationLabel = r.relationLabel || rpt.relationLabel
    }
    report.value = rpt
    return rpt
  }

  return {
    record,
    report,
    loading,
    errorMsg,
    createCompareInvite,
    joinCompare,
    loadCompare,
    unlockPaidReport,
    computeOffline,
    computeLocalReport,
  }
}
