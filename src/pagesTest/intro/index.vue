<!--
  人格星图 - 人格启程页
  序章动画 → 星座选择 → 开启旅程
-->
<template>
  <view class="page-intro" :class="{ 'page-loaded': pageLoaded }">
    <!-- 星空粒子背景 -->
    <view class="stars-layer">
      <view v-for="i in 16" :key="'s'+i" class="star" :style="starStyle(i)" />
    </view>

    <!-- 阶段一：序章动画 -->
    <PrologueAnimation
      v-if="phase === 'prologue'"
      @complete="handlePrologueComplete"
    />

    <!-- 阶段二：星座选择 -->
    <view v-if="phase === 'zodiac'" class="zodiac-phase anim-hidden" :class="{ 'anim-fade-in-up': showZodiac }">
      <ZodiacSelector
        @select="handleZodiacSelect"
        @skip="handleZodiacSkip"
      />
    </view>

    <!-- 阶段三：准备出发 -->
    <view v-if="phase === 'ready'" class="ready-phase anim-hidden" :class="{ 'anim-fade-in-up': showReady }">
      <!-- 顶部引导文案 -->
      <view class="guide-section">
        <text class="guide-icon">✦</text>
        <text class="guide-title">人格星图已为你展开</text>
        <text class="guide-desc">
          四位星灵正在星图深处等待觉醒...
          <text v-if="selectedZodiacName" class="zodiac-hint">
            你的守护星座「{{ selectedZodiacName }}」将伴你同行
          </text>
        </text>
      </view>

      <!-- 上次测试结果（回返用户） -->
      <view v-if="previousResult" class="previous-result">
        <text class="previous-result__label">上次的你</text>
        <text class="previous-result__type">{{ previousResult.typeName }}</text>
        <text v-if="previousResult.comboName" class="previous-result__combo">{{ previousResult.comboName }}</text>
        <text class="previous-result__hint">这次会一样吗？</text>
      </view>

      <!-- 开启旅程按钮 -->
      <view class="action-section">
        <text v-if="progressMessage" class="guide-desc">{{ progressMessage }}</text>
        <!-- 有效未完成档可续答；新版完成档仅恢复结果保存。 -->
        <view
          v-if="hasUnfinishedProgress || canRecoverResult"
          class="action-btn action-btn--ghost"
          @tap="handleContinueJourney"
        >
          <view class="action-btn__inner">
            <text class="action-btn__text">{{ canRecoverResult ? '恢复上次结果' : '继续上次探索' }}</text>
            <text class="action-btn__arrow">→</text>
          </view>
        </view>

        <view class="action-btn action-btn--active" @tap="handleStartJourney">
          <view class="action-btn__glow" />
          <view class="action-btn__inner">
            <text class="action-btn__text">{{ hasUnfinishedProgress ? '重新开始' : '开启人格探索' }}</text>
            <text class="action-btn__arrow">→</text>
          </view>
        </view>

        <!-- 返回提示 -->
        <view class="back-hint" @tap="handleBack">
          <text class="back-hint__text">← 返回首页</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useTestStore } from '@/stores/test'
import { useTestEngine } from '@/composables/useTestEngine'
import { zodiacMap } from '@/data/zodiac'
import PrologueAnimation from '@/components/test/PrologueAnimation.vue'
import ZodiacSelector from '@/components/test/ZodiacSelector.vue'

type Phase = 'prologue' | 'zodiac' | 'ready'

const testStore = useTestStore()
const engine = useTestEngine()
const pageLoaded = ref(false)
const phase = ref<Phase>('prologue')
const showZodiac = ref(false)
const showReady = ref(false)
const selectedZodiacName = ref('')
/** 仅有效未完成存档可续答，旧完成存档不会显示继续按钮。 */
const hasUnfinishedProgress = ref(false)
const canRecoverResult = ref(false)
const progressMessage = ref('')
let navigating = false

/** 上次测试结果（用于重测体验） */
const previousResult = ref<{
  type: string
  typeName: string
  comboName?: string
} | null>(null)

/** 检查是否有上次测试结果 */
function checkPreviousResult() {
  const store = testStore
  if (store.result) {
    const typeName = store.result.personalityType || ''
    previousResult.value = {
      type: typeName,
      typeName: typeName, // Will be enriched by personality data lookup
      comboName: store.guideCombination?.name || undefined,
    }
  } else {
    store.hydrateResultFromStorage()
    if (store.result) {
      previousResult.value = {
        type: store.result.personalityType || '',
        typeName: store.result.personalityType || '',
        comboName: store.guideCombination?.name || undefined,
      }
    }
  }
}

function refreshProgressState(): void {
  const saved = engine.inspectSavedProgress()
  hasUnfinishedProgress.value = saved.status === 'unfinished'
  canRecoverResult.value = saved.status === 'completed' && saved.version === 2
  progressMessage.value = saved.status === 'unfinished'
    ? `上次已完成 ${saved.answeredCount} / ${saved.totalQuestions} 题，可以继续或重新开始。`
    : saved.status === 'completed'
      ? '上次探索已完成，不再恢复最后一题。'
      : saved.status === 'invalid'
        ? '上次进度数据异常，已保留原记录，请确认后重新开始。'
        : ''
  if (saved.status !== 'none' && phase.value === 'prologue') {
    phase.value = 'ready'
    showReady.value = true
  }
}

onLoad(() => {
  refreshProgressState()
})
onShow(() => {
  navigating = false
  refreshProgressState()
})

onMounted(() => {
  setTimeout(() => { pageLoaded.value = true }, 100)
  // 展示上次结果时不覆盖正在进行的测试所选星座。
  const zodiac = testStore.selectedZodiac
  checkPreviousResult()
  testStore.selectedZodiac = zodiac
  selectedZodiacName.value = zodiac ? zodiacMap[zodiac]?.name ?? '' : ''
  refreshProgressState()
})

function starStyle(index: number) {
  const seed = index * 97.31
  const x = (Math.sin(seed) * 0.5 + 0.5) * 100
  const y = (Math.cos(seed * 1.7) * 0.5 + 0.5) * 100
  const size = 2 + (index % 3)
  const delay = (index * 0.4) % 5
  return {
    left: `${x}%`,
    top: `${y}%`,
    width: `${size}rpx`,
    height: `${size}rpx`,
    animationDelay: `${delay}s`,
  }
}

/** 序章动画完成 → 进入星座选择 */
function handlePrologueComplete() {
  phase.value = 'zodiac'
  setTimeout(() => { showZodiac.value = true }, 100)
}

/** 星座选择完成 → 进入准备出发 */
function handleZodiacSelect(zodiacId: string) {
  testStore.setSelectedZodiac(zodiacId)
  const z = zodiacMap[zodiacId]
  selectedZodiacName.value = z?.name ?? ''
  phase.value = 'ready'
  setTimeout(() => { showReady.value = true }, 100)
}

/** 跳过星座选择 */
function handleZodiacSkip() {
  testStore.setSelectedZodiac(null)
  selectedZodiacName.value = ''
  phase.value = 'ready'
  setTimeout(() => { showReady.value = true }, 100)
}

/** 重测明确传 fresh，由答题页开始新会话，绝不再次 loadProgress。 */
function handleStartJourney() {
  if (navigating) return
  const saved = engine.inspectSavedProgress()
  if (saved.status === 'unfinished' || saved.status === 'invalid' || canRecoverResult.value) {
    uni.showModal({
      title: '重新开始探索',
      content: '将从第一题开始，并替换本次答题进度。之前的结果与测试历史会保留。',
      confirmText: '重新开始',
      success: (res) => { if (res.confirm) navigateToPlay('fresh') },
    })
  } else {
    navigateToPlay('fresh')
  }
}

function navigateToPlay(resume: 'fresh' | 'continue'): void {
  if (navigating) return
  navigating = true
  uni.navigateTo({
    url: `/pagesTest/play/index?resume=${resume}`,
    fail: () => { navigating = false },
  })
}

/** 继续只读取有效存档；若已答完新版存档，恢复保存结果而非重答最后一题。 */
function handleContinueJourney() {
  refreshProgressState()
  if (hasUnfinishedProgress.value || canRecoverResult.value) navigateToPlay('continue')
}

/** 返回首页 */
function handleBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
/* ===== 自定义动画 ===== */
@keyframes btnPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 200%; }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* ===== 页面容器 ===== */
.page-intro {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 40rpx;
  padding-top: 80rpx;
  padding-bottom: 80rpx;
  background: linear-gradient(180deg, #0d0118 0%, #1a0533 40%, #140228 70%, #0d0118 100%);
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

/* ===== 星空粒子 ===== */
.stars-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.star {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  animation: twinkle 3s ease-in-out infinite;
}

/* ===== 通用动画类 ===== */
.anim-hidden {
  opacity: 0;
}

.anim-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 准备出发阶段 ===== */
.ready-phase {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  flex: 1;
  justify-content: center;
}

.zodiac-phase {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

/* ===== 引导文案 ===== */
.guide-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 56rpx;
}

.guide-icon {
  font-size: 48rpx;
  color: $accent-gold;
  margin-bottom: 20rpx;
  text-shadow: 0 0 20rpx rgba(255, 215, 0, 0.5);
}

.guide-title {
  font-size: $font-xxl;
  font-weight: 800;
  color: $text-primary;
  letter-spacing: 6rpx;
  margin-bottom: 16rpx;
}

.guide-desc {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.45);
  text-align: center;
  line-height: 1.8;
  max-width: 560rpx;
}

.zodiac-hint {
  display: block;
  margin-top: 12rpx;
  color: rgba(255, 215, 0, 0.6);
  font-size: $font-xs;
}

/* ===== 操作按钮 ===== */
.action-section {
  width: 100%;
  max-width: 640rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28rpx;
}

.action-btn {
  position: relative;
  width: 100%;
  height: 96rpx;
  border-radius: $radius-full;
  transition: all 0.3s ease;

  &--active:active {
    transform: scale(0.97);
  }

  &--ghost {
    height: 80rpx;
    background: rgba(255, 255, 255, 0.05);
    border: 1.5rpx solid rgba(255, 215, 0, 0.35);
    margin-bottom: $spacing-sm;

    .action-btn__inner {
      background: transparent;
      border: none;
    }

    .action-btn__text {
      color: $accent-gold;
      font-weight: 600;
    }

    .action-btn__arrow {
      color: $accent-gold;
    }

    &:active {
      background: rgba(255, 215, 0, 0.08);
      transform: scale(0.97);
    }
  }
}

.action-btn__glow {
  position: absolute;
  inset: -4rpx;
  border-radius: $radius-full;
  background: linear-gradient(135deg, #ffd700, #ffb300, #c7a600);
  filter: blur(8rpx);
  opacity: 0.5;
  animation: btnPulse 2s ease-in-out infinite;
}

.action-btn__inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: $radius-full;
  background: linear-gradient(135deg, #ffd700, #ffb300, #c7a600);
  border: 1.5rpx solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
    animation: shimmer 3s ease-in-out infinite;
  }
}

.action-btn__text {
  font-size: $font-lg;
  font-weight: 700;
  color: #1a0533;
  letter-spacing: 4rpx;
}

.action-btn__arrow {
  font-size: $font-lg;
  color: #1a0533;
  font-weight: 700;
}

/* ===== 返回提示 ===== */
.back-hint {
  padding: 12rpx 24rpx;

  &__text {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.3);
    letter-spacing: 2rpx;
    transition: color 0.2s ease;
  }

  &:active &__text {
    color: rgba(255, 255, 255, 0.6);
  }
}

/* ===== 上次测试结果（重测体验） ===== */
.previous-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 32rpx 40rpx;
  margin-bottom: 48rpx;
  border-radius: $radius-lg;
  background: rgba(108, 60, 224, 0.12);
  border: 1rpx solid rgba(255, 215, 0, 0.15);
  backdrop-filter: blur(8rpx);

  &__label {
    font-size: $font-xs;
    color: rgba(255, 255, 255, 0.4);
    letter-spacing: 4rpx;
  }

  &__type {
    font-size: $font-xl;
    font-weight: 700;
    color: $accent-gold;
    letter-spacing: 6rpx;
    text-shadow: 0 0 16rpx rgba(255, 215, 0, 0.3);
  }

  &__combo {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.55);
    letter-spacing: 2rpx;
  }

  &__hint {
    font-size: $font-xs;
    color: rgba(255, 255, 255, 0.3);
    font-style: italic;
    margin-top: 8rpx;
  }
}
</style>
