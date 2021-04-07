 <!-- 潘启宝写于2020年07月20日 18:07:00 银河系太阳系中国山东济南 -->
<template>
  <div class="chain">
    <el-form
      :inline="true"
      class="module-background-color module-padding isolation-belt form-inline"
      :rules="rules"
      :model="formData"
      ref="form"
    >
      <el-form-item label="ID：" prop="globalID">
        <el-input auto-complete="off" style="width:333px;" v-model="formData.globalID"></el-input>
      </el-form-item>

      <el-form-item>
        <el-tooltip placement="top">
          <div slot="content" v-if="isCN">可在系统管理-操作日志中查找操作ID</div>
          <div slot="content" v-else>ID in [SystemManage>Operation Log]</div>
          <i class="el-tooltip el-icon-fa">&#xF059</i>
        </el-tooltip>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          icon="search"
          size="small"
          @click="queryClick()"
        >{{$t('lang.query')}}</el-button>
      </el-form-item>
    </el-form>

    <div class="module-background-color module-padding">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        :stripe="false"
        fit
        :row-class-name="rowClassName"
        @sort-change="tableSortChange"
        @cell-mouse-enter="cellMouseEnter"
        @cell-mouse-leave="cellMouseLeave"
        @cell-click="cellClick"
      >
        <el-table-column
          v-for="(v,i) in tableColumn"
          :key="i"
          align="left"
          :prop="v.prop"
          :label="v.label"
          :class-name="v.class"
          :width="v.width"
        >
          <template v-slot="scope" v-if="v.prop==='state'">
            <span :class="scope.row.state.class">
              <span>{{scope.row.state.name}}</span>
            </span>
          </template>
          <template v-slot="scope" v-else-if="v.prop==='operating'">
            <span class="file" :title="$t('scalingService.logList')">
              <i class="el-icon-fa-file-text-o"></i>
            </span>
            <span class="download" :title="$t('base.download')">
              <i class="download el-icon-fa-download"></i>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <transition name="slide-right" mode="out-in">
      <div style="width: 70%;" class="slide-panel" v-if="logListShow">
        <panel style="height: 100%">
          <div slot="title" class="clearfix">
            <el-button
              type="text"
              icon="fa-arrow-right"
              @click="logListShow=false"
            >{{$t("lang.back")}}</el-button>
          </div>

         <el-form
          :inline="true"
          ref="form"
          style="text-align: left;"
          >
          <el-form-item :label="$t('operationAnalysis.level') + '：'">
            <el-select v-model="logLevel" size="small" style="" clearable>
              <el-option v-for="(v,i) in logLevels" :key="i" :label="v" :value="v"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item :label="$t('base.desc') + '：'" prop="ip">
            <el-input v-model="payload"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="logListTableDataFilter"
              size="small"
            >{{ $t("base.query") }}</el-button>
          </el-form-item>
        </el-form>

          <el-table :data="logListTableData" border :stripe="false" fit>
            <el-table-column
              v-for="(v,i) in logListTableColumn"
              :key="i"
              align="left"
              :prop="v.prop"
              :label="v.label"
              :class-name="v.class"
              :width="v.width"
            ></el-table-column>
          </el-table>
        </panel>
      </div>
    </transition>
  </div>
</template>
<script>
// import moment from "moment";
import { mapGetters, mapMutations } from "vuex";
import { exportJsonToExcel } from "utils/Export2Excel";

export default {
  name: "Chain",
  components: {},
  data() {
    let d = {
      logLevel: '',
      logLevels: [],
      payload: '',
      isCN: Vue.config.lang == "zh-cn",
      loading: false,
      formData: { globalID: "" },
      rules: {
        globalID: [
          {
            validator: (rule, value, callback) => {
              let r = /^req-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/g;
              if (!r.test(value)) {
                callback(new Error(Vue.t("monitor.ID_VALIDATOR_MESSAGE")));
              } else {
                callback();
              }
            },
            trigger: "blur"
          },
          { type: "maxSize", value: 100 }
        ]
      },
      tableColumn: [
        {
          prop: "module",
          label: Vue.t("operationAnalysis.module"),
          class: "chain-module"
        },
        { prop: "component", label: Vue.t("operationAnalysis.submodule") },
        { prop: "host", label: Vue.t("base.ON_HOST") },
        { prop: "startTime", label: Vue.t("base.FORBID_TIME_START") },
        { prop: "endTime", label: Vue.t("base.FORBID_TIME_END") },
        {
          prop: "totalLog",
          label: Vue.t("operationAnalysis.TOTAL_NUMBER_OF_LOGS")
        },
        { prop: "errorLog", label: Vue.t("operationAnalysis.LOG_ERRORS") },
        { prop: "state", label: Vue.t("base.status") },
        {
          prop: "operating",
          label: Vue.t("base.operating"),
          width: 77,
          class: "operating"
        }
      ],
      tableData: [],
      logListShow: false,
      rowData: {},
      logListTableColumn: [
        {
          prop: "Timestamp",
          label: Vue.t("base.time"),
          class: ""
        },
        {
          prop: "Hostname",
          label: Vue.t("lang.host")
        },
        {
          prop: "Logger",
          label: Vue.t("operationAnalysis.module")
        },
        {
          prop: "programname",
          label: Vue.t("operationAnalysis.submodule")
        },
        {
          prop: "log_level",
          label: Vue.t("operationAnalysis.level"),
          width: 77
        },
        {
          prop: "project_domain",
          label: Vue.t("operationAnalysis.projectId")
        },
        {
          prop: "user_id",
          label: Vue.t("operationAnalysis.userId")
        },
        {
          prop: "Payload",
          label: Vue.t("base.desc"),
          width: 333
        }
      ],
      logListTableData_: [],
      logListTableData: []
    };

    return d;
  },
  created() {},
  mounted() {
    // this.getData();
    if (this.$route.query && this.$route.query.trace_id) {
      this.formData.globalID = this.$route.query.trace_id;
    }
  },
  methods: {
    logListTableDataFilter() {
      let a = JSON.parse(JSON.stringify(this.logListTableData_));

      if (this.logLevel) {
        a = a.filter(v => v.log_level === this.logLevel);
      }

      if (this.payload) {
        a = a.filter(v => v.Payload && v.Payload.includes(this.payload));
      }

      this.logListTableData = a;
    },
    async getData() {
      this.loading = true;
      let gid = this.formData.globalID; // "req-b997d6d4-6f9f-42ca-81f0-546810014e8c";
      let url = `api/venus/v1/search/trace_log?global_id=${gid}`;
      // url = "./static/json/chain.json"; // TODO 用于开发测试阶段
      let r = await this.$ajax({
        type: "get",
        url: url
      });
      let a = [];

      let analysis = r.analysis || {};
      let pl = analysis.part_list || [];
      pl.forEach((value, index) => {
       let ml = value.model_list || [];
        ml.forEach((_value, index) => {
          let i = {};
          let e = _value.log_error;
          i.module = value.part_name;
          i.component = _value.model_name;
          i.host = (_value.host || []).join(" ");
          i.startTime = _value.start_time;
          i.endTime = _value.end_time;
          i.totalLog = _value.log_total;
          i.logList = _value.log_list;
          i.errorLog = e;
          i.state = {
            name: +e > 0 ? Vue.t("base.abnormal") : Vue.t("base.normal"),
            class: "circle " + (+e > 0 ? "red" : "green")
          };

          a.push(i);
        });
      });

      this.tableData = a;
      this.loading = false;

      // this.$nextTick(v => {
      //   let el = Array.from(document.querySelectorAll("td.chain-module"));
      //   let a = [];
      //   el.forEach(v => {
      //     // elements组件版本低，不支持单元格合并，只能自己来实现
      //     let tc = v.textContent;
      //     if (a.includes(tc)) {
      //       v.style.display = "none";
      //     } else {
      //       let l = el.filter(v => v.textContent === tc).length;
      //       v.setAttribute("rowspan", l);
      //       a.push(tc);
      //     }
      //   });
      //   this.loading = false;
      // });
    },
    queryClick() {
      this.$refs["form"].validate(v => {
        if (!v) {
          return;
        }
        this.getData();
      });
    },
    rowClassName(v) {
      return "";
    },
    tableSortChange(v) {},
    cellMouseEnter(v) {},
    cellMouseLeave(v) {},
    cellClick(row, column, cell, event = {}) {
      this.rowData = JSON.parse(JSON.stringify(row)); // 防止vue绑定的数据被篡改
      let t = event.target || {};
      switch (column.property) {
        case "operating":
          let cn = t.className || "";
          if (cn.includes("download")) {
            this.exportExcel();
          } else if (cn.includes("file")) {
            this.logListShow = true;
            this.logLevel = '';
            this.payload = '';
            this.logListTableData_ = this.rowData.logList;
            // this.logListTableData_[0].log_level = 'ssf';
            // this.logListTableData_[1].log_level = 's33sf';
            // this.logListTableData_[2].log_level = 's343sf';
            // this.logListTableData_[3].log_level = 's33`sf';
            // this.logListTableData_[4].log_level = 's3331sf'; // 用于测试
            this.logListTableData = JSON.parse(JSON.stringify(this.logListTableData_));
            this.logLevels = [];
            this.logListTableData.forEach(v => {
              if (!this.logLevels.includes(v.log_level)) {
                this.logLevels.push(v.log_level);
              }
            })
          }
          break;
        default:
          break;
      }
    },
    exportExcel() {
      let data = this.rowData.logList;
      let a = Array.from(this.logListTableColumn);
      let keys = a.map(v => v.prop);
      let values = a.map(v => v.label);

      let fileName = `${this.rowData.module}/${this.rowData.component}`;
      const flattenData = data.map(v => {
        return keys.map(k => {
          return v[k] || "-";
        });
      });
      this.$recordLog({
        target: Vue.logTarget.operationAnalysis,
        level: {
          en: "info",
          zh_cn: "信息"
        },
        description: {
          en: "Export chain log list:" + fileName,
          zh_cn: "导出调用链的日志列表，" + fileName
        }
      });
      exportJsonToExcel({
        header: values,
        data: flattenData,
        filename: `${fileName}/${this.$tzTimeFormatter(new Date().getTime())}`
      });
    }
  }
};
</script>
<style scoped>
.chain {
  position: relative;
}

.chain >>> td.chain-module {
  /* background-color: rgba(0, 135, 237, 0.1); */
  /* font-weight: bolder; */
}
.chain >>> td.operating .cell {
  display: flex;
  align-items: stretch;
  justify-content: space-around;
}
.chain >>> td.operating .cell > span {
  cursor: pointer;
  flex: 1 1 50%;
}
.chain >>> td.operating .cell > span:hover {
  color: #1991eb;
}
.chain >>> .circle {
  display: inline-block;
  position: relative;
  left: 5px;
}
.chain >>> .circle::before {
  display: inline-block;
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  position: relative;
  top: -1px;
  left: -5px;
  background-color: gainsboro;
}
.chain >>> .red::before {
  background-color: #f2303a;
}
.chain >>> .green::before {
  background-color: #1bce6e;
}
</style>