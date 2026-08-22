<!--
  灵魂星图 - 章节过场动画
  水墨仙侠风格：境界突破 + 获得灵魂碎片 + 灵气粒子
-->
<template>
  <view v-if="visible" class="chapter-transition" :class="{ 'transition--active': showContent }">
    <!-- 全屏遮罩 -->
    <view class="overlay"></view>

    <!-- 灵气粒子背景 -->
    <view class="particle-field">
      <view
        v-for="i in 24"
        :key="i"
        class="particle"
        :class="`particle--${(i % 4) + 1}`"
        :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: `${2 + Math.random() * 2}s`,
        }"
      ></view>
    </view>

    <!-- 中央内容 -->
    <view class="transition-content">
      <!-- 境界完成标题 -->
      <view class="realm-complete" :class="{ 'realm-complete--show': showContent }">
        <view class="realm-ornament-line"></view>
        <text class="realm-complete-label">境 界 突 破</text>
        <view class="realm-ornament-line"></view>
      </view>

      <!-- 章节名称 -->
      <view class="chapter-title" :class="{ 'chapter-title--show': showTitle }">
        <text class="chapter-name">第{{ chapterNumber }}章</text>
        <text class="chapter-subtitle">{{ chapterSubtitle }}</text>
      </view>

      <!-- 灵魂碎片 -->
      <view class="fragment-display" :class="{ 'fragment-display--show': showFragment }">
        <!-- 碎片图标 -->
        <view class="fragment-icon">
          <view class="fragment-glow"></view>
          <view class="fragment-core">
            <text class="fragment-emoji">{{ fragmentEmoji }}</text>
          </view>
          <view class="fragment-ring"></view>
          <view class="fragment-ring fragment-ring--outer"></view>
        </view>

        <!-- 获得提示 -->
        <view class="fragment-info">
          <text class="fragment-obtain">获得灵魂碎片</text>
          <text class="fragment-name">{{ fragmentName }}</text>
        </view>
      </view>
    </view>

    <!-- 底部灵气波纹 -->
    <view class="bottom-mist">
      <view class="mist-layer mist-layer--1"></view>
      <view class="mist-layer mist-layer--2"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface Props {
  /** 章节编号 (1~5) */
  chapterNumber: number
  /** 碎片名称 */
  fragmentName: string
  /** 是否可见 */
  visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  chapterNumber: 1,
  fragmentName: '',
  visible: false,
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

/** 内容显示阶段 */
const showContent = ref(false)
const showTitle = ref(false)
const showFragment = ref(false)

/** 碎片对应的 emoji */
const fragmentEmoji = computed(() => {
  const emojis = ['✦', '◈', '❋', '⚡', '☯']
  return emojis[props.chapterNumber - 1] ?? '✦'
})

/** 章节副标题 */
const chapterSubtitle = computed(() => {
  const subtitles = ['觉醒', '探索', '抉择', '蜕变', '归宿']
  return subtitles[props.chapterNumber - 1] ?? ''
})

/** 关闭定时器 */
let closeTimer: ReturnType<typeof setTimeout> | null = null

/** 分阶段显示动画 */
watch(() => props.visible, (val) => {
  if (val) {
    showContent.value = false
    showTitle.value = false
    showFragment.value = false

    // 阶段1：标题出现
    setTimeout(() => { showContent.value = true }, 200)
    // 阶段2：章节名
    setTimeout(() => { showTitle.value = true }, 600)
    // 阶段3：碎片出现
    setTimeout(() => { showFragment.value = true }, 1100)
    // 自动关闭
    closeTimer = setTimeout(() => {
      emit('close')
    }, 3000)
  } else {
    showContent.value = false
    showTitle.value = false
    showFragment.value = false
    if (closeTimer) {
      clearTimeout(closeTimer)
      closeTimer = null
    }
  }
})
</script>

<style lang="scss" scoped>
.chapter-transition {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* === 全屏遮罩 === */
.overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 50% 50%,
    rgba(15, 12, 8, 0.92) 0%,
    rgba(10, 10, 15, 0.97) 100%
  );
  animation: overlayFadeIn 0.5s ease forwards;
}

/* === 灵气粒子 === */
.particle-field {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
  background: rgba(201, 169, 110, 0.6);
  box-shadow: 0 0 12rpx rgba(201, 169, 110, 0.4);
  animation: particleFloat 3s ease-in-out infinite;

  &--1 { width: 4rpx; height: 4rpx; background: rgba(201, 169, 110, 0.4); }
  &--2 { width: 8rpx; height: 8rpx; background: rgba(201, 169, 110, 0.7); box-shadow: 0 0 20rpx rgba(201, 169, 110, 0.5); }
  &--3 { width: 5rpx; height: 5rpx; background: rgba(255, 255, 255, 0.5); }
  &--4 { width: 3rpx; height: 3rpx; background: rgba(201, 169, 110, 0.3); }
}

/* === 中央内容 === */
.transition-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48rpx;
  padding: 0 64rpx;
}

/* 境界完成 */
.realm-complete {
  display: flex;
  align-items: center;
  gap: 24rpx;
  opacity: 0;
  transform: translateY(20rpx);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);

  &--show {
    opacity: 1;
    transform: translateY(0);
  }
}

.realm-ornament-line {
  width: 80rpx;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, rgba(201, 169, 110, 0.6), transparent);
}

.realm-complete-label {
  font-size: 28rpx;
  color: #c9a96e;
  letter-spacing: 12rpx;
  font-family: "STKaiti", "KaiTi", "楷体", serif;
  text-shadow: 0 0 20rpx rgba(201, 169, 110, 0.4);
}

/* 章节标题 */
.chapter-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);

  &--show {
    opacity: 1;
    transform: scale(1);
  }
}

.chapter-name {
  font-size: 56rpx;
  font-weight: 300;
  color: #ffffff;
  letter-spacing: 8rpx;
  font-family: "STKaiti", "KaiTi", "楷体", serif;
  text-shadow: 0 0 30rpx rgba(255, 255, 255, 0.2);
}

.chapter-subtitle {
  font-size: 30rpx;
  color: rgba(201, 169, 110, 0.7);
  letter-spacing: 6rpx;
  font-family: "STKaiti", "KaiTi", "楷体", serif;
}

/* === 灵魂碎片 === */
.fragment-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32rpx;
  opacity: 0;
  transform: translateY(40rpx);
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);

  &--show {
    opacity: 1;
    transform: translateY(0);
  }
}

.fragment-icon {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fragment-glow {
  position: absolute;
  inset: -30rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 110, 0.25) 0%, transparent 60%);
  animation: fragmentGlow 2s ease-in-out infinite;
}

.fragment-core {
  position: relative;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 110, 0.15) 0%, rgba(10, 10, 15, 0.8) 70%);
  border: 2rpx solid rgba(201, 169, 110, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 30rpx rgba(201, 169, 110, 0.3),
    inset 0 0 20rpx rgba(201, 169, 110, 0.1);
  animation: fragmentFloat 3s ease-in-out infinite;
}

.fragment-emoji {
  font-size: 44rpx;
  filter: drop-shadow(0 0 8rpx rgba(201, 169, 110, 0.6));
}

.fragment-ring {
  position: absolute;
  inset: -10rpx;
  border-radius: 50%;
  border: 1.5rpx solid rgba(201, 169, 110, 0.2);
  animation: ringExpand 2.5s ease-out infinite;

  &--outer {
    inset: -24rpx;
    animation-delay: 1s;
    border-color: rgba(201, 169, 110, 0.1);
  }
}

.fragment-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.fragment-obtain {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 4rpx;
}

.fragment-name {
  font-size: 36rpx;
  color: #c9a96e;
  letter-spacing: 6rpx;
  font-family: "STKaiti", "KaiTi", "楷体", serif;
  text-shadow: 0 0 16rpx rgba(201, 169, 110, 0.5);
}

/* === 底部雾气 === */
.bottom-mist {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  overflow: hidden;
  pointer-events: none;
}

.mist-layer {
  position: absolute;
  bottom: -20rpx;
  left: -50%;
  width: 200%;
  height: 120rpx;
  background: radial-gradient(ellipse at 50% 100%, rgba(201, 169, 110, 0.06) 0%, transparent 60%);
  animation: mistDrift 8s ease-in-out infinite;

  &--2 {
    animation-delay: 3s;
    opacity: 0.6;
    bottom: -40rpx;
  }
}

/* === 动画关键帧 === */
@keyframes overlayFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-60rpx) scale(1.5);
    opacity: 0.8;
  }
}

@keyframes fragmentGlow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

@keyframes fragmentFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12rpx); }
}

@keyframes ringExpand {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes mistDrift {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(5%); }
}
</style>
