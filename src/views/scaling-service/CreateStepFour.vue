<template>
  <div>
    <el-form abel-position="left" class="me-required-form" :model="scalingSerCreateForm" :rules=rules ref="scalingSerCreateForm" label-width="120px" v-loading="loading">
      <el-form-item :label="$t('network.subnet')"  class="is-required" prop="subnet">
        <el-select v-model="scalingSerCreateForm.subnet" class="col-15" filterable>
          <el-option v-for="item in subnetOptions" :key="item.id" :label="item.name + '(' + item.cidr + ')'" :value="item.id"></el-option>
        </el-select>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.balanceNote1')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('network.ipaddress')" prop="ipaddress">
        <el-input class="col-15" v-model="scalingSerCreateForm.ipaddress"></el-input>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('network.balanceNote22')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('scalingService.method')" prop="method" class="is-required">
        <el-select v-model="scalingSerCreateForm.method" class="col-15">
          <el-option :label="$t('scalingService.leastConnections')" value="LEAST_CONNECTIONS"></el-option>
          <el-option :label="$t('scalingService.roundRobin')" value="ROUND_ROBIN"></el-option>
          <el-option :label="$t('scalingService.sourceIp')" value="SOURCE_IP"></el-option>
        </el-select>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('scalingService.leastConnectionsInfo')}}</div>
          <div slot="content">{{$t('scalingService.roundRobinInfo')}}</div>
          <div slot="content">{{$t('scalingService.sourceIpInfo')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('scalingService.protocol')" prop="protocol" class="is-required" >
        <el-select v-model="scalingSerCreateForm.protocol" class="col-15">
          <el-option label="HTTP" value="HTTP"></el-option>
          <el-option label="HTTPS" value="HTTPS"></el-option>
          <el-option label="TCP" value="TCP"></el-option>
        </el-select>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('scalingService.selectProtocol')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item :label="$t('scalingService.port')" prop="port" class="is-required">
        <el-input-number v-model="scalingSerCreateForm.port" :min="1" :max="65535" class="col-15">
        </el-input-number>
        <el-tooltip  effect="dark" placement="top">
          <div slot="content">{{$t('scalingService.portInfo')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
    </el-form>
    <div class="me-form-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="prevStep" type="primary" :disabled="loading">{{$t('lang.preStep')}}</el-button>
      <el-button @click="nextStep" type="primary" :disabled="loading">{{$t('lang.finish')}}</el-button>
    </div>
  </div>
</template>
<script>
export default {
  name: "CreateStepTwo",
  data() {
    return {
      subnetOptions: [],
      loading: false,
      scalingSerCreateForm: {
        subnet: "",
        method: "LEAST_CONNECTIONS",
        protocol: "HTTP",
        port: "8080",
        blflag: false,
        ipaddress: ""
      },
      rules: {
        subnet: [{ type: "required", trigger: "blur change" }],
        ipaddress: [{ type: "ipv4" }]
      }
    };
  },
  mounted() {
    this.initSubnetList();
  },
  methods: {
    async initSubnetList() {
      let self = this;
      let url = "api/neutron/v2.0/subnets";
      try {
        let result = await self.$ajax({
          type: "get",
          url: url,
          showErrMsg: true
        });
        let list = result["subnets"];
        let subnets = [];
        if (list != null) {
          for (let z = 0; z < list.length; z++) {
            let subnet = list[z];
            subnets.push(subnet);
          }
        }
        self.subnetOptions = subnets;
      } catch (res) {}
    },
    nextStep() {
      this.$refs.scalingSerCreateForm.validate(valid => {
        if (valid) {
          this.loading = true;
          this.$emit("stepFourDone", this.scalingSerCreateForm);
        } else {
          return false;
        }
      });
    },
    prevStep() {
      this.$emit("prevStep", 2);
    },
    cancel() {
      this.$emit("cancel");
    }
  }
};
</script>
<style scoped>
</style>   