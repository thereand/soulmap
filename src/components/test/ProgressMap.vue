<!--
  灵魂星图 - 闯关地图进度条
  修仙境界风格：5个境界节点，灵气线条连接
-->
<template>
  <view class="progress-map">
    <!-- 背景墨晕 -->
    <view class="ink-wash-bg"></view>

    <!-- 进度轨道 -->
    <view class="realm-track">
      <!-- 连接线 -->
      <view
        v-for="i in totalChapters - 1"
        :key="'line-' + i"
        class="realm-line"
        :class="{
          'realm-line--active': i < currentChapter,
          'realm-line--current': i === currentChapter,
        }"
        :style="{ left: `${((i - 0.5) / totalChapters) * 100}%`, width: `${(1 / totalChapters) * 100}%` }"
      >
        <view class="line-fill"></view>
      </view>

      <!-- 境界节点 -->
      <view
        v-for="chapter in totalChapters"
        :key="'node-' + chapter"
        class="realm-node"
        :class="{
          'realm-node--completed': chapter < currentChapter,
          'realm-node--current': chapter === currentChapter,
          'realm-node--locked': chapter > currentChapter,
        }"
        :style="{ left: `${((chapter - 0.5) / totalChapters) * 100}%` }"
      >
        <!-- 已完成节点 - 金色灵气光晕 -->
        <view v-if="chapter < currentChapter" class="node-core node-core--completed">
          <text class="node-icon">✦</text>
          <view class="node-aura"></view>
        </view>

        <!-- 当前节点 - 脉冲呼吸 -->
        <view v-else-if="chapter === currentChapter" class="node-core node-core--current">
          <text class="node-icon">✧</text>
          <view class="node-pulse-ring"></view>
          <view class="node-pulse-ring node-pulse-ring--delay"></view>
        </view>

        <!-- 未到达节点 -->
        <view v-else class="node-core node-core--locked">
          <text class="node-icon node-icon--locked">○</text>
        </view>

        <!-- 节点下方：章节内进度 -->
        <view v-if="chapter === currentChapter" class="chapter-progress">
          <view class="chapter-progress-bar">
            <view
              class="chapter-progress-fill"
              :style="{ width: `${(currentQuestionInChapter / 5) * 100}%` }"
            ></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 境界名称标签 -->
    <view class="realm-labels">
      <view
        v-for="(name, idx) in chapterNames"
        :key="'label-' + idx"
        class="realm-label"
        :class="{
          'realm-label--active': idx + 1 <= currentChapter,
          'realm-label--current': idx + 1 === currentChapter,
        }"
        :style="{ left: `${((idx + 0.5) / totalChapters) * 100}%` }"
      >
        <text>{{ name }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  /** 当前章节编号 (1~5) */
  currentChapter: number
  /** 当前章节内已完成题目数 */
  currentQuestionInChapter: number
  /** 总章节数 */
  totalChapters: number
}

withDefaults(defineProps<Props>(), {
  currentChapter: 1,
  currentQuestionInChapter: 0,
  totalChapters: 5,
})

/** 章节简称 */
const chapterNames = ['觉醒', '探索', '抉择', '蜕变', '归宿']
</script>

<style lang="scss" scoped>
.progress-map {
  position: relative;
  width: 100%;
  padding: 24rpx 32rpx 48rpx;
  overflow: hidden;
}

.ink-wash-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 50% 30%,
    rgba(201, 169, 110, 0.06) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.realm-track {
  position: relative;
  height: 80rpx;
  margin: 0 20rpx;
}

/* === 连接线 === */
.realm-line {
  position: absolute;
  top: 50%;
  height: 4rpx;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4rpx;
  overflow: hidden;

  .line-fill {
    height: 100%;
    width: 0%;
    border-radius: 4rpx;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &--active .line-fill {
    width: 100%;
    background: linear-gradient(90deg, #c9a96e, #e8d5a3);
    box-shadow: 0 0 12rpx rgba(201, 169, 110, 0.5);
  }

  &--current .line-fill {
    width: 50%;
    background: linear-gradient(90deg, #c9a96e, rgba(201, 169, 110, 0.3));
  }
}

/* === 境界节点 === */
.realm-node {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.node-core {
  position: relative;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s ease;

  /* 已完成：金色实心 */
  &--completed {
    background: radial-gradient(circle, #e8d5a3 0%, #c9a96e 60%, #8b6914 100%);
    box-shadow:
      0 0 20rpx rgba(201, 169, 110, 0.6),
      0 0 40rpx rgba(201, 169, 110, 0.2),
      inset 0 0 10rpx rgba(255, 255, 255, 0.3);

    .node-icon {
      color: #1a1008;
      font-size: 24rpx;
      text-shadow: none;
    }
  }

  /* 当前：金色边框 + 脉冲 */
  &--current {
    background: radial-gradient(circle, rgba(201, 169, 110, 0.15) 0%, rgba(10, 10, 15, 0.9) 70%);
    border: 3rpx solid #c9a96e;
    box-shadow:
      0 0 24rpx rgba(201, 169, 110, 0.4),
      0 0 48rpx rgba(201, 169, 110, 0.15);

    .node-icon {
      color: #c9a96e;
      font-size: 28rpx;
      animation: iconGlow 2s ease-in-out infinite;
    }
  }

  /* 未到达：暗灰 */
  &--locked {
    background: rgba(255, 255, 255, 0.04);
    border: 2rpx solid rgba(255, 255, 255, 0.1);

    .node-icon--locked {
      color: rgba(255, 255, 255, 0.2);
      font-size: 22rpx;
    }
  }
}

/* 灵气光晕 */
.node-aura {
  position: absolute;
  inset: -8rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 169, 110, 0.2) 0%, transparent 70%);
  animation: auraBreath 3s ease-in-out infinite;
}

/* 脉冲环 */
.node-pulse-ring {
  position: absolute;
  inset: -6rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(201, 169, 110, 0.4);
  animation: pulseRing 2.5s ease-out infinite;

  &--delay {
    animation-delay: 1.2s;
  }
}

/* 章节内进度条 */
.chapter-progress {
  position: absolute;
  bottom: -20rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 64rpx;
}

.chapter-progress-bar {
  height: 4rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4rpx;
  overflow: hidden;
}

.chapter-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #c9a96e, #e8d5a3);
  border-radius: 4rpx;
  transition: width 0.5s ease;
  box-shadow: 0 0 8rpx rgba(201, 169, 110, 0.5);
}

/* === 境界名称标签 === */
.realm-labels {
  position: absolute;
  bottom: 0;
  left: 20rpx;
  right: 20rpx;
  height: 36rpx;
}

.realm-label {
  position: absolute;
  transform: translateX(-50%);
  white-space: nowrap;

  text {
    font-size: 20rpx;
    color: rgba(255, 255, 255, 0.2);
    letter-spacing: 2rpx;
    transition: all 0.5s ease;
    font-family: "STKaiti", "KaiTi", "楷体", serif;
  }

  &--active text {
    color: #c9a96e;
    text-shadow: 0 0 8rpx rgba(201, 169, 110, 0.4);
  }

  &--current text {
    color: #e8d5a3;
    font-size: 22rpx;
    text-shadow: 0 0 12rpx rgba(201, 169, 110, 0.6);
  }
}

/* === 动画关键帧 === */
@keyframes iconGlow {
  0%, 100% {
    text-shadow: 0 0 6rpx rgba(201, 169, 110, 0.3);
    opacity: 0.8;
  }
  50% {
    text-shadow: 0 0 16rpx rgba(201, 169, 110, 0.8);
    opacity: 1;
  }
}

@keyframes auraBreath {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.15);
  }
}

@keyframes pulseRing {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
}
</style>
