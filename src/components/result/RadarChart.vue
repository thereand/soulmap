<!--
  灵魂星图 - 维度雷达图组件
  纯SVG实现的四角雷达图，展示 E-I / S-N / T-F / J-P 四维度
-->
<template>
  <view class="radar-chart">
    <svg
      :viewBox="`0 0 ${svgSize} ${svgSize}`"
      class="radar-chart__svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <!-- 填充区域渐变 -->
        <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6c3ce0" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#4fc3f7" stop-opacity="0.4" />
        </linearGradient>
        <!-- 边框渐变 -->
        <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8b5cf6" />
          <stop offset="100%" stop-color="#4fc3f7" />
        </linearGradient>
        <!-- 发光滤镜 -->
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- 网格线（同心菱形） -->
      <g class="radar-chart__grid">
        <polygon
          v-for="(level, i) in gridLevels"
          :key="'grid-' + i"
          :points="getGridPoints(level)"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          stroke-width="1"
        />
      </g>

      <!-- 轴线 -->
      <g class="radar-chart__axes">
        <line
          v-for="(axis, i) in axisEndpoints"
          :key="'axis-' + i"
          :x1="center"
          :y1="center"
          :x2="axis.x"
          :y2="axis.y"
          stroke="rgba(255,255,255,0.15)"
          stroke-width="1"
        />
      </g>

      <!-- 数据区域多边形 -->
      <polygon
        :points="dataPolygonPoints"
        fill="url(#radarFill)"
        stroke="url(#radarStroke)"
        stroke-width="2"
        filter="url(#glow)"
        class="radar-chart__data"
      />

      <!-- 数据点 -->
      <g class="radar-chart__dots">
        <circle
          v-for="(pt, i) in dataPoints"
          :key="'dot-' + i"
          :cx="pt.x"
          :cy="pt.y"
          r="4"
          fill="#fff"
          stroke="#8b5cf6"
          stroke-width="2"
        />
      </g>

      <!-- 轴标签 -->
      <g class="radar-chart__labels">
        <text
          v-for="(label, i) in labels"
          :key="'label-' + i"
          :x="label.x"
          :y="label.y"
          :text-anchor="label.anchor"
          fill="rgba(255,255,255,0.85)"
          font-size="13"
          font-weight="600"
        >
          {{ label.name }}
        </text>
        <text
          v-for="(label, i) in labels"
          :key="'pct-' + i"
          :x="label.x"
          :y="label.y + 16"
          :text-anchor="label.anchor"
          fill="#ffd700"
          font-size="12"
          font-weight="700"
        >
          {{ label.pct }}%
        </text>
      </g>
    </svg>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 四个维度的百分比值 (0-100) */
  percentages: Record<string, number>
}

const props = defineProps<Props>()

const svgSize = 300
const center = svgSize / 2
const maxRadius = 110
const gridLevels = [0.25, 0.5, 0.75, 1.0]

/**
 * 维度配置：
 * EI → 顶部（y负方向）
 * SN → 右侧（x正方向）
 * TF → 底部（y正方向）
 * JP → 左侧（x负方向）
 */
const axisConfig = [
  { key: 'EI', name: 'E/I', dx: 0, dy: -1, anchor: 'middle', labelOffset: { x: 0, y: -16 } },
  { key: 'SN', name: 'S/N', dx: 1, dy: 0, anchor: 'start', labelOffset: { x: 12, y: 5 } },
  { key: 'TF', name: 'T/F', dx: 0, dy: 1, anchor: 'middle', labelOffset: { x: 0, y: 22 } },
  { key: 'JP', name: 'J/P', dx: -1, dy: 0, anchor: 'end', labelOffset: { x: -12, y: 5 } },
]

/** 获取某比例的网格菱形顶点 */
function getGridPoints(level: number): string {
  return axisConfig
    .map((a) => {
      const x = center + a.dx * maxRadius * level
      const y = center + a.dy * maxRadius * level
      return `${x},${y}`
    })
    .join(' ')
}

/** 轴线端点 */
const axisEndpoints = computed(() =>
  axisConfig.map((a) => ({
    x: center + a.dx * maxRadius,
    y: center + a.dy * maxRadius,
  })),
)

/** 各维度对应的数据点坐标 */
const dataPoints = computed(() =>
  axisConfig.map((a) => {
    const pct = (props.percentages[a.key] ?? 50) / 100
    const r = Math.max(pct, 0.05) * maxRadius
    return {
      x: center + a.dx * r,
      y: center + a.dy * r,
    }
  }),
)

/** 数据多边形顶点字符串 */
const dataPolygonPoints = computed(() =>
  dataPoints.value.map((p) => `${p.x},${p.y}`).join(' '),
)

/** 轴标签位置和内容 */
const labels = computed(() =>
  axisConfig.map((a) => ({
    name: a.name,
    pct: props.percentages[a.key] ?? 50,
    x: center + a.dx * maxRadius + a.labelOffset.x,
    y: center + a.dy * maxRadius + a.labelOffset.y,
    anchor: a.anchor,
  })),
)
</script>

<style lang="scss" scoped>
.radar-chart {
  width: 100%;
  max-width: 500rpx;
  margin: 0 auto;

  &__svg {
    width: 100%;
    height: auto;
  }

  &__data {
    transition: all 0.8s ease;
  }

  &__dots circle {
    transition: all 0.6s ease;
  }
}
</style>
