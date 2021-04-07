<template>
  <div>
    <div class="expanded-button-area">
      <el-button v-if="!expanded" type="text" icon="fa-angle-double-down" @click="expanded = true;"></el-button>
      <el-button v-else type="text" icon="fa-angle-double-up" @click="expanded = false;"></el-button>
    </div>
    <div :class="{ 'collapsed': !expanded, 'expanded': expanded }">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExpandableCell',
  data() {
    return {
      expanded: false
    };
  }
}
</script>

<style scoped>
.expanded-button-area {
  text-align: center;
  width: 20px;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}
.expanded-button-area > button {
  width: 20px;
  height: 100%;
}
.collapsed {
  position: absolute;
  top: 5px;
  right: 26px;
  bottom: 5px;
  left: 6px;
  overflow: hidden;
}
.expanded {
  margin-right: 14px;
  max-height: 200px;
  overflow-y: auto;
}
</style>
