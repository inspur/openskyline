<template>
  <div v-if="roleType === '0' || roleType === '2'" class="monitoring-setting">
    <icos-page-header :title="$t('base.monitoringSetting')" :show-back="false" @back="function(){}" :show-bottom-border="false" />
    <div v-if="!settingFlag && !addFlag">
      <div class="module-background-color module-padding isolation-belt header">
        <span class="filter-name">{{$t("monitor.statisticsByResource")}}：</span>
        <icos-checkbox-group :options="options" :radio="1" @change="change"></icos-checkbox-group>

        <el-form :inline="true" :model="formModel" :rules="rules" ref="form" style="margin-top: 25px;">
          <el-form-item :label="$t('monitor.GROUP_NAME')+'：'">
            <el-input v-model="formModel.templateName"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="queryClick"
              size="small"
              class="button-query"
            >{{$t('base.query')}}</el-button>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="addClick"
              size="small"
              class="button-query"
            >{{$t('base.addTo')}}</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="module-background-color module-padding body">
        <el-table
          ref="deTable"
          :data="tableData"
          v-loading="loading"
          :element-loading-text="$t('base.loadingData')"
          highlight-current-row
          style="width: 100%"
          row-key="resource_id"
          @row-click="rowClick"
          @selection-change="selectionChange"
        >
          <el-table-column
            v-if="columnsChecked.indexOf('name') >= 0"
            prop="name"
            :label="$t('monitor.GROUP_NAME')"
            min-width="100"
          >
            <template slot-scope="scope">
              <el-button type="text" @click="editClick(scope)" size="small">{{scope.row.name}}</el-button>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columnsChecked.indexOf('resource_sc_name') >= 0"
            prop="resource_sc_name"
            :label="$t('base.resouceType')"
            min-width="100"
          ></el-table-column>
          <el-table-column
            v-if="columnsChecked.indexOf('groupType') >= 0"
            prop="groupType"
            :label="$t('monitor.GROUP_TYPE')"
            min-width="100"
          ></el-table-column>
          <el-table-column
            v-if="columnsChecked.indexOf('alarm_flag') >= 0"
            prop="alarm_flag"
            align="left"
            :label="$t('monitor.alarmStatus')"
            min-width="100"
          >
            <template slot-scope="scope">
              <span
                class="circle"
                :class="scope.row.alert_flag=='0'?'red':'green'"
              >{{scope.row.alert_flag=='0'?$t('base.off'):$t('base.on')}}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-if="columnsChecked.indexOf('notice_flag') >= 0"
            prop="notice_flag"
            align="left"
            :label="$t('base.notificationStatus')"
            min-width="100"
          >
            <template slot-scope="scope">
              <span
                class="circle"
                :class="scope.row.notice_flag=='0'?'red':'green'"
              >{{scope.row.notice_flag=='0'?$t('base.off'):$t('base.on')}}</span>
            </template>
          </el-table-column>
          <el-table-column  prop="resource_count" :label="$t('monitor.RESOURCES_COUNT')">
            <!-- resource_count -->
          </el-table-column>
          <el-table-column
            v-if="columnsChecked.indexOf('operating') >= 0"
            prop="operating"
            :label="$t('base.operating')"
            min-width="100"
          >
            <template slot-scope="scope">
              <el-button type="text" @click="deleteClick(scope)" size="small" v-if="scope.row.default_flag!=1">{{$t('base.delete')}}</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-row style="position: relative">
          <el-col :span="8">
            <el-button type="text" @click="getTableData({clearSelection:1})"></el-button>
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
          <el-col :span="16">
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

    <router-view @refreshData='getTableData'></router-view>

  </div>
</template>
<script>
import { utils } from "../public/utils";
import IcosCheckboxGroup from "../public/components/IcosCheckboxGroup";

export default {
  name: "monitoringSet",
  data() {
    return {
      dark: Vue.cookie.get("theme") + "" == "dark",
      options: [],
      roleType: Vue.roleType + "",
      formModel: { name: "", templateName: '', ip: "" },
      rules: {
        ip: {
          message: Vue.t("monitor.IP_VALIDATOR_MESSAGE"),
          type: "allip"
        }
      },
      settingFlag: this.$router.currentRoute.name === "setting-detail",
      addFlag: this.$router.currentRoute.name === "add-detail",
      centerId: "",
      tableData: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      columns: [
        {
          prop: "name",
          label: Vue.t("monitor.GROUP_NAME")
        },
        {
          prop: "resource_sc_name",
          label: Vue.t("base.resouceType")
        },
        {
          prop: "groupType",
          label: Vue.t("monitor.GROUP_TYPE")
        },
        {
          prop: "alarm_flag",
          label: Vue.t("monitor.alarmStatus")
        },
        {
          prop: "notice_flag",
          label: Vue.t("base.notificationStatus")
        },
        {
          prop: "operating",
          label: Vue.t("base.operating")
        }
      ],
      columnsChecked: [
        "name",
        "resource_sc_name",
        "groupType",
        "resource_address",
        "collect_flag",
        "alarm_flag",
        "notice_flag",
        'operating'
      ]
    };
  },
  watch: {
    $route(to, from) {
      this.settingFlag = this.$route.name === "setting-detail";
      this.addFlag = this.$route.name === "add-detail";
    }
  },
  computed: {
    classId() {
      let subclass = [];
      this.options.forEach(v => {
        v.select === 1 && subclass.push(v.scid);
      });
      return subclass.join(utils.separator);
    }
  },
  mounted() {
    this.getSubData();
  },
  methods: {
    change(v) {
      this.settingFlag = false;
      this.addFlag = false;
      this.getTableData({ clearSelection: 1 });
    },
    addClick(v) {
      this.gotoAdd(v);
    },
    queryClick(e) {
      let t = e.target;

      this.$refs["form"].validate(v => {
        if (v) {
          this.change();
        }
      });
    },
    async editClick(v) {
      this.gotoSetting(v);
    },
    async deleteClick(v = {}) {
      this.$confirm('删除分组后，其中的资源会使用默认分组的设置。确认删除吗？', Vue.t('base.prompt'), {
        confirmButtonText: Vue.t('base.confirm'),
        cancelButtonText: Vue.t('base.cancel'),
        type: 'warning'
      }).then(() => {
        this.deleteRow(v);
      }).catch(() => {});
    },
    async deleteRow(v) {
      let id = v.row ? v.row.id : '';
      let name = v.row ? v.row.name : '';
      let ret = await this.$ajax({
        type: "delete",
        headers: {
          FORWARD_UNION: this.centerId
        },
        url: `api/pluto/v1/template/${id}`,
        log: {
          description: {
            en: '',
            zh_cn: '删除组，名称为：' + name
          },
          target: Vue.logTarget.monitor
        }
      });

      this.getTableData({ clearSelection: 1 });

      if (String(ret.status).toLowerCase() === 'error') {
        this.$notify({
          message: '认证失败',
          type: "warning"
        });
      } else {
      }
    },
    async getSubData(v) {
      let me = this;
      let ret = await me.$ajax({
        type: "get",
        headers: {
          FORWARD_UNION: me.centerId
        },
        url: "api/pluto/v1/classes/rc/sub"
      });
      let data = ret.data;
      if (this.roleType === "2") {
        const projectAdminResource = [
          "openstack_instance",
          "cloud_physical_machine"
        ];
        data = data.filter(item =>
          projectAdminResource.includes(item.resource_sc_name_en)
        );
      }
      let cn = Vue.config.lang == "zh-cn";
      data.forEach(item => {
        let select = 0;
        if (this.roleType === "2") {
          if (item.resource_sc_id === "vm") {
            select = 1;
          }
        } else {
          if (item.resource_sc_id === "hs") {
            select = 1;
          }
        }
        me.options.push({
          name: cn ? item.resource_sc_name_cn : item.resource_sc_name_en,
          select: select,
          scid: item.resource_sc_id
        });
      });
      this.getTableData({ clearSelection: 1 });
    },
    async getTableData(v = {}) {
      if (v.page) {
        this.currentPage = v.page;
      }
      let param = {
        subclass_id: this.classId,
        page_size: this.pageSize,
        current_page: this.currentPage
      };
      if (this.formModel.name != "") {
        param.resource_name = this.formModel.name;
      }
      if (this.formModel.templateName != "") {
        param.template_name = this.formModel.templateName;
      }
      if (this.formModel.ip != "") {
        param.resource_address = this.formModel.ip;
      }
      if (this.roleType === "2") {
        param.project_id = this.$cookie.get("pid");
      }
      this.loading = true;
      let ret = await this.$ajax({
        type: "get",
        headers: {
          FORWARD_UNION: this.centerId
        },
        url: "api/pluto/v1/template?" + $.param(param)
      }) || {};
      this.loading = false;
      let r = ret.result || [];
       r.forEach(item => {
        item.resource_sc_name = Vue.config.lang == "zh-cn" ? item.resource_sc_name_cn : item.resource_sc_name_en;
        item.groupType = item.default_flag == '1' ? Vue.t('monitor.SYSTEM_DEFAULT') : Vue.t('monitor.CUSTOM');
      });
      this.tableData = r;
      this.total = ret.total;
      if (v && v.clearSelection) {
        this.$nextTick(() => {
          if (this.$refs.deTable && this.$refs.deTable.clearSelection) {
            this.$refs.deTable.clearSelection();
          }
        });
      }
    },
    rowClick(row) {
      this.$refs.deTable.toggleRowSelection(row);
    },
    selectionChange(val) {
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.getTableData();
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.getTableData();
    },
    gotoSetting(v) {
      this.settingFlag = true;
      this.$router.push({
        name: "setting-detail",
        params: { selectedRow: v.row, classID: this.classId },
        query: { test: 'test' }
      });
    },
    gotoAdd(v) {
      this.addFlag = true;
      this.$router.push({
        name: "add-detail",
        params: { classID: this.classId },
        query: { test: 'test' }
      });
    }
  },
  components: {
    IcosCheckboxGroup
  }
};
</script>
<style scoped>
.monitoring-setting >>> .title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
}
.monitoring-setting p span {
  display: inline-block;
}
.monitoring-setting >>> .content {
  margin-right: 150px;
}
.monitoring-setting >>> .operation-panel button {
  padding-top: 5px;
  padding-bottom: 5px;
}
.monitoring-setting >>> .margin-tb5 {
  margin-bottom: 10px;
}
</style>

