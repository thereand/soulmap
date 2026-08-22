<!--
  灵魂星图 - 答题主页面
  水墨仙侠风格：沉浸式全屏答题体验
-->
<template>
  <view class="page-play">
    <!-- 全局水墨背景 -->
    <view class="ink-bg">
      <view class="ink-gradient"></view>
      <view class="ink-mist ink-mist--top"></view>
      <view class="ink-mist ink-mist--bottom"></view>
      <!-- 星点装饰 -->
      <view
        v-for="i in 12"
        :key="'star-' + i"
        class="bg-star"
        :style="{
          left: `${10 + Math.random() * 80}%`,
          top: `${5 + Math.random() * 90}%`,
          animationDelay: `${Math.random() * 4}s`,
          width: `${3 + Math.random() * 4}rpx`,
          height: `${3 + Math.random() * 4}rpx`,
        }"
      ></view>
    </view>

    <!-- 状态栏占位（自定义导航栏） -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 顶部：闯关地图进度条 -->
    <view class="top-section">
      <ProgressMap
        :current-chapter="engine.currentChapter.value"
        :current-question-in-chapter="questionNumberInChapter"
        :total-chapters="5"
      />
    </view>

    <!-- 主区域：题目卡片 + 选项 -->
    <scroll-view
      class="main-section"
      scroll-y
      :scroll-into-view="scrollTarget"
      :show-scrollbar="false"
    >
      <!-- 章节信息头 -->
      <view class="chapter-header" :key="'ch-' + engine.currentChapter.value">
        <text class="chapter-badge">{{ currentChapterSubtitle }}</text>
        <text class="chapter-divider">·</text>
        <text class="chapter-count">{{ engine.questionNumberInChapter.value }} / 5</text>
      </view>

      <!-- 剧情场景卡片 -->
      <view v-if="currentQuestion" class="story-section" id="story-anchor">
        <StoryCard
          :narrative="currentQuestion.text"
          :background="currentQuestion.image || ''"
          ref="storyCardRef"
        />
      </view>

      <!-- 选项按钮区域 -->
      <view
        v-if="showOptions && currentQuestion"
        class="options-section"
        :key="'opts-' + engine.currentQuestionIndex.value"
      >
        <OptionButton
          v-for="(opt, idx) in currentQuestion.options"
          :key="opt.id"
          :text="opt.text"
          :index="idx"
          :selected="selectedOptionIndex === idx"
          :disabled="isTransitioning"
          @select="handleOptionSelect(idx)"
        />
      </view>

      <!-- 底部安全区 -->
      <view class="bottom-safe"></view>
    </scroll-view>

    <!-- 底部信息栏 -->
    <view class="bottom-bar">
      <view class="progress-hint">
        <text class="progress-label">总进度</text>
        <text class="progress-value">{{ engine.progress.value }}%</text>
      </view>
      <view class="chapter-name-display">
        <text>{{ engine.currentChapterName.value }}</text>
      </view>
      <view class="remaining-hint">
        <text>余 {{ engine.remainingQuestions.value }} 题</text>
      </view>
    </view>

    <!-- 章节过场动画 -->
    <ChapterTransition
      :chapter-number="transitionChapter"
      :fragment-name="transitionFragmentName"
      :visible="showTransition"
      @close="handleTransitionClose"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useTestEngine } from '@/composables/useTestEngine'
import { useTestStore } from '@/stores/test'
import { chapterMeta } from '@/data/chapters'
import ProgressMap from '@/components/test/ProgressMap.vue'
import StoryCard from '@/components/test/StoryCard.vue'
import OptionButton from '@/components/test/OptionButton.vue'
import ChapterTransition from '@/components/test/ChapterTransition.vue'

/* ===== 引擎初始化 ===== */
const engine = useTestEngine()
const testStore = useTestStore()

/** 状态栏高度 */
const statusBarHeight = ref(0)

/** 当前题目 */
const currentQuestion = computed(() => engine.currentQuestion.value)

/** 当前章节内题号 (1-based) */
const questionNumberInChapter = computed(() => engine.questionNumberInChapter.value)

/** 选中的选项索引 */
const selectedOptionIndex = ref(-1)

/** 是否正在过渡（禁止操作） */
const isTransitioning = ref(false)

/** 是否显示选项 */
const showOptions = ref(false)

/** 过场动画相关 */
const showTransition = ref(false)
const transitionChapter = ref(1)
const transitionFragmentName = ref('')

/** StoryCard ref */
const storyCardRef = ref<InstanceType<typeof StoryCard> | null>(null)

/** 滚动目标 */
const scrollTarget = ref('')

/** 当前章节副标题 */
const currentChapterSubtitle = computed(() => {
  const chId = `ch${engine.currentChapter.value}`
  return chapterMeta[chId]?.subtitle ?? ''
})

/* ===== 生命周期 ===== */

onLoad(() => {
  // 获取状态栏高度
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight ?? 0

  // 尝试恢复进度，若无则开始新测试
  if (!engine.hasSavedProgress()) {
    engine.startTest()
  } else {
    engine.loadProgress()
  }
})

onMounted(() => {
  // 选项延迟显示（等待叙事文字开始打字后）
  scheduleShowOptions()
})

/** 监听题目变化，重置状态 */
watch(
  () => engine.currentQuestionIndex.value,
  () => {
    // 如果即将触发章节过场，不重置状态（避免与过场watch冲突）
    if (engine.isChapterTransition.value) return

    selectedOptionIndex.value = -1
    showOptions.value = false
    isTransitioning.value = false
    scheduleShowOptions()
  },
)

/** 监听章节过场标志 */
watch(
  () => engine.isChapterTransition.value,
  (val) => {
    if (val) {
      // 刚完成的章节是 currentChapter - 1
      const finishedChapter = engine.currentChapter.value - 1
      transitionChapter.value = finishedChapter
      const chId = `ch${finishedChapter}`
      transitionFragmentName.value = chapterMeta[chId]?.fragmentName ?? '灵魂碎片'
      showTransition.value = true
      isTransitioning.value = true
    }
  },
)

/** 监听测试完成 */
watch(
  () => engine.isCompleted.value,
  (val) => {
    if (val) {
      // 计算结果
      const engineResult = engine.getResult()
      const pct = engineResult.percentages || { EI: 50, SN: 50, TF: 50, JP: 50 }
      const dims = engineResult.scores || { EI: 50, SN: 50, TF: 50, JP: 50 }

      // 转换为 TestResult 标准结构（结果页与详情页均依赖此格式）
      const testResult = {
        resultId: `result_${Date.now()}`,
        sessionId: '',
        userId: '',
        personalityType: engineResult.type as any,
        dimensionScores: dims,
        confidence: {
          EI: (pct.EI ?? 50) / 100,
          SN: (pct.SN ?? 50) / 100,
          TF: (pct.TF ?? 50) / 100,
          JP: (pct.JP ?? 50) / 100,
        },
        completedAt: Date.now(),
        duration: engineResult.duration ?? 0,
        reportUnlocked: false,
      }

      // 写入 Pinia store（结果页会从这里读）
      testStore.setResult(testResult)

      // 延迟跳转结果页
      setTimeout(() => {
        uni.redirectTo({
          url: '/pagesTest/result/index',
        })
      }, 800)
    }
  },
)

/* ===== 方法 ===== */

/** 延迟显示选项按钮 */
function scheduleShowOptions(): void {
  const narrative = currentQuestion.value?.text ?? ''
  // 打字机完成大约需要 narrative.length * 30ms，选项提前一些显示
  const delay = Math.min(narrative.length * 20, 2000)
  setTimeout(() => {
    showOptions.value = true
  }, delay)
}

/** 处理选项选择 */
function handleOptionSelect(index: number): void {
  if (isTransitioning.value) return

  selectedOptionIndex.value = index
  isTransitioning.value = true

  // 短暂延迟后记录答案并前进
  setTimeout(() => {
    engine.selectOption(index)
  }, 500)
}

/** 过场动画关闭 */
function handleTransitionClose(): void {
  showTransition.value = false
  isTransitioning.value = false
  engine.confirmChapterTransition()

  // 过场结束后重置状态，显示新题目的选项
  selectedOptionIndex.value = -1
  showOptions.value = false
  scheduleShowOptions()
}
</script>

<style lang="scss" scoped>
.page-play {
  position: relative;
  min-height: 100vh;
  background: #0a0a0f;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ===== 水墨背景 ===== */
.ink-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.ink-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(201, 169, 110, 0.03) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(120, 100, 80, 0.02) 0%, transparent 50%),
    linear-gradient(180deg, #0a0a0f 0%, #12100d 30%, #0e0c09 60%, #0a0a0f 100%);
}

.ink-mist {
  position: absolute;
  width: 200%;
  height: 300rpx;
  background: radial-gradient(ellipse, rgba(201, 169, 110, 0.03) 0%, transparent 60%);
  animation: mistFloat 12s ease-in-out infinite;

  &--top {
    top: -60rpx;
    left: -20%;
  }

  &--bottom {
    bottom: -60rpx;
    left: -30%;
    animation-delay: 5s;
    animation-direction: reverse;
  }
}

.bg-star {
  position: absolute;
  border-radius: 50%;
  background: rgba(201, 169, 110, 0.4);
  animation: starTwinkle 4s ease-in-out infinite;
}

/* ===== 状态栏 ===== */
.status-bar {
  flex-shrink: 0;
  z-index: 10;
}

/* ===== 顶部进度条 ===== */
.top-section {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
}

/* ===== 主内容区 ===== */
.main-section {
  flex: 1;
  position: relative;
  z-index: 5;
  padding: 0 32rpx;
  height: 0; /* flex 子项高度自动 */
  /* #ifdef H5 */
  max-width: 100%;
  /* #endif */
}

/* 章节信息头 */
.chapter-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 24rpx 0 16rpx;
  animation: fadeIn 0.6s ease forwards;
}

.chapter-badge {
  font-size: 24rpx;
  color: #c9a96e;
  letter-spacing: 4rpx;
  font-family: "STKaiti", "KaiTi", "楷体", serif;
}

.chapter-divider {
  font-size: 24rpx;
  color: rgba(201, 169, 110, 0.3);
}

.chapter-count {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 2rpx;
}

/* 剧情区 */
.story-section {
  margin-bottom: 24rpx;
}

/* 选项区 */
.options-section {
  padding: 8rpx 0;
}

/* 底部安全区 */
.bottom-safe {
  height: 160rpx;
}

/* ===== 底部信息栏 ===== */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 40rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, transparent 0%, rgba(10, 10, 15, 0.95) 40%);
  backdrop-filter: blur(12rpx);
  /* #ifdef H5 */
  @media screen and (min-width: 768px) {
    max-width: 480px;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }
  /* #endif */
}

.progress-hint {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.progress-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.35);
  font-family: "STKaiti", "KaiTi", "楷体", serif;
}

.progress-value {
  font-size: 28rpx;
  color: #c9a96e;
  font-weight: 500;
}

.chapter-name-display text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 4rpx;
  font-family: "STKaiti", "KaiTi", "楷体", serif;
}

.remaining-hint text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.3);
}

/* ===== 动画 ===== */
@keyframes mistFloat {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(8%); }
}

@keyframes starTwinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 0.8; transform: scale(1.2); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
