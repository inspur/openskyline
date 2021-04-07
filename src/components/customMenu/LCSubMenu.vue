<template>
  <span>
    <el-popover
      ref="menu"
      :trigger="trigger"
      :visible-arrow="false"
      :placement="placement"
      popper-class="lc-menu-popover"
      :offset="-10"
    >
      <ul>
        <slot></slot>
      </ul>
      <li slot="reference" class="el-dropdown-menu__item">
        <el-row type="flex" justify="space-between">
          <el-col><slot name="title"></slot></el-col>
          <el-col style="text-align: right;"><i class="el-icon-caret-right" style="font-size: 10px; -webkit-transform: scale(0.8);"></i></el-col>
        </el-row>
      </li>
    </el-popover>
  </span>
</template>

<script>
import Emitter from "./emitter";
export default {
  name: "LCSubMenu",
  props: {
    options: Array,
    placement: {
      type: String,
      default: "right-start"
    },
    trigger: {
      type: String,
      default: "hover"
    }
  },
  mixins: [Emitter],
  data() {
    return {};
  }
};
</script>

<style scoped>
</style>