<template>
  <div>
      <router-view></router-view>
  </div>
</template>
<script>
  export default {
    name: 'Database',
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
