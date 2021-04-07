<template>
  <div>
    <div class="operation-panel" style="text-align:left">
      <operation-panel :select-rows="multipleSelection" :operation-menus="operationMenus">
      </operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table ref="acTable" :data="tableData" highlight-current-row stripe border style="width: 100%" row-key="id" @current-change="handleSelectionChange" :default-sort="{prop: 'name', order: 'ascending'}">
      <!-- <el-table-column reserve-selection type="selection" width="55">
      </el-table-column> -->
      <el-table-column v-if="columnsChecked.indexOf('address') >= 0" :label="$t('calcStorLang.mac')" prop="address" min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('protId') >= 0" :label="$t('lang.port') + '_id'" prop="local_link_connection" min-width="100">
        <template slot-scope="scope">
          <span v-html="portRender(scope.row.created_at, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('switchId') >= 0" :label="$t('calcStorLang.switch') + '_id'" prop="local_link_connection" min-width="100">
        <template slot-scope="scope">
          <span v-html="switchRender(scope.row.created_at, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('switchInfo') >= 0" :label="$t('calcStorLang.switch')+'_info'" prop="local_link_connection" min-width="100">
        <template slot-scope="scope">
          <span v-html="switchInfoRender(scope.row.created_at, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('pxe_enabled') >= 0" :label="$t('calcStorLang.isPxe')" prop="pxe_enabled" min-width="100">
        <template slot-scope="scope">
          <span v-if="scope.row.pxe_enabled">{{$t("base.yes")}}</span>
          <span v-else>{{$t("base.no")}}</span>
        </template>
      </el-table-column>
       <el-table-column v-if="columnsChecked.indexOf('portgroup_uuid') >= 0" :label="$t('calcStorLang.portgroup')" prop="portgroup_name" min-width="100">
        <!-- <template slot-scope="scope">
          <span v-if="scope.row.portgroup_uuid">{{$t("base.yes")}}</span>
          <span v-else>{{$t("base.no")}}</span>
        </template> -->
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('extra') >= 0" :label="$t('calcStorLang.portNetworkType')" prop="extra" min-width="120">
        <template slot-scope="scope">
          <span v-html="netTypeRender(scope.row.extra.net_type, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('created') >= 0" :label="$t('calcStorLang.createTime')" prop="created_at" min-width="120">
        <template slot-scope="scope">
          <span v-html="dateRender(scope.row.created_at, scope.row)"></span>
        </template>
      </el-table-column>
      <!-- <el-table-column v-if="columnsChecked.indexOf('os') >= 0" prop="power_state" label="电源状态" min-width="50" sortable align="left">
        <template slot-scope="scope">
          <span v-html="statusRender(scope.row.maintenance, scope.row)"></span>
        </template>
      </el-table-column> -->
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefresh">
          </el-button>
          <span>{{$t('lang.currentSelected') + multipleSelection.length + " " + $tc('lang.item', multipleSelection.length)}}</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="columnsChecked">
              <el-checkbox class="item" v-for="(item, index) in columns" :label="item.prop" :key="item.prop">{{item.label}}
              </el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="totalData" @getCurrentData="getCurrentData"></page>
        </el-col>
      </el-row>
    </div>
    <create-port v-if="portFlag" :phyUuid="phyUuid" :phyStatus="phyStatus" :portEntity="portEntity" :operateType="operateType" @phyPort="phyPort" @onRefresh="onRefresh"></create-port>
  </div>
</template>
<script>
import CreatePort from './CreatePort';
export default {
  name: 'DomainManagement',
  props: ['phyDetailUuid', 'phyStatus'],
  components: { CreatePort },
  data() {
    return {
      formInline: '',
      totalData: [],
      portMaps: new Map(),
      currentPage: 1,
      showBorder: true,
      portFlag: false,
      operateType: 1,
      portEntity: '',
      columns: [{
        prop:"address",
        label:Vue.t('calcStorLang.mac')
      }, {
        prop:"protId",
        label:Vue.t('lang.port') + '_id'
      }, {
        prop:"switchId",
        label:Vue.t('calcStorLang.switch') + '_id'
      }, {
        prop:"switchInfo",
        label:Vue.t('calcStorLang.switch') + '_info'
      }, {
        prop:"pxe_enabled",
        label:Vue.t('calcStorLang.isPxe')
      }, {
        prop:"portgroup_uuid",
        label:Vue.t('calcStorLang.portgroup')
      }, {
        prop:"extra",
        label:Vue.t('calcStorLang.portNetworkType')
      }, {
        prop:"created",
        label:Vue.t('calcStorLang.createTime')
      }],
      loading: true,
      reloadTblFlag: false,
      phyUuid: this.phyDetailUuid,
      columnsChecked: ["address", "protId", "switchId", "switchInfo", "created", "pxe_enabled", "extra", "portgroup_uuid"],
      tableData: [],
      multipleSelection: [],
      operationMenus: [{
        icon: "fa-plus",
        name: Vue.t('calcStorLang.create'),
        showflg: true,
        readOnly: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          this.operateType = 1;
          this.portFlag = true;
        }.bind(this)
      }, {
        icon: "fa-pencil-square-o",
        name: Vue.t('lang.edit'),
        showflg: true,
        enable: function (rowData) {
          if (this.phyStatus ==="enroll" || this.phyStatus === "manageable") {
            return true;
          } else {
            return false;
          }
        }.bind(this),
        handler: function(selectRows) {
          let row = selectRows[0];
          this.portEntity = row;
          this.operateType = 2;
          this.portFlag = true;
        }.bind(this)
      }, {
        icon: "fa-times",
        name: Vue.t('lang.delete'),
        showflg: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          var self = this;
          self.$prompt(Vue.t("lang.inputYesToContinue"), Vue.t("calcStorLang.confirm"), {
            confirmButtonText: Vue.t("calcStorLang.confirm"),
            cancelButtonText: Vue.t("lang.cancel"),
            inputPattern: /^YES$|^NO$/i,
            inputValue: "NO",
            customClass: "promptConfirmDel",
            inputErrorMessage: Vue.t("lang.onlyAcceptYesOrNo")
          }).then(async({ value }) => {
            if ("yes" == value.toLowerCase()) {
              self.$sequence({
                type: 'delete',
                url: 'api/ironic/v1/ports/{uuid}',
                params: selectRows,
                log: {
                  description: {
                    en: "Delete ports",
                    zh_cn: "裸机" + self.$route.query.name + "删除端口，MAC地址"
                  },
                  key: "address",
                  target: Vue.logTarget.bareMachine
               }
              }).then((data) => {
                self.loading = true;
                for (var r = 0; r < selectRows.length; r++) {
                  var row = selectRows[r];
                  var phy = self.portMaps.get(row.uuid);
                  phy['status'] = "BUSY";
                }
                self.$message( Vue.t("lang.sendDeleteSuccess"));
                self.$refs.acTable.clearSelection();
                self.multipleSelection = [];
                self.currentPage = 1;
                setTimeout(function() {
                  self.getDataList({
                    page: 1
                  });
                  self.loading = false;
                }, 3000);
              }).catch((err) => {});
            }
          }).catch(() => {
            //取消
          });
        }.bind(this)
      }]
    };
  },
  computed: {},
  mounted() {
    var self = this;
    self.getDataList();
  },
  /*watch: {
    columnsChecked: {
      handler: function(rows, oldVal) {
        this.columnsChecked = rows;
      },
      deep: true
    }
  },*/
  methods: {
    async getDataList() {
      var self = this;
      try {
        let result = await self.$ajax({
          type: 'get',
          headers: {
            'x-openstack-ironic-api-version': 1.34
          },
          url: 'api/ironic/v1/inspurports/detail?node=' + self.phyDetailUuid
        });
        var list = result['ports'];
        if (list != null) {
          for (let e = 0; e < list.length; e++) {
            var obj = list[e];
            self.portMaps.set(obj.uuid, obj);
          }
        }
        self.totalData = result['ports'];
      } catch (res) {
        // self.loading = false;
      }
    },
    phyPort() {
      this.portFlag = false;
    },
    getCurrentData(param) {
      this.tableData = param;
    },
    handleSelectionChange(val) {
      if (val != null) {
        var list = [];
        list.push(val);
        this.multipleSelection = list;
      }
    },
    onRefresh() {
      this.multipleSelection = [];
      this.getDataList();
    },
    portRender(value, rowData) {
      var result = rowData['local_link_connection']['port_id'] || '-';
      return result;
    },
    switchRender(value, rowData) {
      var result = rowData['local_link_connection']['switch_id'] || '-';
      return result;
    },
    switchInfoRender(value, rowData) {
      var result = rowData['local_link_connection']['switch_info'] || '-';
      return result;
    },
    dateRender(value, rowData) {
      var self = this;
      var time = Date.parse(new Date(value));
      return self.formatTimeStamp(time, "yyyy-MM-dd HH:mm:ss");
    },
    netTypeRender(value, rowData) {
      if (value === "bm_service") {
        return Vue.t("calcStorLang.bmService");
      } else if (value === "bm_manage") {
        return Vue.t("calcStorLang.bmManage");
      } else if (value === "bm_storage") {
        return Vue.t("calcStorLang.bmStorage");
      }
    },
    formatTimeStamp(timeStamp, fmt) {
      if (!timeStamp) {
        return "";
      }
      var date = new Date();
      date.setTime(timeStamp);
      var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时
        "H+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
      };
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
      }
      if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : ""));
      }
      for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
      }
      return fmt;
    }
  }
}

</script>
<style scoped>


</style>
