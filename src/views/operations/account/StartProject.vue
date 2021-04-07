<template>
  <div>
    <el-row :gutter="10">
      <el-col :span="24" :offset="0">
        <!--
        <el-form :inline="true" :model="formInline" class="form-inline">
          <el-form-item :label="$t('opt.name')">
            <el-input v-model="formInline.name" @blur="blurFun('name')"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" icon='fa-search' @click="queryClick">{{$t('opt.doQuery')}}</el-button>
          </el-form-item>
        </el-form>
        -->

        <icos-search-bar :conditions="searchBar.conditions" :advanced-disabled="true" @search="searchHandle"/>

        <div class="divider clearfix"></div>
        <operation-panel class="margin-tb5" :select-rows="multipleSelection" :operation-menus="operationMenus">
        </operation-panel>
        <el-table
          ref="deTable"
          :data="tableData"
          v-loading="loading"
          :element-loading-text="$t('opt.dataLoading')" highlight-current-row
          border
          stripe
          style="width: 100%"
          row-key="projectid"
          :default-sort="{prop:'name', order:'ascending'}"
          @sort-change="sortChange"
          @selection-change="handleSelectionChange">
          <el-table-column reserve-selection type="selection" align="center" width="55">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" align="left" sortable="custom" :label="$t('opt.name')" min-width="100">
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('status') >= 0" prop="status" align="left" sortable="custom" :label="$t('opt.status')" min-width="100">
            <template slot-scope="scope">
              <el-tag :type="statusTagRender(scope.row.status)">
                <span v-html="statusRender(scope.row.status, scope.row)"></span>
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="columnsChecked.indexOf('desc') >= 0" prop="desc" align="left" :label="$t('opt.description')" min-width="100">
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative">
          <el-row>
            <el-col :span="5">
              <el-button type="text" icon="fa-refresh" @click="onRefresh">
              </el-button>
              <span>{{$t('opt.currentSelected')}}{{multipleSelection.length}}{{$t('opt.item')}}</span>
              <el-popover placement="right" trigger="click">
                <el-checkbox-group class="vertical" v-model="columnsChecked">
                  <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
                  </el-checkbox>
                </el-checkbox-group>
                <div slot="reference" style="display: inline-block;">
                  <el-tag>{{$t('opt.selectColumn')}}</el-tag>
                </div>
              </el-popover>
            </el-col>
            <el-col :span="19">
              <page :totalData="allData" @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  name: "project",
  watch:{
  },
  data() {
    return {
      searchBar: {
        conditions: {
          name: {
            label: this.$t("opt.name"),
            type: "input",
            validator: (value) => {
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(this.$t('validation.onlyLetter_MinusNumberChinese'));
              }
            }
          }
        }
      },
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      allData: [],
      roleId: "",
      userId: "",
      projectData: [],
      projectMaps: new Map(),
      tableData: [],
      editId:"",
      loading: false,
      formInline: {
        name: "",
        project_id:""
      },
      multipleSelection: [],
      columns: [{
        prop: "name",
        label: this.$t('opt.name')
      }, {
        prop: "status",
        label: Vue.t('opt.status')
      }, {
        prop: "desc",
        label: this.$t('opt.description')
      }],
      columnsChecked: ["name", "desc", "status"],
      operationMenus: [{
        icon: "fa-play",
        name: Vue.t('opt.start'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return rowData['status'] == 0;
        },
        handler: async function(selectRows) {
          // debugger;
          var self = this;
          let projectId = selectRows[0].projectid;
          let uname = selectRows[0].name;
          let userId = self.userId;
          let roleId = self.roleId;
          self.$sequence({
            type: "put",
            url: "api/keystone/v3/projects/"+projectId+"/users/"+userId+"/roles/"+roleId,
            params: selectRows,
            confirmMsg: Vue.t('opt.confirmStart'),
            log:{
              description:{
                en:"start project:"+uname,
                zh_cn:self.$t('opt.startProject')+uname
              },
              target:Vue.logTarget.billing_strategy
            }
          }).then(() => {
            self.$message.success(self.$t('opt.startSuccess'));
            self.$refs.deTable.clearSelection();
            self.getTableData();
          }).catch((err) => {
            console.log(err);
          });
        }.bind(this)
      }, {
        icon: "fa-stop",
        name: Vue.t('opt.close'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return rowData['status'] == 1;
        },
        handler: function(selectRows) {
          var self = this;
          let projectId = selectRows[0].projectid;
          let uname = selectRows[0].name;
          let userId = self.userId;
          let roleId = self.roleId;
          self.$sequence({
            type: "delete",
            url: "api/keystone/v3/projects/"+projectId+"/users/"+userId+"/roles/"+roleId,
            params: selectRows,
            confirmMsg: Vue.t('opt.confirmStop'),
            log:{
              description:{
                en:"stop project:"+uname,
                zh_cn:self.$t('opt.stopProject')+uname
              },
              target:Vue.logTarget.billing_strategy
            }
          }).then(() => {
            self.$message.success(self.$t('opt.stopSuccess'));
            self.$refs.deTable.clearSelection();
            self.getTableData();
          }).catch((err) => {
            console.log(err);
          });
        }.bind(this)
      }]
    }
  },
  mounted() {
    let self = this;
    self.getRoleId();
    self.getUserId();
    self.getTableData();
  },
  methods: {
    searchHandle(v = {}) {
      this.formInline.name = v.name ? v.name : '';

      this.queryClick();
    },
    async getRoleId() {
      let self = this;
      self.loading = true;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/roles?name=rating"
      });
      self.roleId = ret.roles[0].id;
      self.loading = false;
    },
    async getUserId() {
      let self = this;
      self.loading = true;
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/users?name=cloudkitty"
      });
      self.userId = ret.users[0].id;
      self.loading = false;
    },
    async getTableData() {
      let self = this;
      self.loading = true;
      var queryName = self.formInline.name;
      try {
        let ret = await this.$ajax({
          type: 'get',
          url: "api/cloudkitty/v1/cost/get_tenant_list_inspur?name=" + queryName
        });
        self.loading = false;
        self.allData = [];
        for (let i=0; i<ret.length; i++) {
          var obj = {
            name: "",
            projectid: "",
            status: "",
            desc: ""
          };
          obj.name = ret[i].name;
          obj.projectid = ret[i].id;
          obj.status = ret[i].rating_flag;
          obj.desc = ret[i].desc;
          self.allData.push(obj);
        }
        self.loading = false;
      } catch (res) {
        self.loading = false;
        console.log(self.$t('opt.getProjectListFailed'));
      }
    },
    statusTagRender(status) {
      if ("1" == status) {
         return "success";
      } else if ("0" == status) {
         return "gray";
      } else {
        return "";
      }
    },
    statusRender(value, rowData) {
      if (value == "1") {
        return this.$t('opt.start');
      } else if (value == "0") {
        return this.$t('opt.close');
      } else {
        return "-";
      }
    },
    getCurrentData(data) {
      this.tableData = data;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    blurFun(key) {
      let num = (key=="name"?40:50);
      if (this.formInline[key].length>num) {
        this.formInline[key] = '';
        this.$notify({
          message:Vue.t('opt.overLength'),
          type:'warning'
        });
      }
    },
    sortChange(column) {
      var self = this;
      if (!column.prop) { return; }
      self.sortObj = {
        sortOrder:column.order,
        sortField:column.prop
      };
    },
    //刷新
    onRefresh() {
      this.getTableData();
      this.$refs.deTable.clearSelection();
    },
    queryClick() {
      var self = this;
      self.getTableData();
      this.$refs.deTable.clearSelection();
    }
  },
  components: {
  }
}

</script>
