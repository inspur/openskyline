<template>
  <el-dialog :title="$t('lang.modify')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-form class="me-required-form" :model="steptwoForm" :rules="rules" ref="steptwoForm" label-width="140px" v-loading="loading">
      <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
        <el-input class="col-20" v-model="steptwoForm.name" auto-complete="off"></el-input>
      </el-form-item>
      <el-form-item :label="$t('network.protocol')" class="is-required" prop="protocol">
        <el-select class="col-20" v-model="steptwoForm.protocol" :disabled="true">
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
      <el-form-item :label="$t('network.manageStatus')" class="is-required" prop="manageStatus">
        <el-select class="col-20" v-model="steptwoForm.manageStatus">
          <el-option label="UP" :value=true :key="true"></el-option>
          <el-option label="DOWN" :value=false :key="false"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('network.port')" class="is-required" prop="port">
        <el-input-number v-model="steptwoForm.port" :min="1" :max="65535" :disabled="true"></el-input-number>
        <el-tooltip effect="dark" placement="top">
          <div slot="content">{{$t('network.balancenote2')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
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
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button type="primary" @click="handleEditConfirm" :disabled="isDisabled">{{$t('lang.confirm')}}</el-button>
    </span>
  </el-dialog>
</template>
<script>
import protocol from 'views/network/common/protocol.json';
export default {
  name: "EditStepTwo",
  props: ["listener"],
  data() {
    return {
      protocol,
      steptwoForm: {
        name: "",
        description: "",
        protocol: "",
        port: "",
        timeoutClient: "",
        tcpInspect: 0,
        timeoutMemconnect: 5000,
        timeoutMemData: 50000,
        connectLimit: -1,
        xforwardedfor: false,
        xforwardedport: false,
        manageStatus: ""
      },
      log: {
        name: "名称",
        description: "描述",
        protocol: "协议",
        port: "端口",
        timeoutClient: "客户数据超时时限",
        tcpInspect: "TCP 监测超时时限",
        timeoutMemconnect: "成员连接超时时限",
        timeoutMemData: "成员数据超时时限",
        connectLimit: "连接限制",
        xfor: "插入报头",
        manageStatus: "管理状态"
      },
      editBefore: {},
      advanceName: Vue.t("network.advanceRight"),
      moreAttribute: false,
      dialogVisible: false,
      isDisabled: false,
      loading: false,
      rules: {
        name: [
          { type: "onlyLetterNumber_Chinese" },
          { type: "requiredNet" },
          { type: "maxSize", value: 40 }
        ],
        description: [{ type: "maxSize", value: 255 }],
        timeoutClient: [{ type: "requiredNet" }, { type: "integer" }],
        tcpInspect: [{ type: "requiredNet" }, { type: "integer" }],
        timeoutMemconnect: [{ type: "requiredNet" }, { type: "integer" }],
        timeoutMemData: [{ type: "requiredNet" }, { type: "integer" }],
        connectLimit: [{ type: "requiredNet" }, { type: "integer" }],
        manageStatus: [{ type: "requiredNet" }]
      }
    };
  },
  mounted() {
    this.dialogVisible = true;
    this.steptwoForm.name = this.listener.name;
    this.steptwoForm.description = this.listener.description;
    this.steptwoForm.protocol = this.listener.protocol;
    this.steptwoForm.manageStatus = this.listener.admin_state_up;
    this.steptwoForm.port = this.listener["protocol_port"];
    this.steptwoForm.connectLimit = this.listener["connection_limit"];
    this.steptwoForm.timeoutClient = this.listener["timeout_client_data"];
    this.steptwoForm.timeoutMemconnect = this.listener["timeout_member_connect"];
    this.steptwoForm.timeoutMemData = this.listener["timeout_member_data"];
    this.steptwoForm.tcpInspect = this.listener["timeout_tcp_inspect"];
    this.steptwoForm.xforwardedfor =
      this.listener["insert_headers"] &&
      this.listener["insert_headers"]["X-Forwarded-For"] == "true";
    this.steptwoForm.xforwardedport =
      this.listener["insert_headers"] &&
      this.listener["insert_headers"]["X-Forwarded-Port"] == "true";
    for (let [k, v] of Object.entries(this.steptwoForm)) {
      this.editBefore[k] = v;
    }
    this.editBefore.xfor = [];
    if (this.editBefore.xforwardedfor) {
      this.editBefore.xfor.push("X-Forwarded-For");
    }
    if (this.editBefore.xforwardedport) {
      this.editBefore.xfor.push("X-Forwarded-Port");
    }
    delete this.editBefore.xforwardedport;
    delete this.editBefore.xforwardedfor;
    this.editBefore.manageStatus = (this.editBefore.manageStatus === true) ? "UP" : "DOWN";
  },
  methods: {
    cancel() {
      this.$emit("handleCancelShow");
    },
    handleClose(done) {
      this.$emit("handleCancelShow", {});
      done();
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
    handleEditConfirm() {
      let self = this;
      let listener = {
        listener: {
          name: self.steptwoForm.name,
          description: self.steptwoForm.description,
          connection_limit: self.steptwoForm.connectLimit,
          timeout_client_data: self.steptwoForm.timeoutClient,
          timeout_member_connect: self.steptwoForm.timeoutMemconnect,
          timeout_member_data: self.steptwoForm.timeoutMemData,
          timeout_tcp_inspect: self.steptwoForm.tcpInspect,
          admin_state_up: self.steptwoForm.manageStatus
        }
      };
      if (this.listener.protocol !== "UDP" && this.listener.protocol !== "TCP" && this.listener.protocol !== "HTTPS") {
        listener.listener.insert_headers = {
          "X-Forwarded-For": self.steptwoForm.xforwardedfor
            ? "true"
            : "false",
          "X-Forwarded-Port": self.steptwoForm.xforwardedport
            ? "true"
            : "false"
        }
      }
      let listenerId = self.listener["id"];
      self.$refs.steptwoForm.validate(async valid => {
        if (valid) {
          self.isDisabled = true;
          self.loading = true;
          let editBefore = "";
          let editAfter = "";
          let afterData = self.steptwoForm;
          afterData.xfor = [];
          if (afterData.xforwardedfor) {
            afterData.xfor.push("X-Forwarded-For");
          }
          if (afterData.xforwardedport) {
            afterData.xfor.push("X-Forwarded-Port");
          }
          delete afterData.xforwardedport;
          delete afterData.xforwardedfor;
          afterData.manageStatus = (afterData.manageStatus === true) ? "UP" : "DOWN";
          for (let [k, v] of Object.entries(self.log)) {
            let before = `${v}: ${self.editBefore[k]} `;
            let after = `${v}: ${afterData[k]} `;
            editBefore += before;
            editAfter += after;
          }
          self.$ajax({
            type: "PUT",
            url: "api/octavia/v2.0/lbaas/listeners/" + listenerId,
            data: JSON.stringify(listener),
            errorKey: "NeutronError",
            successMsg: Vue.t("network.saveSuccess"),
            complete: function(XMLHttpRequest, textStatus) {
              self.loading = false;
              self.isDisabled = false;
              self.$emit("handleEditShow", {});
            },
            log: {
              description: {
                en:"Before edit monitor name:"+self.listener.name+", After edit monitor name:" + self.steptwoForm.name,
                zh_cn:`监听器修改前: ${editBefore},监听器修改后: ${editAfter}`
              },
              target: Vue.logTarget.balance
            }
          });
          return true;
        } else {
          return false;
        }
      });
    }
  }
};
</script>
