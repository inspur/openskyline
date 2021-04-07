// 2020年08月 4日 18:23:09 潘提保---中国济南

<template>
  <div>
    <el-tabs v-model="activeName" @tab-click="onTabClick">
      <el-tab-pane name="detail" :label="$t('base.outline')"></el-tab-pane>
      <el-tab-pane
        name="performance"
        v-if="service.pluto"
        :label="$t('base.performanceMonitoring')"
      ></el-tab-pane>
      <el-tab-pane name="log" :label="$t('base.systemLog')"></el-tab-pane>
    </el-tabs>

    <component :data="data" :is="component"></component>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import Detail from "./Detail";
import Performance from "./Performance.vue";
import Log from "./Log.vue";
export default {
  name: "AmphoraDetail",
  props: ["data"],
  components: {},
  data() {
    return {
      component: Detail,
      service: Vue.service,
      activeName: "detail"
    };
  },
  watch: {},
  computed: {},
  mounted() {},
  methods: {
    onTabClick(tab) {
      switch (tab.name) {
        case "detail":
          this.component = Detail;
          break;
        case "performance":
          this.component = Performance;
          break;
        case "log":
          this.component = Log;
          break;
        default:
      }
    }
  }
};
</script>