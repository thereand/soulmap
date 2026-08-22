<!--
  灵魂星图 - 星灵角色卡片组件
  大卡片展示：星灵插画、名称、类型代码、元素图标、稀有度标签、代表色光晕
  动态效果：呼吸缩放、光晕旋转、粒子飞舞、shine 扫光、悬浮
-->
<template>
  <view
    class="character-card"
    :class="[
      `character-card--${rarityClass}`,
      { 'character-card--revealed': revealed },
    ]"
    :style="cardStyle"
  >
    <!-- 背景光晕层 -->
    <view class="character-card__halo" :style="haloStyle" />
    <view class="character-card__halo-outer" :style="haloStyle" />

    <!-- 星尘粒子装饰 -->
    <view class="character-card__particles">
      <view
        v-for="n in 12"
        :key="'p-' + n"
        class="character-card__particle"
        :class="`character-card__particle--${n}`"
      />
    </view>

    <!-- 卡片内容 -->
    <view class="character-card__content">
      <!-- 稀有度标签 -->
      <view class="character-card__rarity" :class="`character-card__rarity--${rarityClass}`">
        <text class="character-card__rarity-text">{{ type.rarity }}</text>
      </view>

      <!-- 星灵插画（带动态呼吸 + 旋转光晕 + shine 扫光） -->
      <view v-if="type.avatar" class="character-card__spirit">
        <!-- 旋转光晕环 -->
        <view class="character-card__spirit-ring" :style="ringStyle" />
        <view class="character-card__spirit-ring character-card__spirit-ring--reverse" :style="ringStyle" />

        <!-- 呼吸插画本体 -->
        <view class="character-card__spirit-inner" :style="spiritGlowStyle">
          <image
            class="character-card__spirit-img"
            :src="type.avatar"
            mode="aspectFill"
          />
          <!-- shine 扫光层 -->
          <view class="character-card__spirit-shine" />
        </view>
      </view>

      <!-- 元素图标 -->
      <view class="character-card__element">
        <text class="character-card__element-icon">{{ elementIcon }}</text>
      </view>

      <!-- 星灵名称 -->
      <text class="character-card__name">{{ type.name }}</text>

      <!-- 类型代码 -->
      <text class="character-card__code">{{ type.code }}</text>

      <!-- 星座区域 -->
      <text class="character-card__constellation">{{ type.constellation }}</text>
    </view>

    <!-- 底部装饰线 -->
    <view class="character-card__border-line" :style="{ background: type.color }" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { PersonalityTypeData } from '@/data/results/types'

interface Props {
  /** 人格类型数据 */
  type: PersonalityTypeData
}

const props = defineProps<Props>()

const revealed = ref(false)

onMounted(() => {
  setTimeout(() => {
    revealed.value = true
  }, 200)
})

/** 稀有度样式类 */
const rarityClass = computed(() => {
  switch (props.type.rarity) {
    case 'SSR': return 'ssr'
    case 'SR': return 'sr'
    default: return 'r'
  }
})

/** 稀有度颜色映射 */
const rarityColors: Record<string, string> = {
  SSR: '#ffd700',
  SR: '#a855f7',
  R: '#3b82f6',
}

/** 元素图标映射 */
const elementIcons: Record<string, string> = {
  '火': '🔥',
  '水': '💧',
  '风': '🌪',
  '土': '🌍',
  '光': '✨',
  '暗': '🌑',
}

const elementIcon = computed(() => elementIcons[props.type.element] || '⭐')

/** 卡片自定义样式 */
const cardStyle = computed(() => ({
  '--card-color': props.type.color,
  '--rarity-color': rarityColors[props.type.rarity] || '#3b82f6',
}))

/** 光晕样式 */
const haloStyle = computed(() => ({
  background: `radial-gradient(circle, ${props.type.color}88 0%, ${props.type.color}22 50%, transparent 70%)`,
}))

/** 星灵插画呼吸光晕 */
const spiritGlowStyle = computed(() => ({
  boxShadow: `0 0 50rpx ${props.type.color}66, 0 0 100rpx ${props.type.color}33`,
}))

/** 星灵插画外圈旋转光环 */
const ringStyle = computed(() => ({
  background: `conic-gradient(from 0deg, transparent 0%, ${props.type.color}88 25%, transparent 50%, ${props.type.color}66 75%, transparent 100%)`,
}))
</script>

<style lang="scss" scoped>
.character-card {
  position: relative;
  width: 100%;
  max-width: 620rpx;
  margin: 0 auto;
  border-radius: $radius-xl;
  overflow: hidden;
  background: linear-gradient(
    145deg,
    rgba(26, 5, 51, 0.95) 0%,
    rgba(13, 1, 24, 0.98) 100%
  );
  border: 2rpx solid rgba(255, 255, 255, 0.08);
  /* 入场动画 */
  opacity: 0;
  transform: translateY(60rpx) scale(0.92);
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);

  &--revealed {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  /* 稀有度边框颜色 */
  &--ssr {
    border-color: rgba(255, 215, 0, 0.35);
    box-shadow:
      0 0 60rpx rgba(255, 215, 0, 0.15),
      0 20rpx 60rpx rgba(0, 0, 0, 0.5);
  }

  &--sr {
    border-color: rgba(168, 85, 247, 0.35);
    box-shadow:
      0 0 60rpx rgba(168, 85, 247, 0.15),
      0 20rpx 60rpx rgba(0, 0, 0, 0.5);
  }

  &--r {
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow:
      0 0 40rpx rgba(59, 130, 246, 0.1),
      0 20rpx 60rpx rgba(0, 0, 0, 0.5);
  }

  /* 内部光晕 */
  &__halo {
    position: absolute;
    top: -30%;
    left: 50%;
    transform: translateX(-50%);
    width: 140%;
    height: 100%;
    opacity: 0;
    transition: opacity 1.2s ease 0.3s;
    pointer-events: none;
    animation: haloPulse 6s ease-in-out infinite;

    .character-card--revealed & {
      opacity: 0.7;
    }
  }

  &__halo-outer {
    position: absolute;
    top: -50%;
    left: 50%;
    transform: translateX(-50%);
    width: 200%;
    height: 160%;
    opacity: 0;
    transition: opacity 1.5s ease 0.5s;
    pointer-events: none;
    filter: blur(40rpx);
    animation: haloPulse 8s ease-in-out infinite reverse;

    .character-card--revealed & {
      opacity: 0.4;
    }
  }

  /* 粒子装饰 */
  &__particles {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  &__particle {
    position: absolute;
    width: 6rpx;
    height: 6rpx;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 0 8rpx rgba(255, 255, 255, 0.8);
    opacity: 0;
    animation: particleFloat 3s ease-in-out infinite;

    .character-card--revealed & {
      opacity: 1;
    }

    &--1 { left: 15%; top: 20%; animation-delay: 0s; }
    &--2 { left: 75%; top: 15%; animation-delay: 0.35s; }
    &--3 { left: 85%; top: 55%; animation-delay: 0.7s; }
    &--4 { left: 25%; top: 70%; animation-delay: 1.05s; }
    &--5 { left: 55%; top: 85%; animation-delay: 1.4s; }
    &--6 { left: 10%; top: 50%; animation-delay: 1.75s; }
    &--7 { left: 65%; top: 35%; animation-delay: 2.1s; }
    &--8 { left: 40%; top: 10%; animation-delay: 2.45s; }
    &--9 { left: 90%; top: 30%; animation-delay: 0.5s; width: 4rpx; height: 4rpx; }
    &--10 { left: 20%; top: 40%; animation-delay: 1.3s; width: 4rpx; height: 4rpx; }
    &--11 { left: 50%; top: 25%; animation-delay: 2.2s; width: 8rpx; height: 8rpx; }
    &--12 { left: 70%; top: 75%; animation-delay: 0.9s; width: 4rpx; height: 4rpx; }
  }

  /* 内容区 */
  &__content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-xxl $spacing-xl $spacing-xl;
  }

  /* 稀有度标签 */
  &__rarity {
    position: absolute;
    top: $spacing-lg;
    right: $spacing-lg;
    padding: 6rpx 18rpx;
    border-radius: $radius-sm;
    border: 1rpx solid;
    z-index: 3;

    &--ssr {
      background: rgba(255, 215, 0, 0.15);
      border-color: rgba(255, 215, 0, 0.5);
    }

    &--sr {
      background: rgba(168, 85, 247, 0.15);
      border-color: rgba(168, 85, 247, 0.5);
    }

    &--r {
      background: rgba(59, 130, 246, 0.15);
      border-color: rgba(59, 130, 246, 0.5);
    }
  }

  &__rarity-text {
    font-size: $font-xs;
    font-weight: 800;
    letter-spacing: 2rpx;
    .character-card--ssr & { color: #ffd700; }
    .character-card--sr & { color: #a855f7; }
    .character-card--r & { color: #3b82f6; }
  }

  /* 星灵插画区域 */
  &__spirit {
    position: relative;
    width: 360rpx;
    height: 480rpx;
    margin-bottom: $spacing-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: spiritFloat 4s ease-in-out infinite;
  }

  /* 旋转光环（在插画后面缓慢转动） */
  &__spirit-ring {
    position: absolute;
    top: -10%;
    left: -10%;
    right: -10%;
    bottom: -10%;
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    opacity: 0;
    filter: blur(20rpx);
    animation: ringRotate 12s linear infinite;
    transition: opacity 1.2s ease 0.4s;

    .character-card--revealed & {
      opacity: 0.6;
    }

    &--reverse {
      top: -18%;
      left: -18%;
      right: -18%;
      bottom: -18%;
      animation: ringRotate 18s linear infinite reverse;
      filter: blur(30rpx);

      .character-card--revealed & {
        opacity: 0.35;
      }
    }
  }

  /* 插画内层：呼吸缩放 + 呼吸光晕 */
  &__spirit-inner {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: $radius-lg;
    overflow: hidden;
    animation: spiritBreath 3.6s ease-in-out infinite;
    transform-origin: center center;
  }

  &__spirit-img {
    width: 100%;
    height: 100%;
    display: block;
    filter: saturate(1.15) brightness(1.02);
    animation: spiritHueShift 8s ease-in-out infinite;
  }

  /* shine 斜向扫光 */
  &__spirit-shine {
    position: absolute;
    top: -50%;
    left: -70%;
    width: 60%;
    height: 200%;
    background: linear-gradient(
      120deg,
      transparent 0%,
      rgba(255, 255, 255, 0) 40%,
      rgba(255, 255, 255, 0.35) 50%,
      rgba(255, 255, 255, 0) 60%,
      transparent 100%
    );
    transform: rotate(20deg);
    animation: spiritShine 5s ease-in-out infinite;
    pointer-events: none;
  }

  /* 元素图标 */
  &__element {
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 2rpx solid rgba(255, 255, 255, 0.1);
    margin-bottom: $spacing-md;
    animation: float 3s ease-in-out infinite;
  }

  &__element-icon {
    font-size: 44rpx;
  }

  /* 名称 */
  &__name {
    font-size: $font-xxl;
    font-weight: 800;
    color: $text-primary;
    letter-spacing: 4rpx;
    margin-bottom: $spacing-xs;
    text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.5);
  }

  /* 类型代码 */
  &__code {
    font-size: $font-xl;
    font-weight: 300;
    color: $text-secondary;
    letter-spacing: 12rpx;
    margin-bottom: $spacing-sm;
  }

  /* 星座区域 */
  &__constellation {
    font-size: $font-sm;
    color: $text-muted;
    letter-spacing: 4rpx;
  }

  /* 底部装饰线 */
  &__border-line {
    position: absolute;
    bottom: 0;
    left: 10%;
    right: 10%;
    height: 4rpx;
    border-radius: 4rpx;
    opacity: 0.6;
    animation: bottomLineBreath 3s ease-in-out infinite;
  }
}

/* 呼吸缩放 + 亮度呼吸 */
@keyframes spiritBreath {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1) saturate(1.05);
  }
  50% {
    transform: scale(1.035);
    filter: brightness(1.08) saturate(1.15);
  }
}

/* 插画整体的悬浮 */
@keyframes spiritFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-14rpx); }
}

/* 插画色相微微偏移，让色彩感觉在流动 */
@keyframes spiritHueShift {
  0%, 100% { filter: saturate(1.15) brightness(1.02) hue-rotate(0deg); }
  50% { filter: saturate(1.25) brightness(1.06) hue-rotate(6deg); }
}

/* shine 扫光 */
@keyframes spiritShine {
  0%, 60%, 100% {
    left: -70%;
    opacity: 0;
  }
  70% {
    opacity: 0.9;
  }
  90% {
    left: 130%;
    opacity: 0;
  }
}

/* 光环旋转 */
@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 背景光晕的呼吸 */
@keyframes haloPulse {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.08); }
}

/* 底部装饰线的呼吸 */
@keyframes bottomLineBreath {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.9; }
}

@keyframes particleFloat {
  0%, 100% {
    opacity: 0;
    transform: translateY(0) scale(0.5);
  }
  50% {
    opacity: 0.9;
    transform: translateY(-20rpx) scale(1);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12rpx); }
}
</style>
