import type { TestQuestion } from '@/types/test'

/**
 * 灵魂星图 — 第六章：试炼（压力情境下的人格投射）
 * 6道沉浸式剧情化测试题目，考验旅人在极端压力下的真实本性
 */
export const soulmapTrialQuestions: TestQuestion[] = [

  // ═══════════════════════════════════════
  // 第六章：试炼（压力情境）— 综合维度
  // ═══════════════════════════════════════

  {
    id: 'q26',
    chapterId: 'ch6',
    order: 1,
    type: 'single',
    text: '脚下的地面突然开始崩裂，碎石坠入无底深渊。你只有十秒钟的时间选择逃生方向——眼前出现三条路：一条被耀眼的星光照亮，通往未知的高处；一条布满裂纹但看起来结构稳固的石板路；身后传来其他旅人的呼喊声，他们似乎也在寻找出路。倒计时已经开始。',
    image: 'chapter6_bg',
    estimatedTime: 25,
    options: [
      {
        id: 'q26a',
        text: '朝星光最亮的方向全力奔跑——直觉告诉你那里有出路',
        weights: { EI: 1, SN: -2, TF: 0, JP: 0 },
        guides: { flame: 0, abyss: 0, forest: 0, star: 3 },
      },
      {
        id: 'q26b',
        text: '快速观察裂缝的走向和石板的承重结构，选择最稳固的路线',
        weights: { EI: -1, SN: 2, TF: 0, JP: 0 },
        guides: { flame: 1, abyss: 2, forest: 0, star: 0 },
      },
      {
        id: 'q26c',
        text: '大声呼唤其他旅人，集合所有人的力量一起寻找出路',
        weights: { EI: 2, SN: 0, TF: 0, JP: 0 },
        guides: { flame: 3, abyss: 0, forest: 0, star: 0 },
      },
    ],
  },

  {
    id: 'q27',
    chapterId: 'ch6',
    order: 2,
    type: 'single',
    text: '裂缝尽头是一座镜之大殿。你走进去，面前浮现出一个与你一模一样的镜像——但它拥有你所有"未曾做到的可能性"。它比你更果断、更强大、更无所畏惧。镜像开口说："我是你放弃成为的那个人。你想如何面对我？"',
    image: 'chapter6_bg',
    estimatedTime: 25,
    options: [
      {
        id: 'q27a',
        text: '接受挑战——与其逃避不如正面对决，证明自己选择的路没有错',
        weights: { EI: 2, SN: 0, TF: 0, JP: 0 },
        guides: { flame: 3, abyss: 0, forest: 0, star: 0 },
      },
      {
        id: 'q27b',
        text: '冷静分析它口中"未曾做到"的含义——也许能从它身上学到什么',
        weights: { EI: 0, SN: 1, TF: 2, JP: 0 },
        guides: { flame: 0, abyss: 3, forest: 0, star: 0 },
      },
      {
        id: 'q27c',
        text: '向它伸出手提议合作——你们本就是一体，何必彼此为敌',
        weights: { EI: 0, SN: 0, TF: -2, JP: 0 },
        guides: { flame: 0, abyss: 0, forest: 3, star: 0 },
      },
    ],
  },

  {
    id: 'q28',
    chapterId: 'ch6',
    order: 3,
    type: 'single',
    text: '镜之大殿深处，一架黄金天平悬浮在空中。审判者的声音再度响起："将你最珍贵的一段记忆放上天平，它将被永远封存为灵魂星图的基石。"你闭上眼，脑海中浮现出三段画面——你需要选择其中一段作为你最珍贵的记忆。',
    image: 'chapter6_bg',
    estimatedTime: 25,
    options: [
      {
        id: 'q28a',
        text: '那个阳光灿烂的午后，和朋友们开怀大笑，快乐得毫无理由',
        weights: { EI: 2, SN: 1, TF: 0, JP: 0 },
        guides: { flame: 2, abyss: 0, forest: 1, star: 0 },
      },
      {
        id: 'q28b',
        text: '那个深夜独自顿悟的瞬间——世界突然变得清晰，你终于理解了某件重要的事',
        weights: { EI: -1, SN: 2, TF: 2, JP: 0 },
        guides: { flame: 0, abyss: 3, forest: 0, star: 0 },
      },
      {
        id: 'q28c',
        text: '某个平凡至极的日子，和某个特别的人待在一起，什么都没做却觉得一切刚好',
        weights: { EI: 0, SN: 1, TF: -2, JP: 0 },
        guides: { flame: 0, abyss: 0, forest: 3, star: 0 },
      },
    ],
  },

  {
    id: 'q29',
    chapterId: 'ch6',
    order: 4,
    type: 'single',
    text: '天平消散后，你来到一座横跨深渊的古老石桥。桥面正在一块块碎裂坠落，而对岸传来微弱的求救声——有人被困在那里。桥看起来撑不了多久，但你注意到桥墩上刻着古老的工程符文，也许能解读出桥的结构弱点；远处似乎还有一条隐蔽的侧路通向对岸。',
    image: 'chapter6_bg',
    estimatedTime: 25,
    options: [
      {
        id: 'q29a',
        text: '毫不犹豫地冲上桥面——每一秒犹豫都可能让对面的人多一分危险',
        weights: { EI: 2, SN: 0, TF: -1, JP: 0 },
        guides: { flame: 3, abyss: 0, forest: 0, star: 1 },
      },
      {
        id: 'q29b',
        text: '快速解读桥墩上的符文，分析哪些桥板还能承重，规划一条安全的过桥路线',
        weights: { EI: -1, SN: 2, TF: 1, JP: 1 },
        guides: { flame: 0, abyss: 3, forest: 0, star: 0 },
      },
      {
        id: 'q29c',
        text: '放弃危险的石桥，寻找那条隐蔽的侧路——一定有更安全的方式到达对岸',
        weights: { EI: 0, SN: 1, TF: 2, JP: 0 },
        guides: { flame: 0, abyss: 1, forest: 0, star: 2 },
      },
    ],
  },

  {
    id: 'q30',
    chapterId: 'ch6',
    order: 5,
    type: 'single',
    text: '桥的另一端坐着一位白发苍苍的老者，他也是试炼者——但已经在这片秘境中徘徊了几十年。他看着你说："年轻人，我见过无数旅人通过这里。有人为了胜利，有人为了真相，有人为了同伴，也有人只是享受这段路。在你继续之前，告诉我——对你而言，这场试炼最重要的是什么？"',
    image: 'chapter6_bg',
    estimatedTime: 25,
    options: [
      {
        id: 'q30a',
        text: '"通过试炼——我是来赢的，每一个挑战我都要拿下"',
        weights: { EI: 1, SN: 1, TF: 0, JP: 2 },
        guides: { flame: 2, abyss: 0, forest: 0, star: 0 },
      },
      {
        id: 'q30b',
        text: '"理解试炼的意义——我想知道这些考验到底在教会我什么"',
        weights: { EI: -1, SN: 2, TF: 1, JP: -1 },
        guides: { flame: 0, abyss: 3, forest: 0, star: 0 },
      },
      {
        id: 'q30c',
        text: '"一路上遇到的人——如果没有他们，通过试炼也毫无意义"',
        weights: { EI: 1, SN: 0, TF: -2, JP: 0 },
        guides: { flame: 0, abyss: 0, forest: 3, star: 0 },
      },
      {
        id: 'q30d',
        text: '"享受整个过程——结果不重要，这段旅程本身就是最好的礼物"',
        weights: { EI: 0, SN: 0, TF: 0, JP: -2 },
        guides: { flame: 0, abyss: 0, forest: 0, star: 3 },
      },
    ],
  },

  {
    id: 'q31',
    chapterId: 'ch6',
    order: 6,
    type: 'single',
    text: '老者微微一笑，从怀中取出两把钥匙放在你面前。一把是温润的琥珀色，上面刻着你来时路上的地图——它能打开通往来时的路，让你带着所有收获回到熟悉的世界。另一把是深邃的星空色，表面流动着未知的光——它能打开一扇从未有人走过的门。老者说："选吧，旅人。"',
    image: 'chapter6_bg',
    estimatedTime: 25,
    options: [
      {
        id: 'q31a',
        text: '选择归途之钥——我已经清楚自己是谁，带着答案回到属于我的世界',
        weights: { EI: -1, SN: 2, TF: 0, JP: 2 },
        guides: { flame: 1, abyss: 2, forest: 0, star: 0 },
      },
      {
        id: 'q31b',
        text: '选择未知之钥——还有太多未曾发现的事物在等着我，怎么能就此停下',
        weights: { EI: 1, SN: -2, TF: 0, JP: -2 },
        guides: { flame: 1, abyss: 0, forest: 0, star: 3 },
      },
      {
        id: 'q31c',
        text: '两把都不选——我不走别人设定的门，我要用自己的力量打开一条新路',
        weights: { EI: 0, SN: -1, TF: 1, JP: -1 },
        guides: { flame: 2, abyss: 0, forest: 0, star: 2 },
      },
    ],
  },
]
