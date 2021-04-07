<template>
<div>
      <router-view></router-view>
</div>
</template>
<script>
  export default {
    name: 'Net',
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
      '$route'(to, from) {
        if (to.name=="net") {
          this.$router.push({
            path: '/net/network/'
          });
        }
      }
    },
    methods: {
    }
  }
</script>
