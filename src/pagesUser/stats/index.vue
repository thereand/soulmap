<!--
  灵魂星图 - 数据报表页
  基于本地 SOULMAP_TEST_HISTORY 的纯前端可视化（零后端调用）
  可视化项：MBTI 16 类型分布 / 四维度均值 / 向导亲和度 / 星灵图鉴进度 / 答题时长趋势 / 星座选择
-->
<template>
  <view class="page-stats">
    <scroll-view scroll-y class="stats-scroll" :style="{ height: '100vh' }">
      <!-- Hero -->
      <view class="hero">
        <text class="hero__title">你的灵魂数据</text>
        <text class="hero__desc">基于本地 {{ history.length }} 次测试记录的聚合分析</text>
      </view>

      <!-- 空状态 -->
      <view v-if="history.length === 0" class="empty">
        <text class="empty__emoji">📊</text>
        <text class="empty__title">暂无数据</text>
        <text class="empty__desc">完成至少 1 次测试后才能看到你的灵魂数据报表</text>
        <view class="empty__btn" @tap="goTest">
          <text class="empty__btn-text">去做测试</text>
        </view>
      </view>

      <template v-else>
        <!-- 顶部总览 -->
        <view class="summary">
          <view class="summary__item">
            <text class="summary__num">{{ history.length }}</text>
            <text class="summary__label">测试总次数</text>
          </view>
          <view class="summary__sep" />
          <view class="summary__item">
            <text class="summary__num">{{ uniqueTypes }}</text>
            <text class="summary__label">测出类型数</text>
          </view>
          <view class="summary__sep" />
          <view class="summary__item">
            <text class="summary__num">{{ topType?.code || '-' }}</text>
            <text class="summary__label">最常出现</text>
          </view>
        </view>

        <!-- MBTI 16 类型分布 -->
        <view class="card">
          <view class="card__head">
            <text class="card__title">MBTI 类型分布</text>
            <text class="card__sub">16 种人格的测试次数</text>
          </view>
          <view class="mbti-bars">
            <view
              v-for="bar in mbtiBars"
              :key="bar.code"
              class="mbti-bar"
              :class="{ 'mbti-bar--top': bar.isTop }"
            >
              <text class="mbti-bar__code" :style="{ color: bar.color }">{{ bar.code }}</text>
              <view class="mbti-bar__track">
                <view
                  class="mbti-bar__fill"
                  :style="{ width: bar.pct + '%', background: bar.color }"
                />
              </view>
              <text class="mbti-bar__count">{{ bar.count }}</text>
            </view>
          </view>
        </view>

        <!-- 四维度均值雷达 -->
        <view class="card">
          <view class="card__head">
            <text class="card__title">四维度均值</text>
            <text class="card__sub">所有测试的维度平均（>50 偏右字母）</text>
          </view>
          <view class="dim-bars">
            <view v-for="dim in dimAverages" :key="dim.key" class="dim-bar">
              <view class="dim-bar__head">
                <text class="dim-bar__left">{{ dim.leftLabel }}</text>
                <text class="dim-bar__right">{{ dim.rightLabel }}</text>
              </view>
              <view class="dim-bar__track">
                <view class="dim-bar__fill" :style="{ width: dim.pct + '%', background: dim.color }" />
                <view class="dim-bar__mid" />
              </view>
              <view class="dim-bar__foot">
                <text class="dim-bar__value">{{ dim.leftLabel.charAt(0) }} {{ dim.pct }}%</text>
                <text class="dim-bar__value dim-bar__value--right">{{ dim.rightLabel.charAt(0) }} {{ 100 - dim.pct }}%</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 答题时长趋势 -->
        <view class="card">
          <view class="card__head">
            <text class="card__title">答题时长趋势</text>
            <text class="card__sub">最近 {{ durationTrend.length }} 次测试（分钟）</text>
          </view>
          <view class="duration-chart">
            <view
              v-for="(p, i) in durationTrend"
              :key="'d-' + i"
              class="duration-bar"
              :style="{ height: p.pct + '%' }"
            >
              <view class="duration-bar__fill" />
              <text class="duration-bar__value">{{ p.minutes }}</text>
              <text class="duration-bar__idx">#{{ p.index }}</text>
            </view>
          </view>
          <view class="duration-axis">
            <text class="duration-axis__text">最早</text>
            <text class="duration-axis__text">最近</text>
          </view>
        </view>

        <!-- 星座选择分布 -->
        <view v-if="zodiacStats.length > 0" class="card">
          <view class="card__head">
            <text class="card__title">星座选择分布</text>
            <text class="card__sub">{{ zodiacStats.length }} 个星座被选过</text>
          </view>
          <view class="zodiac-grid">
            <view v-for="z in zodiacStats" :key="z.id" class="zodiac-cell">
              <text class="zodiac-cell__emoji">{{ z.emoji }}</text>
              <text class="zodiac-cell__name">{{ z.name }}</text>
              <text class="zodiac-cell__count">{{ z.count }}次</text>
            </view>
          </view>
        </view>

        <!-- 星灵组合分布 -->
        <view v-if="guideCombinationStats.length > 0" class="card">
          <view class="card__head">
            <text class="card__title">星灵组合分布</text>
            <text class="card__sub">测试中出现的星灵组合</text>
          </view>
          <view class="guide-bars">
            <view v-for="g in guideCombinationStats" :key="g.id" class="guide-bar">
              <text class="guide-bar__label">{{ g.name }}</text>
              <view class="guide-bar__track">
                <view class="guide-bar__fill" :style="{ width: g.pct + '%', background: g.color }" />
              </view>
              <text class="guide-bar__count">{{ g.count }}</text>
            </view>
          </view>
        </view>

        <!-- 图鉴进度 -->
        <view class="card">
          <view class="card__head">
            <text class="card__title">星灵图鉴进度</text>
            <text class="card__sub">已收集 {{ atlas.unlockedCount.value }} / {{ atlas.totalCards.value }}</text>
          </view>
          <view class="atlas-progress">
            <view class="atlas-progress__track">
              <view
                class="atlas-progress__fill"
                :style="{ width: atlas.completionRate.value + '%' }"
              />
            </view>
            <text class="atlas-progress__text">{{ atlas.completionRate.value }}%</text>
          </view>
        </view>
      </template>

      <view class="safe-bottom" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useTestStore } from '@/stores/test'
import { useAtlas } from '@/composables/useAtlas'
import { personalityTypes } from '@/data/results/types'
import { combinationMap } from '@/data/guides'
import { zodiacSigns } from '@/data/zodiac'
import type { MBTIType } from '@/types/test'

const testStore = useTestStore()
const atlas = useAtlas()

const history = ref<any[]>([])

onLoad(() => {
  console.log('[Page] 数据报表加载')
})

onMounted(() => {
  history.value = testStore.getHistory()
  atlas.loadUnlocked()
})

/* ===== 总览 ===== */

const uniqueTypes = computed(() => {
  const set = new Set(history.value.map((h) => h.personalityType))
  return set.size
})

const typeCountMap = computed<Record<string, number>>(() => {
  const map: Record<string, number> = {}
  history.value.forEach((h) => {
    const t = h.personalityType
    if (t) map[t] = (map[t] || 0) + 1
  })
  return map
})

const topType = computed(() => {
  const map = typeCountMap.value
  let best: { code: string; count: number } | null = null
  Object.entries(map).forEach(([code, count]) => {
    if (!best || count > best.count) best = { code, count }
  })
  if (!best) return null
  return { code: best.code as MBTIType, count: best.count }
})

/* ===== MBTI 分布条 ===== */

const ALL_TYPES: MBTIType[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
]

const mbtiBars = computed(() => {
  const max = Math.max(1, ...Object.values(typeCountMap.value))
  return ALL_TYPES.map((code) => {
    const count = typeCountMap.value[code] || 0
    const color = personalityTypes[code]?.color || '#6c3ce0'
    return {
      code,
      count,
      pct: (count / max) * 100,
      color,
      isTop: topType.value?.code === code,
    }
  })
})

/* ===== 四维度均值 ===== */

const dimAverages = computed(() => {
  const list = history.value.filter((h) => h.dimensionScores)
  if (list.length === 0) {
    return [
      { key: 'EI', leftLabel: '内向 I', rightLabel: '外向 E', pct: 50, color: '#4fc3f7' },
      { key: 'SN', leftLabel: '直觉 N', rightLabel: '感觉 S', pct: 50, color: '#a855f7' },
      { key: 'TF', leftLabel: '情感 F', rightLabel: '思维 T', pct: 50, color: '#ffd700' },
      { key: 'JP', leftLabel: '知觉 P', rightLabel: '判断 J', pct: 50, color: '#f472b6' },
    ]
  }
  const avg = { EI: 0, SN: 0, TF: 0, JP: 0 }
  list.forEach((h) => {
    avg.EI += h.dimensionScores.EI
    avg.SN += h.dimensionScores.SN
    avg.TF += h.dimensionScores.TF
    avg.JP += h.dimensionScores.JP
  })
  const n = list.length
  avg.EI = Math.round(avg.EI / n)
  avg.SN = Math.round(avg.SN / n)
  avg.TF = Math.round(avg.TF / n)
  avg.JP = Math.round(avg.JP / n)
  return [
    { key: 'EI', leftLabel: '内向 I', rightLabel: '外向 E', pct: avg.EI, color: '#4fc3f7' },
    { key: 'SN', leftLabel: '直觉 N', rightLabel: '感觉 S', pct: avg.SN, color: '#a855f7' },
    { key: 'TF', leftLabel: '情感 F', rightLabel: '思维 T', pct: avg.TF, color: '#ffd700' },
    { key: 'JP', leftLabel: '知觉 P', rightLabel: '判断 J', pct: avg.JP, color: '#f472b6' },
  ]
})

/* ===== 答题时长趋势（最近 10 次） ===== */

const durationTrend = computed(() => {
  const list = history.value
    .filter((h) => typeof h.duration === 'number' && h.duration > 0)
    .slice(0, 10)
    .reverse() // 时间正序
  if (list.length === 0) return []
  const minutes = list.map((h) => Math.max(1, Math.round(h.duration / 60)))
  const max = Math.max(...minutes)
  return list.map((h, i) => ({
    index: history.value.length - list.length + i + 1,
    minutes: minutes[i],
    pct: (minutes[i] / max) * 85 + 10, // 10%~95% 避免 0 或 100
  }))
})

/* ===== 星座选择 ===== */

const zodiacStats = computed(() => {
  const map: Record<string, number> = {}
  history.value.forEach((h) => {
    if (h.selectedZodiac) map[h.selectedZodiac] = (map[h.selectedZodiac] || 0) + 1
  })
  const arr = zodiacSigns || []
  return Object.entries(map)
    .map(([id, count]) => {
      const z = arr.find((x: any) => x.id === id)
      return z ? { id, count, name: z.name, emoji: z.symbol || '✨' } : null
    })
    .filter((x): x is { id: string; count: number; name: string; emoji: string } => !!x)
    .sort((a, b) => b.count - a.count)
})

/* ===== 星灵组合分布 ===== */

const guideCombinationStats = computed(() => {
  const map: Record<string, number> = {}
  history.value.forEach((h) => {
    const id = h.guideCombinationId
    if (id) map[id] = (map[id] || 0) + 1
  })
  const total = Object.values(map).reduce((a, b) => a + b, 0) || 1
  const palette = ['#ff6b6b', '#4fc3f7', '#66bb6a', '#ffd700', '#a855f7', '#f472b6', '#ff9800', '#26c6da']
  return Object.entries(map)
    .map(([id, count], i) => {
      const combo = combinationMap[id]
      return {
        id,
        count,
        name: combo?.name || id,
        pct: (count / total) * 100,
        color: palette[i % palette.length],
      }
    })
    .sort((a, b) => b.count - a.count)
})

/* ===== 操作 ===== */
function goTest() {
  uni.navigateTo({ url: '/pagesTest/intro/index' })
}
</script>

<style lang="scss" scoped>
.page-stats {
  min-height: 100vh;
  background: $bg-gradient-star;
}

.stats-scroll {
  position: relative;
  z-index: 1;
}

/* ===== Hero ===== */
.hero {
  padding: $spacing-xxl $spacing-xl $spacing-md;
  text-align: center;

  &__title {
    display: block;
    font-size: $font-xxl;
    font-weight: 800;
    color: $text-primary;
    letter-spacing: 2rpx;
  }

  &__desc {
    display: block;
    font-size: $font-sm;
    color: $text-muted;
    margin-top: $spacing-sm;
    letter-spacing: 1rpx;
  }
}

/* ===== 空状态 ===== */
.empty {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-md;
  padding: $spacing-xl;

  &__emoji { font-size: 96rpx; }
  &__title { font-size: $font-lg; font-weight: 700; color: $text-primary; }
  &__desc { font-size: $font-sm; color: $text-secondary; text-align: center; line-height: 1.7; }

  &__btn {
    margin-top: $spacing-md;
    padding: $spacing-md $spacing-xxl;
    border-radius: $radius-full;
    background: linear-gradient(135deg, $accent-gold, $accent-gold-dark);
    box-shadow: 0 6rpx 18rpx rgba(255, 215, 0, 0.3);
    &:active { transform: scale(0.97); }
  }

  &__btn-text {
    font-size: $font-base;
    font-weight: 700;
    color: #1a0533;
    letter-spacing: 2rpx;
  }
}

/* ===== 总览条 ===== */
.summary {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 0 $spacing-xl $spacing-lg;
  padding: $spacing-lg;
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
    font-size: $font-xl;
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

  &__head {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
    margin-bottom: $spacing-lg;
  }

  &__title {
    font-size: $font-md;
    font-weight: 700;
    color: $text-primary;
    letter-spacing: 2rpx;
  }

  &__sub {
    font-size: $font-xs;
    color: $text-muted;
    letter-spacing: 1rpx;
  }
}

/* ===== MBTI 分布 ===== */
.mbti-bars {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.mbti-bar {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  &--top &__code { font-weight: 900; }
  &--top &__count { color: $accent-gold; font-weight: 800; }

  &__code {
    width: 88rpx;
    font-size: $font-sm;
    font-weight: 700;
    letter-spacing: 2rpx;
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
    border-radius: 14rpx;
    transition: width 0.8s ease;
    min-width: 2rpx;
  }

  &__count {
    width: 48rpx;
    font-size: $font-xs;
    color: $text-secondary;
    text-align: right;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }
}

/* ===== 四维度 ===== */
.dim-bars {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.dim-bar {
  &__head {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6rpx;
  }

  &__left, &__right {
    font-size: $font-xs;
    color: $text-secondary;
    letter-spacing: 2rpx;
  }

  &__track {
    position: relative;
    height: 14rpx;
    border-radius: 14rpx;
    background: rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: 14rpx;
    transition: width 0.8s ease;
  }

  &__mid {
    position: absolute;
    left: 50%;
    top: -4rpx;
    bottom: -4rpx;
    width: 2rpx;
    background: rgba(255, 255, 255, 0.25);
  }

  &__foot {
    display: flex;
    justify-content: space-between;
    margin-top: 6rpx;
  }

  &__value {
    font-size: 20rpx;
    color: $text-muted;
    font-variant-numeric: tabular-nums;
    &--right { text-align: right; }
  }
}

/* ===== 时长趋势 ===== */
.duration-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 240rpx;
  gap: 8rpx;
  padding: $spacing-sm 0;
}

.duration-bar {
  flex: 1;
  position: relative;
  min-height: 8rpx;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  &__fill {
    width: 100%;
    height: 100%;
    border-radius: 8rpx 8rpx 0 0;
    background: linear-gradient(180deg, $accent-gold, $accent-gold-dark);
    opacity: 0.85;
  }

  &__value {
    position: absolute;
    top: -32rpx;
    left: 0;
    right: 0;
    font-size: 20rpx;
    color: $accent-gold;
    font-weight: 700;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  &__idx {
    margin-top: 6rpx;
    font-size: 18rpx;
    color: $text-muted;
    text-align: center;
  }
}

.duration-axis {
  display: flex;
  justify-content: space-between;
  margin-top: $spacing-xs;

  &__text {
    font-size: 20rpx;
    color: $text-placeholder;
    letter-spacing: 2rpx;
  }
}

/* ===== 星座网格 ===== */
.zodiac-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-sm;
}

.zodiac-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding: $spacing-sm $spacing-xs;
  border-radius: $radius-md;
  background: rgba(255, 255, 255, 0.03);
  border: 1rpx solid rgba(255, 255, 255, 0.06);

  &__emoji { font-size: 40rpx; }
  &__name { font-size: 20rpx; color: $text-secondary; letter-spacing: 1rpx; }
  &__count { font-size: 20rpx; color: $accent-gold; font-weight: 700; font-variant-numeric: tabular-nums; }
}

/* ===== 星灵组合 ===== */
.guide-bars {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.guide-bar {
  display: flex;
  align-items: center;
  gap: $spacing-sm;

  &__label {
    width: 160rpx;
    font-size: $font-sm;
    color: $text-secondary;
    letter-spacing: 1rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
    border-radius: 14rpx;
    transition: width 0.8s ease;
  }

  &__count {
    width: 48rpx;
    font-size: $font-xs;
    color: $text-secondary;
    text-align: right;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }
}

/* ===== 图鉴进度 ===== */
.atlas-progress {
  display: flex;
  align-items: center;
  gap: $spacing-md;

  &__track {
    flex: 1;
    height: 18rpx;
    border-radius: 18rpx;
    background: rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: 18rpx;
    background: linear-gradient(90deg, $accent-gold, #ff9a3c);
    transition: width 0.8s ease;
    box-shadow: 0 0 12rpx rgba(255, 215, 0, 0.3);
  }

  &__text {
    font-size: $font-md;
    font-weight: 800;
    color: $accent-gold;
    width: 100rpx;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
}

.safe-bottom {
  height: env(safe-area-inset-bottom);
  min-height: 40rpx;
}
</style>
