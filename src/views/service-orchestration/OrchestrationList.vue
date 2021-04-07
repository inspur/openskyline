<template>
  <div>
      <router-view>已生成编排</router-view>
  </div>
</template>
<script>
  export default {
    name: 'OrchestrationList',
    components: {},
    data () {
      return {
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

    }
  }
</script>
<style scoped>

</style>
