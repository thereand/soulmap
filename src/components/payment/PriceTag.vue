<!--
  灵魂星图 - 价格标签组件
  显示：~~原价~~ 现价
-->
<template>
  <view class="price-tag" :class="{ 'price-tag--inline': inline }">
    <text class="price-tag__original" v-if="originalPrice && originalPrice > price">
      ¥{{ originalPrice }}
    </text>
    <view class="price-tag__current">
      <text class="price-tag__symbol">¥</text>
      <text class="price-tag__value">{{ price }}</text>
      <text class="price-tag__unit" v-if="unit">{{ unit }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  /** 现价 */
  price: number
  /** 原价（可选，有值时显示删除线） */
  originalPrice?: number
  /** 单位文本（如 "/份"） */
  unit?: string
  /** 行内模式 */
  inline?: boolean
}

withDefaults(defineProps<Props>(), {
  originalPrice: 0,
  unit: '',
  inline: false,
})
</script>

<style lang="scss" scoped>
.price-tag {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;

  &--inline {
    flex-direction: row;
    gap: $spacing-sm;
  }

  &__original {
    font-size: $font-sm;
    color: $text-muted;
    text-decoration: line-through;
  }

  &__current {
    display: flex;
    align-items: baseline;
  }

  &__symbol {
    font-size: $font-lg;
    font-weight: 700;
    color: $accent-gold;
  }

  &__value {
    font-size: $font-title;
    font-weight: 800;
    color: $accent-gold;
    letter-spacing: -2rpx;
    line-height: 1;
  }

  &__unit {
    font-size: $font-sm;
    color: $text-secondary;
    margin-left: 4rpx;
  }
}
</style>
