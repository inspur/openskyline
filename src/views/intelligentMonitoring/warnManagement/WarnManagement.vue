<template>
  <div class="resource-view">
    <icos-page-header :title="$t('base.warnManagement')" :show-back="false" @back="function(){}" :show-bottom-border="false" />
    <div v-if="!detail">
      <div
        class="module-background-color module-padding filter isolation-belt header"
        :class="{ 'icos-dark': dark }"
      >
        <span class="filter-name">{{ $t("monitor.statisticsByResource") }}：</span>
        <icos-checkbox-group :options="resourceOptions" @change="change"></icos-checkbox-group>

        <div class="horizontal-line"></div>

        <span class="filter-name">{{ $t("monitor.statisticsByAlarm") }}：</span>
        <icos-checkbox-group :options="levelOptions" @change="change"></icos-checkbox-group>

        <div class="horizontal-line"></div>

        <!-- <icos-input-query :options="formModel" @change="inputQueryChange"></icos-input-query> -->

        <el-form
          :inline="true"
          :model="formModel"
          :rules="rules"
          ref="form"
          style="margin-top: 25px;"
        >
          <el-form-item :label="$t('base.resourceName') + '：'">
            <el-input v-model="formModel.name"></el-input>
          </el-form-item>

          <el-form-item :label="$t('base.ipAddress') + '：'" prop="ip">
            <el-input v-model="formModel.ip" @change="ipChange"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="queryClick"
              size="small"
              class="button-query"
            >{{ $t("base.query") }}</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="module-background-color module-padding content body">
        <operation-panel
          class="margin-tb5 operation-panel"
          :select-rows="multipleSelection"
          :operation-menus="operationMenus"
        ></operation-panel>

        <el-table
          ref="deTable"
          :data="tableData"
          v-loading="loading"
          :element-loading-text="$t('base.loadingData')"
          highlight-current-row
          row-key="resource_id"
          @row-click="rowClick"
          @selection-change="handleSelectionChange"
          @sort-change="tableSortChange"
          style="width: 100%;"
        >
          <el-table-column reserve-selection type="selection" width="55" align="center"></el-table-column>
          <el-table-column
            v-if="columnsChecked.indexOf('resource_name') >= 0"
            prop="resource_name"
            :label="$t('base.resourceName')"
            min-width="60"
          >
            <template slot-scope="scope">
              <el-button
                @click="sourceNameClick(scope.row)"
                type="text"
                size="small"
              >{{ scope.row.resource_name }}</el-button>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columnsChecked.indexOf('resource_address') >= 0"
            prop="resource_address"
            :label="$t('base.ipAddress')"
            min-width="60"
          >
            <template slot-scope="scope">
              <span>
                {{
                scope.row.resource_address == "unknow"
                ? $t("monitor.unknow")
                : scope.row.resource_address
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columnsChecked.indexOf('resource_sc_name') >= 0"
            prop="resource_sc_name"
            :label="$t('base.resouceType')"
            min-width="60"
          ></el-table-column>
          <el-table-column
            v-if="columnsChecked.indexOf('alert_status') >= 0"
            prop="alert_status"
            :label="$t('monitor.alarmLevel')"
            align="left"
            min-width="60"
          >
            <template slot-scope="scope">
              <span class="circle" :class="scope.row.level.sign">
                {{
                scope.row.level.name
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columnsChecked.indexOf('insert_time') >= 0"
            prop="insert_time"
            :label="$t('monitor.alarmTime')"
            sortable="true"
            min-width="70"
          >
            <template slot-scope="scope">
              <span>
                {{
                scope.row.insert_time
                ? scope.row.insert_time
                .replace("T", " ")
                .replace(".000000", "")
                : "-"
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columnsChecked.indexOf('keep_time') >= 0"
            prop="keep_time"
            :label="$t('monitor.alarmDuration')"
            min-width="60"
          >
            <template slot-scope="scope">
              <span>
                {{
                renderKeepTimeFun(scope.row.insert_time, scope.row.update_time)
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columnsChecked.indexOf('alert_content') >= 0"
            :show-overflow-tooltip="false"
            :label="$t('monitor.alarmDetail')"
            min-width="100"
          >
            <template slot-scope="scope">
              <div
                style="max-height: 120px; overflow-y: auto;"
                v-html="
                  scope.row.alert_content
                    ? scope.row.alert_content.replace(/;/g, '&lt;br&gt;')
                    : '-'
                "
              ></div>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columnsChecked.indexOf('tips') >= 0"
            :show-overflow-tooltip="false"
            :label="$t('monitor.TIPS')"
            min-width="100"
          >
            <template slot-scope="scope">
              <div
                style="max-height: 120px; overflow-y: auto;"
                v-html="scope.row.all_info ? scope.row.all_info.replace(/;/g, '&lt;br&gt;') : '-'"
              ></div>
            </template>
          </el-table-column>

          <!-- <el-table-column
          v-if="columnsChecked.indexOf('scope') >= 0"
          :label="$t('monitor.SCOPE_OF_INFLUENCE')"
          :show-overflow-tooltip="false"
          min-width="100"
        >
          <template slot-scope="scope">
            <div>{{scope.row.scope}}</div>
          </template>
          </el-table-column>-->

          <el-table-column
            v-if="columnsChecked.indexOf('confirm') >= 0"
            prop="confirm"
            :label="$t('monitor.confirmStatus')"
            min-width="60"
          >
            <template slot-scope="scope">
              <span class="circle" :class="scope.row.confirm === '1' ? 'green' : 'red'">
                {{
                scope.row.confirm === "1"
                ? $t("monitor.confirmed")
                : $t("monitor.unconfirmed")
                }}
              </span>
            </template>
          </el-table-column>
        </el-table>
        <div style="margin: 10px 0; position: relative;">
          <el-row>
            <el-col :span="5">
              <el-popover placement="right" trigger="click">
                <el-checkbox-group class="vertical" v-model="columnsChecked">
                  <el-checkbox
                    class="item"
                    v-for="item in columns"
                    :label="item.prop"
                    :key="item.prop"
                  >{{ item.label }}</el-checkbox>
                </el-checkbox-group>
                <div slot="reference" style="display: inline-block;">
                  <el-tag>{{ $t("lang.selectCloumn") }}</el-tag>
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
    </div>

    <router-view></router-view>
  </div>
</template>
<script>
import { operateRows, formatSecond } from "../public/public.js";
import { utils } from "../public/utils";
import IcosCheckboxGroup from "../public/components/IcosCheckboxGroup";

export default {
  name: "ResourceView",
  watch: {
    $route(to, from) {
      this.detail = this.$route.name === "management-detail";
    }
  },
  props: {
    centerId: String
  },
  data() {
    let level = this.$route.params.level || [];
    level = level.split("|");
    let levelOptions = Array.from(
      [
        { value: "LOST", name: Vue.t("base.lostAlarm") },
        { value: "CRITICAL", name: Vue.t("base.critAlarm") },
        { value: "WARNING", name: Vue.t("base.slightAlarm") },
        {
          value: "OK_RECOVERY",
          name: Vue.t("base.troubleRepair")
        },
        { value: "OK", name: Vue.t("base.normal") }
      ],
      (v) => {
        v.select = level.includes(v.value);
        return v;
      }
    );

    return {
      detail: this.$router.currentRoute.name === "management-detail",
      rules: {
        ip: {
          message: Vue.t("monitor.IP_VALIDATOR_MESSAGE"),
          type: "allip"
        }
      },
      isCN: Vue.config.lang === "zh-cn",
      dark: Vue.cookie.get("theme") + "" == "dark",
      resourceOptions: [],
      levelOptions: levelOptions,
      // xxx: [
      //   { value: "", name: Vue.t("monitor.last10Min") },
      //   { value: "", name: Vue.t("monitor.last1Hour") },
      //   { value: "", name: Vue.t("monitor.last1Day") },
      //   { value: "", name: Vue.t("monitor.last1Week") },
      //   { value: "", name: Vue.t("monitor.last1Mon") }
      // ],
      formModel: { name: "", ip: "" },
      roleType: Vue.roleType + "",
      orderType: "", //desc/asc     降序/升序
      timeoutID: 0,
      sourceTypeFilterFlg: false,
      // sourceTypeArr: [],
      tableData: [],
      multipleSelection: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      columns: [
        {
          prop: "resource_name",
          label: Vue.t("base.resourceName")
        },
        {
          prop: "resource_address",
          label: Vue.t("base.ipAddress")
        },
        {
          prop: "resource_sc_name",
          label: Vue.t("base.resouceType")
        },
        {
          prop: "alert_status",
          label: Vue.t("monitor.alarmLevel")
        },
        {
          prop: "insert_time",
          label: Vue.t("monitor.alarmTime")
        },
        {
          prop: "keep_time",
          label: Vue.t("monitor.alarmDuration")
        },
        {
          prop: "alert_content",
          label: Vue.t("monitor.alarmDetail")
        },
        {
          prop: "tips",
          label: Vue.t("monitor.TIPS")
        },
        // {
        //   prop: "scope",
        //   label: Vue.t("monitor.SCOPE_OF_INFLUENCE")
        // },
        {
          prop: "confirm",
          label: Vue.t("monitor.confirmStatus")
        }
      ],
      columnsChecked: [
        "resource_name",
        "resource_address",
        "resource_sc_name",
        "alert_status",
        "insert_time",
        "keep_time",
        "alert_content",
        "scope",
        "tips",
        "confirm"
      ],
      operationMenus: [
        {
          icon: "fa-check",
          name: Vue.t("monitor.confirmAlarm"),
          showflg: true,
          multi: true,
          enable: function (obj) {
            return obj.confirm === "0";
          },
          handler: function (rows) {
            let me = this;
            let loadData = me.loadData.bind(me, { clearSelection: 1 });
            operateRows.bind(me)(rows, 0, loadData, this.centerId);
          }.bind(this)
        },
        {
          icon: "fa-minus-circle",
          name: Vue.t("monitor.cancelConfirmAlarm"),
          showflg: true,
          multi: true,
          enable: function (obj) {
            return obj.confirm == 1;
          },
          handler: function (rows) {
            let me = this;
            let loadData = me.loadData.bind(me, { clearSelection: 1 });
            operateRows.bind(me)(rows, 1, loadData, this.centerId);
          }.bind(this)
        }
      ],
      ipError: 0
    };
  },
  beforeDestroy() {
    clearTimeout(this.timeoutID);
  },
  mounted() {
    this.loadSourceTypeData();
  },
  methods: {
    change(v = {}) {
      this.loadData({ clearSelection: 1, ...v });
    },
    ipChange(v) {
      this.$refs["form"].validate((v) => {
        this.ipError = !v;
      });
    },
    queryClick(e) {
      this.$refs["form"].validate((v) => {
        this.ipError = !v;
        if (!this.ipError) {
          this.change({ from: "query" });
        }
      });
    },
    loadSourceTypeData() {
      let me = this;
      this.sourceTypeFilterFlg = true;
      this.$ajax({
        type: "get",
        headers: {
          FORWARD_UNION: me.centerId
        },
        url: "api/pluto/v1/subclasses",
        successFun(rtn) {
          if (me.roleType === "2") {
            const projectAdminResource = [
              "openstack_instance",
              "cloud_physical_machine"
            ];
            rtn.data = rtn.data.filter((item) =>
              projectAdminResource.includes(item.resource_sc_name_en)
            );
          }

          me.resourceOptions = [];
          rtn.data.forEach(function (item, index) {
            let data = JSON.parse(JSON.stringify(item));
            data.name = me.isCN
              ? item.resource_sc_name_cn
              : item.resource_sc_name_en;
            data.type = "source";
            data.value = item.resource_sc_id;
            data.select = 1;
            me.resourceOptions.push(data);
          });

          me.loadData({ clearSelection: 1 });
        }
      });
    },
    loadData(v = {}) {
      let me = this;

      if (this.ipError) {
        return;
      }

      let param = {
        resource_name: me.formModel.name,
        resource_type: "sc",
        page_num: this.currentPage,
        page_size: this.pageSize
      };

      let levels = Array.from(
        me.levelOptions.filter((v) => v.select),
        (v) => v.value
      ).join(utils.separator);
      if (levels) {
        param.level = levels;
      }

      let ip = me.formModel.ip;
      if (ip) {
        param.resource_ip = ip;
      } else {
        // param.resource_ip = "";
      }
      if (this.orderType) {
        param.order_field = "alert_time";
        param.order_type = this.orderType;
      }
      let typeIDs = [];
      me.resourceOptions.forEach((v) => {
        v.select === 1 && typeIDs.push(v.value);
      });
      typeIDs = typeIDs.join(utils.separator);
      if (typeIDs) {
        param.type_id = typeIDs;
      } else {
        param.resource_type = "";
      }
      if (this.roleType === "2") {
        param.project_id = this.$cookie.get("pid");
      }
      this.loading = v.from !== "timeout";
      this.$ajax({
        type: "get",
        headers: {
          FORWARD_UNION: this.centerId
        },
        url: "api/pluto/v1/alert/all_resources?" + $.param(param),
        successFun(rtn) {
          let td = [...rtn.alerts];
          td.forEach((i) => {
            i.resource_name = me.isCN ? i.resource_name_cn : i.resource_name_en;
            i.resource_sc_name = me.isCN
              ? i.resource_sc_name_cn
              : i.resource_sc_name_en;
            i.alert_content = me.isCN ? i.alert_content_cn : i.alert_content_en;

            i.all_info =
            Vue.config.lang == "zh-cn"
              ? i.all_info_cn
              : i.all_info_en;

            i.level = {
              sign: i["alert_status"],
              name: utils.getLevel(i["alert_status"])
            };
            i["resource_address"] = i["resource_address"] || "-";
          });
          me.tableData = td;
          me.total = rtn.total;
          me.loading = false;
          if (v.clearSelection) {
            me.$nextTick(() => {
              me.$refs.deTable &&
                me.$refs.deTable.clearSelection &&
                me.$refs.deTable.clearSelection();
            });
          }
        },
        errFun() {
          me.loading = false;
        }
      });

      clearTimeout(me.timeoutID);
      me.timeoutID = setTimeout(() => {
        me.loadData({ from: "timeout" });
      }, 10000);
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.loadData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.loadData();
    },
    rowClick(row, event, column) {
      if (column && column.property === "resource_name") {
        return;
      }
      this.$refs.deTable.toggleRowSelection(row);
    },
    sourceNameClick(row) {
      this.detail = true;
      this.$router.push({
        name: "management-detail",
        // params: { name: v.name },
        query: { id: row.resource_id, name: row.resource_name }
      });

      clearTimeout(this.timeoutID);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    tableSortChange(v) {
      if (v.prop === "insert_time") {
        if (v.order === "ascending") {
          this.orderType = "asc";
        } else if (v.order === "descending") {
          this.orderType = "desc";
        }
      }
      this.loadData({ clearSelection: 1 });
    },
    renderKeepTimeFun(inserTime, updateTime) {
      if (inserTime && updateTime) {
        inserTime = convertTime(
          inserTime.replace("T", " ").replace(".000000", "")
        );
        updateTime = convertTime(
          updateTime.replace("T", " ").replace(".000000", "")
        );
        return formatSecond((updateTime - inserTime) / 1000);
      } else {
        return "-";
      }
      function convertTime(time) {
        let arr = time.split(" ");
        let darr = arr[0].split("-");
        let tarr = arr[1].split(":");
        return new Date(
          darr[0],
          darr[1],
          darr[2],
          tarr[0],
          tarr[1],
          tarr[2]
        ).getTime();
      }
    }
  },
  components: {
    IcosCheckboxGroup
  }
};
</script>

<style scoped>
.resource-view .content {
  padding-top: 15px;
  padding-bottom: 15px;
}
.resource-view .filter-name {
  color: rgba(0, 0, 0, 0.85);
}
.resource-view .filter .filter-radio-group {
  margin-bottom: 24px;
}
.resource-view >>> .el-radio-button__inner:hover {
  color: #fff;
  background-color: #0087ed;
  border-color: #0087ed;
}
.resource-view >>> .el-radio-button__inner {
  padding: 4px 10px !important;
  border-radius: 4px !important;
  border: none;
  border-left: none;
  background: none;
}
.resource-view >>> .operation-panel button {
  padding-top: 5px;
  padding-bottom: 5px;
}
.resource-view .horizontal-line {
  border-bottom: 1px dashed #ddd;
  margin: 16px 0;
}
.resource-view >>> .el-radio-button {
  margin-right: 15px;
}
.icos-dark .filter-name {
  color: unset;
}
</style>
