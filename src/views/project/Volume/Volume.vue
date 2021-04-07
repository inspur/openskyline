<template>
 <div>
  <el-tabs :value="activeName" class="tabs-nopadding" @tab-click="onTabClick">
      <el-tab-pane name="volumelist" label="卷"></el-tab-pane>
      <el-tab-pane name="volumesolt" label="卷快照"></el-tab-pane>
      <el-tab-pane name="volumebak" label="卷备份"></el-tab-pane>
  </el-tabs>
  <router-view></router-view>
 </div>
</template>
<script>
export default {
  name: "Volume",
  data () {
    return {
      activeName: this.$route.matched[2].name
    };
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
        case 'volumeList':
          this.$router.push({
            path: '/project/volume/volumelist'
          });
          break
        case 'volumesolt':
          this.$router.push({
            path: '/project/volume/volumesolt'
          });
          break
        case 'volumebak':
          this.$router.push({
            path: '/project/volume/volumebak'
          });
          break
        default:
          this.$router.push({
              path: '/project/volume/volumelist'
          });
      }
    }
  }
}
</script>
