<template>
  <div :style="{'border-bottom': showBottomBorder ? '1px solid #ddd' : ''}" style="height: 50px; padding: 0 16px; background-color: #ffffff; display: flex; align-items: center; justify-content: space-between;">
    <div style="margin-right: 16px;" v-if="showBack">
      <el-button @click="handleBack" type="text" icon="fa-chevron-left" />
    </div>
    <div style="flex: 1; font-size: 16px; font-weight: 700">{{ title }}</div>
    <div style="background-color: blue;">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ICOSPageHeader',
  props: {
    title: {
      type: String,
      default: ''
    },
    showBack: {
      type: Boolean,
      default: false
    },
    showBottomBorder: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    handleBack() {
      this.$emit('back');
    }
  }
}
</script>

<style>
</style>