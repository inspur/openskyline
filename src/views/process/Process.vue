<template>
<div>
      <router-view></router-view>
</div>
</template>
<script>
  export default {
    name: 'Process',
    components: {},
    data () {
      return {
      };
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
    watch: {
      // 切换页面
      '$route' (to, from) {
          // 如果是当前页面切换分类的情况
      }
    },
    methods: {

    }
  }
</script>
<style scoped>

</style>
