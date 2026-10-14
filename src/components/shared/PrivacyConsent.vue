<!--
  隐私政策与用户协议同意弹窗
 合规要求：不可默认勾选，必须由用户主动阅读后自行选择
 仅在用户未同意或协议版本更新时显示
-->
<template>
  <view v-if="visible" class="pc-mask" catchtouchmove @tap.stop>
    <view class="pc-dialog" @tap.stop>
      <!-- 顶部图标 -->
      <view class="pc-header">
        <view class="pc-icon">
          <view class="pc-icon__shield" />
        </view>
        <text class="pc-title">欢迎来到宁好星图</text>
      </view>

      <!-- 引导文案 -->
      <view class="pc-body">
        <text class="pc-desc">
          在使用本应用前，请您仔细阅读并充分理解以下协议的全部内容。勾选即表示您已阅读并同意相关条款。
        </text>

        <!-- 协议勾选区 -->
        <view class="pc-options">
          <view class="pc-option" @tap="togglePrivacy">
            <view class="pc-checkbox" :class="{ 'is-checked': privacyChecked }">
              <view v-if="privacyChecked" class="pc-checkbox__mark" />
            </view>
            <text class="pc-option__label">我已阅读并同意</text>
            <text class="pc-option__link" @tap.stop="openPrivacy">《隐私政策》</text>
          </view>

          <view class="pc-option" @tap="toggleTerms">
            <view class="pc-checkbox" :class="{ 'is-checked': termsChecked }">
              <view v-if="termsChecked" class="pc-checkbox__mark" />
            </view>
            <text class="pc-option__label">我已阅读并同意</text>
            <text class="pc-option__link" @tap.stop="openTerms">《用户服务协议》</text>
          </view>
        </view>

        <text class="pc-tip" v-if="!canConfirm">
          请先阅读并勾选上述全部协议后继续
        </text>
      </view>

      <!-- 底部按钮 -->
      <view class="pc-footer">
        <view class="pc-btn" :class="{ 'is-disabled': !canConfirm }" @tap="handleConfirm">
          <text class="pc-btn__text">同意并继续</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'agreed'): void
}>()

const privacyChecked = ref(false)
const termsChecked = ref(false)

const canConfirm = computed(() => privacyChecked.value && termsChecked.value)

function togglePrivacy() {
  privacyChecked.value = !privacyChecked.value
}

function toggleTerms() {
  termsChecked.value = !termsChecked.value
}

function openPrivacy() {
  uni.navigateTo({ url: '/pagesUser/legal/index?type=privacy' })
}

function openTerms() {
  uni.navigateTo({ url: '/pagesUser/legal/index?type=terms' })
}

function handleConfirm() {
  if (!canConfirm.value) {
    uni.showToast({ title: '请先勾选全部协议', icon: 'none', duration: 1500 })
    return
  }
  emit('agreed')
}

// 暴露给父组件重置（协议版本更新时使用）
defineExpose({ privacyChecked, termsChecked })
</script>

<style lang="scss" scoped>
.pc-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.72);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
  backdrop-filter: blur(6rpx);
}

.pc-dialog {
  width: 100%;
  max-width: 620rpx;
  background: linear-gradient(180deg, #2a1250 0%, #1a0833 100%);
  border-radius: 32rpx;
  padding: 56rpx 44rpx 44rpx;
  box-shadow:
    0 20rpx 60rpx rgba(0, 0, 0, 0.6),
    0 0 0 2rpx rgba(255, 215, 0, 0.2),
    inset 0 2rpx 0 rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -100rpx;
    right: -100rpx;
    width: 240rpx;
    height: 240rpx;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.15), transparent 70%);
    pointer-events: none;
  }
}

.pc-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32rpx;
  position: relative;
}

.pc-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(108, 60, 224, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
  border: 2rpx solid rgba(255, 215, 0, 0.35);
  box-shadow: 0 0 30rpx rgba(255, 215, 0, 0.25);

  &__shield {
    width: 44rpx;
    height: 52rpx;
    background: linear-gradient(180deg, #ffd700, #c7a600);
    clip-path: polygon(50% 0, 100% 18%, 100% 65%, 50% 100%, 0 65%, 0 18%);
    border-radius: 4rpx;
    position: relative;

    &::after {
      content: '✓';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1a0533;
      font-size: 32rpx;
      font-weight: 900;
      padding-bottom: 6rpx;
    }
  }
}

.pc-title {
  font-size: 40rpx;
  font-weight: 800;
  color: $accent-gold;
  letter-spacing: 2rpx;
}

.pc-body {
  position: relative;
}

.pc-desc {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.7;
  margin-bottom: 32rpx;
  text-align: justify;
}

.pc-options {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.pc-option {
  display: flex;
  align-items: center;
  padding: 20rpx 22rpx;
  background: rgba(255, 255, 255, 0.04);
  border: 1rpx solid rgba(255, 255, 255, 0.08);
  border-radius: 18rpx;
  transition: all 0.2s ease;

  &:active {
    background: rgba(255, 255, 255, 0.08);
    transform: scale(0.99);
  }

  &__label {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.85);
    margin-left: 14rpx;
  }

  &__link {
    font-size: 28rpx;
    color: $accent-gold;
    font-weight: 600;
    margin-left: 4rpx;
  }
}

.pc-checkbox {
  width: 40rpx;
  height: 40rpx;
  border-radius: 10rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.35);
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &.is-checked {
    background: linear-gradient(135deg, #ffd700, #c7a600);
    border-color: #ffd700;
    box-shadow: 0 0 16rpx rgba(255, 215, 0, 0.5);
  }

  &__mark {
    width: 20rpx;
    height: 12rpx;
    border-left: 3rpx solid #1a0533;
    border-bottom: 3rpx solid #1a0533;
    transform: rotate(-45deg) translate(1rpx, -2rpx);
  }
}

.pc-tip {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: rgba(255, 180, 100, 0.9);
  margin-top: 8rpx;
}

.pc-footer {
  margin-top: 36rpx;
  position: relative;
}

.pc-btn {
  width: 100%;
  height: 92rpx;
  border-radius: 46rpx;
  background: linear-gradient(135deg, #ffd700 0%, #ffe44d 50%, #c7a600 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 215, 0, 0.35);
  transition: all 0.2s ease;

  &:active:not(.is-disabled) {
    transform: scale(0.98);
  }

  &.is-disabled {
    opacity: 0.45;
    box-shadow: none;
    filter: grayscale(0.3);
  }

  &__text {
    font-size: 32rpx;
    font-weight: 800;
    color: #1a0533;
    letter-spacing: 4rpx;
  }
}
</style>
