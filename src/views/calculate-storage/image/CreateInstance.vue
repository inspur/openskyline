<template>
<div>
<el-dialog
  :title="instancesTitle"
  :visible.sync="dialogVisible"
  :before-close="handleClose" size="middle">
  <el-row type="flex" :gutter="20">
      <el-col :span="18">
         <el-steps :space="180" :active="activeIndex" process-status="process" finish-status="success">
           <el-step :title="$t('calcStorLang.baseInfo')"></el-step>
           <el-step :title="$t('calcStorLang.instanceConfig')"></el-step>
           <el-step :title="$t('calcStorLang.netConfig')"></el-step>
           <el-step :title="$t('calcStorLang.createInstAdditinConfig')"></el-step>
        </el-steps>
        <step-one @stepOneDone="stepOneDone" @cancel="cancel" v-show="activeIndex == 0" ref="stepOne"
        :detailConfig="InstanceDetail" @handleProjectShow="handleProjectShow"></step-one>
        <step-three @prevThreeStep="prevStep" @stepThreeDone="stepThreeDone" @cancel="cancel" v-show="activeIndex == 2" ref="stepThree" :detailConfig="InstanceDetail" :projectId="projectId"></step-three>
        <step-four @prevFourStep="stepOneDone" @stepFourDone="stepFourDone" @cancel="cancel" @prevFiveStep="prevFiveStep" v-show="activeIndex == 3" ref="stepFour" :projectId="projectId" :detailConfig="InstanceDetail" v-loading="loading" element-loading-text="数据提交中"></step-four>
        <step-five v-show="activeIndex == 4" ref="stepFive" @fivePrevStep="fivePrevStep" @finshStep="finshStep" @cancel="cancel" :detailConfig="InstanceDetail" :projectId="projectId"></step-five>
      </el-col>
      <el-col :span="6">
        <el-form>
          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <thead>
                <tr class="even">
                  <th class="is-left is-leaf"><el-tag type="primary">{{$t('calcStorLang.configParams')}}</el-tag></th>
                  <th class="is-left is-leaf"></th>
                </tr>
              </thead>
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{$t('calcStorLang.instanceName')}}：</th>
                  <td class="idatatd">
                    <el-tooltip class="item" :content="InstanceDetail.name.substring(0, 20)" placement="top" v-show="InstanceDetail.name.length > 0">
                      <span>{{InstanceDetail.name.length>8?InstanceDetail.name.substring(0, 8) + "...":InstanceDetail.name}}</span>
                    </el-tooltip>
                  </td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('calcStorLang.imageName')}}：</th>
                  <td class="idatatd">
                    <el-tooltip class="item" :content="InstanceDetail.iso" v-show="InstanceDetail.iso.length > 0">
                      <span>{{InstanceDetail.iso.length>8?InstanceDetail.iso.substring(0, 8) + "...":InstanceDetail.iso}}</span>
                    </el-tooltip>
                  </td>
                </tr>
                <tr class="odd">
                  <th class="idatath">CPU：</th>
                  <td class="idatatd">{{activeIndex<=1?'-':InstanceDetail.cpu}}{{$t('calcStorLang.core')}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('lang.memory')}}：</th>
                  <td class="idatatd">{{activeIndex<=1?'-':InstanceDetail.memory}}GB</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('calcStorLang.disk')}}：</th>
                  <td class="idatatd">{{activeIndex<=1?'-':InstanceDetail.disk}}GB</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('calcStorLang.count')}}：</th>
                  <td class="idatatd">{{InstanceDetail.count}}</td>
                </tr>
              </tbody>
              <thead>
                <tr class="even">
                  <th class="is-left is-leaf"><el-tag type="primary">{{$t('calcStorLang.objectNum')}}</el-tag></th>
                  <th class="is-left is-leaf"></th>
                </tr>
              </thead>
              <tbody>
                <tr class="odd">
                  <th class="idatath">vCPU：</th>
                  <td class="idatatd">
                    <el-tooltip class="item" :content="InstanceDetail.vCPU" placement="top" v-show="InstanceDetail.vCPU.length > 0">
                      <span>{{InstanceDetail.vCPU}}</span>
                    </el-tooltip>
                  </td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t('calcStorLang.memory')}}：</th>
                  <td class="idatatd">
                    <el-tooltip class="item" :content="InstanceDetail.mem" placement="top" v-show="InstanceDetail.mem.length > 0">
                      <span>{{InstanceDetail.mem}}</span>
                    </el-tooltip>
                  </td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('calcStorLang.instance')}}：</th>
                  <td class="idatatd">
                    <el-tooltip class="item" :content="InstanceDetail.host" placement="top" v-show="InstanceDetail.host.length > 0">
                      <span>{{InstanceDetail.host}}</span>
                    </el-tooltip>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-form>
      </el-col>
    </el-row>
</el-dialog>
 <select-project ref="selectProject" :multiple="false" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
 <share-project ref="selectProject" v-if="selShareFlg" :currentProId="proId" :selProjectList="selProjectList" :selImageId="selImageId" @getSelectProjects="getSelProjects"></share-project>
</div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import StepOne from './../instance/CreateStepOne';
import StepThree from './../instance/CreateStepThree';
import StepFour from './../instance/CreateStepFour';
import StepFive from './../instance/CreateStepFive';
import ShareProject from './ShareProject';
export default {
  name: 'CreateInstance',
  props: ['size', 'projectListMap', 'imageId', 'iso', 'imageProName', 'proId', 'min_disk', 'min_ram', 'privateFlag', 'osValue', 'isIsoMedia', 'imageVisibility'],
  components: {
    StepOne, StepThree, StepFour, StepFive, ShareProject
  },
  data() {
    return {
      activeIndex: 0,
      flag: false,
      isoCofigFlag:true,
      dialogVisible: false,
      selImageId: this.imageId,
      selProjectList: this.projectListMap,
      InstanceDetail: {
        vCPU:'',
        mem:'',
        host:'',
        name: '',
        iso: '',
        size: '',
        sizeUnit: '',
        cpu: '--',
        memory: '--',
        disk: '--',
        count: '1',
        roleType: Vue.roleType + "",
        proUserId: '',
        templateType: '1',
        tempIsNewVolume: false,
        tempVolumeSize: '',
        instLimit: '',
        instInUse: '',
        proId: '',
        private: false,
        osValue: '',
        type: 1,
        userData: ''
      },
      loading: false,
      projectId: '',
      selProjectFlg: false,
      selShareFlg: false,
      //stepTwoParam: '',
      stepThreeParam: '',
      instancesTitle: (Vue.roleType + "" == "3") ? Vue.t('calcStorLang.applyInstance') : Vue.t('calcStorLang.create')
    }
  },
  mounted() {
  //  this.$parent.$parent.active = "instances";
    var self = this;
    self.initDialog();
    self.InstanceDetail.private = self.privateFlag;
    self.InstanceDetail.proId = self.proId;
    if (Vue.roleType + "" != "0") {
      this.InstanceDetail.proId = this.$cookie.get("pid");
    }
    if (self.privateFlag) {
      self.$nextTick(() => {
        self.$refs.stepOne.projectCreateForm.projectList = self.proId;
        self.$refs.stepOne.projectCreateForm.projectId = self.proId;
        if (self.InstanceDetail.roleType == "0") {
          // bug 33696
          self.$refs.stepOne.projectCreateForm.projectName = self.imageProName;
          self.$refs.stepOne.changeQuota(self.proId);
        }
        self.$refs.stepOne.loadUserList();
        self.$refs.stepOne.loadProjectDetail();
      });
    }
    if (self.isIsoMedia + '' == "true") {
      self.$nextTick(() => {
        self.$refs.stepOne.countDisabled = true;
      });
    } else {
      self.$nextTick(() => {
        self.$refs.stepOne.countDisabled = false;
      });
    }
    self.InstanceDetail.iso = self.iso;
    self.InstanceDetail['min_disk'] = self.min_disk;
    self.InstanceDetail['min_ram'] = self.min_ram;
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    prevStep(activeIndex) {
      this.flag = false;
      this.activeIndex = activeIndex;
      Vue.scrollToHeader();
    },
    stepOneDone(param) {
      var self = this;
      self.InstanceDetail.size = self.size;
      this.activeIndex = 2;
      Vue.scrollToHeader();
      self.projectId = self.$refs.stepOne.projectCreateForm.projectId;
      self.InstanceDetail.proUserId = self.$refs.stepOne.projectCreateForm.userUuId;
      var stepThree = self.$refs.stepThree;
      stepThree.isoCofigFlag =true;
      var osType = self.osValue;
      if (osType == "" || osType == null) {
         stepThree.resetPassFlg = true;
         stepThree.keyShowFlg = true;
      } else {
        if (osType.toLocaleLowerCase().indexOf("win") >= 0) { //osType == "other"
          stepThree.keyShowFlg = true;
        } else {
          stepThree.keyShowFlg = false;
        }
          stepThree.resetPassFlg = false;
      }
    },
    stepThreeDone(param) {
      var self = this;
      this.stepThreeParam = param;
      this.activeIndex = 3;
      Vue.scrollToHeader();
      var stepFour = this.$refs.stepFour;
      let rows = this.InstanceDetail.count;
      if (parseInt(rows) > 1) {
          stepFour.projectCreateForm.type = "1";
          stepFour.portDisabled = true;
          stepFour.cardIpDisabled = true;
          $(".ipAddressColumn").find("input").val("");
        } else {
          stepFour.portDisabled = false;
          stepFour.cardIpDisabled = false;
        }
    },
    async stepFourDone(o) {
      var self = this;
      self.loading = true;
      var stepOne = self.$refs.stepOne;
      /*var stepTwo = self.$refs.stepTwo; //v-if 导致refs为null
      var stepThree = self.$refs.stepThree;*/
      var stepThree = self.$refs.stepThree.projectCreateForm;
      var stepFour = self.$refs.stepFour;
      var stepFive = self.$refs.stepFive;
      let name = stepOne.projectCreateForm.name;
      let description = stepOne.projectCreateForm.description;
      let zone = stepOne.projectCreateForm.domain //availability_zone
      if (stepOne.projectCreateForm.type == "2") {
          let hostName = stepOne.projectCreateForm.nodeHostName;
          zone = zone + "::" + hostName;
      }
      let flavorRef = self.stepThreeParam.flavorsUuid;
      let imageRef = self.imageId;
      var isNewVolume = self.stepThreeParam.isNewVolume;
      let deviceName = "vda";
      let volumeSize = self.stepThreeParam.size;
      let deleteTermination = self.stepThreeParam.isDelVolume;
      let volumeType = self.stepThreeParam.newVolumeType;

      let netList = stepFour.multipleSelection;
      var networks = [];
      var netType = stepFour.projectCreateForm.type;
      if (netType !== "3") {
        for (let n = 0; n < netList.length; n++) {
          var net = netList[n];
          var obj;
          if ("2" == netType) {
            obj = {"port": net.id};
          } else {
            var netIpValue = $("#ip" + net.id).find("input[type='text']").val();
            const fixedMac = net.fixed_mac;
            obj = {'uuid': net.id};
            if (self.InstanceDetail.roleType !== '3' && netIpValue !== null && netIpValue !== '') {
              obj.fixed_ip = netIpValue;
            }
            if (self.InstanceDetail.roleType !== '3' && fixedMac !== null && fixedMac !== '') {
              obj.fixed_mac = fixedMac;
            }
          }
          networks.push(obj);
        }
      } else if (netType === "3") {
        // 选择网络策略模板
        const strategyInfo = stepFour.strategyInfo;
        const network = {};
        // 网络策略模板绑定了网络和子网只能传子网，只绑定了网络就传网络
        if (strategyInfo.length) {
          const strategy = strategyInfo[0];
          if (strategy.subnet_id) {
            network.subnet_id = strategy.subnet_id;
          } else {
            network.uuid = strategy.network_id;
          }
          if (strategy.qos_policy_id) {
            network.qos_policy_id = strategy.qos_policy_id;
          }
          if (strategy.security_groups.length) {
            network.security_groups = strategy.security_groups;
          }
        }
        networks.push(network);
      }

      let url = "api/nova/v2.1/servers-inspur";
      let maxCount = this.InstanceDetail.count;
      let body = {
        "server": {
          "name": name,
          "flavorRef": flavorRef,
          "imageRef": imageRef,
          "availability_zone": zone,
          // "key_name": keyName,
          // "adminPass": adminPass,
          "networks": networks,
          security_groups: [],
          "min_count": 1,
          "max_count":maxCount,
          "description":description
        }
      };
      if (stepOne.projectCreateForm.type == "2") {
        body['OS-SCH-HNT:scheduler_hints'] = {"_nova_check_type": true};
      }
      if (self.InstanceDetail.roleType == "0") {
         body.server.projectId = self.projectId;
         body.server.userId = self.InstanceDetail.proUserId;
      }
      let vncPassword = stepFive.projectCreateForm.vncPassword; //控制台密码
      if (vncPassword != "" && vncPassword != null) {
         body.server.metadata = { "vncpasswd":vncPassword };
      }
      var screenStrategy = stepFive.projectCreateForm.screenStrategy;
      if (screenStrategy != "") {
        if (body.server.metadata != null) {
          body.server.metadata.panic = screenStrategy;
        } else {
          body.server.metadata = { "panic":screenStrategy };
        }
      }
      if (stepFive.projectCreateForm.userData !== '') {
        body.server.user_data = Base64.encode(stepFive.projectCreateForm.userData);
      }
      var serverSecurity = null;
      let serverSecurityList = stepFive.multipleSelection;
      if (serverSecurityList != null && serverSecurityList.length > 0) {
        var serSecObj = serverSecurityList[0];
        serverSecurity = { "group": serSecObj.id };
      }
      if (serverSecurity != null) {
        body['os:scheduler_hints'] = serverSecurity;
      }
      var volumeList = [];
      if (isNewVolume) { //创建卷
            body.server['imageRef'] = "";
            volumeList.push({"boot_index": 0, "uuid":imageRef, "source_type": "image", "device_name": deviceName, "volume_size":volumeSize, "volume_type":volumeType, "destination_type": "volume", "delete_on_termination": deleteTermination});
            body.server['block_device_mapping_v2'] = volumeList;
            body.server['OS-DCF:diskConfig'] = "AUTO";
            // body['volume_type'] = volumeType;
      }
      let loginType = stepThree.defaultType;
      var keyName = "";
      var adminPass = "";
      if ("2" == loginType) {
          keyName = stepThree.keyPairValue;
          body.server['key_name'] = keyName;
      } else if ("3" == loginType) {
          adminPass = self.stepThreeParam.userPass;
          body.server.adminPass = adminPass;
      }
      if (netType !== "3") {
        for (var i = o["sgs"].length - 1; i >= 0; i--) {
          body.server["security_groups"].push({"name":o["sgs"][i]});
        }
      }
      body = JSON.stringify(body);
      var logContent = {};
      var logMsg = "创建云主机:";
      if (maxCount > 1) {
        logMsg = "批量创建" + maxCount + "个云主机:";
      }
      logContent = {
           "description": {
              "en": "Create Instance:" + name,
              "zh_cn": logMsg + name
           },
           "target": Vue.logTarget.computeInstance
       };
      try {
        let ret = await this.$ajax({
          url: url,
          data: body,
          type: 'post',
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          },
          log: logContent,
          successMsg: Vue.t('calcStorLang.addInstanceSuccessfully')
        });
        self.$message(Vue.t('calcStorLang.submitCompleted'));
        self.$emit("handleCreateInsShow", {});
        // self.$emit("onRefresh");
        self.$router.push({
          path: '/calculate-storage/instances-list'
        });
      } catch (data) {
        self.loading = false;
        stepFour.netloading = false;
        stepFour.clearStatusRender();
        __DEV__ && console.error(data);
      }
    },
    stepTwoDone(param) {
      this.activeIndex = 2;
      Vue.scrollToHeader();
    },
    fivePrevStep(activeIndex) { //第五步 点上一步
      this.activeIndex = activeIndex;
      Vue.scrollToHeader();
    },
    prevFiveStep(activeIndex) {
      this.activeIndex = activeIndex;
      Vue.scrollToHeader();
    },
    finshStep() { //第五步 完成
      var self = this;
      var stepFour = self.$refs.stepFour;
      var valueT = stepFour.valueT;
      self.stepFourDone({"sgs":valueT});
    },
    handleClose(done) {
      this.$emit("handleCreateInsShow", {});
      done();
    },
    cancel() {
      this.$emit("handleCreateInsShow", {});
    },
    getSelProjects(id, name) {
      let self = this;
      self.$refs.stepOne.projectCreateForm.projectList = id;
      self.$refs.stepOne.projectCreateForm.projectId = id;
      self.$refs.stepOne.projectCreateForm.projectName = name;
      self.$refs.stepOne.close = "close";
      self.$refs.stepOne.projectCreateForm.userUuId = "";
      self.$refs.stepOne.number = 1;
      self.$refs.stepOne.loadUserList();
      self.$refs.stepOne.loadProjectDetail();
      self.$refs.stepOne.changeQuota(id);
    },
    handleProjectShow() {
      if (this.imageVisibility == "shared") {
        this.selShareFlg = true;
      } else {
        this.selProjectFlg = true;
      }
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    }
  }
}
</script>
<style scoped>
.idatath {
  width: 45%;
  line-height: 40px;
}

</style>
