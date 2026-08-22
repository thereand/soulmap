<!--
  灵魂星图 - 限时优惠组件
  在结果页付费墙上方展示，倒计时 + 价格动态切换 + CTA
-->
<template>
  <view v-if="!hidden" class="timed-offer" :class="{ 'timed-offer--final': isFinal }">
    <view class="timed-offer__badge">
      <text class="timed-offer__badge-text">{{ tierLabel }}</text>
    </view>

    <view class="timed-offer__price-row">
      <text class="timed-offer__price">¥{{ price.toFixed(1) }}</text>
      <text class="timed-offer__original">¥{{ originalPrice.toFixed(1) }}</text>
    </view>

    <view class="timed-offer__countdown">
      <text class="timed-offer__countdown-label">距优惠结束</text>
      <text class="timed-offer__countdown-value">{{ remainingText }}</text>
    </view>

    <view class="timed-offer__cta" @tap="handleTap">
      <text class="timed-offer__cta-text">立即以 ¥{{ price.toFixed(1) }} 解锁深度解读</text>
    </view>

    <text class="timed-offer__hint">
      {{ isFinal ? '最终特惠，错过恢复原价' : '错过本轮价格将上调' }}
    </text>
  </view>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useCountdown, DEFAULT_OFFER_TIERS, type OfferTier } from '@/composables/useCountdown'
import { track, AnalyticsEvent } from '@/utils/analytics'

const props = withDefaults(
  defineProps<{
    /** 作用域，通常用结果类型代码或订单标识 */
    scope?: string
    /** 自定义档位 */
    tiers?: OfferTier[]
    /** 是否强制隐藏 */
    hidden?: boolean
  }>(),
  {
    scope: 'default',
    tiers: () => DEFAULT_OFFER_TIERS,
    hidden: false,
  },
)

const emit = defineEmits<{
  purchase: [price: number, tierId: string]
  expire: []
}>()

const cd = useCountdown(props.scope, props.tiers)

// 挂载时立即开启倒计时
cd.start()

const price = computed(() => cd.currentTier.value.price)
const originalPrice = computed(() => cd.currentTier.value.originalPrice)
const remainingText = computed(() => cd.remainingText.value)
const tierLabel = computed(() => cd.currentTier.value.label || '限时优惠')
const isFinal = computed(() => cd.isFinalTier.value)

// 到期通知
watch(
  () => cd.isExpired.value,
  (v) => {
    if (v) emit('expire')
  },
)

function handleTap() {
  track(AnalyticsEvent.PAY_CLICK, {
    productType: 'report_unlock',
    price: price.value,
    tierId: cd.currentTier.value.id,
    remainingMs: cd.remainingMs.value,
  })
  emit('purchase', price.value, cd.currentTier.value.id)
}
</script>

<style lang="scss" scoped>
.timed-offer {
  position: relative;
  margin: 0 $spacing-xl $spacing-xl;
  padding: $spacing-xl;
  padding-top: 42rpx;
  border-radius: $radius-xl;
  background: linear-gradient(145deg, rgba(255, 215, 0, 0.12) 0%, rgba(108, 60, 224, 0.15) 100%);
  border: 1rpx solid rgba(255, 215, 0, 0.35);
  box-shadow: 0 12rpx 32rpx rgba(255, 215, 0, 0.08);
  overflow: visible;

  &--final {
    background: linear-gradient(145deg, rgba(255, 90, 90, 0.15) 0%, rgba(108, 60, 224, 0.15) 100%);
    border-color: rgba(255, 90, 90, 0.4);
  }

  &__badge {
    position: absolute;
    top: -20rpx;
    left: $spacing-lg;
    padding: 6rpx 20rpx;
    border-radius: $radius-full;
    background: linear-gradient(135deg, $accent-gold, #ff9a3c);
    box-shadow: 0 4rpx 12rpx rgba(255, 154, 60, 0.3);
  }

  &__badge-text {
    font-size: 22rpx;
    font-weight: 700;
    color: #1a0533;
    letter-spacing: 2rpx;
  }

  &__price-row {
    display: flex;
    align-items: baseline;
    gap: $spacing-md;
    margin-bottom: $spacing-md;
  }

  &__price {
    font-size: 60rpx;
    font-weight: 800;
    color: $accent-gold;
    letter-spacing: 2rpx;
  }

  &__original {
    font-size: $font-base;
    color: $text-muted;
    text-decoration: line-through;
  }

  &__countdown {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    margin-bottom: $spacing-lg;
  }

  &__countdown-label {
    font-size: $font-sm;
    color: $text-secondary;
  }

  &__countdown-value {
    font-size: $font-md;
    font-weight: 700;
    color: $accent-gold;
    letter-spacing: 2rpx;
  }

  &__cta {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 96rpx;
    border-radius: $radius-full;
    background: linear-gradient(135deg, $accent-gold 0%, #ff9a3c 100%);
    box-shadow: 0 8rpx 24rpx rgba(255, 154, 60, 0.35);
    transition: all 0.15s ease;

    &:active {
      transform: scale(0.98);
      opacity: 0.92;
    }
  }

  &__cta-text {
    font-size: $font-md;
    font-weight: 700;
    color: #1a0533;
    letter-spacing: 2rpx;
  }

  &__hint {
    display: block;
    margin-top: $spacing-md;
    text-align: center;
    font-size: $font-xs;
    color: $text-muted;
  }
}
</style>
