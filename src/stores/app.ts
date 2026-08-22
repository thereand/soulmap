/**
 * 灵魂星图 - 全局应用状态 Store
 * 管理全局配置、系统状态、分享数据等
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  /* ===== State ===== */

  /** 应用是否已初始化 */
  const isReady = ref(false)

  /** 全局加载状态 */
  const loading = ref(false)

  /** 全局加载提示文字 */
  const loadingText = ref('')

  /** 当前运行平台 */
  const platform = ref<'mp-weixin' | 'h5' | 'app' | 'unknown'>('unknown')

  /** 系统信息（缓存 uni.getSystemInfoSync 结果） */
  const systemInfo = ref<UniApp.GetSystemInfoResult | null>(null)

  /** 全局 Toast 消息 */
  const toastMessage = ref('')

  /** 分享 Token（从分享链接进入时携带） */
  const shareToken = ref('')

  /** 应用版本号 */
  const appVersion = ref('1.0.0')

  /* ===== Getters ===== */

  /** 是否为微信小程序环境 */
  const isWeixin = computed(() => platform.value === 'mp-weixin')

  /** 是否为 H5 环境 */
  const isH5 = computed(() => platform.value === 'h5')

  /** 状态栏高度 */
  const statusBarHeight = computed(() => systemInfo.value?.statusBarHeight ?? 0)

  /* ===== Actions ===== */

  /**
   * 初始化应用状态
   * 在 App.vue onLaunch 中调用
   */
  function init() {
    try {
      // 获取系统信息
      systemInfo.value = uni.getSystemInfoSync()

      // 判断平台
      // #ifdef MP-WEIXIN
      platform.value = 'mp-weixin'
      // #endif
      // #ifdef H5
      platform.value = 'h5'
      // #endif
      // #ifdef APP-PLUS
      platform.value = 'app'
      // #endif

      isReady.value = true
      console.log('[AppStore] 初始化完成, 平台:', platform.value)
    } catch (e) {
      console.error('[AppStore] 初始化失败:', e)
    }
  }

  /**
   * 显示全局 Loading
   */
  function showLoading(text = '加载中...') {
    loading.value = true
    loadingText.value = text
    uni.showLoading({ title: text, mask: true })
  }

  /**
   * 隐藏全局 Loading
   */
  function hideLoading() {
    loading.value = false
    loadingText.value = ''
    uni.hideLoading()
  }

  /**
   * 显示 Toast 提示
   */
  function showToast(message: string, icon: 'success' | 'error' | 'none' = 'none') {
    toastMessage.value = message
    uni.showToast({
      title: message,
      icon,
      duration: 2000,
    })
  }

  return {
    // state
    isReady,
    loading,
    loadingText,
    platform,
    systemInfo,
    toastMessage,
    shareToken,
    appVersion,
    // getters
    isWeixin,
    isH5,
    statusBarHeight,
    // actions
    init,
    showLoading,
    hideLoading,
    showToast,
  }
})
