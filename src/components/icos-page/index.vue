<template>
  <div :style="{padding: padding}">
    <!-- <slot /> -->
    <div :style="{padding: padding}" style="background-color: #ffffff; border-radius: 2px;">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ICOSPage',
  props: {
    padding: {
      type: String,
      default: '16px'
    }
  }
}
</script>

<style>

</style>