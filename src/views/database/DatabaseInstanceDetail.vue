<template>
<div>
  <icos-page-header :title="$t('db.databaseService')" :show-back="true" @back="handlePageHeaderBack" :show-bottom-border="false" />
  <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="onTabClick" type="border-card">
    <el-tab-pane :label="$t('db.database')" name="databaseList"></el-tab-pane>
    <el-tab-pane :label="$t('db.user')" name="userList"></el-tab-pane>
    <router-view></router-view>
  </el-tabs>
</div>
</template>
<script>
  export default {
    name: 'DatabaseInstanceDetail',
    components: {},
    data () {
      return {
        activeName: this.$route.matched[3].name,
        instanceId:this.$route.params.instanceId
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
    methods: {
      onTabClick (tab) {
        switch (tab.name) {
        case 'databaseList':
          this.$router.push({
            path: '/databaseService/databaseInstance/databaseInstanceDetail/' + this.instanceId + '/databaseList'
          });
          break;
        case 'userList':
          this.$router.push({
            path: '/databaseService/databaseInstance/databaseInstanceDetail/' + this.instanceId + '/userList'
          });
          break;
        default:
          this.$router.push({
            path: '/databaseService/databaseInstance/databaseInstanceDetail/' + this.instanceId + '/databaseList'
          })
        }
      },
      handlePageHeaderBack () {
        this.$router.push({
        path:"/databaseService"
      });
    }
    }
  }
</script>
