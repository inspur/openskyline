<template>
  <div>
      <router-view></router-view>
  </div>
</template>
<script>
  export default {
    name: 'ContainerClusterIndex',
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
    methods: {
    }
  }
</script>
<style scoped>

</style>
