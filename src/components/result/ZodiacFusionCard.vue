<!--
  人格星图 - 星座×MBTI 融合解读卡片组件
  展示星座符号、元素徽章、融合模式（共鸣/反差/互补）、
  契合度百分比、融合解读文本、星座加成特质和隐藏面。
  深色半透明背景 + 星座元素色辉光。
-->
<template>
  <view class="zodiac-fusion">
    <!-- 元素色背景辉光层 -->
    <view class="zodiac-fusion__bg-glow" :style="bgGlowStyle" />

    <!-- 星座符号装饰（背景水印） -->
    <view class="zodiac-fusion__bg-symbol">
      <text class="zodiac-fusion__bg-symbol-text">{{ zodiac.symbol }}</text>
    </view>

    <!-- ── 顶部：星座符号 + 名称 + 元素徽章 ── -->
    <view class="zodiac-fusion__header">
      <!-- 星座符号（带元素色辉光） -->
      <view class="zodiac-fusion__symbol" :style="symbolGlowStyle">
        <text class="zodiac-fusion__symbol-text">{{ zodiac.symbol }}</text>
      </view>
      <!-- 星座名称 -->
      <text class="zodiac-fusion__name">{{ zodiac.name }}</text>
      <!-- 元素徽章 -->
      <view class="zodiac-fusion__element-badge" :style="elementBadgeStyle">
        <text class="zodiac-fusion__element-text">{{ zodiac.elementName }}</text>
      </view>
    </view>

    <!-- ── 模式徽章 + 契合度 ── -->
    <view class="zodiac-fusion__meta">
      <!-- 融合模式徽章 -->
      <view class="zodiac-fusion__mode-badge" :class="`zodiac-fusion__mode-badge--${interpretation.mode}`">
        <text class="zodiac-fusion__mode-text" :class="`zodiac-fusion__mode-text--${interpretation.mode}`">
          {{ interpretation.modeName }}
        </text>
      </view>
      <!-- 契合度 -->
      <view class="zodiac-fusion__score">
        <text class="zodiac-fusion__score-label">星座契合度:</text>
        <text class="zodiac-fusion__score-value" :class="`zodiac-fusion__score-value--${interpretation.mode}`">
          {{ matchPercent }}%
        </text>
      </view>
    </view>

    <!-- ── 主解读文本 ── -->
    <view class="zodiac-fusion__body">
      <text class="zodiac-fusion__interpretation">{{ interpretation.text }}</text>
    </view>

    <!-- ── 星座加成特质 ── -->
    <view v-if="interpretation.zodiacBoosts.length" class="zodiac-fusion__boosts">
      <text class="zodiac-fusion__boosts-title">星座加成</text>
      <view class="zodiac-fusion__boosts-list">
        <view
          v-for="(boost, idx) in interpretation.zodiacBoosts"
          :key="idx"
          class="zodiac-fusion__boost-pill"
          :style="boostPillStyle(idx)"
        >
          <text class="zodiac-fusion__boost-text" :style="boostTextStyle">{{ boost }}</text>
        </view>
      </view>
    </view>

    <!-- ── 隐藏面 ── -->
    <view class="zodiac-fusion__hidden">
      <view class="zodiac-fusion__hidden-line" :style="hiddenLineStyle" />
      <text class="zodiac-fusion__hidden-label">星座的另一面</text>
      <text class="zodiac-fusion__hidden-text">{{ interpretation.hiddenSide }}</text>
    </view>

    <!-- 底部装饰线 -->
    <view class="zodiac-fusion__bottom-accent" :style="bottomAccentStyle" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { zodiacMap } from '@/data/zodiac'
import { getZodiacInterpretation } from '@/utils/zodiac-fusion'
import type { MBTIType } from '@/types/test'

interface Props {
  /** 用户的星座 ID */
  zodiacId: string
  /** 用户的 MBTI 类型 */
  mbtiType: string
}

const props = defineProps<Props>()

/** 星座数据 */
const zodiac = computed(() => zodiacMap[props.zodiacId])

/** 融合解读结果 */
const interpretation = computed(() =>
  getZodiacInterpretation(props.zodiacId, props.mbtiType as MBTIType),
)

/** 契合度百分比 */
const matchPercent = computed(() => Math.round(interpretation.value.matchScore * 100))

/* ─────────────────────────────────────────────
   元素色系映射
   ───────────────────────────────────────────── */
const elementColors: Record<string, string> = {
  fire:  '#ff6b35',
  earth: '#8fbc5e',
  air:   '#64b5f6',
  water: '#9c7cf4',
}

const elementColor = computed(
  () => elementColors[zodiac.value?.element] ?? '#6c3ce0',
)

/* ─────────────────────────────────────────────
   样式计算
   ───────────────────────────────────────────── */

/** 背景辉光 */
const bgGlowStyle = computed(() => {
  const c = elementColor.value
  return {
    background: `radial-gradient(ellipse at 30% 0%, ${c}18 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, ${c}10 0%, transparent 50%)`,
  }
})

/** 符号辉光 */
const symbolGlowStyle = computed(() => {
  const c = elementColor.value
  return {
    boxShadow: `0 0 24rpx ${c}55, 0 0 60rpx ${c}22`,
    borderColor: `${c}66`,
  }
})

/** 元素徽章 */
const elementBadgeStyle = computed(() => {
  const c = elementColor.value
  return {
    background: `${c}18`,
    borderColor: `${c}55`,
  }
})

/** 加成特质药丸样式 */
function boostPillStyle(idx: number) {
  const c = elementColor.value
  const opacity = [0.18, 0.12, 0.08][idx] ?? 0.08
  return {
    background: `${c}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    borderColor: `${c}44`,
  }
}

const boostTextStyle = computed(() => ({
  color: elementColor.value,
}))

/** 隐藏面装饰线 */
const hiddenLineStyle = computed(() => ({
  background: `linear-gradient(90deg, transparent, ${elementColor.value}44, transparent)`,
}))

/** 底部装饰线 */
const bottomAccentStyle = computed(() => ({
  background: `linear-gradient(90deg, transparent, ${elementColor.value}88, transparent)`,
}))
</script>

<style lang="scss" scoped>
.zodiac-fusion {
  position: relative;
  width: 100%;
  max-width: 650rpx;
  margin: 0 auto;
  border-radius: $radius-xl;
  overflow: hidden;
  padding: $spacing-xl $spacing-lg $spacing-lg;
  background: linear-gradient(
    145deg,
    rgba(26, 5, 51, 0.92) 0%,
    rgba(13, 1, 24, 0.96) 100%
  );
  border: 2rpx solid rgba(255, 255, 255, 0.06);
  box-shadow: $shadow-lg;
  animation: fadeInUp 0.8s ease forwards;

  /* ── 背景辉光层 ── */
  &__bg-glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  /* ── 星座符号水印 ── */
  &__bg-symbol {
    position: absolute;
    right: -20rpx;
    top: -30rpx;
    pointer-events: none;
    z-index: 0;
    opacity: 0.04;
  }

  &__bg-symbol-text {
    font-size: 240rpx;
    line-height: 1;
  }

  /* ── 顶部区域 ── */
  &__header {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  &__symbol {
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.04);
    border: 2rpx solid;
    flex-shrink: 0;
    animation: symbolPulse 4s ease-in-out infinite;
  }

  &__symbol-text {
    font-size: 60rpx;
    line-height: 1;
    filter: drop-shadow(0 0 8rpx rgba(255, 255, 255, 0.25));
  }

  &__name {
    font-size: $font-xl;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: 4rpx;
    flex-shrink: 0;
  }

  &__element-badge {
    display: inline-flex;
    align-items: center;
    padding: 4rpx 16rpx;
    border-radius: $radius-full;
    border: 1rpx solid;
    flex-shrink: 0;
  }

  &__element-text {
    font-size: $font-xs;
    color: $text-secondary;
    letter-spacing: 2rpx;
  }

  /* ── 模式 + 契合度 ── */
  &__meta {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-lg;
    padding-bottom: $spacing-md;
    border-bottom: 1rpx solid rgba(255, 255, 255, 0.06);
  }

  &__mode-badge {
    display: inline-flex;
    align-items: center;
    padding: 6rpx 20rpx;
    border-radius: $radius-full;
    border: 1rpx solid;

    &--resonance {
      background: rgba(255, 215, 0, 0.12);
      border-color: rgba(255, 215, 0, 0.4);
    }

    &--contrast {
      background: rgba(156, 124, 244, 0.12);
      border-color: rgba(156, 124, 244, 0.4);
    }

    &--complementary {
      background: rgba(76, 175, 80, 0.12);
      border-color: rgba(76, 175, 80, 0.4);
    }
  }

  &__mode-text {
    font-size: $font-xs;
    font-weight: 600;
    letter-spacing: 2rpx;

    &--resonance {
      color: #ffd700;
    }

    &--contrast {
      color: #b39ddb;
    }

    &--complementary {
      color: #81c784;
    }
  }

  &__score {
    display: flex;
    align-items: baseline;
    gap: $spacing-4;
  }

  &__score-label {
    font-size: $font-xs;
    color: $text-muted;
  }

  &__score-value {
    font-size: $font-lg;
    font-weight: 800;
    letter-spacing: 2rpx;

    &--resonance {
      color: #ffd700;
      text-shadow: 0 0 12rpx rgba(255, 215, 0, 0.4);
    }

    &--contrast {
      color: #b39ddb;
      text-shadow: 0 0 12rpx rgba(179, 157, 219, 0.4);
    }

    &--complementary {
      color: #81c784;
      text-shadow: 0 0 12rpx rgba(129, 199, 132, 0.4);
    }
  }

  /* ── 主解读文本 ── */
  &__body {
    position: relative;
    z-index: 1;
    margin-bottom: $spacing-lg;
  }

  &__interpretation {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.7;
    text-align: justify;
    word-break: break-all;
  }

  /* ── 星座加成特质 ── */
  &__boosts {
    position: relative;
    z-index: 1;
    margin-bottom: $spacing-lg;
  }

  &__boosts-title {
    display: block;
    font-size: $font-xs;
    color: $text-muted;
    letter-spacing: 2rpx;
    margin-bottom: $spacing-sm;
  }

  &__boosts-list {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-sm;
  }

  &__boost-pill {
    display: inline-flex;
    align-items: center;
    padding: 8rpx 22rpx;
    border-radius: $radius-full;
    border: 1rpx solid;
  }

  &__boost-text {
    font-size: $font-xs;
    font-weight: 500;
    letter-spacing: 1rpx;
  }

  /* ── 隐藏面 ── */
  &__hidden {
    position: relative;
    z-index: 1;
    padding-top: $spacing-md;
  }

  &__hidden-line {
    height: 1rpx;
    margin-bottom: $spacing-md;
  }

  &__hidden-label {
    display: block;
    font-size: $font-xs;
    color: $text-muted;
    letter-spacing: 2rpx;
    margin-bottom: $spacing-sm;
  }

  &__hidden-text {
    display: block;
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.7;
    font-style: italic;
    padding-left: $spacing-md;
    border-left: 4rpx solid rgba(255, 255, 255, 0.08);
  }

  /* ── 底部装饰线 ── */
  &__bottom-accent {
    position: absolute;
    bottom: 0;
    left: 20%;
    right: 20%;
    height: 3rpx;
    border-radius: 3rpx;
    opacity: 0.5;
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

@keyframes symbolPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.06);
  }
}

@keyframes bottomLineBreath {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.7; }
}
</style>
