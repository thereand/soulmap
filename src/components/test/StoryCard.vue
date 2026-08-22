<!--
  灵魂星图 - 剧情场景卡片
  水墨仙侠风格：半透明墨色卡片 + 卷轴边框 + 打字机效果
-->
<template>
  <view class="story-card" :class="{ 'story-card--visible': isVisible }">
    <!-- 墨晕背景层 -->
    <view class="card-ink-bg"></view>

    <!-- 边框装饰 -->
    <view class="card-border-top"></view>
    <view class="card-border-bottom"></view>
    <view class="card-corner card-corner--tl"></view>
    <view class="card-corner card-corner--tr"></view>
    <view class="card-corner card-corner--bl"></view>
    <view class="card-corner card-corner--br"></view>

    <!-- 场景背景图（可选） -->
    <view
      v-if="background"
      class="card-scene-bg"
      :style="{ backgroundImage: `url(${background})` }"
    ></view>

    <!-- 内容区 -->
    <view class="card-content">
      <!-- 场景装饰线 -->
      <view class="scene-ornament">
        <view class="ornament-line"></view>
        <text class="ornament-icon">❖</text>
        <view class="ornament-line"></view>
      </view>

      <!-- 叙事文字：打字机效果 -->
      <view class="narrative-text">
        <text
          v-for="(char, idx) in displayChars"
          :key="idx"
          class="narrative-char"
          :style="{ animationDelay: `${idx * 30}ms` }"
        >{{ char }}</text>
        <!-- 打字光标 -->
        <text
          v-if="isTyping"
          class="typing-cursor"
        >|</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'

interface Props {
  /** 叙事文字内容 */
  narrative: string
  /** 场景背景图片（可选） */
  background?: string
}

const props = withDefaults(defineProps<Props>(), {
  background: '',
})

/** 是否可见（控制入场动画） */
const isVisible = ref(false)

/** 当前已显示的字符数 */
const displayedLength = ref(0)

/** 是否正在打字 */
const isTyping = ref(true)

/** 打字速度（毫秒/字符） */
const typingSpeed = 30

/** 显示中的字符数组 */
const displayChars = computed(() => {
  return props.narrative.slice(0, displayedLength.value).split('')
})

/** 打字机效果 */
let typingTimer: ReturnType<typeof setInterval> | null = null

function startTyping(): void {
  if (typingTimer) clearInterval(typingTimer)
  displayedLength.value = 0
  isTyping.value = true

  typingTimer = setInterval(() => {
    if (displayedLength.value < props.narrative.length) {
      displayedLength.value++
    } else {
      isTyping.value = false
      if (typingTimer) {
        clearInterval(typingTimer)
        typingTimer = null
      }
    }
  }, typingSpeed)
}

/** 监听文字变化重新打字 */
watch(() => props.narrative, () => {
  isVisible.value = false
  setTimeout(() => {
    isVisible.value = true
    startTyping()
  }, 100)
})

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
    startTyping()
  }, 200)
})

defineExpose({ isTyping, startTyping })
</script>

<style lang="scss" scoped>
.story-card {
  position: relative;
  max-width: 100%;
  box-sizing: border-box;
  margin: 0 auto;
  padding: 48rpx 40rpx;
  opacity: 0;
  transform: translateY(30rpx);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);

  &--visible {
    opacity: 1;
    transform: translateY(0);
  }
}

/* === 墨晕背景 === */
.card-ink-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 20%, rgba(201, 169, 110, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(201, 169, 110, 0.03) 0%, transparent 50%),
    linear-gradient(135deg, rgba(20, 15, 10, 0.85) 0%, rgba(30, 25, 18, 0.75) 50%, rgba(15, 12, 8, 0.9) 100%);
  border-radius: 16rpx;
  backdrop-filter: blur(20rpx);
}

/* === 边框装饰 === */
.card-border-top,
.card-border-bottom {
  position: absolute;
  left: 40rpx;
  right: 40rpx;
  height: 2rpx;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(201, 169, 110, 0.15) 20%,
    rgba(201, 169, 110, 0.4) 50%,
    rgba(201, 169, 110, 0.15) 80%,
    transparent 100%
  );
}

.card-border-top { top: 0; }
.card-border-bottom { bottom: 0; }

/* 角落装饰 */
.card-corner {
  position: absolute;
  width: 24rpx;
  height: 24rpx;
  border-color: rgba(201, 169, 110, 0.4);
  border-style: solid;
  border-width: 0;

  &--tl {
    top: -4rpx;
    left: -4rpx;
    border-top-width: 3rpx;
    border-left-width: 3rpx;
  }

  &--tr {
    top: -4rpx;
    right: -4rpx;
    border-top-width: 3rpx;
    border-right-width: 3rpx;
  }

  &--bl {
    bottom: -4rpx;
    left: -4rpx;
    border-bottom-width: 3rpx;
    border-left-width: 3rpx;
  }

  &--br {
    bottom: -4rpx;
    right: -4rpx;
    border-bottom-width: 3rpx;
    border-right-width: 3rpx;
  }
}

/* === 场景背景图 === */
.card-scene-bg {
  position: absolute;
  inset: 0;
  border-radius: 16rpx;
  background-size: cover;
  background-position: center;
  opacity: 0.1;
  mix-blend-mode: overlay;
}

/* === 内容区 === */
.card-content {
  position: relative;
  z-index: 1;
}

/* 装饰分隔线 */
.scene-ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.ornament-line {
  flex: 1;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 110, 0.3), transparent);
}

.ornament-icon {
  font-size: 20rpx;
  color: rgba(201, 169, 110, 0.5);
}

/* === 叙事文字 === */
.narrative-text {
  line-height: 1.9;
  min-height: 200rpx;
  word-break: break-all;
  overflow-wrap: break-word;
  white-space: normal;
}

.narrative-char {
  font-size: 30rpx;
  color: rgba(255, 255, 255, 0.92);
  font-family: "STKaiti", "KaiTi", "楷体", serif;
  letter-spacing: 2rpx;
  opacity: 0;
  animation: charFadeIn 0.15s ease forwards;
  /* #ifdef H5 */
  font-size: 34rpx;
  line-height: 2.2;
  /* #endif */
}

/* 打字光标 */
.typing-cursor {
  font-size: 30rpx;
  color: #c9a96e;
  animation: cursorBlink 0.8s ease-in-out infinite;
  margin-left: 4rpx;
}

@keyframes charFadeIn {
  from {
    opacity: 0;
    filter: blur(4rpx);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes cursorBlink {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}
</style>
