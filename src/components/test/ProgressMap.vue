<!-- 章节地图：每个节点、进度条与名称共享同一列，避免绝对定位造成错位。 -->
<template>
  <view class="progress-map">
    <view
      v-for="(name, idx) in visibleNames"
      :key="'chapter-' + idx"
      class="realm-step"
      :class="{
        'realm-step--completed': idx + 1 < currentChapter,
        'realm-step--current': idx + 1 === currentChapter,
      }"
    >
      <view class="node-row">
        <view v-if="idx > 0" class="realm-line realm-line--left" />
        <view v-if="idx < visibleNames.length - 1" class="realm-line realm-line--right" />
        <view class="node-core">
          <text class="node-icon">{{ idx + 1 < currentChapter ? '✦' : idx + 1 === currentChapter ? '✧' : '○' }}</text>
        </view>
      </view>
      <view class="chapter-progress-bar">
        <view
          class="chapter-progress-fill"
          :style="{ width: (idx + 1 < currentChapter ? 100 : idx + 1 === currentChapter ? safeChapterProgress : 0) + '%' }"
        />
      </view>
      <text class="realm-label">{{ name }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** 实际展示顺序，从章节配置 order 获取，不是 chID 后缀。 */
  currentChapter?: number
  /** 该章节已回答数量 / 实际题数，0~100。 */
  chapterProgress?: number
  totalChapters?: number
  chapterNames?: string[]
}>(), {
  currentChapter: 1,
  chapterProgress: 0,
  totalChapters: 6,
  chapterNames: () => ['觉醒', '探索', '抉择', '试炼', '蜕变', '归宿'],
})

const visibleNames = computed(() => props.chapterNames.slice(0, props.totalChapters))
const safeChapterProgress = computed(() =>
  Number.isFinite(props.chapterProgress) ? Math.min(100, Math.max(0, props.chapterProgress)) : 0,
)
</script>

<style lang="scss" scoped>
.progress-map {
  display: flex;
  width: 100%;
  min-width: 0;
  padding: 16rpx 8rpx 12rpx;
  box-sizing: border-box;
  background: radial-gradient(ellipse at 50% 30%, rgba(201, 169, 110, 0.06), transparent 70%);
}
.realm-step {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.node-row {
  position: relative;
  width: 100%;
  height: 68rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.realm-line {
  position: absolute;
  top: 50%;
  width: 50%;
  height: 2rpx;
  background: rgba(255, 255, 255, 0.12);
  &--left { left: 0; }
  &--right { right: 0; }
}
.node-core {
  position: relative;
  z-index: 1;
  width: 48rpx;
  height: 48rpx;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2rpx solid rgba(255, 255, 255, 0.15);
  background: #15120e;
  display: flex;
  align-items: center;
  justify-content: center;
}
.node-icon { font-size: 24rpx; line-height: 1; color: rgba(255, 255, 255, 0.3); }
.chapter-progress-bar {
  width: 56rpx;
  max-width: 70%;
  height: 4rpx;
  margin: 4rpx 0 10rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4rpx;
  overflow: hidden;
}
.chapter-progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #c9a96e, #e8d5a3);
  transition: width 0.4s ease;
}
.realm-label {
  display: block;
  width: 100%;
  padding: 0 4rpx;
  box-sizing: border-box;
  text-align: center;
  font-size: 22rpx;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.4);
  white-space: normal;
  word-break: break-all;
}
.realm-step--completed {
  .node-core { background: #c9a96e; border-color: #c9a96e; }
  .node-icon { color: #1a1008; }
  .realm-line { background: rgba(201, 169, 110, 0.5); }
  .realm-label { color: #c9a96e; }
}
.realm-step--current {
  .node-core { border-color: #c9a96e; box-shadow: 0 0 12rpx rgba(201, 169, 110, 0.25); }
  .node-icon, .realm-label { color: #e8d5a3; }
  .realm-label { font-weight: 600; }
}
</style>
