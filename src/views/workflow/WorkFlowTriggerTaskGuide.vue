<template>
  <div>
      <router-view @taskNameRender="taskNameRender" :taksName="taskName">任务</router-view>
  </div>
</template>
<script>
  export default {
    name: 'WorkFlowTriggerTaskGuide',
    components: {},
    data () {
      return {
        taskName:""
      };
    },
    watch: {
      // 切换页面
      '$route' (to, from) {
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
      taskNameRender(value) {
        this.taskName = value;
      }
    }
  }
</script>
<style scoped>

</style>
