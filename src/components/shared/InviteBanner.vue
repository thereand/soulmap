<!--
  灵魂星图 - 邀请引导横幅（完整版）
  展示全部 3 档奖励：1 人 / 3 人 / 5 人，进度点 + 单独领取按钮
-->
<template>
  <view class="invite-banner">
    <!-- 标题 -->
    <view class="invite-banner__header">
      <text class="invite-banner__title">🎁 邀请好友，免费解锁深度内容</text>
      <text class="invite-banner__subtitle">好友完成测试即计入进度</text>
    </view>

    <!-- 进度总览 -->
    <view class="invite-banner__summary">
      <text class="invite-banner__count">已邀请</text>
      <text class="invite-banner__count-num">{{ invited }}</text>
      <text class="invite-banner__count">位好友</text>
    </view>

    <!-- 三档奖励 -->
    <view class="invite-banner__tiers">
      <view
        v-for="tier in tiers"
        :key="tier.key"
        class="tier"
        :class="{
          'tier--reached': hasReached(tier.count),
          'tier--claimed': hasClaimed(tier.key),
        }"
      >
        <view class="tier__progress">
          <view class="tier__dots">
            <view
              v-for="i in tier.count"
              :key="'dot-' + i"
              class="tier__dot"
              :class="{ 'tier__dot--filled': i <= invited }"
            />
          </view>
          <text class="tier__count-label">{{ tier.count }} 人</text>
        </view>

        <text class="tier__label">{{ tier.label }}</text>

        <!-- 状态按钮 -->
        <view v-if="hasClaimed(tier.key)" class="tier__state tier__state--claimed">
          <text class="tier__state-text">✓ 已领取</text>
        </view>
        <view
          v-else-if="hasReached(tier.count)"
          class="tier__state tier__state--claimable"
          @tap.stop="handleClaim(tier.key)"
        >
          <text class="tier__state-text">立即领取</text>
        </view>
        <view v-else class="tier__state tier__state--locked">
          <text class="tier__state-text">未达标</text>
        </view>
      </view>
    </view>

    <!-- CTA -->
    <view class="invite-banner__cta" @tap="handleInvite">
      <text class="invite-banner__cta-text">立即邀请好友</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useInvite, REWARD_TIERS, type InviteProgress } from '@/composables/useInvite'

const props = withDefaults(
  defineProps<{
    /** 用户人格名（用于分享标题） */
    personalityName?: string
    /** 用户 openid（若已知） */
    openid?: string
  }>(),
  {
    personalityName: '你的星灵',
    openid: '',
  },
)

const emit = defineEmits<{
  invite: [payload: { inviteCode: string; title: string; path: string; h5Link?: string }]
  claimed: [rewardKey: string]
}>()

const invite = useInvite()
const tiers = REWARD_TIERS

const invited = computed(() => invite.invitedCount.value)

function hasReached(count: number): boolean {
  return invite.hasReached(count)
}

function hasClaimed(key: string): boolean {
  return invite.hasClaimed(key)
}

onMounted(async () => {
  invite.generateLocalInviteCode(props.openid)
  await invite.loadProgress().catch(() => null)
})

function handleInvite() {
  invite.trackInviteSend()
  const payload = invite.buildSharePayload(props.personalityName)
  emit('invite', payload)
}

async function handleClaim(rewardKey: string) {
  const ok = await invite.claimReward(rewardKey)
  if (ok) emit('claimed', rewardKey)
  uni.showToast({
    title: ok ? '奖励已解锁' : '领取失败，稍后重试',
    icon: ok ? 'success' : 'none',
    duration: 2000,
  })
}
</script>

<style lang="scss" scoped>
.invite-banner {
  margin: 0 $spacing-xl $spacing-xl;
  padding: $spacing-xl;
  border-radius: $radius-xl;
  background: linear-gradient(145deg, rgba(79, 195, 247, 0.12) 0%, rgba(108, 60, 224, 0.15) 100%);
  border: 1rpx solid rgba(79, 195, 247, 0.3);

  &__header {
    margin-bottom: $spacing-md;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  &__title {
    font-size: $font-md;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: 2rpx;
  }

  &__subtitle {
    font-size: $font-xs;
    color: $text-muted;
    letter-spacing: 1rpx;
  }

  &__summary {
    display: flex;
    align-items: baseline;
    gap: 8rpx;
    padding: $spacing-md 0;
    border-top: 1rpx solid rgba(255, 255, 255, 0.06);
    border-bottom: 1rpx solid rgba(255, 255, 255, 0.06);
    margin-bottom: $spacing-md;
  }

  &__count {
    font-size: $font-sm;
    color: $text-secondary;
  }

  &__count-num {
    font-size: $font-xxl;
    font-weight: 900;
    color: $accent-gold;
    letter-spacing: 2rpx;
  }

  &__tiers {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    margin-bottom: $spacing-lg;
  }

  &__cta {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 84rpx;
    border-radius: $radius-full;
    background: linear-gradient(135deg, $accent-gold 0%, #ff9a3c 100%);
    box-shadow: 0 6rpx 18rpx rgba(255, 154, 60, 0.3);
    transition: all 0.15s ease;

    &:active { transform: scale(0.98); }
  }

  &__cta-text {
    font-size: $font-md;
    font-weight: 700;
    color: #1a0533;
    letter-spacing: 2rpx;
  }
}

/* ===== 奖励档位 ===== */
.tier {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  border-radius: $radius-lg;
  background: rgba(255, 255, 255, 0.03);
  border: 1rpx solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;

  &--reached {
    background: rgba(255, 215, 0, 0.05);
    border-color: rgba(255, 215, 0, 0.2);
  }

  &--claimed {
    opacity: 0.75;
  }

  &__progress {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rpx;
    flex-shrink: 0;
    width: 120rpx;
  }

  &__dots {
    display: flex;
    gap: 6rpx;
  }

  &__dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    border: 1rpx solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;

    &--filled {
      background: $accent-gold;
      border-color: $accent-gold;
      box-shadow: 0 0 6rpx rgba(255, 215, 0, 0.6);
    }
  }

  &__count-label {
    font-size: 20rpx;
    color: $text-muted;
    letter-spacing: 1rpx;
  }

  &__label {
    flex: 1;
    font-size: $font-sm;
    color: $text-secondary;
    line-height: 1.5;
  }

  &--reached &__label {
    color: $text-primary;
    font-weight: 600;
  }

  &__state {
    flex-shrink: 0;
    padding: 8rpx 18rpx;
    border-radius: $radius-full;
    min-width: 120rpx;
    text-align: center;

    &--claimable {
      background: linear-gradient(135deg, $accent-gold, $accent-gold-dark);
      box-shadow: 0 4rpx 12rpx rgba(255, 215, 0, 0.3);

      &:active { transform: scale(0.95); }
    }

    &--claimed {
      background: rgba(76, 175, 80, 0.15);
      border: 1rpx solid rgba(76, 175, 80, 0.3);
    }

    &--locked {
      background: rgba(255, 255, 255, 0.04);
      border: 1rpx solid rgba(255, 255, 255, 0.08);
    }
  }

  &__state-text {
    font-size: 22rpx;
    font-weight: 600;
    letter-spacing: 1rpx;
  }

  &__state--claimable &__state-text { color: #1a0533; }
  &__state--claimed &__state-text { color: #66bb6a; }
  &__state--locked &__state-text { color: $text-muted; }
}
</style>
