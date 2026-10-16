import type { TestQuestion } from '@/types/test'

/**
 * 人格星图 — 25道沉浸式剧情化测试题目
 * 分5章，每章5题，基于MBTI四维度
 */
export const soulmapMainQuestions: TestQuestion[] = [

  // ═══════════════════════════════════════
  // 第一章：觉醒（自我认知）— EI / SN 维度
  // ═══════════════════════════════════════

  {
    id: 'q1',
    chapterId: 'ch1',
    order: 1,
    type: 'single',
    text: '你从虚无中醒来，银白色迷雾弥漫四周，远处钟声悠扬，脚下石板路刻满发光符文。迷雾中隐约可见两个方向——一条通往灯火辉煌、人声鼎沸的集市，另一条通向寂静古塔，塔顶闪烁着微弱蓝光。',
    image: 'chapter1_bg',
    estimatedTime: 30,
    options: [
      { id: 'q1a', text: '走向集市——那里有人群，也许能找到同伴和线索', weights: { EI: 2, SN: 1, TF: 0, JP: 0 }, guides: { flame: 2, abyss: -1, forest: 0, star: 0 } },
      { id: 'q1b', text: '走向古塔——独自探索蓝光之谜，安静地寻找答案', weights: { EI: -2, SN: -1, TF: 0, JP: 0 }, guides: { flame: -1, abyss: 2, forest: 0, star: 1 } },
    ],
  },

  {
    id: 'q2',
    chapterId: 'ch1',
    order: 2,
    type: 'single',
    text: '迷雾散去，你站在一座巨大的星象仪前。它缓缓转动，投射出璀璨星河。一位戴面具的守星者出现，低声说："旅人，星象仪会为你揭示真相——但你需要选择观看的方式。"',
    image: 'chapter1_bg',
    estimatedTime: 25,
    options: [
      { id: 'q2a', text: '仔细观察星象仪上每一颗星辰的位置和运行轨迹，记录具体的数据', weights: { EI: 0, SN: 2, TF: 1, JP: 0 }, guides: { flame: 0, abyss: 2, forest: -1, star: 0 } },
      { id: 'q2b', text: '闭上眼睛感受星光的温度，让直觉引导你理解星辰讲述的故事', weights: { EI: 0, SN: -2, TF: -1, JP: 0 }, guides: { flame: 0, abyss: 0, forest: 1, star: 2 } },
      { id: 'q2c', text: '向守星者询问星象仪的历史和传说，试图从他的话语中寻找线索', weights: { EI: 1, SN: -1, TF: 0, JP: -1 }, guides: { flame: 1, abyss: 0, forest: 0, star: 1 } },
    ],
  },

  {
    id: 'q3',
    chapterId: 'ch1',
    order: 3,
    type: 'single',
    text: '守星者摘下面具，露出苍老而温和的面孔。他递来一块水晶碎片："这是人格碎片的第一块，握住它，你会看到内心最深处的倒影。"水晶在掌心发光，浮现出一段模糊的童年记忆。',
    image: 'chapter1_bg',
    estimatedTime: 25,
    options: [
      { id: 'q3a', text: '专注回忆画面中的细节：那天的天气、穿的衣服、周围的人', weights: { EI: 0, SN: 2, TF: 0, JP: 1 }, guides: { flame: 0, abyss: 2, forest: 0, star: -1 } },
      { id: 'q3b', text: '沉浸在那段记忆带来的情绪中，任凭感受如潮水般涌来', weights: { EI: 0, SN: -1, TF: -2, JP: 0 }, guides: { flame: -1, abyss: 0, forest: 2, star: 1 } },
    ],
  },

  {
    id: 'q4',
    chapterId: 'ch1',
    order: 4,
    type: 'single',
    text: '星象仪剧烈震动，一道裂缝从地面蔓延开来。一群萤火虫般的光点从裂缝中飞出，在你身边旋转，仿佛在邀你共舞。远处集市喧闹声越来越清晰，古塔的蓝光也在有节奏地闪烁，像在发送某种信号。',
    image: 'chapter1_bg',
    estimatedTime: 25,
    options: [
      { id: 'q4a', text: '追随光点起舞，让它们带你去它们想去的地方', weights: { EI: 1, SN: -1, TF: 0, JP: -2 }, guides: { flame: 0, abyss: -1, forest: 0, star: 3 } },
      { id: 'q4b', text: '尝试抓住一个光点仔细研究，分析它们的发光规律', weights: { EI: -1, SN: 2, TF: 1, JP: 1 }, guides: { flame: 0, abyss: 2, forest: -1, star: 0 } },
      { id: 'q4c', text: '大声呼唤，看看附近是否有其他人能解释这一切', weights: { EI: 2, SN: 1, TF: 0, JP: 0 }, guides: { flame: 2, abyss: -1, forest: 0, star: 0 } },
    ],
  },

  {
    id: 'q5',
    chapterId: 'ch1',
    order: 5,
    type: 'single',
    text: '裂缝深处传来低沉吟唱，一本厚重古籍从地下浮起，自动翻开到某一页。金色文字写道："觉醒者，你即将踏上人格星图的旅程。出发前，请选择你最想带走的东西。"书页上浮现三件物品的幻象。',
    image: 'chapter1_bg',
    estimatedTime: 25,
    options: [
      { id: 'q5a', text: '一面能映照真实的镜子——看清世界本来的样子', weights: { EI: 0, SN: 2, TF: 1, JP: 0 }, guides: { flame: 1, abyss: 1, forest: 0, star: 0 } },
      { id: 'q5b', text: '一颗能感知万物的水晶球——洞悉表象之下的秘密', weights: { EI: 0, SN: -2, TF: -1, JP: 0 }, guides: { flame: -1, abyss: 2, forest: 0, star: 2 } },
      { id: 'q5c', text: '一本记载所有答案的书——掌握知识就是掌握前路', weights: { EI: -1, SN: 0, TF: 2, JP: 1 }, guides: { flame: 0, abyss: 3, forest: -1, star: 0 } },
    ],
  },

  // ═══════════════════════════════════════
  // 第二章：探索（面对世界）— SN / TF 维度
  // ═══════════════════════════════════════

  {
    id: 'q6',
    chapterId: 'ch2',
    order: 1,
    type: 'single',
    text: '穿过迷雾之门，你来到一座漂浮在空中的城市。建筑由半透明琥珀构成，街道两旁生长着会唱歌的花朵。一位身披星辰斗篷的商人拦住去路，摊位上摆满奇怪器物：一把能切割时间的匕首、一瓶装着梦境的药水、一张标注未知大陆的地图。',
    image: 'chapter2_bg',
    estimatedTime: 30,
    options: [
      { id: 'q6a', text: '拿起地图仔细研究——标注的路线和地理信息让你兴奋', weights: { EI: 0, SN: 2, TF: 1, JP: 1 }, guides: { flame: 0, abyss: 2, forest: -1, star: 1 } },
      { id: 'q6b', text: '端起梦境药水一饮而尽——你渴望体验未知的幻象', weights: { EI: 0, SN: -2, TF: -1, JP: -1 }, guides: { flame: 1, abyss: 0, forest: 0, star: 2 } },
      { id: 'q6c', text: '和商人攀谈，询问这座城市的历史和这些器物的来历', weights: { EI: 2, SN: 1, TF: 0, JP: 0 }, guides: { flame: 1, abyss: 0, forest: 0, star: 1 } },
    ],
  },

  {
    id: 'q7',
    chapterId: 'ch2',
    order: 2,
    type: 'single',
    text: '城市中央广场上，两位长老正在激烈辩论。"石之心"长老主张用逻辑和法则治理城市，"泉之眼"长老认为应倾听每个居民的心声。居民分成两派争吵不休，他们注意到你这个外来者，请你做出裁决。',
    image: 'chapter2_bg',
    estimatedTime: 30,
    options: [
      { id: 'q7a', text: '分析双方的论据，找出逻辑上更站得住脚的方案', weights: { EI: 0, SN: 0, TF: 2, JP: 1 }, guides: { flame: 0, abyss: 2, forest: -1, star: -1 } },
      { id: 'q7b', text: '倾听两派居民的真实感受，寻找一个让大家都舒服的平衡点', weights: { EI: 1, SN: 0, TF: -2, JP: 0 }, guides: { flame: 0, abyss: -1, forest: 3, star: 0 } },
      { id: 'q7c', text: '提出一个全新的方案——两派的观点可能都有道理，也可能都忽略了什么', weights: { EI: 0, SN: -1, TF: 0, JP: -1 }, guides: { flame: 0, abyss: 0, forest: 0, star: 2 } },
    ],
  },

  {
    id: 'q8',
    chapterId: 'ch2',
    order: 3,
    type: 'single',
    text: '离开广场，你走进一条狭窄巷子。墙壁上镶嵌着无数面小镜子，每面映出不同版本的你——有的在笑，有的在哭，有的穿华丽铠甲，有的衣衫褴褛。巷子尽头站着一个影子般的存在："这些都是你可能成为的人，你想知道哪一个的故事？"',
    image: 'chapter2_bg',
    estimatedTime: 25,
    options: [
      { id: 'q8a', text: '选择最成功的那个版本——了解它做了什么正确的决定', weights: { EI: 0, SN: 1, TF: 2, JP: 1 }, guides: { flame: 2, abyss: 1, forest: -1, star: 0 } },
      { id: 'q8b', text: '选择最幸福的那个版本——成功不重要，内心的平静才重要', weights: { EI: 0, SN: 0, TF: -2, JP: 0 }, guides: { flame: -1, abyss: 0, forest: 3, star: 0 } },
      { id: 'q8c', text: '请求影子让你看到所有版本的共同点——那才是"真正的你"', weights: { EI: -1, SN: -2, TF: 0, JP: 0 }, guides: { flame: -1, abyss: 2, forest: 0, star: 1 } },
    ],
  },

  {
    id: 'q9',
    chapterId: 'ch2',
    order: 4,
    type: 'single',
    text: '城市边缘有一座巨大的图书馆，但所有的书都是空白的。图书管理员——一只会说话的猫头鹰——说："这些书页会在你触碰时显现文字，但每个人看到的内容不同。"你伸手触碰一本书，页面上缓缓浮现出文字。',
    image: 'chapter2_bg',
    estimatedTime: 25,
    options: [
      { id: 'q9a', text: '仔细阅读每一个字，试图理解并记忆这些信息', weights: { EI: -1, SN: 2, TF: 1, JP: 1 }, guides: { flame: 0, abyss: 2, forest: -1, star: 0 } },
      { id: 'q9b', text: '快速翻阅多本书，寻找它们之间的联系和隐藏的规律', weights: { EI: 0, SN: -1, TF: 1, JP: -1 }, guides: { flame: 0, abyss: 1, forest: -1, star: 2 } },
      { id: 'q9c', text: '合上书本，问猫头鹰："你觉得我应该读哪一本？"——他人的智慧也许比书本更可靠', weights: { EI: 1, SN: 0, TF: -1, JP: 0 }, guides: { flame: 0, abyss: 0, forest: 2, star: 0 } },
    ],
  },

  {
    id: 'q10',
    chapterId: 'ch2',
    order: 5,
    type: 'single',
    text: '走出图书馆，天空中出现一道巨大极光。极光中浮现一座城市的全息投影——那是"理想之城"的蓝图。猫头鹰飞来说："每个旅人看到的蓝图都不同。你看到的城市，最重要的是什么？"',
    image: 'chapter2_bg',
    estimatedTime: 25,
    options: [
      { id: 'q10a', text: '精密的交通系统和高效的资源分配——一座运转如钟表的城市', weights: { EI: 0, SN: 1, TF: 2, JP: 2 }, guides: { flame: 1, abyss: 2, forest: -1, star: -1 } },
      { id: 'q10b', text: '到处是花园和聚会场所——人们在交流中获得幸福', weights: { EI: 2, SN: 0, TF: -2, JP: 0 }, guides: { flame: 1, abyss: -1, forest: 2, star: 0 } },
      { id: 'q10c', text: '充满了未知的角落和隐秘的通道——一座永远有新发现的城市', weights: { EI: 0, SN: -2, TF: 0, JP: -2 }, guides: { flame: 0, abyss: 0, forest: 0, star: 3 } },
    ],
  },

  // ═══════════════════════════════════════
  // 第三章：抉择（价值冲突）— TF 维度
  // ═══════════════════════════════════════

  {
    id: 'q11',
    chapterId: 'ch3',
    order: 1,
    type: 'single',
    text: '极光消散后，你被传送到一片黑暗森林。前方传来求救声——一位年轻药师被荆棘缠住。她身旁篮子里装满罕见的人格草药，正是修复碎片所需的关键材料。先救她，草药可能被荆棘吞噬；先抢收草药，她可能伤得更重。',
    image: 'chapter3_bg',
    estimatedTime: 30,
    options: [
      { id: 'q11a', text: '先救药师——人的安危永远比物品重要', weights: { EI: 1, SN: 0, TF: -2, JP: 0 }, guides: { flame: 0, abyss: -1, forest: 3, star: 0 } },
      { id: 'q11b', text: '先收草药——这些草药能拯救更多人的人格碎片，理性来看应该优先保全', weights: { EI: 0, SN: 1, TF: 2, JP: 1 }, guides: { flame: 1, abyss: 2, forest: -1, star: -1 } },
      { id: 'q11c', text: '想办法同时解决——仔细观察荆棘的生长规律，寻找两全之策', weights: { EI: -1, SN: 1, TF: 0, JP: -1 }, guides: { flame: 0, abyss: 2, forest: 0, star: 1 } },
    ],
  },

  {
    id: 'q12',
    chapterId: 'ch3',
    order: 2,
    type: 'single',
    text: '药师带你来到她的村庄。守护灵兽病了，唯一治愈方法需要用到你背包里的一块人格碎片——失去它意味着你的人格星图永远不完整。村长跪在你面前，身后是几十双期盼的眼睛。',
    image: 'chapter3_bg',
    estimatedTime: 30,
    options: [
      { id: 'q12a', text: '交出碎片——这些人的生命比你的完整旅程更重要', weights: { EI: 1, SN: 0, TF: -2, JP: 0 }, guides: { flame: 0, abyss: -1, forest: 3, star: 0 } },
      { id: 'q12b', text: '拒绝交出——你的旅程关乎更多人的前路，不能因小失大', weights: { EI: 0, SN: 0, TF: 2, JP: 1 }, guides: { flame: 1, abyss: 2, forest: -1, star: 0 } },
      { id: 'q12c', text: '提出条件——你愿意帮助，但村庄必须用其他方式回报你', weights: { EI: 0, SN: 1, TF: 1, JP: 1 }, guides: { flame: 1, abyss: 1, forest: 0, star: 0 } },
    ],
  },

  {
    id: 'q13',
    chapterId: 'ch3',
    order: 3,
    type: 'single',
    text: '深夜篝火旁，火焰中浮现出竞争对手的面孔——他被困在"虚空裂隙"中，不救援就永远迷失。他曾偷走你的重要线索，害你绕了远路。火焰正在变小，你必须立刻决定。',
    image: 'chapter3_bg',
    estimatedTime: 25,
    options: [
      { id: 'q13a', text: '毫不犹豫地伸手拉住他——无论过去发生了什么，见死不救不是你的风格', weights: { EI: 1, SN: 0, TF: -2, JP: 0 }, guides: { flame: 2, abyss: -1, forest: 2, star: 0 } },
      { id: 'q13b', text: '冷静权衡——救他可能给自己带来风险，而且他曾经背叛过你', weights: { EI: -1, SN: 0, TF: 2, JP: 1 }, guides: { flame: -1, abyss: 2, forest: -1, star: 0 } },
    ],
  },

  {
    id: 'q14',
    chapterId: 'ch3',
    order: 4,
    type: 'single',
    text: '你救出了竞争对手。他感激地递来"人格审判者"的邀请函："明晚月圆，审判之塔将开启，你将面对一场关于正义的考验。"翌日塔内，天平一端放着跳动的心脏，另一端是厚重法典。审判者问道："旅人，什么才是正义的根基？"',
    image: 'chapter3_bg',
    estimatedTime: 30,
    options: [
      { id: 'q14a', text: '将手放在心脏上——正义的根基是对每个生命的悲悯与理解', weights: { EI: 0, SN: -1, TF: -2, JP: 0 }, guides: { flame: 0, abyss: 0, forest: 3, star: 0 } },
      { id: 'q14b', text: '翻开法典——正义需要清晰的规则和公平的准则来维系', weights: { EI: 0, SN: 1, TF: 2, JP: 1 }, guides: { flame: 1, abyss: 2, forest: -1, star: -1 } },
      { id: 'q14c', text: '将天平两端轻轻平衡——真正的正义在规则与温情之间寻找平衡', weights: { EI: 0, SN: 0, TF: 0, JP: -1 }, guides: { flame: 0, abyss: 1, forest: 1, star: 1 } },
    ],
  },

  {
    id: 'q15',
    chapterId: 'ch3',
    order: 5,
    type: 'single',
    text: '审判者点头，审判之塔开始崩解。废墟中你发现一颗散发温暖光芒的人格碎片，但碎片旁蜷缩着一个哭泣的孩子——她也是旅人，迷路已久，非常害怕。碎片的光芒正在减弱，片刻后就会消失。',
    image: 'chapter3_bg',
    estimatedTime: 25,
    options: [
      { id: 'q15a', text: '先安慰孩子，碎片可以再找，但一个孩子的恐惧不能忽视', weights: { EI: 1, SN: 0, TF: -2, JP: 0 }, guides: { flame: 0, abyss: -1, forest: 3, star: 0 } },
      { id: 'q15b', text: '迅速拾起碎片，然后再照顾孩子——碎片稍纵即逝，必须抓住机会', weights: { EI: 0, SN: 1, TF: 2, JP: 1 }, guides: { flame: 2, abyss: 1, forest: -1, star: 0 } },
    ],
  },

  // ═══════════════════════════════════════
  // 第四章：蜕变（压力应对）— EI / JP 维度
  // ═══════════════════════════════════════

  {
    id: 'q16',
    chapterId: 'ch4',
    order: 1,
    type: 'single',
    text: '带着孩子走出废墟，天空裂开巨大缝隙，暗影如潮水倾泻，大地开始震颤。号角声响起——"暗潮"来袭。所有人都在奔跑，混乱中你听到两个声音：指挥官在组织防线，远处山洞里传来低语，似乎藏着古老秘密。',
    image: 'chapter4_bg',
    estimatedTime: 30,
    options: [
      { id: 'q16a', text: '加入防线——和大家并肩作战，集体的力量才能抵御暗潮', weights: { EI: 2, SN: 1, TF: 0, JP: 2 }, guides: { flame: 2, abyss: -1, forest: 1, star: 0 } },
      { id: 'q16b', text: '独自前往山洞——也许那里藏着终结暗潮的关键', weights: { EI: -2, SN: -1, TF: 0, JP: -1 }, guides: { flame: 0, abyss: 2, forest: 0, star: 1 } },
      { id: 'q16c', text: '先观察暗潮的模式，找到规律后再决定行动方向', weights: { EI: -1, SN: 1, TF: 1, JP: -1 }, guides: { flame: 0, abyss: 2, forest: -1, star: 1 } },
    ],
  },

  {
    id: 'q17',
    chapterId: 'ch4',
    order: 2,
    type: 'single',
    text: '暗潮中，你获得一件"人格武装"——它会根据你的内心变化。意志坚定如铁，它变成坚不可摧的盾牌；心灵灵活如水，它变成斩断幻象的长剑。但你只有三分钟决定它的形态，暗潮不会等你。',
    image: 'chapter4_bg',
    estimatedTime: 25,
    options: [
      { id: 'q17a', text: '立刻选定盾牌形态——危急关头，保护自己和身边的人最重要', weights: { EI: 1, SN: 1, TF: 0, JP: 2 }, guides: { flame: 2, abyss: 0, forest: 1, star: -1 } },
      { id: 'q17b', text: '选择长剑——进攻是最好的防守，要主动出击解决根源', weights: { EI: 1, SN: 0, TF: 1, JP: 1 }, guides: { flame: 3, abyss: 0, forest: -1, star: 0 } },
      { id: 'q17c', text: '在最后一刻再做决定——也许观察暗潮的攻击方式后才能选对形态', weights: { EI: -1, SN: 0, TF: 0, JP: -2 }, guides: { flame: 0, abyss: 1, forest: 0, star: 2 } },
    ],
  },

  {
    id: 'q18',
    chapterId: 'ch4',
    order: 3,
    type: 'single',
    text: '战斗结束后，你在暗潮残骸中发现一面"记忆之镜"。它映照出你过去的每一个决定，包括那些后悔的时刻。镜中的你正重演痛苦经历。一个声音说："你可以选择抹去一段记忆，或者保留所有记忆，带着伤痕继续前行。"',
    image: 'chapter4_bg',
    estimatedTime: 25,
    options: [
      { id: 'q18a', text: '保留所有记忆——每一段经历都塑造了现在的你，包括痛苦', weights: { EI: 0, SN: 1, TF: -1, JP: -1 }, guides: { flame: 0, abyss: 1, forest: 2, star: 1 } },
      { id: 'q18b', text: '抹去最痛苦的那段——放下包袱才能走得更远更高效', weights: { EI: 0, SN: 0, TF: 2, JP: 1 }, guides: { flame: 2, abyss: 1, forest: -1, star: 0 } },
      { id: 'q18c', text: '不立刻回答，而是先和镜子中"过去的自己"对话', weights: { EI: -1, SN: -1, TF: -1, JP: -1 }, guides: { flame: -1, abyss: 2, forest: 1, star: 1 } },
    ],
  },

  {
    id: 'q19',
    chapterId: 'ch4',
    order: 4,
    type: 'single',
    text: '你遇到"星尘行者"——一位独自旅行很久的旅人，收集了比你更多的人格碎片。她提议结盟，条件是你必须按她精心制定的计划行动，不能擅自改变路线。计划看起来很周密，但你总觉得少了些什么。',
    image: 'chapter4_bg',
    estimatedTime: 25,
    options: [
      { id: 'q19a', text: '接受她的计划——有条理的方案比盲目行动更可靠', weights: { EI: 0, SN: 1, TF: 1, JP: 2 }, guides: { flame: 1, abyss: 1, forest: 0, star: -1 } },
      { id: 'q19b', text: '同意结盟但保留灵活度——计划赶不上变化，需要随机应变', weights: { EI: 1, SN: 0, TF: 0, JP: -2 }, guides: { flame: 1, abyss: 0, forest: 0, star: 2 } },
      { id: 'q19c', text: '婉拒结盟，继续独自旅行——你需要按自己的节奏前进', weights: { EI: -2, SN: 0, TF: 0, JP: -1 }, guides: { flame: 0, abyss: 2, forest: 0, star: 1 } },
    ],
  },

  {
    id: 'q20',
    chapterId: 'ch4',
    order: 5,
    type: 'single',
    text: '前方出现"试炼之桥"，桥面由浮动光块组成，没有固定路径，桥的另一端是人格圣殿入口。旁边石碑刻着两种过桥方式：按光块闪烁的规律一步步踏过去，需要耐心和观察；纵身跃入光块间的空隙，让人格力量托举你飞过，需要勇气和信任。',
    image: 'chapter4_bg',
    estimatedTime: 25,
    options: [
      { id: 'q20a', text: '研究光块的规律，按部就班地稳步通过', weights: { EI: -1, SN: 2, TF: 1, JP: 2 }, guides: { flame: 0, abyss: 2, forest: -1, star: -1 } },
      { id: 'q20b', text: '纵身跃入空隙——相信自己的直觉和人格力量', weights: { EI: 1, SN: -2, TF: -1, JP: -2 }, guides: { flame: 2, abyss: 0, forest: 0, star: 2 } },
    ],
  },

  // ═══════════════════════════════════════
  // 第五章：归宿（生活方式）— JP 维度
  // ═══════════════════════════════════════

  {
    id: 'q21',
    chapterId: 'ch5',
    order: 1,
    type: 'single',
    text: '人格圣殿大门打开，里面是一片无垠的空白空间。守护者声如钟鸣："旅人，你已走过觉醒、探索、抉择与蜕变。现在用人格碎片构建属于你的世界——首先，你希望这个世界有多大？"',
    image: 'chapter5_bg',
    estimatedTime: 30,
    options: [
      { id: 'q21a', text: '一个精致的小世界——每一个角落都经过精心设计，完美无缺', weights: { EI: -1, SN: 1, TF: 0, JP: 2 }, guides: { flame: 1, abyss: 1, forest: 0, star: 0 } },
      { id: 'q21b', text: '一个无限延伸的大世界——永远有未知的领域等待发现', weights: { EI: 1, SN: -1, TF: 0, JP: -2 }, guides: { flame: 1, abyss: 0, forest: 0, star: 2 } },
      { id: 'q21c', text: '一个会自己生长的活世界——你种下种子，让它自然演化', weights: { EI: 0, SN: -1, TF: 0, JP: -1 }, guides: { flame: 0, abyss: 0, forest: 2, star: 1 } },
    ],
  },

  {
    id: 'q22',
    chapterId: 'ch5',
    order: 2,
    type: 'single',
    text: '你开始塑造世界地形。手中浮现三种元素之力：大地之力创造坚固山脉和平原，流水之力雕刻蜿蜒河流和湖泊，风之力塑造不断变化的沙丘和云海。守护者说："你选择的元素，将决定这个世界的运行方式。"',
    image: 'chapter5_bg',
    estimatedTime: 25,
    options: [
      { id: 'q22a', text: '大地之力——创造一个稳定、有序、可以预测的世界', weights: { EI: 0, SN: 2, TF: 1, JP: 2 }, guides: { flame: 1, abyss: 2, forest: -1, star: -1 } },
      { id: 'q22b', text: '流水之力——创造一个柔和、流动、充满变化的世界', weights: { EI: 0, SN: -1, TF: -1, JP: -2 }, guides: { flame: -1, abyss: 0, forest: 2, star: 1 } },
      { id: 'q22c', text: '风之力——创造一个自由、多变、充满意外的世界', weights: { EI: 1, SN: -1, TF: 0, JP: -2 }, guides: { flame: 1, abyss: -1, forest: 0, star: 3 } },
    ],
  },

  {
    id: 'q23',
    chapterId: 'ch5',
    order: 3,
    type: 'single',
    text: '世界初具雏形，还缺少"居民"。你可以从人格碎片中召唤三种存在：守序者建立规则维护秩序，梦想家创造艺术传播灵感，旅行者不断探索带回新故事。守护者问："你希望谁是最重要的存在？"',
    image: 'chapter5_bg',
    estimatedTime: 25,
    options: [
      { id: 'q23a', text: '守序者——没有秩序的世界终将崩塌', weights: { EI: 0, SN: 1, TF: 2, JP: 2 }, guides: { flame: 1, abyss: 2, forest: -1, star: -1 } },
      { id: 'q23b', text: '梦想家——没有艺术和灵感的世界毫无意义', weights: { EI: 0, SN: -2, TF: -2, JP: 0 }, guides: { flame: -1, abyss: 0, forest: 1, star: 3 } },
      { id: 'q23c', text: '旅行者——没有新发现和故事的世界太过沉闷', weights: { EI: 2, SN: 0, TF: 0, JP: -2 }, guides: { flame: 1, abyss: 0, forest: 0, star: 2 } },
    ],
  },

  {
    id: 'q24',
    chapterId: 'ch5',
    order: 4,
    type: 'single',
    text: '世界生机勃勃，但还缺最重要的法则——"时间规则"。你可以选择：让时间匀速前进如直线，一切井然有序；让时间像四季循环往复；或让时间自由流动，有时快有时慢，充满不确定性。',
    image: 'chapter5_bg',
    estimatedTime: 25,
    options: [
      { id: 'q24a', text: '匀速直线——精确、可控，每一天都可以被完美规划', weights: { EI: 0, SN: 1, TF: 1, JP: 2 }, guides: { flame: 1, abyss: 2, forest: -1, star: -1 } },
      { id: 'q24b', text: '四季循环——有节奏的变化让人安心，同时保持新鲜感', weights: { EI: 0, SN: 0, TF: 0, JP: 0 }, guides: { flame: 0, abyss: 0, forest: 2, star: 1 } },
      { id: 'q24c', text: '自由流动——生活的魅力就在于不可预测，为什么要控制时间？', weights: { EI: 1, SN: -1, TF: -1, JP: -2 }, guides: { flame: 1, abyss: -1, forest: 0, star: 2 } },
    ],
  },

  {
    id: 'q25',
    chapterId: 'ch5',
    order: 5,
    type: 'single',
    text: '旅程即将结束。守护者最后一次出现："旅人，你想在哪里安家？"他展示三个地方：山顶石塔俯瞰整个世界，一切尽收眼底；森林小木屋被树木环抱，安静温暖；海边随潮汐移动的船屋，每天醒来窗外风景都不同。',
    image: 'chapter5_bg',
    estimatedTime: 30,
    options: [
      { id: 'q25a', text: '山顶石塔——高处视野开阔，一切尽在掌握之中', weights: { EI: -1, SN: 1, TF: 1, JP: 2 }, guides: { flame: 1, abyss: 2, forest: -1, star: 0 } },
      { id: 'q25b', text: '森林小木屋——温暖安全，被熟悉的事物环绕就是幸福', weights: { EI: -1, SN: 2, TF: -1, JP: 1 }, guides: { flame: 0, abyss: 0, forest: 3, star: 0 } },
      { id: 'q25c', text: '海边船屋——每天都是新的一天，永远有新的故事在前方', weights: { EI: 1, SN: -1, TF: 0, JP: -2 }, guides: { flame: 1, abyss: -1, forest: 0, star: 3 } },
    ],
  },
]
