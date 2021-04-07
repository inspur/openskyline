<template>
  <div>
    <span style="font-size:large">{{ $t('calcStorLang.hosthaList') }} - {{ this.segmentName }}</span>
    <div class="divider clearfix"></div>
    <div class="operation-panel">
      <operation-panel :select-rows="multipleHostsSelection" :operation-menus="operationHostsMenus"></operation-panel>
    </div>
    <div class="divider clearfix"></div>
    <el-table
      ref="hostsTable"
      :data="tableHostData"
      v-loading="hostsLoading"
      stripe
      border
      highlight-current-row
      style="width: 100%"
      row-key="id"
      :default-sort="{prop: 'name'}"
      @selection-change="handleHostsSelectionChange"
    >
      <el-table-column reserve-selection type="selection" width="55" align="center"></el-table-column>
      <el-table-column
        sortable
        v-if="hostsColumnChecked.indexOf('name') >= 0"
        :label="$t('lang.name')"
        prop="name"
        min-width="50"
      ></el-table-column>
      <el-table-column
        v-if="hostsColumnChecked.indexOf('uuid') >= 0"
        label="UUID"
        prop="uuid"
        min-width="100"
      ></el-table-column>
      <el-table-column
        v-if="hostsColumnChecked.indexOf('reserved') >= 0"
        prop="reserved"
        :label="$t('calcStorLang.reserved')"
        min-width="60"
      >
        <template slot-scope="scope">
          <span v-html="truefalseRender(scope.row.reserved, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hostsColumnChecked.indexOf('type') >= 0"
        :label="$t('calcStorLang.type')"
        prop="type"
      ></el-table-column>
      <el-table-column
        v-if="hostsColumnChecked.indexOf('control_attributes') >= 0"
        :label="$t('calcStorLang.controlAttributes')"
        prop="control_attributes"
      ></el-table-column>
      <el-table-column
        v-if="hostsColumnChecked.indexOf('on_maintenance') >= 0"
        :label="$t('calcStorLang.onMaintenance')"
        prop="on_maintenance"
      >
        <template slot-scope="scope">
          <span v-html="truefalseRender(scope.row.on_maintenance, scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hostsColumnChecked.indexOf('ha_switch') >= 0"
        :label="$t('calcStorLang.haSwitch')"
        prop="on_maintenance"
      >
        <template slot-scope="scope">
          <span v-html="haSwitchRender(scope.row.on_maintenance, scope.row)"></span>
        </template>
      </el-table-column>
    </el-table>
    <div style="margin: 10px 0; position: relative">
      <el-row>
        <el-col :span="5">
          <el-button type="text" icon="fa-refresh" @click="onRefreshHost"></el-button>
          <span>{{$t('lang.currentSelected') + multipleHostsSelection.length + " " + $tc('lang.item', multipleHostsSelection.length)}}</span>
          <el-popover placement="right" trigger="click">
            <el-checkbox-group class="vertical" v-model="hostsColumnChecked">
              <el-checkbox
                class="item"
                v-for="(item, index) in hostsColumns"
                :label="item.prop"
                :key="index"
              >{{item.label}}</el-checkbox>
            </el-checkbox-group>
            <div slot="reference" class="name-wrapper">
              <el-tag>{{$t('lang.selectCloumn')}}</el-tag>
            </div>
          </el-popover>
        </el-col>
        <el-col :span="19">
          <page :totalData="hosts" @getCurrentData="getCurrentData"></page>
        </el-col>
      </el-row>
    </div>

    <edit-host
      v-if="editHostFlag"
      ref="editHost"
      :segment_id="segmentId"
      :host_id="currentHostId"
      @handleClose="handleEditHostClose"
      @handleEditHost="getHosts()"
    />

    <batch-add-hosts
      v-if="batchAddHostsDialog.visible"
      ref="batchAddHostsDialog"
      :segment-id="batchAddHostsDialog.segmentId"
      :az-name="batchAddHostsDialog.azName"
      :added-host-names="batchAddHostsDialog.addedHostNames"
      @close="handleBatchAddHostsClose"
      @refresh="getHosts()"
    />
  </div>
</template>
<script>
import EditHost from "./EditHost";
import BatchAddHosts from './BatchAddHosts';
export default {
  name: "SegmentHosts",
  components: {
    EditHost,
    BatchAddHosts
  },
  props: ["segmentId", "segmentName"],
  data() {
    return {
      loading: false,
      az: '',
      editHostFlag: false,
      currentHostId: "",
      hostFlag: false,
      hosts: [],
      hostsLoading: false,
      showHostView: false,
      tableHostData: [],
      hostsColumns: [
        {
          prop: "name",
          label: Vue.t("lang.name")
        },
        {
          prop: "uuid",
          label: "UUID"
        },
        {
          prop: "reserved",
          label: Vue.t("calcStorLang.reserved")
        },
        {
          prop: "ha_switch",
          label: Vue.t("calcStorLang.haSwitch")
        }
      ],
      hostsColumnChecked: [
        "name",
        "uuid",
        "onMaintenance",
        "reserved",
        "ha_switch"
      ],
      multipleHostsSelection: [],
      operationHostsMenus: [
        {
          icon: "fa-plus",
          name: Vue.t("calcStorLang.addhost"),
          showflg: true,
          readOnly: true,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            this.showBatchAddHosts();
          }.bind(this)
        }, {
          icon: "fa-pencil-square-o",
          name: Vue.t("lang.edit"),
          showflg: true,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            this.editHostShow();
            this.currentHostId = selectRows[0].uuid;
            this.$nextTick(() => {
              this.$refs["editHost"].initDialog();
            });
          }.bind(this)
        }, {
          icon: "fa-times",
          name: Vue.t("lang.delete"),
          showflg: true,
          multi: true,
          enable(rowData) {
            return true;
          },
          handler: function(selectRows) {
            var self = this;
            self
              .$sequence({
                type: "delete",
                url:
                  "api/masakari/v1/segments/{failover_segment_id}/hosts/{uuid}",
                params: selectRows,
                paramKeys: ["failover_segment_id", "uuid"],
                confirmMsg: Vue.t("calcStorLang.confirmDeleteHost"),
                successMsg: Vue.t("calcStorLang.deleteSuccess"),
                log: {
                  description: {
                    en: "Remove host from HA segment",
                    zh_cn: "高可用集群移除主机"
                  },
                  key: "name",
                  target: Vue.logTarget.hostHa
                },
                successFun: function() {
                  self.getHosts();
                }
              })
              .then(data => {
                self.getHosts();
              })
              .catch(err => {
                console.log(err);
              });
          }.bind(this)
        }
      ],
      batchAddHostsDialog: {
        visible: false,
        segmentId: '',
        azName: '',
        addedHostNames: []
      }
    };
  },
  computed: {},
  mounted() {
    this.initial();
  },
  beforeRouteLeave(to, from, next) {
    next();
  },
  beforeRouteEnter(to, from, next) {
    next();
  },
  watch: {
    segmentId: {
      //immediate: false,
      handler: function() {
        this.initial();
      }
    }
  },
  methods: {
    initial() {
      this.getHosts();
      if (this.segmentName.indexOf('@') > -1) {
        this.az = this.segmentName.split('@')[0];
      }
    },
    async getHosts() {
      this.hostsLoading = true;
      this.hosts = [];
      this.$refs.hostsTable.clearSelection();
      let ret = await this.$ajax({
        type: "get",
        url: `api/masakari/v1/segments/${this.segmentId}/hosts`
      });
      this.hostsLoading = false;
      this.hosts = ret.hosts;
    },
    showBatchAddHosts() {
      this.batchAddHostsDialog.azName = this.az;
      this.batchAddHostsDialog.segmentId = this.segmentId;
      this.batchAddHostsDialog.addedHostNames = this.hosts.map(item => item.name);
      this.batchAddHostsDialog.visible = true;
    },
    handleBatchAddHostsClose() {
      this.batchAddHostsDialog.visible = false;
    },
    editHostShow() {
      this.editHostFlag = true;
    },
    handleEditHostClose() {
      this.editHostFlag = false;
    },
    handleHostsSelectionChange(val) {
      this.multipleHostsSelection = val;
    },
    getCurrentData(param) {
      this.tableHostData = param;
    },
    onRefreshHost() {
      this.getHosts();
    },
    truefalseRender(value, row) {
      if (value == "true" || value == true) {
        return Vue.t("base.yes");
      } else if (value == "false" || value == false) {
        return Vue.t("base.no");
      } else {
        return value;
      }
    },
    haSwitchRender(value, row) {
      switch (value) {
        case "true":
          return Vue.t("calcStorLang.switchOff")
        case true:
          return Vue.t("calcStorLang.switchOff")
        case "false":
          return Vue.t("calcStorLang.switchOn")
        case false:
          return Vue.t("calcStorLang.switchOn")
        default:
          return value
      }
    }
  }
};
</script>
