<!--
  人格星图 - 向导小剧场（彩蛋动画）
  当用户连续 3 个选项强烈共鸣同一位星灵时触发，
  星灵会以俏皮话短暂现身，全程 ~3s，不阻断答题流程。
-->
<template>
  <view
    v-if="visible"
    class="mini-theater"
    :style="{ '--guide-color': guide.color }"
  >
    <!-- 半透明遮罩 -->
    <view class="theater-overlay" :class="{ 'theater-overlay--show': animating }" />

    <!-- 舞台中央 -->
    <view class="theater-stage" :class="{ 'theater-stage--show': animating }">
      <!-- 星灵 emoji + 光晕 -->
      <view class="guide-spotlight">
        <view
          class="guide-glow"
          :style="{ background: `radial-gradient(circle 150rpx, ${guide.color}66 0%, transparent 70%)` }"
        />
        <text class="guide-emoji" :class="{ 'guide-emoji--bounce': animating }">
          {{ guide.emoji }}
        </text>
      </view>

      <!-- 打字机台词 -->
      <text class="guide-quip">{{ displayedText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import { guideMap } from '@/data/guides'
import type { GuideId } from '@/types/guide'

interface Props {
  /** 触发小剧场的向导 ID */
  guideId: string
  /** 控制可见性 */
  visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  guideId: 'flame',
  visible: false,
})

const emit = defineEmits<{
  (e: 'complete'): void
}>()

/* ===== 星灵俏皮话 ===== */
const quipMap: Record<GuideId, string> = {
  flame: '哈哈，我就知道你会这样选！咱俩真像。',
  abyss: '你的思维...像一条没有尽头的走廊。我很喜欢。',
  forest: '你的温柔，连星图都感受到了呢。',
  star: '哇哦！你的选择总是让我惊喜！',
}

/* ===== 状态 ===== */
const animating = ref(false)
const displayedText = ref('')
let typewriterTimer: ReturnType<typeof setInterval> | null = null
let completeTimer: ReturnType<typeof setTimeout> | null = null

/* ===== 计算属性 ===== */
const guide = computed(() => guideMap[props.guideId as GuideId] ?? guideMap.flame)
const quip = computed(() => quipMap[props.guideId as GuideId] ?? quipMap.flame)

/* ===== 打字机效果 ===== */
function startTypewriter(text: string, onDone: () => void) {
  let charIndex = 0
  displayedText.value = ''

  typewriterTimer = setInterval(() => {
    if (charIndex < text.length) {
      displayedText.value += text[charIndex]
      charIndex++
    } else {
      clearTypewriterTimer()
      onDone()
    }
  }, 30) // 30ms/char
}

function clearTypewriterTimer() {
  if (typewriterTimer) {
    clearInterval(typewriterTimer)
    typewriterTimer = null
  }
}

function clearCompleteTimer() {
  if (completeTimer) {
    clearTimeout(completeTimer)
    completeTimer = null
  }
}

/* ===== 播放动画序列 ===== */
function playSequence() {
  animating.value = true
  displayedText.value = ''

  // 等 emoji 弹跳完成后开始打字
  setTimeout(() => {
    startTypewriter(quip.value, () => {
      // 打字完成后停留 1s
      completeTimer = setTimeout(() => {
        animating.value = false
        // 淡出动画 0.4s 后触发完成
        completeTimer = setTimeout(() => {
          emit('complete')
        }, 400)
      }, 1000)
    })
  }, 400) // 等待 emoji bounce 完成 (0.4s)
}

/* ===== 监听可见性变化 ===== */
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      playSequence()
    } else {
      // 被外部强制隐藏时，清理并通知完成
      cleanup()
      emit('complete')
    }
  },
)

function cleanup() {
  clearTypewriterTimer()
  clearCompleteTimer()
  animating.value = false
  displayedText.value = ''
}

onBeforeUnmount(() => {
  cleanup()
})
</script>

<style lang="scss" scoped>
/* ===== 容器：全屏覆盖但不阻挡交互 ===== */
.mini-theater {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 900;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ===== 遮罩层 ===== */
.theater-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  opacity: 0;
  transition: opacity 0.35s ease;

  &--show {
    opacity: 1;
  }
}

/* ===== 舞台 ===== */
.theater-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36rpx;
  opacity: 0;
  transition: opacity 0.35s ease;

  &--show {
    opacity: 1;
  }
}

/* ===== 星灵聚光灯 ===== */
.guide-spotlight {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.guide-glow {
  position: absolute;
  width: 300rpx;
  height: 300rpx;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  pointer-events: none;
}

.guide-emoji {
  font-size: 80rpx;
  line-height: 1;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 0 20rpx var(--guide-color));

  &--bounce {
    animation: emojiBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
}

@keyframes emojiBounce {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  60% {
    transform: scale(1.2);
    opacity: 1;
  }
  80% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* ===== 俏皮话文字 ===== */
.guide-quip {
  font-size: 32rpx;
  color: #ffffff;
  text-align: center;
  max-width: 520rpx;
  line-height: 1.7;
  letter-spacing: 2rpx;
  text-shadow: 0 0 16rpx var(--guide-color);
  font-family: "STKaiti", "KaiTi", "楷体", serif;
}
</style>
