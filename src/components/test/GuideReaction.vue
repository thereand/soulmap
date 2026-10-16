<!--
  人格星图 - 向导即时反应气泡
  答题后短暂浮现的星灵低语，纯 CSS 动画驱动
-->
<template>
  <view v-if="visible" class="guide-reaction" :key="text">
    <view
      class="reaction-pill"
      :style="{ '--guide-color': guide.color }"
    >
      <text class="reaction-emoji">{{ guide.emoji }}</text>
      <text class="reaction-text" :style="{ color: tintedTextColor }">{{ text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { guideMap } from '@/data/guides'

interface Props {
  /** 反应文本（短文本，约 15-30 字） */
  text: string
  /** 向导 ID */
  guideId: string
  /** 控制可见性 */
  visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  guideId: 'flame',
  visible: false,
})

/* ===== 计算属性 ===== */

/** 当前向导定义 */
const guide = computed(() => guideMap[props.guideId as keyof typeof guideMap] ?? guideMap.flame)

/** 带主题色调的文字颜色（白色混入 20% 主题色） */
const tintedTextColor = computed(() => {
  const hex = guide.value.color
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  // 白色 (255) 混入 20% 主题色
  const mr = Math.round(255 * 0.8 + r * 0.2)
  const mg = Math.round(255 * 0.8 + g * 0.2)
  const mb = Math.round(255 * 0.8 + b * 0.2)
  return `rgb(${mr}, ${mg}, ${mb})`
})
</script>

<style lang="scss" scoped>
.guide-reaction {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 8rpx 0 16rpx;
  box-sizing: border-box;
  pointer-events: none;
  animation: reactionLifecycle 2.1s ease forwards;
}

/* === 胶囊气泡 === */
.reaction-pill {
  display: inline-flex;
  max-width: 100%;
  box-sizing: border-box;
  align-items: center;
  gap: 12rpx;
  padding: 14rpx 28rpx;
  border-radius: 999rpx;
  background: rgba(12, 8, 20, 0.75);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12rpx);
  box-shadow:
    0 4rpx 20rpx rgba(0, 0, 0, 0.3),
    0 0 30rpx rgba(var(--guide-color-rgb, 108, 60, 224), 0.1);
}

/* 向导 emoji */
.reaction-emoji {
  font-size: 28rpx;
  line-height: 1;
}

/* 反应文字 */
.reaction-text {
  font-size: 28rpx;
  line-height: 1.4;
  letter-spacing: 1rpx;
  font-family: "STKaiti", "KaiTi", "楷体", serif;
  min-width: 0;
  white-space: normal;
  word-break: break-all;
}

/* === 生命周期动画：滑入 → 停留 → 滑出 === */
/*
  总时长 2.1s = 0.3s 进入 + 1.5s 停留 + 0.3s 退出
  0%    → 隐藏（下方）
  14.3% → 完全可见（0.3s）
  85.7% → 仍然可见（1.8s）
  100%  → 隐藏（上方）
*/
@keyframes reactionLifecycle {
  0% {
    opacity: 0;
    transform: translateY(40rpx);
  }
  14.3% {
    opacity: 1;
    transform: translateY(0);
  }
  85.7% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-30rpx);
  }
}
</style>
