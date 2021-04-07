<template>
<div>
  <el-dialog :title="instancesTitle" :visible.sync="dialogVisible" :before-close="handleClose" size="middle">
    <el-row type="flex" :gutter="20">
      <el-col :span="18">
        <el-steps :space="175" :active="activeIndex" process-status="process" finish-status="success">
          <el-step :title="$t('calcStorLang.baseInfo')"></el-step>
          <el-step :title="$t('calcStorLang.chooseTem')"></el-step>
          <el-step :title="$t('calcStorLang.physicalHostConfig')"></el-step>
          <el-step :title="$t('calcStorLang.net') + $t('calcStorLang.config')"></el-step>
        </el-steps>
        <step-one @stepOneDone="stepOneDone" @selectUser="selectUser" @selectProject="selectProject" @cancel="cancel" v-show="activeIndex == 0" ref="stepOne" :detailConfig="InstanceDetail"></step-one>
        <step-two @prevStep="prevStep" @stepTwoDone="stepTwoDone" @cancel="cancel" v-show="activeIndex == 1" ref="stepTwo" :detailConfig="InstanceDetail" :projectId="projectId"></step-two>
        <step-three @prevThreeStep="stepOneDone" @stepThreeDone="stepThreeDone" @flavor="getFlavor" @cancel="cancel" v-show="activeIndex == 2" ref="stepThree" :detailConfig="InstanceDetail" :projectId="projectId" :domain="domain"></step-three>
        <step-four @prevFourStep="stepTwoDone" @stepFourDone="stepFourDone" @cancel="cancel" v-show="activeIndex == 3" ref="stepFour" :projectId="projectId" :detailConfig="InstanceDetail" v-loading="loading" :element-loading-text="$t('calcStorLang.dataSubmission')"></step-four>
      </el-col>
      <el-col :span="6">
        <el-form>
          <div class="table_panel">
            <table class="table table-content table-hover idatatable" border="1">
              <thead>
                <tr class="even">
                  <th class="is-left is-leaf"><el-tag type="primary">{{$t("calcStorLang.configParams")}}</el-tag></th>
                  <th class="is-left is-leaf"></th>
                </tr>
              </thead>
              <tbody>
                <tr class="odd">
                  <th class="idatath">{{$t("calcStorLang.physicalHost") + $t("lang.name")}}：</th>
                  <td class="idatatd" style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis">
                    <el-tooltip class="item" :content="InstanceDetail.name" placement="top" v-show="InstanceDetail.name.length > 0">
                      <span>{{InstanceDetail.name.length>7?InstanceDetail.name.substring(0, 6) + "...":InstanceDetail.name}}</span>
                    </el-tooltip>
                  </td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t("calcStorLang.template") + $t("lang.name")}}：</th>
                  <td class="idatatd" style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis">
                    <el-tooltip class="item" :content="InstanceDetail.iso" v-show="InstanceDetail.iso.length > 0">
                      <span>{{InstanceDetail.iso.length>7?InstanceDetail.iso.substring(0, 6) + "...":InstanceDetail.iso}}</span>
                    </el-tooltip>
                  </td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t("calcStorLang.template") + $t("calcStorLang.size")}}：</th>
                  <td class="idatatd">{{InstanceDetail.sizeUnit}}</td>
                </tr>
                <tr class="even">
                  <th class="idatath">CPU：</th>
                  <td class="idatatd">{{InstanceDetail.cpu}} {{$t('calcStorLang.core')}}</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t("calcStorLang.memory")}}：</th>
                  <td class="idatatd">{{InstanceDetail.memory}}GB</td>
                </tr>
                <tr class="even">
                  <th class="idatath">{{$t("calcStorLang.disk")}}：</th>
                  <td class="idatatd">{{InstanceDetail.disk}}GB</td>
                </tr>
                <tr class="odd">
                  <th class="idatath">{{$t('calcStorLang.count')}}：</th>
                  <td class="idatatd">{{InstanceDetail.count}}</td>
                </tr>
               <!--  <tr class="even" v-show="InstanceDetail.roleType!='3'">
                  <th class="idatath">云物理机总计：</th>
                  <td class="idatatd">{{InstanceDetail.instLimit}}</td>
                </tr>
                <tr class="odd" v-show="InstanceDetail.roleType!='3'">
                  <th class="idatath">当前用量：</th>
                  <td class="idatatd">{{InstanceDetail.instInUse}}</td>
                </tr> -->
              </tbody>
            </table>
          </div>
        </el-form>
      </el-col>
    </el-row>
  </el-dialog>
  <select-project ref="selectProject" v-if="selProjectFlg" @getSelectProjects="getSelProjects"></select-project>
  <select-user ref="selectUser" v-if="selUserFlg" @getSelUser="getSelUser" :instProjectId="projectId"></select-user>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import StepOne from './CreateStepOne';
import StepTwo from './CreateStepTwo';
import StepThree from './CreateStepThree';
import StepFour from './CreateStepFour';
export default {
  name: 'AddInstance',
  components: {
    StepOne,
    StepTwo,
    StepThree,
    StepFour
  },
  data() {
    return {
      domain: "",
      activeIndex: 0,
      dialogVisible: false,
      InstanceDetail: {
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
        instInUse: ''
      },
      bareUUID: "",
      flavor:{},
      loading: false,
      projectId: '',
      selProjectFlg:false,
      selUserFlg:false,
      stepTwoParam: '',
      stepThreeParam: '',
      instancesTitle: (Vue.roleType + "" == "3") ? "申请云物理机" : this.$t('calcStorLang.addPhysicalHost')
    }
  },
  mounted() {
    // this.$parent.$parent.active = "instances";
    this.initDialog();
  },
  methods: {
    initDialog() {
      var self = this;
      self.dialogVisible = true;
    },
    prevStep(activeIndex) {
      this.activeIndex = activeIndex;
      Vue.scrollToHeader();
    },
    stepOneDone(param) {
      var self = this;
      this.activeIndex = 1;
      Vue.scrollToHeader();
      self.projectId = self.$refs.stepOne.projectCreateForm.projectId;
      self.InstanceDetail.proUserId = self.$refs.stepOne.projectCreateForm.userUuId;
      self.domain = self.$refs.stepOne.projectCreateForm.domain;
    },
    stepThreeDone(param) {
      this.stepThreeParam = param;
      this.bareUUID = this.stepThreeParam.bareUUID;
      this.activeIndex = 3;
      Vue.scrollToHeader();
      var stepFour = this.$refs.stepFour;
      let rows = this.InstanceDetail.count;
      if (parseInt(rows) > 1) {
        stepFour.projectCreateForm.type = "1";
        stepFour.cardIpDisabled = true;
        $(".ipAddressColumn").find("input").val("");
      } else {
        stepFour.cardIpDisabled = false;
      }
    },
    getFlavor(f) {
      this.flavor = f;
    },
    selectProject() {
      this.selProjectFlg = true;
      this.$nextTick(() => {
        this.$refs.selectProject.show();
      });
    },
    selectUser(pid) {
      this.projectId = this.$refs.stepOne.projectCreateForm.projectId;
      this.selUserFlg = true;
      this.$nextTick(() => {
        this.$refs.selectUser.show();
      });
    },
    getSelProjects(id, name) {
      this.$refs.stepOne.projectCreateForm.projectId = id;
      this.$refs.stepOne.projectCreateForm.projectName = name;
      this.$refs.stepOne.projectChange(id);
      this.$refs.stepOne.close = 'close'
    },
    getSelUser(id, name) {
      this.$refs.stepOne.projectCreateForm.userUuId = id;
      this.$refs.stepOne.projectCreateForm.projectOwner = name;
      this.$refs.stepOne.close2 = 'close';
    },
    async stepFourDone(o) {
      var self = this;
      self.loading = true;
      var creInstType = "1"; //1:超级/项目管理员创建; 2:组织用户申请
      var applyData = {};
      if (self.InstanceDetail.roleType == "3") {
        creInstType = "2";
      }
      var stepOne = self.$refs.stepOne;
      /*var stepTwo = self.$refs.stepTwo; //v-if 导致refs为null
      var stepThree = self.$refs.stepThree;*/
      var stepFour = self.$refs.stepFour;
      let name = stepOne.projectCreateForm.name;
      let description = stepOne.projectCreateForm.description;
      let zone = stepOne.projectCreateForm.domain //availability_zone
      let flavorRef = self.stepThreeParam.flavorsUuid;
      self.flavor = self.$refs.stepThree.getOption(flavorRef);
      var imageRef = self.stepTwoParam.imageRef;
      //第二步
      let templateType = self.stepTwoParam.type; // 1 镜像 2 云硬盘 3 硬盘快照 4 主机快照
      var isNewVolume = self.stepTwoParam.isNewVolume;
      let deviceName = "vda";
      let volumeSize = self.stepTwoParam.size;
      let deleteTermination = self.stepTwoParam.isDelVolume;
      // 第三步
     /* if (this.stepThreeParam.type == "2") {
        let hostName = this.stepThreeParam.nodeHostName;
        zone = zone + "::" + hostName;
      }*/
      //第四步
      let netList = stepFour.multipleSelection;
      var networks = [];
      var netType = stepFour.projectCreateForm.type;
      for (let n = 0; n < netList.length; n++) {
          var net = netList[n];
          var obj;
          if ("2" == netType) {
             obj = {"port": net.id};
          } else {
            let netIpValue = $("#ip" + net.id).find("input[type='text']").val();
            if (self.InstanceDetail.roleType != "3" && netIpValue != null && netIpValue != "") {
              obj = {"uuid": net.id, "fixed_ip": netIpValue};
            } else {
              obj = {"uuid": net.id};
            }
          }
          networks.push(obj);
        }
      let url = "api/nova/v2.1/servers-inspur";
      if (creInstType == "2") {
        url = "api/leo/v1/order/create_order";
      }
      let maxCount = this.InstanceDetail.count;
      let metadata = self.stepTwoParam.userPass ? {"admin_pass":self.stepTwoParam.userPass} : {};
      let setAdminPass = self.stepTwoParam.userPass || "";
      let body = {
        "server": {
          "tags": ["@"],
          "name": name,
          "flavorRef": flavorRef,
          "imageRef": imageRef,
          "availability_zone": zone,
          // "key_name": keyName,
          "adminPass": setAdminPass,
          "metadata": metadata,
          "networks": networks,
          "security_groups": [],
          "min_count": 1,
          "max_count":maxCount,
          "description":description,
          "config_drive":true
        }
      };
      if (self.InstanceDetail.roleType == "0") {
         body.server.projectId = self.projectId;
         body.server.userId = self.InstanceDetail.proUserId;
         body.server.availability_zone = zone + "::" + self.bareUUID;
      } else if (self.InstanceDetail.roleType == "3") {
         body.server.projectId = self.$cookie.get("pid");
         body.server.userId = Vue.userId;
      } else if (self.InstanceDetail.roleType == "2") {
        body.server.availability_zone = zone + "::" + self.bareUUID;
      }
      var volumeList = [];
      if ("1" == templateType) {
          if (isNewVolume) { //创建卷
            body.server['imageRef'] = "";
            volumeList.push({"boot_index": 0, "uuid":imageRef, "source_type": "image", "device_name": deviceName, "volume_size":volumeSize, "destination_type": "volume", "delete_on_termination": deleteTermination});
            body.server['block_device_mapping_v2'] = volumeList;
            body.server['OS-DCF:diskConfig'] = "AUTO";
          }
      } else if ("2" == templateType) {
          body.server['imageRef'] = "";
          volumeList.push({"volume_id":imageRef, "delete_on_termination": deleteTermination, "device_name": deviceName});
          body.server['block_device_mapping'] = volumeList;
          body.server['OS-DCF:diskConfig'] = "AUTO";
      } else if ("3" == templateType) {
         body.server['imageRef'] = "";
         volumeList.push({"snapshot_id":imageRef, "delete_on_termination": deleteTermination, "device_name": deviceName});
         body.server['block_device_mapping'] = volumeList;
         body.server['OS-DCF:diskConfig'] = "AUTO";
      } else if ("4" == templateType) {
         if (isNewVolume) { //创建卷
            body.server['imageRef'] = "";
            volumeList.push({"boot_index": 0, "uuid":imageRef, "source_type": "image", "device_name": deviceName, "volume_size":volumeSize, "destination_type": "volume", "delete_on_termination": deleteTermination});
            body.server['block_device_mapping_v2'] = volumeList;
            body.server['OS-DCF:diskConfig'] = "AUTO";
          }
      }
      if ("1" == templateType || "4" == templateType) {
         //登录方式
        let loginType = self.stepTwoParam.defaultType;
        var keyName = "";
        var adminPass = "";
        if ("2" == loginType) {
          keyName = self.stepTwoParam.keyPairValue;
          body.server['key_name'] = keyName;
        } else if ("3" == loginType) {
          adminPass = self.stepTwoParam.userPass;
          body.server.adminPass = adminPass;
        }
      }
      for (var i = o["sgs"].length - 1; i >= 0; i--) {
        body.server["security_groups"].push({"name":o["sgs"][i]});
      }
      body = JSON.stringify(body);
      var logContent = {};
      var successMsg = this.$t('calcStorLang.addPhysicalHostSuccess');
     logContent = {
         "description": {
            "en": "Create Instance:" + name,
            "zh_cn": "创建云物理机:" + name
         },
         "target": Vue.logTarget.computePhysical
     };
    //  self.beforSubmit(imageRef);
      try {
        let ret = await this.$ajax({
          url: url,
          data: creInstType == "2"?applyData:body,
          type: 'POST',
          headers: {
            'X-OpenStack-Nova-API-Version': 2.67
          },
          successMsg: successMsg,
          log: logContent,
          errorKey: "badRequest"
        });
        self.$message(Vue.t("calcStorLang.submitCompleted"));
        self.$emit("handleAddShow", {});
        self.$emit("onRefresh");
        if (creInstType == "1" && (isNewVolume || templateType == "3") ) { //间隔刷新volume列表，否则来源为-
          self.$emit("reloadVolume");
        }
      } catch (data) {
        self.loading = false;
        __DEV__ && console.error(data);
      }
    },
    async beforSubmit(imageId) {
      let self = this;
      try {
            let ret = await self.$ajax({
              url: 'api/glance/v2/images/' + imageId,
              type: 'get'
            });
            let ramdiskid = ret['ramdisk_id'];
            let kernelid = ret['kernel_id'];
            // let barelist = self.getBareList();
            var cpu = self.flavor.vcpus;
            var mem = self.flavor.ram;
            var disk = self.flavor.disk;
            var r = [];
            let result = await self.$ajax({
              type: 'get',
              url: 'api/ironic/v1/nodes/detail'
            });
            var list = result['nodes'];
            if (list != null) {
              for (let p = 0; p < list.length; p++) {
                var b = list[p].properties;
                if (b.cpus == cpu && b.local_gb == disk && b.memory_mb == mem && list[p].instance_uuid == null) {
                  r.push(list[p]);
                }
              }
            }
            self.$sequence({
              type: 'patch',
              url: 'api/ironic/v1/nodes/{uuid}',
              params: r,
              headers:{"x-openstack-ironic-api-version":1.31},
              datas:[
                    {"path":"/instance_info/image_source", "value":imageId, "op":"add"},
                    {"path":"/instance_info/kernel", "value":kernelid, "op":"add"},
                    {"path":"/instance_info/ramdisk", "value":ramdiskid, "op":"add"},
                    {"path":"/instance_info/root_gb", "value":self.flavor.disk, "op":"add"}
                    ],
              paramKeys:["uuid"]
            }).then((data) => {
              // self.$message("添加/刪除主机成功！");
              // self.$emit("manHandleShow", {});
              // self.$emit("getData", {});
              // self.$emit("reaz", {});
            }).catch((err) => {
              console.log(err);
              // self.$emit("manHandleShow", {});
              // self.$emit("getData", {});
            });
          } catch (data) {
            this.loading = false;
            __DEV__ && console.error(data);
          }
    },
    // async getBareList() {
    //   var self = this;
    //   var cpu = self.flavor.vcpus;
    //   var mem = self.flavor.ram;
    //   var disk = self.flavor.disk;
    //   var r = [];
    //   try {
    //     let result = await self.$ajax({
    //       type: 'get',
    //       url: 'api/ironic/v1/nodes/detail',
    //       successFun:function() {
    //         var list = result['nodes'];
    //         if (list != null) {
    //           for (let p = 0; p < list.length; p++) {
    //             var b = list[p].properties;
    //             if (b.cpus == cpu && b.local_gb == disk && b.memory_mb == mem && list[p].instance_uuid == null) {
    //               r.push(list[p]);
    //             }
    //           }
    //         }
    //         return r;
    //       }
    //     });
    //   } catch (res) {
    //     // self.loading = false;
    //   }
    // },
    stepTwoDone(param) {
      if (typeof param == "object") {
        this.stepTwoParam = param;
      }
      this.activeIndex = 2;
      Vue.scrollToHeader();
    },
    handleClose(done) {
      this.$emit("handleAddShow", {});
      done();
    },
    cancel() {
      this.$emit("handleAddShow", {});
    }
  }
}

</script>
<style scoped>
.idatath {
  width: 60%;
  line-height: 40px;
}

</style>
