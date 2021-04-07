<template>
  <div>
    <icos-page-header :title="$t('opt.order')" />
    <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="onTabClick" type="border-card">
      <el-tab-pane v-if= 'User' :label="$t('opt.applying')" name="userFlow">
        <router-view v-if="activeName=='userFlow'"></router-view>
      </el-tab-pane>
      <el-tab-pane v-if= 'User' :label="$t('opt.approved')" name="flowHistory">
        <router-view v-if="activeName=='flowHistory'"></router-view>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
export default {
  name: 'TabsDemo',
  components: {},
  data () {
    return {
      User: Vue.roleType == "3",
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
      case 'userFlow':
        this.$router.push({
          path: '/operations/flowUser/userFlow'
        });
        break;
      case 'flowHistory':
        this.$router.push({
          path: '/operations/flowUser/flowHistory'
        });
        break;
      default:
        this.$router.push({
          path: '/operations/flowUser/userFlow'
        })
      }
    }
  }
}
</script>
