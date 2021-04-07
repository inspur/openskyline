<template>
  <div v-loading="loading" class="monitor vm-list">
    <div v-if="!detailFlg" class="content">
      <icos-search-bar :conditions="searchBar.conditions" @search="searchHandle" />

      <el-table
        v-loading="tableLoading"
        :data="tableData"
        border
        style="width:100%"
        @sort-change="tableSortChange"
        @cell-mouse-enter="cellMouseEnter"
        @cell-mouse-leave="cellMouseLeave"
        @cell-click="cellClick"
      >
        <el-table-column
          v-for="i in columns_"
          :key="i.prop"
          :prop="i.prop"
          :label="i.label"
          :sortable="i.sortable"
          :class-name="i.prop==='tag'?'tag':''"
          :min-width="i.minWidth"
        >
          <template v-slot="scope" v-if="i.prop=='tag'">
            <span class="operate">
              <span>{{scope.row.tag.text}}</span>
              <i class="display-none el-icon-edit" :class="{'is-checked':scope.row.tag.showIcon}"></i>
            </span>
          </template>
          <template v-slot="scope" v-else-if="i.prop=='cpu'">
            <el-progress
              :show-text="true"
              :percentage="scope.row.cpu.value"
              :class="scope.row.cpu.class"
            ></el-progress>
          </template>
          <template v-slot="scope" v-else-if="i.prop=='mem'">
            <el-progress
              :show-text="true"
              :percentage="scope.row.mem.value"
              :class="scope.row.mem.class"
            ></el-progress>
          </template>
          <template v-slot="scope" v-else-if="i.prop=='level'">
            <span class="circle" :class="scope.row.level.sign">{{scope.row.level.name}}</span>
          </template>
          <template slot-scope="scope" v-else-if="i.prop=='operate'">
            <span class="operate">{{scope.row.operate}}</span>
          </template>
        </el-table-column>
      </el-table>

      <el-popover placement="right" trigger="click" class="columns-checkbox">
        <el-checkbox-group class="vertical" v-model="columnsSelectArray">
          <el-checkbox class="item" v-for="i in columns" :label="i.prop" :key="i.prop">{{i.label}}</el-checkbox>
        </el-checkbox-group>
        <div slot="reference" style="display: inline-block;">
          <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
        </div>
      </el-popover>

      <el-pagination
        @size-change="paginationSizeChange"
        @current-change="paginationCurrentChange"
        :current-page="currentPage"
        :page-sizes="[5, 10, 20, 30, 40, 60, 80, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </div>

    <router-view v-if="detailFlg"></router-view>

    <icos-edit-tag ref="editTag" @handler="editTagHandler"></icos-edit-tag>
  </div>
</template>
<script>
import { utils } from "../../public/utils";
import IcosEditTag from "../../public/components/IcosEditTag";

export default {
  components: { IcosEditTag },
  name: "vmList",
  watch: {
    $route(to, from) {
      this.detailFlg = this.$route.path.indexOf("virtualMachineDetail") > -1;
    },
    columnsSelectArray(t, f) {}
  },
  computed: {
    columns_() {
      return this.columns.filter(
        v => this.columnsSelectArray.indexOf(v.prop) > -1
      );
    }
  },
  data() {
    return {
      columns: [
        { prop: "name", label: Vue.t("base.name") },
        { prop: "tag", label: Vue.t("monitor.alias") },
        { prop: "ip", label: Vue.t("monitor.IP_ADDRESS") },
        { prop: "template_name", label: Vue.t("monitor.ALERT_TEMPLATE") },
        {
          prop: "cpu",
          label: Vue.t("monitor.CPU_USAGE"),
          sortable: "custom",
          minWidth: 111
        },
        {
          prop: "mem",
          label: Vue.t("monitor.MEM_USAGE"),
          sortable: "custom",
          minWidth: 111
        },
        {
          prop: "level",
          label: Vue.t("monitor.alarmLevel"),
          sortable: "custom"
        },
        { prop: "project", label: Vue.t("base.project"), hide: 1 },
        { prop: "user", label: Vue.t("base.userName"), hide: 1 },
        { prop: "status", label: Vue.t("monitor.STATUS") },
        { prop: "operate", label: Vue.t("base.operating") }
      ],
      columnsSelectArray: [],
      searchBar: {
        conditions: {
          alias: {
            label: this.$t("base.name"),
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
          tag: {
            label: this.$t("monitor.alias"),
            type: "select",
            options: []
          },
          alertTemplate: {
            label: this.$t("monitor.ALERT_TEMPLATE"),
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
          project: {
            label: this.$t("base.project"),
            type: "select",
            visible: String(Vue.roleType) === "0",
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
          alertStatus: {
            label: this.$t("monitor.alarmLevel"),
            type: "select",
            options: Object.keys(utils.levelList).map(v => {
              return { label: utils.levelList[v], value: v };
            })
          }
        }
      },
      isCN: Vue.config.lang === "zh-cn",
      alias: "",
      tag: "",
      projectId: "",
      userName: "",
      alertTemplate: "",
      pageSize: 10,
      currentPage: 1,
      total: 0,
      tableData: [],
      tableOrderSortType: "",
      roleType: Vue.roleType + "",
      detailFlg: this.$route.path.indexOf("virtualMachineDetail") > -1,
      loading: false,
      tableLoading: false,
      alertStatus: "",
      timeoutID: 0
    };
  },
  mounted() {
    if (Vue.roleType + "" === "2") {
      // 当前是项目管理员时，则使用当前项目
      this.projectId = this.$cookie.get("pid");
    }
    if (String(Vue.roleType) == "0") {
      this.loadProject();
    }
    this.getTableData({ page: 1 });
    this.getTagList();
  },
  created() {
    this.columnsSelectArray = Array.from(this.columns, v =>
      v.hide == 1 ? "" : v.prop
    ).filter(v => v);
  },
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  beforeDestroy() {
    clearTimeout(this.timeoutID);
  },
  methods: {
    searchHandle(v = {}) {
      this.alias = v.alias;
      this.tag = v.tag;
      this.userName = v.userName;
      this.alertStatus = v.alertStatus;
      this.alertTemplate = v.alertTemplate;

      if (Vue.roleType != "2") {
        this.projectId = v.project;
      }

      this.getTableData({ page: 1 });
    },
    tableSortChange(v) {
      let p = v.prop;
      if (p === "level") {
        p = "alert";
      }
      this.tableOrderSortType = p + "_" + v.order.replace("ending", ""); //ascending/descending
      this.getTableData({});
    },
    cellMouseEnter(row, column, cell, event) {
      if (column.property === "tag") {
      }
    },
    cellMouseLeave(row, column, cell, event) {},
    cellClick(row, column, cell, event) {
      let rowData = JSON.parse(JSON.stringify(row)); // 防止vue绑定的数据被篡改，给组件传递深拷贝的数据

      switch (column.property) {
        case "name":
          this.gotoDetails(rowData);
          break;
        case "tag":
          rowData.tag = row.tag; //需要vue绑定的数据
          this.$refs.editTag.show(
            Object.assign(rowData, {
              logDescNameCN: "云主机",
              logDescNameEN: "Instance"
            })
          );
          break;
        case "operate":
          utils.deleteResource(
            Object.assign(rowData, {
              vm: this,
              logDesc: "云主机",
              logTarget: Vue.logTarget.resourceMonitor,
              callback: this.getTableData.bind(this)
            })
          );
          break;

        default:
          break;
      }
    },
    editTagHandler(v = {}) {
      switch (v.type) {
        case "success":
          this.getTableData();
          this.getTagList();
          break;
        case "error":
          break;
        case "show":
          if (v.data && v.data.tag) v.data.tag.showIcon = 1;
          break;
        case "close":
          if (v.data && v.data.tag) v.data.tag.showIcon = 0;
          break;
        default:
          break;
      }
    },
    async getTableData(v = {}) {
      let me = this;
      if (v.page) {
        me.currentPage = v.page;
      }

      window.clearTimeout(me.timeoutID);
      me.$refs.editTag.close();

      me.tableLoading = true;
      let param = {};
      param.subclass_id = "vm";
      if (me.currentPage) {
        param.current_page = me.currentPage;
      }
      if (me.pageSize) {
        param.page_size = me.pageSize;
      }
      if (me.tag) {
        param.tags = me.tag;
      }
      if (me.alias) {
        param.resource_alias = me.alias;
      }
      if (me.userName) {
        param.user_name = me.userName;
      }
      if (me.projectId) {
        param.project_id = me.projectId;
      }
      if (me.tableOrderSortType) {
        param.sort = me.tableOrderSortType;
      } else {
        param.sort = "default";
      }
      if (me.alertStatus) {
        param.alert_status = me.alertStatus;
      }
      param.template_name = me.alertTemplate;

      let url = "api/pluto/v1/monitor/sub_resources?" + $.param(param);
      let data = await me.$ajax({
        type: "get",
        url: url,
        headers: {
          FORWARD_UNION: me.centerId
        }
      });
      me.tableLoading = false;
      if (!data) {
        return;
      }
      me.total = data.total;
      let rl = data.resource_list;
      if (!rl) {
        return;
      }
      me.tableData = [];
      rl.forEach((e, i, a) => {
        me.tableData.push({
          name: e["resource_alias"],
          tag: { text: e["tags"], showIcon: 0 },
          ip: e["resource_address"],
          template_name: e["template_name"],
          cpu: utils.getProgressPercentageStatus(e["cpu_usage"]),
          mem: utils.getProgressPercentageStatus(e["mem_usage"]),
          level: {
            sign: e["alert_status"],
            name: utils.getLevel(e["alert_status"])
          },
          collectHost: e["collect_host"],
          resourceID: e["resource_id"],
          user: e["user_name"],
          project: e["project_name"],
          status: utils.getVirtualMachineStatusItem(e["status"]),
          operate: Vue.t("monitor.REDISCOVER ")
        });
      });

      me.timeoutID = window.setTimeout(() => {
        me.getTableData();
      }, 1000 * 60);
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
    queryClick() {
      this.getTableData({ page: 1 });
    },
    paginationSizeChange(v) {
      this.pageSize = v;
      this.getTableData({ page: 1 });
    },
    paginationCurrentChange(v) {
      this.currentPage = v;
      this.getTableData({ page: this.currentPage });
    },
    getTagList() {
      let me = this;
      let p = '';
       if (me.projectId) {
        p = '&project_id=' + me.projectId;
      }

      var url = "api/pluto/v1/monitor/resources/tags?subclass_id=vm" + p;
      this.$ajax({
        type: "get",
        url: url,
        headers: {
          FORWARD_UNION: me.centerId
        },
        successFun(data = {}) {
          let a = data.tags || [];
          me.searchBar.conditions.tag.options = Array.from(a, v => {
            return { label: v, value: v };
          });
        }
      });
    },
    gotoDetails(v) {
      let rid = v.resourceID;
      let mor = rid.substr(3);
      let path = `/intelligentMonitoring/virtualMachine/virtualMachineDetail/${v.collectHost}/${mor}/${rid}`;
      this.$router.push({ path: path });
    }
  }
};
</script>


<style scoped>
.vm-list {
}
.vm-list >>> .content table tbody tr td:first-child:hover {
  text-decoration: underline;
}
.vm-list >>> .content table tbody tr td:first-child,
.vm-list >>> .content table tbody tr td:last-child,
.vm-list >>> .content table tbody tr td:nth-child(2) {
  cursor: pointer;
  color: #1991eb;
}
</style>