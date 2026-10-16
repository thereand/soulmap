<!--
  自定义底部导航栏 - iOS 风格胶囊高亮
  选中项：黄色圆角胶囊背景（#ffd700）+ 深灰文字（#3a3a3c）
  未选中：纯白文字（#ffffff）+ 透明背景
  胶囊滑动动画 350ms spring 缓动
-->
<template>
  <view class="ios-tabbar">
    <view class="ios-tabbar__content">
      <!-- 滑动胶囊高亮背景 -->
      <view
        class="ios-tabbar__highlight"
        :style="{ transform: `translateX(${highlightOffset}px)` }"
      />

      <!-- 三个 tab 项 -->
      <view
        v-for="(tab, index) in tabs"
        :key="tab.key"
        class="ios-tabbar__item"
        :class="{ 'is-active': index === activeIndex }"
        @tap="handleTap(index)"
      >
        <text class="ios-tabbar__icon">{{ tab.icon }}</text>
        <text class="ios-tabbar__text">{{ tab.text }}</text>
      </view>
    </view>

    <!-- iPhone 底部安全区 -->
    <view class="ios-tabbar__safe" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useTabBar } from '@/composables/useTabBar'

const { activeIndex, switchTo } = useTabBar()

const tabs = [
  { key: 'home', text: '首页', icon: '🏠' },
  { key: 'history', text: '历史', icon: '📜' },
  { key: 'profile', text: '我的', icon: '👤' },
]

const itemWidth = ref(0)
let resizeTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  measureItemWidth()
})

onBeforeUnmount(() => {
  if (resizeTimer) clearTimeout(resizeTimer)
})

/** 动态测量每个 tab 项的宽度（基于屏幕宽度均分） */
function measureItemWidth(): void {
  try {
    const sys = uni.getSystemInfoSync()
    // 3 个 tab 等宽，减去两侧 padding（24rpx ≈ 12px * 2 = 24px）
    itemWidth.value = (sys.windowWidth - 24) / 3
  } catch {
    itemWidth.value = 110 // 兜底
  }
}

const highlightOffset = computed(() => {
  // 胶囊起始位置：item 居中 - 胶囊半宽
  const itemCenter = activeIndex.value * itemWidth.value + itemWidth.value / 2
  const capsuleHalfWidth = 56 // 胶囊宽 112px 的一半
  return itemCenter - capsuleHalfWidth
})

function handleTap(index: number): void {
  if (index === activeIndex.value) return
  switchTo(index)
}
</script>

<style lang="scss" scoped>
.ios-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  padding: 0 12px;
  box-sizing: border-box;
  pointer-events: none;

  &__content {
    position: relative;
    display: flex;
    align-items: stretch;
    height: 52px;
    padding: 6px 4px;
    background: rgba(30, 15, 50, 0.75);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border-radius: 28px;
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.35),
      0 0 0 0.5px rgba(255, 255, 255, 0.08);
    pointer-events: auto;
  }

  &__highlight {
    position: absolute;
    top: 6px;
    left: 4px;
    width: 112px;
    height: 40px;
    border-radius: 20px;
    background: linear-gradient(135deg, #ffe14d 0%, #ffd700 100%);
    box-shadow:
      0 2px 8px rgba(255, 215, 0, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    will-change: transform;
    z-index: 0;
  }

  &__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    position: relative;
    z-index: 1;
    cursor: pointer;
    transition: transform 0.25s ease;

    &:active {
      transform: scale(0.92);
    }
  }

  &__icon {
    font-size: 22px;
    line-height: 1;
    color: #ffffff;
    transition: color 0.3s ease, transform 0.3s ease;
  }

  &__text {
    font-size: 11px;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: 0.5px;
    line-height: 1;
    transition: color 0.3s ease;
    -webkit-font-smoothing: antialiased;
  }

  &__item.is-active &__icon,
  &__item.is-active &__text {
    color: #3a3a3c;
  }

  &__item.is-active &__icon {
    transform: scale(1.1);
  }

  &__safe {
    height: env(safe-area-inset-bottom);
    background: transparent;
    pointer-events: none;
  }
}
</style>
