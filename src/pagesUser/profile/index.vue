<!--
  灵魂星图 - 个人中心页
  用户信息展示、设置、会员管理入口
-->
<template>
  <view class="page-profile">
    <text class="page-title">个人中心</text>
    <text class="page-desc">用户信息与设置（待实现）</text>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'

onLoad(() => {
  console.log('[Page] 个人中心页加载')
})
</script>

<style lang="scss" scoped>
.page-profile {
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
