<template>
  <el-dialog
    :title="$t('scalingService.createScalingService')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
    <el-steps :active="activeIndex" process-status="process" finish-status="success" align-center> 
      <el-step :title="$t('scalingService.baseInfo')"></el-step>
      <el-step :title="$t('scalingService.scalingSpec')"></el-step>
      <el-step :title="$t('base.user')"></el-step>
      <el-step :title="$t('scalingService.loadblancePolicy')" v-if="lbFlag"></el-step>
    </el-steps>
    <step-one @stepOneDone="stepOneDone" @cancel="cancel" v-show="activeIndex == 0" ref="stepOne" @lbBalanceChange="lbBalanceChange"></step-one>
    <step-two @prevStep="prevStep" @stepTwoDone="stepTwoDone" @cancel="cancel" v-show="activeIndex == 1" ref="stepTwo"></step-two>
    <step-three @prevStep="prevStep" @stepThreeDone="stepThreeDone" @cancel="cancel" v-show="activeIndex == 2" ref="stepThree" :lbFlag="lbFlag"></step-three>
    <step-four @prevStep="prevStep" @stepFourDone="stepFourDone" @cancel="cancel" v-show="activeIndex == 3" ref="stepFour"></step-four>
  </el-dialog>
</template>
<script>
import StepOne from "./CreateStepOne";
import StepTwo from "./CreateStepTwo";
import StepThree from "./CreateStepThree";
import StepFour from "./CreateStepFour";
export default {
  name: "CreateScalingServiceGuide",
  components: {
    StepOne,
    StepTwo,
    StepThree,
    StepFour
  },
  data() {
    return {
      activeIndex: 0,
      dialogVisible: false,
      scalingSerCreateForm: {},
      lbFlag: false
    };
  },
  mounted() {
    this.initDialog();
  },
  methods: {
    initDialog() {
      let self = this;
      self.dialogVisible = true;
    },
    prevStep(activeIndex) {
      this.activeIndex = activeIndex;
      Vue.scrollToHeader();
    },
    stepOneDone(param) {
      let self = this;
      this.activeIndex = 1;
      Vue.scrollToHeader();
      self.scalingSerCreateForm = Object.assign(
        {},
        self.scalingSerCreateForm,
        param
      );
    },
    stepTwoDone(param) {
      let self = this;
      this.activeIndex = 2;
      Vue.scrollToHeader();
      self.scalingSerCreateForm = Object.assign(
        {},
        self.scalingSerCreateForm,
        param
      );
    },
    stepThreeDone(param) {
      let self = this;
      Vue.scrollToHeader();
      self.scalingSerCreateForm = Object.assign(
        {},
        self.scalingSerCreateForm,
        param
      );
      if (!self.lbFlag) {
        self.createAction();
      } else {
        self.activeIndex = 3;
      }
    },
    stepFourDone(param) {
      let self = this;
      Vue.scrollToHeader();
      self.scalingSerCreateForm = Object.assign(
        {},
        self.scalingSerCreateForm,
        param
      );
      self.createAction();
    },
    handleClose() {
      this.$emit("handleAddShow", {});
    },
    cancel() {
      this.$emit("handleAddShow", {});
    },
    lbBalanceChange(flg) {
      if (flg) {
          this.lbFlag = true;
      } else {
          this.lbFlag = false;
      }
    },
    async submitParams(body, scalingServiceName) {
      let self = this;
      try {
        let ret = await this.$ajax({
          url: "api/senlin/v1/clusters/001/actions",
          data: body,
          type: "post",
          successMsg: this.$t("scalingService.sendApplySuccess"),
          log: {
            description: {
              en: "create scalingService:" + scalingServiceName,
              zh_cn: "创建伸缩服务:" + scalingServiceName
            },
            target: Vue.logTarget.ScalingService
          },
          successFun: () => {
            setTimeout(function() {
              if (self.lbFlag) {
                self.$refs.stepFour.loading = false;
              } else {
                self.$refs.stepThree.loading = false;
              }
              self.$emit("handleAddShow", {});
              self.$emit("refreshData");
            }, 3000);
          },
          errorKey: "Error",
          errFun: () => {
            if (self.lbFlag) {
              self.$refs.stepFour.loading = false;
            } else {
              self.$refs.stepThree.loading = false;
            }
            self.$emit("handleAddShow", {});
          }
        });
      } catch (res) {}
    },
    async createAction() {
      let self = this;
      let scalingServiceName = self.scalingSerCreateForm.scalingServiceName;
      let instanceName = self.scalingSerCreateForm.instanceName;
      let flavor = self.scalingSerCreateForm.instanceType;
      let zone = self.scalingSerCreateForm.domain;
      let image = self.scalingSerCreateForm.image;
      let network = self.scalingSerCreateForm.network;
      let maxSize = self.scalingSerCreateForm.maxSize;
      let minSize = self.scalingSerCreateForm.minSize;
      let desiredCapacity = self.scalingSerCreateForm.desiredSize;
      let outSize = self.scalingSerCreateForm.increaseSize;
      let inSize = self.scalingSerCreateForm.reduceSize;

      let body = {
        senlin_service: {
          profile: {
            profile: {
              metadata: {},
              name: "profile001",
              spec: {
                properties: {
                  flavor: flavor,
                  image: image,
                  admin_pass: self.scalingSerCreateForm.userPass,
                  name: instanceName,
                  availability_zone: zone,
                  networks: [
                    {
                      network: network,
                      security_groups: [self.scalingSerCreateForm.securityGroup]
                    }
                  ],
                  security_groups: ["default"]
                },
                type: "os.nova.server",
                version: "1.0"
              }
            }
          },
          cluster: {
            cluster: {
              config: {},
              desired_capacity: desiredCapacity,
              max_size: maxSize,
              min_size: minSize,
              name: scalingServiceName,
              metadata: {},
              profile_id: "mystack",
              timeout: 3600
            }
          },
          out: {
            policy: {
              name: "sp001",
              spec: {
                properties: {
                  adjustment: {
                    min_step: 1,
                    number: outSize,
                    type: "CHANGE_IN_CAPACITY"
                  },
                  event: "CLUSTER_SCALE_OUT"
                },
                type: "senlin.policy.scaling",
                version: "1.0"
              }
            }
          },
          in: {
            policy: {
              name: "sp001",
              spec: {
                properties: {
                  adjustment: {
                    min_step: 1,
                    number: inSize,
                    type: "CHANGE_IN_CAPACITY"
                  },
                  event: "CLUSTER_SCALE_IN"
                },
                type: "senlin.policy.scaling",
                version: "1.0"
              }
            }
          }
        }
      };
      if (zone == "") {
        delete body.senlin_service.profile.profile.spec.properties.availability_zone;
      }
      if (self.lbFlag== true) {
        //LoadBalance
        let lbSubnet = self.scalingSerCreateForm.subnet;
        let lbMethod = self.scalingSerCreateForm.method;
        let lbProtocol = self.scalingSerCreateForm.protocol;
        let lbPort = self.scalingSerCreateForm.port;
        let lbPoolSubnet = self.scalingSerCreateForm.poolSubnet;
        body.senlin_service.lb = {
          policy: {
            name: "sp001",
            spec: {
              properties: {
                pool: {
                  protocol: lbProtocol,
                  protocol_port: lbPort,
                  subnet: lbPoolSubnet,
                  lb_method: lbMethod,
                  admin_state_up: true,
                  session_persistence: {
                    type: "HTTP_COOKIE",
                    cookie_name: "hello"
                  }
                },
                vip: {
                  protocol: lbProtocol,
                  protocol_port: lbPort,
                  connection_limit: -1,
                  subnet: lbSubnet,
                  admin_state_up: true,
                  address: self.removeZerofromip(
                    self.scalingSerCreateForm.ipaddress
                  )
                },
                health_monitor: {
                  type: "PING",
                  delay: 20,
                  timeout: 20,
                  max_retries: 3,
                  http_method: "GET",
                  url_path: "/health",
                  expected_codes: 200,
                  admin_state_up: true
                },
                lb_status_timeout: 300
              },
              type: "senlin.policy.loadbalance",
              version: "1.1"
            }
          }
        };
        if (self.scalingSerCreateForm.ipaddress != "") {
          body = JSON.stringify(body);
          //校验IP地址是否在子网内，IP地址是否被占用
          let cidr = "";
          let subnetOptions = self.$refs.stepFour.subnetOptions;
          for (let i = 0; i < subnetOptions.length; i++) {
            let item = subnetOptions[i];
            if (item.id === self.scalingSerCreateForm.subnet) {
              cidr = item["cidr"];
            }
          }
          let reqdata = {
            ip: self.removeZerofromip(self.scalingSerCreateForm.ipaddress),
            cidr: cidr
          };
          self.$ajax({
            type: "post",
            url: "api/neutron/v2.0/inspur/networkextension/validate_ip_in_cidr",
            data: JSON.stringify(reqdata),
            showErrMsg: false,
            success: function(res) {
              if (res) {
                let ipreqdata = {
                  ip: self.removeZerofromip(
                    self.scalingSerCreateForm.ipaddress
                  ),
                  subnet_id: self.scalingSerCreateForm.subnet
                };
                self.$ajax({
                  type: "post",
                  url:
                    "api/neutron/v2.0/inspur/networkextension/ip_is_used_in_subnet",
                  data: JSON.stringify(ipreqdata),
                  showErrMsg: false,
                  success: function(res) {
                    if (!res) {
                      self.submitParams(body, scalingServiceName);
                    } else {
                      self.$refs.stepFour.loading = false;
                      self.$notify.error({
                        message: Vue.t('scalingService.ipisOccupy')
                      });
                      return;
                    }
                  },
                  errFun() {
                    self.$refs.stepFour.loading = false;
                  }
                });
              } else {
                self.$refs.stepFour.loading = false;
                self.$notify.error({
                  message: Vue.t("network.ipnotsubnet")
                });
                return;
              }
            },
            errFun() {}
          });
        } else {
          delete body.senlin_service.lb.policy.spec.properties.vip.address;
          body = JSON.stringify(body);
          self.submitParams(body, scalingServiceName);
        }
      } else {
        body = JSON.stringify(body);
        self.submitParams(body, scalingServiceName);
      }
    },
    removeZerofromip(ip) {
      let newaddress = "";
      let address2 = ip.split(".");
      for (let i = 0; i < address2.length; i++) {
        if (address2[i].length == 2) {
          if (address2[i].substr(0, 1) == "0") {
            address2[i] = address2[i].substr(1);
          }
        } else if (address2[i].length == 3) {
          if (address2[i].substr(0, 1) == "0" && address2[i].substr(1, 1) == "0") {
            address2[i] = address2[i].substr(2);
          } else if (address2[i].substr(0, 1) == "0" && address2[i].substr(1, 1) != "0") {
            address2[i] = address2[i].substr(1);
          }
        }
        if (i != 3) {
          newaddress += address2[i] + ".";
        } else {
          newaddress += address2[i];
        }
      }
      return newaddress;
    }
  }
};
</script>
<style scoped>
</style>