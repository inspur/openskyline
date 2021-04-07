<template>
<div>
  <icos-page-header :title="$t('heat.heatTemplate')" :show-back="true" @back="handlePageHeaderBack" :show-bottom-border="false" />
  <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="onTabClick" type="border-card">
    <el-tab-pane :label="$t('heat.topology')" name="templateTopo"></el-tab-pane>
    <el-tab-pane :label="$t('heat.template')" name="templateInfo"></el-tab-pane>
    <router-view></router-view>
  </el-tabs>
</div>
</template>
<script>
  export default {
    name: 'TemplateDetailIndex',
    components: {},
    data () {
      return {
        activeName: this.$route.matched[3].name,
        templateId:this.$route.params.id,
        projectId:this.$route.params.projectId
      };
    },
    watch: {
      // 切换页面
      '$route' (to, from) {
        this.activeName = this.$route.matched[3].name;
      }
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
        case 'templateTopo':
          this.$router.push({
            path: '/service-orchestration/orchestrationTemplate/templateDetailIndex/' + this.projectId + '/' + this.templateId + '/templateTopo'
          });
          break;
        case 'templateInfo':
          this.$router.push({
            path: '/service-orchestration/orchestrationTemplate/templateDetailIndex/' + this.projectId + '/' + this.templateId + '/templateInfo'
          });
          break;
        default:
          this.$router.push({
            path: '/service-orchestration/orchestrationTemplate/templateDetailIndex/' + this.projectId + '/' + this.templateId + '/templateTopo'
          })
        }
      },
      handlePageHeaderBack () {
        this.$router.push({
        path:"/service-orchestration/orchestrationTemplate"
      });
    }
    }
  }
</script>
