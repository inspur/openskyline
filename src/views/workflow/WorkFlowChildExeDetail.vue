<template>
  <div>
    <el-table
      ref="table"
      :data="workFlowExeDetailForm.child_task_info"
      v-loading="loading"
      :element-loading-text="$t('lang.loading')"
      highlight-current-row
      border
      stripe
      row-key="id">
            <el-table-column
              v-if="columnsChecked.indexOf('name') >= 0"
              prop="name"
              :label="$t('lang.name')"
              show-overflow-tooltip
              align="left"
              min-width="80">
              <template slot-scope="scope">
                <span>{{tzNameFormatter2(scope.row.name)}}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="columnsChecked.indexOf('created_at') >= 0"
              prop="created_at"
              :label="$t('task.startTime')"
              show-overflow-tooltip
              align="left"
              min-width="50">
              <template slot-scope="scope">
                <span>{{scope.row.created_at}}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="columnsChecked.indexOf('updated_at') >= 0"
              prop="updated_at"
              :label="$t('task.endTime')"
              show-overflow-tooltip
              align="left"
              min-width="50">
              <template slot-scope="scope">
                <span>{{scope.row.updated_at}}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="columnsChecked.indexOf('state') >= 0"
              prop="state"
              :label="$t('lang.status')"
              show-overflow-tooltip
              align="left"
              min-width="50">
              <template slot-scope="scope">
                <span>{{tzStateFormatter(scope.row.state)}}</span>
              </template>
            </el-table-column>
            <el-table-column
              v-if="columnsChecked.indexOf('state_info') >= 0"
              prop="state_info"
              :label="$t('task.errorReason')"
              :show-overflow-tooltip="false"
              align="left"
              min-width="200">
            </el-table-column>
      </el-table>
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
        columnsChecked:["id", "name", "state", "status", "scope", "input", "description", "serviceAddress", "project", "user", "createTime", "endTime", "workflow_name", "created_at", "updated_at", "state_info"]
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
        // serviceUrl = "api/mistral/v2/executions/" + this.id;
        serviceUrl2 = "api/mistral/v2/inspur_tasks?workflow_execution_id=" + this.id;
        try {
          self.loading = true;
          // let workFlowExeDetail = await this.$ajax({
          //   type: 'get',
          //   url: serviceUrl
          // });
          let workFlowExeChildTasks = await this.$ajax({
            type: 'get',
            url: serviceUrl2
          });
          // debugger;
          // tasks?workflow_execution_id=8119d235-af19-4b49-a689-014d7759892c
          // debugger;
          // alert(workFlowExeDetail.id);
          // this.workFlowExeDetailForm.id = workFlowExeDetail.id;
          // this.workFlowExeDetailForm.workflow_name = workFlowExeDetail.workflow_name;
          // this.workFlowExeDetailForm.input = workFlowExeDetail.input;
          // this.workFlowExeDetailForm.output = workFlowExeDetail.output;
          // this.workFlowExeDetailForm.created_at = workFlowExeDetail.created_at;
          // this.workFlowExeDetailForm.updated_at = workFlowExeDetail.updated_at;
          // this.workFlowExeDetailForm.state = this.tzStateFormatter(workFlowExeDetail.state);
          // this.workFlowExeDetailForm.state_info = workFlowExeDetail.state_info;
          this.workFlowExeDetailForm.child_task_info = workFlowExeChildTasks.tasks;
          self.loading = false;
        } catch (data) {
          self.loading = false;
          console.log('获取任务日志详情失败');
        }
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
      tzNameFormatter(nameFr) {
          let nameTo = '';
          if (nameFr == 'start_vm') {
              nameTo = this.$t('task.startVm');
          } else if (nameFr == 'stop_vm') {
              nameTo = this.$t('task.stopVm');
          } else {
            nameTo = nameFr;
          }
          return nameTo;
      },
      tzNameFormatter2(nameFr) {
          let nameTo = '';
          if (nameFr == 'start_vm') {
              nameTo = this.$t('task.startVm');
          } else if (nameFr == 'stop_vm') {
              nameTo = this.$t('task.stopVm');
          } else if (nameFr == 'find_server') {
              nameTo = this.$t('task.findVm');
          } else if (nameFr == 'create_instance_backup') {
              nameTo = Vue.t('calcStorLang.instSnapshotTask');
          } else if (nameFr == 'crate_snapshot') {
              nameTo = Vue.t('storage.createVolSnap');
          } else if (nameFr == 'crate_backups') {
              nameTo = Vue.t('task.createcloudiskbackup');
          } else if (nameFr == 'find_volume') {
              nameTo = Vue.t('task.findVolume');
          } else if (nameFr == 'find_instance') {
              nameTo = Vue.t('task.findVm');
          } else {
            nameTo = nameFr;
          }
          return nameTo;
      }
    }
  }
</script>
