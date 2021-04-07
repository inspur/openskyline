<template>
  <div>
    <el-form ref="workFlowExeDetailForm" label-position="left" v-loading="loading" :model="workFlowExeDetailForm" label-width="150px" class="me-form" style="text-align:left;">
      <div class="table_panel">
        <table class="table table-content table-hover idatatable" border="1">
          <tbody>
            <tr class="odd">
              <th class="idatath" style="width:20%">{{$t('task.taskName')}}</th>
              <td class="idatatd" style="width:80%">{{workFlowExeDetailForm.taskName}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('task.taskType')}}</th>
              <td class="idatatd">{{workFlowExeDetailForm.workflow_name}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('task.inputData')}}</th>
              <td class="idatatd">{{workFlowExeDetailForm.input}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('task.outputData')}}</th>
              <td class="idatatd">{{workFlowExeDetailForm.output}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('task.startTime')}}</th>
              <td class="idatatd">{{workFlowExeDetailForm.created_at}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('task.endTime')}}</th>
              <td class="idatatd">{{workFlowExeDetailForm.updated_at}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('lang.status')}}</th>
              <td class="idatatd">{{workFlowExeDetailForm.state}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('task.errorReason')}}</th>
              <td class="idatatd">{{workFlowExeDetailForm.state_info}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-form>
  </div>
</template>
<script>
  export default {
    name: 'WorkFlowExeDetail',
    props:{
      definition:String
      //id:String
    },
    data () {
      return {
        workFlowExeDetailForm: {
          definition:'',
          id:'',
          workflow_name:'',
          taskName:'',
          input:'',
          output:'',
          created_at:'',
          updated_at:'',
          state:'',
          state_info:'',
          child_task_info:[]
        },
        loading:false,
        id: this.$route.params.id,
        columnsChecked:["id", "name", "state", "status", "scope", "input", "description", "serviceAddress", "project", "user", "createTime", "endTime", "workflow_name", "taskName", "created_at", "updated_at", "state_info"]
      };
    },
    mounted() {
      this.initWorkFlowExeDetails();
    },
    methods: {
      async initWorkFlowExeDetails() {
        let self = this;
        let serviceUrl = "";
        let serviceUrl2 = "";
        // alert(this.id);
        serviceUrl = "api/mistral/v2/executions/" + this.id;
        serviceUrl2 = "api/mistral/v2/tasks?workflow_execution_id=" + this.id;
        try {
          self.loading = true;
          let workFlowExeDetail = await this.$ajax({
            type: 'get',
            url: serviceUrl
          });
          // let workFlowExeChildTasks = await this.$ajax({
          //   type: 'get',
          //   url: serviceUrl2
          // });
          // debugger;
          // tasks?workflow_execution_id=8119d235-af19-4b49-a689-014d7759892c
          // debugger;
          // alert(workFlowExeDetail.id);
          let nameFr = workFlowExeDetail.workflow_name;
          let nameTo = '';
          if (nameFr == 'start_vm') {
              nameTo = this.$t('task.startVm');
          } else if (nameFr == 'stop_vm') {
              nameTo = this.$t('task.stopVm');
          } else {
            nameTo = nameFr;
          }
          let descriptionFr = workFlowExeDetail.description;
          let descriptionOb = JSON.parse(descriptionFr);
          var taskNameTo = '';
          if (descriptionOb != null || descriptionOb != '') {
            taskNameTo = descriptionOb.triggered_by.name;
          }
          this.workFlowExeDetailForm.id = workFlowExeDetail.id;
          this.workFlowExeDetailForm.workflow_name = self.detailTaskType(nameTo);
          this.workFlowExeDetailForm.taskName = taskNameTo;
          this.workFlowExeDetailForm.input = this.tzInputFormatter(workFlowExeDetail.input);
          this.workFlowExeDetailForm.output = this.tzOutputFormatter(workFlowExeDetail.output);
          this.workFlowExeDetailForm.created_at = workFlowExeDetail.created_at;
          this.workFlowExeDetailForm.updated_at = workFlowExeDetail.updated_at;
          this.workFlowExeDetailForm.state = this.tzStateFormatter(workFlowExeDetail.state);
          this.workFlowExeDetailForm.state_info = workFlowExeDetail.state_info;
          // this.workFlowExeDetailForm.child_task_info = workFlowExeChildTasks.tasks;
          self.loading = false;
        } catch (data) {
          self.loading = false;
          console.log('获取任务日志详情失败');
        }
      },
      detailTaskType(value) {
         if (value == "std.create_instance_backup") {
           return Vue.t('calcStorLang.instSnapshotTask');
         } else if (value == "std.create_volume_snapshot") {
           return Vue.t('storage.createVolSnap');
         }
           return value;
      },
      tzStateFormatter(state) {
        if (state == '') {
          return '';
        } else if (state == 'ERROR') {
          return this.$t('task.error');
        } else if (state == 'SUCCESS') {
          return this.$t('task.success');
        } else if (state == 'RUNNING') {
          return this.$t('task.running');
        } else {
          return '';
        }
      },
      tzInputFormatter(input) {
        let inputFr = input;
        var inputTo = '';
        if (inputFr == '{}' || inputFr == '') {
          inputTo = '-';
        } else {
          inputTo = inputFr;
        }
        return inputTo;
      },
      tzOutputFormatter(output) {
        let outputFr = output;
        var outputTo = '';
        if (outputFr == '{}' || outputFr == '') {
          outputTo = '-';
        } else {
          outputTo = outputFr;
        }
        return outputTo;
      }
    }
  }
</script>
