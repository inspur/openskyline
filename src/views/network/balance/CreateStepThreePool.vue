<template>
<div>
  <el-row>
    <el-col :span="16">
      <el-form class="me-required-form margin-tb20" :model="stepthreeForm" :rules=rules ref="stepthreeForm" label-width="100px">
        <el-form-item :label="$t('lang.name')" class="is-required" prop="name">
          <el-input class="col-20" v-model="stepthreeForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('network.method')" class="is-required" prop="protocol">
          <el-select class="col-20" v-model="stepthreeForm.protocol">
            <el-option :label="$t('network.leastconnect')" value="LEAST_CONNECTIONS"></el-option>
            <el-option :label="$t('network.roundRobin')" value="ROUND_ROBIN"></el-option>
            <el-option :label="$t('network.sourceIP')" value="SOURCE_IP"></el-option>
          </el-select>
          <el-tooltip  effect="dark" placement="top">
            <div slot="content">{{$t('network.respoolNote1')}}<br/>{{$t('network.respoolNote2')}}{{$t('network.respoolNote3')}}<br>{{$t('network.respoolNote4')}}{{$t('network.respoolNote5')}}<br>{{$t('network.respoolNote6')}}{{$t('network.respoolNote7')}}<br/>{{$t('network.respoolNote8')}}{{$t('network.respoolNote9')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('network.monitor')" class="is-required" prop="listenerID">
          <el-select class="col-20" v-model="stepthreeForm.listenerID" @change="getListenerprotocol()">
            <el-option v-for="item in listeners" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('network.sessionpersi')" prop="sessionType">
          <el-select class="col-20" v-model="stepthreeForm.sessionType">
            <el-option label="None" value=""></el-option>
            <el-option label="SOURCE_IP" value="SOURCE_IP"></el-option>
            <el-option label="HTTP_COOKIE" value="HTTP_COOKIE" v-if="protocol!='UDP' && !UDPFlag && stepthreeForm.listenerID"></el-option>
            <el-option label="APP_COOKIE" value="APP_COOKIE" v-if="protocol!='UDP' && !UDPFlag && stepthreeForm.listenerID"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('network.PERSISTENCE_TIMEOUT')" class="is-required" prop="persistence_timeout" v-if="(protocol=='UDP' || UDPFlag) && stepthreeForm.sessionType=='SOURCE_IP'">
          <el-input-number v-model="stepthreeForm.persistence_timeout" controls-position="right" :min="0" :max="86400" class="col-20"></el-input-number>
          <el-tooltip  effect="dark" placement="top">
            <div slot="content">{{$t('network.PERSISTENCE_TIMEOUT_TOOLTIP')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="$t('network.PERSISTENCE_GRANULARITY')" class="is-required" prop="persistence_granularity" v-if="(protocol=='UDP' || UDPFlag) && stepthreeForm.sessionType=='SOURCE_IP'">
          <el-input class="col-20" v-model="stepthreeForm.persistence_granularity" auto-complete="off"></el-input>
          <el-tooltip  effect="dark" placement="top">
            <div slot="content">{{$t('network.PERSISTENCE_GRANULARITY_TOOLTIP')}}</div>
            <i class="el-icon-fa-question-circle"></i>
          </el-tooltip>
        </el-form-item>
        <el-form-item :label="'Cookie'+$t('lang.name')" class="is-required" prop="cookieName" v-if="stepthreeForm.sessionType=='APP_COOKIE'">
          <el-input class="col-20" v-model="stepthreeForm.cookieName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('lang.desc')" prop="description">
          <el-input type="textarea" class="col-20" v-model="stepthreeForm.description" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
  <div class="me-form-footer">
    <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
    <el-button @click="prevStep" type="primary" v-if="prevStepFlag">{{$t('lang.preStep')}}</el-button>
    <el-button @click="nextStep" type="primary" >{{$t('lang.nextStep')}}</el-button>
  </div>
 </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
export default {
  name: 'StepThreePool',
  props: ["prevStepFlag", "protocol"],
  data() {
    return {
      monitorProtocol: "",
      UDPFlag: false,
      listeners: [],
      balancerId: this.$route.params.balanceId,
      activeIndex: 2,
      stepthreeForm: {
        name: '',
        description: '',
        protocol: 'ROUND_ROBIN',
        sessionType:"",
        cookieName:"",
        managestatus:true,
        listenerID: "",
        listenerprotocol: "",
        persistence_timeout: '360',
        persistence_granularity: '255.255.255.255'
      },
      dialogVisible: false,
      rules: {
        name: [
          {type: 'onlyLetterNumber_Chinese'},
          {type: "requiredNet"},
          {type: 'maxSize', value: 40}
        ],
        listenerID: [
          { type: 'required', trigger: 'blur change' }
        ],
        description: [
          {type: 'maxSize', value: 255}
        ],
        cookieName: [
          {type: 'onlyLetterNumber'},
          {type: "requiredNet"},
          {type: 'maxSize', value: 255}
        ],
        protocol: [
          {type: "requiredNet"}
        ],
        persistence_timeout: [
          { type: "requiredNet" }, { type: "integer" }
        ],
        persistence_granularity: [
          {type: "requiredNet"},
          {type: "isValidMask"}
        ]
      }
    }
  },
  mounted() {
    this.getListenerInfo();
  },
  methods: {
    getListenerprotocol() {
      this.UDPFlag = false;
      for (let i = 0; i < this.listeners.length; i++) {
        if (this.listeners[i].id === this.stepthreeForm.listenerID) {
          this.stepthreeForm.listenerprotocol = this.listeners[i].protocol;
          this.monitorProtocol = this.stepthreeForm.listenerprotocol;
          this.$emit("setMonitorProtocol", this.monitorProtocol);
          if (this.stepthreeForm.listenerprotocol === "UDP") {
            this.UDPFlag = true;
            this.$emit("IsUDP", true);
          } else {
            this.$emit("IsUDP", false);
          }
        }
      }
    },
    async getListenerInfo() {
      let self = this;
      try {
        let result = await self.$ajax({
          type: "get",
          url:
            "api/octavia/v2.0/lbaas/listeners?loadbalancer_id=" +
            this.balancerId,
          error: "NeurtronError"
        });
        let listenersTmp = [];
        for (let i = 0; i < result.listeners.length; i++) {
          if (!result.listeners[i].default_pool_id) {
            listenersTmp.push(result.listeners[i]);
          }
        }
        self.listeners = listenersTmp;
      } catch (res) {}
    },
    nextStep() {
      this.$refs.stepthreeForm.validate((valid) => {
        if (valid) {
          this.$emit("stepThreeDone", {});
        } else {
          return false;
        }
      });
    },
    prevStep() {
      this.$emit("prevStep", 1);
    },
    cancel() {
      this.$emit("cancel");
    }
  }
}
</script>
