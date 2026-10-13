import type { TestQuestion } from '@/types/test'

/**
 * 灵魂星图 — 补充题目（每章追加1题，深化人格画像）
 * 5道补充题目，分别对应第一章至第五章的核心维度
 */
export const soulmapSupplementQuestions: TestQuestion[] = [

  // ═══════════════════════════════════════
  // 补充题 Q32 — 第一章：觉醒（EI 维度强化）
  // ═══════════════════════════════════════

  {
    id: 'q32',
    chapterId: 'ch1',
    order: 6,
    type: 'single',
    text: '你误入一座废弃的星象台，穹顶上的星图仍在缓缓旋转。寂静中，一个苍老而遥远的声音从星图深处传来，它似乎在呼唤你的名字，但话语模糊不清。星象台上有一支古老的传声管，可以将你的声音放大百倍传向星空；旁边的暗室里则有一台精密的声音解析仪，能将微弱的信号转化为清晰的文字。',
    image: 'chapter1_bg',
    estimatedTime: 25,
    options: [
      {
        id: 'q32a',
        text: '对着传声管大喊："你是谁？——我在听，你大声说！"',
        weights: { EI: 2, SN: 0, TF: 0, JP: 0 },
        guides: { flame: 3, abyss: 0, forest: 0, star: 0 },
      },
      {
        id: 'q32b',
        text: '走进暗室启动解析仪，安静地聆听并分析声音的内容和来源',
        weights: { EI: -2, SN: 1, TF: 1, JP: 0 },
        guides: { flame: 0, abyss: 3, forest: 0, star: 0 },
      },
      {
        id: 'q32c',
        text: '轻声问："你还好吗？你的声音听起来很孤单……"',
        weights: { EI: 0, SN: 0, TF: -2, JP: 0 },
        guides: { flame: 0, abyss: 0, forest: 3, star: 0 },
      },
    ],
  },

  // ═══════════════════════════════════════
  // 补充题 Q33 — 第二章：探索（SN 维度强化）
  // ═══════════════════════════════════════

  {
    id: 'q33',
    chapterId: 'ch2',
    order: 6,
    type: 'single',
    text: '琥珀城的星辰商人收起摊位，从暗格中取出三件压箱底的货物。他压低声音说："旅人，这三样东西我只卖给有缘人。"第一件是一瓶赤红色的勇气药水，饮下后无惧任何挑战；第二件是一面真相之镜，能映照一切伪装背后的真实；第三件是一颗温润的同感石，握住它便能感知周围所有生命的喜怒哀乐。',
    image: 'chapter2_bg',
    estimatedTime: 25,
    options: [
      {
        id: 'q33a',
        text: '买下勇气药水——有了勇气，什么未知的挑战都不在话下',
        weights: { EI: 1, SN: 2, TF: 0, JP: 1 },
        guides: { flame: 3, abyss: 0, forest: 0, star: 0 },
      },
      {
        id: 'q33b',
        text: '买下真相之镜——看清事物的本质比什么都重要',
        weights: { EI: -1, SN: 2, TF: 1, JP: 0 },
        guides: { flame: 0, abyss: 3, forest: 0, star: 0 },
      },
      {
        id: 'q33c',
        text: '买下同感石——能理解他人的感受，才是最珍贵的能力',
        weights: { EI: 0, SN: -1, TF: -2, JP: 0 },
        guides: { flame: 0, abyss: 0, forest: 3, star: 0 },
      },
    ],
  },

  // ═══════════════════════════════════════
  // 补充题 Q34 — 第四章：蜕变（EI / JP 维度强化）
  // ═══════════════════════════════════════

  {
    id: 'q34',
    chapterId: 'ch4',
    order: 6,
    type: 'single',
    text: '暗潮突袭，你被迫和一群旅人躲进一座废弃的避难所。外面暗影翻涌，避难所的防护结界正在一点点碎裂。恐慌在人群中蔓延——有人哭泣，有人争吵，有人呆坐不动。你必须做出选择：是在混乱中站出来组织大家，还是先让自己冷静下来再行动。',
    image: 'chapter4_bg',
    estimatedTime: 25,
    options: [
      {
        id: 'q34a',
        text: '站到人群中央大声组织反击计划——分配任务、加固防线、分配资源',
        weights: { EI: 2, SN: 0, TF: 1, JP: 1 },
        guides: { flame: 3, abyss: 0, forest: 0, star: 0 },
      },
      {
        id: 'q34b',
        text: '找一个安静的角落坐下来，理清思路，想清楚最有效的应对方案',
        weights: { EI: -2, SN: 1, TF: 1, JP: 0 },
        guides: { flame: 0, abyss: 3, forest: 0, star: 0 },
      },
      {
        id: 'q34c',
        text: '先走到人群中查看有没有人受伤或受惊，确认每个人的状态',
        weights: { EI: 1, SN: 0, TF: -2, JP: 0 },
        guides: { flame: 0, abyss: 0, forest: 3, star: 0 },
      },
    ],
  },

  // ═══════════════════════════════════════
  // 补充题 Q35 — 第五章：归宿（JP 维度强化）
  // ═══════════════════════════════════════

  {
    id: 'q35',
    chapterId: 'ch5',
    order: 6,
    type: 'single',
    text: '你用灵魂碎片创造的世界逐渐繁荣起来，但居民之间产生了严重的分歧。守序者认为应该制定严格的法律维护秩序，自由者主张每个人按自己的方式生活。两派的矛盾越来越深，甚至开始影响到世界的运转。作为这个世界的创造者，你需要决定如何处理这场冲突。',
    image: 'chapter5_bg',
    estimatedTime: 25,
    options: [
      {
        id: 'q35a',
        text: '制定一套清晰的规则——没有规矩不成方圆，秩序是一切繁荣的基础',
        weights: { EI: 0, SN: 1, TF: 1, JP: 2 },
        guides: { flame: 1, abyss: 1, forest: 0, star: 0 },
      },
      {
        id: 'q35b',
        text: '分别倾听两派的心声——理解每个人的立场后再寻找平衡点',
        weights: { EI: 1, SN: 0, TF: -2, JP: 0 },
        guides: { flame: 0, abyss: 0, forest: 3, star: 0 },
      },
      {
        id: 'q35c',
        text: '不干预——让他们自己解决冲突，这是他们成长必须经历的过程',
        weights: { EI: 0, SN: 0, TF: 0, JP: -2 },
        guides: { flame: 0, abyss: 0, forest: 0, star: 3 },
      },
    ],
  },

  // ═══════════════════════════════════════
  // 补充题 Q36 — 第五章：归宿（告别与回望）
  // ═══════════════════════════════════════

  {
    id: 'q36',
    chapterId: 'ch5',
    order: 7,
    type: 'single',
    text: '灵魂星图的旅程终于走到了尾声。守护者最后一次出现在你面前，他身后是一扇即将关闭的光之门。"旅人，你只能带走一样东西回到现实世界。"他伸出手，掌心浮现出三种光芒：一种凝固成具体的画面，一种化为无法言说的温暖感觉，最后一种变成了你旅途中认识的每一张面孔。',
    image: 'chapter5_bg',
    estimatedTime: 25,
    options: [
      {
        id: 'q36a',
        text: '带走每一段具体的记忆——那些画面、声音和细节是我最珍贵的财富',
        weights: { EI: 0, SN: 2, TF: 0, JP: 1 },
        guides: { flame: 1, abyss: 1, forest: 0, star: 0 },
      },
      {
        id: 'q36b',
        text: '带走那种无法言说的感觉——关于"我是谁"的领悟，比任何画面都深刻',
        weights: { EI: 0, SN: -2, TF: 0, JP: -1 },
        guides: { flame: 0, abyss: 0, forest: 1, star: 2 },
      },
      {
        id: 'q36c',
        text: '带走旅途中认识的每一个朋友——人才是这段旅程中最珍贵的存在',
        weights: { EI: 2, SN: 0, TF: 0, JP: 0 },
        guides: { flame: 1, abyss: 0, forest: 2, star: 0 },
      },
    ],
  },
]
