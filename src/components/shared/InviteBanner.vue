<!--
  灵魂星图 - 邀请引导横幅
  嵌入结果页付费墙下方，展示邀请进度与 CTA
-->
<template>
  <view class="invite-banner">
    <view class="invite-banner__header">
      <text class="invite-banner__title">🎁 邀请好友，免费解锁深度解读</text>
    </view>

    <view class="invite-banner__progress">
      <text class="invite-banner__count">已邀请 {{ invited }}/{{ targetCount }} 人</text>
      <view class="invite-banner__dots">
        <view
          v-for="i in targetCount"
          :key="'dot-' + i"
          class="invite-banner__dot"
          :class="{ 'invite-banner__dot--filled': i <= invited }"
        />
      </view>
    </view>

    <text class="invite-banner__desc">
      {{ hint }}
    </text>

    <view class="invite-banner__cta" @tap="handleInvite">
      <text class="invite-banner__cta-text">立即邀请好友</text>
    </view>

    <view
      v-if="canClaim"
      class="invite-banner__claim"
      @tap="handleClaim"
    >
      <text class="invite-banner__claim-text">领取奖励 →</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useInvite, REWARD_TIERS } from '@/composables/useInvite'

const props = withDefaults(
  defineProps<{
    /** 展示的目标档位（默认 3 人档） */
    targetCount?: number
    /** 用户人格名（用于分享标题） */
    personalityName?: string
    /** 用户 openid（若已知） */
    openid?: string
  }>(),
  {
    targetCount: 3,
    personalityName: '你的星灵',
    openid: '',
  },
)

const emit = defineEmits<{
  invite: [payload: { inviteCode: string; title: string; path: string }]
  claimed: [rewardKey: string]
}>()

const invite = useInvite()

const invited = computed(() => invite.invitedCount.value)

const targetTier = computed(() => {
  return REWARD_TIERS.find((t) => t.count === props.targetCount) || REWARD_TIERS[1]
})

const canClaim = computed(() => {
  return invited.value >= targetTier.value.count && !invite.hasClaimed(targetTier.value.key)
})

const hint = computed(() => {
  if (canClaim.value) return `已达标，点击领取「${targetTier.value.label}」`
  const remain = Math.max(0, targetTier.value.count - invited.value)
  return `再邀请 ${remain} 位好友即可${targetTier.value.label}`
})

onMounted(async () => {
  // 初始化本地邀请码，即便没登录也能生成
  invite.generateLocalInviteCode(props.openid)
  // 尝试从云端拉取真实进度
  await invite.loadProgress().catch(() => null)
})

function handleInvite() {
  invite.trackInviteSend()
  const payload = invite.buildSharePayload(props.personalityName)
  emit('invite', payload)
}

async function handleClaim() {
  const ok = await invite.claimReward(targetTier.value.key)
  if (ok) emit('claimed', targetTier.value.key)
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
  }

  &__title {
    font-size: $font-md;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: 2rpx;
  }

  &__progress {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-bottom: $spacing-sm;
  }

  &__count {
    font-size: $font-sm;
    color: $text-secondary;
  }

  &__dots {
    display: flex;
    gap: 10rpx;
  }

  &__dot {
    width: 22rpx;
    height: 22rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    border: 1rpx solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;

    &--filled {
      background: $accent-gold;
      border-color: $accent-gold;
      box-shadow: 0 0 8rpx rgba(255, 215, 0, 0.6);
    }
  }

  &__desc {
    display: block;
    font-size: $font-sm;
    color: $text-secondary;
    line-height: 1.6;
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

    &:active {
      transform: scale(0.98);
    }
  }

  &__cta-text {
    font-size: $font-md;
    font-weight: 700;
    color: #1a0533;
    letter-spacing: 2rpx;
  }

  &__claim {
    margin-top: $spacing-md;
    text-align: center;
  }

  &__claim-text {
    font-size: $font-sm;
    color: $accent-gold;
    letter-spacing: 2rpx;
  }
}
</style>
