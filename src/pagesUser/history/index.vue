<!--
  已迁移至 pages/history/index（tabBar 页面）
  此文件保留但不再使用，页面已从 pages.json subPackages 移除
-->
<template>
  <view class="page-redirect">
    <text class="redirect-text">页面已迁移，正在跳转...</text>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
onMounted(() => {
  uni.switchTab({ url: '/pages/history/index' })
})
</script>

<style lang="scss" scoped>
.page-redirect {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d0118;
}
.redirect-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}
</style>
