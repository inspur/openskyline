<template>
  <div class="disk-zone">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'DiskZone',
  props: {
  }
}
</script>

<style scoped>
.disk-zone {
  flex: 1;
  margin-left: 1px;
}
</style>