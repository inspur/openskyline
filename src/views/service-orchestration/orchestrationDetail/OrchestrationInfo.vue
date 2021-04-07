<template>
  <div>
    <el-form ref="orchestrationInfoForm" v-loading="loading" :model="orchestrationInfoForm" label-position="left" label-width="150px" class="me-form" style="text-align:left;">
      <div class="table_panel">
        <table class="table table-content table-hover idatatable" border="1">
          <tbody>
            <tr class="odd">
              <th class="idatath" style="width:15%">{{$t('lang.name')}}</th>
              <td class="idatatd" style="width:85%">{{orchestrationInfoForm.stack_name}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('lang.status')}}</th>
              <td class="idatatd">
                <el-tag :type="statusTagRender(orchestrationInfoForm.stack_status)" v-if="orchestrationInfoForm.stack_status != ''">
                  <span>{{statusRender(orchestrationInfoForm.stack_status)}}</span>
                </el-tag>
              </td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('lang.desc')}}</th>
              <td class="idatatd">{{orchestrationInfoForm.description}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('heat.timeoutMin')}}</th>
              <td class="idatatd">{{orchestrationInfoForm.timeout_mins}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('heat.isRollback')}}</th>
              <td class="idatatd">{{roleBackRender(orchestrationInfoForm.disable_rollback)}}</td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('lang.createTime')}}</th>
              <td class="idatatd">{{timeRender(orchestrationInfoForm.creation_time)}}</td>
            </tr>
            <template v-for="(item, index) in outputData">
              <!-- <el-form-item :label="item.output_key">
                <span>{{item.output_value}}</span>
              </el-form-item> -->
              <tr :class="index%2==0?'odd':'even'">
                <th class="idatath">{{$t('heat.' + item.output_key)}}</th>
                <td class="idatatd">{{item.output_value === null || !item.output_value[0] ? '' : item.output_value}}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </el-form>
  </div>
</template>
<script>
  export default {
    name: 'OrchestrationInfo',
    data () {
      return {
        orchestrationInfoForm: {
          stack_name:"",
          stack_status:"",
          description:"",
          timeout_mins:"0",
          disable_rollback:"",
          creation_time:""//,
          // updated_time:""
        },
        loading:false,
        outputData:[],
        stackName: this.$route.params.stackName,
        stackId: this.$route.params.stackId,
        timeRender: Vue.tzTimeFormatter,
        statusRender:Vue.resourceStatusFormatter
      };
    },
    mounted () {
      this.getTemplateDetail();
    },
    methods: {
      async getTemplateDetail() {
        let self = this;
        self.loading = true;
        try {
          let response = await this.$ajax({
            type: "get",
            url: "api/heat/v1/" + this.$cookie.get("pid") + "/stacks/" + self.stackName + "/" + self.stackId,
            successFun: (response) => {
              let data = response.stack;
              this.outputData = data.outputs;
              this.orchestrationInfoForm = Object.assign({}, this.orchestrationInfoForm, data);
              if (!data.timeout_mins) {
                this.orchestrationInfoForm.timeout_mins = "0";
              }
            }
          });
          self.loading = false;
        } catch (e) {
          self.loading = false;
          console.log(e);
        }
      },
      roleBackRender(value) {
        if (value) {
          return this.$t('lang.no');
        } else {
          return this.$t('lang.yes');
        }
      },
      statusTagRender(value) {
        let tagType = "";
        if (value === "CREATE_COMPLETE" || value === "CHECK_COMPLETE" ||
          value === "ADOPT_COMPLETE" || value === "DELETE_COMPLETE" || value === "INIT_COMPLETE" ||
          value === "RESUME_COMPLETE" || value === "ROLLBACK_COMPLETE" || value === "SUSPEND_COMPLETE" || value === "UPDATE_COMPLETE" || value === "SNAPSHOT_COMPLETE") {
          tagType = "success";
        } else if (value === "CREATE_IN_PROGRESS" || value === "DELETE_IN_PROGRESS" ||
          value === "CHECK_IN_PROGRESS" || value === "ADOPT_IN_PROGRESS" ||
          value === "DELETE_IN_PROGRESS" || value === "INIT_IN_PROGRESS" || value === "RESUME_IN_PROGRESS" ||
          value === "ROLLBACK_IN_PROGRESS" || value === "SUSPEND_IN_PROGRESS" || value === "UPDATE_IN_PROGRESS" || value === "SNAPSHOT_IN_PROGRESS") {
          tagType = "info";
        } else if (value === "CREATE_FAILED" || value === "DELETE_FAILED" ||
          value === "CHECK_FAILED" || value === "ADOPT_FAILED" || value === "DELETE_FAILED" ||
          value === "INIT_FAILED" || value === "RESUME_FAILED" || value === "ROLLBACK_FAILED" ||
          value === "SUSPEND_FAILED" || value === "UPDATE_FAILED" || value === "SNAPSHOT_FAILED") {
          tagType = "danger";
        }
        return tagType;
      }
    }
  }
</script>
