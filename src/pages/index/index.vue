<!--
  灵魂星图 - 首页
  深色星空主题，品牌视觉 + 核心CTA入口
-->
<template>
  <view class="page-home" :class="{ 'page-loaded': pageLoaded }">
    <!-- 星空粒子背景层 -->
    <view class="stars-layer stars-layer--back">
      <view v-for="i in 20" :key="'s'+i" class="star" :style="starStyle(i, 'back')" />
    </view>
    <view class="stars-layer stars-layer--front">
      <view v-for="i in 12" :key="'f'+i" class="star star--bright" :style="starStyle(i, 'front')" />
    </view>

    <!-- 顶部品牌区域 -->
    <view class="brand-section anim-hidden" :class="{ 'anim-fade-in-down': pageLoaded }">
      <view class="brand-logo">
        <view class="logo-ring" />
        <view class="logo-core" />
      </view>
      <text class="brand-title">灵魂星图</text>
      <text class="brand-subtitle">探索你的灵魂星灵</text>
    </view>

    <!-- 中央星球视觉 -->
    <view class="orb-section anim-hidden" :class="{ 'anim-fade-in-up': pageLoaded }" style="animation-delay: 0.2s">
      <view class="orb-container">
        <!-- 外层光环 -->
        <view class="orb-ring orb-ring--outer" />
        <view class="orb-ring orb-ring--inner" />
        <!-- 主星球 -->
        <view class="orb-sphere">
          <view class="orb-surface" />
          <view class="orb-highlight" />
        </view>
        <!-- 轨道小星星 -->
        <view class="orbit-star orbit-star--1" />
        <view class="orbit-star orbit-star--2" />
        <view class="orbit-star orbit-star--3" />
      </view>
    </view>

    <!-- CTA 按钮区域 -->
    <view class="cta-section anim-hidden" :class="{ 'anim-fade-in-up': pageLoaded }" style="animation-delay: 0.4s">
      <view class="cta-btn" @tap="handleStart">
        <view class="cta-btn__glow" />
        <view class="cta-btn__inner">
          <text class="cta-btn__text">开始灵魂探索</text>
          <text class="cta-btn__arrow">→</text>
        </view>
      </view>
    </view>

    <!-- 底部信息区域 -->
    <view class="footer-section anim-hidden" :class="{ 'anim-fade-in-up': pageLoaded }" style="animation-delay: 0.6s">
      <view class="footer-counter">
        <text class="footer-counter__num">{{ displayCount }}</text>
        <text class="footer-counter__label">位探索者已完成灵魂之旅</text>
      </view>
      <view class="footer-divider" />
      <text class="footer-desc">5分钟 · 25道灵魂之问</text>
      <text class="footer-hint">趣味人格探索，帮你更了解自己</text>

      <!-- 合规声明区 -->
      <view class="footer-legal">
        <text class="footer-legal__disclaimer">
          本应用为趣味人格探索工具，结果仅供娱乐参考，不作为专业心理诊断或医学建议。
        </text>
        <view class="footer-legal__links">
          <text class="footer-legal__link" @tap="openPrivacy">《隐私协议》</text>
          <text class="footer-legal__sep">·</text>
          <text class="footer-legal__link" @tap="openTerms">《用户协议》</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const pageLoaded = ref(false)
const displayCount = ref('12,863')

onLoad((query) => {
  console.log('[Page] 首页加载', query)
  const inviteCode = (query?.inviteCode || query?.invite) as string | undefined
  if (inviteCode) {
    // 异步登记邀请关系
    import('@/composables/useInvite').then(({ useInvite }) => {
      const invite = useInvite()
      invite.registerAsInvitee(inviteCode).catch(() => {})
    })
  }
})

onMounted(() => {
  // 触发页面加载动画
  setTimeout(() => {
    pageLoaded.value = true
  }, 100)
})

/** 生成星星随机样式 */
function starStyle(index: number, layer: string) {
  const seed = index * 137.508 // 黄金角
  const x = (Math.sin(seed) * 0.5 + 0.5) * 100
  const y = (Math.cos(seed * 1.3) * 0.5 + 0.5) * 100
  const size = layer === 'back' ? 2 + (index % 3) : 3 + (index % 4)
  const delay = (index * 0.3) % 4
  const duration = 2 + (index % 3)
  return {
    left: `${x}%`,
    top: `${y}%`,
    width: `${size}rpx`,
    height: `${size}rpx`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  }
}

function handleStart() {
  uni.navigateTo({ url: '/pagesTest/intro/index' })
}

function openPrivacy() {
  uni.navigateTo({ url: '/pagesUser/legal/index?type=privacy' })
}

function openTerms() {
  uni.navigateTo({ url: '/pagesUser/legal/index?type=terms' })
}
</script>

<style lang="scss" scoped>
/* ===== 自定义动画 ===== */
@keyframes ctaPulse {
  0%, 100% {
    box-shadow:
      0 0 20rpx rgba(255, 215, 0, 0.3),
      0 0 60rpx rgba(255, 215, 0, 0.15),
      inset 0 0 20rpx rgba(255, 215, 0, 0.05);
  }
  50% {
    box-shadow:
      0 0 40rpx rgba(255, 215, 0, 0.5),
      0 0 100rpx rgba(255, 215, 0, 0.25),
      inset 0 0 30rpx rgba(255, 215, 0, 0.1);
  }
}

@keyframes orbFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16rpx); }
}

@keyframes ringRotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes orbitMove1 {
  from { transform: rotate(0deg) translateX(180rpx) rotate(0deg); }
  to { transform: rotate(360deg) translateX(180rpx) rotate(-360deg); }
}

@keyframes orbitMove2 {
  from { transform: rotate(120deg) translateX(220rpx) rotate(-120deg); }
  to { transform: rotate(480deg) translateX(220rpx) rotate(-480deg); }
}

@keyframes orbitMove3 {
  from { transform: rotate(240deg) translateX(160rpx) rotate(-240deg); }
  to { transform: rotate(600deg) translateX(160rpx) rotate(-600deg); }
}

@keyframes surfaceShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes counterFade {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* ===== 页面容器 ===== */
.page-home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 48rpx;
  padding-top: 120rpx;
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
  background: #ffffff;
  animation: twinkle 2s ease-in-out infinite;
}

.star--bright {
  background: $accent-gold;
  box-shadow: 0 0 6rpx rgba(255, 215, 0, 0.6);
}

/* ===== 品牌区域 ===== */
.brand-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
  position: relative;
  z-index: 1;
}

.brand-logo {
  width: 96rpx;
  height: 96rpx;
  position: relative;
  margin-bottom: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-ring {
  position: absolute;
  width: 96rpx;
  height: 96rpx;
  border: 2rpx solid rgba(255, 215, 0, 0.3);
  border-radius: 50%;
  animation: rotate 12s linear infinite;

  &::before {
    content: '';
    position: absolute;
    top: -4rpx;
    left: 50%;
    width: 8rpx;
    height: 8rpx;
    background: $accent-gold;
    border-radius: 50%;
    box-shadow: 0 0 12rpx $accent-gold;
  }
}

.logo-core {
  width: 40rpx;
  height: 40rpx;
  background: radial-gradient(circle at 35% 35%, $accent-gold, #c7a600);
  border-radius: 50%;
  box-shadow: 0 0 24rpx rgba(255, 215, 0, 0.5);
}

.brand-title {
  font-size: 72rpx;
  font-weight: 800;
  letter-spacing: 12rpx;
  background: linear-gradient(135deg, #ffd700 0%, #fff4b8 40%, #ffd700 70%, #c7a600 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: $font-md;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 8rpx;
  margin-top: 12rpx;
}

/* ===== 星球视觉 ===== */
.orb-section {
  margin-bottom: 56rpx;
  position: relative;
  z-index: 1;
}

.orb-container {
  width: 360rpx;
  height: 360rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: orbFloat 4s ease-in-out infinite;
}

.orb-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 50%;
  border: 1rpx solid rgba(108, 60, 224, 0.25);

  &--outer {
    width: 340rpx;
    height: 340rpx;
    transform: translate(-50%, -50%);
    animation: ringRotate 20s linear infinite;
    border-style: dashed;
    border-color: rgba(108, 60, 224, 0.2);
  }

  &--inner {
    width: 260rpx;
    height: 260rpx;
    transform: translate(-50%, -50%);
    animation: ringRotate 15s linear infinite reverse;
    border-color: rgba(255, 215, 0, 0.15);
  }
}

.orb-sphere {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  position: relative;
  background: radial-gradient(circle at 35% 30%, #8b5cf6, #6c3ce0 40%, #3b1a8e 70%, #1a0533);
  box-shadow:
    0 0 60rpx rgba(108, 60, 224, 0.5),
    0 0 120rpx rgba(108, 60, 224, 0.2),
    inset -20rpx -20rpx 40rpx rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.orb-surface {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    transparent 20%,
    rgba(255, 215, 0, 0.08) 40%,
    rgba(79, 195, 247, 0.06) 60%,
    transparent 80%
  );
  background-size: 200% 200%;
  animation: surfaceShift 6s ease-in-out infinite;
}

.orb-highlight {
  position: absolute;
  top: 18%;
  left: 22%;
  width: 40rpx;
  height: 30rpx;
  background: radial-gradient(ellipse, rgba(255, 255, 255, 0.6), transparent);
  border-radius: 50%;
  filter: blur(4rpx);
}

.orbit-star {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10rpx;
  height: 10rpx;
  margin: -5rpx;
  border-radius: 50%;
  background: $accent-gold;
  box-shadow: 0 0 12rpx rgba(255, 215, 0, 0.8);

  &--1 { animation: orbitMove1 8s linear infinite; }
  &--2 { animation: orbitMove2 12s linear infinite; }
  &--3 { animation: orbitMove3 10s linear infinite; }
}

/* ===== CTA 按钮 ===== */
.cta-section {
  margin-bottom: 56rpx;
  position: relative;
  z-index: 1;
}

.cta-btn {
  position: relative;
  width: 520rpx;
  height: 104rpx;
  border-radius: $radius-full;
  cursor: pointer;
  animation: ctaPulse 2.5s ease-in-out infinite;
  transition: transform 0.2s ease;

  &:active {
    transform: scale(0.96);
  }
}

.cta-btn__glow {
  position: absolute;
  inset: -4rpx;
  border-radius: $radius-full;
  background: linear-gradient(135deg, #ffd700, #ffe44d, #ffd700);
  opacity: 0.6;
  filter: blur(8rpx);
}

.cta-btn__inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: $radius-full;
  background: linear-gradient(135deg, #ffd700 0%, #ffe44d 50%, #c7a600 100%);
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
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shimmer 3s ease-in-out infinite;
  }
}

.cta-btn__text {
  font-size: $font-xl;
  font-weight: 700;
  color: #1a0533;
  letter-spacing: 4rpx;
}

.cta-btn__arrow {
  font-size: $font-xl;
  color: #1a0533;
  font-weight: 700;
}

/* ===== 底部信息 ===== */
.footer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  position: relative;
  z-index: 1;
}

.footer-counter {
  display: flex;
  align-items: baseline;
  gap: 8rpx;

  &__num {
    font-size: $font-lg;
    font-weight: 700;
    color: $accent-gold;
    animation: counterFade 3s ease-in-out infinite;
  }

  &__label {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.4);
  }
}

.footer-divider {
  width: 120rpx;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent);
  margin: 4rpx 0;
}

.footer-desc {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 4rpx;
}

.footer-hint {
  font-size: $font-xs;
  color: rgba(255, 255, 255, 0.25);
  letter-spacing: 2rpx;
}

.footer-legal {
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  max-width: 620rpx;
  padding: 0 16rpx;

  &__disclaimer {
    font-size: 20rpx;
    color: rgba(255, 255, 255, 0.35);
    text-align: center;
    line-height: 1.6;
  }

  &__links {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }

  &__link {
    font-size: 20rpx;
    color: rgba(255, 215, 0, 0.6);
    text-decoration: underline;
  }

  &__sep {
    font-size: 20rpx;
    color: rgba(255, 255, 255, 0.3);
  }
}
</style>
