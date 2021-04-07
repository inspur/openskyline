<template>
  <div>
    <el-form ref="containerTemplateDetailForm" v-loading="loading" :model="containerTemplateDetailForm" label-width="170px" label-position="left" class="me-form" style="text-align:left;">
        <div class="table_panel">
        <table class="table table-content table-hover idatatable" border="1">
            <tbody>
            <tr class="odd">
                <th class="idatath" style="width:20%">{{$t('container.clusterName')}}:</th>
                <td class="idatatd" style="width:80%">{{containerTemplateDetailForm.name}}</td>
            </tr>
            <tr class="even">
                <th class="idatath">{{$t('scalingService.clusterId')}}:</th>
                <td class="idatatd">{{containerTemplateDetailForm.uuid}}</td>
            </tr>
            <tr class="odd">
                <th class="idatath">{{$t('container.clusterState')}}:</th>
                <td class="idatatd">
                <el-tag :type="this.statusTagRender(containerTemplateDetailForm.status)">
                    {{this.statusRender(containerTemplateDetailForm.status)}}
                </el-tag>
                </td>
            </tr>
            <tr class="even">
                <th class="idatath">{{$t('container.belongProject')}}:</th>
                <td class="idatatd">{{containerTemplateDetailForm.project_name}}</td>
            </tr>
            <tr class="even">
                <th class="idatath">{{$t('container.masterNodeCount')}}:</th>
                <td class="idatatd">{{containerTemplateDetailForm.master_count}}</td>
            </tr>
            <tr class="odd">
                <th class="idatath">{{$t('container.nodeCount')}}:</th>
                <td class="idatatd">{{containerTemplateDetailForm.worker_count}}</td>
            </tr>
            <tr class="even">
                <th class="idatath">{{$t('container.masternodeIP')}}:</th>
                <td class="idatatd">{{containerTemplateDetailForm.master_ip}}</td>
            </tr>
            <tr class="odd">
                <th class="idatath">{{$t('container.workernodeIP')}}:</th>
                <td class="idatatd">{{containerTemplateDetailForm.worker_ip}}</td>
            </tr>
            <tr class="even">
                <th class="idatath">{{$t('container.heatStack')}}:</th>
                <td class="idatatd"><el-button @click="rowStackClick(containerTemplateDetailForm.stack_id, containerTemplateDetailForm.stack_name)" type="text" size="small">{{containerTemplateDetailForm.stack_name}}</el-button></td>
            </tr>
            <tr class="odd">
                <th class="idatath">{{$t('container.timeoutMin')}}:</th>
                <td class="idatatd">{{containerTemplateDetailForm.create_timeout}}</td>
            </tr>
            <tr class="even">
                <th class="idatath">{{$t('container.keypair')}}:</th>
                <td class="idatatd">{{containerTemplateDetailForm.keypair_id}}</td>
            </tr>
            <tr class="odd">
                <th class="idatath">{{$t('lang.createTime')}}:</th>
                <td class="idatatd">{{containerTemplateDetailForm.created_at | createTime}}</td>
            </tr>
            <tr class="even">
                <th class="idatath">{{$t('container.configFile')}}:</th>
                <td class="idatatd">
                  <el-button type="text" @click="showConfigFile">Kubeconfig File</el-button>
                </td>
            </tr>
            <tr class="odd">
                <th class="idatath" style="width:20%">{{$t('container.clusterDescription')}}:</th>
                <td class="idatatd" style="width:80%">{{containerTemplateDetailForm.description}}</td>
            </tr>
            </tbody>
        </table>
        </div>  
    </el-form>
    <config-file ref='configfile' :clusterId="clusterId" v-if="configFileFlag"  @cancelShow="cancelShow"></config-file>
  </div>
</template>
<script>
import moment from 'moment'
import ConfigFile from './ConfigFile';
  export default {
    name: 'ContainerDetail',
    components: {
      ConfigFile
    },
    props:{
      detailRowDataId:String,
      projectName:String
    },
    data () {
      return {
        containerTemplateDetailForm: {
          name:'',
          description:'',
          uuid:'',
          status:'',
          master_count:'',
          worker_count:'',
          master_ip:'',
          worker_ip:'',
          stack_name:'',
          stack_id:'',
          create_timeout:'',
          created_at:'',
          keypair_id:'',
          project_id:'',
          project_name:''
        },
        loading:false,
        configFileFlag: false,
        clusterId: this.$route.params.rancherclusterId,
        tzTimeFormatter:this.$tzTimeFormatter,
        roleType: Vue.roleType
      };
    },
    mounted () {
      this.initContainerTemplateDetails();
    },
    methods: {
      async initContainerTemplateDetails() {
        let self = this;
        self.loading = true;
        try {
          await self.$ajax({
            type: 'get',
            url:'api/cetus/v1/cluster/' + this.detailRowDataId,
            showErrMsg: false,
            successFun(response) {
              self.loading = false;
              let formData = Object.assign({}, self.containerTemplateDetailForm);
              for (let key of Object.keys(formData)) {
                self.containerTemplateDetailForm[key] = response[key];
              }
              let masterips = [];
              let workerips = [];
              self.containerTemplateDetailForm.master_ip = '';
              self.containerTemplateDetailForm.worker_ip = '';
              if (response.kube_masters!=null && response.kube_masters!="") {
                masterips = response.kube_masters;
              }
              if (response.kube_minions!=null && response.kube_minions!="") {
                workerips = response.kube_minions;
              }
              for (let i=0; i < masterips.length; i++) {
                if (i == masterips.length-1) {
                  self.containerTemplateDetailForm.master_ip += masterips[i];
                } else {
                  self.containerTemplateDetailForm.master_ip += masterips[i] + ", "
                }
              }
              for (let i=0; i < workerips.length; i++) {
                if (i == workerips.length-1) {
                   self.containerTemplateDetailForm.worker_ip += workerips[i]
                } else {
                  self.containerTemplateDetailForm.worker_ip += workerips[i] + ", "
                }
              }
              self.containerTemplateDetailForm.project_name = self.projectName;
            },
            errFun() {
              let formData = Object.assign({}, self.containerTemplateDetailForm);
              for (let key of Object.keys(formData)) {
                self.containerTemplateDetailForm[key] = "";
              }
              self.loading = false;
            }
          });
        } catch (data) {
          self.loading = false;
        }
      },
      rowStackClick(stackId, stackName) {
        this.$router.push({
          path: "/service-orchestration/orchestrationList/orchestrationDetail/" + stackName + "/" + stackId,
          params: {
            name: stackName
          }
        });
      },
      statusRender(value) {
        if (value=="CREATE_IN_PROGRESS") {
          return this.$t('container.CREATE_IN_PROGRESS')
        } else if (value=="CREATE_FAILED") {
          return this.$t('container.CREATE_FAILED')
        } else if (value=="CREATE_COMPLETE") {
          return this.$t('container.CREATE_COMPLETE')
        } else if (value=="DELETE_IN_PROGRESS") {
          return this.$t('container.DELETE_IN_PROGRESS')
        } else if (value=="DELETE_COMPLETE") {
          return this.$t('container.DELETE_COMPLETE')
        } else if (value=="DELETE_FAILED") {
          return this.$t('container.DELETE_FAILED')
        } else if (value=="SUSPEND_IN_PROGRESS") {
          return this.$t('container.SUSPEND_IN_PROGRESS')
        } else if (value=="SUSPEND_COMPLETE") {
          return this.$t('container.SUSPEND_COMPLETE')
        } else if (value=="SUSPEND_FAILED") {
          return this.$t('container.SUSPEND_FAILED')
        } else if (value=="RESUME_IN_PROGRESS") {
          return this.$t('container.RESUME_IN_PROGRESS')
        } else if (value=="RESUME_COMPLETE") {
          return this.$t('container.RESUME_COMPLETE')
        } else if (value=="RESUME_FAILED") {
          return this.$t('container.RESUME_FAILED')
        } else if (value=="ROLLBACK_IN_PROGRESS") {
          return this.$t('container.ROLLBACK_IN_PROGRESS')
        } else if (value=="ROLLBACK_COMPLETE") {
          return this.$t('container.ROLLBACK_COMPLETE')
        } else if (value=="ROLLBACK_FAILED") {
          return this.$t('container.ROLLBACK_FAILED')
        } else if (value=="UPDATE_IN_PROGRESS") {
          return this.$t('container.UPDATE_IN_PROGRESS')
        } else if (value=="UPDATE_COMPLETE") {
          return this.$t('container.UPDATE_COMPLETE')
        } else if (value=="UPDATE_FAILED") {
          return this.$t('container.UPDATE_FAILED')
        } else if (value=="unavailable") {
          return this.$t('container.unavailable')
        } else if (value=="provisioning") {
          return this.$t('container.provisioning')
        } else if (value=="active") {
          return this.$t('container.active')
        } else if (value=="removing") {
          return this.$t('container.removing')
        } else if (value=="waiting") {
          return this.$t('container.provisioning')
        } else if (value=="updating") {
          return this.$t('container.UPDATE_IN_PROGRESS')
        } else {
          return value
        }
      },
      statusTagRender(value) {
        let tagType = "";
        if (value === "CREATE_COMPLETE" || value === "INIT_COMPLETE" ||
          value === "RESUME_COMPLETE" || value === "ROLLBACK_COMPLETE" || value === "SUSPEND_COMPLETE" ||
          value == "UPDATE_COMPLETE" || value == "active") {
          tagType = "success";
        } else if (value === "CREATE_IN_PROGRESS" || value === "DELETE_IN_PROGRESS" ||
          value === "RESUME_IN_PROGRESS" || value === "ROLLBACK_IN_PROGRESS" || value === "SUSPEND_IN_PROGRESS" ||
          value == "UPDATE_IN_PROGRESS" || value == "provisioning" || value == "waiting" || value == "removing" || value == "updating") {
          tagType = "info"; /*tag类型由primary统一改为了info*/
        } else if (value === "CREATE_FAILED" || value === "DELETE_FAILED" ||
          value === "RESUME_FAILED" || value === "ROLLBACK_FAILED" ||
          value === "SUSPEND_FAILED" || value == "UPDATE_FAILED") {
          tagType = "danger";
        } else if (value === "unavailable") {
          tagType = "gray" /*增加了unavailable的状态*/
        }
        return tagType;
      },
      cancelShow() {
        this.configFileFlag = false;
      },
      showConfigFile() {
        this.configFileFlag = true;
      }
    },
    filters: {
      createTime(val) {
        const time = moment.utc(val);
        time.local();
        return time.format('YYYY-MM-DD HH:mm:ss');
      }
    }
  }
</script>

