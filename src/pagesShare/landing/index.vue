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
        <text class="landing-brand__name">宁好星图</text>
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

      <!-- 默认状态（未携带 type 参数时展示通用星灵视觉） -->
      <view v-else class="landing-default">
        <view class="landing-default__orb">
          <view class="landing-default__orb-ring" />
          <view class="landing-default__orb-core" />
          <view class="landing-default__orb-dot landing-default__orb-dot--1" />
          <view class="landing-default__orb-dot landing-default__orb-dot--2" />
          <view class="landing-default__orb-dot landing-default__orb-dot--3" />
        </view>
        <text class="landing-default__title">发现你的灵魂星灵</text>
        <text class="landing-default__sub">5 分钟沉浸测试，看见你的灵魂形状</text>
      </view>

      <!-- 功能亮点三卡 -->
      <view class="features">
        <view class="features__item">
          <view class="features__icon">🧠</view>
          <text class="features__title">MBTI 深度解析</text>
          <text class="features__desc">基于 36 道题的双轨评分，精准定位你的人格类型与四维度置信度</text>
        </view>
        <view class="features__item">
          <view class="features__icon">✨</view>
          <text class="features__title">四大星灵向导</text>
          <text class="features__desc">烈焰 / 深渊 / 森林 / 星辰，找到与你灵魂共振的向导组合</text>
        </view>
        <view class="features__item">
          <view class="features__icon">♈</view>
          <text class="features__title">星座融合解读</text>
          <text class="features__desc">12 星座 × MBTI 的共鸣、反差、互补三模式专属解读</text>
        </view>
      </view>

      <!-- 报告预览轮播 -->
      <view class="preview">
        <text class="preview__title">你将获得的深度报告</text>
        <scroll-view scroll-x class="preview__scroll">
          <view class="preview__list">
            <view class="preview__card" v-for="p in previewCards" :key="p.title">
              <text class="preview__card-emoji">{{ p.emoji }}</text>
              <text class="preview__card-title">{{ p.title }}</text>
              <text class="preview__card-desc">{{ p.desc }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 社会证明 -->
      <view class="proof">
        <view class="proof__item">
          <text class="proof__num">16</text>
          <text class="proof__label">种人格类型</text>
        </view>
        <view class="proof__sep" />
        <view class="proof__item">
          <text class="proof__num">15</text>
          <text class="proof__label">种星灵组合</text>
        </view>
        <view class="proof__sep" />
        <view class="proof__item">
          <text class="proof__num">12</text>
          <text class="proof__label">星座融合</text>
        </view>
      </view>

      <!-- 好奇心引导（仅当分享者类型已知时展示） -->
      <view v-if="personalityData" class="landing-hook">
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
        <text class="landing-footer__text">© 宁好星图 SOULMAP</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { personalityTypes, type PersonalityTypeData } from '@/data/results/types'
import { useTestStore } from '@/stores/test'
import { useInvite } from '@/composables/useInvite'

/* ===== 状态 ===== */

const typeCode = ref('')
const inviteCodeFromUrl = ref('')
const personalityData = ref<PersonalityTypeData | null>(null)
const testStore = useTestStore()
const invite = useInvite()

/* ===== 元素图标映射 ===== */

const elementIcons: Record<string, string> = {
  '火': '🔥', '水': '💧', '风': '🌪', '土': '🌍', '光': '✨', '暗': '🌑',
}

/* ===== 报告预览卡片 ===== */
const previewCards = [
  { emoji: '🧠', title: '深度性格分析', desc: '500 字核心剖析，看见你人格的骨架与驱动力' },
  { emoji: '💫', title: '内心世界揭秘', desc: '你的灵魂深处藏着哪些未被看见的渴望与恐惧' },
  { emoji: '💼', title: '职业发展建议', desc: '结合 MBTI 与星灵向导，给出最契合你的方向' },
]

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

  // 裂变关键：从 URL 读取邀请码并登记关系
  const inv = options?.invite || options?.inviteCode || ''
  if (inv) {
    inviteCodeFromUrl.value = inv
    // 异步登记，不阻塞首屏渲染
    invite.registerAsInvitee(inv).catch((e) => {
      console.warn('[Landing] registerAsInvitee 失败:', e)
    })
  }

  console.log('[Page] 分享落地页加载, type:', typeCode.value, 'invite:', inviteCodeFromUrl.value)
})

/* ===== 事件 ===== */

function handleStartTest(): void {
  // 开始新测试；把入口邀请码透传到 intro 页，便于后续链路再次登记
  testStore.resetTest()
  testStore.startTest()
  const inv = inviteCodeFromUrl.value ? `&inviteCode=${inviteCodeFromUrl.value}` : ''
  uni.navigateTo({
    url: `/pagesTest/intro/index?from=share${inv}`,
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

@keyframes orbFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20rpx); }
}

@keyframes ringRotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes orbitMove1 {
  from { transform: rotate(0deg) translateX(160rpx) rotate(0deg); }
  to { transform: rotate(360deg) translateX(160rpx) rotate(-360deg); }
}
@keyframes orbitMove2 {
  from { transform: rotate(120deg) translateX(200rpx) rotate(-120deg); }
  to { transform: rotate(480deg) translateX(200rpx) rotate(-480deg); }
}
@keyframes orbitMove3 {
  from { transform: rotate(240deg) translateX(140rpx) rotate(-240deg); }
  to { transform: rotate(600deg) translateX(140rpx) rotate(-600deg); }
}

/* ===== 默认状态（无 type 参数）===== */
.landing-default {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: $spacing-xl;
  animation: fadeSlideUp 0.8s ease 0.2s both;

  &__orb {
    width: 320rpx;
    height: 320rpx;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: orbFloat 4s ease-in-out infinite;
    margin-bottom: $spacing-lg;
  }

  &__orb-core {
    width: 180rpx;
    height: 180rpx;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #8b5cf6, #6c3ce0 40%, #3b1a8e 70%, #1a0533);
    box-shadow:
      0 0 60rpx rgba(108, 60, 224, 0.5),
      0 0 120rpx rgba(108, 60, 224, 0.2),
      inset -20rpx -20rpx 40rpx rgba(0, 0, 0, 0.4);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 18%;
      left: 22%;
      width: 40rpx;
      height: 30rpx;
      background: radial-gradient(ellipse, rgba(255, 255, 255, 0.6), transparent);
      border-radius: 50%;
      filter: blur(4rpx);
    }
  }

  &__orb-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300rpx;
    height: 300rpx;
    border: 2rpx dashed rgba(108, 60, 224, 0.3);
    border-radius: 50%;
    animation: ringRotate 20s linear infinite;
  }

  &__orb-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 12rpx;
    height: 12rpx;
    margin: -6rpx;
    border-radius: 50%;
    background: $accent-gold;
    box-shadow: 0 0 16rpx rgba(255, 215, 0, 0.8);

    &--1 { animation: orbitMove1 8s linear infinite; }
    &--2 { animation: orbitMove2 12s linear infinite; }
    &--3 { animation: orbitMove3 10s linear infinite; }
  }

  &__title {
    font-size: $font-xl;
    font-weight: 800;
    color: $text-primary;
    letter-spacing: 4rpx;
    text-align: center;
    margin-bottom: $spacing-xs;
  }

  &__sub {
    font-size: $font-sm;
    color: $text-muted;
    letter-spacing: 2rpx;
    text-align: center;
  }
}

/* ===== 功能亮点 ===== */
.features {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  margin-bottom: $spacing-xl;
  animation: fadeSlideUp 0.8s ease 0.3s both;

  &__item {
    padding: $spacing-lg;
    border-radius: $radius-xl;
    background: linear-gradient(145deg, rgba(108, 60, 224, 0.1), rgba(26, 5, 51, 0.6));
    border: 1rpx solid rgba(108, 60, 224, 0.2);
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    transition: transform 0.2s ease;

    &:active { transform: scale(0.98); }
  }

  &__icon {
    font-size: 48rpx;
    margin-bottom: $spacing-xs;
  }

  &__title {
    font-size: $font-md;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: 2rpx;
  }

  &__desc {
    font-size: $font-sm;
    color: $text-secondary;
    line-height: 1.7;
    letter-spacing: 1rpx;
  }
}

/* ===== 报告预览 ===== */
.preview {
  width: 100%;
  margin-bottom: $spacing-xl;
  animation: fadeSlideUp 0.8s ease 0.4s both;

  &__title {
    display: block;
    font-size: $font-md;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: 2rpx;
    margin-bottom: $spacing-md;
    padding: 0 $spacing-xs;
  }

  &__scroll {
    width: 100%;
    white-space: nowrap;
  }

  &__list {
    display: inline-flex;
    gap: $spacing-md;
    padding: 0 $spacing-xs;
  }

  &__card {
    display: inline-flex;
    flex-direction: column;
    gap: $spacing-sm;
    width: 480rpx;
    padding: $spacing-lg;
    border-radius: $radius-xl;
    background: linear-gradient(145deg, rgba(255, 215, 0, 0.08), rgba(108, 60, 224, 0.1));
    border: 1rpx solid rgba(255, 215, 0, 0.2);
    white-space: normal;
    vertical-align: top;
  }

  &__card-emoji {
    font-size: 56rpx;
  }

  &__card-title {
    font-size: $font-md;
    font-weight: 700;
    color: $accent-gold;
    letter-spacing: 2rpx;
  }

  &__card-desc {
    font-size: $font-sm;
    color: $text-secondary;
    line-height: 1.7;
  }
}

/* ===== 社会证明 ===== */
.proof {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: $spacing-lg;
  background: $bg-card;
  border: 1rpx solid rgba(255, 255, 255, 0.06);
  border-radius: $radius-xl;
  margin-bottom: $spacing-xl;
  animation: fadeSlideUp 0.8s ease 0.45s both;

  &__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6rpx;
  }

  &__num {
    font-size: $font-xl;
    font-weight: 800;
    color: $accent-gold;
    letter-spacing: 1rpx;
  }

  &__label {
    font-size: $font-xs;
    color: $text-muted;
    letter-spacing: 2rpx;
  }

  &__sep {
    width: 1rpx;
    height: 48rpx;
    background: rgba(255, 255, 255, 0.08);
  }
}
</style>
