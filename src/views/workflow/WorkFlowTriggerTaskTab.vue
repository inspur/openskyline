<template>
<div>
  <icos-page-header :title="$t('task.cloudTask')" :show-back="true" @back="goBack()" :show-bottom-border="false" />
  <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="onTabClick" type="border-card">
    <el-tab-pane :label="$t('task.task')" name="workflowtriggertasks"></el-tab-pane>
    <el-tab-pane :label="$t('task.taskLog')" name="workflowtasklog"></el-tab-pane>
    <router-view :taksName="currentName"></router-view>
  </el-tabs>
</div>
</template>
<script>
  export default {
    name: 'WorkFlowTriggerTasks',
    components: {},
    props:['taksName'],
    data () {
      return {
        activeName: this.$route.matched[3].name,
        id:this.$route.params.taskid,
        currentName:this.taksName
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
        case 'workflowtriggertasks':
          this.$router.push({
            path: '/workflow/workflowtriggertaskguide/workflowtriggertasktab/'+ this.id
          });
          break;
        case 'workflowtasklog':
          this.$router.push({
            path: '/workflow/workflowtriggertaskguide/workflowtriggertasktab/'+ this.id + '/workflowtasklog'
          });
          break;
        default:
          this.$router.push({
            path: '/workflow/workflowtriggertaskguide/workflowtriggertasktab/'+ this.id
          })
        }
      },
      goBack() {
        this.$router.push({
          path:"/workflow/workflowtriggertaskguide"
        });
      }
    }
  }
</script>
