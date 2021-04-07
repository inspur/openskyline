<template>
<div>
  <icos-page-header :title="$t('task.taskLog')" :show-back="true" @back="goBack()" :show-bottom-border="false" />
  <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="onTabClick" type="border-card">
    <el-tab-pane :label="$t('task.detail')" name="workflowexedetail"></el-tab-pane>
    <el-tab-pane :label="$t('task.subtaskLog')" name="workflowchildexedetail"></el-tab-pane>
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
        id:this.$route.params.id,
        taskId:this.$route.params.taskid
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
        case 'workflowexedetail':
          this.$router.push({
            path: '/workflow/workflowtriggertaskguide/workflowtasklogdetail/' + this.taskId + '/' +this.id+'/workflowexedetail'
          });
          break;
        case 'workflowchildexedetail':
          this.$router.push({
            path: '/workflow/workflowtriggertaskguide/workflowtasklogdetail/' + this.taskId + '/' +this.id+'/workflowchildexedetail'
          });
          break;
        default:
          this.$router.push({
            path: '/workflow/workflowtriggertaskguide/workflowtasklogdetail/' + this.taskId + '/' +this.id+'/workflowexedetail'
          })
        }
      },
      goBack() {
        this.$router.push({
          path:"/workflow/workflowtriggertaskguide/workflowtriggertasktab/"+this.taskId
        });
      }
    }
  }
</script>
