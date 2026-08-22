<!--
  灵魂星图 - 灵魂契合度对比页
  展示：双方星灵卡片 → 契合度分数 → 关系标签 → 免费概述 → 付费详细报告
-->
<template>
  <view class="page-compare">
    <view v-if="loading" class="loading">
      <text class="loading__text">灵魂正在对位...</text>
    </view>

    <view v-else-if="!hasPartner" class="waiting">
      <text class="waiting__title">邀请好友对比灵魂契合度</text>
      <text class="waiting__desc">
        当前对比码：<text class="waiting__code">{{ compareCode || '生成中...' }}</text>
      </text>
      <button class="waiting__share" open-type="share" @tap="onShareTap">
        邀请好友加入对比
      </button>
      <text class="waiting__hint">好友进入并完成测试后，页面会自动更新对比结果</text>
    </view>

    <scroll-view v-else scroll-y class="scroll" :style="{ height: '100vh' }">
      <!-- 顶部对比 -->
      <view class="compare-hero">
        <view class="compare-hero__side">
          <view class="compare-hero__avatar" :style="avatarStyle(userA)" />
          <text class="compare-hero__name">{{ nameOf(userA) }}</text>
          <text class="compare-hero__type">{{ userA?.personalityType }}</text>
        </view>

        <view class="compare-hero__score">
          <view class="compare-hero__score-ring" :style="scoreRingStyle">
            <text class="compare-hero__score-num">{{ compatibility }}</text>
            <text class="compare-hero__score-unit">%</text>
          </view>
          <text class="compare-hero__label">{{ relationLabel }}</text>
        </view>

        <view class="compare-hero__side">
          <view class="compare-hero__avatar" :style="avatarStyle(userB)" />
          <text class="compare-hero__name">{{ nameOf(userB) }}</text>
          <text class="compare-hero__type">{{ userB?.personalityType }}</text>
        </view>
      </view>

      <!-- 一句话概述（免费） -->
      <view class="section">
        <text class="section__title">✨ 你们的关系</text>
        <view class="summary-card">
          <text class="summary-card__text">{{ report?.summary }}</text>
        </view>
      </view>

      <!-- 维度和谐度 -->
      <view class="section">
        <text class="section__title">四维度和谐</text>
        <view class="dim-list">
          <view
            v-for="dim in dimensionList"
            :key="dim.key"
            class="dim-row"
          >
            <text class="dim-row__label">{{ dim.label }}</text>
            <view class="dim-row__track">
              <view
                class="dim-row__fill"
                :style="{ width: dim.value + '%' }"
              />
            </view>
            <text class="dim-row__value">{{ dim.value }}%</text>
          </view>
        </view>
      </view>

      <!-- 付费墙：详细报告 -->
      <view class="section paywall" v-if="!isPaid">
        <text class="section__title">🔒 深度关系解读</text>
        <text class="paywall__desc">
          解锁详细维度对比、相处建议、潜在冲突解决与共同成长路径。
        </text>

        <view class="paywall__benefits">
          <view class="paywall__benefit" v-for="(b, i) in paidBenefits" :key="i">
            <text class="paywall__benefit-dot">✦</text>
            <text class="paywall__benefit-text">{{ b }}</text>
          </view>
        </view>

        <view class="paywall__cta" @tap="handleUnlock">
          <text class="paywall__price">¥19.9</text>
          <text class="paywall__cta-text">解锁灵魂契合详细报告</text>
        </view>
      </view>

      <!-- 已付费内容 -->
      <template v-else>
        <view class="section">
          <text class="section__title">关系优势</text>
          <view class="list">
            <view v-for="(s, i) in report?.strengths || []" :key="'s-' + i" class="list__item list__item--good">
              <text class="list__icon">✦</text>
              <text class="list__text">{{ s }}</text>
            </view>
          </view>
        </view>

        <view class="section">
          <text class="section__title">潜在挑战</text>
          <view class="list">
            <view v-for="(c, i) in report?.challenges || []" :key="'c-' + i" class="list__item list__item--challenge">
              <text class="list__icon">⚡</text>
              <text class="list__text">{{ c }}</text>
            </view>
          </view>
        </view>

        <view class="section">
          <text class="section__title">共同成长建议</text>
          <view class="advice-card">
            <text class="advice-card__text">{{ report?.growthAdvice }}</text>
          </view>
        </view>
      </template>

      <!-- 分享 -->
      <view class="share-bar">
        <button class="share-bar__btn" open-type="share">分享对比结果</button>
      </view>

      <view class="safe-bottom" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useCompare, type ComparePartner } from '@/composables/useCompare'
import { useTestStore } from '@/stores/test'
import { personalityTypes } from '@/data/results/types'
import { trackPageView, track, AnalyticsEvent } from '@/utils/analytics'

const compareLogic = useCompare()
const testStore = useTestStore()

const compareCode = ref('')
const loading = computed(() => compareLogic.loading.value)

const record = computed(() => compareLogic.record.value)
const report = computed(() => compareLogic.report.value)

const userA = computed<ComparePartner | null>(() => record.value?.userA || null)
const userB = computed<ComparePartner | null>(() => record.value?.userB || null)
const hasPartner = computed(() => !!(userA.value && userB.value))
const compatibility = computed(() => record.value?.compatibility ?? report.value?.overallScore ?? 0)
const relationLabel = computed(() => record.value?.relationLabel || report.value?.relationLabel || '灵魂知己')
const isPaid = computed(() => !!record.value?.isPaid)

const paidBenefits = [
  '四维度详细对比分析',
  '相处建议与沟通指南',
  '潜在冲突及化解方式',
  '共同成长路径规划',
]

const dimensionList = computed(() => {
  const dc = report.value?.dimensionComparison
  if (!dc) return []
  return [
    { key: 'EI', label: '能量方向', value: dc.EI.harmony },
    { key: 'SN', label: '信息偏好', value: dc.SN.harmony },
    { key: 'TF', label: '决策方式', value: dc.TF.harmony },
    { key: 'JP', label: '生活节奏', value: dc.JP.harmony },
  ]
})

const scoreRingStyle = computed(() => {
  const s = compatibility.value
  const color = s >= 80 ? '#FFD700' : s >= 60 ? '#4FC3F7' : s >= 40 ? '#B39DDB' : '#8E8EA9'
  return {
    background: `conic-gradient(${color} ${s * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
  }
})

function nameOf(u: ComparePartner | null): string {
  if (!u) return '?'
  return u.nickname || personalityTypes[u.personalityType]?.name || u.personalityType
}

function avatarStyle(u: ComparePartner | null) {
  const color = personalityTypes[u?.personalityType || '']?.color || '#6C3CE0'
  return {
    background: `radial-gradient(circle at 30% 30%, ${color}88, ${color}22)`,
    border: `2rpx solid ${color}`,
  }
}

/* 加载逻辑 */

onLoad(async (query) => {
  trackPageView('pagesReport/compare/index')
  const codeFromQuery = (query?.code as string) || ''
  const invitedFromQuery = (query?.compareCode as string) || ''
  const code = codeFromQuery || invitedFromQuery

  if (code) {
    compareCode.value = code
    // 尝试加入或加载
    const cur = testStore.result
    const partnerB: ComparePartner | null = cur
      ? {
          personalityType: cur.personalityType,
          scores: cur.dimensionScores,
        }
      : null

    // 先尝试加入
    if (partnerB) {
      const joined = await compareLogic.joinCompare(code, partnerB)
      if (!joined) {
        await compareLogic.loadCompare(code)
      }
    } else {
      await compareLogic.loadCompare(code)
    }
  } else if (testStore.result) {
    // 用户自己创建对比邀请
    const cur = testStore.result
    const code2 = await compareLogic.createCompareInvite({
      personalityType: cur.personalityType,
      scores: cur.dimensionScores,
    })
    if (code2) compareCode.value = code2
  }
})

onMounted(() => {
  // 兜底：若云端未连通，用当前用户 + 默认参照做离线预览
  if (!record.value && testStore.result) {
    compareLogic.computeOffline(
      testStore.result.personalityType,
      'INFJ',
      testStore.result.dimensionScores,
    )
  }
})

async function handleUnlock() {
  track(AnalyticsEvent.PAY_CLICK, {
    productType: 'compare_report',
    price: 19.9,
    compareCode: compareCode.value,
  })
  uni.showModal({
    title: '解锁灵魂契合详细报告',
    content: '本次为 ¥19.9，解锁后双方都可查看详细内容。',
    confirmText: '立即解锁',
    success: async (res) => {
      if (res.confirm) {
        // 支付流程占位：真正的支付通过 createOrder 云函数触发，成功后回调 markPaid
        // 此处直接尝试 markPaid 作为演示 / H5 兜底
        const ok = await compareLogic.unlockPaidReport(compareCode.value)
        uni.showToast({
          title: ok ? '已解锁，向下滚动查看' : '支付流程即将上线',
          icon: ok ? 'success' : 'none',
        })
      }
    },
  })
}

function onShareTap() {
  track(AnalyticsEvent.SHARE_CLICK, { shareType: 'compare_invite' })
}

// #ifdef MP-WEIXIN
defineExpose({
  onShareAppMessage() {
    const nameA = nameOf(userA.value)
    return {
      title: hasPartner.value
        ? `我们是「${relationLabel.value}」！契合度 ${compatibility.value}%，来看看你和我的灵魂契合度`
        : `${nameA} 邀请你测测灵魂契合度`,
      path: `/pagesReport/compare/index?code=${compareCode.value}`,
    }
  },
})
// #endif
</script>

<style lang="scss" scoped>
.page-compare {
  min-height: 100vh;
  background: $bg-gradient-star;
}

.scroll { position: relative; z-index: 1; }

.loading, .waiting {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-lg;
  padding: $spacing-xl;

  &__title {
    font-size: $font-lg;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: 2rpx;
  }

  &__desc { font-size: $font-sm; color: $text-secondary; }
  &__code { color: $accent-gold; font-weight: 700; letter-spacing: 4rpx; }

  &__share {
    padding: 16rpx 60rpx;
    background: linear-gradient(135deg, $accent-gold, #ff9a3c);
    color: #1a0533;
    font-size: $font-md;
    font-weight: 700;
    border-radius: $radius-full;
    border: none;
  }

  &__hint { font-size: $font-xs; color: $text-muted; text-align: center; }
  &__text { font-size: $font-md; color: $text-secondary; }
}

/* 顶部对比 */
.compare-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-xxl $spacing-xl;
  gap: $spacing-md;

  &__side {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-sm;
  }

  &__avatar {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    box-shadow: 0 8rpx 24rpx rgba(108, 60, 224, 0.3);
  }

  &__name {
    font-size: $font-md;
    font-weight: 700;
    color: $text-primary;
  }

  &__type {
    font-size: $font-xs;
    color: $text-muted;
    letter-spacing: 4rpx;
  }

  &__score {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
  }

  &__score-ring {
    width: 180rpx;
    height: 180rpx;
    border-radius: 50%;
    display: flex;
    align-items: baseline;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(255, 215, 0, 0.15);

    &::before {
      content: '';
      position: absolute;
    }
  }

  &__score-num {
    font-size: 48rpx;
    font-weight: 900;
    color: $accent-gold;
    padding-top: 20rpx;
  }

  &__score-unit {
    font-size: 20rpx;
    color: $text-secondary;
  }

  &__label {
    font-size: $font-sm;
    font-weight: 700;
    color: $accent-gold;
    letter-spacing: 4rpx;
  }
}

/* 通用 section */
.section {
  padding: 0 $spacing-xl;
  margin-bottom: $spacing-xxl;

  &__title {
    display: block;
    font-size: $font-md;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }
}

.summary-card {
  padding: $spacing-xl;
  border-radius: $radius-xl;
  background: linear-gradient(145deg, rgba(255, 215, 0, 0.08), rgba(108, 60, 224, 0.08));
  border: 1rpx solid rgba(255, 215, 0, 0.2);

  &__text {
    font-size: $font-base;
    color: $text-secondary;
    line-height: 2;
  }
}

.dim-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.dim-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  &__label {
    width: 120rpx;
    font-size: $font-sm;
    color: $text-secondary;
    text-align: right;
    flex-shrink: 0;
  }

  &__track {
    flex: 1;
    height: 14rpx;
    border-radius: 14rpx;
    background: rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    background: linear-gradient(90deg, $accent-blue, $accent-gold);
    transition: width 1s ease;
  }

  &__value {
    width: 70rpx;
    text-align: right;
    font-size: $font-sm;
    color: $accent-gold;
    font-weight: 700;
  }
}

/* 付费墙 */
.paywall {
  padding: $spacing-xl;
  margin: 0 $spacing-xl $spacing-xxl;
  border-radius: $radius-xl;
  background: linear-gradient(145deg, rgba(255, 154, 60, 0.1), rgba(108, 60, 224, 0.15));
  border: 1rpx solid rgba(255, 154, 60, 0.3);

  &__desc {
    font-size: $font-sm;
    color: $text-secondary;
    line-height: 1.8;
    margin-bottom: $spacing-lg;
    display: block;
  }

  &__benefits {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    margin-bottom: $spacing-lg;
  }

  &__benefit {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
  }

  &__benefit-dot { color: $accent-gold; font-size: $font-sm; }
  &__benefit-text { color: $text-secondary; font-size: $font-sm; }

  &__cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-md;
    height: 96rpx;
    border-radius: $radius-full;
    background: linear-gradient(135deg, $accent-gold 0%, #ff9a3c 100%);
    box-shadow: 0 8rpx 24rpx rgba(255, 154, 60, 0.35);

    &:active { transform: scale(0.98); }
  }

  &__price {
    font-size: 40rpx;
    font-weight: 900;
    color: #1a0533;
  }

  &__cta-text {
    font-size: $font-md;
    font-weight: 700;
    color: #1a0533;
  }
}

/* 列表 */
.list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.list__item {
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;
  padding: $spacing-md;
  border-radius: $radius-lg;
  background: rgba(255, 255, 255, 0.03);

  &--good { border-left: 4rpx solid $accent-gold; }
  &--challenge { border-left: 4rpx solid #ff8a65; }
}

.list__icon { font-size: $font-md; }
.list__text {
  flex: 1;
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.7;
}

.advice-card {
  padding: $spacing-xl;
  border-radius: $radius-xl;
  background: rgba(79, 195, 247, 0.06);
  border: 1rpx solid rgba(79, 195, 247, 0.15);

  &__text {
    font-size: $font-base;
    color: $text-secondary;
    line-height: 2;
  }
}

.share-bar {
  padding: 0 $spacing-xl $spacing-xxl;

  &__btn {
    width: 100%;
    height: 88rpx;
    background: rgba(255, 255, 255, 0.06);
    border: 1rpx solid rgba(255, 255, 255, 0.15);
    border-radius: $radius-full;
    color: $text-primary;
    font-size: $font-md;
  }
}

.safe-bottom {
  height: env(safe-area-inset-bottom);
  min-height: 40rpx;
}
</style>
