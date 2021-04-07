<template>
  <div>
    <icos-page-header :title="$t('opt.consumptionProfile')" />
    <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="onTabClick" type="border-card">
      <el-tab-pane name="consumeOverview" :label="$t('opt.consumeOverview')">
        <router-view v-if="activeName=='consumeOverview'"></router-view>
      </el-tab-pane>
      <el-tab-pane name="consumeRecord" :label="$t('opt.consumeRecord')">
        <router-view v-if="activeName=='consumeRecord'"></router-view>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
export default {
  name: "Consumption",
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
  mounted() {
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
      case 'consumeOverview':
        this.$router.push({
          path: '/operations/consumption/consumeOverview'
        });
        break;
      case 'consumeRecord':
        this.$router.push({
          path: '/operations/consumption/consumeRecord'
        });
        break;
      default:
        this.$router.push({
          path: '/operations/consumption/consumeOverview'
        })
      }
    }
  }
}
</script>