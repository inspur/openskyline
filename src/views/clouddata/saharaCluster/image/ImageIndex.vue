<template>
  <div>
      <router-view></router-view>
  </div>
</template>
<script>
  export default {
    name: 'clouddata',
    components: {},
    data () {
      return {
      };
    },
    computed: {
    },
    watch: {
      '$route' (to, from) {
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
    }
  }
</script>
<style scoped>

</style>
