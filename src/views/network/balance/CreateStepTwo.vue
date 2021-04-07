<template>
  <div>
    <el-row>
      <el-col :span="16">
        <el-form class="me-required-form margin-tb20" :model="steptwoForm" :rules=rules ref="steptwoForm" label-width="140px" v-loading="loading2">
          <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
            <el-input class="col-20" v-model="steptwoForm.name" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item :label="$t('network.protocol')" class="is-required" prop="protocol">
            <el-select class="col-20" v-model="steptwoForm.protocol" @change="protocolChange">
              <!-- <el-option label="HTTP" value="HTTP"></el-option>
              <el-option label="HTTPS" value="HTTPS"></el-option>
              <el-option label="TCP" value="TCP"></el-option>
              <el-option label="UDP" value="UDP"></el-option>
              <el-option label="TERMINATED_HTTPS" value="TERMINATED_HTTPS"></el-option> -->
              <el-option v-for="(v,i) in protocol" :key="i" :label="v" :value="v"></el-option>
            </el-select>
            <el-tooltip effect="dark" placement="top">
              <div slot="content">{{$t('network.balancecNote1')}}</div>
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>
          <el-form-item :label="$t('network.port')" class="is-required" prop="port">
            <el-input v-model="steptwoForm.port" :min="1" :max="65535" @change="portChange" class="col-20"></el-input>
            <el-tooltip effect="dark" placement="top">
              <div slot="content">{{$t('network.balancenote2')}}<br/>{{$t('network.balancenote4')}}<br/>{{$t('network.balancenote41')}}<br/>{{$t('network.balancenote42')}}<br/></div>
              <i class="el-icon-fa-question-circle"></i>
            </el-tooltip>
          </el-form-item>

          <el-form-item :label="$t('network.DEFAULT_CERTIFICE_CONTAINER')" class="is-required" prop="secretsDefault" v-if="steptwoForm.protocol==='TERMINATED_HTTPS'">
            <el-select class="col-20" v-model="steptwoForm.secretsDefault" @change="secretsChange">
              <el-option v-for="(v,i) in secrets" :label="v.name" :value="v.secret_ref" :key="i"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item :label="$t('network.SNI_CERTIFICE_CONTAINER')" v-if="steptwoForm.protocol==='TERMINATED_HTTPS'">
            <el-select class="col-20 select-multiple" v-model="steptwoForm.secretsSNI" @change="secretsChange" multiple>
              <el-option v-for="(v,i) in secrets" :label="v.name" :value="v.secret_ref" :key="i"></el-option>
            </el-select>
          </el-form-item>

          <el-button type="text" style="padding-left:10px;" @click="showDetail()" href="advanceBtn">
            <span>{{advanceName}}</span>
          </el-button>
          <div v-show="moreAttribute">
            <el-form-item :label="$t('network.timeoutData')" prop="timeoutClient" v-if="steptwoForm.protocol!='UDP'">
              <el-input-number v-model="steptwoForm.timeoutClient" :min="0" :max="100000" class="col-20"></el-input-number>
              <el-tooltip effect="dark" placement="top">
                <div slot="content">{{$t('network.timeoutClientTip')}}</div>
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('network.timeoutTcp')" prop="tcpInspect" v-if="steptwoForm.protocol!='UDP'">
              <el-input-number v-model="steptwoForm.tcpInspect" :min="0" :max="100000" class="col-20"></el-input-number>
              <el-tooltip effect="dark" placement="top">
                <div slot="content">{{$t('network.tcpInspectTip')}}</div>
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('network.timeoutMemConnect')" prop="timeoutMemconnect" v-if="steptwoForm.protocol!='UDP'">
              <el-input-number v-model="steptwoForm.timeoutMemconnect" :min="0" :max="100000" class="col-20"></el-input-number>
              <el-tooltip effect="dark" placement="top">
                <div slot="content">{{$t('network.timeoutMemconnectTip')}}</div>
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('network.timeoutMemData')" prop="timeoutMemData" v-if="steptwoForm.protocol!='UDP'">
              <el-input-number v-model="steptwoForm.timeoutMemData" :min="0" :max="100000" class="col-20"></el-input-number>
              <el-tooltip effect="dark" placement="top">
                <div slot="content">{{$t('network.timeoutMemDataTip')}}</div>
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('network.connectLimit')" class="is-required" prop="connectLimit">
              <el-input-number v-model="steptwoForm.connectLimit" :min="-1" :max="100000" class="col-20"></el-input-number>
              <el-tooltip effect="dark" placement="top">
                <div slot="content">{{$t('network.connectLimitTip')}}</div>
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('network.insertHeaders')" v-if="steptwoForm.protocol!='UDP' && steptwoForm.protocol!='TCP' && steptwoForm.protocol!='HTTPS'">
              <el-checkbox v-model="steptwoForm.xforwardedfor">X-Forwarded-For</el-checkbox>
              <el-checkbox v-model="steptwoForm.xforwardedport">X-Forwarded-port</el-checkbox>
              <el-tooltip effect="dark" placement="top">
                <div slot="content">{{$t('network.insertHeadersTip')}}</div>
                <i class="el-icon-fa-question-circle"></i>
              </el-tooltip>
            </el-form-item>
            <el-form-item :label="$t('lang.desc')" prop="description">
              <el-input type="textarea" class="col-20" v-model="steptwoForm.description" auto-complete="off"></el-input>
            </el-form-item>
          </div>
        </el-form>
      </el-col>
    </el-row>
    <div class="me-form-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="prevStep" type="primary" v-if="prevStepFlag">{{$t('lang.preStep')}}</el-button>
      <el-button @click="nextStep" type="primary">{{$t('lang.nextStep')}}</el-button>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from "vuex";
import protocol from 'views/network/common/protocol.json';
export default {
  name: "StepTwo",
  props: ["projectId", "prevStepFlag", "totallistenerData"],
  data() {
    return {
      protocol,
      secrets: [],
      activeIndex: 1,
      steptwoForm: {
        name: "",
        description: "",
        protocol: "",
        port: "",
        secretsDefault: '',
        secretsSNI: [],
        timeoutClient: 50000,
        tcpInspect: 0,
        timeoutMemconnect: 5000,
        timeoutMemData: 50000,
        connectLimit: -1,
        xforwardedfor: false,
        xforwardedport: false,
        managestatus: true
      },
      loading2: false,
      portList: [],
      advanceName: Vue.t("network.advanceRight"),
      moreAttribute: false,
      warninngport: false,
      dialogVisible: false,
      rules: {
        name: [
          { type: "onlyLetterNumber_Chinese" },
          { type: "requiredNet" },
          { type: "maxSize", value: 40 }
        ],
        protocol: [{ type: "requiredNet" }],
        secretsDefault: [{ type: "required" }],
        description: [{ type: "maxSize", value: 255 }],
        port: [
          { type: "requiredNet" },
          { type: "integer" },
          { type: "min", value: 1 },
          { type: "max", value: 65535 }
        ],
        timeoutClient: [{ type: "requiredNet" }, { type: "integer" }],
        tcpInspect: [{ type: "requiredNet" }, { type: "integer" }],
        timeoutMemconnect: [{ type: "requiredNet" }, { type: "integer" }],
        timeoutMemData: [{ type: "requiredNet" }, { type: "integer" }],
        connectLimit: [{ type: "requiredNet" }, { type: "integer" }]
      }
    };
  },
  mounted() {
    if (this.totallistenerData != undefined) {
      if (this.totallistenerData.length > 0) {
        for (let i = 0; i < this.totallistenerData.length; i++) {
          let listener = this.totallistenerData[i];
          this.portList.push(listener["protocol_port"]);
        }
      }
    }
  },
  methods: {
    nextStep() {
      this.getallPort();
    },
    prevStep() {
      this.$emit("prevStep", 0);
    },
    cancel() {
      this.$emit("cancel");
    },
    secretsChange(v) {
    },
    protocolChange(value) {
      if (value === "HTTP") {
        this.steptwoForm.port = 80;
      } else {
        this.steptwoForm.port = 1;
      }

      if (value === 'TERMINATED_HTTPS') {
        let url = `api/barbican/v1/secrets?secret_type=opaque&limit=9999&project_id=${this.projectId}`;
        this.$ajax({
          type: "get",
          url: `${url}`,
          data: {
          }
        }).then(v => {
          let self = this;
          let secrets = v.secrets || [];
          self.secrets = [];
          secrets.forEach(function(item) {
            item.name = item.name+"("+item.secret_ref+")";
            if (item.status == "ACTIVE") {
              self.secrets.push(item);
            }
          })
          // this.secrets = (v.secrets || []).filter(v => (v.status || '').toLowerCase() === "active");
        }).catch(v => { });
      } else {
        this.steptwoForm.secretsDefault = '';
        this.steptwoForm.secretsSNI = [];
      }

      this.$emit("getProtocol", value);
    },
    showDetail() {
      if (this.moreAttribute == false) {
        this.moreAttribute = true;
        this.advanceName = Vue.t("network.advanceLeft");
      } else {
        this.moreAttribute = false;
        this.advanceName = Vue.t("network.advanceRight");
      }
    },
    portChange(value) {
      let self = this;
      let portFlag = false;
      if (self.portList.length > 0) {
        for (let i = 0; i < self.portList.length; i++) {
          if (self.portList[i] === value) {
            portFlag = true;
          }
        }
        if (!portFlag) {
          // self.warninngport = false;
        } else {
          // self.warninngport = true;
          self.$notify({
            message: Vue.t("network.balancenote3"),
            type: "error"
          });
        }
      }
    },
    async getallPort() {
      let self = this;
      self.$refs.steptwoForm.validate(valid => {
        if (valid) {
          let portFlag = false;
          if (self.portList.length > 0) {
            for (let i = 0; i < self.portList.length; i++) {
              if (self.portList[i] == self.steptwoForm.port) {
                portFlag = true;
              }
            }
          }
          if (!portFlag) {
            // self.warninngport = false;
            self.$emit("stepTwoDone", {});
          } else {
            // self.warninngport = true;
            self.$notify({
              message: Vue.t("network.balancenote3"),
              type: "error"
            });
          }
          return true;
        } else {
          return false;
        }
      });
    }
  },
  watch: {
    projectId() {
      this.steptwoForm.secretsDefault = '';
      this.steptwoForm.secretsSNI = [];
      if (this.steptwoForm.protocol === 'TERMINATED_HTTPS') {
        this.protocolChange('TERMINATED_HTTPS');
      }
    }
  }
};
</script>

<style scoped>
.select-multiple >>> .el-select__tags>span{
  width: 100%;
  display: inline-block;
  overflow: hidden;
}
</style>