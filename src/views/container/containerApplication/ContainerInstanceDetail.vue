<template>
  <div>
  <icos-page-header :title="$t('container.appDetail')" :show-back="true" @back="goBack()" :show-bottom-border="true" />
  <el-card class="box-card">
    <div>
      <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="detailTabChange">
        <el-tab-pane :label="$t('container.basicInfo')" name="appInfo"></el-tab-pane>
        <el-tab-pane label="Pod" name="instanceList"></el-tab-pane>
        <el-tab-pane :label="$t('container.environmentParam')" name="environmentList"></el-tab-pane>
        <el-tab-pane :label="$t('container.service')" name="serviceList"></el-tab-pane>
        <el-tab-pane :label="$t('container.event')" name="eventList"></el-tab-pane>
      </el-tabs>
      <router-view></router-view>
    </div>
  </el-card>
  </div>
</template>
<script>
  export default {
    name: 'ContainerInstanceDetail',
    data () {
      return {
        activeName: this.$route.matched[3].name,
        appName:this.$route.params.appName,
        nameSpace:this.$route.params.nameSpace,
        type:this.$route.params.type,
        rancherClusterId:this.$route.params.rancherClusterId,
        appId:this.$route.params.appId
      };
    },
    watch: {
      // 切换页面
      '$route' (to, from) {
        this.activeName = this.$route.matched[3].name;
      }
    },
    beforeRouteLeave (to, from, next) {
      next()
    },
    beforeRouteEnter (to, from, next) {
      next()
    },
    mounted () {
    },
    methods: {
      detailTabChange (tab) {
        switch (tab.name) {
        case 'appInfo':
          this.$router.push({
            path:"/container/applicationContainer/" + this.rancherClusterId + "/" + this.type + "/" +
              this.nameSpace + "/" + this.appName + "/appDetail/appInfo"
          });
          break;
        case 'instanceList':
          this.$router.push({
            path:"/container/applicationContainer/" + this.rancherClusterId + "/" + this.type + "/" +
              this.nameSpace + "/" + this.appName + "/appDetail/instanceList"
          });
          break;
        case 'environmentList':
          this.$router.push({
            path:"/container/applicationContainer/" + this.rancherClusterId + "/" + this.type + "/" +
              this.nameSpace + "/" + this.appName + "/appDetail/environmentList"
          });
          break;
        case 'serviceList':
          this.$router.push({
            path:"/container/applicationContainer/" + this.rancherClusterId + "/" + this.type + "/" +
              this.nameSpace + "/" + this.appName + "/appDetail/serviceList"
          });
          break;
        case 'eventList':
          this.$router.push({
            path:"/container/applicationContainer/" + this.rancherClusterId + "/" + this.type + "/" +
              this.nameSpace + "/" + this.appName + "/appDetail/eventList"
          });
          break;
        default:
          this.$router.push({
            path:"/container/applicationContainer/" + this.rancherClusterId + "/" + this.type + "/" +
              this.nameSpace + "/" + this.appName + "/appDetail/appInfo"
          });
        }
      },
      goBack() {
        this.$router.push({
          path:"/container/applicationContainer"
        });
      }
    }
  }
</script>
<style scoped>

</style>
