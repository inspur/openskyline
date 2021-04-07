<template>
  <div>
    <icos-page-header :title="$t('opt.orderApprove')" :show-back="true" @back="cancleApprove" :show-bottom-border="true" />
    <icos-page>
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card style="width:680px">
          <el-form :inline="true" class="">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item :label="$t('opt.ordernumber')"></el-form-item>
                <el-form-item :label="applyData.orderName"></el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('opt.detailStatus')"></el-form-item>
                <el-form-item :label="applyData.orderState"></el-form-item>
              </el-col>
              <el-col :span="12" v-show="!isProject()">
                <el-form-item :label="$t('opt.processName')"></el-form-item>
                <el-form-item :label="applyData.flowName"></el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('opt.detailProposer')"></el-form-item>
                <el-form-item :label="applyData.projectUserName"></el-form-item>
              </el-col>
              <el-col :span="12" v-if="!!applyData.description">
                <el-form-item :label="$t('opt.detailDesc')"></el-form-item>
                <el-form-item>
                  <el-tooltip :content="applyData.description" v-show="((applyData.description)+'').length > 20">
                  <span>{{((applyData.description)+'').substring(0, 20) + "..."}}</span>
                  </el-tooltip>
                  <span v-show="((applyData.description)+'').length <= 20">{{applyData.description}}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12" v-show="isCreateVolume()">
                <el-form-item :label="$t('opt.hardDiskName')">
                  <div v-if="(applyData.name + '').length < 20">{{applyData.name}}</div>
                  <div v-else style="text-overflow: ellipsis;overflow: hidden;white-space: nowrap;">{{(applyData.name + '').substring(0, 20) + "..."}}</div>
                </el-form-item>
              </el-col>
              <el-col :span="12" v-show="isCreateVolume()">
                <el-form-item :label="$t('opt.size')"></el-form-item>
                <el-form-item :label="applyData.size"></el-form-item>
              </el-col>
              <el-col :span="12" v-show="isCreateVolume()">
                <el-form-item :label="$t('opt.detailNumber')"></el-form-item>
                <el-form-item :label="applyData.num"></el-form-item>
              </el-col>
              <el-col :span="12" v-show="isUpdateVolume()">
                <el-form-item :label="$t('opt.hardDiskName')"></el-form-item>
                <el-form-item>
                  <el-tooltip :content="applyData.updateName" v-show="((applyData.updateName)+'').length > 20">
                  <span>{{((applyData.updateName)+'').substring(0, 20) + "..."}}</span>
                  </el-tooltip>
                  <span v-show="((applyData.updateName)+'').length <= 20">{{applyData.updateName}}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12" v-show="isUpdateVolume()">
                <el-form-item :label="$t('opt.size')"></el-form-item>
                <el-form-item :label="applyData.updateSize"></el-form-item>
              </el-col>
              <el-col :span="12" v-show="isCreateVm()">
                <el-form-item :label="$t('opt.cloudHostName')"></el-form-item>
                <el-form-item :label="applyData.vmName"></el-form-item>
              </el-col>
              <el-col :span="12" v-show="isCreateVm()">
                <el-form-item label="CPU："></el-form-item>
                <el-form-item :label="applyData.cpuNum"></el-form-item>
              </el-col>
              <el-col :span="12" v-show="isCreateVm()">
                <el-form-item :label="$t('opt.detailMemory')"></el-form-item>
                <el-form-item :label="applyData.memory"></el-form-item>
              </el-col>
              <el-col :span="12" v-show="isCreateVm()" v-if="!applyData.volumeNum">
                <el-form-item :label="$t('opt.detailHardDisk')"></el-form-item>
                <el-form-item :label="applyData.disk"></el-form-item>
              </el-col>
              <el-col :span="12" v-show="isCreateVm()" v-if="!!applyData.volumeNum">
                <el-form-item :label="$t('opt.detailVolume')"></el-form-item>
                <el-form-item :label="applyData.volumeNum"></el-form-item>
              </el-col>
              <el-col :span="12" v-show="isCreateVm()">
                <el-form-item :label="$t('opt.detailNumber')"></el-form-item>
                <el-form-item :label="applyData.vmNum"></el-form-item>
              </el-col>
              <el-col :span="12" v-show="isUpdateVm()">
                <el-form-item :label="$t('opt.cloudHostName')"></el-form-item>
                <el-form-item>
                  <el-tooltip :content="applyData.vmUpdateName" v-show="((applyData.vmUpdateName)+'').length > 20">
                  <span>{{((applyData.vmUpdateName)+'').substring(0, 20) + "..."}}</span>
                  </el-tooltip>
                  <span v-show="((applyData.vmUpdateName)+'').length <= 20">{{applyData.vmUpdateName}}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12" v-show="isUpdateVm()">
                <el-form-item label="CPU："></el-form-item>
                <el-form-item :label="applyData.cpuUpdateNum"></el-form-item>
              </el-col>
              <el-col :span="12" v-show="isUpdateVm()">
                <el-form-item :label="$t('opt.detailMemory')"></el-form-item>
                <el-form-item :label="applyData.updateMemory"></el-form-item>
              </el-col>
              <el-col :span="12" v-show="isUpdateVm()">
                <el-form-item :label="$t('opt.detailHardDisk')"></el-form-item>
                <el-form-item :label="applyData.updateDisk"></el-form-item>
              </el-col>
              <el-col :span="12" v-show="isProject()">
                <el-form-item :label="$t('opt.projectName')"></el-form-item>
                <el-form-item>
                  <el-tooltip :content="applyData.projectName" v-show="((applyData.projectName)+'').length > 20">
                  <span>{{((applyData.projectName)+'').substring(0, 20) + "..."}}</span>
                  </el-tooltip>
                  <span v-show="((applyData.projectName)+'').length <= 20">{{applyData.projectName}}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12" v-show="isProject()">
                <el-form-item :label="$t('opt.VCPUNumber')"></el-form-item>
                <el-form-item :label="applyData.VCPUNumber+''"></el-form-item>
              </el-col>
              <el-col :span="12" v-show="isProject()">
                <el-form-item :label="$t('opt.instancesNumber')"></el-form-item>
                <el-form-item :label="applyData.instancesNumber+''"></el-form-item>
              </el-col>
              <el-col :span="12" v-show="isProject()">
                <el-form-item :label="$t('opt.networkNumber')"></el-form-item>
                <el-form-item :label="applyData.networkNumber+''"></el-form-item>
              </el-col>
              <el-col :span="12" v-show="isProject()">
                <el-form-item :label="$t('opt.volumesNumber')"></el-form-item>
                <el-form-item :label="applyData.volumesNumber+''"></el-form-item>
              </el-col>
              <!-- 云物理机 -->
              <el-col :span="12" v-if="applyData.resourceType == 'HOST.CREATE'">
                <el-form-item :label="$t('opt.cloudPhysicalHostName')"></el-form-item>
                <el-form-item :label="applyData.name"></el-form-item>
              </el-col>
              <el-col :span="12" v-if="applyData.resourceType == 'HOST.CREATE'">
                <el-form-item :label="$t('opt.image')"></el-form-item>
                <el-form-item :label="imageMap.get(applyData.imageRef)"></el-form-item>
              </el-col>
              <el-col :span="12" v-if="applyData.resourceType == 'HOST.CREATE'">
                <el-form-item :label="$t('opt.net')"></el-form-item>
                <el-form-item :label="applyData.network"></el-form-item>
              </el-col>
              <el-col :span="12" v-if="applyData.resourceType == 'HOST.CREATE'">
                <el-form-item :label="$t('opt.availableDomain')"></el-form-item>
                <el-form-item :label="applyData.availability_zone"></el-form-item>
              </el-col>
              <el-col :span="12" v-if="applyData.resourceType == 'HOST.CREATE'">
                <el-form-item label="CPU："></el-form-item>
                <el-form-item :label="applyData.cpu"></el-form-item>
              </el-col>
              <el-col :span="12" v-if="applyData.resourceType == 'HOST.CREATE'">
                <el-form-item :label="$t('opt.detailMemory')"></el-form-item>
                <el-form-item :label="applyData.mem"></el-form-item>
              </el-col>
              <el-col :span="12" v-if="applyData.resourceType == 'HOST.CREATE'">
                <el-form-item :label="$t('opt.detailHardDisk')"></el-form-item>
                <el-form-item :label="applyData.disk"></el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form>
          <el-form-item v-for="(approveInfo, index) in approveHistoryInfo" :key="approveInfo.id" :label="index>0?(index+'.').toString():''">
            <el-tooltip :content="approveInfo.level" v-show="approveInfo.level.length > 40">
              <span>{{ approveInfo.level.substring(0, 40) + "..." }}</span> 
            </el-tooltip>
            <span v-show="approveInfo.level.length <= 40">{{ approveInfo.level }}</span>
          </el-form-item>
        </el-form>
        <el-collapse v-model="activeNames" style="text-align:left">
          <el-collapse-item :title="currentApprover" name="disk">
            <el-form ref="formApprove" :inline="true" :model="formInline" class="" v-loading="loading" :element-loading-text="$t('opt.dataLoading')" style="text-align:center;" :rules="rules">
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item :label="$t('opt.opinion')" prop="approveOpinion" style="margin-bottom:20px">
                    <el-input auto-complete="off" v-model="formInline.approveOpinion"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <span></span>
                </el-col>
                <el-col :span="24">
                  <el-form-item :label="$t('opt.approval')" prop="loginVer">
                    <el-radio-group v-model="formInline.loginVer">
                      <el-radio class="radio" value="1" label="1">{{$t('opt.agreement')}}</el-radio>
                      <el-radio class="radio" value="2" label="2">{{$t('opt.reject')}}</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>
              <div>
                <el-button v-if='approveFlag' type="primary" @click="approveOrder">{{$t('opt.reference')}}</el-button>
                <el-button v-if='approveFlag' type="primary" @click="cancleApprove">{{$t('opt.cancel')}}</el-button>
              </div>
            </el-form>
          </el-collapse-item>
        </el-collapse>
      </el-col>
    </el-row>
    </icos-page>
  </div>
</template>
<script>
import DetailApply from './FlowHisDialog';
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: "FlowDetail",
  components: {
    DetailApply
  },
  data() {
    return {
      orderId: this.$route.params.orderId,
      selectRow: this.$route.params.selectRow,
      orderEntity: "",
      userMaps: new Map(),
      imageMap: new Map(),
      applyData: {},
      approveHistory: {},
      level: "",
      approveFlag: true,
      loading: false,
      activeNames: ['disk'],
      formInline: {
        approveOpinion: "",
        loginVer: "1"
      },
      currentApprover: "",
      rules: {
        approveOpinion: [
          { type: 'maxSize', value: 255 }
        ]
      },
      approveHistoryInfo: [{
        level: ""
      }]
    };
  },
  mounted() {
    var self = this;
    self.currentApprover = self.$t('opt.Approval') + Vue.userName + self.$t('opt.ApprovalOrder');
    Promise.all([self.getUserList(), self.getImageList()]).then(function(result) {
      self.orderInformation();
    });
  },
  methods: {
    ...mapMutations({
      setOrderInfo: 'setOrderInfo'
    }),
    cancleApprove() {
      let parentPath = this.$route.matched[1].path;
      this.$router.push({
        path: '/operations/flow'
      });
    },
    async approveOrder() {
      var self = this;
      var url = "";
      if (self.applyData.resourceType === "PROJECT.CREATE") {
        url = "api/leo/v1/order/handle_project_order";
      } else {
        url = "api/leo/v1/order/handle_order";
      }
      var id = self.orderId;
      var approverId = Vue.userId;
      var radioSel = Number(self.formInline.loginVer);
      var approveResult = "";
      if (radioSel === 1) {
        approveResult = "PASSED";
      } else {
        approveResult = "REJECTED";
      };
      var approveResultCN = "";
      if (radioSel === 1) {
        approveResultCN = self.$t('opt.agreement');
      } else {
        approveResultCN = self.$t('opt.reject');
      };
      var approverOpinion = self.formInline.approveOpinion;
      let mark = false;
      self.$refs.formApprove.validate((valid) => {
        mark = valid;
      });
      if (!mark) {
        return false;
      }
      self.loading = true;
      let params = {
        "order_id": id,
        "approver_id": approverId,
        "approver_result": approveResult,
        "approve_opinion": approverOpinion
      };
      params = JSON.stringify(params);
      self.$ajax({
        type: "PUT",
        data: params,
        url: url,
        successFun(response) {
          self.$message.success(Vue.t('opt.orderApprovalSuccess'));
          self.loading = false;
          self.getOrderNum();
          if (radioSel === 1) {
            if (self.selectRow.resType === "PROJECT.CREATE") {
              //由于leo那边是每个region部署了一套，但是项目那边keystone是所有region共享的
              //所以需要每个region下创建一个默认的审批流程
              for (const key in Vue.regionServices) {
                if (Vue.regionServices.hasOwnProperty(key)) {
                  const element = Vue.regionServices[key];
                  if (element && element["leo"]) {
                    self.addDefaultFlow(key);
                  }
                }
              }
            }
          }
          let parentPath = self.$route.matched[1].path;
          self.$router.push({
            path: '/operations/flow'
          });
        },
        errFun() {
          self.$router.push({
            path: '/operations/flow'
          });
          self.loading = false;
        },
        log: {
          description: {
            en: "Order Approve:"+self.applyData.orderName+"-"+approveResultCN,
            zh_cn: self.$t('opt.orderApproval')+self.applyData.orderName+"-"+approveResultCN
          },
          target: Vue.logTarget.Order
        }
      });
    },
    async getOrderNum() {
      var self = this;
      var approverId = Vue.userId;
      var projectId = "";
      if (Vue.roleType === "0") {
        projectId = "";
      } else {
        projectId = this.$cookie.get('pid');
      };
      var params = {
        "approver_id": approverId,
        "role_type": Vue.roleType,
        "project_id": projectId
      };
      params = JSON.stringify(params);
      var approvingOrderNum;
      var approvingFaultNum;
      try {
        let ret = await self.$ajax({
          type: "PUT",
          data: params,
          polling: true,
          url: "api/leo/v1/order/get_approve_order_amount"
        });
        approvingOrderNum = ret.data.flow_order_approve_amount;
        approvingFaultNum = ret.data.work_order_approve_amount;
      } catch (res) {
        console.log(self.$t('opt.getOrderNumberFailed'));
      };
      self.setOrderInfo({
        faultNum: approvingOrderNum,
        orderNum: approvingFaultNum
      });
    },
    async qryProjectByName(projectName) {
      let ret = await this.$ajax({
        type: 'get',
        url: "api/keystone/v3/inspur/projects?name=" + projectName
      });
      let projects = ret["projects"];
      let project= projects.find(function(item) {
        return item.name === projectName;
      });
      return project;
    },
    async addDefaultFlow (regionId) {
      let self = this;
      try {
        let {applyProjectName, proposer} = self.selectRow;
        let project = await self.qryProjectByName(applyProjectName);
        let resourceIds= await self.getResourceIdList(regionId);
        let reqdata = {
          "name": applyProjectName +"_default_flow",
          "node_number": 1,
          "auto_approve": true,
          "op_desc": Vue.t('base.project')+":"+ '"' + applyProjectName + '"' + Vue.t('opt.createflowNote'),
          "creator_role": '0',
          "project_ids": project.id,
          "resource_ids": resourceIds,
          "node_info": [{
            "node_rule": "ANYPASS",
            "approvers_ids": Vue.userId
          }]
        };
        let result = self.$ajax({
          type: "POST",
          url: "api/leo/v1/flow/create_flow",
          data: JSON.stringify(reqdata),
          regionId: regionId,
          showErrMg: false,
          success: function(result) {
            self.loading = false;
          },
          errFun: function() {
          },
          log: {
            description: {
              en: "Create default process:"+ applyProjectName +" default flow",
              zh_cn: "项目:" + applyProjectName +"审批通过后自动创建的审批流程"
            },
            target: Vue.logTarget.process_manage
          },
          errorKey: "NeutronError"
        });
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async getResourceIdList(regionId) {
      let self = this;
      let resultData = [];
      try {
        let ret = await this.$ajax({
          type: 'get',
          regionId: regionId,
          url: "api/leo/v1/resource/get_flow_resource"
        });
        let resource = ret.resource || [];
        let temp = "1,";
        for (let i = 0; i < resource.length; i++) {
          temp = temp + resource[i].id + ',';
        }
        temp = temp.substr(0, temp.length-1);
        return temp;
      } catch (data) {
      }
    },
    async getUserList() {
      var param = {
        domain_id: "default"
      };
      var self = this;
      try {
        let result = await this.$ajax({
          type: "GET",
          url: "api/keystone/v3/inspur/users?" + $.param(param)
        });
        let userList = result["users"];
        for (var p = 0; p < userList.length; p++) {
          var obj = userList[p];
          self.userMaps.set(obj.id, obj.name);
        }
      } catch (e) {
        __DEV__ && console.error(e);
      }
    },
    async getNetworkInfo(uuid) {
      try {
        let result1 = await this.$ajax({
          type: "GET",
          url: "api/neutron/v2.0/networks/" + uuid
        });
        if (result1 && result1["network"]) {
          let network = result1["network"];
          return network["name"] || "";
        }
      } catch (e) {
        __DEV__ && console.error(e);
        return "";
      }
    },
    async getImageList() {
      let result = await this.$ajax({
        type: "GET",
        url: "api/glance/v2/images?limit=99999&status=active"
      });
      let imageList = result.images;
      this.imageMap = new Map();
      for (let i = 0; i < imageList.length; i++) {
        let image = imageList[i];
        let name = image['name'];
        if (name) {
          this.imageMap.set(image['id'], name);
        } else {
          this.imageMap.set(image['id'], image['id']);
        }
      }
    },
    async orderInformation() {
      var self = this;
      var reqdata = {
        order_id: self.orderId,
        language: Vue.language
      };
      try {
        let ret = await this.$ajax({
          url: "api/leo/v1/order/get_order_details?"+ $.param(reqdata),
          type: 'GET'
        });
        self.orderEntity = ret.data;
        self.applyData.orderName = self.orderEntity.order_name;
        let orderState = self.orderEntity.order_state;
        switch (orderState) {
        case "APPROVING":
          self.applyData.orderState = self.$t('opt.approving');
          break;
        case "SUPER_ADMIN_APPROVING":
          self.applyData.orderState = self.$t('opt.approving');
          break;
        case "PASSED":
          self.applyData.orderState = self.$t('opt.approved');
          break;
        case "HANDLED":
          self.applyData.orderState = self.$t('opt.handled');
          break;
        case "REVOCATION":
          self.applyData.orderState = self.$t('opt.fail');
          break;
        case "REJECTED":
          self.applyData.orderState = self.$t('opt.repulse');
          break;
        default:
          self.applyData.orderState = "-";
        };
        // applyData.orderId = self.orderId;
        self.applyData.flowName = self.orderEntity.flow_name;
        let projectUserId = self.orderEntity.applicant_id;
        //申请人
        if (self.userMaps.has(projectUserId)) {
          self.applyData.projectUserName = self.userMaps.get(projectUserId);
        } else {
          self.applyData.projectUserName = "-";
        }
        //当前审批人
        let approverIds = self.orderEntity.approver_ids;
        let approver = "";
        for (let n = 0; n < approverIds.length; n++) {
          let approverId = approverIds[n].split("-");
          if (approverId.length === 1) {
            if (n === approverIds.length - 1) {
              if (self.userMaps.has(approverId[0])) {
                approver += self.userMaps.get(approverId[0]);
              } else {
                approver += "-";
              }
            } else {
              if (self.userMaps.has(approverId[0])) {
                approver += self.userMaps.get(approverId[0]) + ", ";
              } else {
                approver += "-";
              }
            };
          };
        };
        self.applyData.approverName = approver;
        let resourceType = self.orderEntity.resource_type;
        self.applyData.resourceType = resourceType;
        var orderData = JSON.parse(self.orderEntity.order_data);
        if (resourceType === "VOLUME.CREATE") { //创建云硬盘
          self.applyData.name = orderData.volume.name;
          self.applyData.num = orderData.num + "";
          self.applyData.size = orderData.volume.size + "G";
          self.applyData.description = orderData.volume.description;
        } else if (resourceType === "VOLUME.UPDATE") { //修改云硬盘
          self.applyData.updateName = orderData.volume_name;
          self.applyData.updateSize = orderData['os-extend'].new_size + "G";
        } else if (resourceType === "VM.CREATE") { //创建云主机
          var flavorId = orderData.server.flavorRef;
          //获取云主机配置信息
          var flavorUrl = "api/nova/v2.1/flavors/" + flavorId;
          let flavorsData = await this.$ajax({
            url: flavorUrl,
            type: 'GET'
          });
          self.applyData.vmName = orderData.server.name; //云主机名
          self.applyData.description = orderData.server.description;
          self.applyData.cpuNum = flavorsData.flavor.vcpus + self.$t('opt.nucleus');
          self.applyData.memory = flavorsData.flavor.ram / 1024 + "G";
          self.applyData.disk = flavorsData.flavor.disk + "G";
          self.applyData.vmNum = orderData.server.max_count + "";
          if (orderData.server.block_device_mapping_v2 && orderData.server.block_device_mapping_v2[0].volume_size) {
            self.applyData.volumeNum = orderData.server.block_device_mapping_v2[0].volume_size + "G";
          } else {
            self.applyData.volumeNum = "";
          }
        } else if (resourceType === "VM.UPDATE") {
          var orderUpdateData = JSON.parse(orderData.data);
          var flavorUpdateId = orderUpdateData.resize.flavorRef;
          //获取云主机配置信息
          var flavorUpdateUrl = "api/nova/v2.1/flavors/" + flavorUpdateId;
          let flavorsUpdateData = await this.$ajax({
            url: flavorUpdateUrl,
            type: 'GET'
          });
          self.applyData.vmUpdateName = orderData.instance_name;
          self.applyData.cpuUpdateNum = flavorsUpdateData.flavor.vcpus + self.$t('opt.nucleus');
          self.applyData.updateMemory = flavorsUpdateData.flavor.ram / 1024 + "G";
          self.applyData.updateDisk = flavorsUpdateData.flavor.disk+"G";
        } else if (resourceType === "PROJECT.CREATE") { //项目
          self.applyData.projectName = orderData.create.name;
          if (orderData.compute_quota.cores !== -1) {
            self.applyData.VCPUNumber = orderData.compute_quota.cores;
          } else {
            self.applyData.VCPUNumber = self.$t("base.unlimited");
          }
          if (orderData.compute_quota.instances !== -1) {
            self.applyData.instancesNumber = orderData.compute_quota.instances;
          } else {
            self.applyData.instancesNumber = self.$t("base.unlimited");
          }
          if (orderData.network_quota.network !== -1) {
            self.applyData.networkNumber = orderData.network_quota.network;
          } else {
            self.applyData.networkNumber = self.$t("base.unlimited");
          }
          if (orderData.storage_quota.volumes !== -1) {
            self.applyData.volumesNumber = orderData.storage_quota.volumes;
          } else {
            self.applyData.volumesNumber = self.$t("base.unlimited");
          }
          self.applyData.description = orderData.create.description;
        } else if (resourceType === "HOST.CREATE") { // 云物理机
          let orderInfo = orderData.server;
          if (orderInfo.networks && orderInfo.networks[0].uuid ) {
            self.applyData.network = await self.getNetworkInfo(orderInfo.networks[0].uuid);
          }
          self.applyData.name = orderData.server.name;
          self.applyData.imageRef = orderData.server.imageRef;
          self.applyData.availability_zone = orderData.server.availability_zone;
          self.applyData.cpu = orderData.server.cpu + self.$t('opt.nucleus');
          self.applyData.mem = orderData.server.mem/1024 + "GB";
          self.applyData.disk = orderData.server.disk + "GB";
        }
        var approveHistory = {};
        for (var n = 0; n < self.orderEntity.op_history.length; n++) {
          let opDesc = self.orderEntity.op_history[n].op_desc.split("-");
          let opName = self.userMaps.get(opDesc[1]);
          opDesc[1] = opName;
          approveHistory[n] = opDesc.join("-");
          self.approveHistoryInfo.push({
            level: opDesc.join("-")
          });
        }
        self.approveHistory = approveHistory;
      } catch (data) {
        self.loading = false;
        console.error(self.$t('opt.getApproveInformationFailed'));
      }
    },
    isCreateVolume() {
      if (this.applyData.resourceType === "VOLUME.CREATE") {
        return true;
      }
      return false;
    },
    isUpdateVolume() {
      if (this.applyData.resourceType === "VOLUME.UPDATE") {
        return true;
      }
      return false;
    },
    isCreateVm() {
      if (this.applyData.resourceType === "VM.CREATE") {
        return true;
      }
      return false;
    },
    isUpdateVm() {
      if (this.applyData.resourceType === "VM.UPDATE") {
        return true;
      }
      return false;
    },
    isProject() {
      if (this.applyData.resourceType === "PROJECT.CREATE") {
        return true;
      }
      return false;
    }
  }
};
</script>
<style scoped>
</style>
