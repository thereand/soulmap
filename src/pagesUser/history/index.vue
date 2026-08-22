<!--
  灵魂星图 - 历史记录页
  展示用户的测试历史列表
-->
<template>
  <view class="page-history">
    <text class="page-title">历史记录</text>
    <text class="page-desc">你的测试历程（待实现）</text>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'

onLoad(() => {
  console.log('[Page] 历史记录页加载')
})
</script>

<style lang="scss" scoped>
.page-history {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl;
}

.page-title {
  font-size: $font-xxl;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.page-desc {
  font-size: $font-base;
  color: $text-secondary;
}
</style>
