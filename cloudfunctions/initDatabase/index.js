/**
 * 灵魂星图 - initDatabase 云函数
 * 初始化云开发数据库集合与题目数据
 * 仅在首次部署或重置数据库时执行一次
 */
const cloud = require('wx-server-sdk')
const fs = require('fs')
const path = require('path')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

/**
 * 安全地创建集合（忽略已存在错误）
 */
async function ensureCollection(name) {
  try {
    await db.createCollection(name)
    return { name, created: true }
  } catch (err) {
    if (err && err.message && err.message.includes('already exists')) {
      return { name, created: false, exists: true }
    }
    // 部分环境可能直接返回成功或抛出其他错误，这里统一兜底
    return { name, created: false, error: err.message }
  }
}

/**
 * 导入题目数据
 */
async function seedQuestions() {
  const questionsPath = path.join(__dirname, 'questions.json')
  const raw = fs.readFileSync(questionsPath, 'utf-8')
  const questions = JSON.parse(raw)

  const existed = await db.collection('questions').count()
  if (existed.total > 0) {
    return { seeded: false, total: existed.total, message: 'questions 集合已有数据，跳过导入' }
  }

  const batchSize = 20
  const batches = []
  for (let i = 0; i < questions.length; i += batchSize) {
    batches.push(questions.slice(i, i + batchSize))
  }

  let inserted = 0
  for (const batch of batches) {
    const tasks = batch.map((q) => db.collection('questions').add({ data: q }))
    const results = await Promise.all(tasks)
    inserted += results.length
  }

  return { seeded: true, count: inserted }
}

exports.main = async (event, context) => {
  // Phase 1 基础集合
  const baseCollections = ['users', 'test_results', 'orders', 'questions']
  // Phase 2 新增集合
  const phase2Collections = [
    'events',                    // 埋点事件
    'invitations',               // 邀请关系
    'invite_codes',              // 邀请码反查表
    'comparisons',               // 好友对比记录
    'subscribe_authorizations',  // 订阅消息授权额度
    'message_logs',              // 订阅消息发送日志
  ]
  const collections = [...baseCollections, ...phase2Collections]

  // 是否跳过题目导入（默认跳过，避免重复导入或 questions.json 缺失时报错）
  const skipSeed = event && event.skipSeed !== false

  try {
    const collectionResults = []
    for (const name of collections) {
      const result = await ensureCollection(name)
      collectionResults.push(result)
    }

    let seedResult = { seeded: false, message: '本次跳过题目导入' }
    if (!skipSeed) {
      seedResult = await seedQuestions()
    }

    return {
      success: true,
      data: {
        collections: collectionResults,
        questions: seedResult,
      },
      message: '数据库初始化完成',
    }
  } catch (err) {
    console.error('[initDatabase] 初始化失败:', err)
    return { success: false, errMsg: err.message || '初始化失败' }
  }
}
