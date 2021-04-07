<template>
  <div class="instance-item" :class="{ 'drop-zone': showDropZone }">
    <div class="instance-name">
      <span>{{ name }}</span>
    </div>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'InstanceItem',
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
.instance-item {
  margin-bottom: 2px;
  margin-right: 2px;
  padding: 10px;
  border: 1px solid #ccc;
}

.drop-zone {
  background-color: rgb(153, 255, 153);
}
</style>