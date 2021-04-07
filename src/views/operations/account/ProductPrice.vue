<template>
  <div>
    <icos-page-header :title="$t('opt.productPrice')" />
    <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="onTabClick" type="border-card">
      <el-tab-pane name="price-setting" :label="$t('opt.priceSetting')">
        <router-view v-if="activeName=='price-setting'"></router-view>
      </el-tab-pane>
      <el-tab-pane name="start-project" :label="$t('opt.startproject')">
        <router-view v-if="activeName=='start-project'"></router-view>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
export default {
  name: "TabsDemo",
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
      case 'price-setting':
        this.$router.push({
          path: '/operations/product-price/price-setting'
        });
        break;
      case 'start-project':
        this.$router.push({
          path: '/operations/product-price/start-project'
        });
        break;
      default:
        this.$router.push({
          path: '/operations/product-price/price-setting'
        })
      }
    }
  }
}
</script>