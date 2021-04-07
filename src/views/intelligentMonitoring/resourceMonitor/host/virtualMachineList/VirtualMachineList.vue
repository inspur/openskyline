<template>
  <div class="virtual-machine-list">
    <icos-search-bar :conditions="searchBar.conditions" @search="searchHandle" />

    <el-table
      ref="deTable"
      :data="tableData"
      v-loading="loading"
      :element-loading-text="$t('base.loadingData')"
      highlight-current-row
      style="width: 100%"
      @cell-click="cellClick"
    >
      <el-table-column
        v-if="columnsChecked.indexOf('id') >= 0"
        prop="vm_mor"
        label="id"
        align="left"
        min-width="100"
      ></el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('ip') >= 0"
        prop="ip"
        :label="$t('monitor.floatingIP')"
        align="left"
        min-width="100"
      >
        <template slot-scope="scope">
          <span>{{scope.row.ip}}({{scope.row.float_ip}})</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('name') >= 0"
        prop="name"
        :label="$t('base.name')"
        align="left"
        min-width="100"
      ></el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('status') >= 0"
        prop="status"
        :label="$t('base.status')"
        align="left"
        min-width="60"
      ></el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('project_name') >= 0"
        prop="project_name"
        :label="$t('base.project')"
        align="left"
        min-width="80"
      ></el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('user_name') >= 0"
        prop="user_name"
        :label="$t('base.userName')"
        align="left"
        min-width="80"
      ></el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('cpu') >= 0"
        prop="cpu"
        :label="'CPU('+$t('monitor.core')+')'"
        align="left"
        min-width="60"
      ></el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('memory') >= 0"
        prop="memory"
        :label="$t('base.memory')+'(G)'"
        align="left"
        min-width="60"
      >
        <template slot-scope="scope">
          <span>{{(scope.row.memory/1024).toFixed(2)}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="columnsChecked.indexOf('disk') >= 0"
        prop="disk"
        :label="$t('base.disk')+'(G)'"
        align="left"
        min-width="60"
      ></el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <!-- <el-button type="text" icon="fa-refresh" @click="getTableData">
          </el-button>-->
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox
                class="item"
                v-for="item in columns"
                :label="item.prop"
                :key="item.prop"
              >{{item.label}}</el-checkbox>
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
            :total="total"
          ></el-pagination>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import { utils } from "../../../public/utils";

export default {
  props: ["hostName", "centerId", "resourceId"],
  data() {
    return {
      searchBar: {
        conditions: {
          name: {
            label: this.$t("lang.name"),
            type: "input",
            validator: value => {
              // if (value.length > 40) {
              //   throw new Error(this.$t("base.ultraLong"));
              // }
              if (!/^[_\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(
                  this.$t("validation.onlyLetter_MinusNumberChinese")
                );
              }
            }
          },
          id: {
            label: "id",
            type: "input",
            validator: value => {
              // if (value.length > 50) {
              //   throw new Error(this.$t("base.ultraLong"));
              // }
              if (!/^[a-fA-F0-9\-]+$/.test(value)) {
                throw new Error(this.$t("validation.onlyUUIDKeyword"));
              }
            }
          },
          project: {
            label: this.$t("base.project"),
            type: "select",
            options: []
          },
          userName: {
            label: this.$t("base.userName"),
            type: "input",
            validator: value => {
              // if (value.length > 40) {
              //   throw new Error(this.$t("base.ultraLong"));
              // }
              if (!/^[_.\-0-9a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
                throw new Error(
                  this.$t("validation.onlyLetter_NumberChinese_Pointer")
                );
              }
            }
          },
          status: {
            label: this.$t("lang.status"),
            type: "select",
            options: Array.from(utils.virtualMachineStatus, (v, i) => {
              return { label: v, value: i };
            })

            //   [
            //   { label: Vue.t("base.all"), value: "" },
            //   { label: Vue.t("calcStorLang.running"), value: "ACTIVE" },
            //   { label: Vue.t("calcStorLang.closed"), value: "SHUTOFF" },
            //   { label: Vue.t("calcStorLang.suspended"), value: "SUSPENDED" },
            //   { label: Vue.t("calcStorLang.paused"), value: "PAUSED" },
            //   { label: Vue.t("calcStorLang.error"), value: "ERROR" },
            //   { label: Vue.t("calcStorLang.rescue"), value: "RESCUE" },
            //   { label: Vue.t("calcStorLang.unknow"), value: "UNKNOW" },
            //   { label: Vue.t("calcStorLang.build"), value: "BUILD" },
            //   { label: Vue.t("calcStorLang.migrating"), value: "MIGRATING" },
            //   { label: Vue.t("calcStorLang.reboot"), value: "REBOOT" },
            //   {
            //     label: Vue.t("calcStorLang.hard_reboot"),
            //     value: "HARD_REBOOT"
            //   },
            //   {
            //     label: Vue.t("calcStorLang.shelved_offloaded"),
            //     value: "SHELVED_OFFLOADED"
            //   },
            //   { label: Vue.t("calcStorLang.password"), value: "PASSWORD" },
            //   { label: Vue.t("calcStorLang.rebuild"), value: "REBUILD" },
            //   {
            //     label: Vue.t("calcStorLang.revert_resize"),
            //     value: "REVERT_RESIZE"
            //   },
            //   {
            //     label: Vue.t("calcStorLang.verify_resize"),
            //     value: "VERIFY_RESIZE"
            //   }
            // ]
          }
        }
      },
      isCN: Vue.config.lang === "zh-cn",
      projectId: "",
      tableData: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      name: "",
      id: "",
      userName: "",
      status: "",
      columns: [
        {
          prop: "id",
          label: "id"
        },
        {
          prop: "ip",
          label: Vue.t("monitor.floatingIP")
        },
        {
          prop: "name",
          label: Vue.t("base.name")
        },
        {
          prop: "status",
          label: Vue.t("base.status")
        },
        {
          prop: "project_name",
          label: Vue.t("base.project")
        },
        {
          prop: "user_name",
          label: Vue.t("base.userName")
        },
        {
          prop: "cpu",
          label: "CPU(" + Vue.t("base.core") + ")"
        },
        {
          prop: "memory",
          label: Vue.t("base.memory") + "(G)"
        },
        {
          prop: "disk",
          label: Vue.t("base.disk") + "(G)"
        }
      ],
      columnsChecked: [
        "id",
        "ip",
        "name",
        "status",
        "project_name",
        "user_name",
        "cpu",
        "memory",
        "disk"
      ]
    };
  },
  mounted() {
    this.loadProject();
    this.getTableData();
  },
  methods: {
    searchHandle(v = {}) {
      this.name = v.name;
      this.id = v.id;
      this.userName = v.userName;
      this.status = v.status;
      this.projectId = v.project;

      this.getTableData({ page: 1 });
    },
    cellClick(row, column, cell, event) {
      if (column.property === "name") {
        let p = `/intelligentMonitoring/virtualMachine/virtualMachineDetail/${
          this.hostName
        }/${row["vm_mor"]}/${row["id"]}`;
        this.$router.push({
          path: p,
          query: { from: 'host', resourceID: this.resourceId, collectHost: this.hostName }
        });
      }
    },
    getTableData() {
      let me = this;
      let param = {
        host_name: this.hostName,
        name: this.name,
        id: this.id,
        project_id: this.projectId,
        user_name: this.userName,
        status: this.status,
        current_page: this.currentPage,
        page_size: this.pageSize
      };
      this.$ajax({
        type: "get",
        headers: {
          FORWARD_UNION: this.centerId
        },
        url: "api/pluto/v1/centers/hosts/vms?" + $.param(param),
        successFun(data) {
          let a = data.vm_list || [];
          a.forEach(v => {
            v.status = utils.getVirtualMachineStatusItem(v["status"]);
          });
          me.tableData = a;
          me.total = data.total;
        }
      });
    },
    async loadProject(v) {
      try {
        let url = `api/keystone/v3/inspur/projects?domain_id=default`;
        const res = await this.$ajax({
          type: "get",
          url: url
        });
        let a = res.projects || [];
        this.searchBar.conditions.project.options = Array.from(a, v => {
          return { label: v.name, value: v.id };
        });
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getTableData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getTableData();
    }
  }
};
</script>
<style scoped>
.virtual-machine-list >>> table tbody tr td:nth-child(3):hover {
  text-decoration: underline;
}
.virtual-machine-list >>> table tbody tr td:nth-child(3) {
  cursor: pointer;
  color: #1991eb;
}
</style>