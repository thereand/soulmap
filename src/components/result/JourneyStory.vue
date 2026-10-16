<!--
  人格星图 - 人格旅程叙事卡片组件
  以古卷轴 / 故事书的视觉风格展示用户的个性化人格旅程。
  段落按 \n\n 分隔，逐段淡入，首字金色大写装饰。
-->
<template>
  <view class="journey-story">
    <!-- 羊皮纸纹理层 -->
    <view class="journey-story__texture" />

    <!-- ── 标题区域 ── -->
    <view class="journey-story__title-row">
      <view class="journey-story__ornament journey-story__ornament--left" />
      <text class="journey-story__title">你的人格旅程</text>
      <view class="journey-story__ornament journey-story__ornament--right" />
    </view>

    <!-- ── 故事正文 ── -->
    <view class="journey-story__body">
      <view
        v-for="(paragraph, idx) in paragraphs"
        :key="idx"
        class="journey-story__paragraph"
        :style="{ animationDelay: `${0.3 + idx * 0.25}s` }"
      >
        <!-- 首段首字金色装饰 -->
        <template v-if="idx === 0 && paragraph.length > 0">
          <text class="journey-story__drop-cap">{{ paragraph.charAt(0) }}</text>
          <text class="journey-story__text">{{ paragraph.slice(1) }}</text>
        </template>
        <template v-else>
          <text class="journey-story__text">{{ paragraph }}</text>
        </template>
      </view>
    </view>

    <!-- ── 底部花饰 ── -->
    <view class="journey-story__flourish">
      <view class="journey-story__flourish-dot" />
      <view class="journey-story__flourish-line" />
      <view class="journey-story__flourish-diamond" />
      <view class="journey-story__flourish-line" />
      <view class="journey-story__flourish-dot" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 组装好的人格旅程叙事文本（段落之间以 \n\n 分隔） */
  story: string
}

const props = defineProps<Props>()

/** 按 \n\n 分段，过滤空段 */
const paragraphs = computed(() =>
  props.story
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean),
)
</script>

<style lang="scss" scoped>
.journey-story {
  position: relative;
  width: 100%;
  max-width: 650rpx;
  margin: 0 auto;
  border-radius: $radius-xl;
  overflow: hidden;
  padding: $spacing-xl $spacing-lg $spacing-lg;
  background: linear-gradient(
    160deg,
    rgba(40, 25, 10, 0.88) 0%,
    rgba(26, 15, 6, 0.94) 50%,
    rgba(18, 10, 4, 0.97) 100%
  );
  border: 2rpx solid rgba(255, 215, 0, 0.08);
  box-shadow: $shadow-lg;

  /* ── 羊皮纸纹理（CSS 模拟） ── */
  &__texture {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    opacity: 0.03;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 6rpx,
        rgba(255, 215, 0, 0.15) 6rpx,
        rgba(255, 215, 0, 0.15) 7rpx
      ),
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 6rpx,
        rgba(255, 215, 0, 0.1) 6rpx,
        rgba(255, 215, 0, 0.1) 7rpx
      );
  }

  /* ── 标题区域 ── */
  &__title-row {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-md;
    margin-bottom: $spacing-xl;
  }

  &__title {
    font-size: $font-lg;
    font-weight: 700;
    color: $accent-gold;
    letter-spacing: 8rpx;
    white-space: nowrap;
    text-shadow: 0 2rpx 12rpx rgba(255, 215, 0, 0.3);
  }

  &__ornament {
    height: 2rpx;
    flex: 1;
    max-width: 120rpx;
    background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.5));

    &--right {
      background: linear-gradient(90deg, rgba(255, 215, 0, 0.5), transparent);
    }
  }

  /* ── 故事正文 ── */
  &__body {
    position: relative;
    z-index: 1;
  }

  &__paragraph {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    margin-bottom: $spacing-16;
    opacity: 0;
    transform: translateY(24rpx);
    animation: paragraphFadeIn 0.7s ease forwards;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__drop-cap {
    font-size: 48rpx;
    font-weight: 700;
    color: $accent-gold;
    line-height: 1.2;
    margin-right: 4rpx;
    text-shadow: 0 2rpx 8rpx rgba(255, 215, 0, 0.35);
    flex-shrink: 0;
  }

  &__text {
    font-size: $font-md;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.8;
    text-align: justify;
    word-break: break-all;
  }

  /* ── 底部花饰 ── */
  &__flourish {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    margin-top: $spacing-xl;
    opacity: 0;
    animation: fadeIn 0.6s ease forwards 1.5s;
  }

  &__flourish-dot {
    width: 8rpx;
    height: 8rpx;
    border-radius: 50%;
    background: rgba(255, 215, 0, 0.35);
  }

  &__flourish-line {
    width: 60rpx;
    height: 1rpx;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 215, 0, 0.3) 30%,
      rgba(255, 215, 0, 0.3) 70%,
      transparent
    );
  }

  &__flourish-diamond {
    width: 12rpx;
    height: 12rpx;
    background: rgba(255, 215, 0, 0.4);
    transform: rotate(45deg);
    flex-shrink: 0;
  }
}

/* ═══ 动画 ═══ */

@keyframes paragraphFadeIn {
  from {
    opacity: 0;
    transform: translateY(24rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
