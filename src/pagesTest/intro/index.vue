<!--
  灵魂星图 - 灵魂启程页
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
        <text class="guide-title">灵魂星图已为你展开</text>
        <text class="guide-desc">
          四位星灵正在星图深处等待觉醒...
          <text v-if="selectedZodiacName" class="zodiac-hint">
            你的守护星座「{{ selectedZodiacName }}」将伴你同行
          </text>
        </text>
      </view>

      <!-- 开启旅程按钮 -->
      <view class="action-section">
        <view class="action-btn action-btn--active" @tap="handleStartJourney">
          <view class="action-btn__glow" />
          <view class="action-btn__inner">
            <text class="action-btn__text">开启灵魂探索</text>
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
import { onLoad } from '@dcloudio/uni-app'
import { useTestStore } from '@/stores/test'
import { zodiacMap } from '@/data/zodiac'
import PrologueAnimation from '@/components/test/PrologueAnimation.vue'
import ZodiacSelector from '@/components/test/ZodiacSelector.vue'

type Phase = 'prologue' | 'zodiac' | 'ready'

const testStore = useTestStore()
const pageLoaded = ref(false)
const phase = ref<Phase>('prologue')
const showZodiac = ref(false)
const showReady = ref(false)
const selectedZodiacName = ref('')

onLoad(() => {
  console.log('[Page] 灵魂启程页加载')
})

onMounted(() => {
  setTimeout(() => { pageLoaded.value = true }, 100)
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

/** 开启旅程 */
function handleStartJourney() {
  uni.navigateTo({ url: '/pagesTest/play/index' })
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
</style>
