<template>
  <div>
    <icos-page-header :title="$t('opt.orderApprove')" :show-bottom-border="false" v-if="activeName!='flowDetail'"/>
    <div class="divider clearfix"></div>
    <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="onTabClick" type="border-card" v-if="activeName!='flowDetail'">
      <el-tab-pane v-if= 'adminUser' :label="$t('opt.pending')" name="pending">
        <router-view v-if="activeName=='pending'"></router-view>
      </el-tab-pane>
      <el-tab-pane v-if= 'projectUser' :label="$t('opt.myApply')" name="userFlow">
        <router-view v-if="activeName=='userFlow'"></router-view>
      </el-tab-pane>
      <el-tab-pane v-if= 'adminUser' :label="$t('opt.approvalHistory')" name="flowHistory">
        <router-view v-if="activeName=='flowHistory'"></router-view>
      </el-tab-pane>
      <!-- <el-tab-pane v-if= 'adminUser' :label="$t('opt.approvalHistory')" name="flowDetail">
        <router-view v-if="activeName=='flowDetail'"></router-view>
      </el-tab-pane> -->
    </el-tabs>
    <router-view v-if="activeName=='flowDetail'"></router-view>
  </div>
</template>
<script>
export default {
  name: 'TabsDemo',
  components: {},
  data () {
    return {
      projectUser: Vue.roleType == "2",
      adminUser : Vue.roleType == "0" || Vue.roleType == "2",
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
      case 'pending':
        this.$router.push({
          path: '/operations/flow/pending'
        });
        break;
      case 'flowHistory':
        this.$router.push({
          path: '/operations/flow/flowHistory'
        });
        break;
      case 'userFlow':
        this.$router.push({
          path: '/operations/flow/userFlow'
        });
        break;
      default:
        this.$router.push({
          path: '/operations/flow/pending'
        })
      }
    }
  }
}
</script>
