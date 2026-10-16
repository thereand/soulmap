<!--
  自定义底部导航栏 - iOS 风格胶囊高亮（v2.0.11）
  · 通过 createSelectorQuery 实测每个 tab item 的 left/width，胶囊高亮跟随真实几何位置
  · 图标与文字均使用 display:block + text-align:center + width:100%，确保在 tab 内居中
  · 弹簧缓动 350ms（cubic-bezier 0.34,1.56,0.64,1）
-->
<template>
  <view class="ios-tabbar">
    <view class="ios-tabbar__content" id="iosTabContent">
      <!-- 滑动胶囊高亮背景（位置/宽度由实测决定） -->
      <view
        class="ios-tabbar__highlight"
        :class="{ 'is-ready': highlightReady }"
        :style="highlightStyle"
      />

      <!-- 三个 tab 项 -->
      <view
        v-for="(tab, index) in tabs"
        :key="tab.key"
        class="ios-tabbar__item"
        :class="{ 'is-active': index === activeIndex }"
        :data-index="index"
        @tap="handleTap(index)"
      >
        <view class="ios-tabbar__icon-wrap">
          <text class="ios-tabbar__icon">{{ tab.icon }}</text>
        </view>
        <text class="ios-tabbar__text">{{ tab.text }}</text>
      </view>
    </view>

    <!-- iPhone 底部安全区 -->
    <view class="ios-tabbar__safe" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick, getCurrentInstance, watch } from 'vue'
import { useTabBar } from '@/composables/useTabBar'

const { activeIndex, switchTo } = useTabBar()

const tabs = [
  { key: 'home', text: '首页', icon: '🏠' },
  { key: 'history', text: '历史', icon: '📜' },
  { key: 'profile', text: '我的', icon: '👤' },
]

interface Rect { left: number; width: number }

const containerRect = ref<Rect | null>(null)
const itemRects = ref<Rect[]>([])
const highlightReady = ref(false)

const instance = getCurrentInstance()
let measureTimer: ReturnType<typeof setTimeout> | null = null
let resizeHandler: (() => void) | null = null

const highlightStyle = computed(() => {
  const c = containerRect.value
  const it = itemRects.value[activeIndex.value]
  if (!c || !it) {
    return { left: '-9999px', width: '0px' }
  }
  const left = it.left - c.left
  return {
    left: left + 'px',
    width: it.width + 'px'
  }
})

onMounted(() => {
  // 首次测量：等布局稳定后
  scheduleMeasure(60)
  // #ifdef H5
  resizeHandler = () => scheduleMeasure(120)
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', resizeHandler)
  }
  // #endif
})

onBeforeUnmount(() => {
  if (measureTimer) clearTimeout(measureTimer)
  // #ifdef H5
  if (resizeHandler && typeof window !== 'undefined') {
    window.removeEventListener('resize', resizeHandler)
  }
  // #endif
})

// activeIndex 变化后（如 switchTab 后新页面挂载）也重测，防止分辨率切换/字体缩放导致偏移
watch(activeIndex, () => {
  scheduleMeasure(30)
})

function scheduleMeasure(delay = 0): void {
  if (measureTimer) clearTimeout(measureTimer)
  measureTimer = setTimeout(() => {
    measureTimer = null
    measure()
  }, delay)
}

function measure(): void {
  nextTick(() => {
    try {
      const query = uni.createSelectorQuery().in(instance as any)
      query.select('.ios-tabbar__content').boundingClientRect()
      query.selectAll('.ios-tabbar__item').boundingClientRect()
      query.exec((res: any) => {
        if (!res || !res[0] || !Array.isArray(res[1]) || res[1].length === 0) return
        const content = res[0] as any
        const items = res[1] as any[]
        containerRect.value = { left: content.left, width: content.width }
        itemRects.value = items.map((r) => ({ left: r.left, width: r.width }))
        highlightReady.value = true
      })
    } catch {
      // 兜底：使用估算几何
      try {
        const sys = uni.getSystemInfoSync()
        const contentWidth = sys.windowWidth - 24 - 8 // 外层 padding 12*2 + 内容 padding 4*2
        const itemWidth = contentWidth / 3
        containerRect.value = { left: 12, width: contentWidth + 8 }
        itemRects.value = [0, 1, 2].map((i) => ({ left: 12 + 4 + i * itemWidth, width: itemWidth }))
        highlightReady.value = true
      } catch {
        // 忽略
      }
    }
  })
}

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
    box-sizing: border-box;
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
    height: 40px;
    border-radius: 20px;
    background: linear-gradient(135deg, #ffe14d 0%, #ffd700 100%);
    box-shadow:
      0 2px 8px rgba(255, 215, 0, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
    opacity: 0;
    z-index: 0;
    pointer-events: none;

    &.is-ready {
      opacity: 1;
      transition:
        left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
        width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
        opacity 0.2s ease;
    }
  }

  &__item {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
    cursor: pointer;
    transition: transform 0.25s ease;

    &:active {
      transform: scale(0.94);
    }
  }

  &__icon-wrap {
    display: block;
    width: 100%;
    height: 24px;
    line-height: 24px;
    text-align: center;
    margin-bottom: 2px;
  }

  &__icon {
    display: inline-block;
    font-size: 20px;
    line-height: 24px;
    text-align: center;
    color: #ffffff;
    vertical-align: middle;
    transition: color 0.3s ease, transform 0.3s ease;
  }

  &__text {
    display: block;
    width: 100%;
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: #ffffff;
    line-height: 14px;
    transition: color 0.3s ease;
    -webkit-font-smoothing: antialiased;
  }

  &__item.is-active &__icon,
  &__item.is-active &__text {
    color: #3a3a3c;
  }

  &__item.is-active &__icon {
    transform: scale(1.08);
  }

  &__safe {
    height: env(safe-area-inset-bottom);
    background: transparent;
    pointer-events: none;
  }
}
</style>
