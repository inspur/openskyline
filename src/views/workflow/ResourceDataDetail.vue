<template>
  <el-dialog
    :title="$t('task.resource')"
    :visible.sync="dialogVisible"
    :before-close="handleClose">
      <el-form ref="resourceDataForm" :model="resourceDataForm" label-width="0px" v-loading="loading" class="me-form">
        <div class="table_panel">
          <table class="table table-content table-hover idatatable" border="1">
            <tbody>
              <tr class="even">
                <th class="idatath" style="width:20%">{{$t('task.resourceType')}}</th>
                <td class="idatatd" style="width:80%">{{tzTypeFormatter(selectedRowData.taskType)}}</td>
              </tr>
              <tr class="odd">
                <th class="idatath">{{$t('task.resourceName')}}</th>
                <td class="idatatd">{{resourceDataForm.resourceData}}</td>
              </tr>
              <tr class="even" v-if="showResource">
                <th class="idatath">{{selectedRowData.taskType == "std.create_volume_backups"?$t('task.backupmax'):$t('task.snapshotSaveCount')}}</th>
                <td class="idatatd">{{resourceDataForm.snapshotNumber}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel" type="default">{{$t('lang.cancel')}}</el-button>
      </div>
  </el-dialog>
</template>
<script>
  export default {
    name: "resourceDataDetail",
    props:{
      selectedRowData:{
        type:Object,
        default:() => {
          return {};
        }
      }
    },
    data() {
      return {
        resourceDataForm: {
          resourceData:"",
          resource:"",
          indicator:"",
          snapshotNumber:"1"
        },
        dialogVisible: true,
        loading:false,
        showResource: false
      }
    },
    mouted() {
    },
    methods: {
      show() {
        this.dialogVisible = true;
        if (this.selectedRowData.taskType == "std.create_volume_snapshot" || this.selectedRowData.taskType == "std.create_volume_backups" || this.selectedRowData.taskType == "std.create_volume_inc_backups") {
          this.queryVolumeDetail();
        } else {
          this.initWorkFlowExeDetails();
        }
        this.showResource = false;
        if (this.selectedRowData.taskType == "std.create_volume_snapshot" || this.selectedRowData.taskType == "std.create_instance_backup" || this.selectedRowData.taskType == "std.create_volume_backups") {
          this.showResource = true;
          let reportDetails = JSON.parse(this.selectedRowData.workflowInput);
          this.resourceDataForm.snapshotNumber = reportDetails.rotation;
        }
      },
      handleClose(done) {
        this.$emit("handleAddShow", {});
        done();
      },
      cancel() {
        this.dialogVisible = false;
      },
      async initWorkFlowExeDetails() {
        let self = this;
        let workflowInput = this.selectedRowData.workflowInput;
        let inputJson = JSON.parse(workflowInput);//JSON.stringify(workflowInput);
        let detailId = inputJson.instance_id;
        if ("std.create_instance_backup" == this.selectedRowData.taskType) {
           detailId = inputJson['server_id'];
        }
        let serviceUrl = "";
        serviceUrl = "api/nova/v2.1/servers/" + detailId;
        try {
          self.loading = true;
          let result = await this.$ajax({
            type: 'get',
            url: serviceUrl
          });
          let server = result['server'];
          let instanceName = server.name;
          self.resourceDataForm.resourceData = instanceName;//this.tzOutputFormatter(workFlowExeDetail.output);
          self.loading = false;
        } catch (data) {
          self.loading = false;
          console.log('获取资源信息失败');
        }
      },
      async queryVolumeDetail() {
        let self = this;
        let workflowInput = this.selectedRowData.workflowInput;
        let inputJson = JSON.parse(workflowInput);//JSON.stringify(workflowInput);
        let serviceUrl = "api/cinder/v3/" + this.$cookie.get('pid') + "/volumes/" + inputJson.volume_id;
        try {
          self.loading = true;
          let result = await this.$ajax({
            type: 'get',
            url: serviceUrl
          });
          let server = result['volume'];
          let instanceName = server.name;
         if (typeof (server.name) == "undefined" || null == server.name || "" == server.name) {
            instanceName = server.id;
          }
          self.resourceDataForm.resourceData = instanceName;//this.tzOutputFormatter(workFlowExeDetail.output);
          self.loading = false;
        } catch (data) {
          self.loading = false;
          console.log('获取资源信息失败');
        }
      },
      tzOutputFormatter(output) {
        let outputFr = output;
        let outputTo = '';
        if (outputFr == '{}' || outputFr == '') {
          outputTo = '-';
        } else {
          outputTo = outputFr;
        }
        return outputTo;
      },
      tzTypeFormatter(type) {
        if (type == '') {
          return '';
        } else if (type == 'stop_vm' || type == 'start_vm') {
          return this.$t('task.cloudHost');
        } else if (type == 'system_operlogs_delete' || type == 'system_operlogs_warn') {
          return this.$t('lang.operateRecord');
        } else if (type == "std.create_instance_backup") {
          return this.$t('task.cloudHost');
        } else if (type == "std.create_volume_snapshot") {
          return this.$t('task.cloudDisk');
        } else if (type == "std.create_volume_backups") {
          return Vue.t('task.createcloudiskbackup')+"("+Vue.t('storage.allBackUp')+")";
        } else if (type == "std.create_volume_inc_backups") {
          return Vue.t('task.createcloudiskbackup')+"("+Vue.t('storage.increaseBackUp')+")";
        } else {
          return type;
        }
      }
    }
  }
</script>
