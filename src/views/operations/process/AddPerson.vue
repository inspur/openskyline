<template>
  <div>
    <el-dialog size="middle" @close="cancel" :title="$t('opt.addApprover')" :visible.sync="visible">
      <el-row :gutter="10">
        <el-col :span="4" v-show="!isLdap">
          <el-card>
            <ztree
            ref="deZtree"
            :data="treeData"
            :setting="setting"
            style="position: relative; min-height: 400px;max-height: 600px;"
            v-loading="treeLoading"
            :element-loading-text="$t('opt.dataLoading')">
            </ztree>
            <h2 style="text-align: center; min-height: 450px;" v-if="!treeData || treeData.length<0">{{emptyText}}</h2>
          </el-card>
        </el-col>          
        <el-col :span="20" :offset="0">
          <el-form :inline="true" :model="formInline" class="form-inline">
            <el-form-item :label="$t('opt.roleType')">
              <el-select v-model="formInline.role_type" style="width:120px;" @change="roleChange">
                <el-option v-if="isAdmin&&parentRole!=2&& parentItem == 0" :label="$t('opt.all')" value=""></el-option>
                <el-option v-if="isAdmin&&parentRole!=2" :label="$t('opt.administrator')" value="0"></el-option>
                <el-option v-if="parentItem==0||parentRole==2" :label="$t('opt.projectManager')" value="2"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('opt.project')" v-if="formInline.role_type==2&&parentItem==0&&parentRole==0">
              <el-input auto-complete="off" style="width:120px;" :icon="close" :on-icon-click="onIconClick" :readonly="true" @focus="selectProject" v-model="formInline.projectName"></el-input>
            </el-form-item>
            <el-form-item :label="$t('opt.account')">
              <el-input v-model="formInline.name" @blur="blurFun('name')"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon='fa-search' size="small" @click="onQuery">{{$t('opt.doQuery')}}</el-button>
            </el-form-item>
          </el-form>
          <div class="divider clearfix"></div>
          <operation-panel
            class="margin-tb5"
            :select-rows="multipleSelection"
            :operation-menus="operationMenus">
          </operation-panel>
          <el-table
            ref="deTable"
            :data="tableData"
            v-loading="tableLoading"
            :element-loading-text="$t('opt.dataLoading')"
            highlight-current-row
            style="width: 100%"
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
              :label="$t('opt.account')"
              sortable="custom"
              min-width="100">
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('status') >= 0"
              prop="enabled"
              align="left"
              :label="$t('opt.status')"
              min-width="100">
              <template slot-scope="scope">
                <span>{{scope.row.enabled==1?$t('opt.available'):$t('opt.disable')}}</span>
              </template>
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('dept') >= 0"
              prop="department_name"
              :label="$t('opt.department')"
              min-width="100">
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('alias') >= 0"
              prop="alias"
              :label="$t('opt.fullName')"
              min-width="100">
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('email') >= 0"
              prop="email"
              :label="$t('opt.email')"
              min-width="100">
            </el-table-column>
            <el-table-column v-if="columnsChecked.indexOf('phone') >= 0"
              prop="phone"
              :label="$t('opt.telephone')"
              min-width="100">
            </el-table-column>
          </el-table>
          <div style="margin: 10px 0; position: relative">
            <el-row>
              <el-col :span="5">
                <el-button type="text" icon="fa-refresh" @click="getTableData">
                </el-button>
                  <span>{{$t('opt.currentSelected')}}{{multipleSelection.length}}{{$t('opt.item')}}</span>
                  <el-popover
                    placement="right"
                    trigger="click">
                    <el-checkbox-group class="vertical"
                      v-model="columnsChecked">
                      <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                      </el-checkbox>
                    </el-checkbox-group>
                    <div slot="reference" style="display: inline-block;">
                      <el-tag>{{$t('opt.selectColumn')}}</el-tag>
                    </div>
                  </el-popover>
              </el-col>
              <el-col :span="19">
                 <page :totalData="totalData"  @getCurrentData="getCurrentData"></page>
              </el-col>
            </el-row>
          </div>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{$t('opt.cancel')}}</el-button>
        <el-button type="primary" @click="confirmFun">{{$t('opt.submit')}}</el-button>
      </div>
    </el-dialog>
    <select-project style="height:100%;width:100%;position:relative;" ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  </div>
</template>
<script>
export default {
  name:"addPerson",
  props: ["parentRole2", "parentId2"],
  watch:{
    multipleSelection:function (arr) {
      this.editId = arr.length==0?"":arr[0].id;
    }
  },
  data() {
    return {
      isLdap:Vue.isLdap,
      parentIndex: "",
      parentItem: "",
      parentRole: this.parentRole2,
      parentId: this.parentId2,
      visible: true,
      totalData:[],
      listPara:{
        page:1,
        pageSize:10
      },
      isAdmin: Vue.roleType=="0",
      editUserFlg:false,
      motifyPasswordFlg:false,
      projectValue:"0",
      viewPowerFlg:false,
      proList:[],
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
        },
        callback: {
          onClick: this.onTreeNodeClick
        }
      },
      treeData: [],
      tableData:[],
      editId:"",
      desc:"asc",
      field:"name",
      treeLoading:false,
      tableLoading:false,
      emptyText: this.$t('opt.noData'),
      formInline:{
        role_type: Vue.roleType=="0"?"":"2",
        project_id:"",
        projectName:"",
        name:""
      },
      selProjectFlg: false,
      close: "",
      multipleSelection: [],
      checkFlag: 0,
      names: [],
      ids: [],
      columns: [{
        prop: "name",
        label: this.$t('opt.account')
      }, {
        prop: "status",
        label: this.$t('opt.status')
      }, {
        prop: "dept",
        label: this.$t('opt.department')
      }, {
        prop: "alias",
        label: this.$t('opt.fullName')
      }, {
        prop: "email",
        label: this.$t('opt.email')
      }, {
        prop: "phone",
        label: this.$t('opt.telephone')
      }],
      columnsChecked:["name", "status", "dept", "alias", "email", "phone"],
      operationMenus:[]
    }
  },
  mounted() {
    var self = this;
    if (!self.isAdmin) {
      self.formInline.project_id = self.$cookie.get("pid");
      Promise.all([self.roleChange2()]).then(function(result) {
        self.getTreeData();
      });
    } else {
      if (self.parentRole == "2") {
        self.formInline.project_id = self.parentId;
        Promise.all([self.roleChange3()]).then(function(result) {
          self.getTreeData();
        });
      } else {
        self.getTreeData();
      }
    }
    this.checkFlag = 0;
  },
  methods: {
    async getTreeData(id) {
      this.treeLoading = true;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/departments"
      })
      var arr = ret.departments;
      arr.forEach(function(item, key) {
        item.pId = item.parent_id?item.parent_id:"default";
        item.icon = './static/img/ztree/department.png';
      });
      arr.unshift({id:"default", name:this.$t('opt.all'), icon:"./static/img/ztree/department.png"});
      this.treeData = arr;
      this.$nextTick(() => {
        let node = null;
        if (!id) {
          node = this.$refs.deZtree.action('getNodesByParam', "level", 0)[0];
        } else {
          node = this.$refs.deZtree.action('getNodesByParam', "id", id)[0];
        }
        this.selectNode = node;
        this.$refs.deZtree.action("selectNode", node);
        this.$refs.deZtree.action("expandNode", node);
        this.treeLoading = false;
      });
    },
    getSelectCol(names, ids) {
      this.names = names.split(',');
      this.ids = ids.split(',');
    },
    onQuery() {
      this.getTableData();
    },
    rowClick(row) {
    },
    async getTableData() {
      this.totalData = [];
      this.tableLoading = true;
      let selNodes = this.$refs.deZtree.action('getSelectedNodes');
      let pid = selNodes.length>0?selNodes[0].id:"default";
      var param = {dir:this.order, field:this.field, limit:9999, page:1, domain_id:"default"};
      if (pid!="default") {
        param.department = pid;
      }
      if (this.formInline.role_type) {
        param.role_type = this.formInline.role_type;
      }
      if (this.formInline.name!="") {
        param["name"] = this.formInline.name;
      }
      if (this.formInline.role_type && this.parentRole != "2") {
        param.role_type = this.formInline.role_type;
        if (this.formInline.role_type!=0&&this.formInline.project_id) {
          param.project_id = this.formInline.project_id;
        }
        let ret = await this.$ajax({
          type: 'get',
          url: "api/keystone/v3/inspur/users?"+ $.param(param)
        })
        this.totalData = ret.users;
      } else {
        if (this.parentRole != "2" && this.parentItem == 1) {
          this.formInline.role_type = "0";
          param.role_type = "0";
          if (this.formInline.role_type!=0&&this.formInline.project_id) {
            param.project_id = this.formInline.project_id;
          }
          let ret = await this.$ajax({
            type: 'get',
            url: "api/keystone/v3/inspur/users?"+ $.param(param)
          })
          this.totalData = ret.users;
        }
        if (this.parentRole != "2" && this.parentItem == 0) {
          param.role_type = "";
          this.formInline.role_type = "";
          if (this.formInline.role_type!=0&&this.formInline.project_id) {
            param.project_id = this.formInline.project_id;
          }
          let ret = await this.$ajax({
            type: 'get',
            url: "api/keystone/v3/inspur/users?"+ $.param(param)
          })
          this.totalData = ret.users;
          param.role_type = "2";
          if (this.formInline.role_type!=0&&this.formInline.project_id) {
            param.project_id = this.formInline.project_id;
          }
          let rets = await this.$ajax({
            type: 'get',
            url: "api/keystone/v3/inspur/users?"+ $.param(param)
          })
          var totalData1 = rets.users;
          this.totalData = totalData1.concat(this.totalData);
          var hash1 = {};
          this.totalData = this.totalData.reduce(function(item, next) {
            hash1[next.name]?'':hash1[next.name] = true && item.push(next);
            return item
          }, [])
        }
        if (this.parentRole != "0") {
          param.role_type = "2";
          this.formInline.role_type = "2";
          if (this.formInline.role_type!=0&&this.formInline.project_id) {
            param.project_id = this.formInline.project_id;
          }
          let ret = await this.$ajax({
            type: 'get',
            url: "api/keystone/v3/inspur/users?"+ $.param(param)
          })
          var totalData2 = ret.users;
          this.totalData = totalData2.concat(this.totalData);
          var hash = {};
          this.totalData = this.totalData.reduce(function(item, next) {
            hash[next.name]?'':hash[next.name] = true && item.push(next);
            return item
          }, [])
        }
      }
      this.tableLoading = false;
      var rows = this.multipleSelection;
      if (this.checkFlag == 0) {
        this.checked(rows);
      } else {
        this.inChecked(rows);
      }
    },
    checked(rows) {
      let self = this;
      var idsMul = self.ids;
      if (rows.length>0) {
        idsMul = [];
        rows.forEach(function(item, index, arr) {
          idsMul.push(item.id);
        });
      } else {
        self.$refs.deTable.clearSelection();
      }
      self.$nextTick(function () {
        self.totalData.forEach(function(item, index, arr) {
          for (var i = 0; i < idsMul.length; i++) {
            if (idsMul[i] === item.id) {
              self.$refs.deTable.toggleRowSelection(item, true);
            }
          }
        });
      });
    },
    inChecked(rows) {
      let self = this;
      if (rows != null && rows != "") {
        if (rows.length>0) {
          var idsMul = [];
          rows.forEach(function(item, index, arr) {
            idsMul.push(item.id);
          });
        } else {
          self.$refs.deTable.clearSelection();
        }
        self.$nextTick(function () {
          self.totalData.forEach(function(item, index, arr) {
            for (var i = 0; i < idsMul.length; i++) {
              if (idsMul[i] === item.id) {
                self.$refs.deTable.toggleRowSelection(item, true);
              }
            }
          });
        });
      } else {
        self.rows = [];
      }
    },
    async roleChange() {
      this.getTableData();
    },
    async roleChange2() {
      var self = this;
      let ret = await self.$ajax({
        type: 'get',
        url: "api/keystone/v3/projects/" + self.$cookie.get("pid")
      });
      self.proList.push(ret['project']);
    },
    async roleChange3() {
      var self = this;
      let ret = await self.$ajax({
        type: 'get',
        url: "api/keystone/v3/projects/" + self.parentId
      });
      self.proList.push(ret['project']);
    },
    proChange() {
      this.getTableData();
    },
    onTreeNodeClick() {
      this.getTableData();
    },
    sortChange(obj) {
      if (!obj.prop) { return; }
      this.order = obj.order=="ascending"?"asc":"desc";
      this.field = obj.prop;
      this.getTableData();
    },
    confirmFun() {
      var rows = this.multipleSelection;
      let selectedPersonnel = [];
      let selectedPersonIds = [];
      rows.forEach((row, index) => {
          selectedPersonnel.push(row.name);
          selectedPersonIds.push(row.id);
      });
      this.$emit("addData", {
        "selectedPersonnel": selectedPersonnel,
        "selectedPersonIds": selectedPersonIds,
        index: this.parentIndex,
        flg: this.parentItem
      });
    },
    cancel() {
      this.$emit("cancel");
    },
    handleSizeChange(val) {
      this.listPara.pageSize = val;
      this.getTableData(false);
    },
    handleCurrentChange(val) {
      this.listPara.page = val;
      this.getTableData(false);
    },
    handleSelectionChange(val) {
      this.checkFlag = 1;
      this.multipleSelection = val;
      if (val.length > 5) {
        this.$message({
          showClose: true,
          message: this.$t('opt.mostOfFiveApprover'),
          type: 'warning'
        });
        this.$refs.deTable.toggleRowSelection(val[5], false);
      }
    },
    onBack() {
      this.viewPowerFlg = false;
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    onIconClick() {
      this.formInline.projectName = '';
      this.formInline.project_id = '';
      this.close = '';
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    getSelProjects(id, name) {
      this.formInline.project_id = id;
      this.formInline.projectName = name;
      this.close = 'circle-close';
    },
    blurFun(key) {
      if (this.formInline[key].length>20) {
        this.formInline[key] = '';
        this.$notify({
          message:this.$t('opt.overLength'),
          type:'warning'
        });
      }
    }
  },
  components: {
  }
}
</script>
