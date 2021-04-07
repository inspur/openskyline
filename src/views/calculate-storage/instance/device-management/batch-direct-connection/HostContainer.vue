<template>
  <div class="host-wrapper">
    <div class="host-wrapper-name">
      <span>{{ name }}</span>
    </div>
    <div class="host-wrapper-content">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'HostWrapper',
  props: {
    name: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.host-wrapper {
  padding: 10px;
  margin-bottom: 5px;
  border: 1px dashed #ccc;
}

.host-wrapper-name {
}

.host-wrapper-content {
  display: flex;
  justify-content: start;
  align-items: flex-start;
}
</style>