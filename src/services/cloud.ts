/**
 * 灵魂星图 - 云函数统一调用封装
 * 提供跨平台（微信小程序/H5）的云函数调用抽象层
 */

/** 云函数调用返回结构 */
interface CloudResult<T = any> {
  /** 是否成功 */
  success: boolean
  /** 返回数据 */
  data: T
  /** 错误信息 */
  errMsg?: string
  /** 错误码 */
  errCode?: number
}

/** 云函数名称枚举 */
type CloudFunctionName =
  | 'login'
  | 'submitResult'
  | 'createOrder'
  | 'payCallback'
  | 'getReport'
  | 'shareToken'
  | 'invite'
  | 'compare'
  | 'sendMessage'
  | 'timedTask'
  | 'getABReport'
  | 'trackEvents'

/**
 * 调用云函数（统一封装）
 *
 * @param name - 云函数名称
 * @param data - 传递参数
 * @returns 云函数返回结果
 *
 * @example
 * ```ts
 * const result = await callCloud<{ userId: string }>('login', { code: 'xxx' })
 * if (result.success) {
 *   console.log(result.data.userId)
 * }
 * ```
 */
export async function callCloud<T = any>(
  name: CloudFunctionName,
  data: Record<string, any> = {}
): Promise<CloudResult<T>> {
  try {
    // #ifdef MP-WEIXIN
    return await callWxCloud<T>(name, data)
    // #endif

    // #ifdef H5
    return await callH5Cloud<T>(name, data)
    // #endif

    // 兜底：不应走到这里
    return { success: false, data: null as any, errMsg: '不支持的平台' }
  } catch (e: any) {
    console.error(`[Cloud] 调用 ${name} 失败:`, e)
    return {
      success: false,
      data: null as any,
      errMsg: e?.message || '未知错误',
      errCode: -1,
    }
  }
}

/**
 * 微信小程序端：通过 wx.cloud.callFunction 调用云函数
 */
async function callWxCloud<T>(
  name: string,
  data: Record<string, any>
): Promise<CloudResult<T>> {
  return new Promise((resolve) => {
    wx.cloud.callFunction({
      name,
      data,
      success(res) {
        const result = res.result as CloudResult<T>
        resolve({
          success: true,
          data: result?.data ?? (res.result as any),
          errMsg: result?.errMsg,
        })
      },
      fail(err) {
        resolve({
          success: false,
          data: null as any,
          errMsg: err.errMsg || '云函数调用失败',
        })
      },
    })
  })
}

/**
 * H5 端：通过 HTTP 请求调用云函数代理
 * 开发阶段使用本地 mock，生产环境请求云函数 HTTP 触发器
 */
async function callH5Cloud<T>(
  name: string,
  data: Record<string, any>
): Promise<CloudResult<T>> {
  // TODO: 替换为实际的云函数 HTTP 触发器地址
  const BASE_URL = ''

  if (!BASE_URL) {
    console.warn(`[Cloud] H5 端云函数地址未配置，函数: ${name}`)
    return {
      success: false,
      data: null as any,
      errMsg: '云函数地址未配置',
    }
  }

  try {
    const response = await uni.request({
      url: `${BASE_URL}/${name}`,
      method: 'POST',
      data,
      header: {
        'Content-Type': 'application/json',
      },
    })

    if (response.statusCode === 200) {
      const result = response.data as CloudResult<T>
      return {
        success: result.success ?? true,
        data: result.data,
        errMsg: result.errMsg,
      }
    }

    return {
      success: false,
      data: null as any,
      errMsg: `HTTP ${response.statusCode}`,
    }
  } catch (e: any) {
    return {
      success: false,
      data: null as any,
      errMsg: e?.message || '网络请求失败',
    }
  }
}

/**
 * 初始化云开发环境（仅微信小程序端）
 * 在 App.vue onLaunch 中调用
 */
export function initCloud() {
  // #ifdef MP-WEIXIN
  if (wx.cloud) {
    wx.cloud.init({
      env: 'cloud1-d6gbf6wre033ed617',
      traceUser: true,
    })
    console.log('[Cloud] 云开发环境已初始化')
  }
  // #endif
}

export type { CloudResult, CloudFunctionName }
