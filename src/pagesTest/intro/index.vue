<!--
  灵魂星图 - 灵魂向导选择页
  选择你的灵魂向导，开启灵魂探索旅程
-->
<template>
  <view class="page-intro" :class="{ 'page-loaded': pageLoaded }">
    <!-- 星空粒子背景 -->
    <view class="stars-layer">
      <view v-for="i in 16" :key="'s'+i" class="star" :style="starStyle(i)" />
    </view>

    <!-- 顶部引导文案 -->
    <view class="guide-section anim-hidden" :class="{ 'anim-fade-in-down': pageLoaded }">
      <text class="guide-icon">✦</text>
      <text class="guide-title">选择你的灵魂向导</text>
      <text class="guide-desc">每位探索者都有一位灵魂向导相伴，选择与你灵魂共鸣的那一位...</text>
    </view>

    <!-- 四个灵魂向导卡片 -->
    <view class="guides-grid anim-hidden" :class="{ 'anim-fade-in-up': pageLoaded }" style="animation-delay: 0.2s">
      <view
        v-for="guide in guides"
        :key="guide.id"
        class="guide-card"
        :class="{ 'guide-card--selected': selectedId === guide.id }"
        :style="guideCardStyle(guide)"
        @tap="selectGuide(guide.id)"
      >
        <!-- 选中发光边框 -->
        <view v-if="selectedId === guide.id" class="guide-card__glow" :style="glowStyle(guide)" />

        <!-- 星灵形象圆 -->
        <view class="guide-card__avatar" :style="avatarStyle(guide)">
          <view class="guide-card__avatar-bg" :style="avatarBgStyle(guide)" />
          <text class="guide-card__emoji">{{ guide.emoji }}</text>
          <!-- 选中光环 -->
          <view v-if="selectedId === guide.id" class="guide-card__ring" :style="ringStyle(guide)" />
        </view>

        <!-- 名称 -->
        <text class="guide-card__name" :style="selectedId === guide.id ? { color: guide.color } : {}">
          {{ guide.name }}
        </text>

        <!-- 特质标签 -->
        <text class="guide-card__trait">{{ guide.trait }}</text>

        <!-- 选中标记 -->
        <view v-if="selectedId === guide.id" class="guide-card__check" :style="{ background: guide.color }">
          <text class="guide-card__check-icon">✓</text>
        </view>
      </view>
    </view>

    <!-- 底部描述区域 -->
    <view class="desc-section anim-hidden" :class="{ 'anim-fade-in-up': pageLoaded }" style="animation-delay: 0.35s">
      <view v-if="selectedGuide" class="selected-info">
        <text class="selected-info__text">{{ selectedGuide.desc }}</text>
      </view>
      <view v-else class="hint-info">
        <text class="hint-info__text">轻触选择与你共鸣的灵魂向导</text>
      </view>
    </view>

    <!-- 开启旅程按钮 -->
    <view class="action-section anim-hidden" :class="{ 'anim-fade-in-up': pageLoaded }" style="animation-delay: 0.5s">
      <view
        class="action-btn"
        :class="{ 'action-btn--active': selectedId, 'action-btn--disabled': !selectedId }"
        @tap="handleStartJourney"
      >
        <view v-if="selectedId" class="action-btn__glow" :style="btnGlowStyle" />
        <view class="action-btn__inner" :style="selectedId ? btnInnerStyle : {}">
          <text class="action-btn__text" :style="selectedId ? { color: '#1a0533' } : {}">
            {{ selectedId ? '开启旅程' : '请先选择灵魂向导' }}
          </text>
          <text v-if="selectedId" class="action-btn__arrow">→</text>
        </view>
      </view>

      <!-- 返回提示 -->
      <view class="back-hint" @tap="handleBack">
        <text class="back-hint__text">← 返回首页</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useTestStore } from '@/stores/test'

interface SoulGuide {
  id: string
  name: string
  emoji: string
  trait: string
  desc: string
  color: string
  colorLight: string
  gradient: string
}

const testStore = useTestStore()
const pageLoaded = ref(false)
const selectedId = ref<string | null>(null)

const guides: SoulGuide[] = [
  {
    id: 'flame',
    name: '烈焰之灵',
    emoji: '🔥',
    trait: '热情 · 勇敢 · 行动力',
    desc: '烈焰之灵将点燃你内心的火焰，帮助你发现隐藏在热情背后的真正力量。',
    color: '#ff6b35',
    colorLight: '#ff9a6c',
    gradient: 'linear-gradient(135deg, #ff6b35, #ff4500, #cc3700)',
  },
  {
    id: 'abyss',
    name: '深渊之灵',
    emoji: '💧',
    trait: '深邃 · 智慧 · 洞察力',
    desc: '深渊之灵将带你潜入意识的深海，探索那些被遗忘的记忆与深层智慧。',
    color: '#7c5ce0',
    colorLight: '#a78bfa',
    gradient: 'linear-gradient(135deg, #7c5ce0, #5b3cc4, #3b1f8e)',
  },
  {
    id: 'forest',
    name: '森林之灵',
    emoji: '🌿',
    trait: '治愈 · 成长 · 生命力',
    desc: '森林之灵将引领你走进内心的绿洲，在自然的韵律中找到生命的答案。',
    color: '#4caf50',
    colorLight: '#81c784',
    gradient: 'linear-gradient(135deg, #4caf50, #2e7d32, #1b5e20)',
  },
  {
    id: 'star',
    name: '星光之灵',
    emoji: '⚡',
    trait: '闪耀 · 灵感 · 创造力',
    desc: '星光之灵将为你点亮灵感之星，让你在星光中发现独一无二的创造力。',
    color: '#ffd700',
    colorLight: '#ffe44d',
    gradient: 'linear-gradient(135deg, #ffd700, #ffb300, #c7a600)',
  },
]

const selectedGuide = computed(() => guides.find(g => g.id === selectedId.value) ?? null)

const btnGlowStyle = computed(() => {
  const g = selectedGuide.value
  if (!g) return {}
  return { background: g.gradient, opacity: 0.5 }
})

const btnInnerStyle = computed(() => {
  const g = selectedGuide.value
  if (!g) return {}
  return { background: g.gradient }
})

onLoad(() => {
  console.log('[Page] 灵魂向导选择页加载')
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

function guideCardStyle(_guide: SoulGuide) {
  return {}
}

function glowStyle(guide: SoulGuide) {
  return {
    boxShadow: `0 0 30rpx ${guide.color}40, 0 0 60rpx ${guide.color}20`,
    borderColor: guide.color,
  }
}

function avatarStyle(_guide: SoulGuide) {
  return {}
}

function avatarBgStyle(guide: SoulGuide) {
  return { background: guide.gradient }
}

function ringStyle(guide: SoulGuide) {
  return { borderColor: guide.color, boxShadow: `0 0 16rpx ${guide.color}60` }
}

function selectGuide(id: string) {
  selectedId.value = id
  testStore.selectedGuide = id
}

function handleStartJourney() {
  if (!selectedId.value) return
  uni.navigateTo({ url: '/pagesTest/play/index' })
}

function handleBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
/* ===== 自定义动画 ===== */
@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(30rpx) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes selectedPulse {
  0%, 100% {
    box-shadow: 0 0 20rpx var(--glow-color, rgba(255, 215, 0, 0.3));
  }
  50% {
    box-shadow: 0 0 40rpx var(--glow-color, rgba(255, 215, 0, 0.5));
  }
}

@keyframes ringRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes floatEmoji {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-6rpx) scale(1.05); }
}

@keyframes btnPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
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

/* ===== 引导文案 ===== */
.guide-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 56rpx;
  position: relative;
  z-index: 1;
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

/* ===== 灵魂向导卡片网格 ===== */
.guides-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  width: 100%;
  max-width: 640rpx;
  margin-bottom: 40rpx;
  position: relative;
  z-index: 1;
}

.guide-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 36rpx 20rpx 28rpx;
  border-radius: 24rpx;
  background: rgba(108, 60, 224, 0.06);
  border: 1.5rpx solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;

  &--selected {
    background: rgba(108, 60, 224, 0.12);
    border-color: transparent;
    transform: scale(1.03);
  }

  &:active {
    transform: scale(0.97);
  }
}

.guide-card__glow {
  position: absolute;
  inset: -2rpx;
  border-radius: 26rpx;
  border: 2rpx solid;
  pointer-events: none;
  animation: selectedPulse 2s ease-in-out infinite;
}

/* ===== 星灵形象圆 ===== */
.guide-card__avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.guide-card__avatar-bg {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  opacity: 0.15;
  transition: opacity 0.3s ease;

  .guide-card--selected & {
    opacity: 0.3;
  }
}

.guide-card__emoji {
  font-size: 52rpx;
  position: relative;
  z-index: 1;
  animation: floatEmoji 3s ease-in-out infinite;

  .guide-card--selected & {
    animation-duration: 2s;
  }
}

.guide-card__ring {
  position: absolute;
  inset: -6rpx;
  border-radius: 50%;
  border: 2rpx solid;
  border-style: dashed;
  animation: ringRotate 8s linear infinite;
}

/* ===== 卡片文字 ===== */
.guide-card__name {
  font-size: $font-md;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 2rpx;
  margin-bottom: 6rpx;
  transition: color 0.3s ease;
}

.guide-card__trait {
  font-size: $font-xs;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 1rpx;
}

.guide-card__check {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.guide-card__check-icon {
  font-size: 20rpx;
  color: #fff;
  font-weight: 700;
}

/* ===== 底部描述区域 ===== */
.desc-section {
  width: 100%;
  max-width: 640rpx;
  min-height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
  position: relative;
  z-index: 1;
}

.selected-info {
  text-align: center;
  padding: 20rpx 32rpx;
  border-radius: 16rpx;
  background: rgba(108, 60, 224, 0.08);
  border: 1rpx solid rgba(108, 60, 224, 0.15);

  &__text {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.8;
  }
}

.hint-info {
  &__text {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.25);
    letter-spacing: 2rpx;
  }
}

/* ===== 操作按钮 ===== */
.action-section {
  width: 100%;
  max-width: 640rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28rpx;
  position: relative;
  z-index: 1;
}

.action-btn {
  position: relative;
  width: 100%;
  height: 96rpx;
  border-radius: $radius-full;
  transition: all 0.3s ease;

  &--disabled {
    opacity: 0.5;
  }

  &--active:active {
    transform: scale(0.97);
  }
}

.action-btn__glow {
  position: absolute;
  inset: -4rpx;
  border-radius: $radius-full;
  filter: blur(8rpx);
  animation: btnPulse 2s ease-in-out infinite;
}

.action-btn__inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: $radius-full;
  background: rgba(108, 60, 224, 0.2);
  border: 1.5rpx solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  overflow: hidden;
  transition: all 0.35s ease;

  .action-btn--active & {
    border-color: transparent;
  }

  .action-btn--active &::before {
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
  color: $text-secondary;
  letter-spacing: 4rpx;
  transition: color 0.3s ease;

  .action-btn--active & {
    color: $text-primary;
  }
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
