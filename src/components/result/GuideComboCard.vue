<!--
  灵魂星图 - 星灵组合卡片组件
  展示用户的 1-4 位星灵向导组合：类型标签、星灵图标（带光晕）、
  组合名称、核心特质标签、详细解读。
  四星齐辉（quad）时有特殊棱镜彩虹光效。
-->
<template>
  <view
    class="combo-card"
    :class="{ 'combo-card--quad': isQuad }"
  >
    <!-- 棱镜彩虹光晕（仅 quad） -->
    <view v-if="isQuad" class="combo-card__prism" />

    <!-- 星空背景装饰 -->
    <view class="combo-card__stars">
      <view
        v-for="n in 16"
        :key="'star-' + n"
        class="combo-card__star-dot"
        :class="`combo-card__star-dot--${n}`"
      />
    </view>

    <!-- 类型标签 -->
    <view class="combo-card__type-label" :style="typeLabelStyle">
      <text class="combo-card__type-text">{{ typeLabel }}</text>
    </view>

    <!-- 活跃星灵图标行 -->
    <view class="combo-card__guides">
      <view
        v-for="guideId in combination.guides"
        :key="guideId"
        class="combo-card__guide"
      >
        <!-- 彩色光晕背景 -->
        <view
          class="combo-card__guide-glow"
          :style="guideGlowStyle(guideId)"
        />
        <text class="combo-card__guide-emoji">{{ guideMap[guideId].emoji }}</text>
      </view>
    </view>

    <!-- 未激活星灵（缩小暗淡） -->
    <view v-if="inactiveGuides.length > 0" class="combo-card__inactive">
      <view
        v-for="guideId in inactiveGuides"
        :key="'inact-' + guideId"
        class="combo-card__inactive-item"
      >
        <text class="combo-card__inactive-emoji">{{ guideMap[guideId].emoji }}</text>
        <text class="combo-card__inactive-name">{{ guideMap[guideId].name }}</text>
      </view>
    </view>

    <!-- 组合名称 -->
    <text class="combo-card__name" :class="{ 'combo-card__name--quad': isQuad }">
      {{ combination.name }}
    </text>

    <!-- 核心特质标签 -->
    <view class="combo-card__traits">
      <view
        v-for="(trait, idx) in combination.coreTraits"
        :key="idx"
        class="combo-card__trait"
        :style="traitPillStyle(idx)"
      >
        <text class="combo-card__trait-text">{{ trait }}</text>
      </view>
    </view>

    <!-- 描述文本 -->
    <text class="combo-card__desc">{{ combination.description }}</text>

    <!-- 底部装饰线 -->
    <view class="combo-card__bottom-line" :style="bottomLineStyle" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { guideMap } from '@/data/guides'
import type { GuideCombination, GuideAffinityScores, GuideId } from '@/types/guide'

interface Props {
  /** 判定的星灵组合 */
  combination: GuideCombination
  /** 四位星灵的原始亲和度得分 */
  scores: GuideAffinityScores
}

const props = defineProps<Props>()

/** 组合类型中文标签 */
const comboTypeLabels: Record<string, string> = {
  single: '独星共鸣',
  dual: '双星共鸣',
  triple: '三星辉映',
  quad: '万象星灵',
}

/** 当前类型标签 */
const typeLabel = computed(() => comboTypeLabels[props.combination.type] || '星灵共鸣')

/** 是否为四星齐辉 */
const isQuad = computed(() => props.combination.type === 'quad')

/** 未激活的星灵列表 */
const inactiveGuides = computed<GuideId[]>(() => {
  const allGuides: GuideId[] = ['flame', 'abyss', 'forest', 'star']
  return allGuides.filter((id) => !props.combination.guides.includes(id))
})

/** 主色调（取第一个活跃星灵的颜色） */
const primaryColor = computed(() => {
  const firstGuide = props.combination.guides[0]
  return firstGuide ? guideMap[firstGuide].color : '#6c3ce0'
})

/** 类型标签样式 */
const typeLabelStyle = computed(() => {
  if (isQuad.value) {
    return {
      background: 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(124,92,224,0.2), rgba(76,175,80,0.2), rgba(255,215,0,0.2))',
      borderColor: 'rgba(255,215,0,0.5)',
    }
  }
  const color = primaryColor.value
  return {
    background: `${color}20`,
    borderColor: `${color}66`,
  }
})

/** 星灵图标光晕样式 */
function guideGlowStyle(guideId: GuideId) {
  const color = guideMap[guideId].color
  return {
    background: `radial-gradient(circle, ${color}55 0%, ${color}22 50%, transparent 70%)`,
    boxShadow: `0 0 30rpx ${color}44, 0 0 60rpx ${color}22`,
  }
}

/** 特质标签样式（循环使用活跃星灵的颜色） */
function traitPillStyle(idx: number) {
  const guides = props.combination.guides
  if (isQuad.value) {
    const colors = guides.map((id) => guideMap[id].color)
    return {
      borderColor: `${colors[idx % colors.length]}88`,
      background: `${colors[idx % colors.length]}15`,
    }
  }
  const guideId = guides[idx % guides.length]
  const color = guideMap[guideId].color
  return {
    borderColor: `${color}66`,
    background: `${color}15`,
  }
}

/** 底部装饰线样式 */
const bottomLineStyle = computed(() => {
  if (isQuad.value) {
    return {
      background: 'linear-gradient(90deg, #ff6b35, #7c5ce0, #4caf50, #ffd700)',
    }
  }
  return {
    background: primaryColor.value,
  }
})
</script>

<style lang="scss" scoped>
.combo-card {
  position: relative;
  width: 100%;
  max-width: 650rpx;
  margin: 0 auto;
  border-radius: $radius-xl;
  overflow: hidden;
  padding: $spacing-xl $spacing-lg $spacing-lg;
  background: linear-gradient(
    145deg,
    rgba(26, 5, 51, 0.95) 0%,
    rgba(13, 1, 24, 0.98) 100%
  );
  border: 2rpx solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 60rpx rgba(108, 60, 224, 0.12), $shadow-lg;
  animation: fadeInUp 0.8s ease forwards;

  /* ── 四星齐辉棱镜光效 ── */
  &--quad {
    border-color: rgba(255, 215, 0, 0.25);
    box-shadow:
      0 0 40rpx rgba(255, 107, 53, 0.1),
      0 0 40rpx rgba(124, 92, 224, 0.1),
      0 0 40rpx rgba(76, 175, 80, 0.1),
      0 0 40rpx rgba(255, 215, 0, 0.1),
      $shadow-lg;
  }

  &__prism {
    position: absolute;
    inset: -4rpx;
    border-radius: $radius-xl;
    background: conic-gradient(
      from 0deg,
      rgba(255, 107, 53, 0.3),
      rgba(124, 92, 224, 0.3),
      rgba(76, 175, 80, 0.3),
      rgba(255, 215, 0, 0.3),
      rgba(255, 107, 53, 0.3)
    );
    z-index: 0;
    animation: prismRotate 8s linear infinite;
    opacity: 0.6;
    filter: blur(20rpx);
    pointer-events: none;
  }

  /* ── 星空背景装饰 ── */
  &__stars {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
  }

  &__star-dot {
    position: absolute;
    width: 4rpx;
    height: 4rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    animation: twinkle 3s ease-in-out infinite;

    &--1  { left: 8%;  top: 12%; animation-delay: 0s; }
    &--2  { left: 22%; top: 6%;  animation-delay: 0.4s; }
    &--3  { left: 45%; top: 10%; animation-delay: 0.8s; width: 3rpx; height: 3rpx; }
    &--4  { left: 72%; top: 8%;  animation-delay: 1.2s; }
    &--5  { left: 88%; top: 15%; animation-delay: 1.6s; width: 5rpx; height: 5rpx; }
    &--6  { left: 15%; top: 30%; animation-delay: 0.3s; width: 3rpx; height: 3rpx; }
    &--7  { left: 92%; top: 35%; animation-delay: 0.7s; }
    &--8  { left: 5%;  top: 55%; animation-delay: 1.1s; }
    &--9  { left: 85%; top: 60%; animation-delay: 1.5s; width: 3rpx; height: 3rpx; }
    &--10 { left: 35%; top: 92%; animation-delay: 0.2s; }
    &--11 { left: 60%; top: 88%; animation-delay: 0.6s; width: 5rpx; height: 5rpx; }
    &--12 { left: 78%; top: 90%; animation-delay: 1.0s; }
    &--13 { left: 10%; top: 80%; animation-delay: 1.4s; width: 3rpx; height: 3rpx; }
    &--14 { left: 50%; top: 4%;  animation-delay: 1.8s; }
    &--15 { left: 30%; top: 50%; animation-delay: 0.5s; width: 3rpx; height: 3rpx; }
    &--16 { left: 68%; top: 45%; animation-delay: 1.9s; }
  }

  /* ── 类型标签 ── */
  &__type-label {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    padding: 6rpx 20rpx;
    border-radius: $radius-full;
    border: 1rpx solid;
    margin-bottom: $spacing-lg;
  }

  &__type-text {
    font-size: $font-xs;
    font-weight: 600;
    color: $accent-gold;
    letter-spacing: 2rpx;
  }

  /* ── 活跃星灵图标行 ── */
  &__guides {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-lg;
    margin-bottom: $spacing-lg;
  }

  &__guide {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100rpx;
    height: 100rpx;
    animation: guideAppear 0.6s ease forwards;
    opacity: 0;

    @for $i from 1 through 4 {
      &:nth-child(#{$i}) {
        animation-delay: #{0.2 + $i * 0.15}s;
      }
    }
  }

  &__guide-glow {
    position: absolute;
    inset: -20rpx;
    border-radius: 50%;
    animation: glowPulse 3s ease-in-out infinite;
  }

  &__guide-emoji {
    position: relative;
    font-size: 80rpx;
    line-height: 1;
    filter: drop-shadow(0 0 8rpx rgba(255, 255, 255, 0.3));
  }

  /* ── 未激活星灵 ── */
  &__inactive {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-md;
    margin-bottom: $spacing-md;
  }

  &__inactive-item {
    display: flex;
    align-items: center;
    gap: 6rpx;
    opacity: 0.35;
  }

  &__inactive-emoji {
    font-size: $font-sm;
  }

  &__inactive-name {
    font-size: $font-xs;
    color: $text-muted;
  }

  /* ── 组合名称 ── */
  &__name {
    position: relative;
    z-index: 1;
    display: block;
    text-align: center;
    font-size: 44rpx;
    font-weight: 800;
    color: $accent-gold;
    letter-spacing: 6rpx;
    margin-bottom: $spacing-md;
    text-shadow: 0 4rpx 16rpx rgba(255, 215, 0, 0.3);

    &--quad {
      background: linear-gradient(
        135deg,
        #ff6b35,
        #ffd700 30%,
        #7c5ce0 60%,
        #4caf50 80%,
        #ffd700
      );
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: quadShimmer 4s ease-in-out infinite;
    }
  }

  /* ── 核心特质标签 ── */
  &__traits {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-lg;
  }

  &__trait {
    display: inline-flex;
    align-items: center;
    padding: 6rpx 20rpx;
    border-radius: $radius-full;
    border: 1rpx solid;
  }

  &__trait-text {
    font-size: $font-xs;
    color: $text-secondary;
    letter-spacing: 1rpx;
  }

  /* ── 描述文本 ── */
  &__desc {
    position: relative;
    z-index: 1;
    display: block;
    font-size: $font-sm;
    color: $text-secondary;
    line-height: 1.6;
    text-align: justify;
    word-break: break-all;
  }

  /* ── 底部装饰线 ── */
  &__bottom-line {
    position: absolute;
    bottom: 0;
    left: 15%;
    right: 15%;
    height: 4rpx;
    border-radius: 4rpx;
    opacity: 0.6;
    animation: bottomLineBreath 3s ease-in-out infinite;
  }
}

/* ═══ 动画 ═══ */

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes guideAppear {
  from {
    opacity: 0;
    transform: scale(0.5) translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes glowPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.15);
    opacity: 1;
  }
}

@keyframes prismRotate {
  from {
    filter: blur(20rpx) hue-rotate(0deg);
  }
  to {
    filter: blur(20rpx) hue-rotate(360deg);
  }
}

@keyframes quadShimmer {
  0%, 100% {
    background-position: 0% center;
  }
  50% {
    background-position: 200% center;
  }
}

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

@keyframes bottomLineBreath {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.9; }
}
</style>
