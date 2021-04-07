<template>
  <div>
      <router-view>容器服务</router-view>
  </div>
</template>
<script>
  export default {
    name: 'ContainerIndex',
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
