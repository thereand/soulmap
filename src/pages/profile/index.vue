<!--
  灵魂星图 - 个人中心页（tabBar 页面）
  枢纽页：用户信息 + 测试统计 + 功能入口 + 星灵图鉴 + 邀请 + 客服/协议 + 账号操作
-->
<template>
  <view class="page-profile">
    <scroll-view scroll-y class="profile-scroll" :style="{ height: '100vh' }">
      <!-- ===== Hero 区 ===== -->
      <view class="hero">
        <view class="hero__bg" />
        <view class="hero__content">
          <view class="hero__avatar" :style="avatarStyle">
            <image
              v-if="userStore.avatarUrl"
              class="hero__avatar-img"
              :src="userStore.avatarUrl"
              mode="aspectFill"
            />
            <text v-else class="hero__avatar-letter">{{ avatarLetter }}</text>
          </view>
          <text class="hero__nickname">{{ userStore.nickname }}</text>
          <view v-if="latestType" class="hero__badge" :style="{ background: latestTypeColor + '22', borderColor: latestTypeColor }">
            <text class="hero__badge-text" :style="{ color: latestTypeColor }">
              {{ latestType }} · {{ latestTypeName }}
            </text>
          </view>
          <text v-else class="hero__hint">还没有测试结果，去做一次测试吧</text>
        </view>
      </view>

      <!-- ===== 统计条 ===== -->
      <view class="stats">
        <view class="stats__item">
          <text class="stats__num">{{ history.length }}</text>
          <text class="stats__label">测试次数</text>
        </view>
        <view class="stats__sep" />
        <view class="stats__item">
          <text class="stats__num">{{ atlas.unlockedCount.value }}/{{ atlas.totalCards.value }}</text>
          <text class="stats__label">图鉴收集</text>
        </view>
        <view class="stats__sep" />
        <view class="stats__item">
          <text class="stats__num">{{ atlas.completionRate.value }}%</text>
          <text class="stats__label">完成度</text>
        </view>
      </view>

      <!-- ===== 最近一次测试 ===== -->
      <view v-if="latestType" class="card latest">
        <view class="card__header">
          <text class="card__title">最近测试</text>
          <text class="card__date">{{ formatDate(latestCompletedAt) }}</text>
        </view>

        <view class="latest__row">
          <view class="latest__type" :style="{ borderColor: latestTypeColor + '55' }">
            <text class="latest__type-code" :style="{ color: latestTypeColor }">{{ latestType }}</text>
            <text class="latest__type-name">{{ latestTypeName }}</text>
          </view>
          <view class="latest__bars">
            <view v-for="dim in dimensionDetails" :key="dim.key" class="dim-row">
              <text class="dim-row__label">{{ dim.label }}</text>
              <view class="dim-row__track">
                <view
                  class="dim-row__fill"
                  :style="{
                    width: dim.pct + '%',
                    background: `linear-gradient(90deg, ${latestTypeColor}88, ${latestTypeColor})`,
                  }"
                />
              </view>
              <text class="dim-row__value">{{ dim.pct }}%</text>
            </view>
          </view>
        </view>

        <view class="latest__actions">
          <view class="btn btn--ghost" @tap="goResult">
            <text class="btn__text">查看完整结果</text>
          </view>
          <view class="btn btn--primary" @tap="goRetake">
            <text class="btn__text">重新测试</text>
          </view>
        </view>
      </view>

      <!-- ===== 探索入口 ===== -->
      <view class="card menu">
        <view class="card__header">
          <text class="card__title">探索</text>
        </view>

        <view class="menu__item" @tap="goAtlas">
          <text class="menu__icon">📖</text>
          <view class="menu__body">
            <text class="menu__label">星灵图鉴</text>
            <text class="menu__desc">已收集 {{ atlas.unlockedCount.value }}/{{ atlas.totalCards.value }}</text>
          </view>
          <text class="menu__arrow">→</text>
        </view>

        <view class="menu__item" @tap="goHistory">
          <text class="menu__icon">📜</text>
          <view class="menu__body">
            <text class="menu__label">测试历史</text>
            <text class="menu__desc">{{ history.length ? `共 ${history.length} 次` : '暂无记录' }}</text>
          </view>
          <text class="menu__arrow">→</text>
        </view>

        <view class="menu__item" @tap="goStats">
          <text class="menu__icon">📊</text>
          <view class="menu__body">
            <text class="menu__label">数据报表</text>
            <text class="menu__desc">MBTI 分布 / 维度均值 / 时长趋势</text>
          </view>
          <text class="menu__arrow">→</text>
        </view>
      </view>

      <!-- ===== 社交入口 ===== -->
      <view class="card menu">
        <view class="card__header">
          <text class="card__title">社交</text>
        </view>

        <view class="menu__item" @tap="goInvite">
          <text class="menu__icon">💫</text>
          <view class="menu__body">
            <text class="menu__label">邀请好友</text>
            <text class="menu__desc">
              {{ invite.invitedCount.value ? `已邀请 ${invite.invitedCount.value} 位，继续邀请解锁奖励` : '邀请好友一起测灵魂契合度' }}
            </text>
          </view>
          <text class="menu__arrow">→</text>
        </view>
      </view>

      <!-- ===== 支持与协议 ===== -->
      <view class="card menu">
        <view class="card__header">
          <text class="card__title">支持</text>
        </view>

        <!-- 客服反馈：小程序用 open-type="contact"，H5 用邮箱链接 -->
        <!-- #ifdef MP-WEIXIN -->
        <button class="menu__item menu__item--button" open-type="contact">
          <text class="menu__icon">💬</text>
          <view class="menu__body">
            <text class="menu__label">意见反馈</text>
            <text class="menu__desc">联系开发者，3 个工作日内回复</text>
          </view>
          <text class="menu__arrow">→</text>
        </button>
        <!-- #endif -->
        <!-- #ifdef H5 -->
        <view class="menu__item" @tap="handleFeedback">
          <text class="menu__icon">💬</text>
          <view class="menu__body">
            <text class="menu__label">意见反馈</text>
            <text class="menu__desc">发送邮件至开发者邮箱</text>
          </view>
          <text class="menu__arrow">→</text>
        </view>
        <!-- #endif -->

        <view class="menu__item" @tap="openPrivacy">
          <text class="menu__icon">🔒</text>
          <view class="menu__body">
            <text class="menu__label">隐私政策</text>
            <text class="menu__desc">查看我们如何保护你的数据</text>
          </view>
          <text class="menu__arrow">→</text>
        </view>

        <view class="menu__item" @tap="openTerms">
          <text class="menu__icon">📄</text>
          <view class="menu__body">
            <text class="menu__label">用户协议</text>
            <text class="menu__desc">使用须知、付费与退款条款</text>
          </view>
          <text class="menu__arrow">→</text>
        </view>
      </view>

      <!-- ===== 账号操作 ===== -->
      <view class="card account">
        <view v-if="history.length > 0" class="account__row" @tap="handleClearHistory">
          <text class="account__label">清除本地测试记录</text>
          <text class="account__hint">不会影响云端数据</text>
        </view>
        <view class="account__row" @tap="handleLogout">
          <text class="account__label">退出登录</text>
          <text class="account__hint">清除本地账号信息</text>
        </view>
      </view>

      <!-- 版本号 -->
      <view class="version">
        <text class="version__text">宁好星图 · v2.0.3</text>
      </view>

      <view class="safe-bottom" />
    </scroll-view>

    <!-- 底部 iOS 风格 tabBar -->
    <CustomTabBar />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { useTestStore } from '@/stores/test'
import { useAtlas } from '@/composables/useAtlas'
import { useInvite } from '@/composables/useInvite'
import { personalityTypes } from '@/data/results/types'
import CustomTabBar from '@/components/shared/CustomTabBar.vue'
import { useTabBar } from '@/composables/useTabBar'
import type { MBTIType } from '@/types/test'

const userStore = useUserStore()
const testStore = useTestStore()
const atlas = useAtlas()
const invite = useInvite()
const { setActive } = useTabBar()

/** 测试历史（本地，最多 50 条） */
const history = ref<any[]>([])

/** 加载数据 */
function loadData() {
  history.value = testStore.getHistory()
  atlas.loadUnlocked()
}

onLoad(() => {
  console.log('[Page] 个人中心加载')
})

onShow(() => {
  // 每次页面显示时刷新数据（从其他页面返回时自动更新）
  loadData()
  // 同步 tabBar 选中态到"我的"
  setActive(2)
})

onMounted(() => {
  loadData()
  // 拉取邀请进度（用于菜单描述）
  invite.generateLocalInviteCode()
  invite.loadProgress().catch(() => null)
  // 静默登录（如果未登录）
  if (!userStore.isLoggedIn) {
    userStore.login().catch(() => null)
  }
})

/* ===== 派生数据 ===== */

const avatarLetter = computed(() => {
  const n = userStore.nickname || '星'
  return n.slice(0, 1)
})

const avatarStyle = computed(() => {
  const color = latestTypeColor.value
  return {
    background: userStore.avatarUrl
      ? 'transparent'
      : `radial-gradient(circle at 30% 30%, ${color}cc, ${color}44)`,
    border: `2rpx solid ${color}88`,
  }
})

const latestType = computed<MBTIType | null>(() => {
  const r = testStore.result
  if (r) return r.personalityType
  if (history.value.length > 0) return history.value[0].personalityType
  return userStore.latestType ?? null
})

const latestCompletedAt = computed<number>(() => {
  const r = testStore.result
  if (r) return r.completedAt
  if (history.value.length > 0) return history.value[0].completedAt
  return 0
})

const latestTypeColor = computed(() => {
  const code = latestType.value
  if (!code) return '#6c3ce0'
  return personalityTypes[code]?.color || '#6c3ce0'
})

const latestTypeName = computed(() => {
  const code = latestType.value
  if (!code) return ''
  return personalityTypes[code]?.name || code
})

const dimensionDetails = computed(() => {
  const conf = testStore.result?.confidence
  const scores = testStore.result?.dimensionScores
  if (!conf || !scores) {
    // 回退到历史记录
    const latest = history.value[0]
    if (!latest?.confidence || !latest.dimensionScores) return []
    return buildDims(latest.dimensionScores, latest.confidence)
  }
  return buildDims(scores, conf)
})

function buildDims(scores: any, conf: any) {
  return [
    { key: 'EI', label: scores.EI > 50 ? '外向 E' : '内向 I', pct: Math.round(conf.EI * 100) },
    { key: 'SN', label: scores.SN > 50 ? '感觉 S' : '直觉 N', pct: Math.round(conf.SN * 100) },
    { key: 'TF', label: scores.TF > 50 ? '思维 T' : '情感 F', pct: Math.round(conf.TF * 100) },
    { key: 'JP', label: scores.JP > 50 ? '判断 J' : '知觉 P', pct: Math.round(conf.JP * 100) },
  ]
}

function formatDate(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

/* ===== 导航操作 ===== */

function goResult() {
  uni.navigateTo({ url: '/pagesTest/result/index' })
}

function goRetake() {
  uni.navigateTo({ url: '/pagesTest/intro/index' })
}

function goAtlas() {
  uni.navigateTo({ url: '/pagesUser/atlas/index' })
}

/** 跳转到历史页（tabBar 页面，使用 switchTab） */
function goHistory() {
  uni.switchTab({ url: '/pages/history/index' })
}

function goStats() {
  uni.navigateTo({ url: '/pagesUser/stats/index' })
}

function goInvite() {
  uni.navigateTo({ url: '/pagesUser/invite/index' })
}

function openPrivacy() {
  uni.navigateTo({ url: '/pagesUser/legal/index?type=privacy' })
}

function openTerms() {
  uni.navigateTo({ url: '/pagesUser/legal/index?type=terms' })
}

/** H5 端：意见反馈（打开邮箱） */
function handleFeedback() {
  // #ifdef H5
  window.location.href = 'mailto:support@soulmap.app?subject=意见反馈'
  // #endif
}

/* ===== 账号操作 ===== */

function handleClearHistory() {
  uni.showModal({
    title: '清除测试记录',
    content: '将清除本机的所有测试历史记录，无法恢复。是否继续？',
    confirmText: '清除',
    confirmColor: '#ff6b6b',
    success: (res) => {
      if (res.confirm) {
        testStore.clearHistory()
        history.value = []
        uni.showToast({ title: '记录已清除', icon: 'success' })
      }
    },
  })
}

function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '将清除本机登录信息，但不会影响云端数据。是否继续？',
    confirmText: '退出',
    confirmColor: '#ff6b6b',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({ title: '已退出', icon: 'success' })
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.page-profile {
  min-height: 100vh;
  background: $bg-gradient-star;
}

.profile-scroll {
  position: relative;
  z-index: 1;
}

/* ===== Hero ===== */
.hero {
  position: relative;
  padding: $spacing-xxl $spacing-xl $spacing-lg;
  overflow: hidden;

  &__bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse at 50% -10%,
      rgba(108, 60, 224, 0.35) 0%,
      transparent 60%
    );
    pointer-events: none;
  }

  &__content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-sm;
  }

  &__avatar {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.5);
    overflow: hidden;
  }

  &__avatar-img {
    width: 100%;
    height: 100%;
  }

  &__avatar-letter {
    font-size: 60rpx;
    font-weight: 800;
    color: #fff;
  }

  &__nickname {
    font-size: $font-xl;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: 2rpx;
    margin-top: $spacing-xs;
  }

  &__badge {
    padding: 6rpx 20rpx;
    border-radius: $radius-full;
    border: 1rpx solid;
  }

  &__badge-text {
    font-size: $font-sm;
    font-weight: 600;
    letter-spacing: 2rpx;
  }

  &__hint {
    font-size: $font-sm;
    color: $text-muted;
    margin-top: $spacing-xs;
  }
}

/* ===== 统计条 ===== */
.stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 0 $spacing-xl $spacing-lg;
  padding: $spacing-lg $spacing-sm;
  background: $bg-card;
  border: 1rpx solid rgba(255, 255, 255, 0.06);
  border-radius: $radius-xl;

  &__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6rpx;
  }

  &__num {
    font-size: $font-lg;
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

/* ===== 通用卡片 ===== */
.card {
  margin: 0 $spacing-xl $spacing-lg;
  padding: $spacing-lg;
  background: $bg-card;
  border: 1rpx solid rgba(255, 255, 255, 0.06);
  border-radius: $radius-xl;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-md;
  }

  &__title {
    font-size: $font-md;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: 2rpx;
  }

  &__date {
    font-size: $font-xs;
    color: $text-muted;
  }
}

/* ===== 最近测试 ===== */
.latest {
  &__row {
    display: flex;
    gap: $spacing-md;
    align-items: stretch;
  }

  &__type {
    flex-shrink: 0;
    width: 200rpx;
    padding: $spacing-md $spacing-sm;
    border-radius: $radius-lg;
    background: rgba(0, 0, 0, 0.25);
    border: 1rpx solid;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6rpx;
  }

  &__type-code {
    font-size: $font-xxl;
    font-weight: 900;
    letter-spacing: 2rpx;
  }

  &__type-name {
    font-size: $font-xs;
    color: $text-secondary;
    letter-spacing: 2rpx;
  }

  &__bars {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    justify-content: center;
  }

  &__actions {
    display: flex;
    gap: $spacing-sm;
    margin-top: $spacing-lg;
  }
}

.dim-row {
  display: flex;
  align-items: center;
  gap: $spacing-xs;

  &__label {
    width: 96rpx;
    font-size: $font-xs;
    color: $text-secondary;
    text-align: right;
    flex-shrink: 0;
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
    transition: width 0.8s ease;
  }

  &__value {
    width: 60rpx;
    text-align: right;
    font-size: $font-xs;
    font-weight: 700;
    color: $accent-gold;
    flex-shrink: 0;
  }
}

.btn {
  flex: 1;
  height: 80rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;

  &:active { transform: scale(0.97); }

  &--primary {
    background: linear-gradient(135deg, $accent-gold, $accent-gold-dark);
    box-shadow: 0 6rpx 16rpx rgba(255, 215, 0, 0.25);
    .btn__text { color: #1a0533; font-weight: 700; }
  }

  &--ghost {
    background: rgba(255, 255, 255, 0.06);
    border: 1rpx solid rgba(255, 255, 255, 0.12);
    .btn__text { color: $text-secondary; }
  }

  &__text {
    font-size: $font-base;
    letter-spacing: 2rpx;
  }
}

/* ===== 菜单 ===== */
.menu {
  padding: $spacing-md $spacing-lg 0;

  &__item {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md 0;
    border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
    transition: background 0.15s ease;

    &:active { background: rgba(255, 255, 255, 0.03); }

    &:last-child { border-bottom: none; }
  }

  &__item--button {
    background: transparent;
    border: none;
    text-align: left;
    padding-left: 0;
    padding-right: 0;
    margin: 0;
    border-radius: 0;
    color: inherit;
    font-size: inherit;
    font-family: inherit;
    line-height: inherit;

    &::after { display: none; }
  }

  &__icon {
    font-size: 40rpx;
    width: 60rpx;
    text-align: center;
    flex-shrink: 0;
  }

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  &__label {
    font-size: $font-base;
    font-weight: 600;
    color: $text-primary;
  }

  &__desc {
    font-size: $font-xs;
    color: $text-muted;
  }

  &__arrow {
    font-size: $font-lg;
    color: $text-muted;
    font-weight: 700;
  }
}

/* ===== 账号操作 ===== */
.account {
  padding: 0;

  &__row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rpx;
    padding: $spacing-lg;
    border-bottom: 1rpx solid rgba(255, 255, 255, 0.05);
    transition: background 0.15s ease;

    &:active { background: rgba(255, 255, 255, 0.03); }

    &:last-child { border-bottom: none; }
  }

  &__label {
    font-size: $font-base;
    color: $text-secondary;
    letter-spacing: 1rpx;
  }

  &__hint {
    font-size: $font-xs;
    color: $text-muted;
  }
}

/* ===== 版本号 ===== */
.version {
  text-align: center;
  padding: $spacing-xl 0 $spacing-md;

  &__text {
    font-size: $font-xs;
    color: $text-placeholder;
    letter-spacing: 4rpx;
  }
}

.safe-bottom {
  height: calc(70px + env(safe-area-inset-bottom));
  min-height: 70px;
}
</style>
