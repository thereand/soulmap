<!--
  灵魂星图 - 付费墙组件
  报告目录预览 + 毛玻璃遮罩 + 解锁CTA + 社会认同 + 限时倒计时
-->
<template>
  <view class="paywall">
    <!-- 报告目录预览区域 -->
    <view class="paywall__preview">
      <text class="paywall__preview-title">📖 完整星灵解读目录</text>

      <view class="paywall__toc">
        <view
          v-for="(section, i) in sections"
          :key="'sec-' + i"
          class="paywall__toc-item"
        >
          <view class="paywall__toc-icon">
            <text class="paywall__toc-emoji">{{ section.icon }}</text>
          </view>
          <view class="paywall__toc-info">
            <text class="paywall__toc-name">{{ section.title }}</text>
            <text class="paywall__toc-desc">{{ section.desc }}</text>
          </view>
          <!-- 锁图标 -->
          <view class="paywall__toc-lock">
            <text class="paywall__lock-icon">🔒</text>
          </view>
        </view>
      </view>

      <!-- 毛玻璃遮罩 -->
      <view class="paywall__blur-overlay">
        <view class="paywall__blur-content">
          <text class="paywall__blur-text">完整解读已锁定</text>
          <text class="paywall__blur-sub">解锁后可查看深度分析</text>
        </view>
      </view>
    </view>

    <!-- 限时倒计时 -->
    <view class="paywall__countdown" v-if="timeLimit > 0">
      <text class="paywall__countdown-label">⏱ 限时特惠倒计时</text>
      <view class="paywall__countdown-timer">
        <view class="paywall__time-block">
          <text class="paywall__time-value">{{ countdownDisplay.minutes }}</text>
          <text class="paywall__time-unit">分</text>
        </view>
        <text class="paywall__time-sep">:</text>
        <view class="paywall__time-block">
          <text class="paywall__time-value">{{ countdownDisplay.seconds }}</text>
          <text class="paywall__time-unit">秒</text>
        </view>
      </view>
    </view>

    <!-- 价格区域 -->
    <view class="paywall__pricing">
      <view class="paywall__price-row">
        <text class="paywall__original" v-if="originalPrice > price">
          ¥{{ originalPrice }}
        </text>
        <view class="paywall__current-price">
          <text class="paywall__price-symbol">¥</text>
          <text class="paywall__price-value">{{ price }}</text>
        </view>
        <view class="paywall__discount-badge" v-if="originalPrice > price">
          <text class="paywall__discount-text">省{{ originalPrice - price }}元</text>
        </view>
      </view>
      <text class="paywall__price-note">
        30分钟内首次解锁享特惠价
      </text>
    </view>

    <!-- CTA 按钮 -->
    <view class="paywall__cta" @tap="handlePurchase">
      <view class="paywall__cta-btn">
        <text class="paywall__cta-text">解锁完整星灵解读 ¥{{ price }}</text>
        <view class="paywall__cta-shimmer" />
      </view>
    </view>

    <!-- 社会认同 -->
    <view class="paywall__social-proof">
      <view class="paywall__avatars">
        <view
          v-for="n in 5"
          :key="'av-' + n"
          class="paywall__avatar"
          :style="{ animationDelay: `${n * 0.2}s` }"
        >
          <text class="paywall__avatar-emoji">{{ avatarEmojis[n - 1] }}</text>
        </view>
      </view>
      <text class="paywall__proof-text">
        已有 {{ formattedCount }} 位同类型星灵解锁了深度解读
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

interface Props {
  /** 现价 */
  price: number
  /** 原价 */
  originalPrice: number
  /** 已购买人数 */
  purchaseCount: number
  /** 限时分钟数 */
  timeLimit: number
}

const props = withDefaults(defineProps<Props>(), {
  price: 9.9,
  originalPrice: 19.9,
  purchaseCount: 23847,
  timeLimit: 30,
})

const emit = defineEmits<{
  (e: 'purchase'): void
}>()

/** 报告目录结构 */
const sections = [
  { icon: '🧠', title: '深度性格分析', desc: '500字核心剖析' },
  { icon: '💫', title: '内心世界揭秘', desc: '你的灵魂深处' },
  { icon: '🤝', title: '社交风格解读', desc: '你的社交人格' },
  { icon: '💕', title: '恋爱风格指南', desc: '爱情中的你' },
  { icon: '💼', title: '职业发展建议', desc: '最适合你的方向' },
  { icon: '🌱', title: '成长路径规划', desc: '突破自我限制' },
]

/** 头像 emoji */
const avatarEmojis = ['🌟', '✨', '💫', '⭐', '🌙']

/** 倒计时剩余秒数 */
const remainingSeconds = ref(props.timeLimit * 60)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

/** 倒计时显示 */
const countdownDisplay = computed(() => {
  const mins = Math.floor(remainingSeconds.value / 60)
  const secs = remainingSeconds.value % 60
  return {
    minutes: String(mins).padStart(2, '0'),
    seconds: String(secs).padStart(2, '0'),
  }
})

/** 格式化购买人数 */
const formattedCount = computed(() => {
  return props.purchaseCount.toLocaleString()
})

/** 处理购买点击 */
function handlePurchase() {
  emit('purchase')
}
</script>

<style lang="scss" scoped>
.paywall {
  width: 100%;
  padding: $spacing-xl 0;

  /* ===== 预览区域 ===== */
  &__preview {
    position: relative;
    background: linear-gradient(
      145deg,
      rgba(26, 5, 51, 0.6) 0%,
      rgba(13, 1, 24, 0.8) 100%
    );
    border-radius: $radius-xl;
    border: 1rpx solid rgba(255, 255, 255, 0.06);
    padding: $spacing-xl;
    overflow: hidden;
  }

  &__preview-title {
    font-size: $font-lg;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: $spacing-lg;
    display: block;
  }

  /* 目录列表 */
  &__toc {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  &__toc-item {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-md;
    border-radius: $radius-md;
    background: rgba(255, 255, 255, 0.03);
  }

  &__toc-icon {
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    background: rgba(108, 60, 224, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__toc-emoji {
    font-size: 28rpx;
  }

  &__toc-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  &__toc-name {
    font-size: $font-base;
    font-weight: 600;
    color: $text-primary;
  }

  &__toc-desc {
    font-size: $font-xs;
    color: $text-muted;
  }

  &__toc-lock {
    flex-shrink: 0;
  }

  &__lock-icon {
    font-size: 24rpx;
    opacity: 0.5;
  }

  /* 毛玻璃遮罩 */
  &__blur-overlay {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 55%;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    background: linear-gradient(
      to bottom,
      rgba(13, 1, 24, 0) 0%,
      rgba(13, 1, 24, 0.7) 20%,
      rgba(13, 1, 24, 0.92) 100%
    );
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__blur-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-xs;
  }

  &__blur-text {
    font-size: $font-md;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    letter-spacing: 4rpx;
  }

  &__blur-sub {
    font-size: $font-sm;
    color: rgba(255, 255, 255, 0.4);
  }

  /* ===== 倒计时 ===== */
  &__countdown {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-sm;
    margin-top: $spacing-xl;
  }

  &__countdown-label {
    font-size: $font-sm;
    color: $text-secondary;
  }

  &__countdown-timer {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
  }

  &__time-block {
    display: flex;
    align-items: baseline;
    gap: 4rpx;
  }

  &__time-value {
    font-size: $font-xl;
    font-weight: 800;
    color: #ff6b6b;
    min-width: 60rpx;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  &__time-unit {
    font-size: $font-xs;
    color: $text-muted;
  }

  &__time-sep {
    font-size: $font-xl;
    font-weight: 800;
    color: #ff6b6b;
  }

  /* ===== 价格区域 ===== */
  &__pricing {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-xs;
    margin-top: $spacing-xl;
  }

  &__price-row {
    display: flex;
    align-items: baseline;
    gap: $spacing-sm;
  }

  &__original {
    font-size: $font-base;
    color: $text-muted;
    text-decoration: line-through;
  }

  &__current-price {
    display: flex;
    align-items: baseline;
  }

  &__price-symbol {
    font-size: $font-lg;
    font-weight: 700;
    color: $accent-gold;
  }

  &__price-value {
    font-size: $font-hero;
    font-weight: 900;
    color: $accent-gold;
    line-height: 1;
    letter-spacing: -4rpx;
  }

  &__discount-badge {
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    padding: 4rpx 14rpx;
    border-radius: $radius-full;
  }

  &__discount-text {
    font-size: $font-xs;
    font-weight: 700;
    color: #fff;
  }

  &__price-note {
    font-size: $font-xs;
    color: $text-muted;
  }

  /* ===== CTA 按钮 ===== */
  &__cta {
    margin-top: $spacing-xl;
    padding: 0 $spacing-xl;
  }

  &__cta-btn {
    position: relative;
    width: 100%;
    height: 100rpx;
    border-radius: $radius-full;
    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-shadow:
      0 8rpx 32rpx rgba(255, 215, 0, 0.3),
      0 2rpx 8rpx rgba(255, 170, 0, 0.4);
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:active {
      transform: scale(0.97);
      box-shadow: 0 4rpx 16rpx rgba(255, 215, 0, 0.2);
    }
  }

  &__cta-text {
    font-size: $font-md;
    font-weight: 800;
    color: #1a0533;
    letter-spacing: 2rpx;
    position: relative;
    z-index: 2;
  }

  &__cta-shimmer {
    position: absolute;
    top: 0;
    left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    animation: shimmerSlide 3s ease-in-out infinite;
  }

  /* ===== 社会认同 ===== */
  &__social-proof {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-sm;
    margin-top: $spacing-lg;
    padding: 0 $spacing-xl;
  }

  &__avatars {
    display: flex;
    gap: -8rpx;
  }

  &__avatar {
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    background: rgba(108, 60, 224, 0.2);
    border: 2rpx solid rgba(108, 60, 224, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: -10rpx;
    animation: avatarPulse 2s ease-in-out infinite;

    &:first-child {
      margin-left: 0;
    }
  }

  &__avatar-emoji {
    font-size: 24rpx;
  }

  &__proof-text {
    font-size: $font-xs;
    color: $text-muted;
    text-align: center;
    line-height: 1.6;
  }
}

@keyframes shimmerSlide {
  0% { left: -100%; }
  50% { left: 150%; }
  100% { left: 150%; }
}

@keyframes avatarPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}
</style>
