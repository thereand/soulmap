<!--
  人格星图 - 付费报告详情页
  展示完整的付费人格分析报告，分段呈现各维度内容
-->
<template>
  <view class="page-detail">
    <scroll-view scroll-y class="page-detail__scroll" :style="{ height: '100vh' }">
      <!-- 顶部装饰 -->
      <view class="detail-hero" v-if="personalityData">
        <view class="detail-hero__glow" :style="heroGlowStyle" />
        <view class="detail-hero__content">
          <text class="detail-hero__rarity" :class="`rarity--${rarityClass}`">
            {{ personalityData.rarity }}
          </text>
          <text class="detail-hero__name">{{ personalityData.name }}</text>
          <text class="detail-hero__code">{{ personalityData.code }}</text>
          <text class="detail-hero__title">{{ personalityData.title }}</text>
        </view>
      </view>

      <!-- 报告内容 -->
      <view class="report-content" v-if="paidReport">
        <!-- 深度分析 -->
        <view class="report-section" :style="{ animationDelay: '0.2s' }">
          <view class="report-section__header">
            <view class="report-section__icon-wrap">
              <text class="report-section__icon">🧠</text>
            </view>
            <text class="report-section__title">深度性格分析</text>
          </view>
          <view class="report-section__body">
            <text class="report-section__text">{{ paidReport.deepAnalysis }}</text>
          </view>
        </view>

        <!-- 内心世界 -->
        <view class="report-section" :style="{ animationDelay: '0.3s' }">
          <view class="report-section__header">
            <view class="report-section__icon-wrap">
              <text class="report-section__icon">💫</text>
            </view>
            <text class="report-section__title">内心世界揭秘</text>
          </view>
          <view class="report-section__body">
            <text class="report-section__text">{{ paidReport.innerWorld }}</text>
          </view>
        </view>

        <!-- 社交风格 -->
        <view class="report-section" :style="{ animationDelay: '0.4s' }">
          <view class="report-section__header">
            <view class="report-section__icon-wrap">
              <text class="report-section__icon">🤝</text>
            </view>
            <text class="report-section__title">社交风格</text>
          </view>
          <view class="report-section__body">
            <text class="report-section__text">{{ paidReport.socialStyle }}</text>
          </view>
        </view>

        <!-- 恋爱风格 -->
        <view class="report-section" :style="{ animationDelay: '0.5s' }">
          <view class="report-section__header">
            <view class="report-section__icon-wrap">
              <text class="report-section__icon">💕</text>
            </view>
            <text class="report-section__title">恋爱风格</text>
          </view>
          <view class="report-section__body">
            <text class="report-section__text">{{ paidReport.loveStyle }}</text>
          </view>
        </view>

        <!-- 职业建议 -->
        <view class="report-section" :style="{ animationDelay: '0.6s' }">
          <view class="report-section__header">
            <view class="report-section__icon-wrap">
              <text class="report-section__icon">💼</text>
            </view>
            <text class="report-section__title">职业发展建议</text>
          </view>
          <view class="report-section__body">
            <text class="report-section__text">{{ paidReport.careerAdvice }}</text>
          </view>
        </view>

        <!-- 成长路径 -->
        <view class="report-section" :style="{ animationDelay: '0.7s' }">
          <view class="report-section__header">
            <view class="report-section__icon-wrap">
              <text class="report-section__icon">🌱</text>
            </view>
            <text class="report-section__title">成长路径</text>
          </view>
          <view class="report-section__body">
            <text class="report-section__text">{{ paidReport.growthPath }}</text>
          </view>
        </view>

        <!-- 同类型名人 -->
        <view class="report-section" :style="{ animationDelay: '0.8s' }">
          <view class="report-section__header">
            <view class="report-section__icon-wrap">
              <text class="report-section__icon">🌟</text>
            </view>
            <text class="report-section__title">同类型名人</text>
          </view>
          <view class="report-section__body">
            <view class="famous-people">
              <view
                v-for="(person, i) in paidReport.famousPeople"
                :key="'fp-' + i"
                class="famous-person"
              >
                <view class="famous-person__avatar">
                  <text class="famous-person__emoji">⭐</text>
                </view>
                <text class="famous-person__name">{{ person }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 无报告 / 未付费提示 -->
      <view v-if="!paidReport && !loading" class="no-report">
        <!-- 未付费：显示锁屏 + 购买 CTA -->
        <template v-if="!hasAccess && personalityData">
          <view class="lock-icon-wrap">
            <text class="lock-icon">🔒</text>
          </view>
          <text class="no-report__title">完整报告尚未解锁</text>
          <text class="no-report__text">
            购买后可查看深度性格分析、内心世界、社交与恋爱风格、职业建议、成长路径、同类型名人等完整解读。
          </text>
          <view class="no-report__price-row">
            <text class="no-report__original">¥19.9</text>
            <text class="no-report__current">¥9.9</text>
          </view>
          <view class="no-report__btn no-report__btn--primary" @tap="handleBuyBasic">
            <text class="no-report__btn-text">立即解锁 ¥9.9</text>
          </view>
          <view class="no-report__btn" @tap="goBack">
            <text class="no-report__btn-text">返回结果页</text>
          </view>
        </template>

        <!-- 其他情况：无数据 -->
        <template v-else>
          <text class="no-report__text">暂无报告数据</text>
          <view class="no-report__btn" @tap="goBack">
            <text class="no-report__btn-text">返回</text>
          </view>
        </template>
      </view>

      <!-- 底部操作区 -->
      <view class="detail-footer" v-if="paidReport">
        <!-- 分隔线 -->
        <view class="footer-divider">
          <view class="footer-divider__line" />
          <text class="footer-divider__text">✦</text>
          <view class="footer-divider__line" />
        </view>

        <!-- 引导分享 -->
        <view class="detail-footer__share" @tap="handleShare">
          <text class="detail-footer__share-icon">📤</text>
          <text class="detail-footer__share-text">分享你的星灵解读给好友</text>
        </view>

        <!-- 追加售卖（受 UPSELL_ENABLED 开关控制） -->
        <view v-if="showUpsell" class="upsell-card">
          <text class="upsell-card__title">📊 进阶报告</text>
          <text class="upsell-card__desc">
            解锁人格兼容性分析、阶段性成长建议、专属成长计划
          </text>
          <view class="upsell-card__price">
            <text class="upsell-card__original">¥39.9</text>
            <view class="upsell-card__current">
              <text class="upsell-card__symbol">¥</text>
              <text class="upsell-card__value">19.9</text>
            </view>
          </view>
          <view class="upsell-card__btn" @tap="handleUpsell">
            <text class="upsell-card__btn-text">升级进阶报告 ¥19.9</text>
          </view>
        </view>
      </view>

      <!-- 底部安全距离 -->
      <view class="safe-bottom" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useTestStore } from '@/stores/test'
import { usePayment } from '@/composables/usePayment'
import { personalityTypes } from '@/data/results/types'
import { paidReports } from '@/data/results/paid-reports'
import { paymentService } from '@/services/payment.service'
import { PAID_ENABLED, UPSELL_ENABLED } from '@/config/features'

const testStore = useTestStore()
const payment = usePayment()
const loading = ref(true)

/** 服务端付费校验结果 */
const serverUnlocked = ref(false)

/** 是否允许查看完整报告
 *  - PAID_ENABLED=false：全部免费开放
 *  - PAID_ENABLED=true：服务端 + 本地双重校验
 */
const hasAccess = computed(() => {
  if (!PAID_ENABLED) return true
  if (serverUnlocked.value) return true
  // 本地缓存兜底：允许用户在弱网下查看之前已付费的报告
  try {
    const cache = JSON.parse(uni.getStorageSync('soulmap_paid_results') || '{}')
    return Object.values(cache).some((rec: any) => {
      const typeMatch = resultTypeParam.value
        ? rec.productType === resultTypeParam.value
        : true
      return typeMatch
    })
  } catch {
    return false
  }
})

/** 是否显示追加售卖卡片 */
const showUpsell = computed(() => PAID_ENABLED && UPSELL_ENABLED)

/** 从路由参数获取结果类型 */
const resultTypeParam = ref('')

/** 当前人格类型数据 */
const personalityData = computed(() => {
  // 优先使用路由参数，回退到 store
  const typeCode = resultTypeParam.value || testStore.result?.personalityType
  if (!typeCode) return null
  return personalityTypes[typeCode] ?? null
})

/** 付费报告数据（仅当 hasAccess 为 true 时才返回） */
const paidReport = computed(() => {
  if (!hasAccess.value) return null
  const typeCode = resultTypeParam.value || testStore.result?.personalityType
  if (!typeCode) return null
  return paidReports[typeCode] ?? null
})

/** 稀有度样式类 */
const rarityClass = computed(() => {
  if (!personalityData.value) return 'r'
  switch (personalityData.value.rarity) {
    case 'SSR': return 'ssr'
    case 'SR': return 'sr'
    default: return 'r'
  }
})

/** 头部光晕样式 */
const heroGlowStyle = computed(() => {
  if (!personalityData.value) return {}
  return {
    background: `radial-gradient(ellipse at center top, ${personalityData.value.color}55 0%, transparent 65%)`,
  }
})

onLoad(async (options: Record<string, string> | undefined) => {
  if (options?.resultType) {
    resultTypeParam.value = options.resultType
  } else if (!testStore.result) {
    // 兜底：从本地存储恢复
    testStore.hydrateResultFromStorage()
  }
  console.log('[Page] 详细报告页加载, 类型:', resultTypeParam.value || testStore.result?.personalityType)

  // 服务端付费校验：调用 getReport 云函数判断是否已购买 basic 报告
  const resultId = testStore.result?.resultId
  const typeCode = resultTypeParam.value || testStore.result?.personalityType
  if (resultId && typeCode) {
    try {
      const res = await paymentService.checkPaid(resultId, 'basic')
      serverUnlocked.value = res === true
    } catch (e) {
      console.warn('[Detail] 服务端付费校验失败，回退本地缓存:', e)
    }
  }
  loading.value = false
})

/** 处理分享 */
function handleShare() {
  uni.showToast({
    title: '分享功能即将上线',
    icon: 'none',
    duration: 2000,
  })
}

/** 处理追加售卖（进阶报告，产品类型为 advanced） */
async function handleUpsell() {
  if (payment.isLoading.value) return
  const resultId = testStore.result?.resultId
  if (!resultId) {
    uni.showToast({ title: '测试结果未就绪', icon: 'none' })
    return
  }

  const ok = await payment.payForReport(resultId, 'advanced')
  if (ok) {
    uni.showToast({ title: '进阶报告已解锁', icon: 'success' })
  } else if (payment.payError.value) {
    uni.showToast({ title: payment.payError.value || '支付未完成', icon: 'none', duration: 2500 })
  }
}

/** 从锁屏直接购买基础版 */
async function handleBuyBasic() {
  if (payment.isLoading.value) return
  const resultId = testStore.result?.resultId
  if (!resultId) {
    uni.showToast({ title: '测试结果未就绪', icon: 'none' })
    return
  }
  const ok = await payment.payForReport(resultId, 'basic')
  if (ok) {
    serverUnlocked.value = true
    uni.showToast({ title: '已解锁', icon: 'success' })
  } else if (payment.payError.value) {
    uni.showToast({ title: payment.payError.value || '支付未完成', icon: 'none', duration: 2500 })
  }
}

/** 返回 */
function goBack() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.page-detail {
  min-height: 100vh;
  background: $bg-gradient-star;

  &__scroll {
    position: relative;
    z-index: 1;
  }
}

/* ===== 头部英雄区 ===== */
.detail-hero {
  position: relative;
  padding: $spacing-xxl $spacing-xl $spacing-xl;
  overflow: hidden;

  &__glow {
    position: absolute;
    top: -40%;
    left: -20%;
    width: 140%;
    height: 120%;
    pointer-events: none;
    opacity: 0.8;
  }

  &__content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-sm;
  }

  &__rarity {
    font-size: $font-xs;
    font-weight: 800;
    letter-spacing: 4rpx;
    padding: 4rpx 16rpx;
    border-radius: $radius-sm;

    &.rarity--ssr {
      color: #ffd700;
      background: rgba(255, 215, 0, 0.12);
      border: 1rpx solid rgba(255, 215, 0, 0.3);
    }

    &.rarity--sr {
      color: #a855f7;
      background: rgba(168, 85, 247, 0.12);
      border: 1rpx solid rgba(168, 85, 247, 0.3);
    }

    &.rarity--r {
      color: #3b82f6;
      background: rgba(59, 130, 246, 0.12);
      border: 1rpx solid rgba(59, 130, 246, 0.3);
    }
  }

  &__name {
    font-size: $font-xxl;
    font-weight: 800;
    color: $text-primary;
    letter-spacing: 6rpx;
    text-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.5);
  }

  &__code {
    font-size: $font-lg;
    font-weight: 300;
    color: $text-secondary;
    letter-spacing: 12rpx;
  }

  &__title {
    font-size: $font-base;
    color: $text-muted;
    text-align: center;
    line-height: 1.8;
    margin-top: $spacing-xs;
  }
}

/* ===== 报告段落 ===== */
.report-content {
  padding: 0 $spacing-xl;
}

.report-section {
  margin-bottom: $spacing-xl;
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;

  &__header {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;
  }

  &__icon-wrap {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      rgba(108, 60, 224, 0.2) 0%,
      rgba(26, 5, 51, 0.4) 100%
    );
    border: 1rpx solid rgba(108, 60, 224, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__icon {
    font-size: 32rpx;
  }

  &__title {
    font-size: $font-lg;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: 2rpx;
  }

  &__body {
    padding-left: $spacing-xs;
  }

  &__text {
    font-size: $font-base;
    color: $text-secondary;
    line-height: 2.2;
    letter-spacing: 1rpx;
    white-space: pre-wrap;
  }
}

/* ===== 名人列表 ===== */
.famous-people {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-md;
}

.famous-person {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  border-radius: $radius-lg;
  background: rgba(108, 60, 224, 0.08);
  border: 1rpx solid rgba(108, 60, 224, 0.12);

  &__avatar {
    width: 48rpx;
    height: 48rpx;
    border-radius: 50%;
    background: rgba(255, 215, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__emoji {
    font-size: 24rpx;
  }

  &__name {
    font-size: $font-sm;
    color: $text-primary;
    font-weight: 500;
  }
}

/* ===== 无报告 ===== */
.no-report {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-lg;
  padding: $spacing-xl;

  &__title {
    font-size: $font-lg;
    font-weight: 800;
    color: $text-primary;
    letter-spacing: 2rpx;
    text-align: center;
  }

  &__text {
    font-size: $font-sm;
    color: $text-secondary;
    line-height: 1.8;
    text-align: center;
    max-width: 560rpx;
  }

  &__price-row {
    display: flex;
    align-items: baseline;
    gap: $spacing-md;
  }

  &__original {
    font-size: $font-base;
    color: $text-muted;
    text-decoration: line-through;
  }

  &__current {
    font-size: $font-hero;
    font-weight: 900;
    color: $accent-gold;
    letter-spacing: -2rpx;
  }

  &__btn {
    padding: $spacing-md $spacing-xxl;
    border-radius: $radius-full;
    background: rgba(108, 60, 224, 0.2);
    border: 1rpx solid rgba(108, 60, 224, 0.3);
    min-width: 400rpx;
    text-align: center;

    &--primary {
      background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
      border: none;
      box-shadow: 0 8rpx 24rpx rgba(255, 215, 0, 0.25);

      .no-report__btn-text {
        color: #1a0533;
        font-weight: 800;
      }
    }
  }

  &__btn-text {
    font-size: $font-base;
    color: $text-secondary;
  }
}

.lock-icon-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(255, 215, 0, 0.08);
  border: 2rpx solid rgba(255, 215, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-sm;
}

.lock-icon {
  font-size: 60rpx;
}

/* ===== 底部操作区 ===== */
.detail-footer {
  padding: $spacing-xl;
  display: flex;
  flex-direction: column;
  gap: $spacing-xl;
  opacity: 0;
  animation: fadeInUp 0.6s ease 0.9s forwards;
}

.footer-divider {
  display: flex;
  align-items: center;
  gap: $spacing-lg;

  &__line {
    flex: 1;
    height: 1rpx;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  }

  &__text {
    font-size: $font-sm;
    color: $text-muted;
  }
}

.detail-footer__share {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  border-radius: $radius-full;
  background: rgba(108, 60, 224, 0.12);
  border: 1rpx solid rgba(108, 60, 224, 0.2);
  transition: all 0.2s ease;

  &:active {
    background: rgba(108, 60, 224, 0.22);
    transform: scale(0.98);
  }

  &-icon {
    font-size: 28rpx;
  }

  &-text {
    font-size: $font-base;
    color: $text-secondary;
    letter-spacing: 2rpx;
  }
}

/* ===== 追加售卖 ===== */
.upsell-card {
  background: linear-gradient(
    145deg,
    rgba(108, 60, 224, 0.12) 0%,
    rgba(26, 5, 51, 0.7) 100%
  );
  border-radius: $radius-xl;
  border: 1rpx solid rgba(255, 215, 0, 0.12);
  padding: $spacing-xl;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;

  &__title {
    font-size: $font-lg;
    font-weight: 700;
    color: $text-primary;
  }

  &__desc {
    font-size: $font-sm;
    color: $text-muted;
    line-height: 1.8;
  }

  &__price {
    display: flex;
    align-items: baseline;
    gap: $spacing-sm;
  }

  &__original {
    font-size: $font-base;
    color: $text-muted;
    text-decoration: line-through;
  }

  &__current {
    display: flex;
    align-items: baseline;
  }

  &__symbol {
    font-size: $font-base;
    font-weight: 700;
    color: $accent-gold;
  }

  &__value {
    font-size: $font-xxl;
    font-weight: 900;
    color: $accent-gold;
    line-height: 1;
  }

  &__btn {
    width: 100%;
    height: 88rpx;
    border-radius: $radius-full;
    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: $spacing-sm;
    box-shadow: 0 8rpx 24rpx rgba(255, 215, 0, 0.2);
    transition: all 0.2s ease;

    &:active {
      transform: scale(0.97);
      box-shadow: 0 4rpx 12rpx rgba(255, 215, 0, 0.15);
    }
  }

  &__btn-text {
    font-size: $font-md;
    font-weight: 800;
    color: #1a0533;
    letter-spacing: 2rpx;
  }
}

.safe-bottom {
  height: env(safe-area-inset-bottom);
  min-height: 40rpx;
}

/* ===== 动画 ===== */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
