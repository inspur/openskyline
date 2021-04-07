<template>
  <div class="instance-list">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'InstanceList',
  props: {
  }
}
</script>

<style scoped>
.instance-list {
  flex: 1;
  padding: 10px;
  margin-right: 1px;
  border: 1px solid #ccc;
}
</style>