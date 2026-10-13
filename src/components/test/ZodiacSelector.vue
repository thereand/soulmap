<!--
  灵魂星图 - 星座选择器
  3×4 网格展示 12 星座，选中后确认或跳过
-->
<template>
  <view class="zodiac-selector">
    <!-- 星空背景 -->
    <view class="zodiac-bg">
      <view class="zodiac-bg__gradient"></view>
      <view class="zodiac-bg__stars">
        <view
          v-for="i in 24"
          :key="i"
          class="bg-star"
          :style="bgStarStyle(i)"
        />
      </view>
    </view>

    <!-- 顶部标题区 -->
    <view class="header-section" :class="{ 'anim-enter': mounted }">
      <text class="header-title">在踏上旅途之前...</text>
      <text class="header-subtitle">告诉我，哪颗星辰守护着你？</text>
    </view>

    <!-- 星座网格 -->
    <view class="zodiac-grid" :class="{ 'anim-enter': mounted }" style="animation-delay: 0.15s">
      <view
        v-for="(zodiac, idx) in zodiacSigns"
        :key="zodiac.id"
        class="zodiac-card"
        :class="{
          'zodiac-card--selected': selectedId === zodiac.id,
          'zodiac-card--enter': mounted,
        }"
        :style="{ animationDelay: `${0.2 + idx * 0.04}s` }"
        @tap="selectZodiac(zodiac.id)"
      >
        <!-- 选中发光边框 -->
        <view v-if="selectedId === zodiac.id" class="zodiac-card__glow"></view>

        <!-- 星座符号 -->
        <text class="zodiac-card__symbol">{{ zodiac.symbol }}</text>

        <!-- 星座名称 -->
        <text class="zodiac-card__name">{{ zodiac.name }}</text>

        <!-- 日期范围 -->
        <text class="zodiac-card__date">{{ zodiac.dateRange }}</text>

        <!-- 选中角标 -->
        <view v-if="selectedId === zodiac.id" class="zodiac-card__check">
          <text class="zodiac-card__check-icon">✓</text>
        </view>
      </view>
    </view>

    <!-- 底部操作区 -->
    <view class="action-area" :class="{ 'anim-enter': mounted }" style="animation-delay: 0.4s">
      <!-- 跳过链接 -->
      <view class="skip-link" @tap="handleSkip">
        <text class="skip-link__text">不知道 / 不想选</text>
      </view>

      <!-- 确认按钮 -->
      <view
        class="confirm-btn"
        :class="{
          'confirm-btn--active': canConfirm,
          'confirm-btn--disabled': !canConfirm,
        }"
        @tap="handleConfirm"
      >
        <view v-if="canConfirm" class="confirm-btn__glow"></view>
        <view class="confirm-btn__inner">
          <text class="confirm-btn__text">{{ confirmLabel }}</text>
          <text v-if="canConfirm" class="confirm-btn__arrow">→</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { zodiacSigns } from '@/data/zodiac'

const emit = defineEmits<{
  (e: 'select', zodiacId: string): void
  (e: 'skip'): void
}>()

const selectedId = ref<string | null>(null)
const mounted = ref(false)
/** 标记用户是否选择了"不想选" */
const skipped = ref(false)

/** 是否可以点击确认 */
const canConfirm = computed(() => !!selectedId.value || skipped.value)

/** 确认按钮文案 */
const confirmLabel = computed(() => {
  if (selectedId.value) {
    const z = zodiacSigns.find(z => z.id === selectedId.value)
    return z ? `选择 ${z.name}` : '确认选择'
  }
  if (skipped.value) return '跳过选择'
  return '请先选择星座'
})

/** 生成背景星星的随机样式 */
function bgStarStyle(index: number) {
  const seed = index * 59.41
  const x = (Math.sin(seed) * 0.5 + 0.5) * 100
  const y = (Math.cos(seed * 1.9) * 0.5 + 0.5) * 100
  const size = 2 + (index % 3)
  const delay = (index * 0.5) % 4
  return {
    left: `${x}%`,
    top: `${y}%`,
    width: `${size}rpx`,
    height: `${size}rpx`,
    animationDelay: `${delay}s`,
  }
}

/** 选择星座 */
function selectZodiac(id: string) {
  if (selectedId.value === id) {
    // 再次点击取消选择
    selectedId.value = null
    skipped.value = false
  } else {
    selectedId.value = id
    skipped.value = false
  }
}

/** 跳过选择 */
function handleSkip() {
  skipped.value = !skipped.value
  if (skipped.value) {
    selectedId.value = null
  }
}

/** 确认 */
function handleConfirm() {
  if (selectedId.value) {
    emit('select', selectedId.value)
  } else if (skipped.value) {
    emit('skip')
  }
}

onMounted(() => {
  setTimeout(() => { mounted.value = true }, 80)
})
</script>

<style lang="scss" scoped>
/* ===== 动画关键帧 ===== */

/* 星星闪烁 */
@keyframes twinkle {
  0%, 100% {
    opacity: 0.15;
  }
  50% {
    opacity: 0.7;
  }
}

/* 入场淡入上移 */
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片入场 */
@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(20rpx) scale(0.92);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 选中脉冲发光 */
@keyframes selectedPulse {
  0%, 100% {
    box-shadow:
      0 0 16rpx rgba(255, 215, 0, 0.25),
      0 0 32rpx rgba(255, 215, 0, 0.1);
  }
  50% {
    box-shadow:
      0 0 24rpx rgba(255, 215, 0, 0.4),
      0 0 48rpx rgba(255, 215, 0, 0.2);
  }
}

/* 按钮光晕 */
@keyframes btnGlow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

/* ===== 容器 ===== */
.zodiac-selector {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 32rpx 48rpx;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;

  /* #ifdef H5 */
  @media screen and (min-width: 768px) {
    max-width: 480px;
    margin: 0 auto;
  }
  /* #endif */
}

/* ===== 背景层 ===== */
.zodiac-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;

  &__gradient {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      #0d0118 0%,
      #1a0533 40%,
      #140228 70%,
      #0d0118 100%
    );
  }

  &__stars {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}

.bg-star {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  animation: twinkle 3.5s ease-in-out infinite;
}

/* ===== 入场动画辅助 ===== */
.anim-enter {
  opacity: 0;
  animation: fadeSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* ===== 顶部标题区 ===== */
.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
  position: relative;
  z-index: 1;
}

.header-title {
  font-size: $font-xxl;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 4rpx;
  margin-bottom: 16rpx;
}

.header-subtitle {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 2rpx;
  text-align: center;
}

/* ===== 星座网格 ===== */
.zodiac-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  width: 100%;
  max-width: 660rpx;
  margin-bottom: 48rpx;
  position: relative;
  z-index: 1;
}

/* ===== 星座卡片 ===== */
.zodiac-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28rpx 12rpx 24rpx;
  border-radius: $radius-lg;
  background: rgba(108, 60, 224, 0.06);
  border: 1.5rpx solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;

  /* 入场动画 */
  &--enter {
    opacity: 0;
    animation: cardEnter 0.45s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  /* 选中状态 */
  &--selected {
    background: rgba(255, 215, 0, 0.06);
    border-color: rgba(255, 215, 0, 0.5);
    transform: scale(1.04);
    animation: selectedPulse 2s ease-in-out infinite;
  }

  /* 点击反馈 */
  &:active {
    transform: scale(0.95);
    transition-duration: 0.1s;
  }

  &--selected:active {
    transform: scale(0.98);
  }

  /* 选中发光边框 */
  &__glow {
    position: absolute;
    top: -2rpx;
    left: -2rpx;
    right: -2rpx;
    bottom: -2rpx;
    border-radius: calc(#{$radius-lg} + 2rpx);
    border: 2rpx solid $accent-gold;
    pointer-events: none;
    box-shadow:
      0 0 20rpx rgba(255, 215, 0, 0.2),
      inset 0 0 12rpx rgba(255, 215, 0, 0.05);
  }

  /* 星座符号 */
  &__symbol {
    font-size: 56rpx;
    line-height: 1;
    margin-bottom: 12rpx;
    filter: drop-shadow(0 0 6rpx rgba(255, 255, 255, 0.2));
    transition: filter 0.3s ease;

    .zodiac-card--selected & {
      filter: drop-shadow(0 0 12rpx rgba(255, 215, 0, 0.5));
    }
  }

  /* 星座名称 */
  &__name {
    font-size: $font-base;
    font-weight: 600;
    color: $text-primary;
    letter-spacing: 2rpx;
    margin-bottom: 6rpx;
    transition: color 0.3s ease;

    .zodiac-card--selected & {
      color: $accent-gold;
    }
  }

  /* 日期范围 */
  &__date {
    font-size: $font-xs;
    color: $text-muted;
    letter-spacing: 1rpx;
    text-align: center;
    line-height: 1.4;

    .zodiac-card--selected & {
      color: rgba(255, 215, 0, 0.6);
    }
  }

  /* 选中角标 */
  &__check {
    position: absolute;
    top: 8rpx;
    right: 8rpx;
    width: 32rpx;
    height: 32rpx;
    border-radius: 50%;
    background: $accent-gold;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__check-icon {
    font-size: 18rpx;
    color: #1a0533;
    font-weight: 700;
  }
}

/* ===== 底部操作区 ===== */
.action-area {
  width: 100%;
  max-width: 660rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28rpx;
  position: relative;
  z-index: 1;
}

/* 跳过链接 */
.skip-link {
  padding: 12rpx 24rpx;

  &:active {
    opacity: 0.6;
  }

  &__text {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.35);
    letter-spacing: 2rpx;
    transition: color 0.2s ease;

    .skip-link:active & {
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

/* 确认按钮 */
.confirm-btn {
  position: relative;
  width: 100%;
  height: 96rpx;
  border-radius: $radius-full;
  transition: all 0.3s ease;

  &--disabled {
    opacity: 0.45;
    pointer-events: none;
  }

  &--active:active {
    transform: scale(0.97);
  }

  /* 按钮光晕 */
  &__glow {
    position: absolute;
    top: -6rpx;
    left: -6rpx;
    right: -6rpx;
    bottom: -6rpx;
    border-radius: $radius-full;
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(108, 60, 224, 0.3));
    filter: blur(8rpx);
    animation: btnGlow 2s ease-in-out infinite;
  }

  /* 按钮内层 */
  &__inner {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: $radius-full;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    overflow: hidden;
    transition: all 0.35s ease;

    /* 未激活态 */
    background: rgba(108, 60, 224, 0.15);
    border: 1.5rpx solid rgba(255, 255, 255, 0.08);

    /* 激活态 */
    .confirm-btn--active & {
      background: linear-gradient(135deg, $accent-gold, #ffb300);
      border-color: transparent;
      box-shadow: 0 8rpx 32rpx rgba(255, 215, 0, 0.25);

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 60%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.3),
          transparent
        );
        animation: shimmer 3s ease-in-out infinite;
      }
    }
  }

  /* 按钮文字 */
  &__text {
    font-size: $font-lg;
    font-weight: 700;
    color: $text-secondary;
    letter-spacing: 4rpx;
    transition: color 0.3s ease;

    .confirm-btn--active & {
      color: #1a0533;
    }
  }

  /* 箭头 */
  &__arrow {
    font-size: $font-lg;
    color: #1a0533;
    font-weight: 700;
  }
}

/* 微光扫过动画 */
@keyframes shimmer {
  0% {
    left: -100%;
  }
  50% {
    left: 150%;
  }
  100% {
    left: 150%;
  }
}
</style>
