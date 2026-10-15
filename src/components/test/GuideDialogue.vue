<template>
  <view v-if="visible" class="guide-dialogue-overlay" @tap.self="noop">
    <view class="dialogue-card" :class="{ 'card-enter': visible, 'card-exit': exiting }">
      <view class="guide-header">
        <text class="guide-emoji" :style="{ textShadow: `0 0 12px ${guideColor}` }">
          {{ guideInfo?.emoji || '✨' }}
        </text>
        <text class="guide-name" :style="{ color: guideColor }">
          {{ guideInfo?.name || '引导者' }}
        </text>
      </view>

      <view class="prompt-area">
        <text class="prompt-text">{{ displayedText }}</text>
        <text v-if="typing" class="cursor">|</text>
      </view>

      <view v-if="!typing && dialogue?.options" class="options-area">
        <view
          v-for="(option, index) in dialogue.options"
          :key="index"
          class="option-btn"
          :class="{
            'option-selected': selectedIndex === index,
            'option-glow': selectedIndex === index && glowing
          }"
          :style="{
            borderColor: selectedIndex === index ? guideColor : `${guideColor}4D`,
            boxShadow: selectedIndex === index && glowing ? `0 0 16px ${guideColor}80` : 'none'
          }"
          @tap="handleSelect(index)"
        >
          <text class="option-text">{{ option.text }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { guideMap } from '@/data/guides'
import type { GuideDialogueData } from '@/types/guide'

const props = defineProps<{
  dialogue: GuideDialogueData | null
  visible: boolean
  guideId: string
}>()

const emit = defineEmits<{
  (e: 'select', payload: { optionIndex: number }): void
  (e: 'complete'): void
}>()

const guideInfo = computed(() => guideMap[props.guideId])
const guideColor = computed(() => guideInfo.value?.color || '#ffffff')

const displayedText = ref('')
const typing = ref(false)
const exiting = ref(false)
const selectedIndex = ref<number | null>(null)
const glowing = ref(false)

let typewriterTimer: ReturnType<typeof setInterval> | null = null

function startTypewriter(text: string) {
  displayedText.value = ''
  typing.value = true
  let i = 0
  typewriterTimer = setInterval(() => {
    if (i < text.length) {
      displayedText.value += text[i]
      i++
    } else {
      clearInterval(typewriterTimer!)
      typewriterTimer = null
      typing.value = false
    }
  }, 25)
}

function handleSelect(index: number) {
  if (selectedIndex.value !== null || typing.value) return
  selectedIndex.value = index
  glowing.value = true
  emit('select', { optionIndex: index })

  setTimeout(() => {
    glowing.value = false
    exiting.value = true
    setTimeout(() => {
      exiting.value = false
      selectedIndex.value = null
      emit('complete')
    }, 400)
  }, 600)
}

function noop() {}

watch(
  () => [props.visible, props.dialogue],
  ([vis, dlg]) => {
    if (vis && dlg?.prompt) {
      exiting.value = false
      selectedIndex.value = null
      startTypewriter(dlg.prompt)
    }
  },
  { immediate: true }
)

watch(
  () => props.visible,
  (val) => {
    if (!val && typewriterTimer) {
      clearInterval(typewriterTimer)
      typewriterTimer = null
    }
  }
)
</script>

<style lang="scss" scoped>
.guide-dialogue-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialogue-card {
  width: 600rpx;
  max-width: 600rpx;
  background: rgba(24, 24, 32, 0.95);
  border-radius: 24rpx;
  padding: 48rpx 36rpx 36rpx;
  transform: translateY(100%);
  opacity: 0;
  transition: transform 0.4s ease-out, opacity 0.4s ease-out;

  &.card-enter {
    transform: translateY(0);
    opacity: 1;
  }

  &.card-exit {
    opacity: 0;
    transform: translateY(40rpx);
    transition: transform 0.4s ease-in, opacity 0.4s ease-in;
  }
}

.guide-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.guide-emoji {
  font-size: 60rpx;
}

.guide-name {
  font-size: 18px;
  font-weight: 600;
}

.prompt-area {
  margin-bottom: 36rpx;
  min-height: 80rpx;
}

.prompt-text {
  font-size: 16px;
  color: rgba(255, 248, 240, 0.92);
  line-height: 1.6;
}

.cursor {
  font-size: 16px;
  color: rgba(255, 248, 240, 0.6);
  animation: blink 0.6s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

.options-area {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.option-btn {
  width: 100%;
  padding: 20rpx 28rpx;
  border-radius: 48rpx;
  border: 1rpx solid;
  background: rgba(255, 255, 255, 0.06);
  transition: all 0.25s ease;

  &:active {
    background: rgba(255, 255, 255, 0.12);
    transform: scale(0.97);
  }

  &.option-selected {
    background: rgba(255, 255, 255, 0.1);
  }

  &.option-glow {
    animation: glow-pulse 0.6s ease-out;
  }
}

@keyframes glow-pulse {
  0% { transform: scale(1); }
  40% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

.option-text {
  font-size: 15px;
  color: rgba(255, 248, 240, 0.85);
  text-align: center;
  display: block;
}
</style>
