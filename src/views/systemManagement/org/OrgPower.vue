<template>
  <div>
    <icos-page-header :title="$t('base.groupEmpower')" :show-back="true" @back="handlePageHeaderBack" />
    <icos-page>
      <operation-panel
        class="margin-tb5"
        :select-rows="multipleSelection"
        :operation-menus="operationMenus"
      ></operation-panel>
      <el-table
        ref="deTable"
        :data="tableData"
        v-loading="loading"
        :element-loading-text="$t('base.loadingData')"
        highlight-current-row
        style="width: 100%"
        row-key="id"
        @row-click="rowClick"
        @selection-change="handleSelectionChange"
      >
        <el-table-column reserve-selection type="selection" align="center" width="55"></el-table-column>
        <el-table-column prop="name" :label="$t('base.role')" min-width="100"></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer" style="text-align:center;margin-top:15px;">
        <el-button @click="backFun">{{$t('base.back')}}</el-button>
      </div>
      <div class="divider clearfix"></div>
      <div style="text-align: left;">
        <h4 style="font-weight: 600;">{{$t('base.authorityDescription')}}:</h4>
        <div style="font-size:12px;">
          <div style="line-height: 26px;">{{$t('base.authorityDescription1')}}</div>
          <div style="line-height: 26px;">{{$t('base.authorityDescription2')}}</div>
          <div style="line-height: 26px;">{{$t('base.authorityDescription3')}}</div>
          <div style="line-height: 26px;">{{$t('base.authorityDescription4')}}</div>
        </div>
      </div>

      <add-power
        ref="addPower"
        v-if="addPowerFlg"
        :id="$route.params.id"
        :domainid="$route.params.domainid"
        :name="$route.params.name"
        @refresh="getTableData"
      ></add-power>
    </icos-page>
  </div>
</template>
<script>
import AddPower from "./AddPower";
export default {
  name: "user",
  data() {
    return {
      tableData: [],
      multipleSelection: [],
      addPowerFlg: false,
      loading: false,
      example1:
        Vue.t('base.ROLE_AUTHORITY_EXAMPLE1'),
      example2:
        Vue.t('base.ROLE_AUTHORITY_EXAMPLE2'),
      example3:
        Vue.t('base.ROLE_AUTHORITY_EXAMPLE3'),
      operationMenus: [
        {
          icon: "fa-plus-circle",
          name: this.$t("base.addPermission"),
          showflg: true,
          readOnly: true,
          handler: function() {
            let me = this;
            me.addPowerFlg = true;
            me.$nextTick(() => {
              me.$refs.addPower.show();
            });
          }.bind(this)
        },
        {
          icon: "fa-times",
          name: this.$t("base.delete"),
          showflg: true,
          multi: true,
          enable(rowData) {
            return true;
          },
          handler: async function(selectedRows) {
            this.$confirm(
              Vue.t("base.deleteDataWarn"),
              this.$t("base.deleteConfirm"),
              {
                confirmButtonText: this.$t("base.confirm"),
                cancelButtonText: this.$t("base.cancel"),
                type: "warning"
              }
            ).then(async () => {
              let me = this;
              let list = [];
              let hasMe = false;
              let ret = await me.$ajax({
                type: "get",
                url:
                  "api/keystone/v3/groups/" + this.$route.params.id + "/users"
              });
              hasMe = ret.users.some((item, index) => {
                return item.id == Vue.userId;
              });
              for (var i = 0; i < selectedRows.length; i++) {
                let item = selectedRows[i];
                if (!hasMe) {
                  //组内不包含自己
                  list.push(me.deleteData(item, [item.project_id]));
                } else {
                  //组内包含自己
                  //判断是否选中的超级管理员权限
                  if (item.role_type != 0) {
                    //如果不是
                    list.push(me.deleteData(item, [item.project_id]));
                  } else {
                    me.$message({
                      message:
                        "(" +
                        me.$route.params.name +
                        ")" +
                        Vue.t("base.deleteGroupPerStop"),
                      type: "warning"
                    });
                  }
                }
              }
              if (list.length > 0) {
                Promise.all(list).then(data => {
                  let flg = false;
                  if (data && data.length > 0) {
                    flg = data.some(function(item, index) {
                      if (item) {
                        return item.hasOwnProperty("error");
                      } else {
                        return false;
                      }
                    });
                  }
                  if (flg) {
                    me.getTableData();
                  } else {
                    me.$message.success(Vue.t("base.deleteSuccess"));
                    me.getTableData();
                  }
                });
              }
            });
          }.bind(this)
        }
      ]
    };
  },
  mounted() {
    this.getTableData();
  },
  methods: {
    async getTableData() {
      this.loading = true;
      let ret = await this.$ajax({
        type: "get",
        url:
          "api/keystone/v3/domains/" +
          this.$route.params.domainid +
          "/groups/" +
          this.$route.params.id +
          "/roles"
      });
      this.tableData = ret.roles;
      this.$nextTick(() => {
        this.$refs.deTable.clearSelection();
      });
      this.loading = false;
    },
    deleteData(item, list) {
      let me = this;
      return new Promise(resolve => {
        this.$ajax({
          type: "delete",
          url:
            "api/keystone/v3/groups/" +
            this.$route.params.id +
            "/role/" +
            item.role_id,
          data: JSON.stringify({
            projects: list
          }),
          async: false,
          log: {
            description: {
              en: "delete group(" + me.$route.params.name + ") jurisdction",
              zh_cn: "删除组(" + me.$route.params.name + ")权限"
            },
            target: Vue.logTarget.group
          }
        }).then(
          () => {
            return resolve({});
          },
          () => {
            return resolve({ error: true });
          }
        );
      });
    },
    backFun() {
      this.$router.push({
        path: "/systemManagement/org"
      });
    },
    rowClick(row) {
      this.$refs.deTable.toggleRowSelection(row);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handlePageHeaderBack() {
      window.history.go(-1);
    }
  },
  components: {
    AddPower
  }
};
</script>
