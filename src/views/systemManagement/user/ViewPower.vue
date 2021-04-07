<template>
  <div>
    <el-table
    ref="deTable"
    :data="tableData"
    :element-loading-text="$t('base.loadingData')"
    highlight-current-row
    :max-height="400"
    :default-sort="{prop:'role_type',order:'ascending'}"
    @sort-change="sortChange"
    style="width: 100%"
    row-key="id">
    <el-table-column
      prop="role_type"
      :label="$t('base.roleType')"
      sortable="custom"
      align="left"
      min-width="100">
      <template slot-scope="scope">
        <span :style="scope.row.role_in_use==0?{textDecoration: 'line-through'}:{}">{{scope.row.role_type}}</span>
      </template>
    </el-table-column>
    <el-table-column
      prop="project_name"
      :label="$t('base.project')"
      sortable="custom"
      min-width="100">
      <template slot-scope="scope">
        <span :style="scope.row.role_in_use==0?{textDecoration: 'line-through'}:{}">{{scope.row.typeBak==0?"-":scope.row.project_name}}</span>
      </template>
    </el-table-column>
    <el-table-column
      prop="role_name"
      :label="$t('base.empowerRole')"
      min-width="100">
      <template slot-scope="scope">
        <span :style="scope.row.role_in_use==0?{textDecoration: 'line-through'}:{}">{{scope.row.role_name}}</span>
      </template>
    </el-table-column>
    <el-table-column
      prop="group_name"
      :label="$t('base.empowerGroupName')"
      min-width="100">
      <template slot-scope="scope">
        <span :style="scope.row.role_in_use==0?{textDecoration: 'line-through'}:{}">{{scope.row.group_name}}</span>
      </template>
    </el-table-column>
    <el-table-column
      prop="role_name"
      :label="$t('base.sourceOfAuthority')"
      min-width="100">
      <template slot-scope="scope">
        <span :style="scope.row.role_in_use==0?{textDecoration: 'line-through'}:{}">{{scope.row.is_group_role==0?$t('base.personnelEmpower'):$t('base.groupEmpower')}}</span>
      </template>
    </el-table-column>
  </el-table>
  <div style="text-align: left;margin-top:10px;">
    <h4 style="font-weight: 600;">{{$t('base.authorityDescription')}}:</h4>
    <div style="font-size:12px;">
        <div style="line-height: 26px;">
          {{$t('base.authorityDescription1')}}
        </div>
        <div style="line-height: 26px;">
          {{$t('base.authorityDescription2')}}
        </div>
        <div style="line-height: 26px;">
          {{$t('base.authorityDescription3')}}
        </div>
        <div style="line-height: 26px;">
          {{$t('base.authorityDescription4')}}
        </div>
        <div style="line-height: 26px;">
          {{$t('base.authorityDescription5')}}
        </div>
      </div>
  </div>
  </div>
</template>
<script>
export default {
  name:"viewPower",
  props:["id"],
  data() {
    return {
      tableData:[],
      loading:false,
      order:"",
      field:""
    }
  },
  mounted() {
  },
  methods:{
    async getData() {
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/assignments/users/"+this.id+"/roles"
      })
      ret.assignments.forEach((item, index) => {
        item.typeBak = item.role_type.toString();
        if (item.role_type==0) {
          item.role_type = Vue.t('base.superAdmin');
        } else if (item.role_type==2) {
          item.role_type = Vue.t('base.projectAdmin');
        } else if (item.role_type==3) {
          item.role_type = Vue.t('base.projectUser');
        }
      })
      this.$convertRoleLanguage(ret.assignments, "role_name");
      this.tableData = this.orderData(ret.assignments);
    },
    orderData(data) {
      return data.sort(this.$sortFormatter(this.field, this.order));
    },
    sortChange(obj) {
      if (!obj.prop) { return; }
      this.order = obj.order;
      this.field = obj.prop;
      this.getData();
    }
  }
}
</script>