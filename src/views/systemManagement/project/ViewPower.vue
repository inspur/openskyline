<template>
  <div>
    <div class="table_panel">
      <table class="table table-content table-hover idatatable" border="1" style="table-layout: fixed;">
        <tbody>
          <tr class="odd">
            <th class="idatath" style="width: 150px;">{{$t('base.projectAdmin')}}：</th>
            <td class="idatatd">{{projectAdmins}}</td>
          </tr>
          <tr class="even">
            <th class="idatath">{{$t('base.projectUser')}}：</th>
            <td class="idatatd">{{projectUsers}}</td>
          </tr>
        </tbody>
      </table>
      </div>
  </div>
</template>
<script>
export default {
  name:"viewPower",
  props:["id"],
  data() {
    return {
      projectAdmins:'',
      projectUsers: ""
    }
  },
  mounted() {
  },
  methods:{
    async getData() {
      this.projectAdmins = "";
      this.projectUsers = "";
      let uret = await this.$ajax({
        type: 'get',
        url:"api/keystone/v3/inspur/assignments/projects/"+this.id+"/rights"
      });
      uret.project_rights.forEach((item, index) => {
        if (item.role_type==2) { //项目管理员
          this.projectAdmins += item.user_name;
          this.projectAdmins += ",";
        } else if (item.role_type==3) {
          this.projectUsers += item.user_name;
          this.projectUsers += ",";
        }
      })
      this.projectAdmins = this.projectAdmins.substring(0, this.projectAdmins.length-1);
      this.projectUsers = this.projectUsers.substring(0, this.projectUsers.length-1);
    }
  }
}
</script>