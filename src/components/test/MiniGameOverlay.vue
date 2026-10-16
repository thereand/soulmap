<!--
  MiniGameOverlay — 穿插小游戏叠加层
  全屏半透明遮罩 + 居中游戏区域，支持 4 种小游戏
-->
<template>
  <view v-if="visible && currentGameId" class="mini-game-overlay" @tap.stop>
    <!-- 遮罩背景 -->
    <view class="overlay-bg" />

    <!-- 游戏容器 -->
    <view class="game-container">
      <!-- 游戏标题 -->
      <text class="game-title">{{ gameTitle }}</text>
      <text class="game-subtitle">{{ gameSubtitle }}</text>

      <!-- 1. 能量收集 -->
      <view v-if="currentGameId === 'energy-collect'" class="game-area energy-collect">
        <view class="ec-field">
          <view
            v-for="(star, idx) in energyStars"
            :key="'ec-' + idx"
            class="ec-star"
            :style="{ left: star.x + '%', top: star.y + '%', opacity: star.visible ? 1 : 0 }"
            @tap="collectStar(idx)"
          >
            <text class="star-icon">✦</text>
          </view>
        </view>
        <view class="ec-info">
          <text class="ec-count">已收集 {{ energyCollected }} / 5</text>
          <text class="ec-timer" :class="{ 'ec-timer--warn': energyTimer <= 3 }">剩余 {{ energyTimer }}s</text>
        </view>
      </view>

      <!-- 2. 灵魂碎片拼图 -->
      <view v-if="currentGameId === 'soul-puzzle'" class="game-area soul-puzzle">
        <view class="sp-grid">
          <view
            v-for="(piece, idx) in puzzlePieces"
            :key="'sp-' + idx"
            class="sp-piece"
            :class="{ 'sp-piece--correct': piece.correct, 'sp-piece--selected': piece.selected }"
            @tap="togglePuzzlePiece(idx)"
          >
            <text class="sp-piece-icon">{{ piece.correct ? '◆' : '◇' }}</text>
          </view>
        </view>
        <text class="sp-hint">点击碎片使其归位（需归位 4 块）· 已归位 {{ puzzleCorrectCount }}/4</text>
      </view>

      <!-- 3. 向导选择 -->
      <view v-if="currentGameId === 'guide-pick'" class="game-area guide-pick">
        <view class="gp-cards">
          <view
            v-for="guide in guideOptions"
            :key="guide.id"
            class="gp-card"
            :class="{ 'gp-card--selected': selectedGuide === guide.id }"
            @tap="pickGuide(guide.id)"
          >
            <text class="gp-card-icon">{{ guide.icon }}</text>
            <text class="gp-card-name">{{ guide.name }}</text>
            <text class="gp-card-desc">{{ guide.desc }}</text>
          </view>
        </view>
      </view>

      <!-- 4. 星图点亮 -->
      <view v-if="currentGameId === 'star-sequence'" class="game-area star-sequence">
        <view class="ss-field">
          <view
            v-for="(star, idx) in sequenceStars"
            :key="'ss-' + idx"
            class="ss-star"
            :class="{
              'ss-star--blinking': star.blinking,
              'ss-star--lit': star.lit,
              'ss-star--wrong': star.wrong,
            }"
            :style="{ left: star.x + '%', top: star.y + '%' }"
            @tap="tapSequenceStar(idx)"
          >
            <text class="ss-star-icon">{{ star.lit ? '★' : '☆' }}</text>
          </view>
        </view>
        <text class="ss-hint">{{ sequencePhase === 'show' ? '记住闪烁顺序…' : '按顺序点亮星星 · ' + sequenceLitCount + '/5' }}</text>
      </view>

      <!-- 完成奖励动画 -->
      <view v-if="showReward" class="reward-overlay">
        <view class="reward-content">
          <text class="reward-icon">✧</text>
          <text class="reward-text">{{ rewardDescription }}</text>
          <view class="reward-particles">
            <view v-for="i in 8" :key="'rp-' + i" class="reward-particle" :style="{ animationDelay: i * 0.1 + 's' }"></view>
          </view>
        </view>
      </view>

      <!-- 跳过按钮 -->
      <view v-if="!showReward" class="skip-btn" @tap="handleSkip">
        <text class="skip-text">跳过</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useMiniGame, type MiniGameId, type MiniGameReward } from '@/composables/useMiniGame'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'complete'): void
  (e: 'skip'): void
}>()

const { gameId, completeGame, cancelGame, updateProgress } = useMiniGame()
const currentGameId = computed(() => gameId.value)

/* ===== 通用 ===== */

const gameTitles: Record<MiniGameId, string> = {
  'energy-collect': '能量收集',
  'soul-puzzle': '灵魂碎片拼图',
  'guide-pick': '灵魂共鸣',
  'star-sequence': '星图点亮',
}

const gameSubtitles: Record<MiniGameId, string> = {
  'energy-collect': '点击闪烁的星星收集能量',
  'soul-puzzle': '点击碎片使其归位',
  'guide-pick': '选择与你最有共鸣的向导',
  'star-sequence': '按顺序点亮星星',
}

const gameTitle = computed(() => currentGameId.value ? gameTitles[currentGameId.value] : '')
const gameSubtitle = computed(() => currentGameId.value ? gameSubtitles[currentGameId.value] : '')

const showReward = ref(false)
const rewardDescription = ref('')

let rewardTimer: ReturnType<typeof setTimeout> | null = null

function finishWithReward(reward: MiniGameReward): void {
  rewardDescription.value = reward.description
  showReward.value = true
  updateProgress(100)

  rewardTimer = setTimeout(() => {
    showReward.value = false
    completeGame(reward)
    emit('complete')
  }, 2000)
}

function handleSkip(): void {
  cleanup()
  cancelGame()
  emit('skip')
}

function cleanup(): void {
  if (energyInterval) clearInterval(energyInterval)
  if (energyCountdown) clearInterval(energyCountdown)
  if (sequenceShowTimer) clearTimeout(sequenceShowTimer)
  if (rewardTimer) clearTimeout(rewardTimer)
  energyInterval = null
  energyCountdown = null
  sequenceShowTimer = null
  rewardTimer = null
}

onBeforeUnmount(cleanup)

/* ===== 1. 能量收集 ===== */

interface EnergyStar { x: number; y: number; visible: boolean }

const energyStars = ref<EnergyStar[]>([])
const energyCollected = ref(0)
const energyTimer = ref(8)
let energyInterval: ReturnType<typeof setInterval> | null = null
let energyCountdown: ReturnType<typeof setInterval> | null = null

function initEnergyCollect(): void {
  energyCollected.value = 0
  energyTimer.value = 8
  energyStars.value = []
  spawnEnergyStar()

  energyInterval = setInterval(() => {
    if (energyStars.value.filter(s => s.visible).length < 3) {
      spawnEnergyStar()
    }
  }, 800)

  energyCountdown = setInterval(() => {
    energyTimer.value--
    if (energyTimer.value <= 0) {
      // 时间到
      cleanup()
      const bonus = Math.max(1, energyCollected.value)
      finishWithReward({
        guideBonus: { star: bonus, flame: Math.floor(bonus / 2) },
        description: `收集了 ${energyCollected.value} 颗能量星！星之向导亲和度 +${bonus}`,
      })
    }
  }, 1000)
}

function spawnEnergyStar(): void {
  energyStars.value.push({
    x: 10 + Math.random() * 75,
    y: 10 + Math.random() * 70,
    visible: true,
  })
}

function collectStar(idx: number): void {
  const star = energyStars.value[idx]
  if (!star || !star.visible) return
  star.visible = false
  energyCollected.value++
  updateProgress((energyCollected.value / 5) * 100)

  if (energyCollected.value >= 5) {
    cleanup()
    finishWithReward({
      guideBonus: { star: 5, flame: 3 },
      fragmentBonus: 1,
      description: '能量收集完毕！星之向导亲和度 +5，获得额外灵魂碎片',
    })
  }
}

/* ===== 2. 灵魂碎片拼图 ===== */

interface PuzzlePiece { correct: boolean; selected: boolean }

const puzzlePieces = ref<PuzzlePiece[]>([])
const puzzleCorrectCount = computed(() => puzzlePieces.value.filter(p => p.correct).length)

function initSoulPuzzle(): void {
  // 随机选 4 个位置作为目标归位块
  const indices = Array.from({ length: 9 }, (_, i) => i)
  // 打乱，前 4 个初始不正确
  const shuffled = indices.sort(() => Math.random() - 0.5)
  puzzlePieces.value = shuffled.map((_, i) => ({
    correct: false,
    selected: false,
  }))
}

function togglePuzzlePiece(idx: number): void {
  const piece = puzzlePieces.value[idx]
  if (piece.correct) return // 已归位不可撤销

  piece.selected = !piece.selected
  // 简单逻辑：点击即归位（简化版）
  if (piece.selected) {
    piece.correct = true
  }
  updateProgress((puzzleCorrectCount.value / 4) * 100)

  if (puzzleCorrectCount.value >= 4) {
    finishWithReward({
      guideBonus: { abyss: 4, forest: 2 },
      fragmentBonus: 1,
      description: '碎片归位完成！深渊向导亲和度 +4，获得灵魂碎片',
    })
  }
}

/* ===== 3. 向导选择 ===== */

const guideOptions = [
  { id: 'flame', name: '焰灵', icon: '🔥', desc: '热情果敢的行动派' },
  { id: 'abyss', name: '渊影', icon: '🌊', desc: '深邃理性的思考者' },
  { id: 'forest', name: '林语', icon: '🌿', desc: '温柔共情的守护者' },
  { id: 'star', name: '星辰', icon: '✨', desc: '自由灵感的探索家' },
]

const selectedGuide = ref<string | null>(null)

function pickGuide(guideId: string): void {
  selectedGuide.value = guideId
  updateProgress(100)

  setTimeout(() => {
    finishWithReward({
      guideBonus: { [guideId]: 6 },
      chosenGuide: guideId,
      description: `你选择了${guideOptions.find(g => g.id === guideId)?.name}！亲和度大幅提升`,
    })
  }, 300)
}

/* ===== 4. 星图点亮 ===== */

interface SequenceStar { x: number; y: number; blinking: boolean; lit: boolean; wrong: boolean }

const sequenceStars = ref<SequenceStar[]>([])
const sequenceOrder = ref<number[]>([])
const sequenceCurrentIndex = ref(0)
const sequencePhase = ref<'show' | 'play'>('show')
const sequenceLitCount = computed(() => sequenceStars.value.filter(s => s.lit).length)
let sequenceShowTimer: ReturnType<typeof setTimeout> | null = null

function initStarSequence(): void {
  // 创建 5 颗星星随机位置
  sequenceStars.value = Array.from({ length: 5 }, (_, i) => ({
    x: 15 + (i * 15) + Math.random() * 10,
    y: 15 + Math.random() * 60,
    blinking: false,
    lit: false,
    wrong: false,
  }))

  // 生成随机顺序
  const order = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5)
  sequenceOrder.value = order
  sequenceCurrentIndex.value = 0
  sequencePhase.value = 'show'

  // 展示闪烁顺序
  let showIdx = 0
  const showNext = () => {
    if (showIdx > 0) {
      sequenceStars.value[order[showIdx - 1]].blinking = false
    }
    if (showIdx < order.length) {
      sequenceStars.value[order[showIdx]].blinking = true
      showIdx++
      sequenceShowTimer = setTimeout(showNext, 700)
    } else {
      // 展示结束，进入玩家操作阶段
      sequencePhase.value = 'play'
    }
  }
  sequenceShowTimer = setTimeout(showNext, 500)
}

function tapSequenceStar(idx: number): void {
  if (sequencePhase.value !== 'play') return

  const expected = sequenceOrder.value[sequenceCurrentIndex.value]
  if (idx === expected) {
    sequenceStars.value[idx].lit = true
    sequenceCurrentIndex.value++
    updateProgress((sequenceCurrentIndex.value / 5) * 100)

    if (sequenceCurrentIndex.value >= 5) {
      finishWithReward({
        guideBonus: { star: 5, abyss: 2 },
        fragmentBonus: 1,
        description: '星图全部点亮！星之向导亲和度 +5，获得灵魂碎片',
      })
    }
  } else {
    sequenceStars.value[idx].wrong = true
    setTimeout(() => { sequenceStars.value[idx].wrong = false }, 400)
  }
}

/* ===== 监听游戏 ID 变化，初始化对应游戏 ===== */

watch(currentGameId, (id) => {
  cleanup()
  showReward.value = false
  selectedGuide.value = null

  if (!id) return

  switch (id) {
    case 'energy-collect':
      initEnergyCollect()
      break
    case 'soul-puzzle':
      initSoulPuzzle()
      break
    case 'guide-pick':
      // 无需初始化
      break
    case 'star-sequence':
      initStarSequence()
      break
  }
})
</script>

<style lang="scss" scoped>
.mini-game-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-bg {
  position: absolute;
  inset: 0;
  background: rgba(5, 5, 10, 0.85);
  animation: fadeIn 0.3s ease;
}

.game-container {
  position: relative;
  z-index: 1;
  width: 90%;
  max-width: 680rpx;
  padding: 48rpx 32rpx;
  background: linear-gradient(135deg, rgba(30, 25, 18, 0.95), rgba(20, 16, 10, 0.98));
  border: 1px solid rgba(201, 169, 110, 0.25);
  border-radius: 24rpx;
  box-shadow: 0 0 60rpx rgba(201, 169, 110, 0.1);
  animation: slideUp 0.4s ease;
}

.game-title {
  display: block;
  text-align: center;
  font-size: 36rpx;
  color: #e8d5a3;
  font-weight: 600;
  letter-spacing: 6rpx;
  font-family: "STKaiti", "KaiTi", "楷体", serif;
  margin-bottom: 8rpx;
}

.game-subtitle {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 40rpx;
}

/* ===== 能量收集 ===== */
.ec-field {
  position: relative;
  width: 100%;
  height: 400rpx;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.ec-star {
  position: absolute;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s ease;
  animation: starPulse 0.6s ease-in-out infinite;
}

.star-icon {
  font-size: 48rpx;
  color: #ffd866;
  text-shadow: 0 0 20rpx rgba(255, 216, 102, 0.6);
}

.ec-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8rpx;
}

.ec-count {
  font-size: 28rpx;
  color: #e8d5a3;
}

.ec-timer {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.6);
  &--warn { color: #ff6b6b; }
}

/* ===== 灵魂碎片拼图 ===== */
.sp-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.sp-piece {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(201, 169, 110, 0.08);
  border: 1px solid rgba(201, 169, 110, 0.2);
  border-radius: 12rpx;
  transition: all 0.2s ease;

  &--correct {
    background: rgba(201, 169, 110, 0.2);
    border-color: rgba(201, 169, 110, 0.5);
    box-shadow: 0 0 16rpx rgba(201, 169, 110, 0.2);
  }

  &--selected {
    transform: scale(0.95);
  }
}

.sp-piece-icon {
  font-size: 48rpx;
  color: #c9a96e;
}

.sp-hint {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.4);
}

/* ===== 向导选择 ===== */
.gp-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.gp-card {
  padding: 28rpx 16rpx;
  background: rgba(201, 169, 110, 0.06);
  border: 1px solid rgba(201, 169, 110, 0.15);
  border-radius: 16rpx;
  text-align: center;
  transition: all 0.2s ease;

  &--selected {
    background: rgba(201, 169, 110, 0.2);
    border-color: rgba(201, 169, 110, 0.6);
    box-shadow: 0 0 24rpx rgba(201, 169, 110, 0.3);
    transform: scale(1.02);
  }
}

.gp-card-icon {
  display: block;
  font-size: 56rpx;
  margin-bottom: 8rpx;
}

.gp-card-name {
  display: block;
  font-size: 28rpx;
  color: #e8d5a3;
  font-weight: 600;
  margin-bottom: 4rpx;
}

.gp-card-desc {
  display: block;
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.45);
}

/* ===== 星图点亮 ===== */
.ss-field {
  position: relative;
  width: 100%;
  height: 400rpx;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.ss-star {
  position: absolute;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &--blinking {
    animation: starBlink 0.4s ease-in-out infinite;
  }

  &--lit .ss-star-icon {
    color: #ffd866;
    text-shadow: 0 0 20rpx rgba(255, 216, 102, 0.8);
  }

  &--wrong .ss-star-icon {
    color: #ff6b6b;
  }
}

.ss-star-icon {
  font-size: 48rpx;
  color: rgba(201, 169, 110, 0.5);
  transition: all 0.2s ease;
}

.ss-hint {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.4);
}

/* ===== 奖励动画 ===== */
.reward-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 10, 15, 0.8);
  border-radius: 24rpx;
  animation: fadeIn 0.3s ease;
}

.reward-content {
  text-align: center;
  position: relative;
}

.reward-icon {
  display: block;
  font-size: 72rpx;
  color: #ffd866;
  animation: rewardPop 0.6s ease;
  text-shadow: 0 0 30rpx rgba(255, 216, 102, 0.6);
}

.reward-text {
  display: block;
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #e8d5a3;
  line-height: 1.6;
}

.reward-particles {
  position: absolute;
  inset: -40rpx;
  pointer-events: none;
}

.reward-particle {
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  background: #ffd866;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  animation: particleFloat 1.5s ease-out forwards;

  @for $i from 1 through 8 {
    &:nth-child(#{$i}) {
      --angle: #{$i * 45deg};
    }
  }
}

/* ===== 跳过按钮 ===== */
.skip-btn {
  margin-top: 24rpx;
  text-align: center;
  padding: 12rpx;
}

.skip-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 4rpx;
}

/* ===== 动画 ===== */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(40rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes starPulse {
  0%, 100% { transform: scale(0.9); }
  50% { transform: scale(1.15); }
}

@keyframes starBlink {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes rewardPop {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes particleFloat {
  0% { transform: translate(0, 0); opacity: 1; }
  100% {
    transform: translate(
      calc(cos(var(--angle)) * 60rpx),
      calc(sin(var(--angle)) * 60rpx)
    );
    opacity: 0;
  }
}
</style>
