/**
 * 灵魂星图 - 应用入口文件
 * 初始化 Vue 应用并安装 Pinia 状态管理
 */
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)

  // 安装 Pinia 状态管理
  const pinia = createPinia()
  app.use(pinia)

  return {
    app,
    pinia,
  }
}
