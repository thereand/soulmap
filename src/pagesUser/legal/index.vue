<!--
  灵魂星图 - 隐私协议 / 用户协议页
  通过 query 参数 type=privacy|terms 切换
-->
<template>
  <scroll-view scroll-y class="legal-page" :style="{ height: '100vh' }">
    <view class="legal-content">
      <text class="legal-title">{{ title }}</text>
      <text class="legal-update">最近更新：2026 年 08 月</text>

      <template v-if="type === 'privacy'">
        <text class="legal-section-title">1. 我们收集的信息</text>
        <text class="legal-text">
          我们仅在必要范围内收集与本应用功能相关的信息，包括：（1）您在测试中填写的答题选项与生成的人格结果；（2）微信授权登录后的 openId、昵称、头像（如您主动授权）；（3）设备与运行环境基本信息，用于故障排查与运营分析。
        </text>

        <text class="legal-section-title">2. 信息使用方式</text>
        <text class="legal-text">
          您的答题数据仅用于生成个性化结果与聚合统计；不会与您的姓名、身份证、手机号等身份信息关联对外披露。运营分析仅使用去标识化后的数据。
        </text>

        <text class="legal-section-title">3. 信息共享</text>
        <text class="legal-text">
          除法律法规要求或您主动分享外，我们不会向任何第三方提供您可被识别的个人信息。分享行为由您主动触发（例如生成海报、邀请好友），仅包含您愿意公开的内容。
        </text>

        <text class="legal-section-title">4. 数据存储与安全</text>
        <text class="legal-text">
          您的数据存储在腾讯云开发提供的加密数据库中。我们已采取合理的技术与管理措施防止数据泄露，但请注意任何互联网传输均存在风险，请妥善保护您的账号。
        </text>

        <text class="legal-section-title">5. 您的权利</text>
        <text class="legal-text">
          您可以随时通过"个人中心"清除本地测试记录；如需删除服务器端的关联数据，请通过应用内联系方式提交请求，我们将在合理期限内响应。
        </text>

        <text class="legal-section-title">6. 未成年人保护</text>
        <text class="legal-text">
          本应用主要面向 14 周岁以上用户。若您未满 14 周岁，请在监护人指导下使用；我们不会主动收集未成年人的敏感个人信息。
        </text>

        <text class="legal-section-title">7. 联系方式</text>
        <text class="legal-text">
          如对本隐私政策有任何疑问，请通过应用内反馈入口或邮件与我们联系。
        </text>
      </template>

      <template v-else>
        <text class="legal-section-title">1. 服务概述</text>
        <text class="legal-text">
          "灵魂星图"是一款趣味人格探索小程序，提供沉浸式故事化题目与人格类型解析。所有解析结果均基于您的答题选项进行算法计算，仅供娱乐参考。
        </text>

        <text class="legal-section-title">2. 使用规范</text>
        <text class="legal-text">
          您应文明使用本应用，不得利用本服务从事违法违规活动，不得复制、篡改或倒卖应用中的题目、报告等内容。
        </text>

        <text class="legal-section-title">3. 免责声明（重要）</text>
        <text class="legal-text">
          本应用的所有结果、报告与建议均为 AI 与心理学理论结合下的通用性描述，不构成任何形式的心理咨询、医疗诊断或职业规划建议。若您正处于情绪困扰或健康问题，请及时寻求专业机构的帮助。
        </text>

        <text class="legal-section-title">4. 付费服务</text>
        <text class="legal-text">
          部分深度解读、契合度详细报告等属于付费内容。付费后可在有效期内不限次数查看，因商品性质特殊，一经购买不支持退款，请知悉后再进行操作。
        </text>

        <text class="legal-section-title">5. 知识产权</text>
        <text class="legal-text">
          本应用内所有原创星灵形象、题目文本、报告文案、视觉设计及算法均归开发者所有，未经书面许可不得转载、改编或用于商业用途。
        </text>

        <text class="legal-section-title">6. 服务变更与终止</text>
        <text class="legal-text">
          我们有权基于运营或合规需要，对服务功能、内容、定价等进行调整或暂停，我们将通过合理方式提前公告。
        </text>

        <text class="legal-section-title">7. 争议解决</text>
        <text class="legal-text">
          本协议的解释与执行适用中华人民共和国相关法律；如产生争议，双方应友好协商，协商不成的可提交开发者所在地法院裁决。
        </text>
      </template>

      <view class="safe-bottom" />
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const type = ref<'privacy' | 'terms'>('privacy')

const title = computed(() => (type.value === 'privacy' ? '隐私协议' : '用户协议'))

onLoad((query) => {
  const t = (query?.type as string) || 'privacy'
  type.value = t === 'terms' ? 'terms' : 'privacy'
  uni.setNavigationBarTitle({ title: title.value })
})
</script>

<style lang="scss" scoped>
.legal-page {
  background: $bg-gradient-star;
  min-height: 100vh;
}

.legal-content {
  padding: $spacing-xxl $spacing-xl;
}

.legal-title {
  display: block;
  font-size: 48rpx;
  font-weight: 800;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.legal-update {
  display: block;
  font-size: $font-sm;
  color: $text-muted;
  margin-bottom: $spacing-xxl;
}

.legal-section-title {
  display: block;
  font-size: $font-md;
  font-weight: 700;
  color: $accent-gold;
  margin-top: $spacing-xl;
  margin-bottom: $spacing-sm;
  letter-spacing: 2rpx;
}

.legal-text {
  display: block;
  font-size: $font-base;
  color: $text-secondary;
  line-height: 2;
  letter-spacing: 1rpx;
}

.safe-bottom {
  height: env(safe-area-inset-bottom);
  min-height: 40rpx;
}
</style>
