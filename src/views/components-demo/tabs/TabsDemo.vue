<template>
<div>
  <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="onTabClick">
    <el-tab-pane label="所有" name="all"></el-tab-pane>
    <el-tab-pane label="虚拟化平台" name="virtual"></el-tab-pane>
    <el-tab-pane label="OpenStack平台" name="open-stack"></el-tab-pane>
  </el-tabs>
  <router-view></router-view>
</div>
</template>
<script>
export default {
  name: 'TabsDemo',
  components: {},
  data () {
    return {
      activeName: this.$route.matched[2].name
    };
  },
  watch: {
    // 切换页面
    '$route' (to, from) {
      this.activeName = this.$route.matched[2].name;
    }
  },
  computed: {
  },
  mounted () {
  },
  beforeRouteLeave (to, from, next) {
    // 如果跳转到详情页面，则记录关键数据
    // 方便从详情页面返回到该页面的时候继续加载之前位置的数据
    next()
  },
  beforeRouteEnter (to, from, next) {
    next()
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
      case 'all':
        this.$router.push({
          path: '/components-demo/tabs/all'
        });
        break;
      case 'virtual':
        this.$router.push({
          path: '/components-demo/tabs/virtual'
        });
        break;
      case 'open-stack':
        this.$router.push({
          path: '/components-demo/tabs/open-stack'
        });
        break;
      default:
        this.$router.push({
          path: '/components-demo/tabs/all'
        })
      }
    }
  }
}
</script>
