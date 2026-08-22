/**
 * 灵魂星图 - A/B 实验配置
 *
 * 该文件是 A/B 实验的唯一事实源，前端根据 experimentId 通过 useABTest.getVariant 分组。
 * 后续可考虑通过云存储/云函数下发实现热更新。
 */

export interface ABExperiment {
  /** 实验 ID */
  id: string
  /** 实验名称（后台展示用） */
  name: string
  /** 变体列表 */
  variants: string[]
  /** 权重（缺省即均分） */
  weights?: number[]
  /** 是否启用 */
  enabled: boolean
  /** 备注 */
  description?: string
}

export const activeExperiments: ABExperiment[] = [
  {
    id: 'price_test_v1',
    name: '报告定价测试',
    variants: ['9.9', '6.9'],
    weights: [50, 50],
    enabled: true,
    description: '对比 ¥9.9 与 ¥6.9 首档定价下的付费转化率',
  },
  {
    id: 'paywall_copy_v1',
    name: '付费墙文案测试',
    variants: ['default', 'emotional'],
    weights: [50, 50],
    enabled: true,
    description: '对比理性型「解锁完整解读」与情感型「你的星灵想告诉你...」',
  },
  {
    id: 'countdown_duration_v1',
    name: '限时优惠时长测试',
    variants: ['30min', '24h'],
    weights: [50, 50],
    enabled: true,
    description: '首档优惠时长：30 分钟 vs 24 小时',
  },
  {
    id: 'share_style_v1',
    name: '分享引导样式',
    variants: ['bottom_btn', 'modal_delay'],
    weights: [50, 50],
    enabled: false,
    description: '底部固定按钮 vs 3 秒后全屏弹窗（默认关闭，需要延迟机制配合）',
  },
  {
    id: 'invite_threshold_v1',
    name: '裂变解锁门槛',
    variants: ['3person', '1person'],
    weights: [50, 50],
    enabled: true,
    description: '解锁完整免费报告：邀请 3 人 vs 1 人',
  },
] as const

/** 便捷取值：根据 ID 拿实验配置 */
export function getExperiment(id: string): ABExperiment | undefined {
  return activeExperiments.find((e) => e.id === id)
}
