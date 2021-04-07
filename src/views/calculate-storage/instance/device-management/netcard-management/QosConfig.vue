<template>
  <div>
    <el2-dialog :title="$t('calcStorLang.netConfigQosConfig')" :visible.sync="visible" :before-close="handleClose" width="600px" :append-to-body="true" :close-on-click-modal="false">
      <el-form ref="createQosStandardForm" :model="createQosStandard" label-width="100px" label-position="left" class="me-required-form" v-loading="loading2" :element-loading-text="loadingText2">
        <el-form-item :label="$t('calcStorLang.netConfigQosPloy')" prop="key" class="is-required">
          <el-select v-model="createQosStandard.ploy" class="col-12" @change="changePloy" filterable>
            <el-option v-for="item in createQosStandard.list1" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
          <el-button type="primary" icon='fa-plus' size="small" @click="mountPortPloy">{{$t('calcStorLang.netConfigAddQosPloy')}}</el-button>
        </el-form-item>
        <!-- <el-form-item label="Qos规则" prop="" class="">
          <el-select v-model="createQosStandard.regular" class="col-12">
            <el-option v-for="item in createQosStandard.list2" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item :label="$t('calcStorLang.netConfigRegular')" prop="" class="">
          <el-table :data="tableData3" highlight-current-row border stripe style="width: 100%;" row-key="id">
            <el-table-column prop="type" :label="$t('network.type')" align="left" min-width="50"></el-table-column>
            <el-table-column prop="direction" :label="$t('network.direction')" align="left" min-width="50"></el-table-column>
            <el-table-column prop="max_kbps" :label="$t('network.maxkbpx')" align="left" min-width="50">
              <template slot-scope="scope">
                <span v-html="KbToKB(scope.row.max_kbps)"></span>
              </template>
            </el-table-column>
            <el-table-column prop="max_burst_kbps" :label="$t('network.burstkbps')" align="left" min-width="50">
              <template slot-scope="scope">
                <span v-html="KbToKB(scope.row.max_burst_kbps)"></span>
              </template>
            </el-table-column>
          </el-table>

          <el-table :data="dscp" stripe border style="width: 100%;">
            <el-table-column :label="$t('network.type')" prop="type" min-width="100" align="left">
              <template slot-scope="scope">
                <span>DSCP</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('network.direction')" prop="direction" min-width="100" align="left">
              <template slot-scope="scope">
                <span>{{$t('network.chukou')}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="dscp_mark" :label="$t('network.dscpmark')" :render-header="dscpmarkRenderHeader" min-width="100" align="left">
            </el-table-column>
        </el-table>
        </el-form-item>
        <el-form-item :label="$t('calcStorLang.netConfigAttachQos')">
          <el-table ref="specTable" :data="tableData2" highlight-current-row border stripe style="width: 100%;" max-height='500' row-key="id">
            <el-table-column type="expand" align="left" width="55">
              <template slot-slot-scope="props" slot-scope="scope">
                <qos-rule :id="scope.row.id"></qos-rule>
              </template>
            </el-table-column>
            <el-table-column v-if="columnsChecked2.indexOf('name') >= 0" prop="name" :label="$t('lang.name')" align="left" min-width="100">
            </el-table-column>
            <el-table-column v-if="columnsChecked2.indexOf('description') >= 0" prop="description" align="left" :label="$t('lang.desc')" min-width="100">
            </el-table-column>
            <el-table-column v-if="columnsChecked2.indexOf('operate') >= 0" align="left" :label="$t('calcStorLang.instOperate')" min-width="100">
              <template slot-scope="scope">
                <el-button type="text" size="small" @click="qosDelClick(scope.row)">{{$t('lang.delete')}}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">{{$t('calcStorLang.closed')}}</el-button>
      </div>
    </el2-dialog>
  </div>
</template>
<script>
import QosRule from './QosRuleDetail';
export default {
  name: 'qosconfig',
  components: { QosRule },
  props: ['hostEntity', 'selectRows', 'portEntity'],
  data() {
    return {
      createQosStandard: {
        port: '',
        ploy: '',
        regula: '',
        list1: [],
        list2: [],
        policiesMap: new Map()
      },
      visible: true,
      loading2: false,
      loadingText2: false,
      columnsChecked: ['name', 'port', 'ip', 'status', 'operate'],
      columnsChecked2: ['name', 'description', 'operate'],
      tableData: [],
      tableData2: [],
      tableData3: [],
      dscp: [],
      target: this.portEntity === undefined ? Vue.logTarget.computeInstance : Vue.logTarget.port,
      name: this.portEntity === undefined ? this.hostEntity.name : (this.portEntity.name || this.portEntity.id),
      enName: this.portEntity === undefined ? "Instance " : "Port ",
      chName: this.portEntity === undefined ? "云主机" : "端口",
      tenant_id: this.portEntity === undefined ? this.hostEntity.tenant_id : this.portEntity.tenant_id,
      portId: this.selectRows !== undefined ? this.selectRows[0].port_id : this.portEntity.id
    }
  },
  mounted() {
    this.netQosConfig();
  },
  methods: {
    async netQosConfig() {
      var self = this;
      self.createQosStandard.ploy = "";
      Promise.all([self.loadPloyList(self.tenant_id)]).then(function (result) {
        /*var qosPort = self.portCardMaps.get(row['port_id']);
        if (qosPort['qos_policy_id'] != null) {
        var qosEntity = self.createQosStandard.policiesMap.get(qosPort['qos_policy_id']);
        var qosList = [];
        qosList.push(qosEntity);
        self.tableData2 = qosList;
        }*/
        self.reloadQosList();
      });
    },
    async mountPortPloy() { //添加策略
      var self = this;
      if (self.createQosStandard.ploy == "") {
        self.$message({
          showClose: true,
          message: Vue.t('calcStorLang.netConfigChoosePloy'),
          type: 'warning'
        });
      } else if (self.tableData2.length > 0) {
        self.$message({
          showClose: true,
          message: Vue.t('calcStorLang.netConfigPloyTip'),
          type: 'warning'
        });
      } else {
        var url = 'api/neutron/v2.0/ports/' + self.portId;
        var body = { "port": { "qos_policy_id": self.createQosStandard.ploy } };
        body = JSON.stringify(body);
        self.loading2 = true;
        var ployName = self.createQosStandard.policiesMap.get(self.createQosStandard.ploy).name || self.createQosStandard.ploy;
        try {
          let result = await self.$ajax({
            type: 'put',
            url: url,
            data: body,
            showErrMsg: true,
            log: {
              description: {
                en: self.enName + self.name + " add QoS strategy:" + ployName,
                zh_cn: self.chName + self.name + "关联QoS策略:" + ployName
              },
              target: self.target
            },
            successFun: function () {
              Promise.all([self.reloadQosList()]).then(function (result) {
                self.$message(Vue.t('calcStorLang.netConfigSuccess'));
                self.createQosStandard.ploy = "";
                self.loading2 = false;
              });
            },
            errFun: function () {
              self.loading2 = false;
            }
          });
        } catch (res) {
          self.loading2 = false;
        }
      }
    },
    async qosDelClick(row) {
      var self = this;
      var url = 'api/neutron/v2.0/ports/' + self.portId;
      var body = { "port": { "qos_policy_id": null } };
      body = JSON.stringify(body);
      self.loading2 = true;
      try {
        let result = await self.$ajax({
          type: 'put',
          url: url,
          data: body,
          showErrMsg: true,
          log: {
            description: {
              en: self.enName + self.name + " delete attachment QoS strategy:" + row.name,
              zh_cn: self.chName + self.name + "删除关联QoS策略:" + row.name
            },
            target: self.target
          },
          successFun: function () {
            self.reloadQosList();
            Promise.all([self.reloadQosList()]).then(function (result) {
              self.$message(Vue.t('calcStorLang.netConfigQosDelSuccess'));
              self.createQosStandard.ploy = "";
              self.loading2 = false;
            });
          }
        });
        self.loading = false;
      } catch (res) {
        self.loading = false;
      }
    },
    changePloy() {
      var self = this;
      if (self.createQosStandard.ploy != "") {
        self.loadRegularDetail();
      } else {
        self.tableData3 = [];
        self.dscp = [];
      }
    },
    async loadRegularDetail() {
      var self = this;
      var url = 'api/neutron/v2.0/qos/policies/' + self.createQosStandard.ploy + "/bandwidth_limit_rules";
      url = 'api/neutron/v2.0/qos/policies/' + self.createQosStandard.ploy;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        var list = [];
        var regularList = result['bandwidth_limit_rules'];
        if (regularList == null || regularList.length == 0) {
          self.tableData3 = [];
          self.dscp = [];
        } else {
          for (var i = 0; i < result['bandwidth_limit_rules'].length; i++) {
            var rData = result['bandwidth_limit_rules'][i];
            if (rData != null) {
              rData.type = "Bandwidth";
              if (rData.direction == "egress") {
                rData.direction = Vue.t('network.chukou');
              } else {
                rData.direction = Vue.t('network.entrance');
              }
              list.push(rData);
              self.tableData3 = list;
            } else {
              self.tableData3 = [];
              self.dscp = [];
            }
          }
        }
        let a = result.policy["rules"] || [];
        self.tableData3 = a.filter(v => v.type === "bandwidth_limit");
        self.tableData3.forEach(v => {
          v.type = "Bandwidth";
          if (v.direction == "egress") {
            v.direction = Vue.t('network.chukou');
          } else {
            v.direction = Vue.t('network.entrance');
          }
        })
        self.dscp = a.filter(v => v.type === "dscp_marking");
      } catch (res) {
      }
    },
    handleCreateClose() {
      this.tableData3 = [];
      this.dscp = [];
      this.createQosStandard.ploy = "";
    },
    async reloadQosList() {
      var self = this;
      self.loading2 = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: "api/neutron/v2.0/ports/" + self.portId,
          showErrMsg: true
        });
        self.loading2 = false;
        var qosRets = result['port']['qos_policy_id'];
        if (null == qosRets) {
          self.tableData2 = [];
          self.tableData3 = [];
          self.dscp = [];
        } else {
          var qosEntity = self.createQosStandard.policiesMap.get(qosRets);
          var qosList = [];
          qosList.push(qosEntity);
          self.tableData2 = qosList;
          var policyMaxKbps = qosEntity.rules[0].max_kbps || "-";
          var policyMaxBurstKbps = qosEntity.rules[0]['max_burst_kbps'];
          var policesList = [{ "direction": Vue.t('network.chukou'), "type": "Bandwidth", "max_kbps": policyMaxKbps, "max_burst_kbps": policyMaxBurstKbps }];
          // self.tableData3 = policesList;
        }
      } catch (res) {
        self.loading2 = false;
      }
    },
    async loadPloyList(id) { //加载安全策略列表
      var self = this;
      var url = 'api/neutron/v2.0/qos/policies?project_id=' + id;
      self.loading = true;
      try {
        let result = await self.$ajax({
          type: 'get',
          url: url,
          showErrMsg: true
        });
        self.loading = false;
        var pList = result['policies'];
        for (let p = 0; p < pList.length; p++) {
          var obj = pList[p];
          self.createQosStandard.policiesMap.set(obj.id, obj);
        }
        self.createQosStandard.list1 = pList;
      } catch (res) {
        self.loading = false;
      }
    },
    handleClose(done) {
      this.$emit("hideQos", {});
      this.$emit("onRefresh");
      if (typeof done == "function") {
        done();
      }
    },
    KbToKB(value) {
      let KBValue = 0;
      KBValue = parseInt(parseInt(value)/8)
      return KBValue;
    },
    dscpmarkRenderHeader(h, {column, $index}) {
      return h('span', [
        h('span', {
          style:"margin-right:5px;"
        }, column.label),
        h('el-tooltip', {
          effect:"dark",
          placement:"top"}, [
            h('div', {
              slot:"content"
            }, [h('span', {
                  domProps: {
                    innerHTML:Vue.t('network.DSCP_MARKING_TIP')
                  }
                })]),
            h('i', {
              class:"el-icon-fa-question-circle"
            })
          ])
      ]);
    }
  }
}
</script>

<style scoped>
div >>> .el-table+.el-table{
  margin-top: 30px;
}
</style>