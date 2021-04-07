<template>
  <div>
   <el-tabs v-model="activeName" class="tabs-nopadding" @tab-click="onTabClick">
        <el-tab-pane name="superAdmin" :label="$t('base.superadministratorEnd')">
          <super-admin v-if="activeName=='superAdmin'" name="systemSetting"></super-admin>
        </el-tab-pane>
        <el-tab-pane name="projectAdmin" :label="$t('base.projectAdminEnd')">
          <project-admin v-if="activeName=='projectAdmin'" name="recordSetting"></project-admin>
        </el-tab-pane>
        <el-tab-pane name="projectUser" :label="$t('base.projectUserEnd')">
          <project-user v-if="activeName=='projectUser'" name="passwordStrategy"></project-user>
        </el-tab-pane>
    </el-tabs>
    
  </div>
</template>
<script>
import SuperAdmin from './SuperAdmin'
import ProjectAdmin from './ProjectAdmin'
import ProjectUser from './ProjectUser'
export default {
  name: "",
  data () {
    return {
      activeName: "superAdmin"
    }
  },
  mounted () {
  },
  methods: {
    onTabClick (tab) {
      switch (tab.name) {
        case 'superAdmin':
          this.activeName = "superAdmin";
          break
        case 'projectAdmin':
          this.activeName = "projectAdmin";
          break
        case 'projectUser':
          this.activeName = "projectUser";
          break
        default:
          this.activeName = "superAdmin";
      }
    }
  },
  components: {
    SuperAdmin,
    ProjectAdmin,
    ProjectUser
  }
}
</script>
