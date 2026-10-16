/**
 * 自定义 tabBar 跨页面状态
 * 三个 tab 页各自挂载 CustomTabBar 组件，通过 shared reactive state 同步选中态
 */
import { ref } from 'vue'

const activeIndex = ref(0)

const TABS = [
  { key: 'home', path: '/pages/index/index', text: '首页' },
  { key: 'history', path: '/pages/history/index', text: '历史' },
  { key: 'profile', path: '/pages/profile/index', text: '我的' },
] as const

export function useTabBar() {
  function setActive(index: number): void {
    if (index >= 0 && index < TABS.length) activeIndex.value = index
  }

  function switchTo(index: number): void {
    if (index < 0 || index >= TABS.length || index === activeIndex.value) return
    activeIndex.value = index
    uni.switchTab({ url: TABS[index].path })
  }

  return { activeIndex, TABS, setActive, switchTo }
}
