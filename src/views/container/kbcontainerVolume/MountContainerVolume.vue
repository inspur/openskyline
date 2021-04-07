<template>
  <el-dialog :title="$t('container.attachToContainerApp')" :visible.sync="dialogVisible" :before-close="handleClose">
    <el-form ref="mountvolumeForm" :model="mountvolumeForm" :rules=rules label-width="100px" class="me-required-form" v-loading="saving" style="margin-top:5px;">
      <el-form-item :label="$t('container.containerApp')" prop="rc_name" class="is-required">
        <el-select class="col-12" v-model="mountvolumeForm.rc_name" filterable @change="rcListChange">
          <el-option v-for="item in rcList" :key="item.id" :label="item.name" :value="item.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('container.attachPath')" prop="mountPath" class="is-required">
        <el-input class="col-12" v-model="mountvolumeForm.mountPath"></el-input>
        <el-tooltip placement="right-start">
          <div slot="content">{{$t('container.attachPathTip1')}}</div>
          <div slot="content">{{$t('container.attachPathTip2')}}</div>
          <div slot="content">mysql:/var/lib/mysql</div>
          <div slot="content">tomcat:/tomcat/webapps</div>
          <div slot="content">{{$t('container.attachPathTip3')}}</div>
          <div slot="content">{{$t('container.attachPathTip4')}}</div>
          <div slot="content">{{$t('container.attachPathTip5')}}</div>
          <i class="el-icon-fa-question-circle"></i>
        </el-tooltip>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{$t('lang.cancel')}}</el-button>
      <el-button @click="mountVolume" type="primary" :loading="saving">{{$t('lang.confirm')}}</el-button>
    </div>
  </el-dialog>
</template>
<script>
import uuid from 'uuid';
export default {
  name: "MountContainerVolume",
  props:["selectedRowData"],
  data() {
    return {
      mountvolumeForm: {
        k8sClusterId:this.selectedRowData.clusterId,
        rancher_cluster_id:this.selectedRowData.rancher_cluster_id,
        rc_name:"",
        rc_type:"",
        mountPath:""
      },
      roleType: Vue.roleType,
      rcDetail:{},
      dialogVisible: true,
      saving:false,
      rcList:[],
      tempRcList: [],
      rules: {
        rc_name: [
          {type: 'required'}
        ],
        mountPath: [
          {type: 'required', trigger: 'blur change'},
          {type: 'maxSize', value: 50},
          {type: 'linuxpath'}
        ]
      }
    }
  },
  mounted() {
    this.getContainerApplicationList();
  },
  methods: {
    async getContainerApplicationList() {
      let self = this;
      let queryObj = {};
      queryObj["user_id"] = self.selectedRowData.namespace;
      queryObj["rancher_cluster_id"] = this.mountvolumeForm.rancher_cluster_id;
      try {
        let rcList = await this.$ajax({
          type:'post',
          url:"api/cetus/v1/app/get_apps_by_user",
          data:JSON.stringify(queryObj)
        });
        let tableList = [];
        if (rcList.hasOwnProperty('deployment')) {
          let resList = rcList["deployment"];
          for (let i=0; i<resList.length; i++) {
            let appObj = resList[i];
            let tableObject = {
              "name": "",
              "type": "",
              "uuid": ""
            };
            tableObject.name = appObj["metadata"]["name"];
            tableObject.uuid = appObj["metadata"]["uid"];
            tableObject.type = "deployment";
            let replicas = appObj.spec.replicas;
            let readyReplicas = appObj.status.readyReplicas;
            let status = "";
            if (replicas == readyReplicas) {
              tableList.push(tableObject);
            }
          }
        }
        if (rcList.hasOwnProperty('statefulset')) {
          let resList = rcList["statefulset"];
          for (let i=0; i<resList.length; i++) {
            let appObj = resList[i];
            let tableObject = {
              "name":"",
              "type":"",
              "uuid":""
            };
            tableObject.name = appObj["metadata"]["name"];
            tableObject.uuid = appObj["metadata"]["uid"];
            tableObject.type = "statefulset";
            let replicas = appObj.status.replicas;
            let readyReplicas = appObj.status.readyReplicas;
             if (replicas == readyReplicas) {
              tableList.push(tableObject);
            }
          }
          self.getSaclingList();
        }
        self.tempRcList = tableList;
      } catch (data) {
      }
    },
    rcListChange(val) {
      for (let i=0; i<this.rcList.length; i++) {
        if (val == this.rcList[i]["name"]) {
          this.mountvolumeForm.rc_type = this.rcList[i]["type"];
          break;
        }
      }
    },
    async getSaclingList() {
      let self = this;
      let result = await self.$ajax({
        type: 'post',
        url: "api/cetus/v1/hpa/list_hpa",
        data:JSON.stringify({
          "rancher_cluster_id": self.mountvolumeForm.rancher_cluster_id,
          "user_id":  self.selectedRowData.namespace
        }),
        successFun:(response) => {
          let result = response["result"];
          for (let j=0; j<self.tempRcList.length; j++) {
            let appdata = self.tempRcList[j];
            let flg = true;
            if (appdata.type == "deployment") {
              for (let i=0; i<result.length; i++) {
                let scaling = result[i];
                if (appdata.name == scaling.metadata.name) {
                  flg = false;
                  break;
                }
              }
              if (flg) {
                self.rcList.push(appdata);
              }
            } else {
              self.rcList.push(appdata);
            }
          }
        },
        errorFun:(response) => {
        }
      });
    },
    handleClose(done) {
      this.$emit("handleAddShow", {});
    },
    cancel() {
      let self = this;
      self.dialogVisible = false;
      this.$emit("handleAddShow", {});
    },
    mountVolume() {
      let self = this;
      this.$refs.mountvolumeForm.validate((valid) => {
        if (valid) {
          let path = this.$strDuplicateRemoval(this.mountvolumeForm.mountPath);
          if (path !== "/" && path.indexOf("//")==-1) {
            let attachParams = {
              "app_name": self.mountvolumeForm.rc_name,
              "app_type": self.mountvolumeForm.rc_type,
              "rancher_cluster_id": self.mountvolumeForm.rancher_cluster_id,
              "user_id":  self.selectedRowData.namespace,
              "volume_name": self.selectedRowData.name,
              "mount_path": self.mountvolumeForm.mountPath
            };
            self.saving = true;
            let traceId = 'req-'+uuid.v1();
            let reponse = this.$ajax({
              type: 'post',
              url: "api/cetus/v1/storage/attach_volume",
              data: JSON.stringify(attachParams),
              headers: {
                'X-Openstack-Request-Id': traceId
              },
              successFun:(response) => {
                self.saving = false;
                if (response.result == "success") {
                  self.$recordLog({
                    target: Vue.logTarget.containerVolume,
                    level: {
                      en: "info",
                      zh_cn: "信息"
                    },
                    description: {
                      en: "Mount container volume:" + self.selectedRowData.name + " to container application:" + self.mountvolumeForm.rc_name,
                      zh_cn: "挂载容器卷:" + self.selectedRowData.name + " 到容器应用:" + self.mountvolumeForm.rc_name
                    },
                    trace_id: traceId
                  });
                  self.$notify({
                    message: self.$t('container.attachSuccessMsg'),
                    type: "success"
                  });
                  self.$emit("handleAddShow", {});
                  self.$emit("refreshData");
                } else {
                  self.$recordLog({
                    target: Vue.logTarget.containerVolume,
                    level: {
                      en:"error",
                      zh_cn:"错误"
                    },
                    description: {
                      en: response.result,
                      zh_cn: "挂载容器卷:" + self.selectedRowData.name + " 到容器应用:" + self.mountvolumeForm.rc_name+ "错误：" +response.result
                    },
                    trace_id: traceId
                  });
                  self.$notify({
                    message: response.result,
                    type: "error"
                  });
                }
              },
              error:() => {
                self.saving = false;
              }
            });
          } else {
            this.$message.error(this.$t('container.attachPathTip1'));
            return false;
          }
        } else {
          return false;
        }
      });
    }
  }
  }
</script>
