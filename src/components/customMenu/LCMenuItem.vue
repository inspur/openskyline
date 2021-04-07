<template>
  <li class="el-dropdown-menu__item"
    :class="{ 'is-disabled': disabled }"
    @click="handleClick"
  ><slot></slot></li>
</template>

<script>
import Emitter from "./emitter";
export default {
    name: 'LCMenuItem',
    props: {
        absoluteIndex: {},
        disabled: {
          type: Boolean,
          default: true
        }
    },
    mixins: [Emitter],
    methods: {
      handleClick(e) {
        this.dispatch('LCMenu', 'lc-menu-item-click', [this.absoluteIndex, this]);
      }
    }
}
</script>

<style scoped>
    
</style>
