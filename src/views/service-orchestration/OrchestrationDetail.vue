<template>
<div>
  <icos-page-header :title="$t('container.heatStack')" :show-back="true" @back="handlePageHeaderBack" :show-bottom-border="false" />
  <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="onTabClick" type="border-card">
    <el-tab-pane :label="$t('heat.topology')" name="orchestrationTopo"></el-tab-pane>
    <el-tab-pane :label="$t('heat.summary')" name="orchestrationInfo"></el-tab-pane>
    <el-tab-pane :label="$t('heat.resources')" name="orchestrationRes"></el-tab-pane>
    <el-tab-pane :label="$t('heat.event')" name="orchestrationEvent"></el-tab-pane>
    <el-tab-pane :label="$t('heat.template')" name="orchestratedTemplate"></el-tab-pane>
    <router-view></router-view>
  </el-tabs>
</div>
</template>
<script>
  export default {
    name: 'OrchestrationDetail',
    components: {},
    data () {
      return {
        activeName: this.$route.matched[3].name,
        stackName:this.$route.params.stackName,
        stackId:this.$route.params.stackId
      };
    },
    watch: {
      // 切换页面
      '$route' (to, from) {
        this.activeName = this.$route.matched[3].name;
      }
    },
    computed: {
    },
    mounted () {
    },
    beforeRouteLeave (to, from, next) {
      next()
    },
    beforeRouteEnter (to, from, next) {
      next()
    },
    methods: {
      onTabClick (tab) {
        switch (tab.name) {
        case 'orchestrationTopo':
          this.$router.push({
            path: '/service-orchestration/orchestrationDetail/'+this.stackName+'/'+this.stackId+'/orchestrationTopo'
          });
          break;
        case 'orchestrationInfo':
          this.$router.push({
            path: '/service-orchestration/orchestrationDetail/'+this.stackName+'/'+this.stackId+'/orchestrationInfo'
          });
          break;
        case 'orchestrationRes':
          this.$router.push({
            path: '/service-orchestration/orchestrationDetail/'+this.stackName+'/'+this.stackId+'/orchestrationRes'
          });
          break;
        case 'orchestrationEvent':
          this.$router.push({
            path: '/service-orchestration/orchestrationDetail/'+this.stackName+'/'+this.stackId+'/orchestrationEvent'
          });
          break;
        case 'orchestratedTemplate':
          this.$router.push({
            path: '/service-orchestration/orchestrationDetail/'+this.stackName+'/'+this.stackId+'/orchestratedTemplate'
          });
          break;
        default:
          this.$router.push({
            path: '/service-orchestration/orchestrationDetail/'+this.stackName+'/'+this.stackId+'/orchestrationTopo'
          })
        }
      },
      handlePageHeaderBack () {
        this.$router.push({
        path:"/service-orchestration/orchestrationList"
      });
    }
  }
}
</script>
