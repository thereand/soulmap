<!--
  人格星图 - 序幕星空动画
  全屏星图渐入动画：星辰汇聚 → 文字序列 → 中央光芒绽放
-->
<template>
  <view class="prologue" :class="{ 'prologue--done': isDone }">
    <!-- 深色星空背景 -->
    <view class="prologue-bg"></view>

    <!-- 星空粒子层（汇聚 + 扩散动画） -->
    <view class="stars-field">
      <view
        v-for="i in 36"
        :key="i"
        class="star"
        :class="`star--size-${(i % 3) + 1}`"
        :style="starStyle(i)"
      />
    </view>

    <!-- 中央金色光芒 -->
    <view class="central-glow">
      <view class="central-glow__core"></view>
      <view class="central-glow__ring"></view>
      <view class="central-glow__ring central-glow__ring--outer"></view>
    </view>

    <!-- 文字序列 -->
    <view class="text-sequence">
      <text class="sequence-line sequence-line--1">在人格星图的深处...</text>
      <text class="sequence-line sequence-line--2">四位星灵正在等待觉醒...</text>
      <text class="sequence-line sequence-line--3">你的旅程，即将开始</text>
    </view>

    <!-- 跳过按钮 -->
    <view class="skip-btn" @tap="handleSkip">
      <text class="skip-btn__text">跳过</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits<{
  (e: 'complete'): void
}>()

const isDone = ref(false)
let completeTimer: ReturnType<typeof setTimeout> | null = null

/** 生成星星的随机位置与动画延迟 */
function starStyle(index: number) {
  const seed = index * 73.17
  const x = (Math.sin(seed) * 0.5 + 0.5) * 100
  const y = (Math.cos(seed * 1.3) * 0.5 + 0.5) * 100
  const delay = (index * 0.37) % 4
  const duration = 2.5 + (index % 5) * 0.4
  return {
    left: `${x}%`,
    top: `${y}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  }
}

/** 标记动画结束并触发 complete */
function finishAnimation() {
  if (isDone.value) return
  isDone.value = true
  emit('complete')
}

/** 跳过动画 */
function handleSkip() {
  if (completeTimer) {
    clearTimeout(completeTimer)
    completeTimer = null
  }
  finishAnimation()
}

onMounted(() => {
  // 动画总时长约 4 秒后自动完成
  completeTimer = setTimeout(() => {
    finishAnimation()
  }, 4200)
})

onBeforeUnmount(() => {
  if (completeTimer) {
    clearTimeout(completeTimer)
    completeTimer = null
  }
})
</script>

<style lang="scss" scoped>
/* ===== 动画关键帧 ===== */

/* 星星闪烁 */
@keyframes twinkle {
  0%, 100% {
    opacity: 0.2;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* 星空汇聚 → 扩散 */
@keyframes starsFlow {
  0% {
    transform: scale(1.6);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  50% {
    transform: scale(0.85);
    opacity: 1;
  }
  100% {
    transform: scale(1.15);
    opacity: 0.7;
  }
}

/* 中央光芒脉冲 */
@keyframes glowPulse {
  0% {
    transform: scale(0.2);
    opacity: 0;
  }
  25% {
    opacity: 0.4;
  }
  55% {
    transform: scale(1);
    opacity: 0.9;
  }
  80% {
    transform: scale(1.6);
    opacity: 0.6;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
}

/* 中央光环扩散 */
@keyframes ringExpand {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  30% {
    opacity: 0.6;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

/* 文字 1：0.2s ~ 1.3s 可见 */
@keyframes textFade1 {
  0%     { opacity: 0; }
  5%     { opacity: 0; }
  12%    { opacity: 1; }
  26%    { opacity: 1; }
  33%    { opacity: 0; }
  100%   { opacity: 0; }
}

/* 文字 2：1.4s ~ 2.6s 可见 */
@keyframes textFade2 {
  0%     { opacity: 0; }
  33%    { opacity: 0; }
  40%    { opacity: 1; }
  56%    { opacity: 1; }
  63%    { opacity: 0; }
  100%   { opacity: 0; }
}

/* 文字 3：2.8s ~ 4.0s 可见 */
@keyframes textFade3 {
  0%     { opacity: 0; }
  65%    { opacity: 0; }
  72%    { opacity: 1; }
  90%    { opacity: 1; }
  97%    { opacity: 0; }
  100%   { opacity: 0; }
}

/* 整体淡出 */
@keyframes prologueFadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}

/* ===== 容器 ===== */
.prologue {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &--done {
    animation: prologueFadeOut 0.4s ease forwards;
    pointer-events: none;
  }
}

/* ===== 深色星空背景 ===== */
.prologue-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    ellipse at 50% 50%,
    #0a0a2e 0%,
    #050518 50%,
    #000000 100%
  );
}

/* ===== 星空粒子层 ===== */
.stars-field {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  animation: starsFlow 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.star {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  animation: twinkle 3s ease-in-out infinite;

  &--size-1 {
    width: 3rpx;
    height: 3rpx;
    box-shadow: 0 0 6rpx rgba(255, 255, 255, 0.4);
  }

  &--size-2 {
    width: 5rpx;
    height: 5rpx;
    box-shadow: 0 0 10rpx rgba(255, 255, 255, 0.5);
  }

  &--size-3 {
    width: 7rpx;
    height: 7rpx;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 16rpx rgba(200, 200, 255, 0.6);
  }
}

/* ===== 中央金色光芒 ===== */
.central-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200rpx;
  height: 200rpx;
  pointer-events: none;

  &__core {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 80rpx;
    height: 80rpx;
    margin-top: -40rpx;
    margin-left: -40rpx;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(255, 215, 0, 0.6) 30%,
      rgba(255, 215, 0, 0.2) 60%,
      transparent 100%
    );
    box-shadow:
      0 0 60rpx rgba(255, 215, 0, 0.4),
      0 0 120rpx rgba(255, 215, 0, 0.2);
    animation: glowPulse 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  &__ring {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120rpx;
    height: 120rpx;
    margin-top: -60rpx;
    margin-left: -60rpx;
    border-radius: 50%;
    border: 2rpx solid rgba(255, 215, 0, 0.3);
    animation: ringExpand 3s ease-out 0.8s forwards;
    opacity: 0;

    &--outer {
      width: 180rpx;
      height: 180rpx;
      margin-top: -90rpx;
      margin-left: -90rpx;
      border-color: rgba(255, 215, 0, 0.15);
      animation-delay: 1.4s;
    }
  }
}

/* ===== 文字序列 ===== */
.text-sequence {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.sequence-line {
  font-size: 36rpx;
  color: $text-primary;
  letter-spacing: 4rpx;
  line-height: 1.8;
  text-align: center;
  text-shadow:
    0 0 20rpx rgba(255, 255, 255, 0.3),
    0 0 40rpx rgba(108, 60, 224, 0.2);
  opacity: 0;

  &--1 {
    animation: textFade1 4s ease forwards;
  }

  &--2 {
    animation: textFade2 4s ease forwards;
  }

  &--3 {
    animation: textFade3 4s ease forwards;
    color: $accent-gold;
    font-weight: 600;
    text-shadow:
      0 0 20rpx rgba(255, 215, 0, 0.4),
      0 0 40rpx rgba(255, 215, 0, 0.2);
  }
}

/* ===== 跳过按钮 ===== */
.skip-btn {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
  padding: 24rpx 32rpx;

  /* #ifdef H5 */
  @media screen and (min-width: 768px) {
    top: 0;
    right: calc(50% - 240px);
  }
  /* #endif */

  &:active {
    opacity: 0.6;
  }

  &__text {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 2rpx;
    transition: color 0.2s ease;
  }

  &:active &__text {
    color: rgba(255, 255, 255, 0.8);
  }
}
</style>
