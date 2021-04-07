<template>
  <div class="portConfig_custom_error" v-loading="loading">
    <el-form class="margin-tb20 me-require-form" ref="createInstanceForm" :model="createInstanceForm" :rules=rules label-width="100px">
      <el-form-item :label="$t('container.serviceSet')">
        <el-switch v-model="serviceSet" :on-text="$t('base.open')" :off-text="$t('base.close')"></el-switch>
      </el-form-item>
      <el-form-item :label="$t('lang.serverName')" prop="service_name"  class="is-required" v-show="serviceSet">
        <el-input class="col-12" v-model="createInstanceForm.service_name"></el-input>
      </el-form-item>
      <el-form-item :label="$t('container.accessType')" prop="service_type" class="is-required" v-show="serviceSet">
        <el-radio-group v-model="createInstanceForm.service_type" @change="serviceTypeChange">
          <el-radio class='radio' label="internal">{{$t('container.innerAccess')}}</el-radio>
          <el-radio class='radio' label="external">{{$t('container.outerAccess')}}</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <el-form class="margin-tb20 me-require-form" ref="addPortForm" :model="addPortForm" :rules=portrules label-width="100px">
      <el-form-item :label="$t('container.portConfig')"  class="is-required" v-show="serviceSet">
        <el-col class="col-3">
          <el-form-item prop="portName">
            <el-input v-model="addPortForm.portName" :placeholder="$t('container.portName')" @change="portNameChange"></el-input>
            <div class="el-form-item__error" id="port-name-exist-error" hidden>{{$t('container.portNameExistError')}}</div>
            <div class="el-form-item__error" id="port-name-empty" hidden>{{$t('container.required')}}</div>
          </el-form-item>
        </el-col>
        <el-col class="col-3">
          <el-form-item prop="protocol">
            <el-select v-model="addPortForm.protocol" :placeholder="$t('container.protocol')" @change="protocolChange">
              <el-option label="TCP" value="TCP"></el-option>
              <el-option label="UDP" value="UDP"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col class="col-3">
          <el-form-item prop="listenerPort">
            <el-input v-model="addPortForm.listenerPort" :placeholder="$t('container.listenerPort')" @change="checkListenerPort"></el-input>
            <div class="el-form-item__error" id="listener-port-exist-error" hidden>{{$t('container.listenerPortExistError')}}</div>
            <div class="el-form-item__error" id="listener-port-empty" hidden>{{$t('container.required')}}</div>
          </el-form-item>
        </el-col>
        <el-col class="col-3">
          <el-form-item prop="targetPort">
            <el-tooltip :content="$t('container.portIsnotSame')" placement="top">
              <el-input v-model="addPortForm.targetPort" :placeholder="$t('container.containerPort')" @change="checkTargetPort"></el-input>
            </el-tooltip>
            <div class="el-form-item__error" id="target-port-exist-error" hidden>{{$t('container.containerPortExistError')}}</div>
            <div class="el-form-item__error" id="target-port-empty" hidden>{{$t('container.required')}}</div>
          </el-form-item>
        </el-col>
        <el-col class="col-4" v-if="createInstanceForm.service_type=='external'">
          <el-form-item prop="nodePortType">
            <el-select v-model="addPortForm.nodePortType" :placeholder="$t('container.nodeServicePort')" @change="addPortForm.nodePort=''">
              <el-option :label="$t('container.autoAllocation')" value="auto"></el-option>
              <el-option :label="$t('container.Manualy')" value="custom"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col class="col-3" v-if="createInstanceForm.service_type=='external' && addPortForm.nodePortType=='custom'">
          <el-form-item prop="nodePort">
            <el-input v-model="addPortForm.nodePort" :placeholder="$t('container.nodePort')" @change="checkNodePort"></el-input>
            <div class="el-form-item__error" id="node-port-exist-error" hidden>{{$t('container.nodeServicePortExistError')}}</div>
            <div class="el-form-item__error" id="node-port-empty" hidden>{{$t('container.required')}}</div>
          </el-form-item>
        </el-col>
        <el-col class="col-3">
          <el-form-item>
            <el-button type="primary" icon='fa-plus' size="small" @click="addPort()">{{$t('container.add')}}</el-button>
          </el-form-item>
        </el-col>
      </el-form-item>
    </el-form>
     <div style="width: 700px; max-height: 250px;overflow-y:auto;overflow-x:hidden;" v-show="serviceSet">
        <el-table ref="portTableData" :data="portTableData" highlight-current-row stripe border style="margin-top: 7px" row-key="id">
          <el-table-column prop="portName" :label="$t('container.portName')" align="left" show-overflow-tooltip min-width="120"></el-table-column>
          <el-table-column prop="protocol" :label="$t('container.protocol')" align="left" show-overflow-tooltip width="75"></el-table-column>
          <el-table-column prop="listenerPort" :label="$t('container.listenerPort')" align="left" show-overflow-tooltip width="75"></el-table-column>
          <el-table-column prop="targetPort" :label="$t('container.containerPort')" align="left" show-overflow-tooltip width="75"></el-table-column>
          <el-table-column prop="nodePort" :label="$t('container.nodePort')" align="left" show-overflow-tooltip width="130">
            <template slot-scope="scope">
              <span v-html="nodePortRender(scope.row.nodePort)"></span>
            </template>
          </el-table-column>
          <el-table-column prop="operate" :label="$t('container.operate')" align="left" show-overflow-tooltip width="65">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="removePortRow(scope.row)">{{$t('lang.delete')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
     </div>
    <div class="me-form-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="prevStep" type="primary" :disabled="loading">{{$t('lang.preStep')}}</el-button>
      <el-button @click="nextStep" type="primary" :disabled="loading" v-if="hasBalance">{{$t('lang.nextStep')}}</el-button>
      <el-button @click="finishStep" type="primary" :disabled="loading">{{$t('lang.finish')}}</el-button>
    </div>
  </div>
</template>
<script>
  export default {
    name: "CreateStepThree",
    props: ["hasBalance"],
    data() {
      return {
        createInstanceForm: {
          service_name: '',
          service_type: 'internal',
          ports:[],
          threeStop:true
        },
        loading: false,
        serviceSet:true,
        portTableId:0,
        portTableData:[],
        portDatas: [],
        addPortForm: {
          protocol: 'TCP',
          nodePort: '',
          nodePortType: 'auto',
          portName:"",
          listenerPort:"",
          targetPort:""
        },
        rules: {
          service_name: [
            {type: 'required'},
            {type: 'maxSize', value: 40},
            {type: 'containerApplicationNameRule'}
          ]
        },
        portrules: {
          portName: [
            {type: 'maxSize', value: 40},
            {type: 'containerApplicationPortNameRule'}
          ],
          targetPort: [
            {type: 'validatePort'},
            {type: 'min', value: 1},
            {type: 'max', value: 65535}
          ],
          listenerPort: [
            {type: 'validatePort'},
            {type: 'min', value: 1},
            {type: 'max', value: 65535}
          ],
          nodePort: [
            {type: 'validatePort'},
            {type: 'min', value: 1},
            {type: 'max', value: 65535}
          ]
        }
      }
    },
    mounted() {
    },
    methods: {
      initPortTable(pdata) {
        let self = this;
        self.portTableData = [];
        self.portDatas = pdata;
        if (self.portDatas.length > 0) {
          self.portDatas.forEach((data) => {
            self.portTableId++;
            self.portTableData.push({
              id:self.portTableId,
              portName:"p-" + data.containerPort,
              targetPort:data.containerPort,
              listenerPort:data.containerPort,
              protocol:data.protocol,
              nodePort:"",
              operate:""
            });
          });
        }
      },
      protocolChange(val) {
        this.checkTargetPort(this.addPortForm.targetPort);
        this.checkListenerPort(this.addPortForm.listenerPort);
      },
      portNameChange(val) {
        $('#port-name-exist-error').hide();
        if (val == '') {
          $("#port-name-empty").show();
        } else {
           $("#port-name-empty").hide();
        }
      },
      checkPortName(val) {
        $('#port-name-exist-error').hide();
        $("#port-name-empty").hide();
        for (let i = 0; i < this.portTableData.length; i++ ) {
          if (this.addPortForm.portName == this.portTableData[i].portName) {
            $('#port-name-exist-error').show();
            return false;
          }
        }
        return true;
      },
      checkTargetPort(val) {
        $('#target-port-exist-error').hide();
        $("#target-port-empty").hide();
        for (let i = 0; i < this.portTableData.length; i++ ) {
          if (this.addPortForm.targetPort == this.portTableData[i].targetPort && this.addPortForm.protocol == this.portTableData[i].protocol) {
            $('#target-port-exist-error').show();
            return false;
          }
        }
        return true;
      },
      checkListenerPort(val) {
        $('#listener-port-exist-error').hide();
        $("#listener-port-empty").hide();
        for (let i = 0; i < this.portTableData.length; i++ ) {
          if (this.addPortForm.listenerPort == this.portTableData[i].listenerPort && this.addPortForm.protocol == this.portTableData[i].protocol) {
            $('#listener-port-exist-error').show();
            return false;
          }
        }
        return true;
      },
      checkNodePort(val) {
        if (!this.addPortForm.nodePort) return true;
        $('#node-port-exist-error').hide();
        $("#node-port-empty").hide();
        for (let i = 0; i < this.portTableData.length; i++ ) {
          if (this.addPortForm.nodePort == this.portTableData[i].nodePort) {
            $('#node-port-exist-error').show();
            return false;
          }
        }
        return true;
      },
      serviceTypeChange(value) {
        // if (value == "internal") {
        //    $(this.portTableData).each(function(i, obj) {
        //     obj.nodePort = "";
        //   });
        // } else {
        //   $(this.portTableData).each(function(i, obj) {
        //     obj.nodePort = "0";
        //   });
        // }
        this.initPortTable(this.portDatas);
      },
      addPort() {
        let self = this;
        self.$refs.addPortForm.validate((valid) => {
          if (!valid) {
            return false;
          }
          if (!this.checkPortInput()) {
            return false;
          }
          if (this.portTableData.length >= 10) {
            self.$message.error(self.$t('container.portMaxNote'));
            return false;
          }
          let portNameOK = this.checkPortName();
          let targetPortOK = this.checkTargetPort();
          let listenerPortOk = this.checkListenerPort();
          let nodePortOK = this.checkNodePort();
          if (!(portNameOK && targetPortOK && nodePortOK && listenerPortOk)) {
            return false;
          }
          this.portTableId++;
          let portName = this.addPortForm.portName;
          let targetPort = this.addPortForm.targetPort;
          let protocol = this.addPortForm.protocol;
          let listenerPort = this.addPortForm.listenerPort;
          let nodePort = this.addPortForm.nodePort;
          if (this.createInstanceForm.service_type == "external") {
            if (this.addPortForm.nodePortType=='auto') {
              nodePort = "0";
            }
          } else {
            nodePort = "";
          }
          this.portTableData.push({
            id:this.portTableId,
            portName:portName,
            targetPort:targetPort,
            listenerPort:listenerPort,
            protocol:protocol,
            nodePort:nodePort,
            operate:""
          });
          this.addPortForm.portName = "";
          this.addPortForm.targetPort = "";
          this.addPortForm.nodePort = "";
          this.addPortForm.listenerPort = "";
        });
      },
      checkPortInput() {
        $("#port-name-empty").hide();
        $("#listener-port-empty").hide();
        $("#target-port-empty").hide();
        $("#node-port-empty").hide();

        if (this.addPortForm.portName == "") {
          $("#port-name-empty").show();
          return false;
        } else {
           $("#port-name-empty").hide();
        }
        if (this.addPortForm.listenerPort == "") {
          $("#listener-port-empty").show();
          return false;
        } else {
          $("#listener-port-empty").hide();
        }
        if (this.addPortForm.targetPort == "") {
          $("#target-port-empty").show();
          return false;
        } else {
          $("#target-port-empty").hide();
        }
        if (this.createInstanceForm.service_type=='external' && this.addPortForm.nodePortType=='custom' && this.addPortForm.nodePort == "") {
          $("#node-port-empty").show();
          return false;
        } else {
          $("#node-port-empty").hide();
        }
        return true;
      },
      removePortRow(row) {
        this.portTableId--;
        const test = this.portTableData.filter(item => item.id !== row['id']);
        this.portTableData.length = 0;
        this.portTableData.push.apply(this.portTableData, test);
      },
      cancel() {
        this.$emit("cancel");
      },
      prevStep() {
        this.$emit("prevStep", 1, this.createInstanceForm);
      },
      nextStep() {
        let self = this;
        if (self.serviceSet) {
          self.$refs.createInstanceForm.validate((valid) => {
            if (!valid) {
              return false;
            }
            if (!self.portTableData.length) {
              self.$message.error(self.$t('container.atLeastOnePort'));
              return;
            }
            let ports = [];
            if (self.createInstanceForm.service_type == "external") {
              $(self.portTableData).each(function(i, obj) {
                ports.push({
                  "nodePort": obj.nodePort * 1,
                  "name": obj.portName,
                  "port": obj.listenerPort * 1,
                  "protocol": obj.protocol,
                  "targetPort": obj.targetPort * 1
                });
              });
            } else {
              $(self.portTableData).each(function(i, obj) {
                ports.push({
                  "name": obj.portName,
                  "port": obj.listenerPort * 1,
                  "protocol": obj.protocol,
                  "targetPort": obj.targetPort * 1
                });
              });
            }
            self.createInstanceForm.ports = ports;
            self.createInstanceForm.threeStop = false;
            self.$emit("stepDone", 3, self.createInstanceForm);
          });
        } else {
          self.createInstanceForm.threeStop = false;
          self.$emit("stepDone", 3, self.createInstanceForm);
        }
      },
      finishStep() {
        let self = this;
        if (self.serviceSet) {
          self.$refs.createInstanceForm.validate((valid) => {
            if (!valid) {
              return false;
            }
            if (!self.portTableData.length) {
              self.$message.error(self.$t('container.atLeastOnePort'));
              return;
            }
            let ports = [];
            if (self.createInstanceForm.service_type == "external") {
              $(self.portTableData).each(function(i, obj) {
                ports.push({
                  "nodePort": obj.nodePort * 1,
                  "name": obj.portName,
                  "port": obj.listenerPort * 1,
                  "protocol": obj.protocol,
                  "targetPort": obj.targetPort * 1
                });
              });
            } else {
              $(self.portTableData).each(function(i, obj) {
                ports.push({
                  "name": obj.portName,
                  "port": obj.listenerPort * 1,
                  "protocol": obj.protocol,
                  "targetPort": obj.targetPort * 1
                });
              });
            }
            self.createInstanceForm.ports = ports;
            self.createInstanceForm.threeStop = true;
            self.loading = true;
            self.$emit("stepDone", 4, self.createInstanceForm);
          });
        } else {
          self.createInstanceForm.threeStop = true;
          self.loading = true;
          self.$emit("stepDone", 4, self.createInstanceForm);
        }
      },
      nodePortRender(port) {
        if (port == '0') {
          return this.$t('container.autoAllocation');
        } else {
          return port;
        }
      }
    }
  }
</script>
<style>
.portConfig_custom_error .el-form-item__error {
  color: #dd4b39;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
  position: relative;
  top: 100%;
  left: 0;
  font-weight:400;
}
</style>