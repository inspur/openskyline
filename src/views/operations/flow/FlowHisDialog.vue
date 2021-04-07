<template>
  <el-row>
    <el-col :span="24">
      <el-collapse v-model="activeNames" style="text-align:left">
        <el-collapse-item :title="$t('opt.baseInformation')" name="baseInformation">
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="odd">
                    <th class="idatath" style="width:35%">{{$t('opt.ordernumber')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.orderName}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath" style="width:35%">{{$t('opt.detailStatus')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.orderState}}</td>
                  </tr>
                  <tr class="odd" v-if="!!applyData.approverName">
                    <th class="idatath" style="width:35%">{{$t('opt.nowApprover')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.approverName}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath" style="width:35%">{{$t('opt.applicantTime')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.applicantTime}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="even">
                    <th class="idatath" style="width:35%">{{$t('opt.detailProposer')}}</th>
                    <td class="idatatd" style="width:65%">
                      <el-tooltip :content="applyData.projectUserName" v-show="applyData.projectUserName.length > 20">
                        <span>{{applyData.projectUserName.substring(0, 20) + "..."}}</span>
                      </el-tooltip>
                      <span v-show="applyData.projectUserName.length <= 20">{{applyData.projectUserName}}</span>
                    </td>
                  </tr>
                  <tr class="odd" v-show="!isProject()">
                    <th class="idatath" style="width:35%">{{$t('opt.processName')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.flowName}}</td>
                  </tr>
                  <tr class="even" v-show="!isProject()" v-if="!!applyData.nodeName">
                    <th class="idatath" style="width:35%">{{$t('opt.nodeName')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.nodeName}}</td>
                  </tr>
                   <tr class="odd" v-show="isCreateVolume()">
                    <th class="idatath" style="width:35%">{{$t('opt.detailNumber')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.num}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
        </el-collapse-item>
      </el-collapse>
    </el-col>
    <el-col :span="24">
      <el-collapse v-model="activeNames1" style="text-align:left" v-show="isCreateVolume()">
        <el-collapse-item :title="$t('opt.createVolumeInformation')" name="createVolumeInformation">
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="odd">
                    <th class="idatath" style="width:35%">{{$t('opt.hardDiskName')}}</th>
                    <td class="idatatd" style="width:65%">
                      <el-tooltip :content="applyData.name" v-show="applyData.name.length > 20">
                        <span>{{applyData.name.substring(0, 20) + "..."}}</span>
                      </el-tooltip>
                      <span v-show="applyData.name.length <= 20">{{applyData.name}}</span>
                    </td>
                  </tr>
                  <tr class="even" v-if="!!applyData.description">
                    <th class="idatath" style="width:35%">{{$t('opt.detailDesc')}}</th>
                    <td class="idatatd" style="width:65%">
                      <el-tooltip :content="applyData.description" v-show="applyData.description.length > 20">
                        <span>{{applyData.description.substring(0, 20) + "..."}}</span>
                      </el-tooltip>
                      <span v-show="applyData.description.length <= 20">{{applyData.description}}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="even">
                    <th class="idatath" style="width:35%">{{$t('opt.size')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.size}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
        </el-collapse-item>
      </el-collapse>
    </el-col>
    <el-col :span="24">
      <el-collapse v-model="activeNames2" style="text-align:left" v-show="isUpdateVolume()">
        <el-collapse-item :title="$t('opt.updateVolumeInformation')" name="updateVolumeInformation">
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="odd">
                    <th class="idatath" style="width:35%">{{$t('opt.hardDiskName')}}</th>
                    <td class="idatatd" style="width:65%">
                      <el-tooltip :content="applyData.updateName" v-show="applyData.updateName.length > 20">
                        <span>{{applyData.updateName.substring(0, 20) + "..."}}</span>
                      </el-tooltip>
                      <span v-show="applyData.updateName.length <= 20">{{applyData.updateName}}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="even">
                    <th class="idatath" style="width:35%">{{$t('opt.size')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.updateSize}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
        </el-collapse-item>
      </el-collapse>
    </el-col>
    <el-col :span="24">
      <el-collapse v-model="activeNames3" style="text-align:left" v-show="isCreateVm()">
        <el-collapse-item :title="$t('opt.createHostInformation')" name="createHostInformation">
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="odd">
                    <th class="idatath" style="width:35%">{{$t('opt.cloudHostName')}}</th>
                    <td class="idatatd" style="width:65%">
                      <el-tooltip :content="applyData.vmName" v-show="applyData.vmName.length > 20">
                        <span>{{applyData.vmName.substring(0, 20) + "..."}}</span>
                      </el-tooltip>
                      <span v-show="applyData.vmName.length <= 20">{{applyData.vmName}}</span>
                    </td>
                  </tr>
                  <tr class="even">
                    <th class="idatath" style="width:35%">CPU：</th>
                    <td class="idatatd" style="width:65%">{{applyData.cpuNum}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath" style="width:35%">{{$t('opt.detailMemory')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.memory}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="even" v-if="!applyData.volumeNum">
                    <th class="idatath" style="width:35%">{{$t('opt.detailHardDisk')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.disk}}</td>
                  </tr>
                  <tr class="even" v-if="!!applyData.volumeNum">
                    <th class="idatath" style="width:35%">{{$t('opt.detailVolume')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.volumeNum}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath" style="width:35%">{{$t('opt.detailNumber')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.vmNum}}</td>
                  </tr>
                  <tr class="odd" v-if="!!applyData.description">
                    <th class="idatath" style="width:35%">{{$t('opt.detailDesc')}}</th>
                    <td class="idatatd" style="width:65%">
                      <el-tooltip :content="applyData.description" v-show="applyData.description.length > 20">
                        <span>{{applyData.description.substring(0, 20) + "..."}}</span>
                      </el-tooltip>
                      <span v-show="applyData.description.length <= 20">{{applyData.description}}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
        </el-collapse-item>
      </el-collapse>
    </el-col>
    <el-col :span="24">
      <el-collapse v-model="activeNames4" style="text-align:left" v-show="isUpdateVm()">
        <el-collapse-item :title="$t('opt.updateHostInformation')" name="updateHostInformation">
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="odd">
                    <th class="idatath" style="width:35%">{{$t('opt.cloudHostName')}}</th>
                    <td class="idatatd" style="width:65%">
                      <el-tooltip :content="applyData.vmUpdateName" v-show="applyData.vmUpdateName.length > 20">
                        <span>{{applyData.vmUpdateName.substring(0, 20) + "..."}}</span>
                      </el-tooltip>
                      <span v-show="applyData.vmUpdateName.length <= 20">{{applyData.vmUpdateName}}</span>
                    </td>
                  </tr>
                  <tr class="even">
                    <th class="idatath" style="width:35%">CPU：</th>
                    <td class="idatatd" style="width:65%">{{applyData.cpuUpdateNum}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="odd">
                    <th class="idatath" style="width:35%">{{$t('opt.detailMemory')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.updateMemory}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath" style="width:35%">{{$t('opt.detailHardDisk')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.updateDisk}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
        </el-collapse-item>
      </el-collapse>
    </el-col>
    <el-col :span="24">
      <el-collapse v-model="activeNames5" style="text-align:left" v-show="isProject()">
        <el-collapse-item :title="$t('opt.projectInformation')" name="projectInformation">
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="odd">
                    <th class="idatath" style="width:35%">{{$t('opt.projectName')}}</th>
                    <td class="idatatd" style="width:65%">
                      <el-tooltip :content="applyData.projectName" v-show="applyData.projectName.length > 20">
                        <span>{{applyData.projectName.substring(0, 20) + "..."}}</span>
                      </el-tooltip>
                      <span v-show="applyData.projectName.length <= 20">{{applyData.projectName}}</span>
                    </td>
                  </tr>
                  <tr class="even">
                    <th class="idatath" style="width:35%">{{$t('opt.metadataNumber')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.metadataNumber}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath" style="width:35%">{{$t('opt.VCPUNumber')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.VCPUNumber}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath" style="width:35%">{{$t('opt.instancesNumber')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.instancesNumber}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath" style="width:35%">{{$t('opt.fileNumber')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.fileNumber}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath" style="width:35%">{{$t('opt.fileContent')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.fileContent}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath" style="width:35%">{{$t('opt.keyPair')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.keyPair}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath" style="width:35%">{{$t('opt.fileLength')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.fileLength}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath" style="width:35%">{{$t('opt.Memory')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.Memory}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath" style="width:35%">{{$t('opt.volumesNumber')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.volumesNumber}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath" style="width:35%">{{$t('opt.cloudSnapshot')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.cloudSnapshot}}</td>
                  </tr>
                  <tr class="odd">
                    <th class="idatath" style="width:35%">{{$t('opt.cloudSnapshotNumber')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.cloudSnapshotNumber}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr class="even">
                    <th class="idatath" style="width:35%">{{$t('opt.securityGroup')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.securityGroup}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath" style="width:35%">{{$t('opt.securityGroupRules')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.securityGroupRules}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath" style="width:35%">{{$t('opt.floatIPNumber')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.floatIPNumber}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath" style="width:35%">{{$t('opt.networkNumber')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.networkNumber}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath" style="width:35%">{{$t('opt.routeNumber')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.routeNumber}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath" style="width:35%">{{$t('opt.portNumber')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.portNumber}}</td>
                  </tr>
                  <tr class="even">
                    <th class="idatath" style="width:35%">{{$t('opt.subnetNumber')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.subnetNumber}}</td>
                  </tr>
                  <tr class="even" v-if="service.manila">
                    <th class="idatath" style="width:35%">{{$t('opt.fileStore')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.fileStore}}</td>
                  </tr>
                  <tr class="even" v-if="service.manila">
                    <th class="idatath" style="width:35%">{{$t('opt.fileStoreNumber')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.fileStoreNumber}}</td>
                  </tr>
                  <tr class="even" v-if="service.manila">
                    <th class="idatath" style="width:35%">{{$t('opt.fileStoreSnapshot')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.fileStoreSnapshot}}</td>
                  </tr>
                  <tr class="even" v-if="service.manila">
                    <th class="idatath" style="width:35%">{{$t('opt.fileStoreSnapshotNumber')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.fileStoreSnapshotNumber}}</td>
                  </tr>
                  <tr class="odd" v-if="!!applyData.description">
                    <th class="idatath" style="width:35%">{{$t('opt.detailDesc')}}</th>
                    <td class="idatatd" style="width:65%">
                      <el-tooltip :content="applyData.description" v-show="applyData.description.length > 20">
                        <span>{{applyData.description.substring(0, 20) + "..."}}</span>
                      </el-tooltip>
                      <span v-show="applyData.description.length <= 20">{{applyData.description}}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
        </el-collapse-item>
      </el-collapse>
    </el-col>
    <el-col :span="24">
      <el-collapse v-model="activeNames6" style="text-align:left" v-if="applyData.resourceType == 'HOST.CREATE'">
        <el-collapse-item :title="$t('opt.createPhysicalHostInformation')" name="createPhysicalHostInformation">
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr>
                    <th class="idatath" style="width:35%">{{$t('opt.cloudPhysicalHostName')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.name}}</td>
                  </tr>
                  <tr>
                    <th class="idatath" style="width:35%">{{$t('opt.image')}}</th>
                    <td class="idatatd" style="width:65%">{{imageMap.get(applyData.imageRef)}}</td>
                  </tr>
                  <tr>
                    <th class="idatath" style="width:35%">{{$t('opt.net')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.network}}</td>
                  </tr>
                  <tr>
                    <th class="idatath" style="width:35%">{{$t('opt.availableDomain')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.availability_zone}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="table_panel">
              <table class="table table-content table-hover idatatable" border="1">
                <tbody>
                  <tr>
                    <th class="idatath" style="width:35%">CPU：</th>
                    <td class="idatatd" style="width:65%">{{applyData.cpu}}</td>
                  </tr>
                  <tr>
                    <th class="idatath" style="width:35%">{{$t('opt.detailMemory')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.mem}}</td>
                  </tr>
                  <tr>
                    <th class="idatath" style="width:35%">{{$t('opt.detailHardDisk')}}</th>
                    <td class="idatatd" style="width:65%">{{applyData.disk}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </el-col>
        </el-collapse-item>
      </el-collapse>
    </el-col>
    <el-col :span="24">
      <el-collapse v-model="activeNames7" style="text-align:left">
        <el-collapse-item :title="$t('opt.orderProcessingHistory')" name="dealHistoty">
          <div v-for="(node, index) in approveHistoryInfo" :key="node.id" style="word-break: break-all;">
            {{node.level}}
          </div>
          <!-- <el-form>
            <el-form-item v-for="(node, index) in approveHistoryInfo" :key="node.id" :label="node.level">
            </el-form-item>
          </el-form> -->
        </el-collapse-item>
      </el-collapse>
    </el-col>
  </el-row>
</template>
<script>
export default {
  name: "Handle",
  components: {
  },
  props: ['selOrderId', 'userMaps', 'orderProId', 'userLists'],
  data() {
    return {
      service:Vue.service,
      formInline: "",
      activeNames: "baseInformation",
      activeNames1: "createVolumeInformation",
      activeNames2: "updateVolumeInformation",
      activeNames3: "createHostInformation",
      activeNames4: "updateHostInformation",
      activeNames5: "projectInformation",
      activeNames6: "createPhysicalHostInformation",
      activeNames7: "dealHistoty",
      imageMap:new Map(),
      applyData: {
        orderName: "",
        orderState: "",
        flowName: "",
        nodeName: "",
        applicantTime: "",
        projectUserName: "",
        approverName: "",
        resourceType: "",
        name: "",
        updateName: "",
        projectName: "",
        size: "",
        updateSize: "",
        description: "",
        vmName: "",
        cpuNum: "",
        memory: "",
        disk: "",
        vmUpdateName: "",
        cpuUpdateNum: "",
        updateMemory: "",
        updateDisk: "",
        vmNum: "",
        volumeNum: "",
        VCPUNumber: "",
        metadataNumber: "",
        fileNumber: "",
        fileContent: "",
        keyPair: "",
        fileLength: "",
        Memory: "",
        securityGroup: "",
        securityGroupRules: "",
        floatIPNumber: "",
        routeNumber: "",
        portNumber: "",
        subnetNumber: "",
        cloudSnapshot: "",
        cloudSnapshotNumber: "",
        fileStore: "",
        fileStoreNumber: "",
        fileStoreSnapshot: "",
        fileStoreSnapshotNumber: "",
        instancesNumber: "",
        networkNumber: "",
        volumesNumber: ""
      },
      approveHistoryInfo: [{
        level: ""
      }]
    }
  },
  watch: {
    selOrderId: {
      handler: function(rows, oldVal) {
        this.getOrderHistory();
      }
    }
  },
  mounted() {
    this.getOrderHistory();
  },
  methods: {
    async getOrderHistory() {
      let self = this;
      var reqdata = {
        order_id: self.selOrderId,
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
          self.applyData.orderState = "-"
        };
        self.applyData.flowName = self.orderEntity.flow_name;
        self.applyData.nodeName = self.orderEntity.node_name;
        self.applyData.applicantTime = self.orderEntity.applicant_time;
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
          if (approverId.length == 1) {
            if (n == approverIds.length - 1) {
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
        if (approver == "-") { // 显示所有超级管理员
          self.getAllSuperUsers();
        } else {
           self.applyData.approverName = approver;
        }
        let resourceType = self.orderEntity.resource_type;
        self.applyData.resourceType = resourceType;
        var orderData = JSON.parse(self.orderEntity.order_data);
        if (resourceType == "VOLUME.CREATE") { //创建云硬盘
          self.applyData.name = orderData.volume.name;
          self.applyData.num = orderData.num;
          self.applyData.size = orderData.volume.size + "G";
          self.applyData.description = orderData.volume.description;
        } else if (resourceType == "VOLUME.UPDATE") { //修改云硬盘
          self.applyData.updateName = orderData.volume_name;
          self.applyData.updateSize = orderData['os-extend'].new_size + "G";
        } else if (resourceType == "VM.CREATE") { //创建云主机
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
        } else if (resourceType == "VM.UPDATE") {
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
        } else if (resourceType == "PROJECT.CREATE") { //项目
          self.applyData.projectName = orderData.create.name;
          if (orderData.compute_quota.metadata_items != -1) {
            self.applyData.metadataNumber = orderData.compute_quota.metadata_items;
          } else {
            self.applyData.metadataNumber = self.$t("base.unlimited");
          }
          if (orderData.compute_quota.cores != -1) {
            self.applyData.VCPUNumber = orderData.compute_quota.cores;
          } else {
            self.applyData.VCPUNumber = self.$t("base.unlimited");
          }
          if (orderData.compute_quota.instances != -1) {
            self.applyData.instancesNumber = orderData.compute_quota.instances;
          } else {
            self.applyData.instancesNumber = self.$t("base.unlimited");
          }
          if (orderData.compute_quota.injected_files != -1) {
            self.applyData.fileNumber = orderData.compute_quota.injected_files;
          } else {
            self.applyData.fileNumber = self.$t("base.unlimited");
          }
          if (orderData.compute_quota.injected_file_content_bytes != -1) {
            self.applyData.fileContent = orderData.compute_quota.injected_file_content_bytes;
          } else {
            self.applyData.fileContent = self.$t("base.unlimited");
          }
          if (orderData.compute_quota.key_pairs != -1) {
            self.applyData.keyPair = orderData.compute_quota.key_pairs;
          } else {
            self.applyData.keyPair = self.$t("base.unlimited");
          }
          if (orderData.compute_quota.injected_file_path_bytes != -1) {
            self.applyData.fileLength = orderData.compute_quota.injected_file_path_bytes;
          } else {
            self.applyData.fileLength = self.$t("base.unlimited");
          }
          if (orderData.compute_quota.ram != -1) {
            self.applyData.Memory = orderData.compute_quota.ram;
          } else {
            self.applyData.Memory = self.$t("base.unlimited");
          }
          if (orderData.network_quota.security_group != -1) {
            self.applyData.securityGroup = orderData.network_quota.security_group;
          } else {
            self.applyData.securityGroup = self.$t("base.unlimited");
          }
          if (orderData.network_quota.security_group_rule != -1) {
            self.applyData.securityGroupRules = orderData.network_quota.security_group_rule;
          } else {
            self.applyData.securityGroupRules = self.$t("base.unlimited");
          }
          if (orderData.network_quota.floatingip != -1) {
            self.applyData.floatIPNumber = orderData.network_quota.floatingip;
          } else {
            self.applyData.floatIPNumber = self.$t("base.unlimited");
          }
          if (orderData.network_quota.network != -1) {
            self.applyData.networkNumber = orderData.network_quota.network;
          } else {
            self.applyData.networkNumber = self.$t("base.unlimited");
          }
          if (orderData.network_quota.router != -1) {
            self.applyData.routeNumber = orderData.network_quota.router;
          } else {
            self.applyData.routeNumber = self.$t("base.unlimited");
          }
          if (orderData.network_quota.port != -1) {
            self.applyData.portNumber = orderData.network_quota.port;
          } else {
            self.applyData.portNumber = self.$t("base.unlimited");
          }
          if (orderData.network_quota.subnet != -1) {
            self.applyData.subnetNumber = orderData.network_quota.subnet;
          } else {
            self.applyData.subnetNumber = self.$t("base.unlimited");
          }
          if (orderData.storage_quota.volumes != -1) {
            self.applyData.volumesNumber = orderData.storage_quota.volumes;
          } else {
            self.applyData.volumesNumber = self.$t("base.unlimited");
          }
          if (orderData.storage_quota.snapshots != -1) {
            self.applyData.cloudSnapshot = orderData.storage_quota.snapshots;
          } else {
            self.applyData.cloudSnapshot = self.$t("base.unlimited");
          }
          if (orderData.storage_quota.gigabytes != -1) {
            self.applyData.cloudSnapshotNumber = orderData.storage_quota.gigabytes;
          } else {
            self.applyData.cloudSnapshotNumber = self.$t("base.unlimited");
          }
          if (this.service.manila) {
            if (orderData.file_quota.shares != -1) {
              self.applyData.fileStore = orderData.file_quota.shares;
            } else {
              self.applyData.fileStore = self.$t("base.unlimited");
            }
            if (orderData.file_quota.gigabytes != -1) {
              self.applyData.fileStoreNumber = orderData.file_quota.gigabytes;
            } else {
              self.applyData.fileStoreNumber = self.$t("base.unlimited");
            }
            if (orderData.file_quota.snapshots != -1) {
              self.applyData.fileStoreSnapshot = orderData.file_quota.snapshots;
            } else {
              self.applyData.fileStoreSnapshot = self.$t("base.unlimited");
            }
            if (orderData.file_quota.snapshot_gigabytes != -1) {
              self.applyData.fileStoreSnapshotNumber = orderData.file_quota.snapshot_gigabytes;
            } else {
              self.applyData.fileStoreSnapshotNumber = self.$t("base.unlimited");
            }
          }
          self.applyData.description = orderData.create.description;
          // self.applyData.approverName = self.$t('opt.administrator');
        } else if (resourceType == "HOST.CREATE") { //创建云物理机
          let orderInfo = orderData.server;
          if (orderInfo.networks && orderInfo.networks[0].uuid ) {
            self.applyData.network = await self.getNetworkInfo(orderInfo.networks[0].uuid);
          }
          self.getImageList();
          self.applyData.name = orderData.server.name;
          self.applyData.imageRef = orderData.server.imageRef;
          self.applyData.availability_zone = orderData.server.availability_zone;
          self.applyData.cpu = orderData.server.cpu + self.$t('opt.nucleus');
          self.applyData.mem = orderData.server.mem/1024 + "GB";
          self.applyData.disk = orderData.server.disk + "GB";
        }
        self.approveHistoryInfo = [];
        console.log(self.orderEntity.op_history)
        for (var n = 0; n < self.orderEntity.op_history.length; n++) {
          let opDesc = self.orderEntity.op_history[n].op_desc.split("-");
          let opName = self.userMaps.get(opDesc[1]);
          opDesc[1] = opName;
          self.approveHistoryInfo.push({
            level: opDesc.join("-")
          });
        }
      } catch (res) {
        console.error(self.$t('opt.getApproveInformationFailed'));
      };
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
      } catch (error) {
        console.log(error);
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
    async getAllSuperUsers() {
      try {
        let result = await this.$ajax({
          type: "GET",
          url: "api/keystone/v3/inspur/users?dir=asc&field=name&limit=10&page=1&domain_id=default&role_type=0"
        });
        let users = result["users"];
        let names = "";
        for (let i=0; i<users.length; i++) {
          if (i==users.length-1) {
            names+= users[i]["name"]
          } else {
            names+= users[i]["name"] + ",";
          }
        }
        this.applyData.approverName = names;
      } catch (error) {
        console.log(error);
        return "";
      }
    },
    isCreateVolume() {
      if (this.applyData.resourceType == "VOLUME.CREATE") {
        return true;
      }
      return false;
    },
    isUpdateVolume() {
      if (this.applyData.resourceType == "VOLUME.UPDATE") {
        return true;
      }
      return false;
    },
    isCreateVm() {
      if (this.applyData.resourceType == "VM.CREATE") {
        return true;
      }
      return false;
    },
    isUpdateVm() {
      if (this.applyData.resourceType == "VM.UPDATE") {
        return true;
      }
      return false;
    },
    isProject() {
      if (this.applyData.resourceType == "PROJECT.CREATE") {
        return true;
      }
      return false;
    }
  }
}
</script>
