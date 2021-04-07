<template>
  <div class="disk-wrapper" :class="{ 'drop-zone': showDropZone }">
    <div class="disk-wrapper-name">
      <span>{{ name }}</span>
    </div>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'DiskWrapper',
  props: {
    name: {
      type: String,
      default: ''
    },
    showDropZone: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.disk-wrapper {
  flex: 1px;
  padding: 10px;
  border: 1px solid #ccc;
  margin-bottom: 2px;
}

.drop-zone {
  background-color: rgb(153, 255, 153);
}
</style>