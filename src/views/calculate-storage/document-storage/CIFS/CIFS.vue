<template>
<div>
  <!-- <el-form :inline="true" v-model="formInline" class="form-inline">
    <el-form-item :label="$t('storage.userName')">
      <el-input  :placeholder="$t('storage.userName')" size="small" v-model="formInline.userName"></el-input>
    </el-form-item>
    <el-form-item :label="$t('storage.userGroup')">
      <el-input  :placeholder="$t('storage.userGroup')" size="small" v-model="formInline.userGroup"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" icon='fa-search'  size="small" @click="getData()">{{$t('lang.query')}}</el-button>
    </el-form-item>
  </el-form>
  <div class="divider clearfix"></div> -->
  <div class="operation-panel" v-if="isSuperAdmin">
    <operation-panel
      class="margin-tb5"
      :select-rows="multipleSelection"
      :operation-menus="operationMenus">
    </operation-panel>
  </div>
  <div class="divider clearfix"></div>
  <el-table ref="shTable" :data="tableData" :default-sort="{prop: 'name', order: 'ascending'}" @selection-change="handleSelectionChange" @sort-change="sortChange" highlight-current-row border stripe style="width: 100%;" slot="empty" row-key="name">
    <el-table-column reserve-selection type="selection" align="center" width="55">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('name') >= 0" prop="name" :label="$t('storage.userName')" align="left" sortable="custom" min-width="100">
    </el-table-column>
    <el-table-column v-if="columnsChecked.indexOf('group') >= 0" prop="group" :label="$t('storage.userGroup')" align="left" min-width="100">
    </el-table-column>
    <!-- <el-table-column v-if="columnsChecked.indexOf('password') >= 0" prop="password" :label="$t('storage.password')" align="left" min-width="100">
      <template>
        <span>{{"******"}}</span>
      </template>
    </el-table-column> -->
  </el-table>
  <div style="margin: 10px 0; position: relative">
    <el-row>
      <el-col :span="5">
        <el-button type="text" icon="fa-refresh" @click="onRefresh">
        </el-button>
          <span>{{$t('lang.currentSelected')}}{{multipleSelection.length}}{{$tc("lang.item", multipleSelection.length)}}</span>
          <el-popover
            placement="right"
            trigger="click">
            <el-checkbox-group class="vertical"
              v-model="columnsChecked">
              <el-checkbox class="item" v-for="item in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" style="display: inline-block;">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
      </el-col>
      <el-col :span="19">
        <page :totalData="totalData"  @getCurrentData="getCurrentData" :sortObj="sortObj"></page>
      </el-col>
    </el-row>
  </div>
  <new-user v-if="newUserFlg" @handleShow="handleNewUser" @onRefresh="onRefreshTable"></new-user>
  <edit-user v-if="editUserFlg" :userInfo="userInfo" @handleShow="handleEditUser" @onRefresh="onRefreshTable"></edit-user>
 </div>
</template>
<script>
import NewUser from "./NewUser";
import EditUser from "./EditUser";
  export default {
  name: "CIFS",
  data() {
    return {
      sortObj:{
        sortOrder:"ascending",
        sortField:"name"
      },
      formInline: {
        userName: "",
        userGroup: ""
      },
      loading: false,
      newUserFlg: false,
      editUserFlg: false,
      userInfo: "",
      totalData: [],
      tableData: [],
      isSuperAdmin: Vue.roleType + "" === "0",
      multipleSelection: [],
      // columnsChecked: ["name", "group", "password"],
      columnsChecked: ["name", "group"],
      columns: [{
        prop:"name",
        label:this.$t('storage.userName')
      }, {
        prop:"group",
        label:this.$t('storage.userGroup')
      // }, {
      //   prop:"password",
      //   label:this.$t('storage.password')
      }],
      operationMenus: [{
        icon: "fa-plus",
        name: this.$t('storage.create'),
        showflg: true,
        readOnly: this.isAdmin(),
        enable(rowData) {
          return Vue.roleType + "" === "0";
        },
        handler: function(selectRows) {
          let me = this;
          me.newUserFlg = true;
        }.bind(this)
      }, {
        icon: "fa-pencil-square-o",
        name: this.$t('lang.edit'),
        showflg: true,
        enable(rowData) {
          return Vue.roleType + "" === "0";
        },
         handler: function(selectRows) {
          let me = this;
          me.editUserFlg = true;
          me.userInfo = selectRows[0];
        }.bind(this)
      }, {
        icon: "fa-times",
        name: this.$t('lang.delete'),
        showflg: true,
        multi: false,
        enable(rowData) {
          return Vue.roleType + "" === "0";
        },
        handler: function(selectRows) {
          let self = this;
          this.$confirm(this.$t('lang.ifDeleteData'), this.$t('lang.confirm'), {
            confirmButtonText:this.$t('lang.confirm'),
            cancelButtonText:this.$t('lang.cancel'),
            type:'warning'
          }).then(() => {
            let projectId = self.$cookie.get('pid');
            let url = `api/manila/v2/${projectId}/os-user-manage/delete_user`;
            let body = {
              "name" : selectRows[0].name
            };
            body = JSON.stringify(body);
            try {
              let result = self.$ajax({
                type: "post",
                data: body,
                url: url,
                showErrMsg: true,
                log: {
                  description: {
                    en: "Delete CIFS uesr: " + selectRows[0].name + ", user group is: " + selectRows[0].group,
                    zh_cn: "删除CIFS文件存储用户:" + selectRows[0].name + ", 用户组为:" + selectRows[0].group
                  },
                  target: Vue.logTarget.storage_share_CIFS
                },
                successFun: function () {
                  self.$message.info(Vue.t("storage.deleteCIFSUserSuccess"));
                  self.onRefreshTable();
                },
                errFun: function(xhr, status, msg) {
                  self.$message.error(Vue.t("storage.deleteCIFSUserFailed"));
                }
              });
            } catch (res) {
              console.log(res);
            }
          }).catch(() => {
          });
        }.bind(this)
      }]
    }
  },
  beforeDestroy() {
    if (this.interVmValid != null) {
      clearInterval(this.interVmValid);
    }
  },
  watch: {
  },
  mounted() {
    var self = this;
    self.loadData();
  },
  methods: {
    sortChange(column) {
      this.sortObj = {
         sortOrder:column.order,
         sortField:column.prop
       };
    },
    getCurrentData(param) {
        this.tableData = param;
    },
    async getData() {
      this.$refs.shTable.clearSelection();
      this.loadData();
    },
    async loadData() {
      let self = this;
      let projectId = self.$cookie.get('pid');
      let url = `api/manila/v2/${projectId}/os-user-manage/query_user`;
      try {
        let ret = await self.$ajax({
          type: 'GET',
          url: url
        });
        let user = ret["users"]
        let result = [];
        for (let i = 0; i < user.length; i++) {
          const item = user[i];
          result.push({
              name: item["name"],
              group: item["mainGroup"],
              password: "******"
            });
        }
        self.totalData = result;
      } catch (data) {
        this.loading = false;
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleNewUser() {
      this.newUserFlg = false;
    },
    handleEditUser() {
      this.editUserFlg = false;
    },
    onRefresh() {
      this.$refs.shTable.clearSelection();
    },
    onRefreshTable() {
      this.$refs.shTable.clearSelection();
      this.loadData();
    },
    isAdmin() {
      var roleType = Vue.roleType + "";
      if ("2" == roleType || "3" == roleType) {
        return false;
      }
      return true;
    },
    isUser() {
      var roleType = Vue.roleType + "";
      if ("3" == roleType) {
        return false;
      }
      return true;
    }
  },
  components: {
    NewUser,
    EditUser
  }
}
</script>
<style scoped>

</style>
