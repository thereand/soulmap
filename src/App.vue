<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { initCloud } from '@/services/cloud'
import { initAnalytics, flush } from '@/utils/analytics'

onLaunch(() => {
  console.log('[SoulMap] App Launch')
  // 初始化微信云开发环境（仅微信小程序端生效）
  initCloud()
  // 初始化埋点系统
  initAnalytics()
})

onShow(() => {
  console.log('[SoulMap] App Show')
})

onHide(() => {
  console.log('[SoulMap] App Hide')
  // 应用切到后台时，强制上报剩余埋点
  void flush()
})
</script>

<style lang="scss">
/* 引入全局样式 */
@import '@/styles/theme.scss';
@import '@/styles/animation.scss';

/* 全局 box-sizing 重置 */
view, text, image, scroll-view, swiper, swiper-item {
  box-sizing: border-box;
}

/* 全局基础样式重置 */
page {
  background-color: $bg-primary;
  color: $text-primary;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue',
    'Microsoft YaHei', sans-serif;
  font-size: $font-base;
  line-height: 1.6;
  min-height: 100vh;
}

/* 全局滚动条样式（H5端） */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba($accent-gold, 0.3);
  border-radius: 3px;
}

/* 安全区域适配 */
.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

/* 通用工具类 */
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.text-gradient {
  background: linear-gradient(135deg, $accent-gold, $accent-blue);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ===== H5 响应式适配 ===== */
/* #ifdef H5 */
@media screen and (min-width: 768px) {
  page, uni-page-body {
    max-width: 480px;
    margin: 0 auto;
    position: relative;
  }
}

@media screen and (max-width: 767px) {
  page {
    font-size: 16px;
  }
}
/* #endif */
</style>
