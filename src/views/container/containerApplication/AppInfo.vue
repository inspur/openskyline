<template>
  <div>
    <el-form ref="appInfoForm" v-loading="loading" :model="appInfoForm" label-width="170px" label-position="left" class="me-form" style="text-align:left;">
      <div class="table_panel">
        <table class="table table-content table-hover idatatable" border="1">
          <tbody>
            <tr class="even">
              <th class="idatath" style="width:20%">{{$t('lang.name')}}</th>
              <td class="idatatd" style="width:80%">{{appInfoForm.name}}</td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('lang.status')}}</th>
              <td class="idatatd">
                <el-tag :type="statusTagRender(appInfoForm.status)">
                  <span>{{appInfoForm.status}}</span>
                </el-tag>
              </td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('container.copyNumber')}}</th>
              <td class="idatatd"><span :title="$t('container.copyNumberTitle')">{{appInfoForm.readyReplicas}} / {{appInfoForm.replicas}}</span></td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('container.runCommand')}}</th>
              <td class="idatatd"><span v-html="commandListShow(appInfoForm.command)"></span></td>
            </tr>
            <tr class="even">
              <th class="idatath">{{$t('container.runParameter')}}</th>
              <td class="idatatd"><span v-html="argsListShow(appInfoForm.args)"></span></td>
            </tr>
            <tr class="odd">
              <th class="idatath">{{$t('lang.createTime')}}</th>
              <td class="idatatd">{{tzTimeFormatter(appInfoForm.creationTimestamp)}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </el-form>
  </div>
</template>
<script>
  export default {
    name: 'AppInfo',
    data () {
      return {
        appInfoForm: {
          name:'',
          status:'',
          address:'',
          replicas:'',
          readyReplicas:'',
          command:'',
          args:'',
          creationTimestamp:'',
          labels: {},
          ports: []
        },
        appName:this.$route.params.appName,
        nameSpace:this.$route.params.nameSpace,
        type:this.$route.params.type,
        rancherClusterId:this.$route.params.rancherClusterId,
        tzTimeFormatter:this.$tzTimeFormatter,
        loading:false
      };
    },
    mounted () {
      this.initContainerInstanceDetails();
    },
    methods: {
      async initContainerInstanceDetails() {
        let self = this;
        self.loading = true;
        try {
          let rcResponse = await this.$ajax({
            type: 'post',
            url: 'api/cetus/v1/app/get_app',
            data:JSON.stringify({
              app_name:self.appName,
              app_type:self.type,
              user_id:self.nameSpace,
              rancher_cluster_id:self.rancherClusterId
            })
          });
          self.appInfoForm.name = rcResponse.metadata.name;
          self.appInfoForm.readyReplicas = rcResponse.status.readyReplicas || 0;
          self.appInfoForm.status = this.$t('container.processing');
          let replicas = rcResponse.spec.replicas;
          if (rcResponse.kind == "StatefulSet") {
            if (replicas == 0) {
              self.appInfoForm.status = this.$t('container.closed');
            } else if (replicas!=0 && replicas == rcResponse.status.readyReplicas) {
              self.appInfoForm.status = this.$t('container.running');
            } else {
              self.appInfoForm.status = this.$t('container.processing');
            }
            if (rcResponse.status.hasOwnProperty("unavailableReplicas")) {
              self.appInfoForm.status =this.$t('container.processing');
            }
          } else {
            if (replicas == 0) {
              self.appInfoForm.status = this.$t('container.closed');
            } else if (replicas == rcResponse.status.readyReplicas) {
              self.appInfoForm.status = this.$t('container.running');
            } else {
              self.appInfoForm.status =this.$t('container.processing');
            }
            if (rcResponse.status.hasOwnProperty("unavailableReplicas")) {
              self.appInfoForm.status =this.$t('container.processing');
            }
          }
          self.appInfoForm.replicas = replicas;
          self.appInfoForm.creationTimestamp = rcResponse.metadata.creationTimestamp;
          self.appInfoForm.labels = rcResponse.metadata.labels;

          let containersTemp = rcResponse.spec.template.spec.containers;
          let commandTemp = '';
          let argsTemp = '';
          for (let i = 0; i < containersTemp.length; i++ ) {
            if (containersTemp[i].command != undefined) {
              commandTemp += containersTemp[i].name + ":[" + containersTemp[i].command + "]" + " <br/>";
            }
            if (containersTemp[i].args != undefined) {
              argsTemp += containersTemp[i].name + ":[" + containersTemp[i].args + "]" + " <br/>";
            }
          }
          self.appInfoForm.command = commandTemp;
          self.appInfoForm.args = argsTemp;
          self.loading = false;
        } catch (data) {
          self.loading = false;
        }
      },
      statusTagRender(value) {
        let tagType = "";
        if (value === this.$t('container.running')) {
          tagType = "success";
        } else if (value === this.$t('container.closed')) {
          tagType = "gray";
        } else if (value === this.$t('container.processing')) {
          tagType = "info";
        }
        return tagType;
      },
      commandListShow(value) {
        return value;
      },
      argsListShow(value) {
        return value;
      }
    }
  }
</script>
