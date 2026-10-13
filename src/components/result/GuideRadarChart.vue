<!--
  灵魂星图 - 星灵亲和度雷达图组件
  纯 CSS 实现的四轴雷达图，展示 flame / abyss / forest / star 四维亲和度。
  网格线使用旋转正方形（菱形），数据区域使用 clip-path 多边形。
-->
<template>
  <view class="radar">
    <!-- 顶部标签：烈焰之灵 -->
    <view class="radar__label radar__label--top">
      <text class="radar__label-emoji">{{ guideMap.flame.emoji }}</text>
      <text class="radar__label-name" :style="{ color: guideMap.flame.color }">
        {{ guideMap.flame.name }}
      </text>
      <text class="radar__label-score">{{ displayScore('flame') }}</text>
    </view>

    <!-- 中间行：左标签 + 图表 + 右标签 -->
    <view class="radar__row">
      <!-- 左侧标签：星光之灵 -->
      <view class="radar__label radar__label--left">
        <text class="radar__label-emoji">{{ guideMap.star.emoji }}</text>
        <text class="radar__label-name" :style="{ color: guideMap.star.color }">
          {{ guideMap.star.name }}
        </text>
        <text class="radar__label-score">{{ displayScore('star') }}</text>
      </view>

      <!-- 图表区域 -->
      <view class="radar__chart">
        <!-- 网格菱形 -->
        <view
          v-for="level in gridLevels"
          :key="'grid-' + level"
          class="radar__grid"
          :style="gridDiamondStyle(level)"
        />

        <!-- 十字轴线 -->
        <view class="radar__axis radar__axis--vertical" />
        <view class="radar__axis radar__axis--horizontal" />

        <!-- 中心点 -->
        <view class="radar__center" />

        <!-- 数据多边形 -->
        <view class="radar__data" :style="dataPolygonStyle" />

        <!-- 数据点 -->
        <view
          v-for="axis in axisConfigs"
          :key="'dot-' + axis.id"
          class="radar__dot"
          :style="dataDotStyle(axis.id)"
        />
      </view>

      <!-- 右侧标签：深渊之灵 -->
      <view class="radar__label radar__label--right">
        <text class="radar__label-emoji">{{ guideMap.abyss.emoji }}</text>
        <text class="radar__label-name" :style="{ color: guideMap.abyss.color }">
          {{ guideMap.abyss.name }}
        </text>
        <text class="radar__label-score">{{ displayScore('abyss') }}</text>
      </view>
    </view>

    <!-- 底部标签：森林之灵 -->
    <view class="radar__label radar__label--bottom">
      <text class="radar__label-emoji">{{ guideMap.forest.emoji }}</text>
      <text class="radar__label-name" :style="{ color: guideMap.forest.color }">
        {{ guideMap.forest.name }}
      </text>
      <text class="radar__label-score">{{ displayScore('forest') }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { guideMap } from '@/data/guides'
import type { GuideAffinityScores, GuideId } from '@/types/guide'

interface Props {
  /** 归一化后的 0-100 亲和度分数 */
  scores: GuideAffinityScores
}

const props = defineProps<Props>()

/* ── 图表尺寸常量（rpx） ── */
const chartSize = 300
const maxRadius = 120
/** 最大半径占图表尺寸的百分比 */
const maxExtentPct = (maxRadius / chartSize) * 100 // 40

/* ── 网格等级 ── */
const gridLevels = [0.25, 0.5, 0.75, 1.0]

/* ── 轴配置 ── */
interface AxisDef {
  id: GuideId
  dx: number
  dy: number
}

const axisConfigs: AxisDef[] = [
  { id: 'flame', dx: 0, dy: -1 },
  { id: 'abyss', dx: 1, dy: 0 },
  { id: 'forest', dx: 0, dy: 1 },
  { id: 'star', dx: -1, dy: 0 },
]

/** 将分数钳位到 5-100（保证最小可见面积） */
function clampScore(v: number): number {
  return Math.max(5, Math.min(100, Math.round(v)))
}

/** 展示用的分数文本 */
function displayScore(guideId: GuideId): string {
  return `${clampScore(props.scores[guideId])}`
}

/** 网格菱形样式（旋转 45° 的正方形） */
function gridDiamondStyle(level: number) {
  const side = level * maxRadius * Math.SQRT2
  const offset = (chartSize - side) / 2
  return {
    width: `${Math.round(side)}rpx`,
    height: `${Math.round(side)}rpx`,
    left: `${Math.round(offset)}rpx`,
    top: `${Math.round(offset)}rpx`,
  }
}

/** 数据多边形 clip-path + 渐变背景 */
const dataPolygonStyle = computed(() => {
  const flame = clampScore(props.scores.flame)
  const abyss = clampScore(props.scores.abyss)
  const forest = clampScore(props.scores.forest)
  const star = clampScore(props.scores.star)

  const flameY = 50 - (flame / 100) * maxExtentPct
  const abyssX = 50 + (abyss / 100) * maxExtentPct
  const forestY = 50 + (forest / 100) * maxExtentPct
  const starX = 50 - (star / 100) * maxExtentPct

  const clipPath = `polygon(50% ${flameY.toFixed(1)}%, ${abyssX.toFixed(1)}% 50%, 50% ${forestY.toFixed(1)}%, ${starX.toFixed(1)}% 50%)`

  // 四色渐变填充
  const fc = guideMap.flame.color
  const ac = guideMap.abyss.color
  const foc = guideMap.forest.color
  const sc = guideMap.star.color

  return {
    clipPath,
    WebkitClipPath: clipPath,
    background: `linear-gradient(135deg, ${fc}66 0%, ${ac}55 33%, ${foc}55 66%, ${sc}66 100%)`,
  }
})

/** 数据点圆点样式 */
function dataDotStyle(guideId: GuideId) {
  const v = clampScore(props.scores[guideId])
  const axis = axisConfigs.find((a) => a.id === guideId)!
  const leftPct = 50 + axis.dx * (v / 100) * maxExtentPct
  const topPct = 50 + axis.dy * (v / 100) * maxExtentPct
  const color = guideMap[guideId].color

  return {
    left: `${leftPct.toFixed(1)}%`,
    top: `${topPct.toFixed(1)}%`,
    backgroundColor: color,
    boxShadow: `0 0 12rpx ${color}, 0 0 4rpx ${color}`,
  }
}
</script>

<style lang="scss" scoped>
.radar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 560rpx;
  margin: 0 auto;
  padding: $spacing-md 0;

  /* ── 中间行 ── */
  &__row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
  }

  /* ═══════════════════════════
   * 标签
   * ═══════════════════════════ */
  &__label {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 90rpx;

    &--top {
      margin-bottom: $spacing-sm;
    }

    &--bottom {
      margin-top: $spacing-sm;
    }

    &--left {
      align-items: flex-end;
      text-align: right;
    }

    &--right {
      align-items: flex-start;
      text-align: left;
    }
  }

  &__label-emoji {
    font-size: $font-lg;
    line-height: 1.2;
    margin-bottom: 4rpx;
  }

  &__label-name {
    font-size: $font-xs;
    font-weight: 600;
    letter-spacing: 1rpx;
    line-height: 1.3;
  }

  &__label-score {
    font-size: $font-sm;
    font-weight: 700;
    color: $accent-gold;
    line-height: 1.2;
    margin-top: 2rpx;
  }

  /* ═══════════════════════════
   * 图表区域
   * ═══════════════════════════ */
  &__chart {
    position: relative;
    width: 300rpx;
    height: 300rpx;
    flex-shrink: 0;
  }

  /* ── 网格菱形（旋转 45° 的正方形） ── */
  &__grid {
    position: absolute;
    transform: rotate(45deg);
    border: 1rpx solid rgba(255, 255, 255, 0.1);
    border-radius: 4rpx;
    pointer-events: none;
  }

  /* ── 十字轴线 ── */
  &__axis {
    position: absolute;
    background: rgba(255, 255, 255, 0.08);
    pointer-events: none;

    &--vertical {
      left: 50%;
      top: 10%;
      width: 1rpx;
      height: 80%;
      transform: translateX(-50%);
    }

    &--horizontal {
      left: 10%;
      top: 50%;
      width: 80%;
      height: 1rpx;
      transform: translateY(-50%);
    }
  }

  /* ── 中心点 ── */
  &__center {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 6rpx;
    height: 6rpx;
    margin: -3rpx 0 0 -3rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    pointer-events: none;
  }

  /* ── 数据多边形 ── */
  &__data {
    position: absolute;
    inset: 0;
    transition: clip-path 0.8s ease, -webkit-clip-path 0.8s ease;
    pointer-events: none;
    animation: dataFadeIn 1s ease 0.3s both;
  }

  /* ── 数据点 ── */
  &__dot {
    position: absolute;
    width: 14rpx;
    height: 14rpx;
    margin: -7rpx 0 0 -7rpx;
    border-radius: 50%;
    border: 2rpx solid rgba(255, 255, 255, 0.9);
    z-index: 2;
    transition: left 0.8s ease, top 0.8s ease;
    animation: dotPopIn 0.5s ease 0.6s both;
  }
}

/* ═══ 动画 ═══ */

@keyframes dataFadeIn {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes dotPopIn {
  from {
    opacity: 0;
    transform: scale(0);
  }
  60% {
    transform: scale(1.3);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
