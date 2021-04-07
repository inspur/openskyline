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
      <el-table-column v-if="columnsChecked.indexOf('name') >= 0" :label="$t('lang.name')" prop="name" min-width="100">
      </el-table-column>
       <el-table-column v-if="columnsChecked.indexOf('uuid') >= 0" :label="'UUID'" prop="uuid" min-width="100">
      </el-table-column>
      <el-table-column v-if="columnsChecked.indexOf('mode') >= 0" :label="$t('calcStorLang.mode')" prop="mode" min-width="120">
      </el-table-column>
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
    <create-port-group v-if="portgroupFlag" :phyUuid="phyUuid" :phyStatus="phyStatus" :portEntity="portEntity" :operateType="operateType" @phyPort="phyPort" @onRefresh="onRefresh"></create-port-group>
  </div>
</template>
<script>
import CreatePortGroup from './CreatePortGroup';
export default {
  name: 'DomainManagement',
  props: ['phyDetailUuid', 'phyStatus'],
  components: { CreatePortGroup },
  data() {
    return {
      formInline: '',
      totalData: [],
      portMaps: new Map(),
      currentPage: 1,
      showBorder: true,
      portgroupFlag: false,
      operateType: 1,
      portEntity: '',
      columns: [{
        prop:"address",
        label:Vue.t('calcStorLang.mac')
      }, {
        prop:"name",
        label:Vue.t('lang.name')
      }, {
        prop:"uuid",
        label:"UUID"
      }, {
        prop:"mode",
        label:Vue.t('calcStorLang.mode')
      }],
      loading: true,
      reloadTblFlag: false,
      phyUuid: this.phyDetailUuid,
      columnsChecked: ["address", "name", "uuid", "mode"],
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
          this.portgroupFlag = true;
        }.bind(this)
      }, {
        icon: "fa-pencil-square-o",
        name: Vue.t('lang.edit'),
        showflg: true,
        enable(rowData) {
          return true;
        },
        handler: function(selectRows) {
          let row = selectRows[0];
          this.portEntity = row;
          this.operateType = 2;
          this.portgroupFlag = true;
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
                url: 'api/ironic/v1/portgroups/{uuid}',
                params: selectRows,
                headers: {
                  'x-openstack-ironic-api-version': 1.23
                },
                log: {
                  description: {
                    en: "Delete portgroups",
                    zh_cn: "裸机" + self.$route.query.name + "删除端口组，名称"
                  },
                  key: "name",
                  target: Vue.logTarget.bareMachine
               }
              }).then((data) => {
                self.loading = true;
                // for (var r = 0; r < selectRows.length; r++) {
                //   var row = selectRows[r];
                //   var phy = self.portMaps.get(row.uuid);
                //   phy['status'] = "BUSY";
                // }
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
          url: 'api/ironic/v1/portgroups/detail?node=' + self.phyDetailUuid
        });
        // var list = result['portgroups'];
        // if (list != null) {
        //   for (let e = 0; e < list.length; e++) {
        //     var obj = list[e];
        //     self.portMaps.set(obj.uuid, obj);
        //   }
        // }
        self.totalData = result['portgroups'];
      } catch (res) {
        // self.loading = false;
      }
    },
    phyPort() {
      this.portgroupFlag = false;
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
