<template>
<div class="el-tabs--border-card" style="padding:10px">
  <icos-page-header :title="$t('calcStorLang.objectStorage')" :show-back="true" @back="handlePageHeaderBack" :show-bottom-border="false" />
  <div class="col-24">
    <div class="bucket_label">
     <i class="el-icon-fa-delicious"></i>
    </div>
    <div>
      <el-tooltip placement="top" trigger="hover" :content="bucketName">
        <div class="bucket_name">{{bucketName}}</div>
      </el-tooltip>
    </div>
  </div>
  <div style="clear: both"></div>
  <el-tabs v-model="activeName" @tab-click="onTabClick">
    <el-tab-pane :label="$t('calcStorLang.objList')" name="objectCatalog" style="padding: 0 10px;">
      <router-view v-if="activeName=='objectCatalog'"></router-view>
    </el-tab-pane>
    <el-tab-pane :label="$t('storage.bucketsSet')" name="bucketSetting" style="padding: 0 10px;">
      <router-view v-if="activeName=='bucketSetting'"></router-view>
    </el-tab-pane>
  </el-tabs>
</div>
</template>
<script>
export default {
  name: 'Bucket',
  data () {
    return {
      activeName: this.$route.matched[3].name,
      bucketName: this.$route.params.bucketName,
      roleType: Vue.roleType + '',
      isUser: Vue.roleType === "3"
    };
  },
  watch: {
    // 切换页面
    '$route' (to, from) {
      this.activeName = this.$route.matched[3].name;
    }
  },
  mounted() {
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
      case 'objectCatalog':
        this.$router.push({
          path: '/calculate-storage/object-storage-s3/bucket/'+this.$route.params.bucketName+'/objectCatalog'
        });
        break;
      case 'bucketSetting':
        this.$router.push({
          path: '/calculate-storage/object-storage-s3/bucket/'+this.$route.params.bucketName+'/bucketSetting'
        });
        break;
      default:
        this.$router.push({
          path: '/calculate-storage/object-storage-s3/bucket/'+this.$route.params.bucketName+'/objectCatalog'
        })
      }
    },
    handlePageHeaderBack () {
        this.$router.push({
        path:"/calculate-storage/object-storage-s3/bucketList"
      });
    }
  }
}
</script>
<style scoped>
.bucket_label {
  float: left;
  font-size: 16px;
  color: #0087ed;
}
.bucket_name {
  float: left;
  margin: 3px;
  font-size: 14px;
  color: #666;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 40%;
}
.bucket_button {
  position: relative;
  top: 3px
}
</style>

