/**
 * 灵魂星图 - invite 云函数
 *
 * action 支持：
 *   'getMyCode'         - 获取自己的邀请码（不存在则创建）
 *   'getProgress'       - 获取当前用户的邀请进度
 *   'bindInvitee'       - 被邀请者进入应用时登记邀请关系
 *   'inviteeCompleted'  - 被邀请者完成测试后回调
 *   'claimReward'       - 领取奖励
 *
 * 依赖集合：
 *   invitations       { inviterOpenid, inviteeOpenid, inviteCode, inviteeCompleted, rewardClaimed, createdAt }
 *   invite_codes      { openid, inviteCode, createdAt }        // 反查表
 *   users             { _openid, unlockedRewards[], ... }
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

const REWARDS = {
  social_style: 1,
  full_free_report: 3,
  compare_ticket: 5,
}

/** 简单短哈希（与前端保持一致） */
function shortHash(input) {
  if (!input) return Math.random().toString(36).slice(2, 8).toLowerCase()
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0
  }
  h = (h ^ 0x9e3779b9) >>> 0
  return h.toString(36).padStart(6, '0').slice(-6)
}

async function ensureInviteCode(openid) {
  const existing = await db.collection('invite_codes')
    .where({ openid })
    .limit(1)
    .get()
  if (existing.data && existing.data.length > 0) {
    return existing.data[0].inviteCode
  }
  let code = shortHash(openid)
  // 冲突处理：若已被占用则加随机后缀重试
  for (let i = 0; i < 3; i++) {
    const dup = await db.collection('invite_codes').where({ inviteCode: code }).limit(1).get()
    if (!dup.data || dup.data.length === 0) break
    code = shortHash(openid + '_' + i + Math.random())
  }
  await db.collection('invite_codes').add({
    data: { openid, inviteCode: code, createdAt: Date.now() },
  })
  return code
}

async function countInvited(openid) {
  const res = await db.collection('invitations')
    .where({ inviterOpenid: openid, inviteeCompleted: true })
    .count()
  return res.total || 0
}

async function getClaimedRewards(openid) {
  const userRes = await db.collection('users').where({ _openid: openid }).limit(1).get()
  if (!userRes.data || userRes.data.length === 0) return []
  return (userRes.data[0].unlockedRewards) || []
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  if (!openid) return { success: false, errMsg: '未获取到用户身份' }

  const action = event.action

  try {
    if (action === 'getMyCode') {
      const code = await ensureInviteCode(openid)
      return { success: true, data: { inviteCode: code } }
    }

    if (action === 'getProgress') {
      const code = await ensureInviteCode(openid)
      const invited = await countInvited(openid)
      const claimedRewards = await getClaimedRewards(openid)
      return {
        success: true,
        data: { invited, claimedRewards, inviteCode: code },
      }
    }

    if (action === 'bindInvitee') {
      const inviteCode = String(event.inviteCode || '').toLowerCase().slice(0, 12)
      if (!inviteCode) return { success: false, errMsg: '邀请码为空' }

      const codeRes = await db.collection('invite_codes')
        .where({ inviteCode })
        .limit(1)
        .get()
      if (!codeRes.data || codeRes.data.length === 0) {
        return { success: false, errMsg: '邀请码无效' }
      }
      const inviterOpenid = codeRes.data[0].openid
      if (inviterOpenid === openid) {
        return { success: false, errMsg: '不能邀请自己' }
      }

      // 防重复绑定
      const dup = await db.collection('invitations')
        .where({ inviterOpenid, inviteeOpenid: openid })
        .limit(1)
        .get()
      if (dup.data && dup.data.length > 0) {
        return { success: true, data: { duplicated: true } }
      }

      // 每日邀请上限（邀请者当日绑定超过 10 人则拒绝新绑定）
      const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0)
      const dayCount = await db.collection('invitations')
        .where({
          inviterOpenid,
          createdAt: _.gte(dayStart.getTime()),
        })
        .count()
      if ((dayCount.total || 0) >= 10) {
        return { success: false, errMsg: '该邀请人今日邀请已达上限' }
      }

      await db.collection('invitations').add({
        data: {
          inviterOpenid,
          inviteeOpenid: openid,
          inviteCode,
          inviteeCompleted: false,
          rewardClaimed: false,
          createdAt: Date.now(),
        },
      })
      return { success: true, data: { inviterOpenid } }
    }

    if (action === 'inviteeCompleted') {
      const inviteCode = String(event.inviteCode || '').toLowerCase()
      const bindRes = await db.collection('invitations')
        .where({ inviteeOpenid: openid, inviteCode })
        .limit(1)
        .get()
      if (!bindRes.data || bindRes.data.length === 0) {
        return { success: false, errMsg: '未找到邀请关系' }
      }
      const record = bindRes.data[0]
      if (record.inviteeCompleted) {
        return { success: true, data: { alreadyCompleted: true } }
      }
      await db.collection('invitations').doc(record._id).update({
        data: { inviteeCompleted: true, completedAt: Date.now() },
      })
      return { success: true, data: { inviterOpenid: record.inviterOpenid } }
    }

    if (action === 'claimReward') {
      const rewardKey = String(event.rewardKey || '')
      const threshold = REWARDS[rewardKey]
      if (!threshold) return { success: false, errMsg: '奖励标识无效' }

      const invited = await countInvited(openid)
      if (invited < threshold) {
        return { success: false, errMsg: `尚需邀请 ${threshold - invited} 位好友` }
      }

      // 幂等：写入 users.unlockedRewards
      const userRes = await db.collection('users').where({ _openid: openid }).limit(1).get()
      if (!userRes.data || userRes.data.length === 0) {
        await db.collection('users').add({
          data: {
            _openid: openid,
            unlockedRewards: [rewardKey],
            createdAt: Date.now(),
          },
        })
      } else {
        const user = userRes.data[0]
        const arr = user.unlockedRewards || []
        if (!arr.includes(rewardKey)) {
          await db.collection('users').doc(user._id).update({
            data: { unlockedRewards: _.push([rewardKey]) },
          })
        }
      }

      return { success: true, data: { rewardKey } }
    }

    return { success: false, errMsg: '不支持的 action: ' + action }
  } catch (err) {
    console.error('[invite] error:', err)
    return { success: false, errMsg: (err && err.message) || 'invite error' }
  }
}
