<template>
  <div>
  <el-dialog :title="$t('base.addGroupUser')" :visible.sync="visible">
    <el-form :inline="true" :model="formInline" class="form-inline">
      <el-form-item :label="$t('base.accountNumber')">
        <el-input v-model="formInline.name" @blur="blurFun('name')" style="width:120px;"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.department')">
        <el-input v-model="formInline.department" @focus="getDept" style="width:120px;" :readonly="true"></el-input>
      </el-form-item>
      <el-form-item :label="$t('base.email')">
        <el-input v-model="formInline.email" @blur="blurFun('email')" style="width:120px;"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon='fa-search' @click="getTableData" size="small">{{$t('base.query')}}</el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="deTable"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('base.loadingData')"
      highlight-current-row
      style="width: 100%;margin-top:15px;"
      max-height="380"
      row-key="id"
      :default-sort="{prop:'name',order:'ascending'}"
      @sort-change="sortChange"
      @row-click="rowClick"
      @selection-change="handleSelectionChange">
      <el-table-column
        reserve-selection
        type="selection"
        align="center"
        width="55">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0"
        prop="name"
        :label="$t('base.accountNumber')"
        align="left"
        sortable="custom"
        min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('department_name') >= 0"
        prop="department_name"
        align="left"
        :label="$t('base.department')"
        min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('email') >= 0"
        prop="email"
        align="left"
        :label="$t('base.email')"
        min-width="100">
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="getTableData(false)">
          </el-button>
            <span>{{$t('lang.currentSelected')}} {{multipleSelection.length}}{{$tc('lang.item', multipleSelection.length)}}</span>
            <el-popover
              placement="right"
              trigger="click">
              <el-checkbox-group class="vertical"
                v-model="columnsChecked">
                <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                </el-checkbox>
              </el-checkbox-group>
              <div slot="reference" style="display: inline-block;">
                <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
              </div>
            </el-popover>
        </el-col>
        <el-col :span="19">
          <el-pagination
            class="right"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
          </el-pagination>
        </el-col>
      </el-row>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible=false">{{$t('base.cancel')}}</el-button>
      <el-button type="primary" @click="confirmFun" :loading="saving">{{$t('base.confirm')}}</el-button>
    </div>
 </el-dialog>
 <!-- 选择部门 -->
  <el-dialog :title="$t('base.selectDepartment')" :visible.sync="departVisible">
    <ztree
      ref="deZtree"
      :data="treeData"
      :setting="setting"
      style="position: relative; min-height: 300px;max-height: 400px;"
      :element-loading-text="$t('base.loadingData')">
    </ztree>
    <div slot="footer" class="dialog-footer">
      <el-button @click="departVisible=false">{{$t('base.cancel')}}</el-button>
      <el-button type="primary" @click="confirmDepart">{{$t('base.confirm')}}</el-button>
    </div>
 </el-dialog>
 </div>
</template>
<script>
export default {
  name:"AddOrgUser",
  props:["groupid", "name"],
  data() {
    return {
      visible:false,
      departVisible:false,
      tableData:[],
      saving: false,
      loading:false,
      emptyText: Vue.t('base.noData'),
      formInline:{
        name:"",
        department:"",
        email:""
      },
      multipleSelection: [],
      currentPage:1,
      pageSize: 10,
      total: 0,
      columns: [{
        prop: "name",
        label: Vue.t('base.accountNumber')
      }, {
        prop: "department_name",
        label: this.$t('base.department')
      }, {
        prop: "email",
        label: this.$t('base.email')
      }],
      columnsChecked:["name", "department_name", "email"],
      setting: {
        check : {
          enable : false
        },
        data : {
          simpleData : {
            enable : true
          },
          key:{
            name:"name"
          }
        }
      },
      treeData:[]
    }
  },
  mounted() {},
  methods:{
    async getTableData(flg=true) {
      this.loading = true;
      let param = {dir:this.order, field:this.field, limit:this.pageSize, page:this.currentPage, domain_id:"default"};
      if (this.formInline.name!="") {
        param["name"] = this.formInline.name;
      }
      if (this.formInline.email!="") {
        param["email"] = this.formInline.email;
      }
      if (this.formInline.department!="") {
        param["department"] = this.formInline.departmentId;
      }
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/users?"+ $.param(param)
      })
      this.tableData = ret.users;
      this.total = ret.total;
      if (flg) {
        this.$nextTick(() => {
          this.$refs.deTable.clearSelection();
        });
      }
      this.loading = false;
    },
    show() {
      this.visible = true;
      this.formInline = {
        name:"",
        department:"",
        email:""
      }
      if (this.loaded) {
        this.getTableData();
      }
      this.loaded = true;
    },
    sortChange(obj) {
      if (!obj.prop) { return; }
      this.order = obj.order=="ascending"?"asc":"desc";
      this.field = obj.prop;
      this.getTableData(false);
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getTableData(false);
    },
    rowClick(row) {
      this.$refs.deTable.toggleRowSelection(row);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getTableData(false);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    async getDept() {
      this.departVisible = true;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/departments"
      })
      var arr = ret.departments;
      arr.forEach(function(item, key) {
        item.pId = item.parent_id?item.parent_id:"default";
        item.icon = './static/img/ztree/department.png';
      });
      arr.unshift({id:"default", name:Vue.t('base.all'), icon:"./static/img/ztree/department.png"});
      this.treeData = arr;

      this.$nextTick(() => {
        let node = node = this.$refs.deZtree.action('getNodesByParam', "level", 0)[0];
        this.$refs.deZtree.action("selectNode", node);
        this.$refs.deZtree.action("expandNode", node);
      });
    },
    confirmDepart() {
      var nodes = this.$refs.deZtree.action("getSelectedNodes");
      this.formInline.department = nodes[0].id=="default"?"":nodes[0].name;
      this.formInline.departmentId = nodes[0].id=="default"?"":nodes[0].id;
      this.departVisible = false;
    },
    async confirmFun() {
      if (this.multipleSelection.length==0) {
        this.$message({
          message: Vue.t('base.selectUser'),
          type: "warning"
        });
        return;
      }
      this.saving = true;
      try {
        let ret = await this.$sequence({
          type: 'put',
          url: 'api/keystone/v3/groups/'+this.groupid+'/users/{id}',
          params: this.multipleSelection,
          log:{
            description:{
              en:"group("+this.name+")add user",
              zh_cn:"组("+this.name+")新增人员"
            },
            target:Vue.logTarget.group,
            key:"name"
          }
        });
        this.$emit("refreshData");
        this.visible = false;
        this.saving = false;
      } catch (e) {
        this.saving = false;
        __DEV__ && console.error(e);
      }
    },
    blurFun(key) {
      if (this.formInline[key].length>40) {
        this.formInline[key] = '';
        this.$notify({
          message:Vue.t('base.ultraLong'),
          type:'warning'
        });
      }
    }
  }
}
</script>