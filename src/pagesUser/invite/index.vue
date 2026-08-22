<!--
  灵魂星图 - 邀请进度页
  查看已邀请人数、进度、奖励领取
-->
<template>
  <view class="invite-page">
    <view class="invite-page__hero">
      <text class="invite-page__title">✨ 邀请好友解锁</text>
      <text class="invite-page__subtitle">
        每邀请一位好友完成灵魂探索，你就能解锁一份新奖励
      </text>
    </view>

    <view class="invite-page__stat">
      <text class="invite-page__stat-num">{{ invited }}</text>
      <text class="invite-page__stat-label">位好友已完成测试</text>
    </view>

    <view class="invite-page__tiers">
      <view
        v-for="tier in tiers"
        :key="tier.key"
        class="tier-row"
        :class="{
          'tier-row--reached': invited >= tier.count,
          'tier-row--claimed': claimed.includes(tier.key),
        }"
      >
        <view class="tier-row__left">
          <view class="tier-row__badge">
            <text class="tier-row__badge-text">{{ tier.count }} 人</text>
          </view>
          <text class="tier-row__label">{{ tier.label }}</text>
        </view>
        <view class="tier-row__action">
          <view
            v-if="claimed.includes(tier.key)"
            class="tier-row__done"
          >
            <text class="tier-row__done-text">已解锁</text>
          </view>
          <view
            v-else-if="invited >= tier.count"
            class="tier-row__btn"
            @tap="handleClaim(tier.key)"
          >
            <text class="tier-row__btn-text">领取</text>
          </view>
          <text v-else class="tier-row__gap">
            还差 {{ tier.count - invited }} 人
          </text>
        </view>
      </view>
    </view>

    <view class="invite-page__code">
      <text class="invite-page__code-label">我的邀请码</text>
      <view class="invite-page__code-box" @tap="copyCode">
        <text class="invite-page__code-value">{{ myCode || '生成中...' }}</text>
        <text class="invite-page__code-copy">复制</text>
      </view>
    </view>

    <button class="invite-page__share" open-type="share" @tap="onShareTap">
      立即邀请好友
    </button>

    <text class="invite-page__note">
      被邀请的好友完成测试后，进度自动 +1；单日最多邀请 10 人。
    </text>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useInvite, REWARD_TIERS } from '@/composables/useInvite'
import { useTestStore } from '@/stores/test'
import { personalityTypes } from '@/data/results/types'
import { track, AnalyticsEvent, trackPageView } from '@/utils/analytics'

const invite = useInvite()
const testStore = useTestStore()

const tiers = REWARD_TIERS
const invited = computed(() => invite.invitedCount.value)
const claimed = computed(() => invite.claimedRewards.value)
const myCode = computed(() => invite.myInviteCode.value)

const personalityName = computed(() => {
  const t = testStore.result?.personalityType
  return (t && personalityTypes[t]?.name) || '你的星灵'
})

onLoad(() => {
  trackPageView('pagesUser/invite/index')
})

onMounted(async () => {
  invite.generateLocalInviteCode()
  await invite.loadProgress().catch(() => null)
})

async function handleClaim(key: string) {
  const ok = await invite.claimReward(key)
  uni.showToast({
    title: ok ? '奖励已解锁' : '领取失败',
    icon: ok ? 'success' : 'none',
  })
}

function copyCode() {
  if (!myCode.value) return
  uni.setClipboardData({
    data: myCode.value,
    success: () => uni.showToast({ title: '邀请码已复制', icon: 'success' }),
  })
}

function onShareTap() {
  invite.trackInviteSend()
}

/* 小程序页面级分享 */
// #ifdef MP-WEIXIN
defineExpose({
  onShareAppMessage() {
    const payload = invite.buildSharePayload(personalityName.value)
    track(AnalyticsEvent.SHARE_CLICK, { shareType: 'friend', from: 'invite_page' })
    return {
      title: payload.title,
      path: payload.path,
    }
  },
})
// #endif
</script>

<style lang="scss" scoped>
.invite-page {
  min-height: 100vh;
  padding: $spacing-xxl $spacing-xl 120rpx;
  background: $bg-gradient-star;

  &__hero {
    text-align: center;
    margin-bottom: $spacing-xxl;
  }

  &__title {
    display: block;
    font-size: 44rpx;
    font-weight: 800;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }

  &__subtitle {
    display: block;
    font-size: $font-sm;
    color: $text-secondary;
    line-height: 1.6;
  }

  &__stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-xl 0 $spacing-xxl;
    border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
    margin-bottom: $spacing-xxl;
  }

  &__stat-num {
    font-size: 96rpx;
    font-weight: 900;
    color: $accent-gold;
    line-height: 1;
  }

  &__stat-label {
    margin-top: $spacing-sm;
    font-size: $font-sm;
    color: $text-secondary;
  }

  &__tiers {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
    margin-bottom: $spacing-xxl;
  }

  &__code {
    padding: $spacing-lg;
    border-radius: $radius-xl;
    background: rgba(255, 255, 255, 0.04);
    border: 1rpx solid rgba(255, 255, 255, 0.08);
    margin-bottom: $spacing-xl;
  }

  &__code-label {
    display: block;
    font-size: $font-sm;
    color: $text-muted;
    margin-bottom: $spacing-sm;
  }

  &__code-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__code-value {
    font-size: 40rpx;
    font-weight: 700;
    color: $accent-gold;
    letter-spacing: 6rpx;
  }

  &__code-copy {
    font-size: $font-sm;
    color: $accent-blue;
    padding: 8rpx 20rpx;
    border-radius: $radius-full;
    border: 1rpx solid rgba(79, 195, 247, 0.3);
  }

  &__share {
    width: 100%;
    height: 96rpx;
    border-radius: $radius-full;
    background: linear-gradient(135deg, $accent-gold 0%, #ff9a3c 100%);
    color: #1a0533;
    font-size: $font-md;
    font-weight: 700;
    letter-spacing: 2rpx;
    box-shadow: 0 6rpx 20rpx rgba(255, 154, 60, 0.3);
    margin-bottom: $spacing-lg;
    border: none;
  }

  &__note {
    display: block;
    text-align: center;
    font-size: $font-xs;
    color: $text-muted;
    line-height: 1.6;
  }
}

.tier-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-lg;
  border-radius: $radius-lg;
  background: rgba(255, 255, 255, 0.03);
  border: 1rpx solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s ease;

  &--reached {
    border-color: rgba(255, 215, 0, 0.3);
    background: rgba(255, 215, 0, 0.08);
  }

  &--claimed {
    opacity: 0.6;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    flex: 1;
  }

  &__badge {
    padding: 6rpx 16rpx;
    border-radius: $radius-full;
    background: rgba(108, 60, 224, 0.2);
    border: 1rpx solid rgba(108, 60, 224, 0.3);
  }

  &__badge-text {
    font-size: 22rpx;
    color: $text-primary;
    letter-spacing: 2rpx;
  }

  &__label {
    font-size: $font-sm;
    color: $text-secondary;
    flex: 1;
    line-height: 1.5;
  }

  &__done {
    padding: 6rpx 20rpx;
    border-radius: $radius-full;
    background: rgba(79, 195, 247, 0.15);
  }

  &__done-text {
    font-size: 22rpx;
    color: $accent-blue;
  }

  &__btn {
    padding: 10rpx 30rpx;
    border-radius: $radius-full;
    background: linear-gradient(135deg, $accent-gold, #ff9a3c);

    &:active {
      transform: scale(0.95);
    }
  }

  &__btn-text {
    font-size: $font-sm;
    font-weight: 700;
    color: #1a0533;
  }

  &__gap {
    font-size: 22rpx;
    color: $text-muted;
  }
}
</style>
