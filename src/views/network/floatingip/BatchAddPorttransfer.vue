<template>
  <div>
    <el-dialog
      :title="$t('network.portTransferBatch')"
      size="small"
      :before-close="handleClose"
      :visible="true">
      <div v-loading="loading">
        <el-form>
          <el-form-item>
            <el-button icon="fa-plus" size="small" type="primary" @click="addOne(1)" :disabled="repeatFlag">{{ $t('network.add') }}</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="tableData" height="400" border>
          <el-table-column label="#" width="50px">
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('network.floatIP')" width="200px">
            <template slot-scope="scope">
              <el-tooltip placement="top" trigger="hover" effect="light" :disabled="!scope.row.floatIPCheck">
                <div slot="content" v-html="scope.row.toolitipMessage"></div>
                <el-select v-model="scope.row.floatingIpId" filterable @change="getVms(scope.row.floatingIpId, scope.$index, 'floatIPCheck')" :class="{'error-border': scope.row.floatIPCheck}" :disabled = scope.row.success>
                  <el-option v-for="item in unBindFloatIP" :key="item.id" :label="item.floating_ip_address" :value="item.id"></el-option>
                </el-select>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('network.protocol')" width="200px">
            <template slot-scope="scope">
              <el-select v-model="scope.row.protocol" :disabled = scope.row.success>
                <el-option label="tcp" value="tcp"></el-option>
                <el-option label="udp" value="udp"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('network.extPort')" width="120px">
            <template slot-scope="scope">
              <el-tooltip placement="top" trigger="hover" effect="light" :disabled="!scope.row.extPortCheck">
                <div slot="content" v-html="scope.row.toolitipMessage"></div>
                <el-input v-model="scope.row.extPort" :disabled = scope.row.success @change="checkRepeat(scope.$index, 'extPortCheck')" :class="{'error-border': scope.row.extPortCheck}"></el-input>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('calcStorLang.instance')" width="200px">
            <template slot-scope="scope">
              <el-tooltip placement="top" trigger="hover" effect="light" :disabled="!scope.row.instanceCheck">
                <div slot="content" v-html="scope.row.toolitipMessage"></div>
                <el-select v-model="scope.row.vm" filterable @change="getPorts(scope.row.floatingIpId, scope.row.vm, scope.$index, 'instanceCheck')" :class="{'error-border': scope.row.instanceCheck}" :disabled = scope.row.success>
                  <el-option v-for="item in (scope.row.floatingIpId ? scope.row.vmOptions : [])" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('network.portConnecting')" width="200px">
            <template slot-scope="scope">
              <el-tooltip placement="top" trigger="hover" effect="light" :disabled="!scope.row.portConnectCheck">
                <div slot="content" v-html="scope.row.toolitipMessage"></div>
                <el-select v-model="scope.row.portConnectingId" @change="checkRepeat(scope.$index, 'portConnectCheck')" :class="{'error-border': scope.row.portConnectCheck}" filterable :loading="selLoading" :disabled = scope.row.success>
                  <el-option v-for="item in (scope.row.vm ? scope.row.portConnectingOptions : [])" :key="item.id" :label="item.fixed_ips[0].ip_address" :value="item.id"></el-option>
                </el-select>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :render-header="renderRequiredHeader" :label="$t('network.innerPort')" width="120px">
            <template slot-scope="scope">
              <el-tooltip placement="top" trigger="hover" effect="light" :disabled="!scope.row.innerPortCheck">
                <div slot="content" v-html="scope.row.toolitipMessage"></div>
                <el-input v-model="scope.row.innerPort" @change="checkRepeat(scope.$index, 'innerPortCheck')" :class="{'error-border': scope.row.innerPortCheck}" :disabled = scope.row.success></el-input>
              </el-tooltip>
              <div></div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('network.STATUS')" width="60px" align="left">
            <template slot-scope="scope">
              <i v-if="scope.row.saveStatus === 1" class="el-icon-loading" />
              <i v-if="scope.row.success" class="el-icon-fa-check" />
              <el-tooltip effect="dark" v-if="(scope.row.saveStatus === 2) && !scope.row.success" :content="scope.row.closeMessage">
                <i class="el-icon-fa-close"></i>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :label="$t('network.operation')" width="80px" align="left" fixed="right">
            <template slot-scope="scope">
              <el-button type="danger" size="small" :disabled="onlyOneFlag" @click="deleteOneByIndex(scope.$index)">{{ $t('network.deleteText') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer">
        <el-button @click="close">{{ $t('base.cancel') }}</el-button>
        <el-button type="primary" @click="checkInfo" :disabled="loading || tableData.length === 0 || repeatFlag || successFlag" :loading="mkSureDisable">{{ $t('base.confirm') }}</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  class FieldInvalidError extends Error {
    constructor(message) {
      super(message);
      this.message = message;
      this.name = 'FieldInvalidError';
    }
  }
  export default {
    props: {
      unBindFloatIP: {
        type: Array,
        default: []
      }
    },
    data() {
      return {
        onlyOneFlag: false,
        checkKey:["floatIPCheck", "extPortCheck", "instanceCheck", "portConnectCheck", "innerPortCheck"],
        successFlag: false,
        repeatFlag: false,
        closeMessage: "",
        mkSureDisable: false,
        portConnectingOptions: [],
        vmOptions: [],
        selLoading: false,
        saving: false,
        loading: false,
        flavors: [],
        treeFlavors: [],
        azList: [],
        hosts: [],
        images: [],
        networkTypes: [],
        networks: [],
        volumeTypes: [],
        netSafeGroups: [],
        tableData: [],
        quotaCheckDialog: {
          visible: false,
          requires: [],
          hasError: false
        }
      }
    },
    methods: {
      checkRepeat(index, colomnFlag) {
        if (this.repeatFlag && !this.tableData[index].repeat) {
          this.$message.error(Vue.t('network.CHECK_REPEAT_FIRST'));
          return;
        }
        this.repeatFlag = false;
        this.tableData[index].saveStatus = "";
        for (let j = 0; j < this.checkKey.length; j++) {
          let key = this.checkKey[j];
          for (let row of this.tableData) {
            row[key] = false;
          }
        }
        let outPortIpMap = new Map();
        let innerPortVmMap = new Map();
        const tableData = this.tableData;
        for (let i = 0; i < tableData.length; i++) {
          let outPortIpKey = tableData[i].floatingIpId + tableData[i].extPort;
          let index = i;
          let innerPortVmMapKey = tableData[i].vm + tableData[i].portConnectingId + tableData[i].innerPort;
          tableData[i].repeat = false;
          //tableData[i].saveStatus = "";
          let closeMessageOne = "";
          let closeMessageTwo = "";
          // 浮动IP+外部端口号重复
          if (outPortIpMap.has(outPortIpKey) && tableData[i].floatingIpId && tableData[i].extPort) {
            this.repeatFlag = true;
            let repeatIndex = outPortIpMap.get(outPortIpKey);
            tableData[i].repeat = true;
            tableData[repeatIndex].repeat = true;
            closeMessageOne = ( "#" + (repeatIndex + 1) + "," + "#" + (index + 1) + Vue.t('network.floatIP') + ',' + Vue.t('network.extPort') + Vue.t('network.REPEAT'));
            /*tableData[index].closeMessage = closeMessageOne + " " + closeMessageTwo;
            tableData[repeatIndex].closeMessage = closeMessageOne + " " + closeMessageTwo;*/
            tableData[index].toolitipMessage = tableData[repeatIndex].toolitipMessage = closeMessageOne + " " + closeMessageTwo;
            tableData[index]["floatIPCheck"] = true;
            tableData[repeatIndex]["floatIPCheck"] = true;
            tableData[index]["extPortCheck"] = true;
            tableData[repeatIndex]["extPortCheck"] = true;
            tableData[index].saveStatus = "";
            tableData[repeatIndex].saveStatus = "";
          } else {
            outPortIpMap.set(outPortIpKey, index);
          }
          // 或者虚拟机+port_id+内部端口重复
          if (innerPortVmMap.has(innerPortVmMapKey) && tableData[i].vm && tableData[i].portConnectingId && tableData[i].innerPort) {
            this.repeatFlag = true;
            let repeatIndex = innerPortVmMap.get(innerPortVmMapKey);
            tableData[i].repeat = true;
            tableData[repeatIndex].repeat = true;
            closeMessageTwo = ( "#" + (repeatIndex + 1) + "," + "#" + (index + 1) + Vue.t('calcStorLang.instance') + ',' + Vue
              .t('network.portConnecting') + "," + Vue.t('network.innerPort') + Vue.t('network.REPEAT'));
            let errMessage;
            if (closeMessageOne) {
              errMessage = closeMessageOne + " " + closeMessageTwo;
            } else {
              errMessage = closeMessageTwo;
            }
            /*tableData[index].closeMessage = errMessage;
            tableData[repeatIndex].closeMessage = errMessage;*/
            tableData[index].toolitipMessage = tableData[repeatIndex].toolitipMessage = errMessage;
            tableData[index]["instanceCheck"] = true;
            tableData[repeatIndex]["instanceCheck"] = true;
            tableData[index]["portConnectCheck"] = true;
            tableData[repeatIndex]["portConnectCheck"] = true;
            tableData[index]["innerPortCheck"] = true;
            tableData[repeatIndex]["innerPortCheck"] = true;
            tableData[index].saveStatus = "";
            tableData[repeatIndex].saveStatus = "";
          } else {
            innerPortVmMap.set(innerPortVmMapKey, index);
          }
        }
        return this.repeatFlag;
      },
      async getPorts(floatingIpId, vmId, index, column) {
        const self = this;
        this.checkRepeat(index, column);
        this.tableData[index].portConnectingOptions = [];
        this.tableData[index].portConnectingId = "";
        let [projectId, netId] = this.getFloatInfo(floatingIpId);
        let body = {
          "project_id": projectId,
          "floating_network_id": netId,
          "device_id": vmId
        };
        self.selLoading = true;
        try {
          let res = await self.$ajax({
            type: 'post',
            data: JSON.stringify(body),
            url: "api/neutron/v2.0/inspur/networkextension/get_ports_for_floating_ip_to_bind"
          });
          self.selLoading = false;
          this.tableData[index].portConnectingOptions = res;
        } catch (res) {
          self.selLoading = false;
        }
      },
      getFloatInfo(floatingIpId) {
        for (let i = 0; i < this.unBindFloatIP.length; i++) {
          if (this.unBindFloatIP[i].id === floatingIpId) {
            return [this.unBindFloatIP[i].project_id, this.unBindFloatIP[i].floating_network_id, this.unBindFloatIP[i].floating_ip_address];
          }
        }
      },
      async getVms(floatingIpId, index, columnCheck) {
        let self = this;
        if (!floatingIpId) return;
        if (this.tableData[index].delFlag) {
          this.tableData[index].delFlag = !this.tableData[index].delFlag;
          return;
        }
        this.checkRepeat(index, columnCheck);
        self.loading = true;
        this.tableData[index].vm = "";
        this.tableData[index].portConnectingId = "";
        this.tableData[index].portConnecting = [];
        this.tableData[index].vmOptions = [];
        let [proId, netId] = this.getFloatInfo(floatingIpId);
        let filterVmBody = {
          "project_id": proId,
          "floatingip_id": floatingIpId
        };
        let url = "";
        if (Vue.roleType == "0") {
          url = "api/nova/v2.1/servers-inspur/detail?project_id=" + proId + "&limit=999&all_tenants=1&filter-vm-name=Bare@"
        } else if (Vue.roleType == "3") {
          url = "api/nova/v2.1/servers-inspur/detail?project_id=" + proId + "&limit=999&user_id="+Vue.userId+"&filter-vm-name=Bare@"
        } else {
          url = "api/nova/v2.1/servers-inspur/detail?project_id=" + proId + "&limit=999&filter-vm-name=Bare@"
        }
        try {
          let res = await self.$ajax({
            type: 'get',
            headers: {
              'X-OpenStack-Nova-API-Version': 2.9
            },
            url: url
          });
          // 由于后台无法对可用的物理机进行过滤 需要再请求一边不传device_id参数用于主机过滤
          let filterVm = await self.$ajax({
            type: 'post',
            data: JSON.stringify(filterVmBody),
            url: "api/neutron/v2.0/inspur/networkextension/get_ports_for_floating_ip_to_bind"
          });
          let deviceIds = [];
          for (let v of filterVm) {
            deviceIds.push(v.device_id);
          }
          this.tableData[index].vmOptions.length = 0;
          let servers = res['servers'];
          for (let i = 0; i < servers.length; i++) {
            if (deviceIds.includes(servers[i].id)) {
              this.tableData[index].vmOptions.push(servers[i]);
            }
          }
          self.loading = false;
        } catch (res) {
          self.loading = false;
        }
      },
      renderRequiredHeader(h, { column, $index }) {
        return h('div', [
          h('span', column.label),
          h('span', {
            style: {
              color: 'red',
              fontSize: '14px'
            },
            domProps: {
              innerHTML: ' *'
            }
          })
        ]);
      },
      close() {
        this.$emit('hide');
      },
      handleClose(done) {
        done();
        this.close();
      },
      addOne(count=1) {
        if (this.repeatFlag) return;
        this.successFlag = false;
        for (let i = 0; i < count; i++) {
          this.tableData.push({
            floatingIpId: "",
            protocol: '',
            extPort: '',
            vm: '',
            portConnectingId: "",
            innerPort: '',
            number: 1,
            ports: [],
            vmOptions: [],
            portConnectingOptions: [],
            repeat: false,
            portConnectCheck: false,
            floatIPCheck: false,
            extPortCheck: false,
            instanceCheck: false,
            innerPortCheck: false,
            saveStatus: 0 //保存状态：0 初始状态 1 正在保存 2 指令发送失败 3 指令发送成功
          });
          if (this.tableData.length > 1) {
            this.onlyOneFlag = false;
          }
        }
      },
      deleteOneByIndex(index) {
        // 用于防止云主机发生变化
        if (this.tableData[index].repeat) {
          this.repeatFlag = false;
          for (let i = 0; i < this.tableData.length; i++) {
            if (this.tableData[i].repeat) {
              this.tableData[i].saveStatus = '';
              this.tableData[i].repeat = false;
              for (let s = 0; s < this.checkKey.length; s++) {
                let key = this.checkKey[s];
                for (let row of this.tableData) {
                  row[key] = false;
                }
              }
            }
          }
        }
        if (this.tableData.length > 1) {
          for (let j = 0; j < this.tableData.length; j++) {
            this.tableData[j].delFlag = true;
          }
          this.tableData.splice(index, 1);
          setTimeout(() => {
            for (let m = 0; m < this.tableData.length; m++) {
              if (this.tableData[m].delFlag) {
                this.tableData[m].delFlag = false;
              };
            }
          }, 0)
          let successCheck = true;
          for (let v of this.tableData) {
            if (!v.success) {
              successCheck = false;
            }
          }
          if (successCheck) {
            this.successFlag = true;
          }
        }
        if (this.tableData.length === 1) {
          this.onlyOneFlag = true;
        }
      },
      async init() {
      },
      async check() {
        const $this = this;
        for (let i = 1; i <= $this.tableData.length; i++) {
          const data = $this.tableData[i - 1];
          if (!data.floatingIpId) {
            throw new FieldInvalidError(Vue.t('network.BATCH_PORT_TRANSFOFRT_CHECK_NOT_SET_IP', i));
          }
          if (!data.protocol) {
            throw new FieldInvalidError(Vue.t('network.BATCH_CREATE_INSTANCE_CHECK_NOT_SET_PROTOCOL', i));
          }
          if (!(/^(0|\+?[1-9][0-9]*)$/.test(data.extPort) && (data.extPort*1 >= 1 && data.extPort*1 <= 65535))) {
            if (data.extPort) {
              throw new FieldInvalidError(Vue.t('network.BATCH_CREATE_INSTANCE_CHECK_RANGE_ERROR_PROTOCOL', i));
            }
          }
          if (!data.extPort) {
            throw new FieldInvalidError(Vue.t('network.BATCH_CREATE_INSTANCE_CHECK_NOT_SET_EXTPORT', i));
          }
          if (!data.vm) {
            throw new FieldInvalidError(Vue.t('network.BATCH_CREATE_INSTANCE_CHECK_NOT_SET_VM', i));
          }
          if (data.innerPort === '') {
            throw new FieldInvalidError(Vue.t('network.BATCH_CREATE_INSTANCE_CHECK_NOT_SET_INNER_PORT', i));
          }
          if (data.portConnectingId === '') {
            throw new FieldInvalidError(Vue.t('network.BATCH_CREATE_INSTANCE_CHECK_NOT_SET_PORT_CONNECTING', i));
          }
          if (!(/^(0|\+?[1-9][0-9]*)$/.test(data.innerPort) && (data.innerPort*1 >= 1 && data.innerPort*1 <= 65535))) {
            if (data.innerPort) {
              throw new FieldInvalidError(Vue.t('network.BATCH_CREATE_INSTANCE_CHECK_RANGE_ERROR_INNERPORT', i));
            }
          }
        }
      },
      async checkInfo() {
        const $this = this;
        $this.saving = true;
        try {
          // 首先检查字段是否都填全了
          await $this.check();
          this.submit();
        } catch (e) {
          $this.$message.error(e.message);
          $this.saving = false;
          return false;
        }
      },
      handleQuotaCheckDialogClose() {
        this.quotaCheckDialog.visible = false;
      },
      async add(param, index) {
        let self = this;
        let internalPortId = param.portConnectingId;
        let internalPort = {};
        for (let i = 0; i < param.portConnectingOptions.length; i++) {
          if (param.portConnectingOptions[i].id === internalPortId) {
            internalPort = param.portConnectingOptions[i];
          }
          ;
        }
        let data = {
          "port_forwarding": {
            "protocol": param.protocol,
            "internal_port": parseInt(param.innerPort),
            "internal_port_id": param.portConnectingId,
            "external_port": parseInt(param.extPort),
            "internal_ip_address": internalPort.fixed_ips[0].ip_address
          }
        };
        let [, , floatIpAddress] = this.getFloatInfo(param.floatingIpId);
        const result = await self.$ajax({
          type: "POST",
          url: "api/neutron/v2.0/floatingips/" + param.floatingIpId + "/port_forwardings",
          data: JSON.stringify(data),
          errorKey: "NeutronError",
          showErrMsg: false,
          log: {
            description: {
              en: "Floating ip:" + floatIpAddress+ "add port transfer",
              zh_cn: "浮动IP:" + floatIpAddress + "添加端口转发"
            },
            target: Vue.logTarget.floatingIP
          }
        });
      },
      async submit() {
        let $this = this;
        $this.mkSureDisable = true;
        let count = 0;
        let errFlag = false;
        for (let i = 0; i < $this.tableData.length; i++) {
          const data = $this.tableData[i];
          if (data.success) {
            count += 1;
            continue;
          }
          data.saveStatus = 1;
          try {
            await this.add(data, i +1);
            data.saveStatus = 3;
            data.success = true;
          } catch (e) {
            let responseText = e.message;
            if (responseText.indexOf("A duplicate port forwarding") != -1 && responseText.indexOf("internal_port_id") != -1) {
              responseText = Vue.t('network.DUPLICATE_PORT_FORWARDING');
            }
            $this.tableData[i].closeMessage = responseText;
            errFlag = true;
            data.saveStatus = 2;
          }
          count += 1;
          $this.mkSureDisable = false;
        }
        if (count == $this.tableData.length && !errFlag) {
          this.$emit("refresh");
          $this.$message({
            type: "info",
            message: Vue.t('network.ADD_SUCCESS')
          });
          $this.successFlag = true;
        }
        $this.mkSureDisable = false;
      }
    },
    async mounted() {
      this.addOne(2);
      await this.init();
    }
  }
</script>

<style>
  .error-border input{
    border: 1px solid red !important;
    outline: 0;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(133,0,0,.6 );
  }
</style>
