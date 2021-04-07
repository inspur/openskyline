<template>
  <div v-loading="loading" class="monitor monitor-host">
    <div class="content" v-if="!detailFlg">
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
        <el-table-column prop="name" :label="$t('base.name')"></el-table-column>
        <el-table-column prop="tag" :label="$t('monitor.alias')" class-name="tag">
          <template slot-scope="scope">
            <span class="operate">
              <span>{{scope.row.tag.text}}</span>
              <i class="display-none el-icon-edit" :class="{'is-checked':scope.row.tag.showIcon}"></i>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="ip" :label="$t('monitor.IP_ADDRESS')"></el-table-column>
        <el-table-column prop="template_name" :label="$t('monitor.ALERT_TEMPLATE')"></el-table-column>
        <el-table-column
          prop="cpu"
          :label="$t('monitor.CPU_USAGE')"
          sortable="custom"
          min-width="111"
        >
          <template v-slot="scope">
            <el-progress
              :show-text="true"
              :percentage="scope.row.cpu.value"
              :class="scope.row.cpu.class"
            ></el-progress>
          </template>
        </el-table-column>
        <el-table-column
          prop="mem"
          :label="$t('monitor.MEM_USAGE')"
          sortable="custom"
          min-width="111"
        >
          <template v-slot="scope">
            <el-progress
              :show-text="true"
              :percentage="scope.row.mem.value"
              :class="scope.row.mem.class"
            ></el-progress>
          </template>
        </el-table-column>
        <el-table-column
          prop="fs"
          :label="$t('monitor.FS_USAGE')"
          sortable="custom"
          min-width="111"
        >
          <template v-slot="scope">
            <el-progress
              :show-text="true"
              :percentage="scope.row.fs.value"
              :class="scope.row.fs.class"
            ></el-progress>
          </template>
        </el-table-column>
        <el-table-column prop="level" :label="$t('monitor.alarmLevel')" sortable="custom">
          <template slot-scope="scope">
            <span class="circle" :class="scope.row.level.sign">{{scope.row.level.name}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="node" :label="$t('monitor.NODE_TYPE')"></el-table-column>
        <el-table-column prop="operate" :label="$t('base.operating')" class="operate">
          <template slot-scope="scope">
            <span class="operate">{{scope.row.operate}}</span>
          </template>
        </el-table-column>
      </el-table>

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

    <router-view class="details" v-if="detailFlg"></router-view>

    <icos-edit-tag ref="editTag" @handler="editTagHandler"></icos-edit-tag>
  </div>
</template>
<script>
// import host from "../../test/host.json"; //test
import { utils } from "../../public/utils";
import IcosEditTag from "../../public/components/IcosEditTag";

let isCN = Vue.config.lang === "zh-cn";

export default {
  components: { IcosEditTag },
  name: "host",
  watch: {
    $route(to, from) {
      this.detailFlg = this.$route.path.indexOf("hostDetail") > -1;
    }
  },
  data() {
    return {
      searchBar: {
        conditions: {
          alias: {
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
          tag: {
            label: this.$t("monitor.alias"),
            type: "select",
            options: []
          },
          alarmLevel: {
            label: this.$t("monitor.alarmLevel"),
            type: "select",
            visible: String(Vue.roleType) === "0",
            options: Object.keys(utils.levelList).map(v => {
              return { value: v, label: utils.levelList[v] };
            })
          }
        }
      },
      detailFlg: this.$route.path.indexOf("hostDetail") > -1,
      loading: false,
      tableLoading: false,
      centerId: "",
      isCN: Vue.config.lang === "zh-cn",
      alias: "",
      alertTemplate: "",
      tag: "",
      pageSize: 10,
      currentPage: 1,
      total: 0,
      tableData: [],
      tableOrderSortType: "",
      alertStatus: "",
      timeoutID: 0
    };
  },
  created() {},
  beforeMount() {},
  beforeUpdate() {},
  updated() {},
  activated() {},
  beforeDestroy() {
    clearTimeout(this.timeoutID);
  },
  mounted() {
    this.getTableData({ page: 1 });
    this.getTagList();
  },
  methods: {
    searchHandle(v = {}) {
      this.alertStatus = v.alarmLevel;
      this.alias = v.alias;
      this.alertTemplate = v.alertTemplate;
      this.tag = v.tag;

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
    cellMouseLeave(row, column, cell, event) {
      if (column.property === "tag") {
      }
    },
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
              logDescNameCN: "宿主机",
              logDescNameEN: "Host"
            })
          );
          break;
        case "operate":
          utils.deleteResource(
            Object.assign(rowData, {
              vm: this,
              logDesc: "宿主机",
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
      let param = {
        subclass_id: "hs",
        current_page: me.currentPage,
        page_size: me.pageSize,
        tags: me.tag,
        resource_alias: me.alias,
        template_name: me.alertTemplate
      };
      if (me.alertStatus) {
        param.alert_status = me.alertStatus;
      }
      if (me.tableOrderSortType) {
        param.sort = me.tableOrderSortType;
      } else {
        param.sort = "default";
      }
      let url = "api/pluto/v1/monitor/sub_resources?" + $.param(param);
      let data = await me.$ajax({
        type: "get",
        url: url,
        headers: {
          FORWARD_UNION: me.centerId
        }
      });
      me.tableLoading = false;
      // data = host; //test
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
        let nt = e["node_type"];
        nt = nt ? nt.split("|") : [];
        nt = nt.filter((v, i, a) => v);
        nt = isCN
          ? nt.map((v, i, a) => {
              return {
                control: "控制",
                compute: "计算",
                storage: "存储",
                network: "网络",
                monitor: "监控"
              }[v];
            })
          : nt;
        nt = nt.join("、");

        me.tableData.push({
          name: e["resource_alias"],
          tag: { text: e["tags"], showIcon: 0 },
          ip: e["resource_address"],
          cpu: utils.getProgressPercentageStatus(e["cpu_usage"]),
          mem: utils.getProgressPercentageStatus(e["mem_usage"]),
          fs: utils.getProgressPercentageStatus(e["fs_usage"]),
          level: {
            sign: e["alert_status"],
            name: utils.getLevel(e["alert_status"])
          },
          node: nt,
          collectHost: e["collect_host"],
          resourceID: e["resource_id"],
          template_name: e["template_name"] || '-',
          operate: Vue.t("monitor.REDISCOVER ")
        });
      });

      me.timeoutID = window.setTimeout(() => {
        me.getTableData();
      }, 1000 * 60);
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
      var url = "api/pluto/v1/monitor/resources/tags?subclass_id=hs";
      this.$ajax({
        type: "get",
        url: url,
        headers: {
          FORWARD_UNION: me.centerId
        },
        successFun(data) {
          let tags = data.tags || [];
          me.searchBar.conditions.tag.options = Array.from(tags, v => {
            return { label: v, value: v };
          });
        }
      });
    },
    gotoDetails(v) {
      let path = `/intelligentMonitoring/resourceMonitor/host/hostDetail/${v.collectHost}/${v.resourceID}`;
      this.$router.push({ path: path });
    }
  }
};
</script>

<style scoped>
.monitor-host {
}
.monitor-host >>> .content table tbody tr td:first-child:hover {
  color:#000;
  text-decoration: underline;
}
.monitor-host >>> .content table tbody tr td:first-child,
.monitor-host >>> .content table tbody tr td:last-child,
.monitor-host >>> .content table tbody tr td:nth-child(2) {
  cursor: pointer;
  color: #0087ed;
}
</style>