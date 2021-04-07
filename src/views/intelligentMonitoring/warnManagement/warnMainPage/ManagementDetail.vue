<template>
  <div class="management-detail">
    <icos-page-header :title="$t('base.DETAIL_PAGE')" :show-back="true" @back="pageHeaderBackHandle" :show-bottom-border="false" />
    <resource-profile
      class="module-background-color module-padding detail"
      :centerId="centerId"
      :resourceDetailId="resourceDetailId"
    ></resource-profile>
    <warn-notice
      class="module-background-color module-padding detail"
      :centerId="centerId"
      :resourceDetailId="resourceDetailId"
      :resourceDetailName="resourceDetailName"
    ></warn-notice>
    <monitor-item class="module-background-color module-padding detail" :centerId="centerId" :resourceDetailId="resourceDetailId"></monitor-item>
  </div>
</template>
<script>
import ResourceProfile from "./resourceProfile/ResourceProfile";
import WarnNotice from "./warnNotice/WarnNotice";
import MonitorItem from "./monitorItem/MonitorItem";
export default {
  name: "ManagementDetail",
  props: ["centerId"],
  data() {
    return {
      activeName: "resourceView",
      activeNames: ["1", "2", "3"],
      resourceViewFlg: true,
      resourceDetailId: "",
      resourceDetailName: ""
    };
  },
  methods: {
    pageHeaderBackHandle(v) {
      let route = this.$route || {};
      let matched = route.matched || [];
      let p = matched[matched.length - 1].parent || {};
      this.$router.push({ path: p.path });
    }
  },
  created() {
    let { id, name } = this.$route.query;

    this.resourceDetailId = id;
    this.resourceDetailName = name;
  },
  mounted() {},
  components: {
    ResourceProfile,
    WarnNotice,
    MonitorItem
  }
};
</script>

<style scoped>
.management-detail .detail {
  padding: 16px;
  margin-bottom: 10px;
}
.management-detail >>> .title {
  font-size: 16px;
  font-weight: 500;
}


</style>