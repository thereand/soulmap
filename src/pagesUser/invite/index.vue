<!--
  人格星图 - 邀请进度页
  查看已邀请人数、进度、奖励领取
-->
<template>
  <view class="invite-page">
    <view class="invite-page__hero">
      <text class="invite-page__title">✨ 邀请好友解锁</text>
      <text class="invite-page__subtitle">
        每邀请一位好友完成人格探索，你就能解锁一份新奖励
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
        <view class="tier-row__head">
          <view class="tier-row__badge" :style="{ background: tierColor(tier.count) + '22', borderColor: tierColor(tier.count) + '55' }">
            <text class="tier-row__badge-text" :style="{ color: tierColor(tier.count) }">{{ tier.count }} 人</text>
          </view>
          <text class="tier-row__label">{{ tier.label }}</text>
        </view>

        <view class="tier-row__progress">
          <view class="tier-row__track">
            <view
              class="tier-row__fill"
              :style="{
                width: Math.min(100, (Math.min(invited, tier.count) / tier.count) * 100) + '%',
                background: tierColor(tier.count),
              }"
            />
          </view>
          <text class="tier-row__progress-text">{{ Math.min(invited, tier.count) }}/{{ tier.count }}</text>
        </view>

        <view class="tier-row__action">
          <view
            v-if="claimed.includes(tier.key)"
            class="tier-row__done"
          >
            <text class="tier-row__done-text">✓ 已解锁</text>
          </view>
          <view
            v-else-if="invited >= tier.count"
            class="tier-row__btn"
            :style="{ background: `linear-gradient(135deg, ${tierColor(tier.count)}, ${tierColor(tier.count)}cc)` }"
            @tap="handleClaim(tier.key)"
          >
            <text class="tier-row__btn-text">立即领取</text>
          </view>
          <text v-else class="tier-row__gap">
            还差 {{ tier.count - invited }} 人
          </text>
        </view>
      </view>
    </view>

    <!-- 最近邀请列表 -->
    <view class="invite-page__recent">
      <text class="invite-page__recent-title">最近邀请</text>

      <view v-if="recentLoading" class="recent__loading">
        <text class="recent__loading-text">加载中...</text>
      </view>

      <view v-else-if="recentList.length === 0" class="recent__empty">
        <text class="recent__empty-emoji">🌟</text>
        <text class="recent__empty-text">还没有好友完成测试</text>
        <text class="recent__empty-hint">点击下方按钮邀请第一位好友</text>
      </view>

      <view v-else class="recent__list">
        <view v-for="(item, i) in recentList" :key="'r-' + i" class="recent__item">
          <view class="recent__avatar">
            <text class="recent__avatar-text">{{ avatarLetterOf(item) }}</text>
          </view>
          <view class="recent__body">
            <text class="recent__name">{{ item.nickname || '星旅者' }}</text>
            <text class="recent__time">{{ item.completedAt ? formatDate(item.completedAt) : '' }} 完成测试</text>
          </view>
          <text v-if="item.personalityType" class="recent__type">{{ item.personalityType }}</text>
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
import { callCloud } from '@/services/cloud'
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

/** 最近邀请列表状态 */
const recentLoading = ref(false)
const recentList = ref<any[]>([])

onLoad(() => {
  trackPageView('pagesUser/invite/index')
})

onMounted(async () => {
  invite.generateLocalInviteCode()
  await invite.loadProgress().catch(() => null)
  await loadRecent().catch(() => null)
})

async function loadRecent() {
  recentLoading.value = true
  try {
    const res = await callCloud<{ list: any[] }>('invite', { action: 'getInviteList' })
    if (res.success && Array.isArray(res.data?.list)) {
      recentList.value = res.data.list
    }
  } finally {
    recentLoading.value = false
  }
}

function tierColor(count: number): string {
  if (count === 1) return '#4fc3f7'
  if (count === 3) return '#ffd700'
  return '#a855f7'
}

function avatarLetterOf(item: any): string {
  return (item.nickname || '星').slice(0, 1)
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  const now = new Date()
  return d.getFullYear() === now.getFullYear()
    ? `${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
    : `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

async function handleClaim(key: string) {
  const ok = await invite.claimReward(key)
  uni.showToast({
    title: ok ? '奖励已解锁' : '领取失败',
    icon: ok ? 'success' : 'none',
  })
  if (ok) track(AnalyticsEvent.INVITE_COMPLETE, { rewardKey: key, source: 'invite_page' })
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
  flex-direction: column;
  gap: $spacing-sm;
  padding: $spacing-lg;
  border-radius: $radius-lg;
  background: rgba(255, 255, 255, 0.03);
  border: 1rpx solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s ease;

  &--reached {
    border-color: rgba(255, 215, 0, 0.3);
    background: rgba(255, 215, 0, 0.06);
  }

  &--claimed {
    opacity: 0.7;
  }

  &__head {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  &__badge {
    padding: 6rpx 18rpx;
    border-radius: $radius-full;
    border: 1rpx solid;
    flex-shrink: 0;
  }

  &__badge-text {
    font-size: 22rpx;
    font-weight: 700;
    letter-spacing: 2rpx;
  }

  &__label {
    font-size: $font-sm;
    color: $text-secondary;
    flex: 1;
    line-height: 1.5;
  }

  &--reached &__label {
    color: $text-primary;
    font-weight: 600;
  }

  &__progress {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__track {
    flex: 1;
    height: 10rpx;
    border-radius: 10rpx;
    background: rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: 10rpx;
    transition: width 0.6s ease;
  }

  &__progress-text {
    font-size: $font-xs;
    color: $text-muted;
    width: 70rpx;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  &__action {
    display: flex;
    justify-content: flex-end;
  }

  &__done {
    padding: 8rpx 22rpx;
    border-radius: $radius-full;
    background: rgba(76, 175, 80, 0.15);
    border: 1rpx solid rgba(76, 175, 80, 0.3);
  }

  &__done-text {
    font-size: 22rpx;
    color: #66bb6a;
    font-weight: 600;
  }

  &__btn {
    padding: 10rpx 30rpx;
    border-radius: $radius-full;
    box-shadow: 0 4rpx 12rpx rgba(255, 215, 0, 0.3);

    &:active { transform: scale(0.95); }
  }

  &__btn-text {
    font-size: $font-sm;
    font-weight: 700;
    color: #1a0533;
    letter-spacing: 2rpx;
  }

  &__gap {
    font-size: 22rpx;
    color: $text-muted;
    padding: 8rpx 22rpx;
  }
}

/* ===== 最近邀请 ===== */
.invite-page__recent {
  padding: $spacing-lg;
  border-radius: $radius-xl;
  background: rgba(255, 255, 255, 0.04);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  margin-bottom: $spacing-xl;

  &__recent-title {
    display: block;
    font-size: $font-md;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: $spacing-md;
    letter-spacing: 2rpx;
  }
}

.recent {
  &__loading, &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-xl 0;
    gap: $spacing-xs;
  }

  &__loading-text, &__empty-text {
    font-size: $font-sm;
    color: $text-secondary;
  }

  &__empty-emoji { font-size: 56rpx; }

  &__empty-hint {
    font-size: $font-xs;
    color: $text-muted;
    margin-top: $spacing-xs;
  }

  &__list { display: flex; flex-direction: column; }

  &__item {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md 0;
    border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
    &:last-child { border-bottom: none; }
  }

  &__avatar {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(108, 60, 224, 0.4), rgba(79, 195, 247, 0.3));
    border: 2rpx solid rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__avatar-text {
    font-size: $font-md;
    font-weight: 700;
    color: $text-primary;
  }

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
    min-width: 0;
  }

  &__name {
    font-size: $font-base;
    font-weight: 600;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__time {
    font-size: $font-xs;
    color: $text-muted;
  }

  &__type {
    font-size: $font-xs;
    font-weight: 700;
    color: $accent-gold;
    letter-spacing: 2rpx;
    padding: 4rpx 14rpx;
    border-radius: $radius-full;
    background: rgba(255, 215, 0, 0.1);
    border: 1rpx solid rgba(255, 215, 0, 0.25);
  }
}
</style>
