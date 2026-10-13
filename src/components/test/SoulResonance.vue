<template>
  <view v-if="visible" class="soul-resonance-overlay" :class="{ active: active }">
    <view class="edge-glow" :style="{ '--guide-color': guideColor }" />

    <view class="center-content">
      <text class="resonance-emoji" :style="{ color: guideColor }">
        {{ guideInfo?.emoji || '✨' }}
      </text>
      <text class="resonance-text" :style="{ color: guideColor }">
        {{ guideInfo?.name || '引导者' }}与你产生了共鸣...
      </text>
    </view>

    <view class="particles-container">
      <view
        v-for="i in particleCount"
        :key="i"
        class="particle"
        :style="{
          '--angle': `${(i - 1) * (360 / particleCount)}deg`,
          '--guide-color': guideColor,
          animationDelay: `${i * 50}ms`
        }"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import { guideMap } from '@/data/guides'

const props = defineProps<{
  guideId: string
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'complete'): void
}>()

const guideInfo = computed(() => guideMap[props.guideId])
const guideColor = computed(() => guideInfo.value?.color || '#ffffff')

const active = ref(false)
const particleCount = 10

let completeTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.visible,
  (val) => {
    if (val) {
      active.value = true
      completeTimer = setTimeout(() => {
        active.value = false
        emit('complete')
      }, 2000)
    } else {
      active.value = false
      if (completeTimer) {
        clearTimeout(completeTimer)
        completeTimer = null
      }
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (completeTimer) clearTimeout(completeTimer)
})
</script>

<style lang="scss" scoped>
.soul-resonance-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 999;
  overflow: hidden;

  &.active {
    pointer-events: auto;
  }
}

.edge-glow {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 80rpx 20rpx var(--guide-color);
  opacity: 0;
  animation: edge-pulse 2s ease-in-out forwards;
}

@keyframes edge-pulse {
  0% { opacity: 0; }
  25% { opacity: 0.5; }
  75% { opacity: 0.5; }
  100% { opacity: 0; }
}

.center-content {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
}

.resonance-emoji {
  font-size: 48rpx;
  opacity: 0;
  animation: emoji-float 2s ease-out forwards;
}

@keyframes emoji-float {
  0% { opacity: 0; transform: translateY(0); }
  15% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-100rpx); }
}

.resonance-text {
  font-size: 14px;
  opacity: 0;
  animation: text-fade 2s ease-in-out forwards;
}

@keyframes text-fade {
  0% { opacity: 0; }
  15% { opacity: 0; }
  30% { opacity: 1; }
  75% { opacity: 1; }
  100% { opacity: 0; }
}

.particles-container {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
}

.particle {
  position: absolute;
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
  background: var(--guide-color);
  opacity: 0;
  animation: particle-burst 1.5s ease-out forwards;
}

@keyframes particle-burst {
  0% {
    opacity: 0;
    transform: rotate(var(--angle)) translateX(0);
  }
  20% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
    transform: rotate(var(--angle)) translateX(180rpx);
  }
}
</style>
