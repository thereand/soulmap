<!--
  灵魂星图 - 分享海报生成组件

  使用 Canvas 2D API 绘制 750×1334 星空主题分享海报，
  支持保存到相册和分享给好友。

  挂载时自动开始绘制，完成后展示预览和操作按钮。
-->
<template>
  <view class="share-poster">
    <!-- 隐藏的 Canvas（用于绘制） -->
    <canvas
      id="sharePosterCanvas"
      canvas-id="sharePosterCanvas"
      type="2d"
      class="share-poster__canvas"
      :style="{ width: canvasDisplayWidth + 'px', height: canvasDisplayHeight + 'px' }"
    />

    <!-- 海报预览（生成完成后展示） -->
    <view v-if="posterPath" class="share-poster__preview">
      <image
        :src="posterPath"
        class="share-poster__preview-img"
        mode="widthFix"
        show-menu-by-longpress
      />
    </view>

    <!-- 生成中遮罩 -->
    <view v-if="isGenerating" class="share-poster__generating">
      <view class="share-poster__spinner" />
      <text class="share-poster__generating-text">正在生成海报…</text>
    </view>

    <!-- 操作按钮区 -->
    <view v-if="posterPath" class="share-poster__actions">
      <view class="share-poster__action-btn share-poster__action-btn--primary" @tap="handleSave">
        <text class="share-poster__action-icon">💾</text>
        <text class="share-poster__action-text">保存到相册</text>
      </view>

      <view class="share-poster__action-btn share-poster__action-btn--secondary" @tap="handleShareMoments">
        <text class="share-poster__action-icon">🌟</text>
        <text class="share-poster__action-text">发朋友圈</text>
      </view>

      <view class="share-poster__action-btn share-poster__action-btn--ghost" @tap="handleCopyLink">
        <text class="share-poster__action-icon">🔗</text>
        <text class="share-poster__action-text">复制链接</text>
      </view>
    </view>

    <!-- 错误提示 -->
    <view v-if="errorMsg" class="share-poster__error">
      <text class="share-poster__error-text">{{ errorMsg }}</text>
      <view class="share-poster__retry-btn" @tap="handleRetry">
        <text class="share-poster__retry-text">重新生成</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, computed } from 'vue'
import type { PersonalityTypeData } from '@/data/results/types'
import { useShare } from '@/composables/useShare'

/* ===== Props ===== */

interface Props {
  /** 人格类型数据 */
  personalityType: PersonalityTypeData
  /** 结果代码（如 'INTJ'） */
  resultCode: string
}

const props = defineProps<Props>()

/* ===== Emits ===== */

const emit = defineEmits<{
  (e: 'generated', path: string): void
  (e: 'error', msg: string): void
}>()

/* ===== 状态 ===== */

const {
  isGenerating,
  posterPath,
  errorMsg,
  generatePoster,
  saveToAlbum,
  shareToMoments,
  copyShareLink,
} = useShare()

/** 当前组件实例（小程序端需要传入） */
const instance = getCurrentInstance()

/** Canvas 展示尺寸（小程序端 Canvas 不能隐藏，缩到很小） */
const canvasDisplayWidth = computed(() => (posterPath.value ? 1 : 375))
const canvasDisplayHeight = computed(() => (posterPath.value ? 1 : 667))

/* ===== 生命周期 ===== */

onMounted(async () => {
  // 延迟一帧确保 Canvas 节点已挂载
  setTimeout(() => {
    startGenerate()
  }, 300)
})

/* ===== 方法 ===== */

async function startGenerate(): Promise<void> {
  const componentInstance = instance?.proxy ?? undefined
  const path = await generatePoster(props.personalityType, 'sharePosterCanvas', componentInstance)
  if (path) {
    emit('generated', path)
  } else if (errorMsg.value) {
    emit('error', errorMsg.value)
  }
}

function handleSave(): void {
  saveToAlbum()
}

function handleShareMoments(): void {
  shareToMoments()
}

function handleCopyLink(): void {
  copyShareLink(props.resultCode)
}

async function handleRetry(): Promise<void> {
  await startGenerate()
}

/* ===== 暴露给父组件 ===== */

defineExpose({
  /** 重新生成海报 */
  regenerate: startGenerate,
  /** 当前海报路径 */
  posterPath,
})
</script>

<style lang="scss" scoped>
.share-poster {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  /* Canvas 绘制层（缩小显示，不影响像素尺寸） */
  &__canvas {
    position: absolute;
    left: -9999rpx;
    top: -9999rpx;
    /* 小程序 Canvas 不能设为 display:none，放屏幕外 */
  }

  /* 海报预览 */
  &__preview {
    width: 100%;
    border-radius: $radius-lg;
    overflow: hidden;
    box-shadow:
      0 0 60rpx rgba(108, 60, 224, 0.2),
      0 20rpx 60rpx rgba(0, 0, 0, 0.4);
    border: 2rpx solid rgba(255, 255, 255, 0.08);
    margin-bottom: $spacing-xl;
    animation: posterFadeIn 0.6s ease forwards;
  }

  &__preview-img {
    width: 100%;
    display: block;
  }

  /* 生成中 */
  &__generating {
    width: 100%;
    min-height: 400rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-lg;
    background: rgba(108, 60, 224, 0.06);
    border-radius: $radius-lg;
    border: 1rpx dashed rgba(108, 60, 224, 0.3);
    margin-bottom: $spacing-xl;
  }

  &__spinner {
    width: 64rpx;
    height: 64rpx;
    border: 4rpx solid rgba(108, 60, 224, 0.2);
    border-top-color: $brand-primary;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  &__generating-text {
    font-size: $font-sm;
    color: $text-secondary;
    letter-spacing: 2rpx;
  }

  /* 操作按钮区 */
  &__actions {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    animation: posterFadeIn 0.6s ease 0.2s both;
  }

  &__action-btn {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: $spacing-sm;
    padding: $spacing-md $spacing-xl;
    border-radius: $radius-full;
    transition: all 0.2s ease;
    cursor: pointer;

    &:active {
      transform: scale(0.97);
      opacity: 0.85;
    }

    &--primary {
      background: linear-gradient(135deg, $brand-primary 0%, #8b5cf6 100%);
      box-shadow: 0 8rpx 30rpx rgba(108, 60, 224, 0.4);

      .share-poster__action-text {
        color: #ffffff;
        font-weight: 700;
      }
    }

    &--secondary {
      background: rgba(108, 60, 224, 0.12);
      border: 1.5rpx solid rgba(108, 60, 224, 0.35);

      .share-poster__action-text {
        color: rgba(255, 255, 255, 0.9);
        font-weight: 600;
      }
    }

    &--ghost {
      background: transparent;
      border: 1.5rpx solid rgba(255, 255, 255, 0.12);

      .share-poster__action-text {
        color: $text-secondary;
        font-weight: 500;
      }
    }
  }

  &__action-icon {
    font-size: 36rpx;
  }

  &__action-text {
    font-size: $font-base;
    letter-spacing: 2rpx;
  }

  /* 错误提示 */
  &__error {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-xl;
    background: rgba(244, 67, 54, 0.08);
    border-radius: $radius-lg;
    border: 1rpx solid rgba(244, 67, 54, 0.2);
  }

  &__error-text {
    font-size: $font-sm;
    color: rgba(255, 100, 100, 0.9);
  }

  &__retry-btn {
    padding: $spacing-xs $spacing-lg;
    border-radius: $radius-full;
    background: rgba(244, 67, 54, 0.15);
    border: 1rpx solid rgba(244, 67, 54, 0.3);

    &:active {
      opacity: 0.7;
    }
  }

  &__retry-text {
    font-size: $font-sm;
    color: #ff6b6b;
    font-weight: 600;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes posterFadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
