/**
 * 灵魂星图 - compare 云函数
 *
 * action:
 *   'create'   - 用户 A 创建对比邀请，返回 compareCode
 *   'join'     - 用户 B 通过 compareCode 加入，撮合并计算契合度
 *   'get'      - 拉取对比记录
 *   'markPaid' - 付费解锁详细报告
 *
 * 集合：
 *   comparisons { compareCode, userA, userB, compatibility, relationLabel, isPaid, createdAt }
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function randomCode() {
  return Math.random().toString(36).slice(2, 10).toLowerCase()
}

/** 基础契合度计算（简版，与前端保持一致） */
function codeToScores(code) {
  const [c0, c1, c2, c3] = String(code || 'INFP').toUpperCase().split('')
  return {
    EI: c0 === 'E' ? 80 : 20,
    SN: c1 === 'S' ? 80 : 20,
    TF: c2 === 'T' ? 80 : 20,
    JP: c3 === 'J' ? 80 : 20,
  }
}

function calcCompat(tA, tB, sA, sB) {
  const scA = sA || codeToScores(tA)
  const scB = sB || codeToScores(tB)
  const harmony = {
    EI: 100 - Math.abs(scA.EI - scB.EI),
    SN: 100 - Math.abs(scA.SN - scB.SN),
    TF: 100 - Math.abs(scA.TF - scB.TF),
    JP: 100 - Math.abs(scA.JP - scB.JP),
  }
  const base = harmony.EI * 0.2 + harmony.SN * 0.3 + harmony.TF * 0.3 + harmony.JP * 0.2
  let bonus = 0
  if (tA[0] !== tB[0]) bonus += 4
  if (tA[2] !== tB[2]) bonus += 4
  if (tA[1] !== tB[1]) bonus -= 2
  if (tA === tB) bonus += 5
  return Math.max(20, Math.min(98, Math.round(base + bonus)))
}

function relationLabelOf(score) {
  if (score >= 80) return '天作之合'
  if (score >= 60) return '灵魂知己'
  if (score >= 40) return '欢喜冤家'
  return '平行宇宙'
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  if (!openid) return { success: false, errMsg: '未获取到用户身份' }

  const action = event.action

  try {
    if (action === 'create') {
      const userA = event.userA || {}
      const code = randomCode()
      const doc = {
        compareCode: code,
        userA: {
          openid,
          personalityType: userA.personalityType,
          scores: userA.scores || codeToScores(userA.personalityType),
          nickname: userA.nickname || '',
        },
        userB: null,
        compatibility: null,
        relationLabel: null,
        isPaid: false,
        createdAt: Date.now(),
      }
      await db.collection('comparisons').add({ data: doc })
      return { success: true, data: { compareCode: code } }
    }

    if (action === 'join') {
      const compareCode = String(event.compareCode || '').toLowerCase()
      const userB = event.userB || {}
      const res = await db.collection('comparisons')
        .where({ compareCode })
        .limit(1)
        .get()
      if (!res.data || res.data.length === 0) {
        return { success: false, errMsg: '对比不存在' }
      }
      const rec = res.data[0]
      if (rec.userA.openid === openid) {
        return { success: false, errMsg: '不能与自己对比' }
      }
      if (rec.userB && rec.userB.openid && rec.userB.openid !== openid) {
        // 已被其他人加入
        return { success: false, errMsg: '该对比已有其他好友加入' }
      }

      const partnerB = {
        openid,
        personalityType: userB.personalityType,
        scores: userB.scores || codeToScores(userB.personalityType),
        nickname: userB.nickname || '',
      }
      const compat = calcCompat(
        rec.userA.personalityType,
        partnerB.personalityType,
        rec.userA.scores,
        partnerB.scores,
      )
      const label = relationLabelOf(compat)
      await db.collection('comparisons').doc(rec._id).update({
        data: {
          userB: partnerB,
          compatibility: compat,
          relationLabel: label,
          matchedAt: Date.now(),
        },
      })
      return {
        success: true,
        data: {
          compareCode,
          userA: rec.userA,
          userB: partnerB,
          compatibility: compat,
          relationLabel: label,
          isPaid: !!rec.isPaid,
          createdAt: rec.createdAt,
        },
      }
    }

    if (action === 'get') {
      const compareCode = String(event.compareCode || '').toLowerCase()
      const res = await db.collection('comparisons')
        .where({ compareCode })
        .limit(1)
        .get()
      if (!res.data || res.data.length === 0) {
        return { success: false, errMsg: '对比不存在' }
      }
      const rec = res.data[0]
      return {
        success: true,
        data: {
          compareCode: rec.compareCode,
          userA: rec.userA,
          userB: rec.userB,
          compatibility: rec.compatibility,
          relationLabel: rec.relationLabel,
          isPaid: !!rec.isPaid,
          createdAt: rec.createdAt,
        },
      }
    }

    if (action === 'markPaid') {
      const compareCode = String(event.compareCode || '').toLowerCase()
      const res = await db.collection('comparisons')
        .where({ compareCode })
        .limit(1)
        .get()
      if (!res.data || res.data.length === 0) {
        return { success: false, errMsg: '对比不存在' }
      }
      const rec = res.data[0]
      // 权限：只允许双方之一操作
      const isParty = rec.userA?.openid === openid || rec.userB?.openid === openid
      if (!isParty) return { success: false, errMsg: '无权修改此对比' }
      await db.collection('comparisons').doc(rec._id).update({
        data: { isPaid: true, paidAt: Date.now() },
      })
      return { success: true, data: { compareCode } }
    }

    return { success: false, errMsg: '不支持的 action: ' + action }
  } catch (err) {
    console.error('[compare] error:', err)
    return { success: false, errMsg: (err && err.message) || 'compare error' }
  }
}
