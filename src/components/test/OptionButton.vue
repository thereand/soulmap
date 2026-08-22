<!--
  灵魂星图 - 选项按钮
  水墨仙侠风格：玉牌卡片 + 选中金光 + 涟漪反馈
-->
<template>
  <view
    class="option-btn"
    :class="{
      'option-btn--selected': selected,
      'option-btn--disabled': disabled,
      'option-btn--enter': enter,
    }"
    :style="{ animationDelay: `${index * 120}ms` }"
    @tap="handleTap"
  >
    <!-- 涟漪效果层 -->
    <view v-if="showRipple" class="ripple-effect"></view>

    <!-- 选项序号标记 -->
    <view class="option-index">
      <text>{{ indexLabel }}</text>
    </view>

    <!-- 选项文字 -->
    <view class="option-body">
      <text class="option-text">{{ text }}</text>
    </view>

    <!-- 选中状态：右侧光点 -->
    <view v-if="selected" class="selected-indicator">
      <view class="indicator-dot"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  /** 选项文字 */
  text: string
  /** 选项索引 (0-based) */
  index: number
  /** 是否选中 */
  selected?: boolean
  /** 是否禁用 */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'select'): void
}>()

/** 入场动画标志 */
const enter = ref(false)

/** 涟漪效果 */
const showRipple = ref(false)

/** 选项标签（甲乙丙丁） */
const indexLabel = computed(() => {
  const labels = ['甲', '乙', '丙', '丁', '戊']
  return labels[props.index] ?? `${props.index + 1}`
})

function handleTap(): void {
  if (props.disabled) return

  // 涟漪效果
  showRipple.value = true
  setTimeout(() => {
    showRipple.value = false
  }, 600)

  emit('select')
}

// 触发入场动画
setTimeout(() => {
  enter.value = true
}, 50)
</script>

<style lang="scss" scoped>
.option-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx 32rpx;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
  overflow: hidden;
  cursor: pointer;
  opacity: 0;
  transform: translateY(30rpx);
  transition: all 0.3s ease;

  /* 入场动画 */
  &--enter {
    animation: optionEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  /* 墨色背景 */
  background:
    linear-gradient(135deg, rgba(20, 15, 10, 0.75) 0%, rgba(30, 25, 18, 0.65) 100%);
  border: 1.5rpx solid rgba(201, 169, 110, 0.12);
  backdrop-filter: blur(12rpx);

  /* 默认微交互 */
  &:active {
    transform: scale(0.98);
  }

  /* 选中状态 */
  &--selected {
    border-color: rgba(201, 169, 110, 0.6);
    background:
      linear-gradient(135deg, rgba(201, 169, 110, 0.08) 0%, rgba(30, 25, 18, 0.8) 100%);
    box-shadow:
      0 0 24rpx rgba(201, 169, 110, 0.15),
      inset 0 0 20rpx rgba(201, 169, 110, 0.05);

    .option-index {
      background: rgba(201, 169, 110, 0.2);
      border-color: rgba(201, 169, 110, 0.6);

      text {
        color: #c9a96e;
      }
    }

    .option-text {
      color: #e8d5a3;
    }
  }

  /* 禁用状态 */
  &--disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}

/* === 涟漪效果 === */
.ripple-effect {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(201, 169, 110, 0.2) 0%,
    rgba(201, 169, 110, 0.05) 40%,
    transparent 70%
  );
  animation: ripple 0.6s ease-out forwards;
  pointer-events: none;
}

/* === 序号标记 === */
.option-index {
  flex-shrink: 0;
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5rpx solid rgba(201, 169, 110, 0.2);
  background: rgba(201, 169, 110, 0.05);
  transition: all 0.3s ease;

  text {
    font-size: 24rpx;
    color: rgba(201, 169, 110, 0.6);
    font-family: "STKaiti", "KaiTi", "楷体", serif;
    font-weight: 500;
  }
}

/* === 选项文字 === */
.option-body {
  flex: 1;
  min-width: 0;
}

.option-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.6;
  font-family: "STKaiti", "KaiTi", "楷体", serif;
  letter-spacing: 1rpx;
  transition: color 0.3s ease;
  word-break: break-word;
  overflow-wrap: break-word;
  /* #ifdef H5 */
  font-size: 32rpx;
  /* #endif */
}

/* === 选中指示器 === */
.selected-indicator {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.indicator-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #c9a96e;
  box-shadow: 0 0 12rpx rgba(201, 169, 110, 0.6);
  animation: dotPulse 1.5s ease-in-out infinite;
}

/* === 动画 === */
@keyframes optionEnter {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes ripple {
  from {
    opacity: 1;
    transform: scale(0.8);
  }
  to {
    opacity: 0;
    transform: scale(1.2);
  }
}

@keyframes dotPulse {
  0%, 100% {
    box-shadow: 0 0 8rpx rgba(201, 169, 110, 0.4);
  }
  50% {
    box-shadow: 0 0 20rpx rgba(201, 169, 110, 0.8);
  }
}
</style>
