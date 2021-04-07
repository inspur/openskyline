<template>
  <div>
    <el2-dialog :title="$t('container.selectVolumeList')" width="500px" 
      :visible.sync="dialogVisible" :append-to-body="true" :modal-append-to-body="false" :close-on-click-modal="false">
      <el-form class="margin-tb20 me-require-form" ref="createInstanceForm" :model="createInstanceForm" 
        :rules=rules label-width="100px" v-loading="loading">
        <el-form-item :label="$t('container.containerVolume')" prop="volume_name" class="is-required">
          <el-select class="col-12" v-model="createInstanceForm.volume_name">
            <el-option v-for="item in volumeList" :key="item.volume_name" :label="item.volume_name" :value="item.volume_name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('container.attachPath')" prop="mount_path" class="is-required">
          <el-input class="col-12" v-model="createInstanceForm.mount_path" auto-complete="off"></el-input>
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
        <el-button @click="cancel">{{$t('base.cancel')}}</el-button>
        <el-button type="primary" @click="confirmFun" :disabled="loading">{{$t('container.attach')}}</el-button>
      </div>
    </el2-dialog>
  </div>
</template>
<script>
import uuid from 'uuid';
export default {
  name: 'SelectVolume',
  props: ['selVolumeEntity'],
  data() {
    return {
      roleType: Vue.roleType + '',
      dialogVisible: false,
      createInstanceForm: {
        volume_name: "",
        mount_path: ""
      },
      loading: false,
      volumeList: [],
      rules: {
        volume_name: [
          {type: 'required', trigger: 'blur change'}
        ],
        mount_path: [
          {type: 'required', trigger: 'blur change'},
          {type: 'maxSize', value: 50},
          {type: 'linuxpath'}
        ]
      }
    };
  },
  watch: {
  },
  mounted() {
  },
  methods: {
    show() {
      this.dialogVisible = true;
      this.createInstanceForm.volume_name = "";
      this.createInstanceForm.mount_path = "";
      this.getData();
    },
    async getData() {
      let self = this;
      this.volumeList = [];
      let data = {
        rancher_cluster_id: self.selVolumeEntity.rancher_cluster_id,
        user_id: self.selVolumeEntity.namespace
      };
      let ret = this.$ajax({
        type: 'post',
        url: "api/cetus/v1/storage/list_volumes_by_user",
        data: JSON.stringify(data),
        showErrMsg: false,
        successFun:(response) => {
          let volumes = response.volumes;
          for (let i = 0; i<volumes.length; i++) {
            if (volumes[i]["volume_status"] == "Bound" && volumes[i]["mount_status"] == "unmounted") {
              this.volumeList.push(volumes[i]);
             }
          }
        }
      });
    },
    confirmFun() {
      let self = this;
      this.$refs.createInstanceForm.validate((valid) => {
        if (valid) {
          let path = this.$strDuplicateRemoval(this.createInstanceForm.mount_path);
          if (path !== "/" && path.indexOf("//")==-1) {
            let attachParams = {
              "app_name": self.selVolumeEntity.name,
              "app_type": self.selVolumeEntity.type,
              "rancher_cluster_id": self.selVolumeEntity.rancher_cluster_id,
              "user_id":  self.selVolumeEntity.namespace,
              "volume_name": self.createInstanceForm.volume_name,
              "mount_path": self.createInstanceForm.mount_path
            };
            self.loading = true;
            let traceId = 'req-'+uuid.v1();
            let reponse = this.$ajax({
              type: 'post',
              url: "api/cetus/v1/storage/attach_volume",
              data: JSON.stringify(attachParams),
              headers: {
                'X-Openstack-Request-Id': traceId
              },
              // successMsg:this.$t('container.attachSuccessMsg'),
              successFun:(response) => {
                self.loading = false;
                if (response.result == "success") {
                  self.$recordLog({
                    target: Vue.logTarget.applicationManage,
                    level: {
                      en: "info",
                      zh_cn: "信息"
                    },
                    description: {
                      en: "Mount container volume:" + self.createInstanceForm.volume_name + " to container application:" + self.selVolumeEntity.name,
                      zh_cn: "挂载容器卷:" + self.createInstanceForm.volume_name + " 到容器应用:" + self.selVolumeEntity.name
                    },
                    trace_id: traceId
                  });
                  self.$notify({
                    message: self.$t('container.attachSuccessMsg'),
                    type: "success"
                  });
                  self.$emit("handleVolumeShow", {});
                  self.$emit("refreshData");
                } else {
                  self.$recordLog({
                    target: Vue.logTarget.applicationManage,
                    level: {
                      en:"error",
                      zh_cn:"错误"
                    },
                    description: {
                      en: "Mount container volume:" + self.createInstanceForm.volume_name + " to container application:" + self.selVolumeEntity.name+ response.result,
                      zh_cn: "挂载容器卷:" + self.createInstanceForm.volume_name + " 到容器应用:" + self.selVolumeEntity.name+"错误："+ response.result
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
                self.loading = false;
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
    },
    cancel() {
      this.dialogVisible = false;
      this.$emit("cancel");
    }
  }
}
</script>
<style>
</style>
