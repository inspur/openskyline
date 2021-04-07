<template>
  <div>
    <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="onTabClick">
        <el-tab-pane name="vm-detail"  label="概要"></el-tab-pane>
        <el-tab-pane name="vm-console"  label="控制台"></el-tab-pane>
        <el-tab-pane name="vm-per"  label="性能监控"></el-tab-pane>
        <el-tab-pane name="vm-task"  label="任务"></el-tab-pane>
        <el-tab-pane name="vm-log" label="操作日志"></el-tab-pane>
    </el-tabs >
    <router-view></router-view>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: 'InstanceDetail',
  props: ['naviName'],
  data() {
    return {
      activeName: this.$route.matched[3].name
    }
  },
  watch: {
    '$route' (to, from) {
      this.activeName = this.$route.matched[3].name;
      this.routers[2].des = this.naviName;
    }
  },
  computed: {
      ...mapGetters({
        routers: 'getRouters'
      })
    },
  mounted() {
    // let a = this.$route.params;
    this.routers[2].des = this.naviName;
  },
  methods: {
      onTabClick (tab) {
      /*if (this.activeName === tab.name) {
        return;
      }*/
      switch (tab.name) {
      case 'vm-detail':
        this.$router.push({
          path: '/project/instances/instance-detail'
        });
        break
      case 'vm-console':
        this.$router.push({
          path: '/project/instances/instance-detail/vm-console'
        });
        break
      case 'net-open':
        this.$router.push({
          path: '/cloud-resource/network/net-open'
        });
        break
      default:
        this.$router.push({
            path: '/project/instances/instance-detail'
        });
      }
    },
    cancel() {
      this.$router.push({
        path: this.$route.query.refer
      })
    }
  }
}
</script>