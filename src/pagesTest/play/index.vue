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

    <!-- 状态栏与微信胶囊各自避让；进度地图放在完整导航行下方。 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
    <view class="page-nav" :style="{ height: navigationHeight + 'px', paddingRight: navigationRightInset + 'px' }">
      <button class="nav-back" aria-label="返回" @tap="handleBack">‹</button>
      <text class="nav-title">灵魂探索</text>
      <view class="star-map-wrapper">
        <StarMapIndicator :scores="engine.guideScoring.rawGuideScores.value" compact />
      </view>
    </view>

    <view class="top-section">
      <view class="progress-map-slot">
        <ProgressMap
          :current-chapter="engine.currentChapterOrder.value"
          :chapter-progress="engine.chapterProgress.value"
          :total-chapters="engine.chaptersList.value.length"
          :chapter-names="chapterNames"
        />
      </view>
    </view>

    <!-- 主区域：题目卡片 + 选项 -->
    <scroll-view
      class="main-section"
      scroll-y
      :scroll-into-view="scrollTarget"
      :show-scrollbar="false"
    >
      <view v-if="initializationError" class="state-message">
        <text>{{ initializationError }}</text>
        <button class="state-button" @tap="restartFromError">重新开始探索</button>
      </view>
      <view v-else-if="completionError" class="state-message">
        <text>{{ completionError }}</text>
        <button class="state-button" @tap="retryCompletion">重试保存结果</button>
      </view>
      <view v-else-if="engine.isCompleted.value" class="state-message">
        <text>探索已完成，正在保存结果…</text>
      </view>

      <!-- 章节信息头 -->
      <view v-if="currentQuestion" class="chapter-header" :key="'ch-' + engine.currentChapter.value">
        <text class="chapter-badge">{{ currentChapterSubtitle }}</text>
        <text class="chapter-divider">·</text>
        <text class="chapter-count">{{ engine.questionNumberInChapter.value }} / {{ currentChapterTotal }}</text>
      </view>

      <!-- 剧情场景卡片 -->
      <view v-if="currentQuestion" class="story-section" id="story-anchor">
        <StoryCard
          :narrative="currentQuestion.text"
          :background="currentQuestion.image || ''"
          ref="storyCardRef"
        />
      </view>

      <!-- 向导即时反应浮动文字 -->
      <GuideReaction
        :text="engine.currentReaction.value"
        :guide-id="engine.currentDominantGuide.value"
        :visible="!!engine.currentReaction.value"
      />

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

    <!-- 向导叙事叠加层（章节开始时显示） -->
    <GuideOverlay
      :text="currentOverlayText"
      :guide-id="engine.currentDominantGuide.value"
      :visible="showGuideOverlay"
      @complete="handleOverlayComplete"
    />

    <!-- 向导对话互动弹窗 -->
    <GuideDialogue
      :dialogue="engine.activeDialogue.value"
      :visible="engine.isDialogueActive.value"
      :guide-id="engine.currentDominantGuide.value"
      @select="handleDialogueSelect"
      @complete="handleDialogueComplete"
    />

    <!-- 灵魂共鸣动画 -->
    <SoulResonance
      :guide-id="engine.resonanceGuide.value || 'flame'"
      :visible="engine.showResonance.value"
      @complete="handleResonanceComplete"
    />

    <!-- 向导小剧场彩蛋 -->
    <GuideMiniTheater
      :guide-id="engine.miniTheaterGuide.value || 'flame'"
      :visible="engine.showMiniTheater.value"
      @complete="handleMiniTheaterComplete"
    />

    <!-- 穿插小游戏 -->
    <MiniGameOverlay
      :visible="showMiniGame"
      @complete="handleMiniGameComplete"
      @skip="handleMiniGameSkip"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { onLoad, onShow, onHide, onUnload, onResize } from '@dcloudio/uni-app'
import { useTestEngine } from '@/composables/useTestEngine'
import { useTestStore } from '@/stores/test'
import { chapterMeta } from '@/data/chapters'
import ProgressMap from '@/components/test/ProgressMap.vue'
import StoryCard from '@/components/test/StoryCard.vue'
import OptionButton from '@/components/test/OptionButton.vue'
import ChapterTransition from '@/components/test/ChapterTransition.vue'
import GuideOverlay from '@/components/test/GuideOverlay.vue'
import GuideReaction from '@/components/test/GuideReaction.vue'
import GuideDialogue from '@/components/test/GuideDialogue.vue'
import SoulResonance from '@/components/test/SoulResonance.vue'
import StarMapIndicator from '@/components/test/StarMapIndicator.vue'
import GuideMiniTheater from '@/components/test/GuideMiniTheater.vue'
import MiniGameOverlay from '@/components/test/MiniGameOverlay.vue'
import { useMiniGame } from '@/composables/useMiniGame'

/* ===== 引擎初始化 ===== */
const engine = useTestEngine()
const testStore = useTestStore()
const miniGame = useMiniGame()
const showMiniGame = ref(false)

/** 自定义导航安全区，微信胶囊使用 px 测量，不能只避让状态栏。 */
const statusBarHeight = ref(0)
const navigationHeight = ref(44)
const navigationRightInset = ref(16)
const initialized = ref(false)
const initializationError = ref('')
const chapterNames = computed(() => engine.chaptersList.value.map(chapter => chapter.name))

let pageActive = true
let disposed = false
let resultSaved = false
let finishing = false
let optionsTimer: ReturnType<typeof setTimeout> | null = null
let answerTimer: ReturnType<typeof setTimeout> | null = null
let resultTimer: ReturnType<typeof setTimeout> | null = null
let pendingAnswer: { questionId: string; optionIndex: number } | null = null

/** 不展示尚未初始化或已完成存档中的最后一题。 */
const currentQuestion = computed(() =>
  initialized.value && !engine.isCompleted.value ? engine.currentQuestion.value : null,
)

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

/** 向导叙事叠加层状态 */
const showGuideOverlay = ref(false)
const currentOverlayText = ref('')

/** 当前章节总题数（动态计算） */
const currentChapterTotal = computed(() => {
  const chId = `ch${engine.currentChapter.value}`
  const chapter = engine.chaptersList.value.find(c => c.id === chId)
  return chapter?.questionIds.length ?? 5
})

/** 当前章节副标题 */
const currentChapterSubtitle = computed(() => {
  const chId = `ch${engine.currentChapter.value}`
  return chapterMeta[chId]?.subtitle ?? ''
})

/* ===== 生命周期 ===== */

function updateNavigationMetrics(): void {
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight ?? 0
  navigationHeight.value = 44
  navigationRightInset.value = 16
  // #ifdef MP-WEIXIN
  navigationRightInset.value = 108
  try {
    const capsule = wx.getMenuButtonBoundingClientRect()
    if (capsule.width > 0 && capsule.height > 0 && capsule.top >= statusBarHeight.value) {
      const gap = capsule.top - statusBarHeight.value
      navigationHeight.value = Math.max(44, capsule.height + gap * 2)
      navigationRightInset.value = Math.max(16, info.windowWidth - capsule.left + 12)
    }
  } catch (error) {
    console.warn('[Play] 胶囊尺寸读取失败，使用安全区兜底', error)
  }
  // #endif
}

onLoad((query) => {
  updateNavigationMetrics()
  const saved = engine.inspectSavedProgress()
  if (query?.resume === 'fresh' || (saved.status === 'none' && query?.resume !== 'continue')) {
    initialized.value = engine.startTest()
    if (!initialized.value) initializationError.value = '无法保存新的答题进度，请检查本机存储后重试。'
  } else if (saved.status === 'unfinished' || (saved.status === 'completed' && saved.version === 2)) {
    initialized.value = engine.loadProgress()
    if (!initialized.value) initializationError.value = '进度恢复失败，请重新开始探索。'
  } else if (saved.status === 'completed') {
    // 兼容旧版 36 题已答完的残留存档：不能当作最后一题继续，也不重复创建结果。
    testStore.hydrateResultFromStorage()
    if (testStore.result) {
      uni.redirectTo({ url: '/pagesTest/result/index' })
    } else {
      initializationError.value = '上次探索已结束，旧版存档不能继续答题。请重新开始。'
    }
  } else {
    initializationError.value = saved.status === 'none'
      ? '没有可继续的探索，请重新开始。'
      : '上次进度数据异常，已保留原记录。请重新开始探索。'
  }
})

onMounted(() => { scheduleShowOptions() })
onResize(() => { updateNavigationMetrics() })
onShow(() => {
  pageActive = true
  if (resultSaved) scheduleResultNavigation()
  else if (engine.isCompleted.value) finishTest()
  else scheduleShowOptions()
})

function suspendPage(): void {
  pageActive = false
  settlePendingAnswer()
  if (initialized.value && !resultSaved) engine.saveProgress()
  cancelTimers()
}

onHide(() => { suspendPage() })
onUnload(() => {
  suspendPage()
  disposed = true
})

function cancelTimers(): void {
  if (optionsTimer) clearTimeout(optionsTimer)
  if (answerTimer) clearTimeout(answerTimer)
  if (resultTimer) clearTimeout(resultTimer)
  optionsTimer = answerTimer = resultTimer = null
}

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

    // 新章节的第一题时，显示向导叙事叠加层
    if (engine.questionNumberInChapter.value === 1) {
      const chId = `ch${engine.currentChapter.value}`
      const overlayText = engine.getChapterOverlay(chId)
      if (overlayText) {
        currentOverlayText.value = overlayText
        showGuideOverlay.value = true
      }
    }
  },
)

/** 监听章节过场标志 */
watch(
  () => engine.isChapterTransition.value,
  (val) => {
    if (val) {
      // 身份使用 chapterId，显示编号使用配置 order；ch6 实际是第四章。
      const chId = engine.transitionFromChapterId.value || ''
      transitionChapter.value = engine.chaptersList.value.find(chapter => chapter.id === chId)?.order ?? 1
      transitionFragmentName.value = chapterMeta[chId]?.fragmentName ?? '灵魂碎片'
      showTransition.value = true
      isTransitioning.value = true
    }
  },
)

/** 完成检查点和结果使用相同 resultId；重试或重新进入不重复创建历史。 */
const completionError = ref('')
watch(() => engine.isCompleted.value, (completed) => {
  if (completed) finishTest()
})

function finishTest(): void {
  if (disposed || finishing || resultSaved || !engine.isCompleted.value) return
  finishing = true
  try {
    const result = engine.getResult()
    const pct = result.percentages
    const saved = testStore.setResult({
      resultId: result.resultId,
      sessionId: result.testId,
      userId: '',
      personalityType: result.type as any,
      dimensionScores: result.scores,
      confidence: { EI: pct.EI / 100, SN: pct.SN / 100, TF: pct.TF / 100, JP: pct.JP / 100 },
      completedAt: Date.parse(result.completedAt),
      duration: result.duration,
      reportUnlocked: false,
    }, result.guideResult.rawScores, result.guideResult.combination, result.journeyStory)
    if (!saved) {
      completionError.value = '结果保存失败，答题记录已保留。请重试保存。'
      return
    }
    resultSaved = true
    completionError.value = ''
    engine.acknowledgeCompletion()
    scheduleResultNavigation()
  } catch (error) {
    console.error('[Play] 保存结果失败', error)
    completionError.value = '结果保存失败，答题记录已保留。请重试保存。'
  } finally {
    finishing = false
  }
}

function scheduleResultNavigation(): void {
  if (!pageActive || disposed || resultTimer) return
  resultTimer = setTimeout(() => {
    resultTimer = null
    if (pageActive && !disposed) uni.redirectTo({ url: '/pagesTest/result/index' })
  }, 800)
}

/* ===== 方法 ===== */

/** 页面退出后，旧定时器不能显示新题选项或覆盖新测试。 */
function scheduleShowOptions(): void {
  if (optionsTimer) clearTimeout(optionsTimer)
  if (!pageActive || disposed || !currentQuestion.value || engine.isDialogueActive.value || engine.isChapterTransition.value) return
  const questionId = currentQuestion.value.id
  const delay = Math.min(currentQuestion.value.text.length * 20, 2000)
  optionsTimer = setTimeout(() => {
    optionsTimer = null
    if (!disposed && pageActive && currentQuestion.value?.id === questionId) showOptions.value = true
  }, delay)
}

function handleOptionSelect(index: number): void {
  if (isTransitioning.value || !currentQuestion.value || engine.isDialogueActive.value || engine.isCompleted.value) return
  selectedOptionIndex.value = index
  isTransitioning.value = true
  pendingAnswer = { questionId: currentQuestion.value.id, optionIndex: index }
  answerTimer = setTimeout(settlePendingAnswer, 500)
}

/** 切后台/退出时也结算用户已经选中的答案，避免 500ms 动画窗口丢题。 */
function settlePendingAnswer(): void {
  if (answerTimer) clearTimeout(answerTimer)
  answerTimer = null
  const pending = pendingAnswer
  pendingAnswer = null
  if (!pending || disposed || engine.currentQuestion.value?.id !== pending.questionId) return
  engine.selectOption(pending.optionIndex)
  if (engine.progress.value === 100 && !engine.isCompleted.value) {
    completionError.value = '答题完成，进度保存失败。请重试保存。'
  }
}

function retryCompletion(): void {
  if (!engine.isCompleted.value && !engine.saveProgress()) return
  finishTest()
}

function restartFromError(): void {
  uni.redirectTo({ url: '/pagesTest/intro/index' })
}

function handleBack(): void {
  if (getCurrentPages().length > 1) uni.navigateBack()
  else uni.reLaunch({ url: '/pages/index/index' })
}

/** 过场动画关闭 */
function handleTransitionClose(): void {
  showTransition.value = false
  isTransitioning.value = false

  // 在 ch3→ch4、ch4→ch5 过渡时触发穿插小游戏
  const fromChId = engine.transitionFromChapterId.value || ''
  if ((fromChId === 'ch3' || fromChId === 'ch4') && !showMiniGame.value) {
    const triggered = miniGame.triggerMiniGame(fromChId)
    if (triggered) {
      showMiniGame.value = true
      engine.confirmChapterTransition()
      return // 等小游戏结束后再推进题目
    }
  }

  engine.confirmChapterTransition()

  // 过场结束后重置状态，显示新题目的选项
  selectedOptionIndex.value = -1
  showOptions.value = false
  scheduleShowOptions()
}

/** 穿插小游戏完成 */
function handleMiniGameComplete(): void {
  showMiniGame.value = false
  // 小游戏结束后推进到下一题
  selectedOptionIndex.value = -1
  isTransitioning.value = false
  showOptions.value = false
  scheduleShowOptions()
}

/** 穿插小游戏跳过 */
function handleMiniGameSkip(): void {
  showMiniGame.value = false
  selectedOptionIndex.value = -1
  isTransitioning.value = false
  showOptions.value = false
  scheduleShowOptions()
}

/** 向导叙事叠加层完成 */
function handleOverlayComplete(): void {
  showGuideOverlay.value = false
}

/** 向导对话选择 */
function handleDialogueSelect(payload: { optionIndex: number }): void {
  if (disposed || !engine.isDialogueActive.value) return
  engine.handleDialogueSelect(payload.optionIndex)
  // 正常答题会移动游标，恢复对话时可能保持原游标；两种路径都显式恢复选项。
  if (!engine.isDialogueActive.value && !engine.isChapterTransition.value && !engine.isCompleted.value) {
    selectedOptionIndex.value = -1
    isTransitioning.value = false
    showOptions.value = false
    scheduleShowOptions()
  }
}

/** 恢复时游标已指向下一未答题，关闭对话后不一定触发题号 watcher。 */
function handleDialogueComplete(): void {
  if (disposed || engine.isCompleted.value || engine.isDialogueActive.value) return
  selectedOptionIndex.value = -1
  isTransitioning.value = false
  showOptions.value = false
  scheduleShowOptions()
}

/** 灵魂共鸣动画完成 */
function handleResonanceComplete(): void {
  engine.confirmResonance()
}

/** 向导小剧场彩蛋完成 */
function handleMiniTheaterComplete(): void {
  engine.confirmMiniTheater()
}
</script>

<style lang="scss" scoped>
.page-play {
  position: relative;
  height: 100vh;
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

.page-nav {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-left: 12px;
  box-sizing: border-box;
  gap: 8px;
}
.nav-back {
  width: 32px;
  height: 36px;
  line-height: 32px;
  padding: 0;
  margin: 0;
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: #e8d5a3;
  font-size: 32px;
  &::after { border: none; }
}
.nav-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
  line-height: 1.5;
  color: #e8d5a3;
}
.star-map-wrapper { flex-shrink: 0; }

/* 完成进度占据独立整行，微信胶囊与星图不再压缩地图宽度。 */
.top-section {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  padding: 0 16rpx;
}
.progress-map-slot { width: 100%; min-width: 0; }
.state-message {
  padding: 48rpx 16rpx;
  color: #e8d5a3;
  text-align: center;
  line-height: 1.8;
}
.state-button {
  margin-top: 24rpx;
  font-size: 28rpx;
  color: #1a1008;
  background: #c9a96e;
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
  flex-wrap: wrap;
  padding: 16rpx 0;
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

/* 底栏占据独立 flex 行，内容无需猜测固定遮挡高度。 */
.bottom-safe { height: 32rpx; }
.bottom-bar {
  position: relative;
  flex-shrink: 0;
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx 24rpx;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(10, 10, 15, 0.95);
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
