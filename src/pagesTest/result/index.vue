<!--
  灵魂星图 - 免费结果页
  付费转化的关键页面：揭晓动画 → 星灵卡片 → 核心标签 → 雷达图 → 免费摘要 → 付费墙
-->
<template>
  <view class="page-result">
    <!-- ===== 星光汇聚揭晓动画 ===== -->
    <view v-if="showReveal" class="reveal-overlay" @tap="skipReveal">
      <view class="reveal-overlay__bg" />
      <view class="reveal-overlay__stars">
        <view
          v-for="n in 20"
          :key="'star-' + n"
          class="reveal-overlay__star"
          :style="getStarStyle(n)"
        />
      </view>
      <!-- 中心光环粒子 -->
      <view class="reveal-overlay__burst">
        <view
          v-for="n in 12"
          :key="'burst-' + n"
          class="reveal-overlay__burst-dot"
          :style="{ '--burst-angle': `${n * 30}deg`, animationDelay: `${0.8 + n * 0.05}s` }"
        />
      </view>
      <view class="reveal-overlay__center">
        <view class="reveal-overlay__ring reveal-overlay__ring--outer" />
        <view class="reveal-overlay__ring reveal-overlay__ring--inner" />
        <text class="reveal-overlay__text">星灵已显现</text>
      </view>
      <text class="reveal-overlay__skip">轻触跳过</text>
    </view>

    <!-- ===== 主内容（揭晓后显示） ===== -->
    <scroll-view
      v-if="!showReveal && personalityData"
      scroll-y
      class="page-result__scroll"
      :style="{ height: '100vh' }"
    >
      <!-- 顶部装饰 -->
      <view class="result-header">
        <view class="result-header__glow" :style="headerGlowStyle" />
        <text class="result-header__label">✦ 你的星灵已显现 ✦</text>
      </view>

      <!-- 星灵角色卡片 -->
      <view class="result-section result-section--card">
        <CharacterCard :type="personalityData" />
      </view>

      <!-- 核心标签 -->
      <view class="result-section result-section--tags">
        <view class="tags-row">
          <view
            v-for="(tag, i) in personalityData.tags"
            :key="'tag-' + i"
            class="tag-pill"
            :style="{ animationDelay: `${0.3 + i * 0.15}s` }"
          >
            <text class="tag-pill__text">{{ tag }}</text>
          </view>
        </view>
      </view>

      <!-- 一句话描述 -->
      <view class="result-section result-section--title">
        <text class="result-title">{{ personalityData.title }}</text>
      </view>

      <!-- 星灵组合卡片 -->
      <view v-if="guideCombination && guideScores" class="result-section result-section--guide-combo">
        <text class="section-heading">你的星灵组合</text>
        <GuideComboCard
          :combination="guideCombination"
          :scores="guideScores"
        />
      </view>

      <!-- 向导亲和度雷达图 -->
      <view v-if="guideScores" class="result-section result-section--guide-radar">
        <text class="section-heading">星灵亲和度</text>
        <view class="radar-wrapper">
          <GuideRadarChart :scores="guideNormalizedScores" />
        </view>
      </view>

      <!-- 星座融合解读 -->
      <view v-if="selectedZodiac && testResult" class="result-section result-section--zodiac">
        <text class="section-heading">星座密码</text>
        <ZodiacFusionCard
          :zodiac-id="selectedZodiac"
          :mbti-type="testResult.personalityType"
        />
      </view>

      <!-- 维度雷达图 -->
      <view class="result-section result-section--radar">
        <text class="section-heading">维度分析</text>
        <view class="radar-wrapper">
          <RadarChart :percentages="radarPercentages" />
        </view>
        <!-- 维度数值条 -->
        <view class="dimension-bars">
          <view
            v-for="dim in dimensionDetails"
            :key="dim.key"
            class="dim-bar"
          >
            <text class="dim-bar__label">{{ dim.label }}</text>
            <view class="dim-bar__track">
              <view
                class="dim-bar__fill"
                :style="{
                  width: dim.pct + '%',
                  background: `linear-gradient(90deg, ${personalityData.color}88, ${personalityData.color})`,
                }"
              />
            </view>
            <text class="dim-bar__value">{{ dim.pct }}%</text>
          </view>
        </view>
      </view>

      <!-- 旅程故事 -->
      <view v-if="journeyStoryText" class="result-section result-section--journey">
        <JourneyStory :story="journeyStoryText" />
      </view>

      <!-- 免费报告摘要 -->
      <view class="result-section result-section--summary" v-if="freeReport">
        <text class="section-heading">核心概括</text>
        <view class="summary-card">
          <text class="summary-card__text">{{ freeReport.summary }}</text>
        </view>

        <!-- 优势列表 -->
        <text class="section-heading section-heading--sub">核心优势</text>
        <view class="strengths-list">
          <view
            v-for="(s, i) in freeReport.strengths"
            :key="'str-' + i"
            class="strength-item"
          >
            <view class="strength-item__dot" />
            <text class="strength-item__text">{{ s }}</text>
          </view>
        </view>

        <!-- 关键词 -->
        <text class="section-heading section-heading--sub">关键词</text>
        <view class="keywords-row">
          <view
            v-for="(kw, i) in freeReport.keywords"
            :key="'kw-' + i"
            class="keyword-chip"
          >
            <text class="keyword-chip__text">{{ kw }}</text>
          </view>
        </view>

        <!-- 趣味事实 -->
        <text class="section-heading section-heading--sub">趣味真相</text>
        <view class="fun-fact-card">
          <text class="fun-fact-card__icon">💡</text>
          <text class="fun-fact-card__text">{{ freeReport.funFact }}</text>
        </view>
      </view>

      <!-- ===== 付费墙区域（受 PAID_ENABLED 特性开关控制） ===== -->
      <view class="result-section result-section--paywall">
        <template v-if="showPaywallSection">
          <view class="paywall-divider">
            <view class="paywall-divider__line" />
            <text class="paywall-divider__text">深度解读</text>
            <view class="paywall-divider__line" />
          </view>

          <!-- 限时优惠倒计时 -->
          <TimedOffer
            :scope="personalityData?.code || 'default'"
            @purchase="handleTimedPurchase"
          />

          <PayWall
            :price="9.9"
            :original-price="19.9"
            :purchase-count="0"
            :time-limit="30"
            @purchase="handlePurchase"
          />
        </template>

        <!-- 分享裂变 Banner（邀请机制独立于付费，保留） -->
        <InviteBanner
          :target-count="inviteThreshold"
          :personality-name="personalityData?.name || '你的星灵'"
          @invite="handleInviteShare"
          @claimed="handleRewardClaimed"
        />

        <!-- 对比入口 -->
        <view class="compare-entry" @tap="goToCompare">
          <view class="compare-entry__left">
            <text class="compare-entry__title">💫 灵魂契合度</text>
            <text class="compare-entry__desc">邀请好友测试，对比你们的灵魂匹配度</text>
          </view>
          <text class="compare-entry__arrow">→</text>
        </view>
      </view>

      <!-- 底部操作区 -->
      <view class="result-footer">
        <!-- 图鉴解锁提示 -->
        <view v-if="newlyUnlockedCards.length > 0" class="atlas-unlock" @tap="goToAtlas">
          <text class="atlas-unlock__icon">🏆</text>
          <text class="atlas-unlock__text">解锁了 {{ newlyUnlockedCards.length }} 张新图鉴卡片</text>
          <text class="atlas-unlock__arrow">查看 →</text>
        </view>

        <!-- 图鉴入口 -->
        <view class="atlas-entry" @tap="goToAtlas">
          <text class="atlas-entry__icon">📖</text>
          <text class="atlas-entry__text">星灵图鉴</text>
          <text class="atlas-entry__count">{{ atlas.unlockedCount.value }}/{{ atlas.totalCards.value }}</text>
        </view>

        <view class="share-btn" @tap="handleShare">
          <text class="share-btn__icon">📤</text>
          <!-- #ifdef MP-WEIXIN -->
          <text class="share-btn__text">转发给好友</text>
          <!-- #endif -->
          <!-- #ifdef H5 -->
          <text class="share-btn__text">复制邀请链接</text>
          <!-- #endif -->
        </view>
        <text class="footer-note">
          {{ showPaywallSection ? '众多同类型星灵已解锁深度解读，你也可以' : '当前版本所有深度解读均可免费查看' }}
        </text>
      </view>

      <!-- 底部安全距离 -->
      <view class="safe-bottom" />
    </scroll-view>

    <!-- 分享海报弹窗 -->
    <view v-if="showPoster && personalityData" class="poster-modal" @tap.self="handleClosePoster">
      <view class="poster-modal__content">
        <view class="poster-modal__close" @tap="handleClosePoster">
          <text class="poster-modal__close-text">✕</text>
        </view>
        <SharePoster
          :personality-type="personalityData"
          :result-code="testResult?.personalityType || ''"
        />
      </view>
    </view>

    <!-- H5 分享面板（复制链接 + 二维码） -->
    <!-- #ifdef H5 -->
    <view v-if="showSharePanel" class="share-panel-modal" @tap.self="handleCloseSharePanel">
      <view class="share-panel-modal__content">
        <view class="share-panel-modal__close" @tap="handleCloseSharePanel">
          <text class="share-panel-modal__close-text">✕</text>
        </view>
        <text class="share-panel-modal__title">分享给好友</text>
        <text class="share-panel-modal__desc">邀请链接已复制到剪贴板</text>
        <view class="share-panel-modal__qr">
          <image
            :src="'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(h5ShareLink)"
            mode="aspectFit"
            class="share-panel-modal__qr-img"
          />
        </view>
        <text class="share-panel-modal__link">{{ h5ShareLink }}</text>
        <view class="share-panel-modal__btn" @tap="handleCopyAgain">
          <text class="share-panel-modal__btn-text">再次复制链接</text>
        </view>
      </view>
    </view>
    <!-- #endif -->

    <!-- 无结果时的提示 -->
    <view v-if="!showReveal && !personalityData" class="no-result">
      <text class="no-result__text">暂无测试结果</text>
      <view class="no-result__btn" @tap="goToTest">
        <text class="no-result__btn-text">开始测试</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { useTestStore } from '@/stores/test'
import { personalityTypes } from '@/data/results/types'
import { freeReports } from '@/data/results/free-reports'
import CharacterCard from '@/components/result/CharacterCard.vue'
import RadarChart from '@/components/result/RadarChart.vue'
import GuideComboCard from '@/components/result/GuideComboCard.vue'
import GuideRadarChart from '@/components/result/GuideRadarChart.vue'
import ZodiacFusionCard from '@/components/result/ZodiacFusionCard.vue'
import JourneyStory from '@/components/result/JourneyStory.vue'
import SharePoster from '@/components/result/SharePoster.vue'
import PayWall from '@/components/payment/PayWall.vue'
import TimedOffer from '@/components/payment/TimedOffer.vue'
import InviteBanner from '@/components/shared/InviteBanner.vue'
import { useInvite } from '@/composables/useInvite'
import { usePayment } from '@/composables/usePayment'
import { useABTest } from '@/composables/useABTest'
import { useSubscribe } from '@/composables/useSubscribe'
import { useAtlas } from '@/composables/useAtlas'
import { track, AnalyticsEvent, trackPageView } from '@/utils/analytics'
import { PAYWALL_ENABLED, TIMED_OFFER_ENABLED } from '@/config/features'

const testStore = useTestStore()
const invite = useInvite()
const ab = useABTest()
const subscribe = useSubscribe()
const atlas = useAtlas()
const payment = usePayment()

/** 是否展示付费墙区块（含分隔 + 倒计时 + PayWall；邀请横幅独立保留） */
const showPaywallSection = computed(() => PAYWALL_ENABLED || TIMED_OFFER_ENABLED)

/** 新解锁的图鉴卡片 */
const newlyUnlockedCards = ref<string[]>([])

/** 是否显示揭晓动画 */
const showReveal = ref(true)

/** 是否显示分享海报弹窗 */
const showPoster = ref(false)

/** H5 分享面板是否显示 */
const showSharePanel = ref(false)

/** H5 分享链接 */
const h5ShareLink = computed(() => {
  const share = invite.buildSharePayload(personalityData.value?.name || '你的星灵')
  return share.h5Link
})

/** 揭晓动画持续时间(ms) */
const REVEAL_DURATION = 2500

/** 邀请解锁门槛（A/B 测试：3 人 vs 1 人） */
const inviteThreshold = computed<1 | 3>(() => {
  const variant = ab.getVariant('invite_threshold_v1')
  return variant === '1person' ? 1 : 3
})

/** 当前测试结果 */
const testResult = computed(() => testStore.result)

/** 人格类型数据 */
const personalityData = computed(() => {
  if (!testResult.value) return null
  return personalityTypes[testResult.value.personalityType] ?? null
})

/** 免费报告 */
const freeReport = computed(() => {
  if (!testResult.value) return null
  return freeReports[testResult.value.personalityType] ?? null
})

/** 雷达图百分比（从confidence转换） */
const radarPercentages = computed<Record<string, number>>(() => {
  if (!testResult.value) return { EI: 50, SN: 50, TF: 50, JP: 50 }
  const c = testResult.value.confidence
  return {
    EI: Math.round(c.EI * 100),
    SN: Math.round(c.SN * 100),
    TF: Math.round(c.TF * 100),
    JP: Math.round(c.JP * 100),
  }
})

/** 维度详情（用于条形图显示） */
const dimensionDetails = computed(() => {
  if (!testResult.value) return []
  const scores = testResult.value.dimensionScores
  const conf = testResult.value.confidence

  return [
    {
      key: 'EI',
      label: scores.EI > 50 ? '外向 E' : '内向 I',
      pct: Math.round(conf.EI * 100),
    },
    {
      key: 'SN',
      label: scores.SN > 50 ? '感觉 S' : '直觉 N',
      pct: Math.round(conf.SN * 100),
    },
    {
      key: 'TF',
      label: scores.TF > 50 ? '思维 T' : '情感 F',
      pct: Math.round(conf.TF * 100),
    },
    {
      key: 'JP',
      label: scores.JP > 50 ? '判断 J' : '知觉 P',
      pct: Math.round(conf.JP * 100),
    },
  ]
})

/** 星灵组合（从 store 读取） */
const guideCombination = computed(() => testStore.guideCombination)

/** 向导亲和度原始分（从 store 读取） */
const guideScores = computed(() => testStore.guideAffinityScores)

/** 向导亲和度归一化分数（用于雷达图） */
const guideNormalizedScores = computed(() => {
  const s = guideScores.value
  if (!s) return { flame: 50, abyss: 50, forest: 50, star: 50 }
  // 简单归一化：假设原始分范围大约 0-25，映射到 0-100
  const normalize = (v: number) => Math.max(5, Math.min(100, Math.round((v / 25) * 100)))
  return {
    flame: normalize(s.flame),
    abyss: normalize(s.abyss),
    forest: normalize(s.forest),
    star: normalize(s.star),
  }
})

/** 用户选择的星座 ID */
const selectedZodiac = computed(() => testStore.selectedZodiac)

/** 旅程故事文本 */
const journeyStoryText = computed(() => testStore.journeyStory)

/** 头部光晕样式 */
const headerGlowStyle = computed(() => {
  if (!personalityData.value) return {}
  return {
    background: `radial-gradient(ellipse at center, ${personalityData.value.color}44 0%, transparent 70%)`,
  }
})

onLoad(() => {
  console.log('[Page] 测试结果页加载')
  // H5 刷新 / 首次进入时兜底：从 localStorage 恢复结果
  if (!testStore.result) {
    testStore.hydrateResultFromStorage()
  }
  trackPageView('pagesTest/result/index', {
    resultType: testStore.result?.personalityType || '',
  })
  track(AnalyticsEvent.RESULT_VIEW, {
    resultType: testStore.result?.personalityType || '',
  })

  // 解锁星灵图鉴卡片
  if (testStore.result) {
    atlas.loadUnlocked()
    const unlocked = atlas.unlockFromResult(
      testStore.result.personalityType,
      testStore.guideCombination?.id || '',
    )
    newlyUnlockedCards.value = unlocked
    if (unlocked.length > 0) {
      track(AnalyticsEvent.RESULT_VIEW, {
        eventType: 'atlas_unlock',
        cardIds: unlocked.join(','),
      })
    }
  }

  // 如果用户是被邀请进入的，通知邀请人 +1
  invite.markInviteeCompleted().catch(() => null)
})

onMounted(() => {
  // 双保险：H5 端 onLoad 有时不触发，onMounted 一定触发
  if (!testStore.result) {
    testStore.hydrateResultFromStorage()
  }
  // 自动跳过揭晓动画
  setTimeout(() => {
    showReveal.value = false
    // 揭晓完成后触发付费墙曝光埋点
    track(AnalyticsEvent.PAYWALL_VIEW, {
      resultType: testStore.result?.personalityType || '',
      offerPrice: 9.9,
    })

    // 高情绪点：揭晓完成 1.2 秒后弹出订阅授权
    // 只在小程序端有效，H5 会静默 no-op；24 小时内已弹过一次则不再打扰
    setTimeout(() => {
      subscribe.requestSubscribe().then((r) => {
        if (r.granted > 0) {
          track(AnalyticsEvent.PAGE_VIEW, {
            action: 'subscribe_granted',
            count: r.granted,
          })
        }
      })
    }, 1200)
  }, REVEAL_DURATION)
})

/** 跳过揭晓动画 */
function skipReveal() {
  showReveal.value = false
}

/** 获取星尘粒子样式 - 用预设的transform值避免CSS cos/sin兼容问题 */
function getStarStyle(n: number) {
  const angles = [0, 18, 36, 54, 72, 90, 108, 126, 144, 162, 180, 198, 216, 234, 252, 270, 288, 306, 324, 342]
  const angle = angles[(n - 1) % angles.length] || 0
  const radius = 80 + (n % 5) * 30
  const delay = ((n - 1) / 20) * 1.5
  const size = 4 + (n % 4) * 2
  const rad = (angle * Math.PI) / 180
  const tx = Math.cos(rad) * radius
  const ty = Math.sin(rad) * radius
  return {
    '--star-tx': `${tx}px`,
    '--star-ty': `${ty}px`,
    '--star-delay': `${delay}s`,
    '--star-size': `${size}px`,
    animationDelay: `${delay}s`,
  }
}

/** 处理购买（PayWall） */
async function handlePurchase() {
  if (payment.isLoading.value) return
  const resultId = testStore.result?.resultId
  if (!resultId) {
    uni.showToast({ title: '测试结果未就绪，请稍后重试', icon: 'none' })
    return
  }

  track(AnalyticsEvent.PAY_CLICK, {
    productType: 'basic',
    price: 9.9,
    from: 'paywall',
  })
  ab.trackConversion('price_test_v1', 'pay_click')
  ab.trackConversion('paywall_copy_v1', 'pay_click')

  const ok = await payment.payForReport(resultId, 'basic')
  if (ok) {
    track(AnalyticsEvent.PAY_SUCCESS, { productType: 'basic', price: 9.9, from: 'paywall' })
    // 支付成功后跳转详情页查看完整报告
    uni.navigateTo({
      url: `/pagesReport/detail/index?resultType=${testStore.result?.personalityType || ''}`,
    })
  } else if (payment.payError.value) {
    track(AnalyticsEvent.PAY_FAIL, { productType: 'basic', errMsg: payment.payError.value })
    uni.showToast({ title: payment.payError.value || '支付未完成', icon: 'none', duration: 2500 })
  }
}

/** 处理限时优惠购买（TimedOffer） */
async function handleTimedPurchase(price: number, tierId: string) {
  if (payment.isLoading.value) return
  const resultId = testStore.result?.resultId
  if (!resultId) {
    uni.showToast({ title: '测试结果未就绪，请稍后重试', icon: 'none' })
    return
  }

  track(AnalyticsEvent.PAY_CLICK, {
    productType: 'basic',
    price,
    tierId,
    from: 'timed_offer',
  })
  ab.trackConversion('countdown_duration_v1', 'pay_click', { price, tierId })

  // 限时优惠实际下单仍走 basic 产品（¥9.9），前端档位仅作为营销展示
  const ok = await payment.payForReport(resultId, 'basic')
  if (ok) {
    track(AnalyticsEvent.PAY_SUCCESS, { productType: 'basic', price, tierId })
    uni.navigateTo({
      url: `/pagesReport/detail/index?resultType=${testStore.result?.personalityType || ''}`,
    })
  } else if (payment.payError.value) {
    track(AnalyticsEvent.PAY_FAIL, { productType: 'basic', errMsg: payment.payError.value })
    uni.showToast({ title: payment.payError.value || '支付未完成', icon: 'none', duration: 2500 })
  }
}

/** 分享按钮 */
function handleShare() {
  track(AnalyticsEvent.SHARE_CLICK, {
    shareType: 'result_bottom',
    resultType: testStore.result?.personalityType || '',
  })
  // #ifdef MP-WEIXIN
  // 小程序端：提示用户点击右上角「...」转发
  uni.showToast({
    title: '点击右上角「...」转发给好友',
    icon: 'none',
    duration: 2500,
  })
  // #endif
  // #ifdef H5
  // H5 端：复制邀请链接到剪贴板，弹出分享面板
  uni.setClipboardData({
    data: h5ShareLink.value,
    success: () => {
      showSharePanel.value = true
    },
  })
  // #endif
}

/** 关闭 H5 分享面板 */
function handleCloseSharePanel() {
  showSharePanel.value = false
}

/** H5 再次复制链接 */
function handleCopyAgain() {
  uni.setClipboardData({
    data: h5ShareLink.value,
    success: () => {
      uni.showToast({ title: '链接已复制', icon: 'success', duration: 1500 })
    },
  })
}

/** 关闭分享海报 */
function handleClosePoster() {
  showPoster.value = false
}

// 页面级分享（右上角「...」→「转发」）：携带邀请码，使被分享者进入时绑定邀请关系
onShareAppMessage(() => {
  const code = invite.myInviteCode.value || invite.generateLocalInviteCode()
  const name = personalityData.value?.name || '你的星灵'
  track(AnalyticsEvent.SHARE_CLICK, {
    shareType: 'result_top_menu',
    inviteCode: code,
    resultType: testStore.result?.personalityType || '',
  })
  return {
    title: `我的灵魂星灵是「${name}」，来测测你的！`,
    path: `/pages/index/index?inviteCode=${code}`,
  }
})

/** 邀请横幅：拉起分享 */
function handleInviteShare(payload: { inviteCode: string; title: string; path: string }) {
  track(AnalyticsEvent.SHARE_CLICK, {
    shareType: 'invite',
    inviteCode: payload.inviteCode,
  })
  ab.trackConversion('invite_threshold_v1', 'invite_send')

  // 邀请前拉起 friendDynamic 订阅（用户想被通知好友完成测试）
  // #ifdef MP-WEIXIN
  subscribe.requestFriendDynamicOnly().catch(() => null)
  uni.showToast({
    title: '点击右上角「分享」发给好友',
    icon: 'none',
    duration: 2500,
  })
  // #endif
  // #ifdef H5
  uni.setClipboardData({
    data: payload.h5Link || payload.path,
    success: () => {
      uni.showToast({ title: '邀请链接已复制，粘贴发给好友', icon: 'success', duration: 2500 })
    },
  })
  // #endif
}

/** 奖励解锁回调 */
function handleRewardClaimed(rewardKey: string) {
  track(AnalyticsEvent.INVITE_COMPLETE, { rewardKey, source: 'result_page' })
}

/** 跳转到测试页 */
function goToTest() {
  uni.navigateTo({ url: '/pagesTest/intro/index' })
}

/** 跳转到契合度对比页 */
function goToCompare() {
  track(AnalyticsEvent.COMPARE_START, { from: 'result_page' })
  uni.navigateTo({ url: '/pagesReport/compare/index' })
}

/** 跳转到星灵图鉴页 */
function goToAtlas() {
  uni.navigateTo({ url: '/pagesUser/atlas/index' })
}
</script>

<style lang="scss" scoped>
.page-result {
  min-height: 100vh;
  background: $bg-gradient-star;
  position: relative;

  &__scroll {
    position: relative;
    z-index: 1;
  }
}

/* ===== 揭晓动画 ===== */
.reveal-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d0118;

  &__bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, #1a0533 0%, #0d0118 100%);
    animation: revealBgPulse 2.5s ease-in-out;
  }

  &__stars {
    position: absolute;
    inset: 0;
  }

  &__star {
    position: absolute;
    top: 50%;
    left: 50%;
    width: var(--star-size, 6px);
    height: var(--star-size, 6px);
    border-radius: 50%;
    background: #fff;
    animation: starConverge 2s ease-out forwards;
    animation-delay: var(--star-delay, 0s);
    opacity: 0;
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
  }

  &__burst {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    z-index: 3;
  }

  &__burst-dot {
    position: absolute;
    width: 6rpx;
    height: 6rpx;
    border-radius: 50%;
    background: #ffd700;
    opacity: 0;
    animation: burstExpand 1.2s ease-out forwards;
    animation-delay: var(--burst-delay, 0.8s);
    box-shadow: 0 0 12rpx rgba(255, 215, 0, 0.6);
  }

  &__center {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 300rpx;
    height: 300rpx;
  }

  &__ring {
    position: absolute;
    border-radius: 50%;
    border: 2rpx solid rgba(255, 215, 0, 0.3);

    &--outer {
      inset: 0;
      animation: ringExpand 2s ease-out 0.5s forwards;
      opacity: 0;
    }

    &--inner {
      inset: 40rpx;
      animation: ringExpand 2s ease-out 0.8s forwards;
      opacity: 0;
      border-color: rgba(139, 92, 246, 0.4);
    }
  }

  &__text {
    font-size: $font-lg;
    font-weight: 700;
    color: $accent-gold;
    letter-spacing: 8rpx;
    opacity: 0;
    animation: fadeIn 0.8s ease 1.5s forwards;
  }

  &__skip {
    position: absolute;
    bottom: 120rpx;
    font-size: $font-sm;
    color: $text-muted;
    letter-spacing: 2rpx;
    opacity: 0;
    animation: fadeIn 0.5s ease 1s forwards;
  }
}

/* ===== 顶部装饰 ===== */
.result-header {
  position: relative;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &__glow {
    position: absolute;
    top: -80rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 140%;
    height: 300rpx;
    pointer-events: none;
  }

  &__label {
    font-size: $font-sm;
    color: $accent-gold;
    letter-spacing: 8rpx;
    opacity: 0;
    animation: fadeInUp 0.6s ease 0.3s forwards;
  }
}

/* ===== 通用段落 ===== */
.result-section {
  padding: 0 $spacing-xl;
  margin-bottom: $spacing-xl;
  opacity: 0;
  animation: fadeInUp 0.6s ease forwards;

  &--card { animation-delay: 0.2s; }
  &--tags { animation-delay: 0.5s; }
  &--title { animation-delay: 0.6s; }
  &--radar { animation-delay: 0.7s; }
  &--summary { animation-delay: 0.8s; }
  &--paywall { animation-delay: 0.9s; margin-top: $spacing-xxl; }
}

/* ===== 核心标签 ===== */
.tags-row {
  display: flex;
  justify-content: center;
  gap: $spacing-sm;
  flex-wrap: wrap;
}

.tag-pill {
  padding: 8rpx 28rpx;
  border-radius: $radius-full;
  background: rgba(108, 60, 224, 0.15);
  border: 1rpx solid rgba(108, 60, 224, 0.3);
  opacity: 0;
  animation: scaleIn 0.4s ease forwards;

  &__text {
    font-size: $font-sm;
    color: $text-secondary;
    letter-spacing: 2rpx;
  }
}

/* ===== 一句话描述 ===== */
.result-title {
  font-size: $font-lg;
  font-weight: 500;
  color: $text-primary;
  text-align: center;
  line-height: 1.8;
  letter-spacing: 2rpx;
}

/* ===== 维度区域 ===== */
.section-heading {
  font-size: $font-md;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: $spacing-lg;
  display: block;

  &--sub {
    font-size: $font-base;
    font-weight: 600;
    color: $text-secondary;
    margin-top: $spacing-xl;
  }
}

.radar-wrapper {
  padding: $spacing-lg 0;
}

/* 维度条形图 */
.dimension-bars {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.dim-bar {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  &__label {
    font-size: $font-sm;
    color: $text-secondary;
    width: 100rpx;
    text-align: right;
    flex-shrink: 0;
  }

  &__track {
    flex: 1;
    height: 12rpx;
    border-radius: 12rpx;
    background: rgba(255, 255, 255, 0.08);
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: 12rpx;
    transition: width 1.2s ease;
  }

  &__value {
    font-size: $font-sm;
    font-weight: 700;
    color: $accent-gold;
    width: 80rpx;
    text-align: left;
    flex-shrink: 0;
  }
}

/* ===== 摘要卡片 ===== */
.summary-card {
  background: linear-gradient(
    145deg,
    rgba(108, 60, 224, 0.1) 0%,
    rgba(26, 5, 51, 0.6) 100%
  );
  border-radius: $radius-xl;
  border: 1rpx solid rgba(108, 60, 224, 0.15);
  padding: $spacing-xl;

  &__text {
    font-size: $font-base;
    color: $text-secondary;
    line-height: 2;
    letter-spacing: 1rpx;
  }
}

/* 优势列表 */
.strengths-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.strength-item {
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm;

  &__dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background: $accent-gold;
    margin-top: 14rpx;
    flex-shrink: 0;
  }

  &__text {
    font-size: $font-base;
    color: $text-secondary;
    line-height: 1.8;
  }
}

/* 关键词 */
.keywords-row {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.keyword-chip {
  padding: 8rpx 24rpx;
  border-radius: $radius-full;
  background: rgba(79, 195, 247, 0.1);
  border: 1rpx solid rgba(79, 195, 247, 0.2);

  &__text {
    font-size: $font-sm;
    color: $accent-blue;
  }
}

/* 趣味事实 */
.fun-fact-card {
  display: flex;
  gap: $spacing-md;
  padding: $spacing-xl;
  border-radius: $radius-xl;
  background: rgba(255, 215, 0, 0.04);
  border: 1rpx solid rgba(255, 215, 0, 0.1);

  &__icon {
    font-size: 40rpx;
    flex-shrink: 0;
  }

  &__text {
    font-size: $font-base;
    color: $text-secondary;
    line-height: 1.8;
  }
}

/* ===== 付费墙分隔 ===== */
.paywall-divider {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
  margin-bottom: $spacing-lg;
  padding: 0 $spacing-xl;

  &__line {
    flex: 1;
    height: 1rpx;
    background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent);
  }

  &__text {
    font-size: $font-md;
    font-weight: 700;
    color: $accent-gold;
    letter-spacing: 4rpx;
    white-space: nowrap;
  }
}

/* ===== 对比入口 ===== */
.compare-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 $spacing-xl $spacing-xl;
  padding: $spacing-lg;
  border-radius: $radius-xl;
  background: linear-gradient(145deg, rgba(179, 157, 219, 0.12), rgba(108, 60, 224, 0.08));
  border: 1rpx solid rgba(179, 157, 219, 0.25);
  transition: all 0.2s ease;

  &:active {
    background: rgba(179, 157, 219, 0.15);
    transform: scale(0.98);
  }

  &__left {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }

  &__title {
    font-size: $font-md;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: 2rpx;
  }

  &__desc {
    font-size: $font-xs;
    color: $text-muted;
  }

  &__arrow {
    font-size: $font-lg;
    color: $accent-gold;
    font-weight: 700;
  }
}

/* ===== 底部 ===== */
.result-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-lg;
  padding: $spacing-xl $spacing-xl $spacing-xxl;
  opacity: 0;
  animation: fadeInUp 0.6s ease 1s forwards;
}

.share-btn {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-md $spacing-xl;
  border-radius: $radius-full;
  background: rgba(108, 60, 224, 0.15);
  border: 1rpx solid rgba(108, 60, 224, 0.3);
  transition: all 0.2s ease;

  &:active {
    background: rgba(108, 60, 224, 0.25);
    transform: scale(0.97);
  }

  &__icon {
    font-size: 28rpx;
  }

  &__text {
    font-size: $font-base;
    color: $text-secondary;
    letter-spacing: 2rpx;
  }
}

.footer-note {
  font-size: $font-xs;
  color: $text-muted;
  text-align: center;
}

.safe-bottom {
  height: env(safe-area-inset-bottom);
  min-height: 40rpx;
}

/* ===== 无结果 ===== */
.no-result {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-xl;

  &__text {
    font-size: $font-lg;
    color: $text-muted;
  }

  &__btn {
    padding: $spacing-md $spacing-xxl;
    border-radius: $radius-full;
    background: linear-gradient(135deg, $brand-primary, $accent-blue);

    &:active {
      opacity: 0.8;
    }
  }

  &__btn-text {
    font-size: $font-md;
    font-weight: 700;
    color: $text-primary;
  }
}

/* ===== 动画 ===== */
@keyframes starConverge {
  0% {
    opacity: 0;
    transform: translate(var(--star-tx, 100px), var(--star-ty, 0px)) scale(0.3);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translate(0, 0) scale(1.5);
  }
}

@keyframes burstExpand {
  0% {
    opacity: 0;
    transform: rotate(var(--burst-angle, 0deg)) translateX(0) scale(0.5);
  }
  30% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: rotate(var(--burst-angle, 0deg)) translateX(80rpx) scale(0.2);
  }
}

@keyframes ringExpand {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  60% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
}

@keyframes revealBgPulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

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

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ===== 图鉴解锁提示 ===== */
.atlas-unlock {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-lg;
  border-radius: $radius-full;
  background: rgba(255, 215, 0, 0.08);
  border: 1rpx solid rgba(255, 215, 0, 0.2);
  margin-bottom: $spacing-sm;

  &__icon { font-size: 28rpx; }
  &__text { font-size: $font-xs; color: $accent-gold; flex: 1; }
  &__arrow { font-size: $font-xs; color: rgba(255, 215, 0, 0.6); }

  &:active { background: rgba(255, 215, 0, 0.15); }
}

.atlas-entry {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-lg;
  border-radius: $radius-full;
  background: rgba(108, 60, 224, 0.1);
  border: 1rpx solid rgba(108, 60, 224, 0.2);
  margin-bottom: $spacing-md;

  &__icon { font-size: 28rpx; }
  &__text { font-size: $font-sm; color: $text-secondary; }
  &__count { font-size: $font-xs; color: $accent-gold; margin-left: auto; }

  &:active { background: rgba(108, 60, 224, 0.2); }
}

/* ===== 分享海报弹窗 ===== */
.poster-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  animation: fadeIn 0.3s ease;

  &__content {
    position: relative;
    width: 85%;
    max-width: 640rpx;
    max-height: 85vh;
    overflow-y: auto;
    border-radius: $radius-lg;
    background: linear-gradient(180deg, #1a0533, #0d0118);
    padding: $spacing-lg;
  }

  &__close {
    position: absolute;
    top: -60rpx;
    right: 0;
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  &__close-text {
    font-size: 40rpx;
    color: rgba(255, 255, 255, 0.7);
  }
}

/* ===== H5 分享面板 ===== */
.share-panel-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  animation: fadeIn 0.3s ease;

  &__content {
    position: relative;
    width: 80%;
    max-width: 580rpx;
    background: linear-gradient(180deg, #1a0533, #0d0118);
    border-radius: $radius-xl;
    padding: $spacing-xxl $spacing-xl;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-md;
  }

  &__close {
    position: absolute;
    top: -60rpx;
    right: 0;
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  &__close-text {
    font-size: 40rpx;
    color: rgba(255, 255, 255, 0.7);
  }

  &__title {
    font-size: $font-lg;
    font-weight: 700;
    color: $accent-gold;
    letter-spacing: 4rpx;
  }

  &__desc {
    font-size: $font-sm;
    color: $text-muted;
  }

  &__qr {
    width: 320rpx;
    height: 320rpx;
    border-radius: $radius-lg;
    background: #fff;
    padding: $spacing-sm;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__qr-img {
    width: 280rpx;
    height: 280rpx;
  }

  &__link {
    font-size: $font-xs;
    color: $text-muted;
    text-align: center;
    word-break: break-all;
    line-height: 1.6;
    max-width: 100%;
    padding: 0 $spacing-sm;
  }

  &__btn {
    padding: $spacing-sm $spacing-xl;
    border-radius: $radius-full;
    background: rgba(108, 60, 224, 0.2);
    border: 1rpx solid rgba(108, 60, 224, 0.4);
    transition: all 0.2s ease;

    &:active {
      background: rgba(108, 60, 224, 0.35);
      transform: scale(0.97);
    }
  }

  &__btn-text {
    font-size: $font-base;
    color: $text-secondary;
    letter-spacing: 2rpx;
  }
}
</style>
