<template>
  <div>
    <icos-page-header :title="$t('base.workOrder')" />
    <el-tabs :value="activeName" class="tabs-nopadding" @tab-click="onTabClick" type="border-card">
      <el-tab-pane v-if= 'proUserShow' :label="$t('opt.submitFault')" name="submitting">
        <router-view v-if="activeName=='submitting'"></router-view>
      </el-tab-pane>
      <el-tab-pane v-if= 'superAdminShow' :label="$t('opt.pending')" name="handling">
        <router-view v-if="activeName=='handling'"></router-view>
      </el-tab-pane>
      <el-tab-pane v-if= 'superAdminShow' :label="$t('opt.handled')" name="history">
        <router-view v-if="activeName=='history'"></router-view>
      </el-tab-pane>
      <el-tab-pane v-if= 'superAdminShow' :label="$t('opt.faultType')" name="type">
        <router-view v-if="activeName=='type'"></router-view>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
export default {
  name: 'TabsFault',
  components: {},
  data () {
    return {
      adminShow: Vue.roleType == "0",
      superAdminShow: Vue.roleType == "0" || Vue.roleType == "2",
      proAdminShow: Vue.roleType == "2",
      proUserShow: Vue.roleType == "3" || Vue.roleType == "2",
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
      case 'submitting':
        this.$router.push({
          path: '/operations/fault/submitting'
        });
        break;
      case 'handling':
        this.$router.push({
          path: '/operations/fault/handling'
        });
        break;
      case 'history':
        this.$router.push({
          path: '/operations/fault/history'
        });
        break;
      case 'type':
        this.$router.push({
          path: '/operations/fault/type'
        });
        break;
      default:
        this.$router.push({
          path: '/operations/fault/handling'
        })
      }
    }
  }
}
</script>
