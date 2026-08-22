<!--
  灵魂星图 - 分享落地页

  当别人通过分享链接 / 小程序码进入时看到的页面：
  - 从 URL 参数获取分享者的结果类型（?type=INTJ）
  - 展示分享者的星灵类型卡片摘要
  - CTA 引导新用户开始自己的灵魂探索
-->
<template>
  <view class="page-landing">
    <!-- 星空装饰粒子 -->
    <view class="page-landing__stars">
      <view
        v-for="n in 30"
        :key="'star-' + n"
        class="page-landing__star"
        :style="getStarStyle(n)"
      />
    </view>

    <!-- 主内容 -->
    <view class="page-landing__content">
      <!-- 顶部品牌标识 -->
      <view class="landing-brand">
        <text class="landing-brand__icon">✦</text>
        <text class="landing-brand__name">灵魂星图</text>
        <text class="landing-brand__sub">SOULMAP</text>
      </view>

      <!-- 星灵卡片 -->
      <view
        v-if="personalityData"
        class="landing-card"
        :style="cardStyle"
      >
        <!-- 卡片光晕 -->
        <view class="landing-card__halo" :style="haloStyle" />

        <!-- 稀有度标签 -->
        <view class="landing-card__rarity" :class="`landing-card__rarity--${rarityClass}`">
          <text class="landing-card__rarity-text">{{ personalityData.rarity }}</text>
        </view>

        <!-- 元素图标 -->
        <view class="landing-card__element">
          <text class="landing-card__element-icon">{{ elementIcon }}</text>
        </view>

        <!-- TA 是 -->
        <text class="landing-card__label">TA 的灵魂星灵</text>

        <!-- 星灵名称 -->
        <text class="landing-card__name">{{ personalityData.name }}</text>

        <!-- 类型代码 -->
        <text class="landing-card__code">{{ personalityData.code }}</text>

        <!-- 标签 -->
        <view class="landing-card__tags">
          <view
            v-for="tag in personalityData.tags"
            :key="tag"
            class="landing-card__tag"
            :style="tagStyle"
          >
            <text class="landing-card__tag-text" :style="{ color: personalityData.color }">{{ tag }}</text>
          </view>
        </view>

        <!-- 一句话描述 -->
        <text class="landing-card__title">{{ personalityData.title }}</text>

        <!-- 底部装饰线 -->
        <view class="landing-card__border-line" :style="{ background: personalityData.color }" />
      </view>

      <!-- 无效类型提示 -->
      <view v-else-if="typeCode && !personalityData" class="landing-empty">
        <text class="landing-empty__icon">🌌</text>
        <text class="landing-empty__text">这颗星灵似乎迷失了方向…</text>
      </view>

      <!-- 好奇心引导 -->
      <view class="landing-hook">
        <text class="landing-hook__text">你和 TA 是什么灵魂关系？</text>
        <text class="landing-hook__sub">每个人的灵魂星灵都独一无二</text>
      </view>

      <!-- CTA 按钮 -->
      <view class="landing-cta" @tap="handleStartTest">
        <view class="landing-cta__glow" :style="ctaGlowStyle" />
        <text class="landing-cta__text">✦  开始我的灵魂探索  ✦</text>
      </view>

      <!-- 次级入口 -->
      <view class="landing-secondary" @tap="handleStartTest">
        <text class="landing-secondary__text">3 分钟，发现你的灵魂星灵</text>
        <text class="landing-secondary__arrow">→</text>
      </view>

      <!-- 底部装饰 -->
      <view class="landing-footer">
        <text class="landing-footer__text">© 灵魂星图 SOULMAP</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { personalityTypes, type PersonalityTypeData } from '@/data/results/types'
import { useTestStore } from '@/stores/test'

/* ===== 状态 ===== */

const typeCode = ref('')
const personalityData = ref<PersonalityTypeData | null>(null)
const testStore = useTestStore()

/* ===== 元素图标映射 ===== */

const elementIcons: Record<string, string> = {
  '火': '🔥', '水': '💧', '风': '🌪', '土': '🌍', '光': '✨', '暗': '🌑',
}

const elementIcon = computed(() => {
  if (!personalityData.value) return '⭐'
  return elementIcons[personalityData.value.element] || '⭐'
})

/* ===== 稀有度 ===== */

const rarityClass = computed(() => {
  if (!personalityData.value) return 'r'
  switch (personalityData.value.rarity) {
    case 'SSR': return 'ssr'
    case 'SR': return 'sr'
    default: return 'r'
  }
})

const rarityColors: Record<string, string> = {
  SSR: '#ffd700', SR: '#a855f7', R: '#3b82f6',
}

/* ===== 计算样式 ===== */

const cardStyle = computed(() => {
  if (!personalityData.value) return {}
  const color = personalityData.value.color
  return {
    '--card-color': color,
    borderColor: `${color}33`,
    boxShadow: `0 0 80rpx ${color}22, 0 30rpx 80rpx rgba(0,0,0,0.5)`,
  }
})

const haloStyle = computed(() => {
  if (!personalityData.value) return {}
  const color = personalityData.value.color
  return {
    background: `radial-gradient(circle, ${color}55 0%, ${color}11 50%, transparent 70%)`,
  }
})

const tagStyle = computed(() => {
  if (!personalityData.value) return {}
  const color = personalityData.value.color
  return {
    background: `${color}15`,
    borderColor: `${color}50`,
  }
})

const ctaGlowStyle = computed(() => {
  if (!personalityData.value) return {}
  const color = personalityData.value.color
  return {
    background: `radial-gradient(ellipse, ${color}40 0%, transparent 70%)`,
  }
})

/* ===== 星点样式生成 ===== */

function getStarStyle(n: number): Record<string, string> {
  // 伪随机布局
  const seed = n * 7 + 13
  const left = ((seed * 37) % 100)
  const top = ((seed * 53) % 100)
  const size = 2 + (seed % 4)
  const delay = (seed % 5) * 0.6
  const duration = 2 + (seed % 3)
  const opacity = 0.2 + (seed % 6) * 0.1
  return {
    left: `${left}%`,
    top: `${top}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    opacity: String(opacity),
  }
}

/* ===== 页面加载 ===== */

onLoad((options) => {
  const type = options?.type || ''
  if (type) {
    typeCode.value = type.toUpperCase()
    const data = personalityTypes[typeCode.value]
    if (data) {
      personalityData.value = data
    }
  }
  console.log('[Page] 分享落地页加载, type:', typeCode.value)
})

/* ===== 事件 ===== */

function handleStartTest(): void {
  // 开始新测试
  testStore.resetTest()
  testStore.startTest()
  uni.navigateTo({
    url: '/pagesTest/intro/index?from=share',
  })
}

/* ===== 小程序分享 ===== */

// #ifdef MP-WEIXIN
import { onShareAppMessage } from '@dcloudio/uni-app'

onShareAppMessage(() => {
  const name = personalityData.value?.name || '灵魂星灵'
  const code = typeCode.value || 'INTJ'
  return {
    title: `TA 的灵魂星灵是「${name}」，快来测测你的！`,
    path: `/pagesShare/landing/index?type=${code}`,
  }
})
// #endif
</script>

<style lang="scss" scoped>
.page-landing {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    #0d0118 0%,
    #120228 40%,
    #0f0a2e 70%,
    #0d0118 100%
  );

  /* 星空粒子 */
  &__stars {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  &__star {
    position: absolute;
    border-radius: 50%;
    background: #ffffff;
    animation: starTwinkle 3s ease-in-out infinite;
  }

  /* 主内容 */
  &__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-xxl $spacing-xl $spacing-xl;
    min-height: 100vh;
  }
}

/* ===== 品牌标识 ===== */
.landing-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: $spacing-xxl;
  animation: fadeSlideDown 0.8s ease forwards;

  &__icon {
    font-size: 48rpx;
    color: $accent-gold;
    margin-bottom: $spacing-xs;
    text-shadow: 0 0 20rpx rgba(255, 215, 0, 0.5);
  }

  &__name {
    font-size: $font-xl;
    font-weight: 800;
    color: $text-primary;
    letter-spacing: 8rpx;
  }

  &__sub {
    font-size: $font-xs;
    color: $text-muted;
    letter-spacing: 12rpx;
    margin-top: 4rpx;
  }
}

/* ===== 星灵卡片 ===== */
.landing-card {
  position: relative;
  width: 100%;
  max-width: 600rpx;
  border-radius: $radius-xl;
  background: linear-gradient(
    145deg,
    rgba(26, 5, 51, 0.95) 0%,
    rgba(13, 1, 24, 0.98) 100%
  );
  border: 2rpx solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  margin-bottom: $spacing-xl;
  animation: fadeSlideUp 0.8s ease 0.2s both;

  &__halo {
    position: absolute;
    top: -40%;
    left: 50%;
    transform: translateX(-50%);
    width: 160%;
    height: 120%;
    opacity: 0.6;
    pointer-events: none;
  }

  &__rarity {
    position: absolute;
    top: $spacing-lg;
    right: $spacing-lg;
    padding: 6rpx 18rpx;
    border-radius: $radius-sm;
    border: 1rpx solid;

    &--ssr {
      background: rgba(255, 215, 0, 0.15);
      border-color: rgba(255, 215, 0, 0.5);
    }
    &--sr {
      background: rgba(168, 85, 247, 0.15);
      border-color: rgba(168, 85, 247, 0.5);
    }
    &--r {
      background: rgba(59, 130, 246, 0.15);
      border-color: rgba(59, 130, 246, 0.5);
    }
  }

  &__rarity-text {
    font-size: $font-xs;
    font-weight: 800;
    letter-spacing: 2rpx;
    .landing-card__rarity--ssr & { color: #ffd700; }
    .landing-card__rarity--sr & { color: #a855f7; }
    .landing-card__rarity--r & { color: #3b82f6; }
  }

  &__element {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: $spacing-xxl;
    margin-bottom: $spacing-md;
  }

  &__element-icon {
    font-size: 80rpx;
    filter: drop-shadow(0 0 20rpx rgba(255, 255, 255, 0.3));
    animation: float 3s ease-in-out infinite;
  }

  &__label {
    display: block;
    text-align: center;
    font-size: $font-sm;
    color: $text-muted;
    letter-spacing: 4rpx;
    margin-bottom: $spacing-xs;
  }

  &__name {
    display: block;
    text-align: center;
    font-size: $font-title;
    font-weight: 800;
    color: $text-primary;
    letter-spacing: 6rpx;
    margin-bottom: $spacing-xs;
    text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.5);
  }

  &__code {
    display: block;
    text-align: center;
    font-size: $font-lg;
    font-weight: 300;
    color: $text-secondary;
    letter-spacing: 12rpx;
    margin-bottom: $spacing-md;
  }

  &__tags {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-md;
    padding: 0 $spacing-xl;
    flex-wrap: wrap;
  }

  &__tag {
    padding: 6rpx 20rpx;
    border-radius: $radius-full;
    border: 1rpx solid rgba(255, 255, 255, 0.15);
  }

  &__tag-text {
    font-size: $font-xs;
    font-weight: 600;
    letter-spacing: 2rpx;
  }

  &__title {
    display: block;
    text-align: center;
    font-size: $font-sm;
    color: $text-secondary;
    padding: 0 $spacing-xl;
    margin-bottom: $spacing-xl;
    line-height: 1.6;
  }

  &__border-line {
    height: 4rpx;
    margin: 0 $spacing-xl;
    border-radius: 4rpx;
    opacity: 0.5;
    margin-bottom: $spacing-sm;
  }
}

/* ===== 空状态 ===== */
.landing-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
  margin-bottom: $spacing-xl;
  animation: fadeSlideUp 0.8s ease 0.2s both;

  &__icon {
    font-size: 100rpx;
  }

  &__text {
    font-size: $font-base;
    color: $text-secondary;
  }
}

/* ===== 好奇心引导 ===== */
.landing-hook {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  margin-bottom: $spacing-xl;
  animation: fadeSlideUp 0.8s ease 0.4s both;

  &__text {
    font-size: $font-lg;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: 2rpx;
  }

  &__sub {
    font-size: $font-sm;
    color: $text-muted;
  }
}

/* ===== CTA 按钮 ===== */
.landing-cta {
  position: relative;
  width: 100%;
  max-width: 560rpx;
  padding: $spacing-md 0;
  border-radius: $radius-full;
  background: linear-gradient(135deg, #6c3ce0 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: $spacing-lg;
  animation: fadeSlideUp 0.8s ease 0.5s both;
  box-shadow: 0 12rpx 40rpx rgba(108, 60, 224, 0.5);
  cursor: pointer;

  &:active {
    transform: scale(0.97);
    opacity: 0.9;
  }

  &__glow {
    position: absolute;
    inset: -50%;
    opacity: 0.5;
    pointer-events: none;
    animation: ctaPulse 2s ease-in-out infinite;
  }

  &__text {
    position: relative;
    z-index: 1;
    font-size: $font-md;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 4rpx;
  }
}

/* ===== 次级入口 ===== */
.landing-secondary {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-lg;
  border-radius: $radius-full;
  border: 1.5rpx solid rgba(255, 255, 255, 0.12);
  margin-bottom: $spacing-xxl;
  animation: fadeSlideUp 0.8s ease 0.6s both;
  cursor: pointer;

  &:active {
    background: rgba(255, 255, 255, 0.05);
  }

  &__text {
    font-size: $font-sm;
    color: $text-secondary;
  }

  &__arrow {
    font-size: $font-sm;
    color: $text-muted;
    transition: transform 0.2s ease;
  }
}

/* ===== 底部 ===== */
.landing-footer {
  margin-top: auto;
  padding-top: $spacing-xl;

  &__text {
    font-size: $font-xs;
    color: $text-muted;
    letter-spacing: 4rpx;
  }
}

/* ===== 动画 ===== */
@keyframes starTwinkle {
  0%, 100% { opacity: 0.1; transform: scale(0.8); }
  50% { opacity: 0.8; transform: scale(1.2); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16rpx); }
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(40rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeSlideDown {
  from { opacity: 0; transform: translateY(-30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes ctaPulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.1); }
}
</style>
