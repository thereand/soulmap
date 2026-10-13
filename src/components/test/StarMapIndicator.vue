<template>
  <view class="starmap-indicator" :class="{ compact: compact }">
    <view class="star-container">
      <!-- Connecting lines -->
      <view class="connect-line line-vertical" />
      <view class="connect-line line-horizontal" />

      <!-- Flame - top -->
      <view
        class="star-slot slot-top"
        :style="getStarStyle('flame')"
      >
        <text class="star-emoji" :class="{ dominant: isDominant('flame') }">🔥</text>
      </view>

      <!-- Abyss - right -->
      <view
        class="star-slot slot-right"
        :style="getStarStyle('abyss')"
      >
        <text class="star-emoji" :class="{ dominant: isDominant('abyss') }">💧</text>
      </view>

      <!-- Forest - bottom -->
      <view
        class="star-slot slot-bottom"
        :style="getStarStyle('forest')"
      >
        <text class="star-emoji" :class="{ dominant: isDominant('forest') }">🌿</text>
      </view>

      <!-- Star - left -->
      <view
        class="star-slot slot-left"
        :style="getStarStyle('star')"
      >
        <text class="star-emoji" :class="{ dominant: isDominant('star') }">⚡</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { guideMap } from '@/data/guides'
import type { GuideAffinityScores } from '@/types/guide'

const props = withDefaults(defineProps<{
  scores: GuideAffinityScores
  compact?: boolean
}>(), {
  compact: false
})

const maxScore = 25

const guideKeys = ['flame', 'abyss', 'forest', 'star'] as const

const dominantGuide = computed(() => {
  let max = 0
  let dom = ''
  for (const key of guideKeys) {
    const val = (props.scores as any)[key] ?? 0
    if (val > max) {
      max = val
      dom = key
    }
  }
  return dom
})

function isDominant(guideId: string) {
  return dominantGuide.value === guideId && ((props.scores as any)[guideId] ?? 0) > 0
}

function getStarStyle(guideId: string) {
  const score = (props.scores as any)[guideId] ?? 0
  const normalized = Math.min(Math.max(score / maxScore, 0), 1)
  const opacity = 0.2 + normalized * 0.8
  const clamped = Math.min(Math.max(opacity, 0.2), 1.0)
  const color = guideMap[guideId]?.color || '#ffffff'
  const glow = clamped > 0.6 ? `0 0 ${Math.round(clamped * 12)}px ${color}` : 'none'

  return {
    opacity: clamped,
    filter: `drop-shadow(${glow === 'none' ? '0 0 0 transparent' : glow})`
  }
}
</script>

<style lang="scss" scoped>
.starmap-indicator {
  width: 120rpx;
  height: 120rpx;

  &.compact {
    width: 80rpx;
    height: 80rpx;
  }
}

.star-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(16, 16, 24, 0.6);
  border-radius: 50%;
}

.connect-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.08);
}

.line-vertical {
  width: 1rpx;
  height: 60%;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
}

.line-horizontal {
  width: 60%;
  height: 1rpx;
  left: 20%;
  top: 50%;
  transform: translateY(-50%);
}

.star-slot {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.5s ease, filter 0.5s ease;
}

.slot-top {
  top: 8%;
  left: 50%;
  transform: translateX(-50%);
}

.slot-right {
  right: 8%;
  top: 50%;
  transform: translateY(-50%);
}

.slot-bottom {
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
}

.slot-left {
  left: 8%;
  top: 50%;
  transform: translateY(-50%);
}

.star-emoji {
  font-size: 16rpx;
  line-height: 1;

  .compact & {
    font-size: 12rpx;
  }

  &.dominant {
    animation: star-pulse 2s ease-in-out infinite;
    transform: scale(1.2);
  }
}

@keyframes star-pulse {
  0%, 100% { transform: scale(1.2); }
  50% { transform: scale(1.35); }
}
</style>
