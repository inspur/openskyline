<template>
  <div>
    <el-tabs v-model="activeName" class="tabs-nopadding">
      <el-tab-pane v-for="i in tabs" :key="i.name" :name="i.name" :label="i.label"></el-tab-pane>
    </el-tabs>
    <vm-detail
      v-if="activeName===tabs[0].name"
      :InstanceId="InstanceId"
      :projectMaps="projectMaps"
      :userMaps="userMaps"
      :flavorMaps="flavorMaps"
      :networkMaps="networkMaps"
    ></vm-detail>
    <cpm-performance v-if="activeName===tabs[1].name" :instanceID="InstanceId"></cpm-performance>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import VmDetail from "./VmDetail";
import CpmPerformance from "./performance/index";
export default {
  name: "InstanceDetail",
  props: ["InstanceId", "projectMaps", "userMaps", "flavorMaps", "networkMaps"],
  components: {
    VmDetail,
    CpmPerformance
  },
  data() {
    let tabs = [
      { name: "detail", label: Vue.t("base.outline") },
      { name: "performance", label: Vue.t("base.performanceMonitoring") }
    ];
    return {
      activeName: tabs[0]["name"],
      tabs: tabs
    };
  },
  watch: {},
  computed: {},
  mounted() {},
  methods: {}
};
</script>