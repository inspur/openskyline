<template>
  <div v-loading="loading" class="monitor g2-list">
    <div v-if="!detailFlg" class="content">
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
          <template v-slot="scope" v-else-if="i.prop=='storage'">
            <el-progress
              :show-text="true"
              :percentage="scope.row.storage.value"
              :class="scope.row.storage.class"
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
      this.detailFlg = this.$route.path.indexOf("g2StorageDetail") > -1;
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
        { prop: "template_name", label: Vue.t("monitor.ALERT_TEMPLATE") },
        { prop: "total_mdisk_capacity", label: `${Vue.t("monitor.totalStorage")}(GB)` },
        { prop: "total_used_capacity", label: `${Vue.t("monitor.TO_USE_CAPACITY")}(GB)` },
        {
          prop: "storage",
          label: Vue.t("monitor.STORAGE_USAGE"),
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
        // { prop: "status", label: Vue.t("monitor.STATUS") },
        { prop: "operate", label: Vue.t("base.operating") }
      ],
      columnsSelectArray: [],
      isCN: Vue.config.lang === "zh-cn",
      alias: "",
      tag: "",
      projectId: "",
      userName: "",
      pageSize: 10,
      currentPage: 1,
      total: 0,
      tableData: [],
      tableOrderSortType: "",
      roleType: Vue.roleType + "",
      detailFlg: this.$route.path.indexOf("g2StorageDetail") > -1,
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
              logDescNameCN: "G2存储",
              logDescNameEN: "g2-storage"
            })
          );
          break;
        case "operate":
          utils.deleteResource(
            Object.assign(rowData, {
              vm: this,
              logDesc: "G2存储",
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
      param.subclass_id = "g2";
      if (me.currentPage) {
        param.current_page = me.currentPage;
      }
      if (me.pageSize) {
        param.page_size = me.pageSize;
      }
      if (me.tableOrderSortType) {
        param.sort = me.tableOrderSortType;
      } else {
        param.sort = "default";
      }
      let url = "api/pluto/v1/monitor/sub_resources";
      let data = await me.$ajax({
        type: "get",
        url: url,
        data: param,
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
          ...e,
          name: e["resource_alias"],
          tag: { text: e["tags"], showIcon: 0 },
          template_name: e["template_name"],
          total_used_capacity: e["total_used_capacity"],
          total_mdisk_capacity: e["total_mdisk_capacity"],
          storage: utils.getProgressPercentageStatus(e["total_used_rate"]),
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

      var url = "api/pluto/v1/monitor/resources/tags?subclass_id=g2" + p;
      this.$ajax({
        type: "get",
        url: url,
        headers: {
          FORWARD_UNION: me.centerId
        },
        successFun(data = {}) {
          let a = data.tags || [];
        }
      });
    },
    gotoDetails(v) {
      this.$router.push({
        name: "g2StorageDetail",
        // path: path,
        params: { ...v },
        query: { test: 'test' }
      });
    }
  }
};
</script>


<style scoped>
.g2-list {
}
.g2-list >>> .content table tbody tr td:first-child:hover {
  text-decoration: underline;
}
.g2-list >>> .content table tbody tr td:first-child,
.g2-list >>> .content table tbody tr td:last-child,
.g2-list >>> .content table tbody tr td:nth-child(2) {
  cursor: pointer;
  color: #1991eb;
}
</style>