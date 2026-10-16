import type { GuideReactionData } from '@/types/guide'

/**
 * 人格星图 — 向导即时反应
 *
 * 每道题回答后显示的向导短评，根据当前主导向导展示。
 * 共 144 条（36 题 × 4 向导）。
 */
export const guideReactions: GuideReactionData[] = [

  // ── q1：选择方向（集市 vs 古塔）──
  { questionId: 'q1', guideId: 'flame', text: '不管走哪条路，冲就对了！' },
  { questionId: 'q1', guideId: 'abyss', text: '两条路……都值得深思。' },
  { questionId: 'q1', guideId: 'forest', text: '无论哪里，都会遇到需要帮助的人。' },
  { questionId: 'q1', guideId: 'star', text: '每条路都是新冒险！' },

  // ── q2：观察星象仪的方式（数据 vs 直觉 vs 询问）──
  { questionId: 'q2', guideId: 'flame', text: '别想太多，相信第一感觉！' },
  { questionId: 'q2', guideId: 'abyss', text: '观察方式决定了你能看到多远……' },
  { questionId: 'q2', guideId: 'forest', text: '用心感受，答案自然会出现。' },
  { questionId: 'q2', guideId: 'star', text: '星光的故事，每个人读到都不一样哦～' },

  // ── q3：面对童年记忆（细节 vs 情感）──
  { questionId: 'q3', guideId: 'flame', text: '过去的记忆，是力量的源泉！' },
  { questionId: 'q3', guideId: 'abyss', text: '记忆是最深的镜子……照见真正的你。' },
  { questionId: 'q3', guideId: 'forest', text: '那段记忆……一定很温暖吧。' },
  { questionId: 'q3', guideId: 'star', text: '哇，像打开了一个时间胶囊！' },

  // ── q4：应对神秘光点（追随 vs 研究 vs 求助）──
  { questionId: 'q4', guideId: 'flame', text: '追上去！跟着光跑就对了！' },
  { questionId: 'q4', guideId: 'abyss', text: '光点的轨迹里，藏着某种规律……' },
  { questionId: 'q4', guideId: 'forest', text: '它们好像想和你做朋友呢。' },
  { questionId: 'q4', guideId: 'star', text: '好像在开派对！加入加入！' },

  // ── q5：选择带走的物品（镜子 vs 水晶球 vs 书）──
  { questionId: 'q5', guideId: 'flame', text: '带上能用的，出发上路！' },
  { questionId: 'q5', guideId: 'abyss', text: '每件物品背后，都藏着一个隐喻……' },
  { questionId: 'q5', guideId: 'forest', text: '无论选什么，带着善意上路就好。' },
  { questionId: 'q5', guideId: 'star', text: '好难选啊——每个都好想要！' },

  // ── q6：探索琥珀城的物品（地图 vs 药水 vs 攀谈）──
  { questionId: 'q6', guideId: 'flame', text: '先干了再说，想那么多干嘛！' },
  { questionId: 'q6', guideId: 'abyss', text: '每件器物都有不为人知的过去……' },
  { questionId: 'q6', guideId: 'forest', text: '和商人聊聊天吧，每个人都有故事。' },
  { questionId: 'q6', guideId: 'star', text: '梦境药水！听起来就超刺激！' },

  // ── q7：裁决两派辩论（逻辑 vs 情感 vs 创新）──
  { questionId: 'q7', guideId: 'flame', text: '快做决定吧！别磨蹭了！' },
  { questionId: 'q7', guideId: 'abyss', text: '逻辑与情感……永恒的辩题。' },
  { questionId: 'q7', guideId: 'forest', text: '不管站哪边，都别伤害别人。' },
  { questionId: 'q7', guideId: 'star', text: '也许有第三种答案？' },

  // ── q8：选择看哪个版本的自己（成功 vs 幸福 vs 共同点）──
  { questionId: 'q8', guideId: 'flame', text: '当然选最强的那个版本！' },
  { questionId: 'q8', guideId: 'abyss', text: '幸福的定义，比成功更深……' },
  { questionId: 'q8', guideId: 'forest', text: '不管哪个版本，都是真实的你。' },
  { questionId: 'q8', guideId: 'star', text: '哇，平行世界的自己！好想看！' },

  // ── q9：对待空白书的知识（精读 vs 泛读 vs 请教）──
  { questionId: 'q9', guideId: 'flame', text: '认真读！知识也是武器！' },
  { questionId: 'q9', guideId: 'abyss', text: '书与书之间的关联……才是关键。' },
  { questionId: 'q9', guideId: 'forest', text: '问问猫头鹰吧，它的智慧更深。' },
  { questionId: 'q9', guideId: 'star', text: '每本书都是新大陆！全想翻一遍！' },

  // ── q10：理想之城的蓝图（效率 vs 交流 vs 探索）──
  { questionId: 'q10', guideId: 'flame', text: '高效的才是最强的！' },
  { questionId: 'q10', guideId: 'abyss', text: '一座城市的面貌，映射居民的人格……' },
  { questionId: 'q10', guideId: 'forest', text: '有花园和笑声的城市最美好。' },
  { questionId: 'q10', guideId: 'star', text: '充满秘密的城市！永远有惊喜！' },

  // ── q11：救人还是救草药（人命 vs 大局 vs 两全）──
  { questionId: 'q11', guideId: 'flame', text: '别想了，先冲上去救人！' },
  { questionId: 'q11', guideId: 'abyss', text: '两难之间……才是人格被考验的地方。' },
  { questionId: 'q11', guideId: 'forest', text: '救人要紧！什么都比不上生命。' },
  { questionId: 'q11', guideId: 'star', text: '一定有办法两个都救到的！' },

  // ── q12：交出人格碎片救灵兽（牺牲 vs 拒绝 vs 条件交换）──
  { questionId: 'q12', guideId: 'flame', text: '该出手时就出手！' },
  { questionId: 'q12', guideId: 'abyss', text: '每一份牺牲都有重量……值得深思。' },
  { questionId: 'q12', guideId: 'forest', text: '愿意为别人付出，很了不起……' },
  { questionId: 'q12', guideId: 'star', text: '也许碎片和灵兽之间有别的联系？' },

  // ── q13：救曾经的对手（义气 vs 理性 vs 独自前行）──
  { questionId: 'q13', guideId: 'flame', text: '有恩报恩，有义讲义！' },
  { questionId: 'q13', guideId: 'abyss', text: '宽恕与防备……并不矛盾。' },
  { questionId: 'q13', guideId: 'forest', text: '能放下过去的人，真的很勇敢。' },
  { questionId: 'q13', guideId: 'star', text: '说不定对手变队友更有趣呢！' },

  // ── q14：正义的根基（悲悯 vs 法典 vs 平衡）──
  { questionId: 'q14', guideId: 'flame', text: '正义就是保护在乎的人！' },
  { questionId: 'q14', guideId: 'abyss', text: '心脏与法典……理性与温度的天平。' },
  { questionId: 'q14', guideId: 'forest', text: '温柔的理解，也是正义的一部分。' },
  { questionId: 'q14', guideId: 'star', text: '也许正义的定义该被改写了？' },

  // ── q15：安慰孩子还是抢碎片（情感 vs 时机）──
  { questionId: 'q15', guideId: 'flame', text: '碎片重要，但孩子更急！' },
  { questionId: 'q15', guideId: 'abyss', text: '选择的背后……你在守护什么？' },
  { questionId: 'q15', guideId: 'forest', text: '一个孩子的眼泪，比什么都重要。' },
  { questionId: 'q15', guideId: 'star', text: '能不能又安慰她又拿碎片？试试看！' },

  // ── q16：暗潮来袭（加入防线 vs 独闯山洞 vs 先观察）──
  { questionId: 'q16', guideId: 'flame', text: '和大家一起上！并肩作战！' },
  { questionId: 'q16', guideId: 'abyss', text: '那个低语……也许比战斗更重要。' },
  { questionId: 'q16', guideId: 'forest', text: '和大家在一起，更安全也更温暖。' },
  { questionId: 'q16', guideId: 'star', text: '山洞里说不定藏着超酷的秘密！' },

  // ── q17：人格武装形态（盾牌 vs 长剑 vs 观察后决定）──
  { questionId: 'q17', guideId: 'flame', text: '进攻才是最好的防守！冲！' },
  { questionId: 'q17', guideId: 'abyss', text: '盾与剑……防守与进攻，哪个更接近你？' },
  { questionId: 'q17', guideId: 'forest', text: '保护好身边的人，比什么都重要。' },
  { questionId: 'q17', guideId: 'star', text: '不能变来变去吗？两种都想要！' },

  // ── q18：保留还是抹去痛苦记忆（保留 vs 抹去 vs 对话）──
  { questionId: 'q18', guideId: 'flame', text: '伤痕就是勋章！全部留着！' },
  { questionId: 'q18', guideId: 'abyss', text: '记忆的重量……你愿意承受多少？' },
  { questionId: 'q18', guideId: 'forest', text: '每一段记忆都是你的一部分呢……' },
  { questionId: 'q18', guideId: 'star', text: '和过去的自己聊天？这想法太酷了！' },

  // ── q19：是否接受结盟条件（接受 vs 保留灵活 vs 独行）──
  { questionId: 'q19', guideId: 'flame', text: '有战友当然好，但别被绑住！' },
  { questionId: 'q19', guideId: 'abyss', text: '合作与独立……各有各的代价。' },
  { questionId: 'q19', guideId: 'forest', text: '按自己的节奏来，不用勉强。' },
  { questionId: 'q19', guideId: 'star', text: '一个人的冒险也很浪漫啊～' },

  // ── q20：过试炼之桥（稳步 vs 飞跃）──
  { questionId: 'q20', guideId: 'flame', text: '跳！别犹豫，纵身一跃！' },
  { questionId: 'q20', guideId: 'abyss', text: '稳与险……都是过桥的方式。' },
  { questionId: 'q20', guideId: 'forest', text: '一步一步走，稳稳的也很好。' },
  { questionId: 'q20', guideId: 'star', text: '飞过去多帅！人格力量托着你！' },

  // ── q21：构建世界的大小（精致小世界 vs 无限大世界 vs 活世界）──
  { questionId: 'q21', guideId: 'flame', text: '要大！越大越有挑战！' },
  { questionId: 'q21', guideId: 'abyss', text: '小而深……也是一种无垠。' },
  { questionId: 'q21', guideId: 'forest', text: '一个会呼吸的世界，多美好。' },
  { questionId: 'q21', guideId: 'star', text: '永远有新发现的世界最棒了！' },

  // ── q22：选择元素之力（大地 vs 流水 vs 风）──
  { questionId: 'q22', guideId: 'flame', text: '流动的水！变化才有生命力！' },
  { questionId: 'q22', guideId: 'abyss', text: '大地的稳固……是一种深沉的力量。' },
  { questionId: 'q22', guideId: 'forest', text: '风和流水都很好……自然的力量。' },
  { questionId: 'q22', guideId: 'star', text: '三种都选行不行？都想要！' },

  // ── q23：召唤居民（守序者 vs 梦想家 vs 旅行者）──
  { questionId: 'q23', guideId: 'flame', text: '守序者！让世界高效运转！' },
  { questionId: 'q23', guideId: 'abyss', text: '梦想家……让世界有深度和人格。' },
  { questionId: 'q23', guideId: 'forest', text: '旅行者带回来的故事最珍贵了。' },
  { questionId: 'q23', guideId: 'star', text: '全都召唤！越热闹越好玩！' },

  // ── q24：制定时间法则（匀速 vs 循环 vs 自由流动）──
  { questionId: 'q24', guideId: 'flame', text: '精确可控！这样效率最高！' },
  { questionId: 'q24', guideId: 'abyss', text: '匀速还是循环……时间本无形状。' },
  { questionId: 'q24', guideId: 'forest', text: '像风一样自由流动，多浪漫。' },
  { questionId: 'q24', guideId: 'star', text: '不可预测的时间！每天都有惊喜！' },

  // ── q25：选择安家的地方（山顶 vs 森林 vs 海边）──
  { questionId: 'q25', guideId: 'flame', text: '山顶！俯瞰一切的视野！' },
  { questionId: 'q25', guideId: 'abyss', text: '森林的深处……安静而深邃。' },
  { questionId: 'q25', guideId: 'forest', text: '温暖的小木屋，被树环抱着……' },
  { questionId: 'q25', guideId: 'star', text: '船屋！每天醒来风景都不一样！' },

  // ═══════════════════════════════════════
  // 第六章：试炼 — 浮空竞技场、压力挑战
  // ═══════════════════════════════════════

  // ── q26：面对终极试炼的心态 ──
  { questionId: 'q26', guideId: 'flame', text: '来吧！最强的对手就是自己！' },
  { questionId: 'q26', guideId: 'abyss', text: '试炼……不过是人格的又一次呼吸。' },
  { questionId: 'q26', guideId: 'forest', text: '不管结果怎样，你已经很棒了。' },
  { questionId: 'q26', guideId: 'star', text: '终极挑战？超级期待！' },

  // ── q27：竞技场中的战斗策略 ──
  { questionId: 'q27', guideId: 'flame', text: '全力出击！不留后路！' },
  { questionId: 'q27', guideId: 'abyss', text: '看清对手的弱点，一击制胜。' },
  { questionId: 'q27', guideId: 'forest', text: '保护好同伴，再全力出击。' },
  { questionId: 'q27', guideId: 'star', text: '出其不意！用没人想到的招！' },

  // ── q28：面对最终牺牲的选择 ──
  { questionId: 'q28', guideId: 'flame', text: '值得的事就全力以赴！' },
  { questionId: 'q28', guideId: 'abyss', text: '牺牲的价值……取决于你守护了什么。' },
  { questionId: 'q28', guideId: 'forest', text: '别太勉强自己，你也很重要。' },
  { questionId: 'q28', guideId: 'star', text: '一定有不牺牲也能赢的办法！' },

  // ── q29：面对试炼后的蜕变 ──
  { questionId: 'q29', guideId: 'flame', text: '蜕变的感觉，太燃了！' },
  { questionId: 'q29', guideId: 'abyss', text: '蜕变……是旧我的告别，新我的诞生。' },
  { questionId: 'q29', guideId: 'forest', text: '每一次成长，都像花开一样美。' },
  { questionId: 'q29', guideId: 'star', text: '新的自己！想想就兴奋！' },

  // ── q30：面对试炼中的自我认知 ──
  { questionId: 'q30', guideId: 'flame', text: '不管怎么变，核心不会变！' },
  { questionId: 'q30', guideId: 'abyss', text: '每一个版本的你，都是真实的。' },
  { questionId: 'q30', guideId: 'forest', text: '温柔的那个你，永远都在。' },
  { questionId: 'q30', guideId: 'star', text: '每个版本都超有趣！' },

  // ── q31：想给世界留下什么 ──
  { questionId: 'q31', guideId: 'flame', text: '留下一团火，照亮后来的人！' },
  { questionId: 'q31', guideId: 'abyss', text: '留下思考的种子，让它们慢慢发芽。' },
  { questionId: 'q31', guideId: 'forest', text: '留下温暖的回忆，给每个路过的人。' },
  { questionId: 'q31', guideId: 'star', text: '留下一个充满惊喜的故事！' },

  // ── q32：试炼中如何对待同伴 ──
  { questionId: 'q32', guideId: 'flame', text: '和战友们一起庆祝！' },
  { questionId: 'q32', guideId: 'abyss', text: '独自回味……也是一种深沉的幸福。' },
  { questionId: 'q32', guideId: 'forest', text: '和一路陪伴的人紧紧拥抱吧。' },
  { questionId: 'q32', guideId: 'star', text: '开一场全星空最大的派对！' },

  // ── q33：面对内心最深的恐惧 ──
  { questionId: 'q33', guideId: 'flame', text: '怕什么？冲过去就对了！' },
  { questionId: 'q33', guideId: 'abyss', text: '恐惧的深处……藏着你最在乎的东西。' },
  { questionId: 'q33', guideId: 'forest', text: '害怕也没关系，记住被爱的感觉就好。' },
  { questionId: 'q33', guideId: 'star', text: '把恐惧变成冒险！就不怕了！' },

  // ── q34：人格最看重的东西 ──
  { questionId: 'q34', guideId: 'flame', text: '力量！守护一切的力量！' },
  { questionId: 'q34', guideId: 'abyss', text: '智慧……理解一切的智慧。' },
  { questionId: 'q34', guideId: 'forest', text: '爱……连接一切的爱。' },
  { questionId: 'q34', guideId: 'star', text: '自由！探索一切的自由！' },

  // ── q35：如何超越自身的极限 ──
  { questionId: 'q35', guideId: 'flame', text: '燃烧吧！突破极限！' },
  { questionId: 'q35', guideId: 'abyss', text: '沉到最深处……答案就在那里。' },
  { questionId: 'q35', guideId: 'forest', text: '慢一点也没关系，一步一步来。' },
  { questionId: 'q35', guideId: 'star', text: '换个角度看，也许完全不同！' },

  // ── q36：试炼结束，人格觉醒 ──
  { questionId: 'q36', guideId: 'flame', text: '这不是终点——是新的起点！' },
  { questionId: 'q36', guideId: 'abyss', text: '终点与起点……不过是同一枚硬币的两面。' },
  { questionId: 'q36', guideId: 'forest', text: '辛苦了……你的人格真的很美。' },
  { questionId: 'q36', guideId: 'star', text: '太精彩了！下一次冒险什么时候开始？' },
]
