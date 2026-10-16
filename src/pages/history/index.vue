<!--
  人格星图 - 历史记录页（tabBar 页面）
  展示用户的测试历史列表，从 SOULMAP_TEST_HISTORY 读取
-->
<template>
  <view class="page-history">
    <scroll-view scroll-y class="history-scroll" :style="{ height: '100vh' }">
      <!-- 标题区 -->
      <view class="header">
        <view class="header__glow" />
        <text class="header__title">历史记录</text>
        <text class="header__desc">你的星图历程</text>
      </view>

      <!-- 统计摘要 -->
      <view v-if="history.length > 0" class="summary">
        <view class="summary__item">
          <text class="summary__num">{{ history.length }}</text>
          <text class="summary__label">总测试</text>
        </view>
        <view class="summary__sep" />
        <view class="summary__item">
          <text class="summary__num">{{ uniqueTypes }}</text>
          <text class="summary__label">不同类型</text>
        </view>
        <view class="summary__sep" />
        <view class="summary__item">
          <text class="summary__num">{{ avgDuration }}</text>
          <text class="summary__label">平均时长(分)</text>
        </view>
      </view>

      <!-- 历史列表 -->
      <view v-if="history.length > 0" class="list">
        <view
          v-for="(item, idx) in history"
          :key="item.resultId || idx"
          class="record"
          @tap="goDetail(item)"
        >
          <view class="record__left">
            <view
              class="record__badge"
              :style="{
                background: getTypeColor(item.personalityType) + '18',
                borderColor: getTypeColor(item.personalityType) + '55',
              }"
            >
              <text
                class="record__type"
                :style="{ color: getTypeColor(item.personalityType) }"
              >
                {{ item.personalityType }}
              </text>
            </view>
          </view>

          <view class="record__body">
            <view class="record__row-main">
              <text class="record__name">{{ getTypeName(item.personalityType) }}</text>
              <text v-if="getComboName(item.guideCombinationId)" class="record__combo">
                {{ getComboName(item.guideCombinationId) }}
              </text>
            </view>
            <view class="record__row-sub">
              <text class="record__date">{{ formatDate(item.completedAt) }}</text>
              <text class="record__dot">·</text>
              <text class="record__duration">{{ formatDuration(item.duration) }}</text>
            </view>
          </view>

          <text class="record__arrow">→</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty">
        <text class="empty__icon">🌌</text>
        <text class="empty__title">还没有测试记录</text>
        <text class="empty__desc">完成一次测试，你的星图历程将在这里展现</text>
        <view class="empty__btn" @tap="goTest">
          <text class="empty__btn-text">开始测试</text>
        </view>
      </view>

      <!-- 清除记录 -->
      <view v-if="history.length > 0" class="clear-section">
        <view class="clear-btn" @tap="handleClearHistory">
          <text class="clear-btn__text">清除本地记录</text>
        </view>
      </view>

      <view class="safe-bottom" />
    </scroll-view>

    <!-- 底部 iOS 风格 tabBar -->
    <CustomTabBar />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useTestStore } from '@/stores/test'
import { personalityTypes } from '@/data/results/types'
import { guideCombinations } from '@/data/guides'
import CustomTabBar from '@/components/shared/CustomTabBar.vue'
import { useTabBar } from '@/composables/useTabBar'

const testStore = useTestStore()
const { setActive } = useTabBar()

/** 测试历史（本地，最多 50 条） */
const history = ref<any[]>([])

/** 加载历史数据 */
function loadHistory() {
  history.value = testStore.getHistory()
}

onLoad(() => {
  console.log('[Page] 历史记录页加载')
  loadHistory()
})

onShow(() => {
  // 每次页面显示时刷新（从结果页返回时自动更新）
  loadHistory()
  // 同步 tabBar 选中态到"历史"
  setActive(1)
})

/** 去重后的类型数量 */
const uniqueTypes = computed(() => {
  const set = new Set(history.value.map((h) => h.personalityType))
  return set.size
})

/** 平均答题时长（分钟） */
const avgDuration = computed(() => {
  const valid = history.value.filter((h) => h.duration && h.duration > 0)
  if (valid.length === 0) return '-'
  const total = valid.reduce((sum: number, h: any) => sum + h.duration, 0)
  return Math.round(total / valid.length / 60)
})

/** 获取类型颜色 */
function getTypeColor(type: string): string {
  return personalityTypes[type]?.color || '#6c3ce0'
}

/** 获取类型名称 */
function getTypeName(type: string): string {
  return personalityTypes[type]?.name || type
}

/** 获取星灵组合名称 */
function getComboName(comboId: string | null): string {
  if (!comboId) return ''
  const combo = guideCombinations.find((c) => c.id === comboId)
  return combo?.name || ''
}

/** 格式化日期 */
function formatDate(ts: number): string {
  if (!ts) return ''
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 格式化时长 */
function formatDuration(seconds: number | undefined): string {
  if (!seconds || seconds <= 0) return ''
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return min > 0 ? `${min}分${sec}秒` : `${sec}秒`
}

/** 跳转到结果详情 */
function goDetail(item: any) {
  // 将历史记录的 resultId 传给结果页，以便展示对应结果
  uni.navigateTo({
    url: `/pagesTest/result/index?resultId=${item.resultId || ''}`,
  })
}

/** 跳转到测试页 */
function goTest() {
  uni.navigateTo({ url: '/pagesTest/intro/index' })
}

/** 清除本地记录 */
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
</script>

<style lang="scss" scoped>
.page-history {
  min-height: 100vh;
  background: $bg-gradient-star;
}

.history-scroll {
  position: relative;
  z-index: 1;
}

/* ===== 标题区 ===== */
.header {
  position: relative;
  padding: $spacing-xxl $spacing-xl $spacing-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;

  &__glow {
    position: absolute;
    top: -80rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 140%;
    height: 300rpx;
    background: radial-gradient(
      ellipse at center,
      rgba(108, 60, 224, 0.3) 0%,
      transparent 70%
    );
    pointer-events: none;
  }

  &__title {
    position: relative;
    font-size: $font-xxl;
    font-weight: 800;
    color: $text-primary;
    letter-spacing: 4rpx;
  }

  &__desc {
    position: relative;
    font-size: $font-sm;
    color: $text-muted;
    margin-top: $spacing-xs;
    letter-spacing: 2rpx;
  }
}

/* ===== 统计摘要 ===== */
.summary {
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

/* ===== 历史列表 ===== */
.list {
  padding: 0 $spacing-xl;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.record {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-lg;
  background: $bg-card;
  border: 1rpx solid rgba(255, 255, 255, 0.06);
  border-radius: $radius-xl;
  transition: all 0.15s ease;

  &:active {
    background: rgba(255, 255, 255, 0.04);
    transform: scale(0.98);
  }

  &__left {
    flex-shrink: 0;
  }

  &__badge {
    width: 120rpx;
    padding: $spacing-sm 0;
    border-radius: $radius-lg;
    border: 1rpx solid;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__type {
    font-size: $font-lg;
    font-weight: 900;
    letter-spacing: 2rpx;
  }

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    min-width: 0;
  }

  &__row-main {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    flex-wrap: wrap;
  }

  &__name {
    font-size: $font-base;
    font-weight: 700;
    color: $text-primary;
  }

  &__combo {
    font-size: $font-xs;
    color: $accent-gold;
    padding: 2rpx 12rpx;
    border-radius: $radius-full;
    background: rgba(255, 215, 0, 0.08);
    border: 1rpx solid rgba(255, 215, 0, 0.15);
  }

  &__row-sub {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
  }

  &__date {
    font-size: $font-xs;
    color: $text-muted;
  }

  &__dot {
    font-size: $font-xs;
    color: $text-placeholder;
  }

  &__duration {
    font-size: $font-xs;
    color: $text-muted;
  }

  &__arrow {
    font-size: $font-lg;
    color: $text-muted;
    font-weight: 700;
    flex-shrink: 0;
  }
}

/* ===== 空状态 ===== */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-xxl $spacing-xl;

  &__icon {
    font-size: 80rpx;
    margin-bottom: $spacing-sm;
  }

  &__title {
    font-size: $font-lg;
    font-weight: 700;
    color: $text-primary;
  }

  &__desc {
    font-size: $font-sm;
    color: $text-muted;
    text-align: center;
    line-height: 1.8;
  }

  &__btn {
    margin-top: $spacing-lg;
    padding: $spacing-md $spacing-xxl;
    border-radius: $radius-full;
    background: linear-gradient(135deg, $brand-primary, $accent-blue);

    &:active { opacity: 0.8; }
  }

  &__btn-text {
    font-size: $font-md;
    font-weight: 700;
    color: $text-primary;
  }
}

/* ===== 清除记录 ===== */
.clear-section {
  display: flex;
  justify-content: center;
  padding: $spacing-xxl $spacing-xl $spacing-lg;
}

.clear-btn {
  padding: $spacing-sm $spacing-xl;
  border-radius: $radius-full;
  background: rgba(255, 107, 107, 0.08);
  border: 1rpx solid rgba(255, 107, 107, 0.2);
  transition: all 0.15s ease;

  &:active {
    background: rgba(255, 107, 107, 0.15);
  }

  &__text {
    font-size: $font-sm;
    color: rgba(255, 107, 107, 0.8);
    letter-spacing: 2rpx;
  }
}

.safe-bottom {
  height: calc(70px + env(safe-area-inset-bottom));
  min-height: 70px;
}
</style>
