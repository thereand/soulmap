<!--
  灵魂星图 - 向导叙事叠加层
  每章开始时展示主导星灵的叙事独白，打字机效果 + 主题色光晕
-->
<template>
  <view
    v-if="isActive"
    class="guide-overlay"
    :class="{
      'guide-overlay--visible': showOverlay,
      'guide-overlay--fading': isFadingOut,
    }"
    @tap="handleTap"
  >
    <!-- 全屏暗色遮罩 -->
    <view class="overlay-backdrop"></view>

    <!-- 主题色光晕 -->
    <view
      class="overlay-glow"
      :style="{ background: glowGradient }"
    ></view>

    <!-- 内容区 -->
    <view class="overlay-content">
      <!-- 向导 emoji -->
      <view
        class="guide-emoji-wrap"
        :style="{ boxShadow: emojiShadow }"
      >
        <text class="guide-emoji">{{ guide.emoji }}</text>
      </view>

      <!-- 向导名称 -->
      <text
        class="guide-name"
        :style="{ color: guide.color, textShadow: nameShadow }"
      >{{ guide.name }}</text>

      <!-- 装饰分隔线 -->
      <view class="ornament-divider">
        <view class="ornament-line" :style="{ background: lineGradient }"></view>
        <view class="ornament-dot" :style="{ background: guide.color }"></view>
        <view class="ornament-line" :style="{ background: lineGradient }"></view>
      </view>

      <!-- 叙事文字（打字机效果） -->
      <view class="narrative-area">
        <text class="narrative-text">{{ displayedText }}</text>
        <text
          v-if="isTyping"
          class="typing-cursor"
          :style="{ color: guide.color }"
        >|</text>
      </view>

      <!-- 点击跳过提示 -->
      <text v-if="!isTyping" class="skip-hint">轻触继续</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import { guideMap } from '@/data/guides'

interface Props {
  /** 叠加叙事文本 */
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

const emit = defineEmits<{
  (e: 'complete'): void
}>()

/* ===== 响应式状态 ===== */

/** 是否实际渲染（含淡出阶段） */
const isActive = ref(false)

/** 遮罩是否可见（控制淡入） */
const showOverlay = ref(false)

/** 是否正在淡出 */
const isFadingOut = ref(false)

/** 已显示的字符数 */
const displayedLength = ref(0)

/** 是否正在打字 */
const isTyping = ref(false)

/* ===== 计算属性 ===== */

/** 当前向导定义 */
const guide = computed(() => guideMap[props.guideId as keyof typeof guideMap] ?? guideMap.flame)

/** 当前已显示的文本 */
const displayedText = computed(() => {
  return props.text.slice(0, displayedLength.value)
})

/** 主题色光晕渐变 */
const glowGradient = computed(() => {
  const c = guide.value.color
  return `radial-gradient(ellipse at 50% 30%, ${hexToRgba(c, 0.12)} 0%, transparent 60%)`
})

/** emoji 外发光阴影 */
const emojiShadow = computed(() => {
  return `0 0 60rpx ${hexToRgba(guide.value.color, 0.4)}, 0 0 120rpx ${hexToRgba(guide.value.color, 0.2)}`
})

/** 名称文字发光 */
const nameShadow = computed(() => {
  return `0 0 20rpx ${hexToRgba(guide.value.color, 0.5)}`
})

/** 分隔线渐变 */
const lineGradient = computed(() => {
  return `linear-gradient(90deg, transparent, ${hexToRgba(guide.value.color, 0.4)}, transparent)`
})

/* ===== 打字机逻辑 ===== */

const TYPING_SPEED = 20
const AUTO_COMPLETE_DELAY = 1500
const FADE_DURATION = 500

let typingTimer: ReturnType<typeof setInterval> | null = null
let autoTimer: ReturnType<typeof setTimeout> | null = null

function startTyping(): void {
  clearAllTimers()
  displayedLength.value = 0
  isTyping.value = true

  typingTimer = setInterval(() => {
    if (displayedLength.value < props.text.length) {
      displayedLength.value++
    } else {
      // 打字完成
      isTyping.value = false
      if (typingTimer) {
        clearInterval(typingTimer)
        typingTimer = null
      }
      // 1.5s 后自动完成
      autoTimer = setTimeout(() => {
        triggerComplete()
      }, AUTO_COMPLETE_DELAY)
    }
  }, TYPING_SPEED)
}

/** 用户点击跳过 或 自动完成 */
function triggerComplete(): void {
  clearAllTimers()
  // 立即显示全部文本
  displayedLength.value = props.text.length
  isTyping.value = false
  // 淡出
  isFadingOut.value = true
  showOverlay.value = false

  setTimeout(() => {
    isActive.value = false
    isFadingOut.value = false
    emit('complete')
  }, FADE_DURATION)
}

function handleTap(): void {
  if (isFadingOut.value) return
  triggerComplete()
}

/* ===== 生命周期 / 监听 ===== */

watch(
  () => props.visible,
  (val) => {
    if (val) {
      // 显示
      isActive.value = true
      isFadingOut.value = false
      showOverlay.value = false

      // 下一帧触发淡入
      setTimeout(() => {
        showOverlay.value = true
        startTyping()
      }, 50)
    } else {
      // 外部强制隐藏
      if (isActive.value && !isFadingOut.value) {
        triggerComplete()
      }
    }
  },
)

onBeforeUnmount(() => {
  clearAllTimers()
})

/* ===== 工具函数 ===== */

function clearAllTimers(): void {
  if (typingTimer) {
    clearInterval(typingTimer)
    typingTimer = null
  }
  if (autoTimer) {
    clearTimeout(autoTimer)
    autoTimer = null
  }
}

/** hex 色值转 rgba */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
</script>

<style lang="scss" scoped>
.guide-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: auto;

  &--visible {
    opacity: 1;
  }

  &--fading {
    opacity: 0;
    transition: opacity 0.5s ease;
  }
}

/* === 遮罩层 === */
.overlay-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(8, 4, 16, 0.8);
}

/* === 主题色光晕 === */
.overlay-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* === 内容区 === */
.overlay-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 64rpx;
  max-width: 600rpx;
  gap: 32rpx;
}

/* 向导 emoji */
.guide-emoji-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 2rpx solid rgba(255, 255, 255, 0.08);
  animation: emojiPulse 2.5s ease-in-out infinite;
}

.guide-emoji {
  font-size: 80rpx;
  filter: drop-shadow(0 0 16rpx rgba(255, 255, 255, 0.3));
}

/* 向导名称 */
.guide-name {
  font-size: 36rpx;
  font-weight: 500;
  letter-spacing: 8rpx;
  font-family: "STKaiti", "KaiTi", "楷体", serif;
}

/* 装饰分隔线 */
.ornament-divider {
  display: flex;
  align-items: center;
  gap: 16rpx;
  width: 80%;
}

.ornament-line {
  flex: 1;
  height: 1rpx;
}

.ornament-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  opacity: 0.7;
}

/* 叙事文字区 */
.narrative-area {
  width: 100%;
  min-height: 200rpx;
  line-height: 1.9;
  word-break: break-all;
  overflow-wrap: break-word;
  white-space: normal;
}

.narrative-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.88);
  font-family: "STKaiti", "KaiTi", "楷体", serif;
  letter-spacing: 2rpx;
  /* #ifdef H5 */
  font-size: 32rpx;
  line-height: 2.1;
  /* #endif */
}

/* 打字光标 */
.typing-cursor {
  font-size: 28rpx;
  margin-left: 4rpx;
  animation: cursorBlink 0.8s ease-in-out infinite;
  /* #ifdef H5 */
  font-size: 32rpx;
  /* #endif */
}

/* 跳过提示 */
.skip-hint {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 4rpx;
  margin-top: 24rpx;
  animation: fadeInUp 0.6s ease forwards;
}

/* === 动画关键帧 === */
@keyframes emojiPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.06);
  }
}

@keyframes cursorBlink {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
