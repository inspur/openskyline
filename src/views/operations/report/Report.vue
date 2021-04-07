<template>
<div>
  <icos-page-header :title="$t('opt.report')" />
  <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="onTabClick" type="border-card">
    <el-tab-pane :label="$t('report.reportManage')" name="reportManage">
      <router-view v-if="activeName=='reportManage'"></router-view>
    </el-tab-pane>
     <el-tab-pane :label="$t('report.periodReportManage')" name="periodReportManage">
      <router-view v-if="activeName=='periodReportManage'"></router-view>
    </el-tab-pane>
    <el-tab-pane :label="$t('report.reportDownload')" name="reportDownload">
      <router-view v-if="activeName=='reportDownload'"></router-view>
    </el-tab-pane>
  </el-tabs>
</div>
</template>
<script>
export default {
  name: 'Report',
  components: {},
  data () {
    return {
      activeName: this.$route.matched[2].name
    };
  },
  watch: {
    // 切换页面
    '$route' (to, from) {
      this.activeName = this.$route.matched[2].name;
    }
  },
  computed: {
  },
  mounted () {
  },
  beforeRouteLeave (to, from, next) {
    // 如果跳转到详情页面，则记录关键数据
    // 方便从详情页面返回到该页面的时候继续加载之前位置的数据
    next()
  },
  beforeRouteEnter (to, from, next) {
    next()
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
      case 'reportManage':
        this.$router.push({
          path: '/operations/report/reportManage'
        });
        break;
      case 'reportDownload':
        this.$router.push({
          path: '/operations/report/reportDownload'
        });
        break;
      case 'periodReportManage':
        this.$router.push({
          path: '/operations/report/periodReportManage'
        });
        break;
      default:
        this.$router.push({
          path: '/operations/report/reportManage'
        })
      }
    }
  }
}
</script>
