<!--
  人格星图 - 星灵图鉴页
  收集展示所有星灵卡片，包含 MBTI 类型卡和星灵组合卡。
  支持解锁状态展示、稀有度视觉区分、下拉刷新。
-->
<template>
  <view class="page-atlas">
    <!-- 星空背景装饰 -->
    <view class="atlas-bg">
      <view
        v-for="n in 20"
        :key="'star-' + n"
        class="atlas-bg__star"
        :class="`atlas-bg__star--${n}`"
      />
    </view>

    <!-- 顶部导航栏 -->
    <view class="atlas-nav">
      <view class="atlas-nav__back" @tap="goBack">
        <text class="atlas-nav__back-icon">&lt;</text>
      </view>
      <text class="atlas-nav__title">星灵图鉴</text>
      <view class="atlas-nav__placeholder" />
    </view>

    <!-- 收集进度 -->
    <view class="atlas-progress">
      <view class="atlas-progress__info">
        <text class="atlas-progress__label">已收集</text>
        <text class="atlas-progress__count">{{ unlockedCount }}/{{ totalCards }}</text>
      </view>
      <view class="atlas-progress__bar-bg">
        <view
          class="atlas-progress__bar-fill"
          :style="{ width: completionRate + '%' }"
        />
      </view>
      <text class="atlas-progress__rate">{{ completionRate }}%</text>
    </view>

    <!-- Tab 切换器 -->
    <view class="atlas-tabs">
      <view
        class="atlas-tabs__item"
        :class="{ 'atlas-tabs__item--active': activeTab === 'mbti' }"
        @tap="activeTab = 'mbti'"
      >
        <text class="atlas-tabs__text">MBTI 星灵</text>
        <text class="atlas-tabs__count">{{ mbtiUnlockedCount }}/16</text>
      </view>
      <view
        class="atlas-tabs__item"
        :class="{ 'atlas-tabs__item--active': activeTab === 'combo' }"
        @tap="activeTab = 'combo'"
      >
        <text class="atlas-tabs__text">星灵组合</text>
        <text class="atlas-tabs__count">{{ comboUnlockedCount }}/3</text>
      </view>
    </view>

    <!-- 卡片网格 -->
    <scroll-view
      class="atlas-grid-scroll"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onPullRefresh"
    >
      <view class="atlas-grid">
        <view
          v-for="card in filteredCards"
          :key="card.id"
          class="atlas-card"
          :class="[
            `atlas-card--${card.rarity.toLowerCase()}`,
            { 'atlas-card--locked': !isUnlocked(card.id) },
          ]"
          @tap="onCardTap(card)"
        >
          <!-- 卡片内容（已解锁） -->
          <template v-if="isUnlocked(card.id)">
            <!-- 稀有度标签 -->
            <view class="atlas-card__rarity" :class="`atlas-card__rarity--${card.rarity.toLowerCase()}`">
              <text class="atlas-card__rarity-text">{{ card.rarity }}</text>
            </view>

            <!-- 星灵图标区域 -->
            <view class="atlas-card__icon">
              <text class="atlas-card__icon-emoji">{{ getCardEmoji(card) }}</text>
            </view>

            <!-- 星灵名称 -->
            <text class="atlas-card__name">{{ card.name }}</text>

            <!-- 卡片类型标签 -->
            <text class="atlas-card__type-label">
              {{ card.type === 'mbti' ? card.mbtiType : '组合' }}
            </text>

            <!-- 描述文字 -->
            <text class="atlas-card__desc">{{ card.description }}</text>

            <!-- SSR 闪光层 -->
            <view v-if="card.rarity === 'SSR'" class="atlas-card__shimmer" />
          </template>

          <!-- 卡片内容（未解锁） -->
          <template v-else>
            <view class="atlas-card__locked-icon">
              <text class="atlas-card__locked-emoji">?</text>
            </view>
            <text class="atlas-card__locked-label">未解锁</text>
            <text v-if="tappedCardId === card.id" class="atlas-card__unlock-hint">
              {{ card.unlockCondition }}
            </text>
          </template>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { atlasCards, type AtlasCard } from '@/data/atlas'
import { useAtlas } from '@/composables/useAtlas'

/* ===== 状态 ===== */

const {
  unlockedCards,
  totalCards,
  unlockedCount,
  completionRate,
  isUnlocked,
  loadUnlocked,
} = useAtlas()

/** 当前 Tab */
const activeTab = ref<'mbti' | 'combo'>('mbti')

/** 点击选中的卡片 ID（用于展示解锁条件） */
const tappedCardId = ref<string | null>(null)

/** 下拉刷新状态 */
const isRefreshing = ref(false)

/* ===== 计算属性 ===== */

/** 按 Tab 过滤的卡片列表 */
const filteredCards = computed(() => {
  if (activeTab.value === 'mbti') {
    return atlasCards.filter((c) => c.type === 'mbti')
  }
  return atlasCards.filter((c) => c.type === 'guide_combo')
})

/** MBTI 类型卡已解锁数量 */
const mbtiUnlockedCount = computed(() =>
  atlasCards.filter((c) => c.type === 'mbti' && unlockedCards.value.includes(c.id)).length,
)

/** 组合卡已解锁数量 */
const comboUnlockedCount = computed(() =>
  atlasCards.filter((c) => c.type === 'guide_combo' && unlockedCards.value.includes(c.id)).length,
)

/* ===== 方法 ===== */

/** MBTI 类型对应 emoji */
const mbtiEmojiMap: Record<string, string> = {
  INTJ: '🧠', INTP: '🔮', ENTJ: '⚔️', ENTP: '🎭',
  INFJ: '👁️', INFP: '🌙', ENFJ: '🌅', ENFP: '🌈',
  ISTJ: '🛡️', ISFJ: '☀️', ESTJ: '⚡', ESFJ: '💫',
  ISTP: '🔧', ISFP: '🌸', ESTP: '🔥', ESFP: '💃',
}

/** 组合卡 emoji */
const comboEmojiMap: Record<string, string> = {
  combo_quad: '🌟',
  combo_triple: '🔱',
  combo_dual: '⚡',
}

/** 获取卡片展示 emoji */
function getCardEmoji(card: AtlasCard): string {
  if (card.type === 'mbti' && card.mbtiType) {
    return mbtiEmojiMap[card.mbtiType] || '✨'
  }
  return comboEmojiMap[card.id] || '✨'
}

/** 点击卡片：未解锁时展示解锁条件 */
function onCardTap(card: AtlasCard) {
  if (!isUnlocked(card.id)) {
    tappedCardId.value = tappedCardId.value === card.id ? null : card.id
  }
}

/** 返回上一页 */
function goBack() {
  uni.navigateBack({ delta: 1 })
}

/** 下拉刷新 */
function onPullRefresh() {
  isRefreshing.value = true
  loadUnlocked()
  setTimeout(() => {
    isRefreshing.value = false
  }, 600)
}

/** 也兼容 onPullDownRefresh 生命周期 */
onPullDownRefresh(() => {
  loadUnlocked()
  setTimeout(() => {
    uni.stopPullDownRefresh()
  }, 600)
})

/* ===== 生命周期 ===== */

onMounted(() => {
  loadUnlocked()
})
</script>

<style lang="scss" scoped>
.page-atlas {
  min-height: 100vh;
  background: $bg-primary;
  position: relative;
  overflow: hidden;
}

/* ===== 星空背景装饰 ===== */
.atlas-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;

  &__star {
    position: absolute;
    width: 4rpx;
    height: 4rpx;
    border-radius: 50%;
    background: #fff;
    opacity: 0.3;
    animation: twinkle 3s ease-in-out infinite;

    &--1 { left: 8%; top: 5%; animation-delay: 0s; }
    &--2 { left: 22%; top: 12%; animation-delay: 0.4s; width: 3rpx; height: 3rpx; }
    &--3 { left: 65%; top: 8%; animation-delay: 0.8s; }
    &--4 { left: 88%; top: 15%; animation-delay: 1.2s; width: 5rpx; height: 5rpx; }
    &--5 { left: 45%; top: 18%; animation-delay: 1.6s; width: 3rpx; height: 3rpx; }
    &--6 { left: 12%; top: 35%; animation-delay: 2.0s; }
    &--7 { left: 78%; top: 40%; animation-delay: 0.3s; width: 3rpx; height: 3rpx; }
    &--8 { left: 35%; top: 50%; animation-delay: 0.7s; }
    &--9 { left: 92%; top: 55%; animation-delay: 1.1s; width: 5rpx; height: 5rpx; }
    &--10 { left: 55%; top: 62%; animation-delay: 1.5s; width: 3rpx; height: 3rpx; }
    &--11 { left: 15%; top: 70%; animation-delay: 1.9s; }
    &--12 { left: 70%; top: 75%; animation-delay: 0.2s; }
    &--13 { left: 40%; top: 80%; animation-delay: 0.6s; width: 3rpx; height: 3rpx; }
    &--14 { left: 85%; top: 85%; animation-delay: 1.0s; }
    &--15 { left: 25%; top: 88%; animation-delay: 1.4s; width: 5rpx; height: 5rpx; }
    &--16 { left: 60%; top: 92%; animation-delay: 1.8s; width: 3rpx; height: 3rpx; }
    &--17 { left: 5%; top: 55%; animation-delay: 2.2s; }
    &--18 { left: 50%; top: 30%; animation-delay: 2.5s; width: 3rpx; height: 3rpx; }
    &--19 { left: 30%; top: 25%; animation-delay: 0.5s; }
    &--20 { left: 95%; top: 45%; animation-delay: 1.3s; width: 3rpx; height: 3rpx; }
  }
}

/* ===== 导航栏 ===== */
.atlas-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-lg $spacing-xl;
  padding-top: calc(var(--status-bar-height, 44px) + $spacing-lg);
  background: linear-gradient(180deg, $bg-primary 60%, transparent 100%);

  &__back {
    width: 64rpx;
    height: 64rpx;
    border-radius: $radius-full;
    background: rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__back-icon {
    font-size: $font-lg;
    color: $text-primary;
    font-weight: bold;
    transform: scaleX(0.7);
  }

  &__title {
    font-size: $font-xl;
    font-weight: bold;
    color: $text-primary;
    letter-spacing: 4rpx;
  }

  &__placeholder {
    width: 64rpx;
  }
}

/* ===== 收集进度 ===== */
.atlas-progress {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  padding: 0 $spacing-xl;
  margin-bottom: $spacing-lg;
  gap: $spacing-md;

  &__info {
    display: flex;
    align-items: baseline;
    gap: $spacing-xs;
    flex-shrink: 0;
  }

  &__label {
    font-size: $font-sm;
    color: $text-secondary;
  }

  &__count {
    font-size: $font-base;
    font-weight: bold;
    color: $accent-gold;
  }

  &__bar-bg {
    flex: 1;
    height: 12rpx;
    border-radius: $radius-full;
    background: rgba(255, 255, 255, 0.08);
    overflow: hidden;
  }

  &__bar-fill {
    height: 100%;
    border-radius: $radius-full;
    background: linear-gradient(90deg, $brand-primary, $accent-gold);
    transition: width 0.6s ease;
    min-width: 0;
  }

  &__rate {
    font-size: $font-sm;
    color: $text-muted;
    flex-shrink: 0;
    min-width: 72rpx;
    text-align: right;
  }
}

/* ===== Tab 切换器 ===== */
.atlas-tabs {
  position: relative;
  z-index: 1;
  display: flex;
  margin: 0 $spacing-xl $spacing-lg;
  border-radius: $radius-lg;
  background: rgba(255, 255, 255, 0.04);
  border: 1rpx solid rgba(255, 255, 255, 0.06);
  overflow: hidden;

  &__item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    padding: $spacing-md 0;
    transition: all $transition-base;

    &--active {
      background: linear-gradient(135deg, rgba(108, 60, 224, 0.25), rgba(108, 60, 224, 0.1));
      border-radius: $radius-lg;
    }
  }

  &__text {
    font-size: $font-base;
    color: $text-muted;
    transition: color $transition-base;

    .atlas-tabs__item--active & {
      color: $text-primary;
      font-weight: 600;
    }
  }

  &__count {
    font-size: $font-xs;
    color: $text-muted;
    background: rgba(255, 255, 255, 0.06);
    padding: 2rpx 12rpx;
    border-radius: $radius-full;

    .atlas-tabs__item--active & {
      color: $accent-gold;
      background: rgba(255, 215, 0, 0.1);
    }
  }
}

/* ===== 卡片网格滚动容器 ===== */
.atlas-grid-scroll {
  position: relative;
  z-index: 1;
  height: calc(100vh - 400rpx);
}

/* ===== 卡片网格 ===== */
.atlas-grid {
  display: flex;
  flex-wrap: wrap;
  padding: $spacing-sm $spacing-lg;
  gap: $spacing-md;

  /* 2 列布局（默认移动端） */
  .atlas-card {
    width: calc(50% - #{$spacing-md} / 2);
  }
}

/* 宽屏适配：3 列 */
@media (min-width: 768px) {
  .atlas-grid {
    .atlas-card {
      width: calc(33.333% - #{$spacing-md} * 2 / 3);
    }
  }
}

/* ===== 卡片基础样式 ===== */
.atlas-card {
  position: relative;
  border-radius: $radius-lg;
  padding: $spacing-lg $spacing-md;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 320rpx;
  overflow: hidden;
  transition: transform $transition-base, box-shadow $transition-base;

  &:active {
    transform: scale(0.97);
  }

  /* ── 稀有度：SSR 金色 ── */
  &--ssr {
    background: linear-gradient(
      145deg,
      rgba(255, 215, 0, 0.08) 0%,
      rgba(26, 5, 51, 0.95) 50%,
      rgba(255, 215, 0, 0.05) 100%
    );
    border: 2rpx solid rgba(255, 215, 0, 0.35);
    box-shadow: 0 0 30rpx rgba(255, 215, 0, 0.1), 0 8rpx 32rpx rgba(0, 0, 0, 0.4);
  }

  /* ── 稀有度：SR 紫色 ── */
  &--sr {
    background: linear-gradient(
      145deg,
      rgba(168, 85, 247, 0.08) 0%,
      rgba(26, 5, 51, 0.95) 50%,
      rgba(168, 85, 247, 0.05) 100%
    );
    border: 2rpx solid rgba(168, 85, 247, 0.3);
    box-shadow: 0 0 24rpx rgba(168, 85, 247, 0.08), 0 8rpx 32rpx rgba(0, 0, 0, 0.4);
  }

  /* ── 稀有度：R 蓝色 ── */
  &--r {
    background: linear-gradient(
      145deg,
      rgba(59, 130, 246, 0.06) 0%,
      rgba(26, 5, 51, 0.95) 50%,
      rgba(59, 130, 246, 0.04) 100%
    );
    border: 2rpx solid rgba(59, 130, 246, 0.25);
    box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.4);
  }

  /* ── 未解锁状态 ── */
  &--locked {
    background: rgba(26, 5, 51, 0.6);
    border: 2rpx solid rgba(255, 255, 255, 0.06);
    box-shadow: none;
    opacity: 0.4;
  }

  /* ===== SSR 闪光层 ===== */
  &__shimmer {
    position: absolute;
    top: -50%;
    left: -70%;
    width: 60%;
    height: 200%;
    background: linear-gradient(
      120deg,
      transparent 0%,
      rgba(255, 255, 255, 0) 40%,
      rgba(255, 215, 0, 0.12) 50%,
      rgba(255, 255, 255, 0) 60%,
      transparent 100%
    );
    transform: rotate(20deg);
    animation: shimmerSweep 4s ease-in-out infinite;
    pointer-events: none;
  }

  /* ===== 稀有度标签 ===== */
  &__rarity {
    position: absolute;
    top: $spacing-sm;
    right: $spacing-sm;
    padding: 2rpx 14rpx;
    border-radius: $radius-sm;
    border: 1rpx solid;
    z-index: 2;

    &--ssr {
      background: rgba(255, 215, 0, 0.12);
      border-color: rgba(255, 215, 0, 0.5);
    }
    &--sr {
      background: rgba(168, 85, 247, 0.12);
      border-color: rgba(168, 85, 247, 0.5);
    }
    &--r {
      background: rgba(59, 130, 246, 0.12);
      border-color: rgba(59, 130, 246, 0.5);
    }
  }

  &__rarity-text {
    font-size: $font-xs;
    font-weight: 800;
    letter-spacing: 2rpx;

    .atlas-card--ssr & { color: $accent-gold; }
    .atlas-card--sr & { color: #a855f7; }
    .atlas-card--r & { color: #3b82f6; }
  }

  /* ===== 图标区域 ===== */
  &__icon {
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1rpx solid rgba(255, 255, 255, 0.1);
    margin-bottom: $spacing-sm;
    margin-top: $spacing-xs;
  }

  &__icon-emoji {
    font-size: 48rpx;
  }

  /* ===== 名称 ===== */
  &__name {
    font-size: $font-base;
    font-weight: 700;
    color: $text-primary;
    text-align: center;
    margin-bottom: $spacing-xs;
    line-height: 1.3;
  }

  /* ===== 类型标签 ===== */
  &__type-label {
    font-size: $font-xs;
    color: $text-muted;
    letter-spacing: 2rpx;
    margin-bottom: $spacing-xs;
  }

  /* ===== 描述 ===== */
  &__desc {
    font-size: $font-xs;
    color: $text-secondary;
    text-align: center;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ===== 未解锁：问号图标 ===== */
  &__locked-icon {
    width: 96rpx;
    height: 96rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1rpx dashed rgba(255, 255, 255, 0.1);
    margin-bottom: $spacing-sm;
    margin-top: $spacing-md;
  }

  &__locked-emoji {
    font-size: $font-xxl;
    color: $text-muted;
    font-weight: bold;
  }

  &__locked-label {
    font-size: $font-sm;
    color: $text-muted;
  }

  &__unlock-hint {
    font-size: $font-xs;
    color: $accent-gold;
    text-align: center;
    margin-top: $spacing-sm;
    line-height: 1.4;
    animation: fadeInUp 0.3s ease;
  }
}

/* ===== 动画 ===== */

@keyframes twinkle {
  0%, 100% {
    opacity: 0.2;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.2);
  }
}

@keyframes shimmerSweep {
  0%, 55%, 100% {
    left: -70%;
    opacity: 0;
  }
  65% {
    opacity: 1;
  }
  85% {
    left: 130%;
    opacity: 0;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
