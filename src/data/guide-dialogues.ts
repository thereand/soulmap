/**
 * 灵魂星图 — 星灵对话互动数据
 *
 * 在第三章（Q13 对手救援场景后）和第四章（Q18 记忆之镜场景后）触发。
 * 主导星灵出现并与用户进行一段短对话，根据用户回应增加对应向导亲和度。
 */
import type { GuideDialogueData } from '@/types/guide'

export const guideDialogues: GuideDialogueData[] = [
  /* ═══════════════════════════════════════════
   * 第三章：抉择（ch3）—— 对手救援之后
   * 主导星灵评论用户的价值选择
   * ═══════════════════════════════════════════ */

  // ── 烈焰之灵 ──
  {
    chapterId: 'ch3',
    guideId: 'flame',
    prompt: '你刚才的选择让我想起了一个人……你也曾为了自己相信的事不顾一切吗？',
    options: [
      {
        text: '是的，我一直如此。',
        guideBonus: { flame: 1 },
      },
      {
        text: '不完全是，我会先想清楚。',
        guideBonus: { abyss: 1 },
      },
      {
        text: '我只是不想让别人受伤。',
        guideBonus: { forest: 1 },
      },
      {
        text: '我只是觉得这样做比较有趣。',
        guideBonus: { star: 1 },
      },
    ],
  },

  // ── 深渊之灵 ──
  {
    chapterId: 'ch3',
    guideId: 'abyss',
    prompt: '有趣……你在暗林中的每一个选择，都像在下一盘棋。你总是在计算下一步吗？',
    options: [
      {
        text: '不全是，有时候直觉比计算更可靠。',
        guideBonus: { star: 1 },
      },
      {
        text: '是的，走错一步可能万劫不复。',
        guideBonus: { abyss: 1 },
      },
      {
        text: '我更在意选择对别人的影响。',
        guideBonus: { forest: 1 },
      },
      {
        text: '想太多不如直接行动。',
        guideBonus: { flame: 1 },
      },
    ],
  },

  // ── 森林之灵 ──
  {
    chapterId: 'ch3',
    guideId: 'forest',
    prompt: '你知道吗，在这片暗林中，你的善意就像一盏灯……你有没有觉得，帮助别人其实也是在治愈自己？',
    options: [
      {
        text: '是的，看到别人好起来我也很开心。',
        guideBonus: { forest: 1 },
      },
      {
        text: '帮助是理性的选择，不完全是感性。',
        guideBonus: { abyss: 1 },
      },
      {
        text: '我更享受探索的过程。',
        guideBonus: { star: 1 },
      },
      {
        text: '有时候不帮也是一种选择。',
        guideBonus: { flame: 1 },
      },
    ],
  },

  // ── 星光之灵 ──
  {
    chapterId: 'ch3',
    guideId: 'star',
    prompt: '哇，你在这片暗林里的表现真的很有意思！你觉得是规则重要还是感觉重要？',
    options: [
      {
        text: '感觉！规则太无聊了。',
        guideBonus: { star: 1 },
      },
      {
        text: '看情况，有时候规则能保护人。',
        guideBonus: { forest: 1 },
      },
      {
        text: '逻辑上正确的选择最重要。',
        guideBonus: { abyss: 1 },
      },
      {
        text: '重要的事就应该马上去做！',
        guideBonus: { flame: 1 },
      },
    ],
  },

  /* ═══════════════════════════════════════════
   * 第四章：蜕变（ch4）—— 记忆之镜场景后
   * 主导星灵分享一些个人的故事与感悟
   * ═══════════════════════════════════════════ */

  // ── 烈焰之灵 ──
  {
    chapterId: 'ch4',
    guideId: 'flame',
    prompt: '记忆之镜让你看到了过去的决定……后悔吗？如果可以重来，你还会做同样的选择吗？',
    options: [
      {
        text: '会！每个决定都让我成为了现在的我。',
        guideBonus: { flame: 1 },
      },
      {
        text: '也许会做一些不同的选择。',
        guideBonus: { abyss: 1 },
      },
      {
        text: '只要没伤害到别人就好。',
        guideBonus: { forest: 1 },
      },
      {
        text: '谁知道呢，也许另一条路更有趣。',
        guideBonus: { star: 1 },
      },
    ],
  },

  // ── 深渊之灵 ──
  {
    chapterId: 'ch4',
    guideId: 'abyss',
    prompt: '那面镜子……我也曾面对过。你看到的那些遗憾，其实是通往智慧的阶梯。你同意吗？',
    options: [
      {
        text: '同意，痛苦是最好的老师。',
        guideBonus: { abyss: 1 },
      },
      {
        text: '我宁愿少一些遗憾多一些快乐。',
        guideBonus: { forest: 1 },
      },
      {
        text: '遗憾不重要，重要的是现在怎么做。',
        guideBonus: { flame: 1 },
      },
      {
        text: '也许遗憾只是另一种可能性。',
        guideBonus: { star: 1 },
      },
    ],
  },

  // ── 森林之灵 ──
  {
    chapterId: 'ch4',
    guideId: 'forest',
    prompt: '镜子里的你……看起来很辛苦呢。你有没有好好对待自己？不只是对别人好，也对自己好？',
    options: [
      {
        text: '嗯，我会努力平衡的。',
        guideBonus: { forest: 1 },
      },
      {
        text: '对自己好不如把事情做对。',
        guideBonus: { abyss: 1 },
      },
      {
        text: '我更喜欢用行动证明自己。',
        guideBonus: { flame: 1 },
      },
      {
        text: '对自己好就是给自己自由。',
        guideBonus: { star: 1 },
      },
    ],
  },

  // ── 星光之灵 ──
  {
    chapterId: 'ch4',
    guideId: 'star',
    prompt: '哈哈，记忆之镜是不是让你看到了很多有趣的"如果"？如果人生可以存档读档，你最想改变什么？',
    options: [
      {
        text: '什么都不改，现在的我就很好。',
        guideBonus: { flame: 1 },
      },
      {
        text: '想看看所有可能性。',
        guideBonus: { star: 1 },
      },
      {
        text: '改掉那些伤害了别人的事。',
        guideBonus: { forest: 1 },
      },
      {
        text: '想做一个更明智的选择。',
        guideBonus: { abyss: 1 },
      },
    ],
  },
]
