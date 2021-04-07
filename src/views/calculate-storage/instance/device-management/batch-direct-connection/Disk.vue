<template>
  <div class="disk">{{ name }}({{ addr }})</div>
</template>

<script>
export default {
  name: 'Disk',
  props: {
    name: {
      type: String,
      default: ''
    },
    addr: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.disk {
  margin-right: 5px;
  margin-top: 2px;
  background-color: #f0f0f0;;
  border: 1px solid #979797;
  display: inline-block;
  padding: 5px;
}
</style>