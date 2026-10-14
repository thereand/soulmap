/**
 * 隐私政策与用户协议同意状态管理
 * 合规要求：不可默认同意，必须由用户主动阅读并勾选
 */

// 协议版本号：当协议内容发生实质性变更时递增，以重新触发弹窗
const CONSENT_VERSION = '2026.10.v1'
const STORAGE_KEY = 'soulmap_legal_consent'

export interface ConsentRecord {
  /** 用户同意的协议版本 */
  version: string
  /** 同意时间戳 */
  agreedAt: number
  /** 隐私政策是否已同意 */
  privacy: boolean
  /** 用户协议是否已同意 */
  terms: boolean
}

/** 读取本地同意记录 */
export function getConsentRecord(): ConsentRecord | null {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY) as string | ConsentRecord | undefined
    if (!raw) return null
    if (typeof raw === 'string') {
      return JSON.parse(raw) as ConsentRecord
    }
    return raw
  } catch {
    return null
  }
}

/** 用户是否已同意当前版本的协议 */
export function hasAgreedCurrentVersion(): boolean {
  const record = getConsentRecord()
  if (!record) return false
  if (record.version !== CONSENT_VERSION) return false
  return record.privacy === true && record.terms === true
}

/** 写入同意记录 */
export function saveConsentRecord(record: ConsentRecord): void {
  try {
    uni.setStorageSync(STORAGE_KEY, record)
  } catch (e) {
    console.warn('[Consent] 写入同意记录失败', e)
  }
}

/** 标记用户已同意当前版本的全部协议 */
export function markAllAgreed(): void {
  saveConsentRecord({
    version: CONSENT_VERSION,
    agreedAt: Date.now(),
    privacy: true,
    terms: true,
  })
}

/** 撤销同意（调试或合规需求使用） */
export function revokeConsent(): void {
  try {
    uni.removeStorageSync(STORAGE_KEY)
  } catch {
    /* noop */
  }
}

/** 导出常量与版本号（供外部调试） */
export const CONSENT_DEBUG = { version: CONSENT_VERSION, key: STORAGE_KEY }
