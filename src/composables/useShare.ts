/**
 * 灵魂星图 - 分享逻辑组合式函数
 *
 * 封装海报生成、保存相册、好友分享、朋友圈分享、
 * H5 链接复制及小程序 onShareAppMessage 配置等完整分享工具链。
 */
import { ref } from 'vue'
import type { PersonalityTypeData } from '@/data/results/types'
import { drawPoster, type PosterConfig } from '@/utils/share-canvas'

/* ===== 类型 ===== */

/** 小程序分享配置 */
export interface ShareConfig {
  title: string
  path: string
  imageUrl?: string
}

/* ===== 常量 ===== */

/** 海报尺寸 */
const POSTER_WIDTH = 750
const POSTER_HEIGHT = 1334

/** Canvas ID（与模板中一致） */
const CANVAS_ID = 'sharePosterCanvas'

/* ===== composable ===== */

export function useShare() {
  /** 是否正在生成海报 */
  const isGenerating = ref(false)

  /** 生成的海报临时文件路径 */
  const posterPath = ref('')

  /** 生成错误信息 */
  const errorMsg = ref('')

  /* ---------- 核心方法 ---------- */

  /**
   * 通过 Canvas 绘制海报并导出为临时文件路径
   *
   * @param personalityType - 人格类型数据
   * @param canvasId - 可选的 canvas id（多实例时区分）
   * @param componentInstance - 组件实例（小程序端需要传 this）
   * @returns 临时图片路径
   */
  async function generatePoster(
    personalityType: PersonalityTypeData,
    canvasId: string = CANVAS_ID,
    componentInstance?: any,
  ): Promise<string> {
    isGenerating.value = true
    errorMsg.value = ''

    try {
      const config: PosterConfig = {
        width: POSTER_WIDTH,
        height: POSTER_HEIGHT,
        typeName: personalityType.name,
        typeCode: personalityType.code,
        tags: personalityType.tags,
        description: personalityType.title,
        color: personalityType.color,
        rarity: personalityType.rarity,
        element: personalityType.element,
      }

      // 获取 canvas 节点
      const canvas = await getCanvasNode(canvasId, componentInstance)
      if (!canvas) throw new Error('无法获取 Canvas 节点')

      // 设置 canvas 实际像素尺寸
      canvas.width = POSTER_WIDTH
      canvas.height = POSTER_HEIGHT

      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
      if (!ctx) throw new Error('无法获取 Canvas 2D Context')

      // 绘制海报
      drawPoster(ctx, config)

      // 导出为临时图片
      const tempPath = await canvasToTempFile(canvas, canvasId, componentInstance)
      posterPath.value = tempPath

      return tempPath
    } catch (e: any) {
      const msg = e?.message || e?.errMsg || '海报生成失败'
      errorMsg.value = msg
      console.error('[useShare] 生成海报失败:', e)
      return ''
    } finally {
      isGenerating.value = false
    }
  }

  /**
   * 将已生成的海报保存到系统相册
   *
   * @returns 是否保存成功
   */
  async function saveToAlbum(): Promise<boolean> {
    if (!posterPath.value) {
      uni.showToast({ title: '请先生成海报', icon: 'none' })
      return false
    }

    try {
      await uniSaveImage(posterPath.value)
      uni.showToast({ title: '已保存到相册', icon: 'success' })
      return true
    } catch (e: any) {
      // 权限问题
      if (e?.errMsg?.includes('auth deny') || e?.errMsg?.includes('authorize')) {
        uni.showModal({
          title: '提示',
          content: '需要您授权保存图片到相册',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) uni.openSetting({})
          },
        })
      } else {
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
      console.error('[useShare] 保存相册失败:', e)
      return false
    }
  }

  /**
   * 分享给小程序好友
   * 触发小程序原生的转发行为（需配合 onShareAppMessage 使用）
   *
   * @param resultCode - 人格类型代码
   */
  function shareToFriend(resultCode: string): void {
    // 小程序环境下，分享由页面 onShareAppMessage 生命周期控制
    // 这里仅提供参数，实际转发由微信客户端触发
    console.log('[useShare] 分享好友, 类型:', resultCode)
  }

  /**
   * 分享到朋友圈
   * 引导用户保存海报图片后自行发朋友圈
   */
  async function shareToMoments(): Promise<void> {
    if (!posterPath.value) {
      uni.showToast({ title: '请先生成海报', icon: 'none' })
      return
    }

    // 先保存到相册
    const saved = await saveToAlbum()
    if (saved) {
      uni.showToast({
        title: '海报已保存，快去发朋友圈吧',
        icon: 'none',
        duration: 2500,
      })
    }
  }

  /**
   * 复制 H5 分享链接到剪贴板
   *
   * @param resultCode - 人格类型代码
   */
  function copyShareLink(resultCode: string): void {
    // 构建分享链接（实际域名根据部署情况调整）
    const baseUrl = 'https://soulmap.app/s/landing'
    const link = `${baseUrl}?type=${resultCode}`

    uni.setClipboardData({
      data: link,
      success: () => {
        uni.showToast({ title: '链接已复制', icon: 'success' })
      },
      fail: () => {
        uni.showToast({ title: '复制失败', icon: 'none' })
      },
    })
  }

  /**
   * 获取小程序页面级分享配置（用于 onShareAppMessage）
   *
   * @param resultCode - 人格类型代码
   * @param typeName   - 星灵名称
   * @returns 分享配置对象
   */
  function getShareConfig(resultCode: string, typeName: string): ShareConfig {
    return {
      title: `我的灵魂星灵是「${typeName}」，来测测你的！`,
      path: `/pagesShare/landing/index?type=${resultCode}`,
      imageUrl: posterPath.value || undefined,
    }
  }

  /* ---------- 内部工具 ---------- */

  /**
   * 获取 Canvas 节点（兼容小程序和 H5）
   */
  function getCanvasNode(canvasId: string, componentInstance?: any): Promise<any> {
    return new Promise((resolve) => {
      // #ifdef MP-WEIXIN
      // 小程序端：使用 SelectorQuery 获取 canvas 节点
      const query = componentInstance
        ? uni.createSelectorQuery().in(componentInstance)
        : uni.createSelectorQuery()
      query
        .select(`#${canvasId}`)
        .fields({ node: true, size: true }, (res: any) => {
          if (res && res[0] && res[0].node) {
            resolve(res[0].node)
          } else {
            resolve(null)
          }
        })
        .exec()
      // #endif

      // #ifdef H5
      // H5 端：直接获取 DOM canvas
      const el = document.getElementById(canvasId) as HTMLCanvasElement | null
      resolve(el)
      // #endif

      // #ifdef APP-PLUS
      // App 端暂不支持
      resolve(null)
      // #endif
    })
  }

  /**
   * Canvas 转临时图片文件
   */
  function canvasToTempFile(
    canvas: any,
    canvasId: string,
    componentInstance?: any,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // #ifdef MP-WEIXIN
      // 小程序端：使用 canvas 自身的 toTempFilePath
      uni.canvasToTempFilePath(
        {
          canvas,
          canvasId,
          fileType: 'png',
          quality: 0.92,
          success: (res: any) => resolve(res.tempFilePath),
          fail: (err: any) => reject(err),
        },
        componentInstance,
      )
      // #endif

      // #ifdef H5
      // H5 端：toDataURL → blob → 临时路径（或直接返回 dataURL）
      try {
        const dataUrl = (canvas as HTMLCanvasElement).toDataURL('image/png', 0.92)
        resolve(dataUrl)
      } catch (err) {
        reject(err)
      }
      // #endif
    })
  }

  /**
   * 保存图片到相册
   */
  function uniSaveImage(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      uni.saveImageToPhotosAlbum({
        filePath,
        success: () => resolve(),
        fail: (err: any) => reject(err),
      })
    })
  }

  return {
    // 响应式状态
    isGenerating,
    posterPath,
    errorMsg,
    // 方法
    generatePoster,
    saveToAlbum,
    shareToFriend,
    shareToMoments,
    copyShareLink,
    getShareConfig,
  }
}
