/**
 * 灵魂星图 - login 云函数
 * 处理用户登录（静默登录 / 获取用户信息 / 更新用户资料）
 *
 * action:
 *   (默认)         - 静默登录：通过 OPENID 获取或创建用户记录
 *   'getProfile'   - 获取用户详细资料
 *   'updateProfile'- 更新用户资料
 */
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const unionid = wxContext.UNIONID || ''

  if (!openid) {
    return { success: false, errMsg: '未获取到用户身份' }
  }

  const action = event.action || 'login'

  // ========== 静默登录 ==========
  if (action === 'login') {
    try {
      // 查找用户是否已存在
      const userRes = await db.collection('users')
        .where({ _openid: openid })
        .limit(1)
        .get()

      const now = Date.now()

      if (userRes.data && userRes.data.length > 0) {
        // 用户已存在，更新最后登录时间
        const user = userRes.data[0]

        await db.collection('users').doc(user._id).update({
          data: { lastLoginAt: now }
        })

        return {
          success: true,
          data: {
            id: user._id,
            openId: openid,
            nickname: user.nickname || '星旅者',
            avatarUrl: user.avatarUrl || '',
            latestType: user.latestType || undefined,
            membership: user.membership || { type: 'free', expireAt: 0, isActive: false },
          }
        }
      }

      // 新用户：创建用户记录
      const newUser = {
        _openid: openid,
        unionid,
        nickname: '星旅者',
        avatarUrl: '',
        phone: '',
        tags: [],
        latestType: '',
        membership: {
          type: 'free',
          expireAt: 0,
          isActive: false,
        },
        createdAt: now,
        lastLoginAt: now,
        authorized: false,
      }

      const addRes = await db.collection('users').add({ data: newUser })

      return {
        success: true,
        data: {
          id: addRes._id,
          openId: openid,
          nickname: newUser.nickname,
          avatarUrl: newUser.avatarUrl,
          membership: newUser.membership,
        }
      }
    } catch (err) {
      console.error('[login] 登录失败:', err)
      return { success: false, errMsg: '登录失败，请重试' }
    }
  }

  // ========== 获取用户资料 ==========
  if (action === 'getProfile') {
    try {
      const userRes = await db.collection('users')
        .where({ _openid: openid })
        .limit(1)
        .get()

      if (!userRes.data || userRes.data.length === 0) {
        return { success: false, errMsg: '用户不存在，请先登录' }
      }

      const user = userRes.data[0]

      return {
        success: true,
        data: {
          id: user._id,
          nickname: user.nickname || '星旅者',
          avatarUrl: user.avatarUrl || '',
          phone: user.phone || '',
          tags: user.tags || [],
          latestType: user.latestType || undefined,
          membership: user.membership || { type: 'free', expireAt: 0, isActive: false },
          createdAt: user.createdAt || 0,
          lastLoginAt: user.lastLoginAt || 0,
        }
      }
    } catch (err) {
      console.error('[login] 获取资料失败:', err)
      return { success: false, errMsg: '获取用户资料失败' }
    }
  }

  // ========== 更新用户资料 ==========
  if (action === 'updateProfile') {
    const { nickname, avatarUrl, phone, tags } = event
    const updateData = {}

    if (nickname !== undefined) updateData.nickname = nickname
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl
    if (phone !== undefined) updateData.phone = phone
    if (tags !== undefined) updateData.tags = tags
    updateData.updatedAt = Date.now()

    if (Object.keys(updateData).length <= 1) {
      return { success: false, errMsg: '没有可更新的字段' }
    }

    try {
      await db.collection('users')
        .where({ _openid: openid })
        .update({ data: updateData })

      return { success: true, data: null }
    } catch (err) {
      console.error('[login] 更新资料失败:', err)
      return { success: false, errMsg: '更新用户资料失败' }
    }
  }

  return { success: false, errMsg: `不支持的操作: ${action}` }
}
